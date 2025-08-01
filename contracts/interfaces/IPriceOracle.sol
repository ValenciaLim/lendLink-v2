// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle that provides USD prices for tokens
 */
interface IPriceOracle {
    /**
     * @dev Get the USD price of a token
     * @param token Address of the token
     * @return price Price in USD (scaled by 1e18)
     */
    function getPrice(address token) external view returns (uint256 price);
    
    /**
     * @dev Get the USD price of a token with timestamp
     * @param token Address of the token
     * @return price Price in USD (scaled by 1e18)
     * @return timestamp Timestamp when price was last updated
     */
    function getPriceWithTimestamp(address token) external view returns (uint256 price, uint256 timestamp);
    
    /**
     * @dev Check if a token is supported by the oracle
     * @param token Address of the token
     * @return supported Whether token is supported
     */
    function isTokenSupported(address token) external view returns (bool supported);
    
    /**
     * @dev Get the decimals of the price feed
     * @param token Address of the token
     * @return decimals Number of decimals
     */
    function getDecimals(address token) external view returns (uint8 decimals);
} 