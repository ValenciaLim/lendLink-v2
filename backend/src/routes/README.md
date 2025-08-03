# Backend Routes Documentation

This document outlines the route structure and purpose of each endpoint in the LendLink backend API.

## Route Structure

### `/api/v1/lending` - Core Lending Protocol
- **Purpose**: Basic lending functionality (deposits, borrows, user positions)
- **Key Endpoints**:
  - `GET /overview` - Protocol overview and statistics
  - `GET /user/:address` - User lending position
  - `POST /deposit` - Deposit collateral
  - `POST /borrow` - Borrow assets

### `/api/v1/analytics` - Protocol Analytics
- **Purpose**: Dashboard analytics and protocol statistics
- **Key Endpoints**:
  - `GET /overview` - Analytics overview
  - `GET /tvl` - TVL history
  - `GET /debt` - Debt history
  - `GET /users` - User statistics



### `/api/v1/prime` - Cross-Chain Lending (LendLink Prime)
- **Purpose**: Cross-chain lending functionality with 1inch integration
- **Key Endpoints**:
  - `GET /overview` - Prime protocol overview
  - `GET /supported-tokens` - Get supported tokens
  - `POST /execute-cross-chain-swap` - Execute cross-chain swap for lending

### `/api/v1/1inch` - General 1inch API Integration
- **Purpose**: Comprehensive 1inch API functionality for general use
- **Key Endpoints**:
  - `GET /quote` - Get general swap quote
  - `POST /swap` - Execute general swap
  - `GET /price/:tokenAddress` - Get token price
  - `GET /balances/:walletAddress` - Get wallet balances
  - `GET /token/metadata/:tokenAddress` - Get token metadata
  - `GET /tokens` - Get supported tokens
  - `GET /cross-chain/quote` - Get cross-chain quote
  - `POST /cross-chain/swap` - Execute cross-chain swap
  - `GET /transaction/:txHash` - Get transaction status
  - `GET /gas-price` - Get gas price
  - `GET /chains` - Get supported chains

## Route Differentiation

### Quote Routes
- **`/1inch/quote`**: General swap quotes
  - Requires: `srcToken`, `dstToken`, `amount`, `chainId`
  - Returns: Standard swap quote

### Swap Routes
- **`/prime/execute-cross-chain-swap`**: Cross-chain swaps for lending
  - Requires: `srcChainId`, `dstChainId`, `loanId`
  - Purpose: Lending-specific cross-chain swaps
- **`/1inch/swap`**: General swap execution
  - Requires: `swapData`, `chainId`
  - Purpose: General swap functionality

## Usage Guidelines

1. **For Lending Operations**: Use `/prime/*` routes
2. **For General Swaps**: Use `/1inch/*` routes
3. **For Analytics**: Use `/analytics/*` routes
4. **For Core Lending**: Use `/lending/*` routes

## API Versioning

All routes are prefixed with `/api/v1/` for versioning support.

## Error Handling

All routes follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Authentication

Currently using mock data. Future implementation will include proper authentication middleware. 