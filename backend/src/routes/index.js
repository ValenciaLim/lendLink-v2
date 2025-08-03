const express = require('express');
const router = express.Router();

// Import route modules
const lendingRoutes = require('./lending');
const analyticsRoutes = require('./analytics');
const primeRoutes = require('./prime');
const oneInchRoutes = require('./1inch');

// Mount routes
router.use('/lending', lendingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/prime', primeRoutes);
router.use('/1inch', oneInchRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'LendLink API v1',
    endpoints: {
      lending: '/lending',
      analytics: '/analytics',
      prime: '/prime',
      '1inch': '/1inch'
    },
    documentation: 'https://docs.lendlink.com'
  });
});

module.exports = router; 