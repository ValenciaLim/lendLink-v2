// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPriceOracle.sol";

/**
 * @title MockPriceOracle
 * @dev Mock price oracle for testing and development
 */
contract MockPriceOracle is IPriceOracle {
    // Mock prices (scaled by 1e18)
    mapping(address => uint256) private prices;
    mapping(address => uint256) private timestamps;
    mapping(address => bool) private supportedTokens;
    mapping(address => uint8) private decimals;

    constructor() {
        // Set up some default mock prices
        _setMockPrice(0x0000000000000000000000000000000000000000, 2000e18); // ETH
        _setMockPrice(0x1111111111111111111111111111111111111111, 1e18); // USDC
        _setMockPrice(0x2222222222222222222222222222222222222222, 2000e18); // stETH
        _setMockPrice(0x3333333333333333333333333333333333333333, 2000e18); // rETH
    }

    /**
     * @dev Get the USD price of a token
     * @param token Address of the token
     * @return price Price in USD (scaled by 1e18)
     */
    function getPrice(address token) external view override returns (uint256 price) {
        require(supportedTokens[token], "Token not supported");
        return prices[token];
    }

    /**
     * @dev Get the USD price of a token with timestamp
     * @param token Address of the token
     * @return price Price in USD (scaled by 1e18)
     * @return timestamp Timestamp when price was last updated
     */
    function getPriceWithTimestamp(address token) external view override returns (uint256 price, uint256 timestamp) {
        require(supportedTokens[token], "Token not supported");
        return (prices[token], timestamps[token]);
    }

    /**
     * @dev Check if a token is supported by the oracle
     * @param token Address of the token
     * @return supported Whether token is supported
     */
    function isTokenSupported(address token) external view override returns (bool supported) {
        return supportedTokens[token];
    }

    /**
     * @dev Get the decimals of the price feed
     * @param token Address of the token
     * @return decimals Number of decimals
     */
    function getDecimals(address token) external view override returns (uint8) {
        require(supportedTokens[token], "Token not supported");
        return decimals[token];
    }

    /**
     * @dev Set mock price for a token (admin function)
     * @param token Address of the token
     * @param price Price in USD (scaled by 1e18)
     */
    function setMockPrice(address token, uint256 price) external {
        _setMockPrice(token, price);
    }

    /**
     * @dev Set mock price for a token (internal)
     * @param token Address of the token
     * @param price Price in USD (scaled by 1e18)
     */
    function _setMockPrice(address token, uint256 price) internal {
        prices[token] = price;
        timestamps[token] = block.timestamp;
        supportedTokens[token] = true;
        decimals[token] = 18;
    }

    /**
     * @dev Add support for a token
     * @param token Address of the token
     * @param price Price in USD (scaled by 1e18)
     * @param tokenDecimals Number of decimals for the token
     */
    function addToken(address token, uint256 price, uint8 tokenDecimals) external {
        _setMockPrice(token, price);
        decimals[token] = tokenDecimals;
    }

    /**
     * @dev Remove support for a token
     * @param token Address of the token
     */
    function removeToken(address token) external {
        supportedTokens[token] = false;
    }

    /**
     * @dev Update price with a small random variation (for testing)
     * @param token Address of the token
     */
    function updatePriceWithVariation(address token) external {
        require(supportedTokens[token], "Token not supported");
        
        uint256 currentPrice = prices[token];
        uint256 variation = (currentPrice * 5) / 1000; // 0.5% variation
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, token))) % (variation * 2);
        
        if (randomFactor > variation) {
            prices[token] = currentPrice + (randomFactor - variation);
        } else {
            prices[token] = currentPrice - randomFactor;
        }
        
        timestamps[token] = block.timestamp;
    }
} 