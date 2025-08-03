# LendLink - Decentralized Lending Protocol

**LendLink** is a comprehensive decentralized lending protocol built on **Etherlink** with real-time price feeds from **Pyth Network**. The protocol enables users to deposit Liquid Staking Tokens (LSTs) as collateral and borrow stablecoins with advanced risk management.

## 🚀 Features

### Core Lending Protocol
- **LST Collateral**: Deposit stETH, rETH as collateral
- **Stablecoin Borrowing**: Borrow USDC with competitive rates
- **Real-time Pricing**: Pyth Network integration for accurate valuations
- **Health Factor Monitoring**: Advanced risk management system
- **Auto-repay**: LST rewards automatically reduce outstanding debt
- **Liquidation Protection**: Automatic liquidation of unhealthy positions

### 🆕 LendLink Prime - Cross-Chain Extension (Integrated)
- **Cross-Chain Lending**: Bridge collateral and borrow across chains (integrated into main Lending page)
- **1inch Fusion+ Integration**: Advanced DEX aggregation with MEV protection
- **Multi-Chain Support**: Ethereum, Etherlink, Polygon, Arbitrum
- **Bridge Functionality**: Seamless cross-chain token transfers
- **Real-time Price Feeds**: Pyth Network across all supported chains
- **Unified Interface**: Cross-chain features seamlessly integrated into existing UI

### 🔗 1inch API Integration
- **Swap Protocols**: Classic Swap, Fusion Swap, Cross-Chain Swap, Limit Orders
- **Data APIs**: Real-time price feeds, wallet balances, token metadata
- **Web3 APIs**: Transaction status, gas prices, blockchain data
- **Comprehensive Coverage**: All major 1inch APIs integrated
- **Auto-Interest Management**: LST yield automatically repays loan interest
- **Cross-Chain Swaps**: Seamless token bridging with 1inch Fusion+

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Smart         │
│   (React)       │◄──►│   (Express.js)  │◄──►│   Contracts     │
│                 │    │                 │    │   (Solidity)    │
│ • Dashboard     │    │ • API Routes    │    │                 │
│ • Lending       │    │ • 1inch Routes  │    │ • LendLinkCore  │
│ • Analytics     │    │ • Prime Routes  │    │ • LendLinkPrime │
│ • Settings      │    │ • Mock Data     │    │ • Mock Tokens   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Etherlink     │    │   Pyth Network  │
│   Services      │    │   L2 Network    │    │   Price Feeds   │
│                 │    │                 │    │                 │
│ • 1inch APIs    │    │ • Fast TPS      │    │ • Real-time     │
│ • WalletConnect │    │ • Low Fees      │    │ • Multi-chain   │
│ • Pyth Network  │    │ • EVM Compatible│    │ • Reliable       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Smart Contracts

### Core Contracts
- **LendLinkCore.sol**: Main lending protocol with deposit, borrow, repay, and liquidation functions
- **MockERC20.sol**: Mock tokens for testing (stETH, rETH, USDC)
- **MockLSTToken.sol**: Liquid staking token implementation
- **MockPriceOracle.sol**: Price oracle for testing

### Prime Contracts (Cross-Chain)
- **LendLinkPrime.sol**: Cross-chain lending with 1inch Fusion+ integration
- **Mock1inchRouter.sol**: Mock 1inch router for testing
- **MockBridge.sol**: Mock cross-chain bridge for testing
- **Interfaces**: I1inchRouter.sol, IBridge.sol for type safety

## 🔧 API Integration

### 1inch APIs Implemented
The project integrates **18 real 1inch APIs** across multiple categories:

#### **Swap APIs (6 APIs)**
- `getSwapQuote()` - Get swap quotes with best routes
- `executeSwap()` - Execute swaps with MEV protection
- `getCrossChainSwapQuote()` - Cross-chain swap quotes
- `executeCrossChainSwap()` - Execute cross-chain swaps
- `getLimitOrderQuote()` - Limit order quotes
- `createLimitOrder()` - Create limit orders

#### **Data APIs (4 APIs)**
- `getTokenPrice()` - Real-time token prices
- `getWalletBalances()` - Wallet token balances
- `getTokenMetadata()` - Token information
- `getSupportedTokens()` - Available tokens per chain

#### **Web3 APIs (3 APIs)**
- `getTransactionStatus()` - Transaction status tracking
- `getGasPrice()` - Current gas prices
- `getBlockInfo()` - Blockchain data

#### **Utility APIs (5 APIs)**
- `getSupportedChains()` - Available blockchain networks
- `getProtocols()` - DEX protocols information
- `getLiquiditySources()` - Liquidity sources
- `validateTransaction()` - Transaction validation
- `getTokenList()` - Token lists per chain

### Backend API Endpoints
```
/api/v1/lending/*     - Core lending operations
/api/v1/1inch/*       - 1inch API proxy
/api/v1/prime/*       - Cross-chain lending
/api/v1/lst/*         - LST yield management
/api/v1/interest/*    - Interest management
/api/v1/scheduler/*   - Auto-repayment scheduling
/api/v1/analytics/*   - Protocol analytics
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd lendlink

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Start development servers
npm run dev:all
```

### Individual Services
```bash
# Frontend (React + Vite)
cd frontend
npm run dev

# Backend (Express.js)
cd backend
npm run dev

# Smart Contracts (Hardhat)
npx hardhat compile
npx hardhat test
```

## 🧪 Testing

### Smart Contracts
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/LendLinkCore.test.js

# Test Prime contracts
npx hardhat test test/integration.test.js
```

### Frontend & Backend
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Integration tests
npm run test:integration
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:

```bash
# Core Configuration
PRIVATE_KEY=your_private_key_here
ETHERLINK_RPC_URL=https://node.mainnet.etherlink.com
ETHERLINK_TESTNET_RPC_URL=https://node.ghostnet.etherlink.com

# Frontend Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Backend Configuration
PORT=3002
NODE_ENV=development
```

### Network Configuration
- **Etherlink Mainnet**: Production deployment
- **Etherlink Testnet**: Development and testing
- **Local Hardhat**: Contract development

## 📡 API Endpoints

### Core Lending API (`/api/v1/lending`)
- `GET /overview` - Protocol statistics
- `GET /user/:address` - User position data
- `POST /deposit` - Deposit collateral
- `POST /borrow` - Borrow assets
- `POST /repay` - Repay debt

### Prime API (`/api/v1/prime`)
- `GET /overview` - Cross-chain protocol stats
- `POST /initiate-loan` - Start cross-chain loan
- `POST /execute-swap` - Execute 1inch swap
- `GET /supported-chains` - Available chains
- `GET /supported-tokens` - Available tokens

## 💡 Usage Examples

### Basic Lending
```javascript
// Deposit collateral
await lendLinkCore.depositCollateral(stETH, amount)

// Borrow stablecoins
await lendLinkCore.borrow(USDC, borrowAmount)

// Repay debt
await lendLinkCore.repay(USDC, repayAmount)
```

### Cross-Chain Lending (Prime)
```javascript
// Initiate cross-chain loan
await lendLinkPrime.initiateCrossChainLoan(
    sourceChain,    // Ethereum
    destChain,      // Etherlink
    collateralToken, // stETH
    borrowToken,    // USDC
    collateralAmount,
    borrowAmount
)

// Execute cross-chain swap
await lendLinkPrime.executeCrossChainSwap(
    loanId,
    srcToken,       // stETH
    dstToken,       // USDC
    amount,
    minReturn
)
```

## 🚀 Deployment

### Smart Contracts
```bash
# Deploy to Etherlink Testnet
npx hardhat run scripts/deploy.js --network etherlink

# Deploy Prime contracts
npx hardhat run scripts/deploy-prime.js --network etherlink

# Verify contracts
npx hardhat verify --network etherlink <contract-address>
```

### Frontend & Backend
```bash
# Build frontend
cd frontend && npm run build

# Deploy backend
cd backend && npm run start

# Environment setup
cp env.example .env
# Configure environment variables
```

## 📊 Monitoring & Analytics

### Protocol Metrics
- **Total Value Locked (TVL)**: Real-time protocol TVL
- **Total Debt**: Outstanding borrows
- **Health Factors**: User position health
- **Cross-Chain Stats**: Bridge volume, success rates

### Price Feeds
- **Pyth Network**: Real-time ETH, USDC, stETH, rETH prices
- **Multi-chain**: Price feeds across all supported chains
- **Confidence Intervals**: Price accuracy metrics

## 🔒 Security Features

### Core Security
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- **Access Control**: Role-based permissions
- **Pausable**: Emergency pause functionality
- **Health Factor Monitoring**: Automatic liquidation triggers

### Prime Security
- **Cross-Chain Validation**: Bridge transaction verification
- **Slippage Protection**: 1inch swap protection
- **Fallback Mechanisms**: Graceful degradation
- **Multi-Signature**: Bridge security

## 🛠️ Development

### Project Structure
```
lendlink/
├── contracts/          # Smart contracts
│   ├── interfaces/     # Contract interfaces
│   ├── mocks/         # Mock implementations
│   └── LendLinkCore.sol
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   │   └── routes/
│   └── package.json
├── scripts/           # Deployment scripts
├── test/             # Test files
└── README.md
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **DeFi**: 1inch Fusion+, Pyth Network, WalletConnect
- **L2**: Etherlink (Tezos EVM)

## 📈 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed protocol analytics
- **Mobile App**: React Native implementation
- **DAO Governance**: Community governance
- **More LSTs**: Additional liquid staking tokens
- **Advanced Routing**: Multi-hop cross-chain swaps

### Integration Roadmap
- **LayerZero**: Cross-chain messaging
- **Chainlink**: Additional price feeds
- **Aave**: Flash loan integration
- **Uniswap**: DEX integration

## 📚 Additional Documentation

For detailed information about the LendLink Prime cross-chain extension, see [README-PRIME.md](README-PRIME.md).

For comprehensive 1inch API integration details, see [README-1INCH-INTEGRATION.md](README-1INCH-INTEGRATION.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Etherlink Team**: For L2 infrastructure
- **Pyth Network**: For real-time price feeds
- **1inch**: For Fusion+ protocol
- **OpenZeppelin**: For secure smart contracts
- **RainbowKit**: For wallet integration

---

**LendLink** - Bridging the gap between traditional DeFi and cross-chain liquidity 🚀 