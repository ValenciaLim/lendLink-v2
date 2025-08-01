// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ILendLinkCore
 * @dev Interface for the main LendLink lending protocol
 */
interface ILendLinkCore {
    // ============ Events ============
    
    event CollateralDeposited(
        address indexed user,
        address indexed collateralToken,
        uint256 amount,
        uint256 collateralValue
    );
    
    event CollateralWithdrawn(
        address indexed user,
        address indexed collateralToken,
        uint256 amount,
        uint256 collateralValue
    );
    
    event AssetBorrowed(
        address indexed user,
        address indexed borrowToken,
        uint256 amount,
        uint256 borrowValue
    );
    
    event AssetRepaid(
        address indexed user,
        address indexed borrowToken,
        uint256 amount,
        uint256 borrowValue
    );
    
    event LiquidationExecuted(
        address indexed liquidator,
        address indexed user,
        address indexed collateralToken,
        uint256 collateralAmount,
        uint256 debtAmount
    );
    
    event AutoRepayExecuted(
        address indexed user,
        uint256 rewardAmount,
        uint256 debtReduction
    );
    
    event BatchAutoRepayExecuted(
        uint256 totalUsers,
        uint256 totalRewards,
        uint256 totalDebtReduction
    );
    
    event InterestRateUpdated(
        address indexed asset,
        uint256 newRate,
        uint256 timestamp
    );
    
    event LTVUpdated(
        address indexed collateral,
        uint256 newLTV,
        uint256 timestamp
    );
    
    event LiquidationThresholdUpdated(
        address indexed collateral,
        uint256 newThreshold,
        uint256 timestamp
    );

    // ============ Structs ============
    
    struct UserPosition {
        uint256 totalCollateralValue;    // Total collateral value in USD
        uint256 totalBorrowValue;        // Total borrowed value in USD
        uint256 healthFactor;            // Health factor (collateral/borrow ratio)
        uint256 lastUpdateTime;          // Last position update timestamp
        bool isActive;                   // Whether user has active position
    }
    
    struct CollateralInfo {
        address token;                   // Collateral token address
        uint256 amount;                  // Amount deposited
        uint256 value;                   // Value in USD
        uint256 ltv;                     // Loan-to-value ratio
        uint256 liquidationThreshold;    // Liquidation threshold
        bool isActive;                   // Whether collateral is active
    }
    
    struct BorrowInfo {
        address token;                   // Borrowed token address
        uint256 amount;                  // Amount borrowed
        uint256 value;                   // Value in USD
        uint256 interestRate;            // Current interest rate
        uint256 lastUpdateTime;          // Last interest update
        bool isActive;                   // Whether borrow is active
    }

    // ============ Core Functions ============
    
    /**
     * @dev Deposit collateral tokens
     * @param collateralToken Address of the collateral token
     * @param amount Amount to deposit
     */
    function depositCollateral(address collateralToken, uint256 amount) external;
    
    /**
     * @dev Withdraw collateral tokens
     * @param collateralToken Address of the collateral token
     * @param amount Amount to withdraw
     */
    function withdrawCollateral(address collateralToken, uint256 amount) external;
    
    /**
     * @dev Borrow assets against collateral
     * @param borrowToken Address of the token to borrow
     * @param amount Amount to borrow
     */
    function borrow(address borrowToken, uint256 amount) external;
    
    /**
     * @dev Repay borrowed assets
     * @param borrowToken Address of the token to repay
     * @param amount Amount to repay
     */
    function repay(address borrowToken, uint256 amount) external;
    
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
    ) external;
    
    /**
     * @dev Execute auto-repay using LST rewards
     * @param user Address of user to auto-repay for
     */
    function executeAutoRepay(address user) external;

    // ============ View Functions ============
    
    /**
     * @dev Get user position information
     * @param user Address of the user
     * @return position User position struct
     */
    function getUserPosition(address user) external view returns (UserPosition memory position);
    
    /**
     * @dev Get user's collateral information
     * @param user Address of the user
     * @return collaterals Array of collateral info
     */
    function getUserCollaterals(address user) external view returns (CollateralInfo[] memory collaterals);
    
    /**
     * @dev Get user's borrow information
     * @param user Address of the user
     * @return borrows Array of borrow info
     */
    function getUserBorrows(address user) external view returns (BorrowInfo[] memory borrows);
    
    /**
     * @dev Get health factor for a user
     * @param user Address of the user
     * @return healthFactor Health factor (scaled by 1e18)
     */
    function getHealthFactor(address user) external view returns (uint256 healthFactor);
    
    /**
     * @dev Check if user position can be liquidated
     * @param user Address of the user
     * @return canLiquidate Whether position can be liquidated
     */
    function canLiquidate(address user) external view returns (bool canLiquidate);
    
    /**
     * @dev Get available borrow amount for a user
     * @param user Address of the user
     * @param borrowToken Token to borrow
     * @return availableAmount Available amount to borrow
     */
    function getAvailableBorrowAmount(address user, address borrowToken) external view returns (uint256 availableAmount);
    
    /**
     * @dev Get interest rate for a token
     * @param token Address of the token
     * @return rate Interest rate (scaled by 1e18)
     */
    function getInterestRate(address token) external view returns (uint256 rate);
    
    /**
     * @dev Get LTV for a collateral token
     * @param collateral Address of the collateral token
     * @return ltv Loan-to-value ratio (scaled by 1e18)
     */
    function getLTV(address collateral) external view returns (uint256 ltv);
    
    /**
     * @dev Get liquidation threshold for a collateral token
     * @param collateral Address of the collateral token
     * @return threshold Liquidation threshold (scaled by 1e18)
     */
    function getLiquidationThreshold(address collateral) external view returns (uint256 threshold);
    
    /**
     * @dev Get total protocol TVL
     * @return tvl Total value locked in USD
     */
    function getTotalTVL() external view returns (uint256 tvl);
    
    /**
     * @dev Get total protocol debt
     * @return debt Total debt in USD
     */
    function getTotalDebt() external view returns (uint256 debt);
} 