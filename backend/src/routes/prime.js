const express = require('express');
const router = express.Router();
const OneInchService = require('../services/1inch');

const oneInchService = new OneInchService();

// Mock data for LendLink Prime
const mockPrimeData = {
  totalCrossChainTVL: '5000000',
  totalCrossChainDebt: '2500000',
  activeLoans: 25,
  totalBridges: 150,
  supportedChains: [
    { id: 1, name: 'Ethereum', icon: '🔵' },
    { id: 128123, name: 'Etherlink', icon: '🟢' },
    { id: 137, name: 'Polygon', icon: '🟣' },
    { id: 42161, name: 'Arbitrum', icon: '🔴' }
  ],
  supportedTokens: {
    ethereum: ['stETH', 'rETH', 'USDC'],
    etherlink: ['stETH', 'rETH', 'USDC'],
    polygon: ['USDC', 'USDT', 'WETH'],
    arbitrum: ['USDC', 'USDT', 'WETH']
  }
};

/**
 * @route GET /api/v1/prime/overview
 * @desc Get LendLink Prime protocol overview
 */
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: mockPrimeData
  });
});

/**
 * @route GET /api/v1/prime/supported-tokens
 * @desc Get supported tokens for each chain
 */
router.get('/supported-tokens', (req, res) => {
  res.json({
    success: true,
    data: mockPrimeData.supportedTokens
  });
});



/**
 * @route POST /api/v1/prime/execute-cross-chain-swap
 * @desc Execute cross-chain swap for lending purposes via 1inch Fusion+
 */
router.post('/execute-cross-chain-swap', async (req, res) => {
  try {
    const { loanId, srcToken, dstToken, amount, srcChainId, dstChainId, from } = req.body;
    
    if (!srcToken || !dstToken || !amount || !srcChainId || !dstChainId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: srcToken, dstToken, amount, srcChainId, dstChainId'
      });
    }

    // Get cross-chain quote from 1inch
    const quote = await oneInchService.getCrossChainSwapQuote(
      srcToken, 
      dstToken, 
      amount, 
      parseInt(srcChainId), 
      parseInt(dstChainId)
    );
    
    // Execute cross-chain swap using 1inch API
    const swapData = {
      ...quote,
      from: from || '0x0000000000000000000000000000000000000000',
      slippage: 0.5 // 0.5% slippage
    };
    
    const result = await oneInchService.executeCrossChainSwap(swapData);
    
    res.json({
      success: true,
      message: 'Cross-chain swap executed successfully for lending',
      data: {
        swapId: result.txHash,
        loanId,
        srcToken,
        dstToken,
        srcChainId: parseInt(srcChainId),
        dstChainId: parseInt(dstChainId),
        srcAmount: amount,
        dstAmount: quote.toTokenAmount,
        slippage: 0.005,
        purpose: 'cross-chain-lending',
        timestamp: new Date().toISOString(),
        transactionHash: result.txHash
      }
    });
  } catch (error) {
    console.error('Error executing cross-chain swap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute cross-chain swap',
      error: error.message
    });
  }
});



module.exports = router; 