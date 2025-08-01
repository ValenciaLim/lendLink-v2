// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ILSTToken
 * @dev Interface for Liquid Staking Tokens (LSTs) like stETH, rETH
 */
interface ILSTToken is IERC20 {
    /**
     * @dev Get the underlying asset (e.g., ETH)
     * @return underlyingAsset Address of the underlying asset
     */
    function underlyingAsset() external view returns (address underlyingAsset);
    
    /**
     * @dev Get the exchange rate between LST and underlying asset
     * @return exchangeRate Exchange rate (scaled by 1e18)
     */
    function getExchangeRate() external view returns (uint256 exchangeRate);
    
    /**
     * @dev Get the total underlying assets backing the LST
     * @return totalUnderlying Total underlying assets
     */
    function getTotalUnderlying() external view returns (uint256 totalUnderlying);
    
    /**
     * @dev Get the reward rate for the LST
     * @return rewardRate Annual reward rate (scaled by 1e18)
     */
    function getRewardRate() external view returns (uint256 rewardRate);
    
    /**
     * @dev Get accumulated rewards for a user
     * @param user Address of the user
     * @return rewards Accumulated rewards
     */
    function getAccumulatedRewards(address user) external view returns (uint256 rewards);
    
    /**
     * @dev Claim rewards for a user
     * @param user Address of the user
     * @return claimedRewards Amount of rewards claimed
     */
    function claimRewards(address user) external returns (uint256 claimedRewards);
    
    /**
     * @dev Get the protocol fee rate
     * @return feeRate Protocol fee rate (scaled by 1e18)
     */
    function getProtocolFeeRate() external view returns (uint256 feeRate);
    
    /**
     * @dev Get the validator count
     * @return validatorCount Number of validators
     */
    function getValidatorCount() external view returns (uint256 validatorCount);
    
    /**
     * @dev Get the minimum stake amount
     * @return minStake Minimum stake amount
     */
    function getMinStake() external view returns (uint256 minStake);
    
    /**
     * @dev Get the maximum stake amount
     * @return maxStake Maximum stake amount
     */
    function getMaxStake() external view returns (uint256 maxStake);
} 