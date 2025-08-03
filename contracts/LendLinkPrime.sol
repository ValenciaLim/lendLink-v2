// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IPythPriceOracle.sol";
import "./interfaces/I1inchRouter.sol";
import "./interfaces/IBridge.sol";

/**
 * @title LendLinkPrime
 * @dev Cross-chain lending protocol integrating Etherlink with 1inch Fusion+
 * Showcases Etherlink's role as cross-chain swap router and settlement layer
 */
contract LendLinkPrime is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // ============ Constants ============
    uint256 private constant PRECISION = 1e18;
    uint256 private constant HEALTH_FACTOR_THRESHOLD = 1e18;
    uint256 private constant MAX_LTV = 0.9e18; // 90% max LTV
    uint256 private constant MIN_LIQUIDATION_THRESHOLD = 0.8e18; // 80% min liquidation threshold
    uint256 private constant MAX_SLIPPAGE = 0.05e18; // 5% max slippage for swaps

    // Chain IDs
    uint256 public constant ETHEREUM_CHAIN_ID = 1;
    uint256 public constant ETHERLINK_CHAIN_ID = 128123;
    uint256 public constant POLYGON_CHAIN_ID = 137;

    // ============ State Variables ============
    IPythPriceOracle public immutable pythPriceOracle;
    I1inchRouter public immutable oneInchRouter;
    IBridge public immutable bridge;

    // Cross-chain loan tracking
    mapping(bytes32 => CrossChainLoan) public crossChainLoans;
    mapping(address => bytes32[]) public userLoans;
    mapping(address => mapping(uint256 => uint256)) public userChainBalances; // user => chainId => balance

    // Supported tokens per chain
    mapping(uint256 => mapping(address => bool)) public supportedTokens;
    mapping(uint256 => mapping(address => CollateralConfig)) public collateralConfigs;
    mapping(uint256 => mapping(address => BorrowConfig)) public borrowConfigs;

    // Protocol state
    uint256 public totalCrossChainTVL;
    uint256 public totalCrossChainDebt;
    uint256 public protocolFeeRate = 0.001e18; // 0.1% protocol fee

    // ============ Structs ============
    struct CrossChainLoan {
        address borrower;
        uint256 sourceChain;
        uint256 destinationChain;
        address collateralToken;
        address borrowToken;
        uint256 collateralAmount;
        uint256 borrowAmount;
        uint256 healthFactor;
        uint256 createdAt;
        uint256 lastUpdateTime;
        bool isActive;
        bytes32 bridgeId;
        bytes32 swapId;
        LoanStatus status;
    }

    struct CollateralConfig {
        bool isActive;
        uint256 ltv;
        uint256 liquidationThreshold;
        bool isLST;
        uint256 rewardRate;
        uint256 lastRewardUpdate;
    }

    struct BorrowConfig {
        bool isActive;
        uint256 interestRate;
        uint256 lastInterestUpdate;
    }

    enum LoanStatus {
        Pending,
        Bridging,
        Swapping,
        Active,
        Repaying,
        Completed,
        Liquidated,
        Failed
    }

    // ============ Events ============
    event CrossChainLoanInitiated(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 sourceChain,
        uint256 destinationChain,
        address collateralToken,
        address borrowToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    );

    event BridgeInitiated(
        bytes32 indexed loanId,
        bytes32 indexed bridgeId,
        uint256 sourceChain,
        uint256 destinationChain,
        address token,
        uint256 amount
    );

    event SwapExecuted(
        bytes32 indexed loanId,
        bytes32 indexed swapId,
        address srcToken,
        address dstToken,
        uint256 srcAmount,
        uint256 dstAmount,
        uint256 slippage
    );

    event CrossChainLoanActivated(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 healthFactor
    );

    event CrossChainRepaymentInitiated(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 repayAmount
    );

    event CrossChainLoanCompleted(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 totalRepaid
    );

    event LiquidationExecuted(
        bytes32 indexed loanId,
        address indexed liquidator,
        uint256 collateralAmount,
        uint256 debtAmount
    );

    // ============ Constructor ============
    constructor(
        address _pythPriceOracle,
        address _oneInchRouter,
        address _bridge
    ) {
        require(_pythPriceOracle != address(0), "Invalid price oracle");
        require(_oneInchRouter != address(0), "Invalid 1inch router");
        require(_bridge != address(0), "Invalid bridge");

        pythPriceOracle = IPythPriceOracle(_pythPriceOracle);
        oneInchRouter = I1inchRouter(_oneInchRouter);
        bridge = IBridge(_bridge);
    }

    // ============ Core Functions ============

    /**
     * @dev Initiate a cross-chain loan
     * @param sourceChain Source chain ID
     * @param destinationChain Destination chain ID
     * @param collateralToken Collateral token address
     * @param borrowToken Borrow token address
     * @param collateralAmount Amount of collateral to deposit
     * @param borrowAmount Amount to borrow
     */
    function initiateCrossChainLoan(
        uint256 sourceChain,
        uint256 destinationChain,
        address collateralToken,
        address borrowToken,
        uint256 collateralAmount,
        uint256 borrowAmount
    ) external nonReentrant whenNotPaused {
        require(sourceChain != destinationChain, "Same chain not allowed");
        require(bridge.isChainSupported(sourceChain), "Source chain not supported");
        require(bridge.isChainSupported(destinationChain), "Destination chain not supported");
        require(supportedTokens[sourceChain][collateralToken], "Collateral token not supported");
        require(supportedTokens[destinationChain][borrowToken], "Borrow token not supported");
        require(collateralAmount > 0, "Collateral amount must be greater than 0");
        require(borrowAmount > 0, "Borrow amount must be greater than 0");

        // Transfer collateral from user
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Generate unique loan ID
        bytes32 loanId = keccak256(abi.encodePacked(
            msg.sender,
            sourceChain,
            destinationChain,
            collateralToken,
            borrowToken,
            collateralAmount,
            borrowAmount,
            block.timestamp
        ));

        // Create cross-chain loan
        crossChainLoans[loanId] = CrossChainLoan({
            borrower: msg.sender,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            collateralToken: collateralToken,
            borrowToken: borrowToken,
            collateralAmount: collateralAmount,
            borrowAmount: borrowAmount,
            healthFactor: 0,
            createdAt: block.timestamp,
            lastUpdateTime: block.timestamp,
            isActive: false,
            bridgeId: bytes32(0),
            swapId: bytes32(0),
            status: LoanStatus.Pending
        });

        // Add to user loans
        userLoans[msg.sender].push(loanId);

        // Update protocol state
        totalCrossChainTVL = totalCrossChainTVL.add(_getTokenValue(collateralToken, collateralAmount));

        emit CrossChainLoanInitiated(
            loanId,
            msg.sender,
            sourceChain,
            destinationChain,
            collateralToken,
            borrowToken,
            collateralAmount,
            borrowAmount
        );

        // Start bridging process
        _initiateBridge(loanId);
    }

    /**
     * @dev Execute cross-chain swap through 1inch Fusion+
     * @param loanId Loan ID
     * @param srcToken Source token
     * @param dstToken Destination token
     * @param amount Amount to swap
     * @param minReturn Minimum return amount
     */
    function executeCrossChainSwap(
        bytes32 loanId,
        address srcToken,
        address dstToken,
        uint256 amount,
        uint256 minReturn
    ) external nonReentrant whenNotPaused {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Bridging, "Invalid loan status");

        // Check if pair is supported
        require(oneInchRouter.isPairSupported(srcToken, dstToken), "Pair not supported");

        // Get quote
        (uint256 expectedReturn, ) = oneInchRouter.getQuote(srcToken, dstToken, amount);
        require(expectedReturn >= minReturn, "Insufficient return amount");

        // Calculate slippage
        uint256 slippage = amount.sub(expectedReturn).mul(PRECISION).div(amount);
        require(slippage <= MAX_SLIPPAGE, "Slippage too high");

        // Execute swap
        bytes memory swapData = "";
        uint256 returnAmount = oneInchRouter.swap(
            srcToken,
            dstToken,
            amount,
            minReturn,
            payable(msg.sender),
            "",
            swapData
        );

        // Generate swap ID
        bytes32 swapId = keccak256(abi.encodePacked(loanId, srcToken, dstToken, amount, block.timestamp));
        loan.swapId = swapId;

        // Update loan status
        loan.status = LoanStatus.Swapping;

        emit SwapExecuted(loanId, swapId, srcToken, dstToken, amount, returnAmount, slippage);

        // Activate loan
        _activateLoan(loanId);
    }

    /**
     * @dev Repay cross-chain loan
     * @param loanId Loan ID
     * @param repayAmount Amount to repay
     */
    function repayCrossChainLoan(
        bytes32 loanId,
        uint256 repayAmount
    ) external nonReentrant whenNotPaused {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(repayAmount > 0, "Repay amount must be greater than 0");

        // Transfer repay amount from user
        IERC20(loan.borrowToken).safeTransferFrom(msg.sender, address(this), repayAmount);

        // Update loan
        loan.borrowAmount = loan.borrowAmount.sub(repayAmount);
        loan.lastUpdateTime = block.timestamp;

        // Update protocol state
        totalCrossChainDebt = totalCrossChainDebt.sub(_getTokenValue(loan.borrowToken, repayAmount));

        emit CrossChainRepaymentInitiated(loanId, msg.sender, repayAmount);

        // Check if loan is fully repaid
        if (loan.borrowAmount == 0) {
            _completeLoan(loanId);
        }
    }

    /**
     * @dev Liquidate unhealthy cross-chain loan
     * @param loanId Loan ID
     */
    function liquidateCrossChainLoan(bytes32 loanId) external nonReentrant whenNotPaused {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(_calculateHealthFactor(loanId) < HEALTH_FACTOR_THRESHOLD, "Loan not liquidatable");

        // Transfer collateral to liquidator
        IERC20(loan.collateralToken).safeTransfer(msg.sender, loan.collateralAmount);

        // Update loan status
        loan.status = LoanStatus.Liquidated;
        loan.isActive = false;

        // Update protocol state
        totalCrossChainTVL = totalCrossChainTVL.sub(_getTokenValue(loan.collateralToken, loan.collateralAmount));
        totalCrossChainDebt = totalCrossChainDebt.sub(_getTokenValue(loan.borrowToken, loan.borrowAmount));

        emit LiquidationExecuted(loanId, msg.sender, loan.collateralAmount, loan.borrowAmount);
    }

    // ============ View Functions ============

    /**
     * @dev Get cross-chain loan details
     * @param loanId Loan ID
     * @return loan Cross-chain loan details
     */
    function getCrossChainLoan(bytes32 loanId) external view returns (CrossChainLoan memory loan) {
        return crossChainLoans[loanId];
    }

    /**
     * @dev Get user's cross-chain loans
     * @param user User address
     * @return loanIds Array of loan IDs
     */
    function getUserLoans(address user) external view returns (bytes32[] memory loanIds) {
        return userLoans[user];
    }

    /**
     * @dev Get health factor for a loan
     * @param loanId Loan ID
     * @return healthFactor Health factor value
     */
    function getLoanHealthFactor(bytes32 loanId) external view returns (uint256 healthFactor) {
        return _calculateHealthFactor(loanId);
    }

    /**
     * @dev Check if loan can be liquidated
     * @param loanId Loan ID
     * @return liquidatable Whether loan can be liquidated
     */
    function canLiquidateLoan(bytes32 loanId) external view returns (bool liquidatable) {
        CrossChainLoan memory loan = crossChainLoans[loanId];
        return loan.status == LoanStatus.Active && _calculateHealthFactor(loanId) < HEALTH_FACTOR_THRESHOLD;
    }

    /**
     * @dev Get quote for cross-chain swap
     * @param srcToken Source token
     * @param dstToken Destination token
     * @param amount Amount to swap
     * @return returnAmount Expected return amount
     * @return gasEstimate Estimated gas cost
     */
    function getSwapQuote(
        address srcToken,
        address dstToken,
        uint256 amount
    ) external view returns (uint256 returnAmount, uint256 gasEstimate) {
        return oneInchRouter.getQuote(srcToken, dstToken, amount);
    }

    /**
     * @dev Get bridge fee
     * @param sourceChain Source chain ID
     * @param destinationChain Destination chain ID
     * @param token Token address
     * @param amount Amount to bridge
     * @return fee Bridge fee
     */
    function getBridgeFee(
        uint256 sourceChain,
        uint256 destinationChain,
        address token,
        uint256 amount
    ) external view returns (uint256 fee) {
        return bridge.getBridgeFee(sourceChain, destinationChain, token, amount);
    }

    // ============ Admin Functions ============

    /**
     * @dev Set supported token for a chain
     * @param chainId Chain ID
     * @param token Token address
     * @param isActive Whether token is active
     */
    function setSupportedToken(
        uint256 chainId,
        address token,
        bool isActive
    ) external onlyOwner {
        supportedTokens[chainId][token] = isActive;
    }

    /**
     * @dev Set collateral configuration
     * @param chainId Chain ID
     * @param token Token address
     * @param config Collateral configuration
     */
    function setCollateralConfig(
        uint256 chainId,
        address token,
        CollateralConfig memory config
    ) external onlyOwner {
        collateralConfigs[chainId][token] = config;
    }

    /**
     * @dev Set borrow configuration
     * @param chainId Chain ID
     * @param token Token address
     * @param config Borrow configuration
     */
    function setBorrowConfig(
        uint256 chainId,
        address token,
        BorrowConfig memory config
    ) external onlyOwner {
        borrowConfigs[chainId][token] = config;
    }

    /**
     * @dev Update protocol fee rate
     * @param newFeeRate New fee rate
     */
    function setProtocolFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 0.01e18, "Fee rate too high");
        protocolFeeRate = newFeeRate;
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
     * @dev Initiate bridge process
     * @param loanId Loan ID
     */
    function _initiateBridge(bytes32 loanId) internal {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        
        // Calculate bridge fee
        uint256 bridgeFee = bridge.getBridgeFee(
            loan.sourceChain,
            loan.destinationChain,
            loan.collateralToken,
            loan.collateralAmount
        );

        // Initiate bridge
        bytes32 bridgeId = bridge.bridgeTokens{value: bridgeFee}(
            loan.collateralToken,
            loan.collateralAmount,
            address(this),
            loan.destinationChain
        );

        loan.bridgeId = bridgeId;
        loan.status = LoanStatus.Bridging;

        emit BridgeInitiated(
            loanId,
            bridgeId,
            loan.sourceChain,
            loan.destinationChain,
            loan.collateralToken,
            loan.collateralAmount
        );
    }

    /**
     * @dev Activate loan after successful swap
     * @param loanId Loan ID
     */
    function _activateLoan(bytes32 loanId) internal {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        
        loan.status = LoanStatus.Active;
        loan.isActive = true;
        loan.healthFactor = _calculateHealthFactor(loanId);
        loan.lastUpdateTime = block.timestamp;

        // Update protocol state
        totalCrossChainDebt = totalCrossChainDebt.add(_getTokenValue(loan.borrowToken, loan.borrowAmount));

        emit CrossChainLoanActivated(loanId, loan.borrower, loan.healthFactor);
    }

    /**
     * @dev Complete loan after full repayment
     * @param loanId Loan ID
     */
    function _completeLoan(bytes32 loanId) internal {
        CrossChainLoan storage loan = crossChainLoans[loanId];
        
        loan.status = LoanStatus.Completed;
        loan.isActive = false;

        // Return collateral to borrower
        IERC20(loan.collateralToken).safeTransfer(loan.borrower, loan.collateralAmount);

        // Update protocol state
        totalCrossChainTVL = totalCrossChainTVL.sub(_getTokenValue(loan.collateralToken, loan.collateralAmount));

        emit CrossChainLoanCompleted(loanId, loan.borrower, loan.borrowAmount);
    }

    /**
     * @dev Calculate health factor for a loan
     * @param loanId Loan ID
     * @return healthFactor Health factor value
     */
    function _calculateHealthFactor(bytes32 loanId) internal view returns (uint256 healthFactor) {
        CrossChainLoan memory loan = crossChainLoans[loanId];
        
        if (loan.borrowAmount == 0) return type(uint256).max;
        
        uint256 collateralValue = _getTokenValue(loan.collateralToken, loan.collateralAmount);
        uint256 borrowValue = _getTokenValue(loan.borrowToken, loan.borrowAmount);
        
        return collateralValue.mul(PRECISION).div(borrowValue);
    }

    /**
     * @dev Get token value in USD using Pyth price feeds
     * @param token Token address
     * @param amount Token amount
     * @return value Value in USD
     */
    function _getTokenValue(address token, uint256 amount) internal view returns (uint256 value) {
        // This would use the configured price feed ID for the token
        // For now, we'll use a simplified approach
        bytes32 priceFeedId = keccak256(abi.encodePacked(token));
        (uint256 price, ) = pythPriceOracle.getPrice(priceFeedId);
        return amount.mul(price).div(PRECISION);
    }

    // ============ Receive Function ============
    receive() external payable {
        // Accept ETH for bridge fees
    }
} 