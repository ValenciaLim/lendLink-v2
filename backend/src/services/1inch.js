const axios = require('axios');
const { ethers } = require('ethers');

class OneInchService {
  constructor() {
    this.baseURL = 'https://api.1inch.dev';
    this.apiKey = process.env.ONEINCH_API_KEY;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  // ===== SWAP APIs =====

  /**
   * Get swap quote from 1inch Fusion+
   * @param {string} srcToken - Source token address
   * @param {string} dstToken - Destination token address
   * @param {string} amount - Amount to swap
   * @param {number} chainId - Chain ID
   * @param {object} options - Additional options
   */
  async getSwapQuote(srcToken, dstToken, amount, chainId = 1, options = {}) {
    try {
      const params = {
        src: srcToken,
        dst: dstToken,
        amount: amount,
        from: options.from || '0x0000000000000000000000000000000000000000',
        ...options
      };

      const response = await axios.get(
        `${this.baseURL}/swap/v6.0/${chainId}/quote`,
        { headers: this.headers, params }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting swap quote:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute swap using 1inch Fusion+
   * @param {object} swapData - Swap transaction data
   * @param {number} chainId - Chain ID
   */
  async executeSwap(swapData, chainId = 1) {
    try {
      const response = await axios.post(
        `${this.baseURL}/swap/v6.0/${chainId}/swap`,
        swapData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error executing swap:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get limit order quote
   * @param {string} srcToken - Source token address
   * @param {string} dstToken - Destination token address
   * @param {string} amount - Amount to swap
   * @param {number} chainId - Chain ID
   */
  async getLimitOrderQuote(srcToken, dstToken, amount, chainId = 1) {
    try {
      const params = {
        src: srcToken,
        dst: dstToken,
        amount: amount
      };

      const response = await axios.get(
        `${this.baseURL}/limit-order/v3.0/${chainId}/quote`,
        { headers: this.headers, params }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting limit order quote:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create limit order
   * @param {object} orderData - Order data
   * @param {number} chainId - Chain ID
   */
  async createLimitOrder(orderData, chainId = 1) {
    try {
      const response = await axios.post(
        `${this.baseURL}/limit-order/v3.0/${chainId}/order`,
        orderData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating limit order:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== DATA APIs =====

  /**
   * Get token price from 1inch price feeds
   * @param {string} tokenAddress - Token address
   * @param {number} chainId - Chain ID
   */
  async getTokenPrice(tokenAddress, chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/price/v1.1/${chainId}/${tokenAddress}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting token price:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get wallet balances
   * @param {string} walletAddress - Wallet address
   * @param {number} chainId - Chain ID
   */
  async getWalletBalances(walletAddress, chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/balance/v1.2/${chainId}/balances/${walletAddress}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting wallet balances:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get token metadata
   * @param {string} tokenAddress - Token address
   * @param {number} chainId - Chain ID
   */
  async getTokenMetadata(tokenAddress, chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/token/v1.2/${chainId}/metadata/${tokenAddress}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting token metadata:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get supported tokens for a chain
   * @param {number} chainId - Chain ID
   */
  async getSupportedTokens(chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/token/v1.2/${chainId}/tokens`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting supported tokens:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get token list for a chain
   * @param {number} chainId - Chain ID
   */
  async getTokenList(chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/token/v1.2/${chainId}/token-list`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting token list:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== WEB3 API =====

  /**
   * Get transaction status
   * @param {string} txHash - Transaction hash
   * @param {number} chainId - Chain ID
   */
  async getTransactionStatus(txHash, chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/web3/v1.0/${chainId}/transaction/${txHash}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get block information
   * @param {string} blockHash - Block hash
   * @param {number} chainId - Chain ID
   */
  async getBlockInfo(blockHash, chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/web3/v1.0/${chainId}/block/${blockHash}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting block info:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get gas price
   * @param {number} chainId - Chain ID
   */
  async getGasPrice(chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/web3/v1.0/${chainId}/gas-price`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting gas price:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== CROSS-CHAIN SWAP APIs =====

  /**
   * Get cross-chain swap quote
   * @param {string} srcToken - Source token address
   * @param {string} dstToken - Destination token address
   * @param {string} amount - Amount to swap
   * @param {number} srcChainId - Source chain ID
   * @param {number} dstChainId - Destination chain ID
   */
  async getCrossChainSwapQuote(srcToken, dstToken, amount, srcChainId, dstChainId) {
    try {
      const params = {
        src: srcToken,
        dst: dstToken,
        amount: amount,
        srcChainId: srcChainId,
        dstChainId: dstChainId
      };

      const response = await axios.get(
        `${this.baseURL}/fusion/v1.0/quote`,
        { headers: this.headers, params }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting cross-chain swap quote:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Execute cross-chain swap
   * @param {object} swapData - Cross-chain swap data
   */
  async executeCrossChainSwap(swapData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/fusion/v1.0/swap`,
        swapData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error executing cross-chain swap:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get supported chains
   */
  async getSupportedChains() {
    try {
      const response = await axios.get(
        `${this.baseURL}/chain/v1.0/chains`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting supported chains:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get protocol information
   * @param {number} chainId - Chain ID
   */
  async getProtocols(chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/swap/v6.0/${chainId}/protocols`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting protocols:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get liquidity sources
   * @param {number} chainId - Chain ID
   */
  async getLiquiditySources(chainId = 1) {
    try {
      const response = await axios.get(
        `${this.baseURL}/swap/v6.0/${chainId}/liquidity-sources`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting liquidity sources:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Validate transaction before execution
   * @param {object} txData - Transaction data
   * @param {number} chainId - Chain ID
   */
  async validateTransaction(txData, chainId = 1) {
    try {
      const response = await axios.post(
        `${this.baseURL}/web3/v1.0/${chainId}/validate`,
        txData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error validating transaction:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = OneInchService; 