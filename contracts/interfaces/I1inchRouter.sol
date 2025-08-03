// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title I1inchRouter
 * @dev Interface for 1inch Fusion+ integration for cross-chain swaps
 */
interface I1inchRouter {
    /**
     * @dev Execute a cross-chain swap through 1inch Fusion+
     * @param srcToken Source token address
     * @param dstToken Destination token address
     * @param amount Amount to swap
     * @param minReturn Minimum return amount
     * @param recipient Recipient address
     * @param permit Permit data for token approval
     * @param data Additional swap data
     * @return returnAmount Amount received from swap
     */
    function swap(
        address srcToken,
        address dstToken,
        uint256 amount,
        uint256 minReturn,
        address payable recipient,
        bytes calldata permit,
        bytes calldata data
    ) external payable returns (uint256 returnAmount);

    /**
     * @dev Get quote for a cross-chain swap
     * @param srcToken Source token address
     * @param dstToken Destination token address
     * @param amount Amount to swap
     * @return returnAmount Expected return amount
     * @return gasEstimate Estimated gas cost
     */
    function getQuote(
        address srcToken,
        address dstToken,
        uint256 amount
    ) external view returns (uint256 returnAmount, uint256 gasEstimate);

    /**
     * @dev Check if a token pair is supported for cross-chain swaps
     * @param srcToken Source token address
     * @param dstToken Destination token address
     * @return supported Whether the pair is supported
     */
    function isPairSupported(
        address srcToken,
        address dstToken
    ) external view returns (bool supported);

    /**
     * @dev Get routing information for a swap
     * @param srcToken Source token address
     * @param dstToken Destination token address
     * @param amount Amount to swap
     * @return route Route information
     * @return steps Number of steps in the route
     */
    function getRoute(
        address srcToken,
        address dstToken,
        uint256 amount
    ) external view returns (bytes memory route, uint256 steps);
} 