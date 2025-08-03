# LendLink 1inch API Integration

This document outlines the comprehensive integration of 1inch APIs into the LendLink application, providing access to swap protocols, data APIs, and Web3 functionality.

## 🚀 Overview

LendLink now integrates with 1inch's comprehensive suite of APIs to provide:
- **Swap Functionality**: Cross-chain swaps, limit orders, and classic swaps
- **Data APIs**: Real-time price feeds, wallet balances, and token metadata
- **Web3 APIs**: Transaction status, gas prices, and blockchain data

## 📋 Prerequisites

1. **1inch API Key**: Get your API key from [1inch Portal](https://portal.1inch.dev/)
2. **Environment Setup**: Add your API key to `.env` file
3. **Backend Dependencies**: Ensure all required packages are installed

## 🔧 Setup

### 1. Environment Configuration

Add to your `.env` file:
```bash
# 1inch API Integration
ONEINCH_API_KEY=your_1inch_api_key_here
```

### 2. Backend Installation

```bash
cd backend
npm install
```

### 3. Frontend Installation

```bash
cd frontend
npm install
```

## 🏗️ Architecture

### Backend Structure

```
backend/
├── src/
│   ├── services/
│   │   └── 1inch.js          # 1inch API service
│   └── routes/
│       ├── 1inch.js          # 1inch API routes
│       └── prime.js          # Updated with 1inch integration
```

### Frontend Structure

```
frontend/
├── src/
│   └── hooks/
│       └── use1inch.ts       # 1inch React hook
```

## 🔌 API Endpoints

### Swap APIs

#### Get Swap Quote
```http
GET /api/v1/1inch/quote?srcToken=0x...&dstToken=0x...&amount=1000000000000000000&chainId=1
```

#### Execute Swap
```http
POST /api/v1/1inch/swap
Content-Type: application/json

{
  "swapData": {
    "src": "0x...",
    "dst": "0x...",
    "amount": "1000000000000000000",
    "from": "0x...",
    "slippage": 0.5
  },
  "chainId": 1
}
```

#### Limit Order Quote
```http
GET /api/v1/1inch/limit-order/quote?srcToken=0x...&dstToken=0x...&amount=1000000000000000000&chainId=1
```

#### Create Limit Order
```http
POST /api/v1/1inch/limit-order
Content-Type: application/json

{
  "orderData": {
    "src": "0x...",
    "dst": "0x...",
    "amount": "1000000000000000000",
    "limitPrice": "2000"
  },
  "chainId": 1
}
```

### Data APIs

#### Get Token Price
```http
GET /api/v1/1inch/price/0x...?chainId=1
```

#### Get Wallet Balances
```http
GET /api/v1/1inch/balances/0x...?chainId=1
```

#### Get Token Metadata
```http
GET /api/v1/1inch/token/metadata/0x...?chainId=1
```

#### Get Supported Tokens
```http
GET /api/v1/1inch/tokens?chainId=1
```

### Web3 APIs

#### Get Transaction Status
```http
GET /api/v1/1inch/transaction/0x...?chainId=1
```

#### Get Gas Price
```http
GET /api/v1/1inch/gas-price?chainId=1
```

#### Get Block Information
```http
GET /api/v1/1inch/block/0x...?chainId=1
```

### Cross-Chain APIs

#### Get Cross-Chain Swap Quote
```http
GET /api/v1/1inch/cross-chain/quote?srcToken=0x...&dstToken=0x...&amount=1000000000000000000&srcChainId=1&dstChainId=137
```

#### Execute Cross-Chain Swap
```http
POST /api/v1/1inch/cross-chain/swap
Content-Type: application/json

{
  "swapData": {
    "src": "0x...",
    "dst": "0x...",
    "amount": "1000000000000000000",
    "srcChainId": 1,
    "dstChainId": 137
  }
}
```

### Utility APIs

#### Get Supported Chains
```http
GET /api/v1/1inch/chains
```

#### Get Protocols
```http
GET /api/v1/1inch/protocols?chainId=1
```

#### Get Liquidity Sources
```http
GET /api/v1/1inch/liquidity-sources?chainId=1
```

#### Validate Transaction
```http
POST /api/v1/1inch/validate
Content-Type: application/json

{
  "txData": {
    "to": "0x...",
    "data": "0x...",
    "value": "0"
  },
  "chainId": 1
}
```

## 🎣 Frontend Usage

### React Hook

```typescript
import { use1inch } from '../hooks/use1inch';

const MyComponent = () => {
  const {
    loading,
    error,
    getSwapQuote,
    executeSwap,
    getTokenPrice,
    getWalletBalances,
    getCrossChainSwapQuote,
    executeCrossChainSwap,
    clearError
  } = use1inch();

  // Get swap quote
  const handleGetQuote = async () => {
    const quote = await getSwapQuote(
      '0x...', // srcToken
      '0x...', // dstToken
      '1000000000000000000', // amount
      1 // chainId
    );
    
    if (quote) {
      console.log('Quote:', quote);
    }
  };

  // Execute swap
  const handleExecuteSwap = async () => {
    const result = await executeSwap(swapData, 1);
    
    if (result?.success) {
      console.log('Swap executed:', result.txHash);
    }
  };

  // Get token price
  const handleGetPrice = async () => {
    const price = await getTokenPrice('0x...', 1);
    
    if (price) {
      console.log('Price:', price);
    }
  };

  // Get wallet balances
  const handleGetBalances = async () => {
    const balances = await getWalletBalances('0x...', 1);
    
    if (balances) {
      console.log('Balances:', balances);
    }
  };

  // Cross-chain swap
  const handleCrossChainSwap = async () => {
    const quote = await getCrossChainSwapQuote(
      '0x...', // srcToken
      '0x...', // dstToken
      '1000000000000000000', // amount
      1, // srcChainId
      137 // dstChainId
    );
    
    if (quote) {
      const result = await executeCrossChainSwap(quote);
      if (result?.success) {
        console.log('Cross-chain swap executed:', result.txHash);
      }
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <button onClick={handleGetQuote}>Get Quote</button>
      <button onClick={handleExecuteSwap}>Execute Swap</button>
      <button onClick={handleGetPrice}>Get Price</button>
      <button onClick={handleGetBalances}>Get Balances</button>
      <button onClick={handleCrossChainSwap}>Cross-Chain Swap</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};
```

## 🔄 Integration Points

### 1. Swap Functionality

LendLink integrates 1inch's swap protocols for:
- **Classic Swap**: Standard token swaps
- **Fusion Swap**: Intent-based swaps with MEV protection
- **Cross-Chain Swap**: Swaps across different blockchains
- **Limit Orders**: Time-based order execution

### 2. Data Sources

1inch provides real-time data for:
- **Price Feeds**: Accurate token prices across all supported chains
- **Wallet Balances**: Real-time balance tracking
- **Token Metadata**: Complete token information
- **Market Data**: Liquidity and volume information

### 3. Web3 Integration

Blockchain interaction through:
- **Transaction Status**: Real-time transaction monitoring
- **Gas Price**: Dynamic gas estimation
- **Block Information**: Blockchain data access
- **Transaction Validation**: Pre-execution validation

## 🛡️ Security Features

### 1. API Key Management
- Secure storage in environment variables
- Never exposed in client-side code
- Rate limiting and usage monitoring

### 2. Transaction Validation
- Pre-execution validation
- Slippage protection
- MEV protection through Fusion

### 3. Error Handling
- Comprehensive error messages
- Fallback mechanisms
- Retry logic for failed requests

## 📊 Monitoring & Analytics

### 1. API Usage Tracking
- Request/response logging
- Performance metrics
- Error rate monitoring

### 2. Transaction Monitoring
- Real-time status updates
- Gas cost tracking
- Success/failure rates

### 3. User Analytics
- Swap volume tracking
- Popular token pairs
- Cross-chain usage patterns

## 🚀 Deployment

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Add your 1inch API key
echo "ONEINCH_API_KEY=your_api_key_here" >> .env
```

### 2. Backend Deployment
```bash
cd backend
npm install
npm run build
npm start
```

### 3. Frontend Deployment
```bash
cd frontend
npm install
npm run build
npm start
```

## 🔧 Configuration

### Supported Chains
- Ethereum (1)
- Polygon (137)
- Arbitrum (42161)
- Etherlink (128123)
- And many more...

### Default Settings
- Default slippage: 0.5%
- Default gas limit: 200,000
- Default timeout: 30 seconds

## 📚 Additional Resources

- [1inch API Documentation](https://portal.1inch.dev/documentation/overview)
- [1inch Portal](https://portal.1inch.dev/)
- [LendLink Documentation](https://docs.lendlink.com)

## 🤝 Support

For issues related to:
- **1inch API**: Contact 1inch support
- **LendLink Integration**: Open an issue in this repository
- **General Questions**: Check the documentation or create a discussion

## 📄 License

This integration is part of the LendLink project and follows the same licensing terms. 