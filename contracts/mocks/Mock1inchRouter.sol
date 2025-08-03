// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/I1inchRouter.sol";

/**
 * @title Mock1inchRouter
 * @dev Mock implementation of 1inch Fusion+ router for testing
 */
contract Mock1inchRouter is I1inchRouter, Ownable {
    // Mock exchange rates (simplified)
    mapping(address => mapping(address => uint256)) public exchangeRates;
    mapping(address => mapping(address => bool)) public supportedPairs;
    
    // Mock gas estimates
    uint256 public constant MOCK_GAS_ESTIMATE = 200000;
    
    // Events
    event MockSwapExecuted(
        address indexed srcToken,
        address indexed dstToken,
        uint256 srcAmount,
        uint256 dstAmount,
        address indexed recipient
    );

    constructor() {
        // Set up some default exchange rates
        _setExchangeRate(0x1111111111111111111111111111111111111111, 0x2222222222222222222222222222222222222222, 2000); // USDC -> stETH
        _setExchangeRate(0x2222222222222222222222222222222222222222, 0x1111111111111111111111111111111111111111, 1); // stETH -> USDC
        _setExchangeRate(0x3333333333333333333333333333333333333333, 0x1111111111111111111111111111111111111111, 1); // rETH -> USDC
        _setExchangeRate(0x1111111111111111111111111111111111111111, 0x3333333333333333333333333333333333333333, 2000); // USDC -> rETH
    }

    /**
     * @dev Execute a cross-chain swap through 1inch Fusion+
     */
    function swap(
        address srcToken,
        address dstToken,
        uint256 amount,
        uint256 minReturn,
        address payable recipient,
        bytes calldata permit,
        bytes calldata data
    ) external payable override returns (uint256 returnAmount) {
        require(supportedPairs[srcToken][dstToken], "Pair not supported");
        require(exchangeRates[srcToken][dstToken] > 0, "Exchange rate not set");

        // Calculate return amount based on exchange rate
        returnAmount = amount.mul(exchangeRates[srcToken][dstToken]).div(1e18);
        require(returnAmount >= minReturn, "Insufficient return amount");

        // Simulate swap execution
        emit MockSwapExecuted(srcToken, dstToken, amount, returnAmount, recipient);

        return returnAmount;
    }

    /**
     * @dev Get quote for a cross-chain swap
     */
    function getQuote(
        address srcToken,
        address dstToken,
        uint256 amount
    ) external view override returns (uint256 returnAmount, uint256 gasEstimate) {
        require(supportedPairs[srcToken][dstToken], "Pair not supported");
        require(exchangeRates[srcToken][dstToken] > 0, "Exchange rate not set");

        returnAmount = amount.mul(exchangeRates[srcToken][dstToken]).div(1e18);
        gasEstimate = MOCK_GAS_ESTIMATE;

        return (returnAmount, gasEstimate);
    }

    /**
     * @dev Check if a token pair is supported for cross-chain swaps
     */
    function isPairSupported(
        address srcToken,
        address dstToken
    ) external view override returns (bool supported) {
        return supportedPairs[srcToken][dstToken] && exchangeRates[srcToken][dstToken] > 0;
    }

    /**
     * @dev Get routing information for a swap
     */
    function getRoute(
        address srcToken,
        address dstToken,
        uint256 amount
    ) external view override returns (bytes memory route, uint256 steps) {
        require(supportedPairs[srcToken][dstToken], "Pair not supported");

        // Mock route data
        route = abi.encode(srcToken, dstToken, amount);
        steps = 1; // Direct swap

        return (route, steps);
    }

    /**
     * @dev Set exchange rate for a token pair (admin function)
     */
    function setExchangeRate(
        address srcToken,
        address dstToken,
        uint256 rate
    ) external onlyOwner {
        _setExchangeRate(srcToken, dstToken, rate);
    }

    /**
     * @dev Set supported pair (admin function)
     */
    function setSupportedPair(
        address srcToken,
        address dstToken,
        bool supported
    ) external onlyOwner {
        supportedPairs[srcToken][dstToken] = supported;
        supportedPairs[dstToken][srcToken] = supported; // Bidirectional
    }

    /**
     * @dev Internal function to set exchange rate
     */
    function _setExchangeRate(
        address srcToken,
        address dstToken,
        uint256 rate
    ) internal {
        exchangeRates[srcToken][dstToken] = rate;
        supportedPairs[srcToken][dstToken] = true;
        supportedPairs[dstToken][srcToken] = true;
    }

    /**
     * @dev Update exchange rate with small random variation (for testing)
     */
    function updateExchangeRateWithVariation(
        address srcToken,
        address dstToken
    ) external onlyOwner {
        require(exchangeRates[srcToken][dstToken] > 0, "Exchange rate not set");

        uint256 currentRate = exchangeRates[srcToken][dstToken];
        uint256 variation = (currentRate * 5) / 1000; // 0.5% variation
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, srcToken, dstToken))) % (variation * 2);

        if (randomFactor > variation) {
            exchangeRates[srcToken][dstToken] = currentRate + (randomFactor - variation);
        } else {
            exchangeRates[srcToken][dstToken] = currentRate - randomFactor;
        }
    }

    /**
     * @dev Get all supported pairs
     */
    function getSupportedPairs() external view returns (address[] memory srcTokens, address[] memory dstTokens) {
        // This is a simplified implementation
        // In production, you would maintain a list of all supported pairs
        srcTokens = new address[](4);
        dstTokens = new address[](4);
        
        srcTokens[0] = 0x1111111111111111111111111111111111111111; // USDC
        dstTokens[0] = 0x2222222222222222222222222222222222222222; // stETH
        
        srcTokens[1] = 0x2222222222222222222222222222222222222222; // stETH
        dstTokens[1] = 0x1111111111111111111111111111111111111111; // USDC
        
        srcTokens[2] = 0x3333333333333333333333333333333333333333; // rETH
        dstTokens[2] = 0x1111111111111111111111111111111111111111; // USDC
        
        srcTokens[3] = 0x1111111111111111111111111111111111111111; // USDC
        dstTokens[3] = 0x3333333333333333333333333333333333333333; // rETH
    }
} 