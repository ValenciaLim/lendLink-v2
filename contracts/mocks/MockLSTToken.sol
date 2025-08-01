// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/ILSTToken.sol";

/**
 * @title MockLSTToken
 * @dev Mock Liquid Staking Token for testing
 */
contract MockLSTToken is ERC20, ILSTToken, Ownable {
    using SafeMath for uint256;

    // ============ State Variables ============
    uint8 private _decimals;
    address public underlyingAsset;
    uint256 public exchangeRate = 1e18; // 1:1 exchange rate
    uint256 public totalUnderlying;
    uint256 public rewardRate = 0.05e18; // 5% annual reward rate
    uint256 public protocolFeeRate = 0.001e18; // 0.1% protocol fee
    uint256 public validatorCount = 100;
    uint256 public minStake = 0.1e18; // 0.1 ETH minimum
    uint256 public maxStake = 1000e18; // 1000 ETH maximum

    // User tracking
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public lastRewardUpdate;
    mapping(address => uint256) public userStakes;

    // ============ Events ============
    event RewardsClaimed(address indexed user, uint256 amount);
    event ExchangeRateUpdated(uint256 newRate);
    event RewardRateUpdated(uint256 newRate);

    // ============ Constructor ============
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable() {
        _decimals = 18;
        underlyingAsset = address(0); // ETH
    }

    // ============ Core Functions ============

    /**
     * @dev Get token decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Get the exchange rate between LST and underlying asset
     */
    function getExchangeRate() external view override returns (uint256) {
        return exchangeRate;
    }

    /**
     * @dev Get the total underlying assets backing the LST
     */
    function getTotalUnderlying() external view override returns (uint256) {
        return totalUnderlying;
    }

    /**
     * @dev Get the reward rate for the LST
     */
    function getRewardRate() external view override returns (uint256) {
        return rewardRate;
    }

    /**
     * @dev Get accumulated rewards for a user
     */
    function getAccumulatedRewards(address user) external view override returns (uint256) {
        uint256 timeSinceLastUpdate = block.timestamp - lastRewardUpdate[user];
        uint256 userBalance = balanceOf(user);
        return userBalance.mul(rewardRate).mul(timeSinceLastUpdate).div(365 days).div(1e18);
    }

    /**
     * @dev Claim rewards for a user
     */
    function claimRewards(address user) external override returns (uint256) {
        uint256 rewards = this.getAccumulatedRewards(user);
        if (rewards > 0) {
            userRewards[user] = userRewards[user].add(rewards);
            lastRewardUpdate[user] = block.timestamp;
            _mint(user, rewards);
            emit RewardsClaimed(user, rewards);
        }
        return rewards;
    }

    /**
     * @dev Get the protocol fee rate
     */
    function getProtocolFeeRate() external view override returns (uint256) {
        return protocolFeeRate;
    }

    /**
     * @dev Get the validator count
     */
    function getValidatorCount() external view override returns (uint256) {
        return validatorCount;
    }

    /**
     * @dev Get the minimum stake amount
     */
    function getMinStake() external view override returns (uint256) {
        return minStake;
    }

    /**
     * @dev Get the maximum stake amount
     */
    function getMaxStake() external view override returns (uint256) {
        return maxStake;
    }

    /**
     * @dev Mint tokens to an address (for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        totalUnderlying = totalUnderlying.add(amount);
    }

    /**
     * @dev Burn tokens from an address (for testing)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        totalUnderlying = totalUnderlying.sub(amount);
    }

    /**
     * @dev Update exchange rate (for testing)
     */
    function setExchangeRate(uint256 newRate) external onlyOwner {
        exchangeRate = newRate;
        emit ExchangeRateUpdated(newRate);
    }

    /**
     * @dev Update reward rate (for testing)
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Update protocol fee rate (for testing)
     */
    function setProtocolFeeRate(uint256 newRate) external onlyOwner {
        protocolFeeRate = newRate;
    }

    /**
     * @dev Update validator count (for testing)
     */
    function setValidatorCount(uint256 newCount) external onlyOwner {
        validatorCount = newCount;
    }

    /**
     * @dev Update minimum stake (for testing)
     */
    function setMinStake(uint256 newMin) external onlyOwner {
        minStake = newMin;
    }

    /**
     * @dev Update maximum stake (for testing)
     */
    function setMaxStake(uint256 newMax) external onlyOwner {
        maxStake = newMax;
    }

    /**
     * @dev Stake underlying asset to get LST tokens
     */
    function stake() external payable {
        require(msg.value >= minStake, "Amount below minimum stake");
        require(msg.value <= maxStake, "Amount above maximum stake");
        
        uint256 lstAmount = msg.value.mul(exchangeRate).div(1e18);
        userStakes[msg.sender] = userStakes[msg.sender].add(msg.value);
        totalUnderlying = totalUnderlying.add(msg.value);
        
        _mint(msg.sender, lstAmount);
        lastRewardUpdate[msg.sender] = block.timestamp;
    }

    /**
     * @dev Unstake LST tokens to get underlying asset
     */
    function unstake(uint256 lstAmount) external {
        require(balanceOf(msg.sender) >= lstAmount, "Insufficient LST balance");
        
        uint256 underlyingAmount = lstAmount.mul(1e18).div(exchangeRate);
        require(userStakes[msg.sender] >= underlyingAmount, "Insufficient staked amount");
        
        userStakes[msg.sender] = userStakes[msg.sender].sub(underlyingAmount);
        totalUnderlying = totalUnderlying.sub(underlyingAmount);
        
        _burn(msg.sender, lstAmount);
        
        (bool success, ) = msg.sender.call{value: underlyingAmount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get user's staked amount
     */
    function getUserStake(address user) external view returns (uint256) {
        return userStakes[user];
    }

    /**
     * @dev Get user's accumulated rewards
     */
    function getUserRewards(address user) external view returns (uint256) {
        return userRewards[user];
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // ============ Override Functions ============

    /**
     * @dev Override _mint to track total supply
     */
    function _mint(address to, uint256 amount) internal virtual override {
        super._mint(to, amount);
    }

    /**
     * @dev Override _burn to track total supply
     */
    function _burn(address from, uint256 amount) internal virtual override {
        super._burn(from, amount);
    }

    // ============ Receive Function ============
    
    receive() external payable {
        // Allow receiving ETH
    }
} 