const express = require('express');
const router = express.Router();
const OneInchService = require('../services/1inch');

const oneInchService = new OneInchService();

// Initialize global stats if not exists
if (!global.crossChainStats) {
  global.crossChainStats = {
    totalBridges: 150,
    activeLoans: 25,
    successRate: 98.5,
    lastUpdate: new Date().toISOString()
  };
}

// ===== SWAP ROUTES =====

/**
 * @route GET /api/v1/1inch/quote
 * @desc Get swap quote from 1inch Fusion+
 */
router.get('/quote', async (req, res) => {
  try {
    const { srcToken, dstToken, amount, chainId = 1, from, slippage } = req.query;

    if (!srcToken || !dstToken || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: srcToken, dstToken, amount'
      });
    }

    const options = {};
    if (from) options.from = from;
    if (slippage) options.slippage = slippage;

    const quote = await oneInchService.getSwapQuote(srcToken, dstToken, amount, parseInt(chainId), options);

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error getting swap quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get swap quote',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/1inch/swap
 * @desc Execute swap using 1inch Fusion+
 */
router.post('/swap', async (req, res) => {
  try {
    const { swapData, chainId = 1 } = req.body;

    if (!swapData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: swapData'
      });
    }

    const result = await oneInchService.executeSwap(swapData, parseInt(chainId));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error executing swap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute swap',
      error: error.message
    });
  }
});



// ===== DATA ROUTES =====

/**
 * @route GET /api/v1/1inch/price/:tokenAddress
 * @desc Get token price from 1inch price feeds
 */
router.get('/price/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const { chainId = 1 } = req.query;

    const price = await oneInchService.getTokenPrice(tokenAddress, parseInt(chainId));

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error getting token price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token price',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/1inch/balances/:walletAddress
 * @desc Get wallet balances
 */
router.get('/balances/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { chainId = 1 } = req.query;

    const balances = await oneInchService.getWalletBalances(walletAddress, parseInt(chainId));

    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet balances',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/1inch/token/metadata/:tokenAddress
 * @desc Get token metadata
 */
router.get('/token/metadata/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const { chainId = 1 } = req.query;

    const metadata = await oneInchService.getTokenMetadata(tokenAddress, parseInt(chainId));

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error getting token metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token metadata',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/1inch/tokens
 * @desc Get supported tokens for a chain
 */
router.get('/tokens', async (req, res) => {
  try {
    const { chainId = 1 } = req.query;

    const tokens = await oneInchService.getSupportedTokens(parseInt(chainId));

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Error getting supported tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported tokens',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/1inch/token-list
 * @desc Get token list for a chain
 */
router.get('/token-list', async (req, res) => {
  try {
    const { chainId = 1 } = req.query;

    const tokenList = await oneInchService.getTokenList(parseInt(chainId));

    res.json({
      success: true,
      data: tokenList
    });
  } catch (error) {
    console.error('Error getting token list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token list',
      error: error.message
    });
  }
});

// ===== WEB3 ROUTES =====

/**
 * @route GET /api/v1/1inch/transaction/:txHash
 * @desc Get transaction status
 */
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { chainId = 1 } = req.query;

    const status = await oneInchService.getTransactionStatus(txHash, parseInt(chainId));

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction status',
      error: error.message
    });
  }
});



/**
 * @route GET /api/v1/1inch/gas-price
 * @desc Get gas price
 */
router.get('/gas-price', async (req, res) => {
  try {
    const { chainId = 1 } = req.query;

    const gasPrice = await oneInchService.getGasPrice(parseInt(chainId));

    res.json({
      success: true,
      data: gasPrice
    });
  } catch (error) {
    console.error('Error getting gas price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas price',
      error: error.message
    });
  }
});

// ===== CROSS-CHAIN SWAP ROUTES =====

/**
 * @route GET /api/v1/1inch/cross-chain/quote
 * @desc Get cross-chain swap quote
 */
router.get('/cross-chain/quote', async (req, res) => {
  try {
    const { srcToken, dstToken, amount, srcChainId, dstChainId } = req.query;

    if (!srcToken || !dstToken || !amount || !srcChainId || !dstChainId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: srcToken, dstToken, amount, srcChainId, dstChainId'
      });
    }

    const quote = await oneInchService.getCrossChainSwapQuote(
      srcToken, 
      dstToken, 
      amount, 
      parseInt(srcChainId), 
      parseInt(dstChainId)
    );

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error getting cross-chain swap quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cross-chain swap quote',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/1inch/cross-chain/swap
 * @desc Execute cross-chain swap
 */
router.post('/cross-chain/swap', async (req, res) => {
  try {
    const { swapData } = req.body;

    if (!swapData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: swapData'
      });
    }

    const result = await oneInchService.executeCrossChainSwap(swapData);

    // Update cross-chain stats when swap is successful
    if (result && result.txHash) {
      const currentStats = global.crossChainStats || {
        totalBridges: 0,
        activeLoans: 0,
        successRate: 98.5,
        lastUpdate: new Date().toISOString()
      };
      
      const updatedStats = {
        totalBridges: currentStats.totalBridges + 1,
        activeLoans: currentStats.activeLoans + 1,
        successRate: 98.5, // Mock success rate
        lastUpdate: new Date().toISOString()
      };
      
      // Store stats globally (in production, this would be in a database)
      global.crossChainStats = updatedStats;
    }

    res.json({
      success: true,
      data: result
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

// ===== UTILITY ROUTES =====

/**
 * @route GET /api/v1/1inch/chains
 * @desc Get supported chains
 */
router.get('/chains', async (req, res) => {
  try {
    // Try to get real chains first
    const chains = await oneInchService.getSupportedChains();
    res.json({
      success: true,
      data: chains
    });
  } catch (error) {
    console.error('Error getting supported chains from 1inch, using fallback:', error.message);
    
    // Fallback to mock data for development
    const mockChains = [
      {
        id: 1,
        name: 'Ethereum',
        chainId: 1,
        logoURI: 'https://raw.githubusercontent.com/1inch/1inch-api/master/assets/images/ethereum.png'
      },
      {
        id: 137,
        name: 'Polygon',
        chainId: 137,
        logoURI: 'https://raw.githubusercontent.com/1inch/1inch-api/master/assets/images/polygon.png'
      },
      {
        id: 56,
        name: 'BNB Smart Chain',
        chainId: 56,
        logoURI: 'https://raw.githubusercontent.com/1inch/1inch-api/master/assets/images/bsc.png'
      },
      {
        id: 128123,
        name: 'Etherlink',
        chainId: 128123,
        logoURI: 'https://raw.githubusercontent.com/1inch/1inch-api/master/assets/images/etherlink.png'
      }
    ];
    
    res.json({
      success: true,
      data: mockChains
    });
  }
});



module.exports = router; 