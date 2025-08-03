const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/v1/lending', require('./routes/lending'));
app.use('/api/v1/prime', require('./routes/prime'));
app.use('/api/v1/1inch', require('./routes/1inch'));
app.use('/api/v1/lst', require('./routes/lst'));
app.use('/api/v1/interest', require('./routes/interest'));
app.use('/api/v1/scheduler', require('./routes/scheduler'));
app.use('/api/v1/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 LendLink API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Lending API: http://localhost:${PORT}/api/v1/lending`);
  console.log(`🌐 Prime API: http://localhost:${PORT}/api/v1/prime`);
  console.log(`⚡ 1inch API: http://localhost:${PORT}/api/v1/1inch`);
  console.log(`💎 LST API: http://localhost:${PORT}/api/v1/lst`);
  console.log(`💰 Interest API: http://localhost:${PORT}/api/v1/interest`);
  console.log(`⏰ Scheduler API: http://localhost:${PORT}/api/v1/scheduler`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/v1/analytics`);
});

module.exports = app; 