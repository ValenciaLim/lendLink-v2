// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPythPriceOracle
 * @dev Interface for Pyth Network price oracle integration
 */
interface IPythPriceOracle {
    /**
     * @dev Get the USD price of a token from Pyth Network
     * @param priceId Pyth price feed ID for the token
     * @return price Price in USD (scaled by 1e18)
     * @return timestamp Timestamp when price was last updated
     */
    function getPrice(bytes32 priceId) external view returns (uint256 price, uint256 timestamp);
    
    /**
     * @dev Get the USD price of a token with confidence interval
     * @param priceId Pyth price feed ID for the token
     * @return price Price in USD (scaled by 1e18)
     * @return confidence Confidence interval
     * @return timestamp Timestamp when price was last updated
     */
    function getPriceWithConfidence(bytes32 priceId) external view returns (uint256 price, uint256 confidence, uint256 timestamp);
    
    /**
     * @dev Check if a price feed is supported
     * @param priceId Pyth price feed ID for the token
     * @return supported Whether price feed is supported
     */
    function isPriceFeedSupported(bytes32 priceId) external view returns (bool supported);
    
    /**
     * @dev Get the latest price update time
     * @param priceId Pyth price feed ID for the token
     * @return timestamp Timestamp of last price update
     */
    function getLastUpdateTime(bytes32 priceId) external view returns (uint256 timestamp);
    
    /**
     * @dev Get price feed metadata
     * @param priceId Pyth price feed ID for the token
     * @return symbol Token symbol
     * @return decimals Number of decimals
     * @return description Token description
     */
    function getPriceFeedMetadata(bytes32 priceId) external view returns (string memory symbol, uint8 decimals, string memory description);
} 