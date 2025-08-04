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
  - `POST /repay` - Repay debt
  - `GET /health-factor/:address` - Get user health factor

### `/api/v1/analytics` - Protocol Analytics
- **Purpose**: Dashboard analytics and protocol statistics
- **Key Endpoints**:
  - `GET /overview` - Analytics overview
  - `GET /tvl` - TVL history
  - `GET /debt` - Debt history
  - `GET /users` - User statistics
  - `GET /cross-chain-stats` - Cross-chain protocol statistics

### `/api/v1/prime` - Cross-Chain Lending (LendLink Prime)
- **Purpose**: Cross-chain lending functionality with 1inch integration
- **Key Endpoints**:
  - `GET /overview` - Prime protocol overview
  - `GET /supported-tokens` - Get supported tokens
  - `GET /supported-chains` - Get supported blockchain networks
  - `POST /initiate-loan` - Start cross-chain loan
  - `POST /execute-cross-chain-swap` - Execute cross-chain swap for lending
  - `GET /loan/:loanId` - Get cross-chain loan details
  - `POST /repay-loan` - Repay cross-chain loan

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

### `/api/v1/pyth` - Pyth Network Price Feeds
- **Purpose**: Real-time price feeds for DeFi operations
- **Key Endpoints**:
  - `GET /prices` - Get all supported token prices
  - `GET /price/:symbol` - Get specific token price (ETH, stETH, rETH)
  - `GET /price-feeds` - Get available price feed IDs
  - `GET /status` - Get price feed status and health
  - `POST /validate-price` - Validate price feed data

### `/api/v1/lst` - Liquid Staking Token Management
- **Purpose**: LST yield tracking and automatic interest management
- **Key Endpoints**:
  - `GET /yield-rates` - Get current LST yield rates
  - `GET /user-earnings/:address` - Get user's LST earnings
  - `POST /auto-repay` - Trigger automatic repayment using LST interest
  - `GET /protocols` - Get supported LST protocols
  - `GET /steth-price` - Get stETH real-time price
  - `GET /reth-price` - Get rETH real-time price

### `/api/v1/interest` - Interest Management
- **Purpose**: Loan interest rates and automatic settlement
- **Key Endpoints**:
  - `GET /loan-rates` - Get current loan interest rates
  - `GET /user-obligations/:address` - Get user's interest obligations
  - `POST /auto-settle` - Automatically settle interest using LST earnings
  - `GET /auto-settle-status/:address` - Get automatic settlement status
  - `GET /accrued-interest/:address` - Get accrued interest for user

### `/api/v1/scheduler` - Automatic Repayment Scheduling
- **Purpose**: Schedule and manage automatic repayments
- **Key Endpoints**:
  - `POST /setup-auto-repay` - Setup automatic repayment schedule
  - `GET /user-schedules/:address` - Get user's repayment schedules
  - `PUT /update-schedule/:scheduleId` - Update existing schedule
  - `DELETE /delete-schedule/:scheduleId` - Delete repayment schedule
  - `POST /execute-schedule/:scheduleId` - Manually execute scheduled repayment
  - `GET /schedule-status/:scheduleId` - Get schedule execution status

## Pyth Network Integration

### Supported Price Feeds
The backend integrates with Pyth Network for real-time price feeds:

- **ETH/USD**: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
- **stETH/USD**: `0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5`
- **rETH/USD**: `0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13`

### Price Feed Features
- **Real-time Updates**: Sub-second price updates
- **Confidence Intervals**: Price accuracy metrics
- **Status Monitoring**: Live/stale/error indicators
- **Fallback System**: Mock data when Pyth is unavailable
- **Multi-chain Support**: Price feeds across all supported chains

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

### Price Feed Routes
- **`/pyth/prices`**: Get all supported token prices
  - Returns: Real-time prices for ETH, stETH, rETH with confidence intervals
- **`/pyth/price/:symbol`**: Get specific token price
  - Returns: Price, confidence, timestamp, and status

## Usage Guidelines

1. **For Lending Operations**: Use `/prime/*` routes
2. **For General Swaps**: Use `/1inch/*` routes
3. **For Analytics**: Use `/analytics/*` routes
4. **For Core Lending**: Use `/lending/*` routes
5. **For Price Feeds**: Use `/pyth/*` routes
6. **For LST Management**: Use `/lst/*` routes
7. **For Interest Management**: Use `/interest/*` routes
8. **For Automatic Scheduling**: Use `/scheduler/*` routes

## API Versioning

All routes are prefixed with `/api/v1/` for versioning support.

## Error Handling

All routes follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Success Response Format

Standard success response format:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Price Feed Response Format

Pyth Network price feed responses:
```json
{
  "success": true,
  "data": {
    "symbol": "ETH",
    "price": 2000.50,
    "confidence": 0.01,
    "timestamp": 1704067200000,
    "status": "live",
    "priceFeedId": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
  }
}
```

## Authentication

Currently using mock data. Future implementation will include proper authentication middleware.

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Price feed endpoints**: 1000 requests per minute
- **Cross-chain endpoints**: 50 requests per minute

## Health Checks

- **`GET /health`**: Basic API health check
- **`GET /pyth/status`**: Pyth Network connection status
- **`GET /1inch/status`**: 1inch API connection status 