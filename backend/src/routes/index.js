const express = require('express');
const router = express.Router();

// Import route modules
const lendingRoutes = require('./lending');
const analyticsRoutes = require('./analytics');
const userRoutes = require('./users');

// Mount routes
router.use('/lending', lendingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'LendLink API v1',
    endpoints: {
      lending: '/lending',
      analytics: '/analytics',
      users: '/users'
    },
    documentation: 'https://docs.lendlink.com'
  });
});

module.exports = router; 