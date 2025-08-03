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
 * @route GET /api/v1/prime/supported-chains
 * @desc Get supported chains
 */
router.get('/supported-chains', (req, res) => {
  res.json({
    success: true,
    data: mockPrimeData.supportedChains
  });
});

/**
 * @route POST /api/v1/prime/initiate-loan
 * @desc Initiate a cross-chain loan
 */
router.post('/initiate-loan', (req, res) => {
  const { sourceChain, destinationChain, collateralToken, borrowToken, collateralAmount, borrowAmount } = req.body;
  
  // Mock loan initiation response
  const loanId = '0x' + Math.random().toString(16).substr(2, 64);
  const bridgeId = '0x' + Math.random().toString(16).substr(2, 64);
  
  res.json({
    success: true,
    message: 'Cross-chain loan initiated successfully',
    data: {
      loanId,
      bridgeId,
      sourceChain,
      destinationChain,
      collateralToken,
      borrowToken,
      collateralAmount,
      borrowAmount,
      status: 'pending',
      timestamp: new Date().toISOString()
    }
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

/**
 * @route POST /api/v1/prime/repay-loan
 * @desc Repay cross-chain loan
 */
router.post('/repay-loan', (req, res) => {
  const { loanId, repayAmount } = req.body;
  
  // Mock repayment response
  res.json({
    success: true,
    message: 'Cross-chain loan repayment initiated',
    data: {
      loanId,
      repayAmount,
      status: 'repaying',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route GET /api/v1/prime/loan/:loanId
 * @desc Get cross-chain loan details
 */
router.get('/loan/:loanId', (req, res) => {
  const { loanId } = req.params;
  
  // Mock loan details
  const loanDetails = {
    loanId,
    borrower: '0x1234567890123456789012345678901234567890',
    sourceChain: 1,
    destinationChain: 128123,
    collateralToken: 'stETH',
    borrowToken: 'USDC',
    collateralAmount: '10.0',
    borrowAmount: '15000.0',
    healthFactor: '2.5',
    status: 'active',
    bridgeId: '0x1234567890123456789012345678901234567890123456789012345678901234',
    swapId: '0x5678901234567890123456789012345678901234567890123456789012345678',
    createdAt: new Date().toISOString(),
    lastUpdateTime: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: loanDetails
  });
});

/**
 * @route GET /api/v1/prime/user/:address/loans
 * @desc Get user's cross-chain loans
 */
router.get('/user/:address/loans', (req, res) => {
  const { address } = req.params;
  
  // Mock user loans
  const userLoans = [
    {
      loanId: '0x1234567890123456789012345678901234567890123456789012345678901234',
      sourceChain: 1,
      destinationChain: 128123,
      collateralToken: 'stETH',
      borrowToken: 'USDC',
      collateralAmount: '10.0',
      borrowAmount: '15000.0',
      healthFactor: '2.5',
      status: 'active',
      bridgeId: '0x1234567890123456789012345678901234567890123456789012345678901234',
      swapId: '0x5678901234567890123456789012345678901234567890123456789012345678',
      createdAt: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: userLoans
  });
});

/**
 * @route GET /api/v1/prime/bridge/:bridgeId
 * @desc Get bridge transaction details
 */
router.get('/bridge/:bridgeId', (req, res) => {
  const { bridgeId } = req.params;
  
  // Mock bridge details
  const bridgeDetails = {
    bridgeId,
    sender: '0x1234567890123456789012345678901234567890',
    recipient: '0x0987654321098765432109876543210987654321',
    token: 'stETH',
    amount: '10.0',
    sourceChain: 1,
    destinationChain: 128123,
    status: 'completed',
    timestamp: new Date().toISOString(),
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
  };
  
  res.json({
    success: true,
    data: bridgeDetails
  });
});

/**
 * @route GET /api/v1/prime/swap/:swapId
 * @desc Get swap transaction details
 */
router.get('/swap/:swapId', (req, res) => {
  const { swapId } = req.params;
  
  // Mock swap details
  const swapDetails = {
    swapId,
    srcToken: 'stETH',
    dstToken: 'USDC',
    srcAmount: '10.0',
    dstAmount: '19900.0',
    slippage: 0.005,
    status: 'completed',
    timestamp: new Date().toISOString(),
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
  };
  
  res.json({
    success: true,
    data: swapDetails
  });
});

/**
 * @route GET /api/v1/prime/cross-chain-quote
 * @desc Get cross-chain swap quote for lending purposes
 */
router.get('/cross-chain-quote', async (req, res) => {
  try {
    const { srcToken, dstToken, amount, srcChainId, dstChainId, loanId } = req.query;
    
    if (!srcToken || !dstToken || !amount || !srcChainId || !dstChainId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: srcToken, dstToken, amount, srcChainId, dstChainId'
      });
    }

    // Get cross-chain quote from 1inch API
    const quote = await oneInchService.getCrossChainSwapQuote(
      srcToken, 
      dstToken, 
      amount, 
      parseInt(srcChainId), 
      parseInt(dstChainId)
    );
    
    res.json({
      success: true,
      data: {
        ...quote,
        loanId: loanId || null,
        purpose: 'cross-chain-lending',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cross-chain quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cross-chain quote',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/prime/bridge-fee
 * @desc Get bridge fee for a route
 */
router.get('/bridge-fee', (req, res) => {
  const { sourceChain, destinationChain, token, amount } = req.query;
  
  // Mock bridge fee calculation
  const baseFee = 0.001; // 0.001 ETH
  const amountFee = (amount * 0.0001); // 0.01% of amount
  const distanceMultiplier = sourceChain == 1 || destinationChain == 1 ? 2 : 1.5;
  const totalFee = (baseFee + amountFee) * distanceMultiplier;
  
  res.json({
    success: true,
    data: {
      sourceChain: parseInt(sourceChain),
      destinationChain: parseInt(destinationChain),
      token,
      amount: parseFloat(amount),
      fee: totalFee.toString(),
      feeInUSD: (totalFee * 2000).toString() // Assuming ETH = $2000
    }
  });
});

module.exports = router; 