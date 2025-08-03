const express = require('express');
const router = express.Router();
const OneInchService = require('../services/1inch');

const oneInchService = new OneInchService();

// Mock LST yield data (in real implementation, this would come from Lido, Rocket Pool, etc.)
const mockLSTYieldRates = {
  stETH: {
    symbol: 'stETH',
    name: 'Liquid staked Ether',
    yieldRate: 0.042, // 4.2% APY
    protocol: 'Lido',
    lastUpdate: new Date().toISOString()
  },
  rETH: {
    symbol: 'rETH',
    name: 'Rocket Pool ETH',
    yieldRate: 0.038, // 3.8% APY
    protocol: 'Rocket Pool',
    lastUpdate: new Date().toISOString()
  }
};

// Mock user LST earnings data
const mockUserEarnings = {
  '0x1234567890123456789012345678901234567890': {
    stETH: {
      balance: '10.5',
      earnedInterest: '0.441', // 4.2% of 10.5 over time
      lastClaimed: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    rETH: {
      balance: '5.2',
      earnedInterest: '0.198', // 3.8% of 5.2 over time
      lastClaimed: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  }
};

/**
 * @route GET /api/v1/lst/yield-rates
 * @desc Get current LST yield rates from various protocols
 */
router.get('/yield-rates', async (req, res) => {
  try {
    // In real implementation, fetch from Lido, Rocket Pool APIs
    res.json({
      success: true,
      data: mockLSTYieldRates
    });
  } catch (error) {
    console.error('Error getting LST yield rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get LST yield rates',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/lst/user-earnings/:address
 * @desc Get user's LST earnings and interest
 */
router.get('/user-earnings/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const userEarnings = mockUserEarnings[address] || {
      stETH: { balance: '0', earnedInterest: '0', lastClaimed: null },
      rETH: { balance: '0', earnedInterest: '0', lastClaimed: null }
    };

    res.json({
      success: true,
      data: {
        address,
        earnings: userEarnings,
        totalEarnedInterest: parseFloat(userEarnings.stETH.earnedInterest) + parseFloat(userEarnings.rETH.earnedInterest)
      }
    });
  } catch (error) {
    console.error('Error getting user LST earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user LST earnings',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/lst/auto-repay
 * @desc Trigger automatic repayment using LST interest
 */
router.post('/auto-repay', async (req, res) => {
  try {
    const { userAddress, loanId, lstToken, amount } = req.body;
    
    if (!userAddress || !loanId || !lstToken || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userAddress, loanId, lstToken, amount'
      });
    }

    // Get user's LST earnings
    const userEarnings = mockUserEarnings[userAddress];
    if (!userEarnings || !userEarnings[lstToken]) {
      return res.status(400).json({
        success: false,
        message: 'No LST earnings found for user'
      });
    }

    const earnedInterest = parseFloat(userEarnings[lstToken].earnedInterest);
    const repayAmount = parseFloat(amount);

    if (earnedInterest < repayAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient LST interest to repay loan interest'
      });
    }

    // Get swap quote first
    const quote = await oneInchService.getSwapQuote(
      lstToken,
      'USDC', // Assuming loan interest is paid in USDC
      repayAmount.toString(),
      1, // Ethereum mainnet
      { from: userAddress, slippage: 0.5 }
    );

    if (!quote) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get swap quote'
      });
    }

    // Execute swap from LST interest to repay loan interest
    const swapData = {
      ...quote,
      from: userAddress,
      slippage: 0.5
    };

    // Use 1inch API to execute the swap
    const swapResult = await oneInchService.executeSwap(swapData, 1); // Ethereum mainnet

    // Update user earnings
    userEarnings[lstToken].earnedInterest = (earnedInterest - repayAmount).toString();
    userEarnings[lstToken].lastClaimed = new Date().toISOString();

    res.json({
      success: true,
      message: 'Automatic repayment executed successfully',
      data: {
        loanId,
        lstToken,
        repaidAmount: repayAmount,
        remainingInterest: userEarnings[lstToken].earnedInterest,
        transactionHash: swapResult.txHash,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error executing auto-repay:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute auto-repay',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/lst/protocols
 * @desc Get supported LST protocols
 */
router.get('/protocols', (req, res) => {
  const protocols = [
    {
      name: 'Lido Finance',
      symbol: 'stETH',
      description: 'Liquid staking for Ethereum',
      website: 'https://lido.fi',
      yieldRate: 0.042
    },
    {
      name: 'Rocket Pool',
      symbol: 'rETH',
      description: 'Decentralized Ethereum staking',
      website: 'https://rocketpool.net',
      yieldRate: 0.038
    }
  ];

  res.json({
    success: true,
    data: protocols
  });
});

module.exports = router; 