const express = require('express');
const router = express.Router();
const OneInchService = require('../services/1inch');

const oneInchService = new OneInchService();

// Mock loan interest rates
const mockLoanRates = {
  stETH: {
    collateralToken: 'stETH',
    borrowToken: 'USDC',
    interestRate: 0.08, // 8% APY
    ltv: 0.8, // 80% LTV
    liquidationThreshold: 0.85
  },
  rETH: {
    collateralToken: 'rETH',
    borrowToken: 'USDC',
    interestRate: 0.075, // 7.5% APY
    ltv: 0.75, // 75% LTV
    liquidationThreshold: 0.8
  }
};

// Mock user interest obligations
const mockUserObligations = {
  '0x1234567890123456789012345678901234567890': {
    loans: [
      {
        loanId: '0x1234567890123456789012345678901234567890123456789012345678901234',
        collateralToken: 'stETH',
        borrowToken: 'USDC',
        collateralAmount: '10.0',
        borrowAmount: '15000.0',
        interestOwed: '120.0', // 8% of 15000 over time
        lastInterestPayment: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        nextPaymentDue: new Date(Date.now() + 86400000).toISOString() // 1 day from now
      },
      {
        loanId: '0x5678901234567890123456789012345678901234567890123456789012345678',
        collateralToken: 'rETH',
        borrowToken: 'USDC',
        collateralAmount: '5.0',
        borrowAmount: '8000.0',
        interestOwed: '60.0', // 7.5% of 8000 over time
        lastInterestPayment: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        nextPaymentDue: new Date(Date.now() + 172800000).toISOString() // 2 days from now
      }
    ],
    totalInterestOwed: 180.0,
    totalLSTInterestEarned: 0.639 // From LST earnings
  }
};

/**
 * @route GET /api/v1/interest/loan-rates
 * @desc Get current loan interest rates
 */
router.get('/loan-rates', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockLoanRates
    });
  } catch (error) {
    console.error('Error getting loan rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loan rates',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/interest/user-obligations/:address
 * @desc Get user's interest obligations
 */
router.get('/user-obligations/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    const userObligations = mockUserObligations[address] || {
      loans: [],
      totalInterestOwed: 0,
      totalLSTInterestEarned: 0
    };

    res.json({
      success: true,
      data: {
        address,
        obligations: userObligations,
        canAutoRepay: userObligations.totalLSTInterestEarned >= userObligations.totalInterestOwed
      }
    });
  } catch (error) {
    console.error('Error getting user obligations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user obligations',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/interest/auto-settle
 * @desc Automatically settle interest using LST earnings
 */
router.post('/auto-settle', async (req, res) => {
  try {
    const { userAddress, loanId } = req.body;
    
    if (!userAddress || !loanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userAddress, loanId'
      });
    }

    const userObligations = mockUserObligations[userAddress];
    if (!userObligations) {
      return res.status(400).json({
        success: false,
        message: 'No obligations found for user'
      });
    }

    const loan = userObligations.loans.find(l => l.loanId === loanId);
    if (!loan) {
      return res.status(400).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Check if LST interest can cover loan interest
    if (userObligations.totalLSTInterestEarned < loan.interestOwed) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient LST interest to settle loan interest'
      });
    }

    // Get the LST token used as collateral for this loan
    const lstToken = loan.collateralToken; // stETH or rETH
    const settleAmount = loan.interestOwed;

    try {
      // Get swap quote for LST to USDC
      const quote = await oneInchService.getSwapQuote(
        lstToken,
        'USDC',
        settleAmount.toString(),
        1, // Ethereum mainnet
        { from: userAddress, slippage: 0.5 }
      );

      if (!quote) {
        return res.status(400).json({
          success: false,
          message: 'Failed to get swap quote for interest settlement'
        });
      }

      // Execute swap from LST interest to settle loan interest
      const swapData = {
        ...quote,
        from: userAddress,
        slippage: 0.5
      };

      const swapResult = await oneInchService.executeSwap(swapData, 1);

      // Update loan data after successful settlement
      const settledAmount = loan.interestOwed;
      loan.interestOwed = 0;
      loan.lastInterestPayment = new Date().toISOString();
      loan.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

      // Update total LST interest earned
      userObligations.totalLSTInterestEarned -= settledAmount;
      userObligations.totalInterestOwed -= settledAmount;

          res.json({
        success: true,
        message: 'Interest automatically settled using LST earnings',
        data: {
          loanId,
          settledAmount,
          remainingLSTInterest: userObligations.totalLSTInterestEarned,
          nextPaymentDue: loan.nextPaymentDue,
          transactionHash: swapResult.txHash,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error executing interest settlement swap:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute interest settlement',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error auto-settling interest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-settle interest',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/interest/auto-settle-status/:address
 * @desc Get automatic settlement status for user
 */
router.get('/auto-settle-status/:address', (req, res) => {
  try {
    const { address } = req.params;
    
    const userObligations = mockUserObligations[address];
    if (!userObligations) {
      return res.json({
        success: true,
        data: {
          address,
          autoSettleEnabled: false,
          canAutoSettle: false,
          totalInterestOwed: 0,
          totalLSTInterestEarned: 0
        }
      });
    }

    const canAutoSettle = userObligations.totalLSTInterestEarned >= userObligations.totalInterestOwed;

    res.json({
      success: true,
      data: {
        address,
        autoSettleEnabled: true, // Assuming user has enabled auto-settle
        canAutoSettle,
        totalInterestOwed: userObligations.totalInterestOwed,
        totalLSTInterestEarned: userObligations.totalLSTInterestEarned,
        savings: canAutoSettle ? userObligations.totalLSTInterestEarned - userObligations.totalInterestOwed : 0
      }
    });
  } catch (error) {
    console.error('Error getting auto-settle status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-settle status',
      error: error.message
    });
  }
});

module.exports = router; 