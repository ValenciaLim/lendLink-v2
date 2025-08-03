import { useState, useCallback } from 'react';
import axios from 'axios';

interface SwapQuote {
  srcToken: string;
  dstToken: string;
  srcAmount: string;
  dstAmount: string;
  gasEstimate: string;
  route: any[];
}

interface TokenPrice {
  price: string;
  timestamp: number;
}

interface WalletBalance {
  tokenAddress: string;
  balance: string;
  symbol: string;
  decimals: number;
}

interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface SwapResult {
  txHash: string;
  success: boolean;
  error?: string;
}

export const use1inch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3002/api/v1';

  // ===== SWAP FUNCTIONS =====

  const getSwapQuote = useCallback(async (
    srcToken: string,
    dstToken: string,
    amount: string,
    chainId: number = 1,
    from?: string,
    slippage?: number
  ): Promise<SwapQuote | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        srcToken,
        dstToken,
        amount,
        chainId: chainId.toString(),
        ...(from && { from }),
        ...(slippage && { slippage: slippage.toString() })
      });

      const response = await axios.get(`${API_BASE_URL}/1inch/quote?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get swap quote');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get swap quote';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeSwap = useCallback(async (
    swapData: any,
    chainId: number = 1
  ): Promise<SwapResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/1inch/swap`, {
        swapData,
        chainId
      });

      if (response.data.success) {
        return {
          txHash: response.data.data.txHash,
          success: true
        };
      } else {
        throw new Error(response.data.message || 'Failed to execute swap');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to execute swap';
      setError(errorMessage);
      return {
        txHash: '',
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== PRICE FUNCTIONS =====

  const getTokenPrice = useCallback(async (
    tokenAddress: string,
    chainId: number = 1
  ): Promise<TokenPrice | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/price/${tokenAddress}?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get token price');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get token price';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== BALANCE FUNCTIONS =====

  const getWalletBalances = useCallback(async (
    walletAddress: string,
    chainId: number = 1
  ): Promise<WalletBalance[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/balances/${walletAddress}?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get wallet balances');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get wallet balances';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== TOKEN FUNCTIONS =====

  const getTokenMetadata = useCallback(async (
    tokenAddress: string,
    chainId: number = 1
  ): Promise<TokenMetadata | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/token/metadata/${tokenAddress}?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get token metadata');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get token metadata';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSupportedTokens = useCallback(async (
    chainId: number = 1
  ): Promise<any[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/tokens?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get supported tokens');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get supported tokens';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== CROSS-CHAIN FUNCTIONS =====

  const getCrossChainSwapQuote = useCallback(async (
    srcToken: string,
    dstToken: string,
    amount: string,
    srcChainId: number,
    dstChainId: number
  ): Promise<SwapQuote | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        srcToken,
        dstToken,
        amount,
        srcChainId: srcChainId.toString(),
        dstChainId: dstChainId.toString()
      });

      const response = await axios.get(`${API_BASE_URL}/1inch/cross-chain/quote?${params}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get cross-chain swap quote');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get cross-chain swap quote';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const executeCrossChainSwap = useCallback(async (
    swapData: any
  ): Promise<SwapResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/1inch/cross-chain/swap`, {
        swapData
      });

      if (response.data.success) {
        return {
          txHash: response.data.data.txHash,
          success: true
        };
      } else {
        throw new Error(response.data.message || 'Failed to execute cross-chain swap');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to execute cross-chain swap';
      setError(errorMessage);
      return {
        txHash: '',
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== UTILITY FUNCTIONS =====

  const getSupportedChains = useCallback(async (): Promise<any[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/chains`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get supported chains');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get supported chains';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGasPrice = useCallback(async (
    chainId: number = 1
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/gas-price?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data.gasPrice;
      } else {
        throw new Error(response.data.message || 'Failed to get gas price');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get gas price';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactionStatus = useCallback(async (
    txHash: string,
    chainId: number = 1
  ): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/1inch/transaction/${txHash}?chainId=${chainId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get transaction status');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get transaction status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Swap functions
    getSwapQuote,
    executeSwap,
    
    // Price functions
    getTokenPrice,
    
    // Balance functions
    getWalletBalances,
    
    // Token functions
    getTokenMetadata,
    getSupportedTokens,
    
    // Cross-chain functions
    getCrossChainSwapQuote,
    executeCrossChainSwap,
    
    // Utility functions
    getSupportedChains,
    getGasPrice,
    getTransactionStatus,
    
    // Error handling
    clearError
  };
}; 