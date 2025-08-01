const express = require('express');
const router = express.Router();

// Mock analytics data
const mockAnalyticsData = {
  protocolStats: {
    totalTVL: '1000000',
    totalDebt: '500000',
    utilizationRate: '0.5',
    activeUsers: 150,
    totalTransactions: 1250
  },
  tokenStats: {
    stETH: {
      tvl: '600000',
      borrows: '300000',
      utilization: '0.5'
    },
    rETH: {
      tvl: '400000',
      borrows: '200000',
      utilization: '0.5'
    }
  },
  recentActivity: [
    {
      type: 'deposit',
      user: '0x123...',
      token: 'stETH',
      amount: '10',
      timestamp: new Date().toISOString()
    },
    {
      type: 'borrow',
      user: '0x456...',
      token: 'USDC',
      amount: '5000',
      timestamp: new Date().toISOString()
    }
  ]
};

/**
 * @route GET /api/v1/analytics/overview
 * @desc Get protocol analytics overview
 */
router.get('/overview', (req, res) => {
  res.json({
    success: true,
    data: mockAnalyticsData
  });
});

/**
 * @route GET /api/v1/analytics/tvl
 * @desc Get TVL history
 */
router.get('/tvl', (req, res) => {
  const tvlHistory = [
    { date: '2024-01-01', value: '800000' },
    { date: '2024-01-02', value: '850000' },
    { date: '2024-01-03', value: '900000' },
    { date: '2024-01-04', value: '950000' },
    { date: '2024-01-05', value: '1000000' }
  ];

  res.json({
    success: true,
    data: tvlHistory
  });
});

/**
 * @route GET /api/v1/analytics/debt
 * @desc Get debt history
 */
router.get('/debt', (req, res) => {
  const debtHistory = [
    { date: '2024-01-01', value: '400000' },
    { date: '2024-01-02', value: '420000' },
    { date: '2024-01-03', value: '450000' },
    { date: '2024-01-04', value: '480000' },
    { date: '2024-01-05', value: '500000' }
  ];

  res.json({
    success: true,
    data: debtHistory
  });
});

/**
 * @route GET /api/v1/analytics/users
 * @desc Get user statistics
 */
router.get('/users', (req, res) => {
  const userStats = {
    totalUsers: 150,
    activeUsers: 120,
    newUsersThisWeek: 15,
    topUsers: [
      { address: '0x123...', tvl: '50000' },
      { address: '0x456...', tvl: '45000' },
      { address: '0x789...', tvl: '40000' }
    ]
  };

  res.json({
    success: true,
    data: userStats
  });
});

/**
 * @route GET /api/v1/analytics/activity
 * @desc Get recent activity
 */
router.get('/activity', (req, res) => {
  const { limit = 10 } = req.query;
  
  const activities = mockAnalyticsData.recentActivity.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: activities
  });
});

module.exports = router; 