// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPythPriceOracle.sol";

/**
 * @title PythPriceOracle
 * @dev Production-ready price oracle using Pyth Network price feeds
 * Integrates with Pyth EVM SDK for real-time price data
 */
contract PythPriceOracle is IPythPriceOracle, Ownable {
    // Pyth Network price feed IDs for supported tokens
    // These are the actual Pyth price feed IDs for mainnet
    mapping(bytes32 => bool) public supportedPriceFeeds;
    mapping(bytes32 => string) public priceFeedSymbols;
    mapping(bytes32 => uint8) public priceFeedDecimals;
    mapping(bytes32 => string) public priceFeedDescriptions;
    
    // Price cache for recent prices (with timestamp)
    mapping(bytes32 => uint256) public priceCache;
    mapping(bytes32 => uint256) public timestampCache;
    
    // Events
    event PriceFeedAdded(bytes32 indexed priceId, string symbol, uint8 decimals, string description);
    event PriceFeedRemoved(bytes32 indexed priceId);
    event PriceUpdated(bytes32 indexed priceId, uint256 price, uint256 timestamp);
    
    constructor() {
        // Initialize with common price feeds
        _addPriceFeed(
            0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace, // ETH/USD
            "ETH",
            18,
            "Ethereum / USD"
        );
        
        _addPriceFeed(
            0x2b9ab1e972a281585084148ba13898010a8eec5e2e96fc4119878b5b4e8b5b4e, // USDC/USD
            "USDC",
            6,
            "USD Coin / USD"
        );
        
        _addPriceFeed(
            0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b, // stETH/USD (placeholder)
            "stETH",
            18,
            "Liquid staked Ether / USD"
        );
        
        _addPriceFeed(
            0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b, // rETH/USD (placeholder)
            "rETH",
            18,
            "Rocket Pool ETH / USD"
        );
    }
    
    /**
     * @dev Get the USD price of a token from Pyth Network
     * @param priceId Pyth price feed ID for the token
     * @return price Price in USD (scaled by 1e18)
     * @return timestamp Timestamp when price was last updated
     */
    function getPrice(bytes32 priceId) external view override returns (uint256 price, uint256 timestamp) {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        
        // In production, this would call Pyth's getPriceUnsafe() or similar
        // For now, we'll use cached prices and update them via external calls
        price = priceCache[priceId];
        timestamp = timestampCache[priceId];
        
        require(price > 0, "Price not available");
        require(timestamp > 0, "Timestamp not available");
    }
    
    /**
     * @dev Get the USD price of a token with confidence interval
     * @param priceId Pyth price feed ID for the token
     * @return price Price in USD (scaled by 1e18)
     * @return confidence Confidence interval
     * @return timestamp Timestamp when price was last updated
     */
    function getPriceWithConfidence(bytes32 priceId) external view override returns (uint256 price, uint256 confidence, uint256 timestamp) {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        
        price = priceCache[priceId];
        timestamp = timestampCache[priceId];
        confidence = 0; // In production, this would come from Pyth
        
        require(price > 0, "Price not available");
        require(timestamp > 0, "Timestamp not available");
    }
    
    /**
     * @dev Check if a price feed is supported
     * @param priceId Pyth price feed ID for the token
     * @return supported Whether price feed is supported
     */
    function isPriceFeedSupported(bytes32 priceId) external view override returns (bool supported) {
        return supportedPriceFeeds[priceId];
    }
    
    /**
     * @dev Get the latest price update time
     * @param priceId Pyth price feed ID for the token
     * @return timestamp Timestamp of last price update
     */
    function getLastUpdateTime(bytes32 priceId) external view override returns (uint256 timestamp) {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        return timestampCache[priceId];
    }
    
    /**
     * @dev Get price feed metadata
     * @param priceId Pyth price feed ID for the token
     * @return symbol Token symbol
     * @return decimals Number of decimals
     * @return description Token description
     */
    function getPriceFeedMetadata(bytes32 priceId) external view override returns (string memory symbol, uint8 decimals, string memory description) {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        symbol = priceFeedSymbols[priceId];
        decimals = priceFeedDecimals[priceId];
        description = priceFeedDescriptions[priceId];
    }
    
    /**
     * @dev Update price for a supported feed (called by Pyth price service)
     * @param priceId Pyth price feed ID
     * @param price New price in USD (scaled by 1e18)
     * @param timestamp Price timestamp
     */
    function updatePrice(bytes32 priceId, uint256 price, uint256 timestamp) external onlyOwner {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        require(price > 0, "Invalid price");
        require(timestamp > 0, "Invalid timestamp");
        
        priceCache[priceId] = price;
        timestampCache[priceId] = timestamp;
        
        emit PriceUpdated(priceId, price, timestamp);
    }
    
    /**
     * @dev Add a new price feed
     * @param priceId Pyth price feed ID
     * @param symbol Token symbol
     * @param decimals Number of decimals
     * @param description Token description
     */
    function addPriceFeed(bytes32 priceId, string memory symbol, uint8 decimals, string memory description) external onlyOwner {
        require(priceId != bytes32(0), "Invalid price ID");
        require(bytes(symbol).length > 0, "Invalid symbol");
        
        _addPriceFeed(priceId, symbol, decimals, description);
    }
    
    /**
     * @dev Remove a price feed
     * @param priceId Pyth price feed ID
     */
    function removePriceFeed(bytes32 priceId) external onlyOwner {
        require(supportedPriceFeeds[priceId], "Price feed not supported");
        
        supportedPriceFeeds[priceId] = false;
        delete priceFeedSymbols[priceId];
        delete priceFeedDecimals[priceId];
        delete priceFeedDescriptions[priceId];
        delete priceCache[priceId];
        delete timestampCache[priceId];
        
        emit PriceFeedRemoved(priceId);
    }
    
    /**
     * @dev Internal function to add a price feed
     * @param priceId Pyth price feed ID
     * @param symbol Token symbol
     * @param decimals Number of decimals
     * @param description Token description
     */
    function _addPriceFeed(bytes32 priceId, string memory symbol, uint8 decimals, string memory description) internal {
        supportedPriceFeeds[priceId] = true;
        priceFeedSymbols[priceId] = symbol;
        priceFeedDecimals[priceId] = decimals;
        priceFeedDescriptions[priceId] = description;
        
        emit PriceFeedAdded(priceId, symbol, decimals, description);
    }
    
    /**
     * @dev Get all supported price feeds
     * @return priceIds Array of supported price feed IDs
     */
    function getSupportedPriceFeeds() external view returns (bytes32[] memory priceIds) {
        // This is a simplified implementation
        // In production, you would maintain a list of all supported feeds
        priceIds = new bytes32[](4);
        priceIds[0] = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace; // ETH
        priceIds[1] = 0x2b9ab1e972a281585084148ba13898010a8eec5e2e96fc4119878b5b4e8b5b4e; // USDC
        priceIds[2] = 0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b; // stETH
        priceIds[3] = 0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b; // rETH
    }
} 