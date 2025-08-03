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

// Initialize global stats if not exists
if (!global.crossChainStats) {
  global.crossChainStats = {
    totalBridges: 150,
    activeLoans: 25,
    totalCrossChainTVL: '5000000', // $5M initial TVL
    successRate: 98.5,
    lastUpdate: new Date().toISOString()
  };
}

/**
 * @route GET /api/v1/prime/overview
 * @desc Get LendLink Prime protocol overview
 */
router.get('/overview', (req, res) => {
  // Get current cross-chain stats
  const currentStats = global.crossChainStats || {
    totalBridges: 150,
    activeLoans: 25,
    totalCrossChainTVL: '5000000',
    successRate: 98.5,
    lastUpdate: new Date().toISOString()
  };

  // Return dynamic data based on current stats
  const dynamicData = {
    ...mockPrimeData,
    totalCrossChainTVL: currentStats.totalCrossChainTVL,
    activeLoans: currentStats.activeLoans,
    totalBridges: currentStats.totalBridges
  };

  res.json({
    success: true,
    data: dynamicData
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
 * @route GET /api/v1/prime/stats
 * @desc Get cross-chain lending statistics
 */
router.get('/stats', (req, res) => {
  const stats = global.crossChainStats || {
    totalBridges: 0,
    activeLoans: 0,
    successRate: 98.5,
    lastUpdate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: stats
  });
});

/**
 * @route POST /api/v1/prime/execute-cross-chain-swap
 * @desc Execute cross-chain swap for lending
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
    
    // Update cross-chain stats
    const currentStats = global.crossChainStats || {
      totalBridges: 0,
      activeLoans: 0,
      totalCrossChainTVL: '5000000',
      successRate: 98.5,
      lastUpdate: new Date().toISOString()
    };
    
    // Calculate new TVL (add collateral value to existing TVL)
    const collateralValue = parseFloat(amount) * 2000; // Assuming $2000 per stETH
    const currentTVL = parseFloat(currentStats.totalCrossChainTVL);
    const newTVL = currentTVL + collateralValue;
    
    const updatedStats = {
      totalBridges: currentStats.totalBridges + 1,
      activeLoans: currentStats.activeLoans + 1,
      totalCrossChainTVL: newTVL.toString(),
      successRate: 98.5, // Mock success rate
      lastUpdate: new Date().toISOString()
    };
    
    // Store stats globally (in production, this would be in a database)
    global.crossChainStats = updatedStats;
  
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
        dstAmount: quote.dstAmount || quote.toTokenAmount,
        slippage: 0.005,
        purpose: 'cross-chain-lending',
        timestamp: new Date().toISOString(),
        transactionHash: result.txHash,
        stats: updatedStats
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

/**
 * @route POST /api/v1/prime/update-stats
 * @desc Update cross-chain statistics
 */
router.post('/update-stats', (req, res) => {
  try {
    const { totalBridges, activeLoans, totalCrossChainTVL, successRate } = req.body;
    
    const currentStats = global.crossChainStats || {
      totalBridges: 0,
      activeLoans: 0,
      totalCrossChainTVL: '5000000',
      successRate: 98.5,
      lastUpdate: new Date().toISOString()
    };
    
    const updatedStats = {
      totalBridges: totalBridges !== undefined ? totalBridges : currentStats.totalBridges,
      activeLoans: activeLoans !== undefined ? activeLoans : currentStats.activeLoans,
      totalCrossChainTVL: totalCrossChainTVL !== undefined ? totalCrossChainTVL : currentStats.totalCrossChainTVL,
      successRate: successRate !== undefined ? successRate : currentStats.successRate,
      lastUpdate: new Date().toISOString()
    };
    
    global.crossChainStats = updatedStats;
    
    res.json({
      success: true,
      message: 'Cross-chain stats updated successfully',
      data: updatedStats
    });
  } catch (error) {
    console.error('Error updating cross-chain stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cross-chain stats',
      error: error.message
    });
  }
});



module.exports = router; 