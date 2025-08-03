const express = require('express');
const router = express.Router();

// Mock data for development (will be updated by operations)
let mockLendingData = {
  totalTVL: '1000000',
  totalDebt: '500000',
  activeUsers: 150,
  totalTransactions: 1250,
  supportedTokens: ['stETH', 'rETH', 'USDC']
};

// Mock user data (will be updated by operations)
const mockUserData = {
  '0x1234567890123456789012345678901234567890': {
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
  }
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
  
  // Get user data or return default
  const userData = mockUserData[address] || {
    totalCollateralValue: '0',
    totalBorrowValue: '0',
    healthFactor: '0',
    collaterals: [],
    borrows: []
  };

  const userPosition = {
    address,
    ...userData
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
  
  // Update user data
  if (!mockUserData[userAddress]) {
    mockUserData[userAddress] = {
      totalCollateralValue: '0',
      totalBorrowValue: '0',
      healthFactor: '0',
      collaterals: [],
      borrows: []
    };
  }

  const depositAmount = parseFloat(amount);
  const depositValue = depositAmount * 2000; // Assuming 1 stETH = $2000

  // Update user collateral
  const existingCollateral = mockUserData[userAddress].collaterals.find(c => c.token === token);
  if (existingCollateral) {
    existingCollateral.amount = (parseFloat(existingCollateral.amount) + depositAmount).toString();
    existingCollateral.value = (parseFloat(existingCollateral.value) + depositValue).toString();
  } else {
    mockUserData[userAddress].collaterals.push({
      token,
      amount: amount,
      value: depositValue.toString(),
      ltv: '0.8'
    });
  }

  // Update total collateral value
  const totalCollateralValue = parseFloat(mockUserData[userAddress].totalCollateralValue) + depositValue;
  mockUserData[userAddress].totalCollateralValue = totalCollateralValue.toString();

  // Update health factor
  const totalBorrowValue = parseFloat(mockUserData[userAddress].totalBorrowValue);
  const healthFactor = totalBorrowValue > 0 ? (totalCollateralValue * 0.8) / totalBorrowValue : 0;
  mockUserData[userAddress].healthFactor = healthFactor.toString();

  // Update protocol stats
  mockLendingData.totalTVL = (parseFloat(mockLendingData.totalTVL) + depositValue).toString();
  mockLendingData.totalTransactions = parseInt(mockLendingData.totalTransactions) + 1;
  
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
  
  // Update user data
  if (!mockUserData[userAddress]) {
    mockUserData[userAddress] = {
      totalCollateralValue: '0',
      totalBorrowValue: '0',
      healthFactor: '0',
      collaterals: [],
      borrows: []
    };
  }

  const borrowAmount = parseFloat(amount);
  const borrowValue = borrowAmount; // USDC value = amount

  // Update user borrows
  const existingBorrow = mockUserData[userAddress].borrows.find(b => b.token === token);
  if (existingBorrow) {
    existingBorrow.amount = (parseFloat(existingBorrow.amount) + borrowAmount).toString();
    existingBorrow.value = (parseFloat(existingBorrow.value) + borrowValue).toString();
  } else {
    mockUserData[userAddress].borrows.push({
      token,
      amount: amount,
      value: borrowValue.toString(),
      interestRate: '0.08'
    });
  }

  // Update total borrow value
  const totalBorrowValue = parseFloat(mockUserData[userAddress].totalBorrowValue) + borrowValue;
  mockUserData[userAddress].totalBorrowValue = totalBorrowValue.toString();

  // Update health factor
  const totalCollateralValue = parseFloat(mockUserData[userAddress].totalCollateralValue);
  const healthFactor = totalBorrowValue > 0 ? (totalCollateralValue * 0.8) / totalBorrowValue : 0;
  mockUserData[userAddress].healthFactor = healthFactor.toString();

  // Update protocol stats
  mockLendingData.totalDebt = (parseFloat(mockLendingData.totalDebt) + borrowValue).toString();
  mockLendingData.totalTransactions = parseInt(mockLendingData.totalTransactions) + 1;
  
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
  
  // Update user data
  if (!mockUserData[userAddress]) {
    return res.status(400).json({
      success: false,
      message: 'No user data found'
    });
  }

  const repayAmount = parseFloat(amount);
  const repayValue = repayAmount; // USDC value = amount

  // Update user borrows
  const existingBorrow = mockUserData[userAddress].borrows.find(b => b.token === token);
  if (existingBorrow) {
    const newAmount = parseFloat(existingBorrow.amount) - repayAmount;
    if (newAmount <= 0) {
      // Remove borrow if fully repaid
      mockUserData[userAddress].borrows = mockUserData[userAddress].borrows.filter(b => b.token !== token);
    } else {
      existingBorrow.amount = newAmount.toString();
      existingBorrow.value = (parseFloat(existingBorrow.value) - repayValue).toString();
    }
  }

  // Update total borrow value
  const totalBorrowValue = Math.max(0, parseFloat(mockUserData[userAddress].totalBorrowValue) - repayValue);
  mockUserData[userAddress].totalBorrowValue = totalBorrowValue.toString();

  // Update health factor
  const totalCollateralValue = parseFloat(mockUserData[userAddress].totalCollateralValue);
  const healthFactor = totalBorrowValue > 0 ? (totalCollateralValue * 0.8) / totalBorrowValue : 0;
  mockUserData[userAddress].healthFactor = healthFactor.toString();

  // Update protocol stats
  mockLendingData.totalDebt = Math.max(0, parseFloat(mockLendingData.totalDebt) - repayValue).toString();
  mockLendingData.totalTransactions = parseInt(mockLendingData.totalTransactions) + 1;
  
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