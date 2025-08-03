// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/ILendLinkCore.sol";
import "./interfaces/IPythPriceOracle.sol";
import "./interfaces/ILSTToken.sol";

/**
 * @title LendLinkCore
 * @dev Core lending protocol for LST collateral and stablecoin borrowing
 * Now integrated with Pyth Network for real-time price feeds
 */
contract LendLinkCore is ILendLinkCore, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // ============ Constants ============
    uint256 private constant PRECISION = 1e18;
    uint256 private constant HEALTH_FACTOR_THRESHOLD = 1e18;
    uint256 private constant LIQUIDATION_BONUS = 0.05e18; // 5% bonus for liquidators
    uint256 private constant MAX_LTV = 0.9e18; // 90% max LTV
    uint256 private constant MIN_LIQUIDATION_THRESHOLD = 0.8e18; // 80% min liquidation threshold

    // ============ State Variables ============
    IPythPriceOracle public immutable pythPriceOracle;
    
    // Token to Pyth price feed ID mapping
    mapping(address => bytes32) public tokenPriceFeedIds;
    
    // User positions mapping
    mapping(address => UserPosition) public userPositions;
    mapping(address => mapping(address => uint256)) public userCollateral; // user => token => amount
    mapping(address => mapping(address => uint256)) public userBorrows; // user => token => amount
    
    // Supported tokens
    mapping(address => bool) public supportedCollateral;
    mapping(address => bool) public supportedBorrowTokens;
    mapping(address => CollateralConfig) public collateralConfigs;
    mapping(address => BorrowConfig) public borrowConfigs;
    
    // Protocol state
    uint256 public totalTVL;
    uint256 public totalDebt;
    uint256 public protocolFeeRate = 0.001e18; // 0.1% protocol fee

    // ============ Structs ============
    struct CollateralConfig {
        bool isActive;
        uint256 ltv; // Loan-to-value ratio (scaled by 1e18)
        uint256 liquidationThreshold;
        bool isLST; // Is Liquid Staking Token
        uint256 rewardRate; // Annual reward rate for LSTs
        uint256 lastRewardUpdate;
    }

    struct BorrowConfig {
        bool isActive;
        uint256 interestRate; // Annual interest rate (scaled by 1e18)
        uint256 lastInterestUpdate;
    }

    // ============ Events ============
    event CollateralConfigUpdated(address indexed token, bool isActive, uint256 ltv, uint256 liquidationThreshold);
    event BorrowConfigUpdated(address indexed token, bool isActive, uint256 interestRate);
    event ProtocolFeeUpdated(uint256 newFeeRate);
    event PriceFeedIdSet(address indexed token, bytes32 indexed priceFeedId);

    // ============ Constructor ============
    constructor(address _pythPriceOracle) {
        require(_pythPriceOracle != address(0), "Invalid price oracle");
        pythPriceOracle = IPythPriceOracle(_pythPriceOracle);
    }

    // ============ Modifiers ============
    modifier onlySupportedCollateral(address token) {
        require(supportedCollateral[token], "Token not supported as collateral");
        require(collateralConfigs[token].isActive, "Collateral token not active");
        _;
    }

    modifier onlySupportedBorrowToken(address token) {
        require(supportedBorrowTokens[token], "Token not supported for borrowing");
        require(borrowConfigs[token].isActive, "Borrow token not active");
        _;
    }

    modifier onlyActiveUser(address user) {
        require(userPositions[user].isActive, "User has no active position");
        _;
    }

    // ============ Core Functions ============

    /**
     * @dev Deposit collateral tokens
     * @param collateralToken Address of the collateral token
     * @param amount Amount to deposit
     */
    function depositCollateral(address collateralToken, uint256 amount) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlySupportedCollateral(collateralToken) 
    {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user collateral
        userCollateral[msg.sender][collateralToken] = userCollateral[msg.sender][collateralToken].add(amount);
        
        // Update user position
        _updateUserPosition(msg.sender);
        
        // Update protocol TVL
        uint256 collateralValue = _getTokenValue(collateralToken, amount);
        totalTVL = totalTVL.add(collateralValue);
        
        emit CollateralDeposited(msg.sender, collateralToken, amount, collateralValue);
    }

    /**
     * @dev Withdraw collateral tokens
     * @param collateralToken Address of the collateral token
     * @param amount Amount to withdraw
     */
    function withdrawCollateral(address collateralToken, uint256 amount) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlySupportedCollateral(collateralToken) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(userCollateral[msg.sender][collateralToken] >= amount, "Insufficient collateral");
        
        // Check health factor after withdrawal
        uint256 newCollateralValue = _getTokenValue(collateralToken, userCollateral[msg.sender][collateralToken].sub(amount));
        uint256 totalBorrowValue = _getUserTotalBorrowValue(msg.sender);
        
        require(
            newCollateralValue.mul(collateralConfigs[collateralToken].liquidationThreshold).div(PRECISION) >= totalBorrowValue,
            "Withdrawal would make position unsafe"
        );
        
        // Update user collateral
        userCollateral[msg.sender][collateralToken] = userCollateral[msg.sender][collateralToken].sub(amount);
        
        // Update user position
        _updateUserPosition(msg.sender);
        
        // Update protocol TVL
        uint256 collateralValue = _getTokenValue(collateralToken, amount);
        totalTVL = totalTVL.sub(collateralValue);
        
        // Transfer tokens to user
        IERC20(collateralToken).safeTransfer(msg.sender, amount);
        
        emit CollateralWithdrawn(msg.sender, collateralToken, amount, collateralValue);
    }

    /**
     * @dev Borrow assets against collateral
     * @param borrowToken Address of the token to borrow
     * @param amount Amount to borrow
     */
    function borrow(address borrowToken, uint256 amount) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlySupportedBorrowToken(borrowToken) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(_getUserTotalCollateralValue(msg.sender) > 0, "No collateral deposited");
        
        // Check if user has sufficient borrowing power
        uint256 availableBorrow = getAvailableBorrowAmount(msg.sender, borrowToken);
        require(availableBorrow >= amount, "Insufficient borrowing power");
        
        // Update user borrows
        userBorrows[msg.sender][borrowToken] = userBorrows[msg.sender][borrowToken].add(amount);
        
        // Update user position
        _updateUserPosition(msg.sender);
        
        // Update protocol debt
        uint256 borrowValue = _getTokenValue(borrowToken, amount);
        totalDebt = totalDebt.add(borrowValue);
        
        // Transfer tokens to user
        IERC20(borrowToken).safeTransfer(msg.sender, amount);
        
        emit AssetBorrowed(msg.sender, borrowToken, amount, borrowValue);
    }

    /**
     * @dev Repay borrowed assets
     * @param borrowToken Address of the token to repay
     * @param amount Amount to repay
     */
    function repay(address borrowToken, uint256 amount) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlySupportedBorrowToken(borrowToken) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(userBorrows[msg.sender][borrowToken] >= amount, "Insufficient debt to repay");
        
        // Transfer tokens from user to contract
        IERC20(borrowToken).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user borrows
        userBorrows[msg.sender][borrowToken] = userBorrows[msg.sender][borrowToken].sub(amount);
        
        // Update user position
        _updateUserPosition(msg.sender);
        
        // Update protocol debt
        uint256 borrowValue = _getTokenValue(borrowToken, amount);
        totalDebt = totalDebt.sub(borrowValue);
        
        emit AssetRepaid(msg.sender, borrowToken, amount, borrowValue);
    }

    /**
     * @dev Execute liquidation of unhealthy position
     * @param user Address of user to liquidate
     * @param collateralToken Collateral token to liquidate
     * @param debtToken Debt token to repay
     * @param collateralAmount Amount of collateral to liquidate
     */
    function liquidate(
        address user,
        address collateralToken,
        address debtToken,
        uint256 collateralAmount
    ) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlySupportedCollateral(collateralToken) 
        onlySupportedBorrowToken(debtToken) 
    {
        require(canLiquidate(user), "Position cannot be liquidated");
        require(userCollateral[user][collateralToken] >= collateralAmount, "Insufficient collateral to liquidate");
        require(userBorrows[user][debtToken] > 0, "No debt to liquidate");
        
        // Calculate liquidation amount
        uint256 collateralValue = _getTokenValue(collateralToken, collateralAmount);
        uint256 debtAmount = collateralValue.mul(PRECISION.add(LIQUIDATION_BONUS)).div(PRECISION);
        
        // Ensure liquidator has enough debt tokens
        require(IERC20(debtToken).balanceOf(msg.sender) >= debtAmount, "Insufficient debt tokens for liquidation");
        
        // Transfer debt tokens from liquidator to contract
        IERC20(debtToken).safeTransferFrom(msg.sender, address(this), debtAmount);
        
        // Update user borrows
        userBorrows[user][debtToken] = userBorrows[user][debtToken].sub(debtAmount);
        
        // Update user collateral
        userCollateral[user][collateralToken] = userCollateral[user][collateralToken].sub(collateralAmount);
        
        // Transfer collateral to liquidator
        IERC20(collateralToken).safeTransfer(msg.sender, collateralAmount);
        
        // Update user position
        _updateUserPosition(user);
        
        // Update protocol state
        totalDebt = totalDebt.sub(_getTokenValue(debtToken, debtAmount));
        totalTVL = totalTVL.sub(collateralValue);
        
        emit LiquidationExecuted(msg.sender, user, collateralToken, collateralAmount, debtAmount);
    }

    /**
     * @dev Execute auto-repay using LST rewards
     * @param user Address of user to auto-repay for
     */
    function executeAutoRepay(address user) 
        external 
        override 
        nonReentrant 
        whenNotPaused 
        onlyActiveUser(user) 
    {
        uint256 totalRewardAmount = 0;
        uint256 totalDebtReduction = 0;
        
        // Calculate rewards for each LST collateral
        for (uint256 i = 0; i < _getUserCollateralCount(user); i++) {
            address collateralToken = _getUserCollateralToken(user, i);
            if (collateralConfigs[collateralToken].isLST) {
                uint256 rewardAmount = _calculateLSTRewards(user, collateralToken);
                if (rewardAmount > 0) {
                    totalRewardAmount = totalRewardAmount.add(rewardAmount);
                    
                    // Use rewards to repay debt
                    uint256 debtReduction = _applyRewardsToDebt(user, rewardAmount);
                    totalDebtReduction = totalDebtReduction.add(debtReduction);
                }
            }
        }
        
        if (totalRewardAmount > 0) {
            _updateUserPosition(user);
            emit AutoRepayExecuted(user, totalRewardAmount, totalDebtReduction);
        }
    }

    /**
     * @dev Execute auto-repay for all active users (batch operation)
     * This function can be called by anyone to trigger auto-repay for all users
     * Note: This is a simplified implementation. In production, you would need to track all active users
     */
    function accrueAll() 
        external 
        nonReentrant 
        whenNotPaused 
    {
        uint256 totalUsersProcessed = 0;
        uint256 totalRewardsAccrued = 0;
        uint256 totalDebtReduction = 0;
        
        // Note: This is a simplified implementation
        // In a production environment, you would need to:
        // 1. Track all active users in a separate array/mapping
        // 2. Iterate through all active users
        // 3. Execute auto-repay for each user
        
        // For now, we'll emit an event with placeholder values
        // The actual implementation would require additional state management
        
        emit BatchAutoRepayExecuted(totalUsersProcessed, totalRewardsAccrued, totalDebtReduction);
    }

    // ============ View Functions ============

    /**
     * @dev Get user position information
     */
    function getUserPosition(address user) external view override returns (UserPosition memory) {
        return userPositions[user];
    }

    /**
     * @dev Get user's collateral information
     */
    function getUserCollaterals(address user) external view override returns (CollateralInfo[] memory) {
        uint256 collateralCount = _getUserCollateralCount(user);
        CollateralInfo[] memory collaterals = new CollateralInfo[](collateralCount);
        
        for (uint256 i = 0; i < collateralCount; i++) {
            address token = _getUserCollateralToken(user, i);
            uint256 amount = userCollateral[user][token];
            collaterals[i] = CollateralInfo({
                token: token,
                amount: amount,
                value: _getTokenValue(token, amount),
                ltv: collateralConfigs[token].ltv,
                liquidationThreshold: collateralConfigs[token].liquidationThreshold,
                isActive: collateralConfigs[token].isActive
            });
        }
        
        return collaterals;
    }

    /**
     * @dev Get user's borrow information
     */
    function getUserBorrows(address user) external view override returns (BorrowInfo[] memory) {
        uint256 borrowCount = _getUserBorrowCount(user);
        BorrowInfo[] memory borrows = new BorrowInfo[](borrowCount);
        
        for (uint256 i = 0; i < borrowCount; i++) {
            address token = _getUserBorrowToken(user, i);
            uint256 amount = userBorrows[user][token];
            borrows[i] = BorrowInfo({
                token: token,
                amount: amount,
                value: _getTokenValue(token, amount),
                interestRate: borrowConfigs[token].interestRate,
                lastUpdateTime: borrowConfigs[token].lastInterestUpdate,
                isActive: borrowConfigs[token].isActive
            });
        }
        
        return borrows;
    }

    /**
     * @dev Get health factor for a user
     */
    function getHealthFactor(address user) external view override returns (uint256) {
        return _calculateHealthFactor(user);
    }

    /**
     * @dev Check if user position can be liquidated
     */
    function canLiquidate(address user) public view override returns (bool) {
        return _calculateHealthFactor(user) < HEALTH_FACTOR_THRESHOLD;
    }

    /**
     * @dev Get available borrow amount for a user
     */
    function getAvailableBorrowAmount(address user, address borrowToken) 
        public 
        view 
        override 
        returns (uint256) 
    {
        uint256 totalCollateralValue = _getUserTotalCollateralValue(user);
        uint256 totalBorrowValue = _getUserTotalBorrowValue(user);
        
        if (totalCollateralValue == 0) return 0;
        
        uint256 maxBorrowValue = totalCollateralValue.mul(MAX_LTV).div(PRECISION);
        uint256 availableBorrowValue = maxBorrowValue > totalBorrowValue ? 
            maxBorrowValue.sub(totalBorrowValue) : 0;
        
        return _getTokenAmount(borrowToken, availableBorrowValue);
    }

    /**
     * @dev Get interest rate for a token
     */
    function getInterestRate(address token) external view override returns (uint256) {
        return borrowConfigs[token].interestRate;
    }

    /**
     * @dev Get LTV for a collateral token
     */
    function getLTV(address collateral) external view override returns (uint256) {
        return collateralConfigs[collateral].ltv;
    }

    /**
     * @dev Get liquidation threshold for a collateral token
     */
    function getLiquidationThreshold(address collateral) external view override returns (uint256) {
        return collateralConfigs[collateral].liquidationThreshold;
    }

    /**
     * @dev Get total protocol TVL
     */
    function getTotalTVL() external view override returns (uint256) {
        return totalTVL;
    }

    /**
     * @dev Get total protocol debt
     */
    function getTotalDebt() external view override returns (uint256) {
        return totalDebt;
    }

    /**
     * @dev Get Pyth price feed ID for a token
     */
    function getTokenPriceFeedId(address token) external view returns (bytes32) {
        return tokenPriceFeedIds[token];
    }

    // ============ Admin Functions ============

    /**
     * @dev Set supported collateral token
     */
    function setSupportedCollateral(
        address token,
        bool isActive,
        uint256 ltv,
        uint256 liquidationThreshold,
        bool isLST,
        uint256 rewardRate
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(ltv <= MAX_LTV, "LTV too high");
        require(liquidationThreshold >= MIN_LIQUIDATION_THRESHOLD, "Liquidation threshold too low");
        
        supportedCollateral[token] = isActive;
        collateralConfigs[token] = CollateralConfig({
            isActive: isActive,
            ltv: ltv,
            liquidationThreshold: liquidationThreshold,
            isLST: isLST,
            rewardRate: rewardRate,
            lastRewardUpdate: block.timestamp
        });
        
        emit CollateralConfigUpdated(token, isActive, ltv, liquidationThreshold);
    }

    /**
     * @dev Set supported borrow token
     */
    function setSupportedBorrowToken(
        address token,
        bool isActive,
        uint256 interestRate
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        
        supportedBorrowTokens[token] = isActive;
        borrowConfigs[token] = BorrowConfig({
            isActive: isActive,
            interestRate: interestRate,
            lastInterestUpdate: block.timestamp
        });
        
        emit BorrowConfigUpdated(token, isActive, interestRate);
    }

    /**
     * @dev Set Pyth price feed ID for a token
     */
    function setTokenPriceFeedId(address token, bytes32 priceFeedId) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(priceFeedId != bytes32(0), "Invalid price feed ID");
        
        tokenPriceFeedIds[token] = priceFeedId;
        emit PriceFeedIdSet(token, priceFeedId);
    }

    /**
     * @dev Update protocol fee rate
     */
    function setProtocolFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 0.01e18, "Fee rate too high"); // Max 1%
        protocolFeeRate = newFeeRate;
        emit ProtocolFeeUpdated(newFeeRate);
    }

    /**
     * @dev Pause protocol
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause protocol
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Internal Functions ============

    /**
     * @dev Update user position
     */
    function _updateUserPosition(address user) internal {
        uint256 totalCollateralValue = _getUserTotalCollateralValue(user);
        uint256 totalBorrowValue = _getUserTotalBorrowValue(user);
        
        userPositions[user] = UserPosition({
            totalCollateralValue: totalCollateralValue,
            totalBorrowValue: totalBorrowValue,
            healthFactor: _calculateHealthFactor(user),
            lastUpdateTime: block.timestamp,
            isActive: totalCollateralValue > 0 || totalBorrowValue > 0
        });
    }

    /**
     * @dev Calculate health factor
     */
    function _calculateHealthFactor(address user) internal view returns (uint256) {
        uint256 totalCollateralValue = _getUserTotalCollateralValue(user);
        uint256 totalBorrowValue = _getUserTotalBorrowValue(user);
        
        if (totalBorrowValue == 0) return type(uint256).max;
        
        return totalCollateralValue.mul(PRECISION).div(totalBorrowValue);
    }

    /**
     * @dev Get user total collateral value
     */
    function _getUserTotalCollateralValue(address user) internal view returns (uint256) {
        uint256 totalValue = 0;
        uint256 collateralCount = _getUserCollateralCount(user);
        
        for (uint256 i = 0; i < collateralCount; i++) {
            address token = _getUserCollateralToken(user, i);
            uint256 amount = userCollateral[user][token];
            totalValue = totalValue.add(_getTokenValue(token, amount));
        }
        
        return totalValue;
    }

    /**
     * @dev Get user total borrow value
     */
    function _getUserTotalBorrowValue(address user) internal view returns (uint256) {
        uint256 totalValue = 0;
        uint256 borrowCount = _getUserBorrowCount(user);
        
        for (uint256 i = 0; i < borrowCount; i++) {
            address token = _getUserBorrowToken(user, i);
            uint256 amount = userBorrows[user][token];
            totalValue = totalValue.add(_getTokenValue(token, amount));
        }
        
        return totalValue;
    }

    /**
     * @dev Get token value in USD using Pyth price feeds
     */
    function _getTokenValue(address token, uint256 amount) internal view returns (uint256) {
        bytes32 priceFeedId = tokenPriceFeedIds[token];
        require(priceFeedId != bytes32(0), "Token price feed not configured");
        
        (uint256 price, ) = pythPriceOracle.getPrice(priceFeedId);
        return amount.mul(price).div(PRECISION);
    }

    /**
     * @dev Get token amount from USD value using Pyth price feeds
     */
    function _getTokenAmount(address token, uint256 value) internal view returns (uint256) {
        bytes32 priceFeedId = tokenPriceFeedIds[token];
        require(priceFeedId != bytes32(0), "Token price feed not configured");
        
        (uint256 price, ) = pythPriceOracle.getPrice(priceFeedId);
        return value.mul(PRECISION).div(price);
    }

    /**
     * @dev Calculate LST rewards for a user
     */
    function _calculateLSTRewards(address user, address collateralToken) internal view returns (uint256) {
        CollateralConfig memory config = collateralConfigs[collateralToken];
        if (!config.isLST) return 0;
        
        uint256 collateralAmount = userCollateral[user][collateralToken];
        if (collateralAmount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp.sub(config.lastRewardUpdate);
        return collateralAmount.mul(config.rewardRate).mul(timeElapsed).div(365 days).div(PRECISION);
    }

    /**
     * @dev Apply rewards to debt reduction
     */
    function _applyRewardsToDebt(address user, uint256 rewardAmount) internal returns (uint256) {
        uint256 totalDebtReduction = 0;
        uint256 borrowCount = _getUserBorrowCount(user);
        
        for (uint256 i = 0; i < borrowCount && rewardAmount > 0; i++) {
            address token = _getUserBorrowToken(user, i);
            uint256 debtAmount = userBorrows[user][token];
            
            if (debtAmount > 0) {
                uint256 debtValue = _getTokenValue(token, debtAmount);
                uint256 reductionValue = rewardAmount > debtValue ? debtValue : rewardAmount;
                uint256 reductionAmount = _getTokenAmount(token, reductionValue);
                
                userBorrows[user][token] = userBorrows[user][token].sub(reductionAmount);
                totalDebtReduction = totalDebtReduction.add(reductionValue);
                rewardAmount = rewardAmount.sub(reductionValue);
            }
        }
        
        return totalDebtReduction;
    }

    /**
     * @dev Get user collateral count (simplified - in real implementation, track this)
     */
    function _getUserCollateralCount(address user) internal view returns (uint256) {
        // Simplified implementation - in production, maintain a list
        uint256 count = 0;
        if (userCollateral[user][address(0)] > 0) count++; // Placeholder
        return count;
    }

    /**
     * @dev Get user collateral token (simplified)
     */
    function _getUserCollateralToken(address user, uint256 index) internal view returns (address) {
        // Simplified implementation - in production, maintain a list
        return address(0); // Placeholder
    }

    /**
     * @dev Get user borrow count (simplified)
     */
    function _getUserBorrowCount(address user) internal view returns (uint256) {
        // Simplified implementation - in production, maintain a list
        uint256 count = 0;
        if (userBorrows[user][address(0)] > 0) count++; // Placeholder
        return count;
    }

    /**
     * @dev Get user borrow token (simplified)
     */
    function _getUserBorrowToken(address user, uint256 index) internal view returns (address) {
        // Simplified implementation - in production, maintain a list
        return address(0); // Placeholder
    }
} 