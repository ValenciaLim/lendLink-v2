const express = require('express');
const router = express.Router();

// Mock user data
const mockUsers = {
  '0x1234567890123456789012345678901234567890': {
    address: '0x1234567890123456789012345678901234567890',
    username: 'alice',
    totalValue: '50000',
    joinDate: '2024-01-01',
    lastActive: '2024-01-05',
    preferences: {
      notifications: true,
      theme: 'dark'
    }
  },
  '0x0987654321098765432109876543210987654321': {
    address: '0x0987654321098765432109876543210987654321',
    username: 'bob',
    totalValue: '75000',
    joinDate: '2024-01-02',
    lastActive: '2024-01-05',
    preferences: {
      notifications: false,
      theme: 'light'
    }
  }
};

/**
 * @route GET /api/v1/users/:address
 * @desc Get user profile
 */
router.get('/:address', (req, res) => {
  const { address } = req.params;
  
  const user = mockUsers[address];
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * @route POST /api/v1/users/:address
 * @desc Update user profile
 */
router.post('/:address', (req, res) => {
  const { address } = req.params;
  const { username, preferences } = req.body;
  
  if (!mockUsers[address]) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Update user data
  mockUsers[address] = {
    ...mockUsers[address],
    username: username || mockUsers[address].username,
    preferences: preferences || mockUsers[address].preferences,
    lastActive: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: mockUsers[address]
  });
});

/**
 * @route GET /api/v1/users/:address/positions
 * @desc Get user positions
 */
router.get('/:address/positions', (req, res) => {
  const { address } = req.params;
  
  // Mock position data
  const positions = {
    address,
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
    ],
    healthFactor: '2.0',
    totalCollateralValue: '50000',
    totalBorrowValue: '25000'
  };

  res.json({
    success: true,
    data: positions
  });
});

/**
 * @route GET /api/v1/users/:address/transactions
 * @desc Get user transaction history
 */
router.get('/:address/transactions', (req, res) => {
  const { address } = req.params;
  const { limit = 10 } = req.query;
  
  // Mock transaction history
  const transactions = [
    {
      id: '1',
      type: 'deposit',
      token: 'stETH',
      amount: '25',
      timestamp: '2024-01-05T10:00:00Z',
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'borrow',
      token: 'USDC',
      amount: '25000',
      timestamp: '2024-01-05T11:00:00Z',
      status: 'confirmed'
    },
    {
      id: '3',
      type: 'repay',
      token: 'USDC',
      amount: '5000',
      timestamp: '2024-01-05T12:00:00Z',
      status: 'confirmed'
    }
  ].slice(0, parseInt(limit));

  res.json({
    success: true,
    data: transactions
  });
});

/**
 * @route GET /api/v1/users/top
 * @desc Get top users by TVL
 */
router.get('/top', (req, res) => {
  const { limit = 10 } = req.query;
  
  const topUsers = Object.values(mockUsers)
    .sort((a, b) => parseFloat(b.totalValue) - parseFloat(a.totalValue))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: topUsers
  });
});

module.exports = router; 