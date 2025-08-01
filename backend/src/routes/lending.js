const express = require('express');
const router = express.Router();

// Mock data for development
const mockLendingData = {
  totalTVL: '1000000',
  totalDebt: '500000',
  activeUsers: 150,
  supportedTokens: ['stETH', 'rETH', 'USDC']
};

/**
 * @route GET /api/v1/lending/overview
 * @desc Get lending protocol overview
 */
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: mockLendingData
  });
});

/**
 * @route GET /api/v1/lending/user/:address
 * @desc Get user lending position
 */
router.get('/user/:address', (req, res) => {
  const { address } = req.params;
  
  // Mock user position data
  const userPosition = {
    address,
    totalCollateralValue: '50000',
    totalBorrowValue: '25000',
    healthFactor: '2.0',
    collaterals: [
      {
        token: 'stETH',
        amount: '25',
        value: '50000',
        ltv: '0.8'
      }
    ],
    borrows: [
      {
        token: 'USDC',
        amount: '25000',
        value: '25000',
        interestRate: '0.08'
      }
    ]
  };

  res.json({
    success: true,
    data: userPosition
  });
});

/**
 * @route POST /api/v1/lending/deposit
 * @desc Deposit collateral
 */
router.post('/deposit', (req, res) => {
  const { userAddress, token, amount } = req.body;
  
  // Mock deposit response
  res.json({
    success: true,
    message: 'Deposit successful',
    data: {
      userAddress,
      token,
      amount,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route POST /api/v1/lending/borrow
 * @desc Borrow assets
 */
router.post('/borrow', (req, res) => {
  const { userAddress, token, amount } = req.body;
  
  // Mock borrow response
  res.json({
    success: true,
    message: 'Borrow successful',
    data: {
      userAddress,
      token,
      amount,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route POST /api/v1/lending/repay
 * @desc Repay borrowed assets
 */
router.post('/repay', (req, res) => {
  const { userAddress, token, amount } = req.body;
  
  // Mock repay response
  res.json({
    success: true,
    message: 'Repayment successful',
    data: {
      userAddress,
      token,
      amount,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route GET /api/v1/lending/supported-tokens
 * @desc Get supported tokens
 */
router.get('/supported-tokens', (req, res) => {
  const supportedTokens = {
    collateral: [
      {
        symbol: 'stETH',
        name: 'Liquid staked Ether',
        address: '0x...',
        ltv: '0.8',
        liquidationThreshold: '0.85',
        isLST: true
      },
      {
        symbol: 'rETH',
        name: 'Rocket Pool ETH',
        address: '0x...',
        ltv: '0.75',
        liquidationThreshold: '0.8',
        isLST: true
      }
    ],
    borrow: [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x...',
        interestRate: '0.08',
        decimals: 6
      }
    ]
  };

  res.json({
    success: true,
    data: supportedTokens
  });
});

module.exports = router; 