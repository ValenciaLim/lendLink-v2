# LendLink - Decentralized Lending Protocol on Etherlink

**LendLink** is a comprehensive decentralized lending protocol built specifically for **Etherlink L2** with real-time price feeds from **Pyth Network**. The protocol leverages Etherlink's EVM-compatible environment to enable users to deposit Liquid Staking Tokens (LSTs) as collateral and borrow stablecoins with advanced risk management.

## 🚀 Etherlink L2 Integration

### **Core Etherlink Technologies Used**

#### **🏗️ Etherlink L2 Infrastructure**
- **EVM Compatibility**: Full Ethereum compatibility for seamless smart contract deployment
- **High Throughput**: 10,000+ TPS for fast lending transactions
- **Low Gas Fees**: Cost-effective DeFi operations on Etherlink
- **Fast Finality**: Sub-second transaction finality for real-time lending
- **Native Token Support**: XTZ and ERC-20 token compatibility

#### **🔧 Etherlink Development Tools**
- **Hardhat Integration**: Etherlink network configuration for smart contract development
- **Etherlink RPC**: Direct connection to Etherlink nodes for real-time data
- **Etherlink Explorer**: Transaction tracking and contract verification
- **Etherlink Testnet**: Development and testing on Ghostnet
- **Etherlink Mainnet**: Production deployment on Etherlink

#### **💡 Etherlink-Specific Features**
- **Cross-Chain Bridge**: Etherlink as central settlement layer for cross-chain lending
- **L2 Optimization**: Gas-efficient lending operations
- **Real-time Price Feeds**: Pyth Network integration optimized for Etherlink
- **Wallet Integration**: Etherlink-compatible wallet support
- **MEV Protection**: Built-in protection against front-running on Etherlink

## 🚀 Features

### Core Lending Protocol (Etherlink Native)
- **LST Collateral**: Deposit stETH, rETH as collateral with real-time USD pricing
- **Stablecoin Borrowing**: Borrow USDC with competitive rates on Etherlink
- **Real-time Pricing**: Pyth Network integration optimized for Etherlink L2
- **Health Factor Monitoring**: Advanced risk management system
- **Auto-repay**: LST rewards automatically reduce outstanding debt
- **Liquidation Protection**: Automatic liquidation of unhealthy positions

### 🆕 LendLink Prime - Cross-Chain Extension (Etherlink as Hub)
- **Etherlink as Settlement Layer**: Cross-chain lending with Etherlink as central hub
- **1inch Fusion+ Integration**: Advanced DEX aggregation with MEV protection
- **Multi-Chain Support**: Ethereum → Etherlink → Polygon → Arbitrum
- **Bridge Functionality**: Seamless cross-chain token transfers via Etherlink
- **Real-time Price Feeds**: Pyth Network across all supported chains
- **Unified Interface**: Cross-chain features seamlessly integrated into existing UI

### 📊 Pyth Network Integration (Etherlink Optimized)
- **Real-time Price Feeds**: Live USD pricing for ETH, stETH, rETH
- **High Accuracy**: Sub-second price updates with confidence intervals
- **Multi-chain Support**: Price feeds available across all supported chains
- **Fallback System**: Robust error handling with mock data fallbacks
- **Status Monitoring**: Live/stale/error indicators for price quality

## 🏗️ Etherlink Architecture

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

## 📋 Smart Contracts (Etherlink Deployed)

### Core Contracts
- **LendLinkCore.sol**: Main lending protocol deployed on Etherlink L2
- **MockERC20.sol**: Mock tokens for testing (stETH, rETH, USDC)
- **MockLSTToken.sol**: Liquid staking token implementation
- **MockPriceOracle.sol**: Price oracle for testing

### Prime Contracts (Cross-Chain with Etherlink Hub)
- **LendLinkPrime.sol**: Cross-chain lending with Etherlink as settlement layer
- **Mock1inchRouter.sol**: Mock 1inch router for testing
- **MockBridge.sol**: Mock cross-chain bridge for testing
- **Interfaces**: I1inchRouter.sol, IBridge.sol for type safety

## 🔧 Etherlink Configuration

### Network Configuration
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    etherlink: {
      url: "https://node.mainnet.etherlink.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 128123
    },
    etherlinkTestnet: {
      url: "https://node.ghostnet.etherlink.com", 
      accounts: [process.env.PRIVATE_KEY],
      chainId: 128123
    }
  }
}
```

### Environment Variables
```bash
# Etherlink Configuration
ETHERLINK_RPC_URL=https://node.mainnet.etherlink.com
ETHERLINK_TESTNET_RPC_URL=https://node.ghostnet.etherlink.com
ETHERLINK_CHAIN_ID=128123
ETHERLINK_EXPLORER=https://explorer.etherlink.com
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Etherlink wallet (Temple, Kukai, or other Tezos wallets)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd lendlink

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Configure Etherlink network
cp env.example .env
# Edit .env with your Etherlink configuration

# Start development servers
npm run dev:all
```

### Etherlink Deployment
```bash
# Deploy to Etherlink Testnet
npx hardhat run scripts/deploy.js --network etherlinkTestnet

# Deploy to Etherlink Mainnet
npx hardhat run scripts/deploy.js --network etherlink

# Verify contracts on Etherlink Explorer
npx hardhat verify --network etherlink <contract-address>
```

## 🧪 Testing on Etherlink

### Smart Contracts
```bash
# Run all tests
npx hardhat test

# Test on Etherlink Testnet
npx hardhat test --network etherlinkTestnet

# Run specific test file
npx hardhat test test/LendLinkCore.test.js
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

## 📡 API Endpoints

### Core Lending API (`/api/v1/lending`)
- `GET /overview` - Protocol statistics on Etherlink
- `GET /user/:address` - User position data
- `POST /deposit` - Deposit collateral on Etherlink
- `POST /borrow` - Borrow assets on Etherlink
- `POST /repay` - Repay debt on Etherlink

### Prime API (`/api/v1/prime`)
- `GET /overview` - Cross-chain protocol stats with Etherlink as hub
- `POST /initiate-loan` - Start cross-chain loan via Etherlink
- `POST /execute-swap` - Execute cross-chain swap via Etherlink
- `GET /supported-chains` - Available chains (Etherlink as central)
- `GET /supported-tokens` - Available tokens

## 💡 Usage Examples

### Basic Lending on Etherlink
```javascript
// Deposit collateral on Etherlink
await lendLinkCore.depositCollateral(stETH, amount)

// Borrow stablecoins on Etherlink
await lendLinkCore.borrow(USDC, borrowAmount)

// Repay debt on Etherlink
await lendLinkCore.repay(USDC, repayAmount)
```

### Cross-Chain Lending (Etherlink as Hub)
```javascript
// Initiate cross-chain loan via Etherlink
await lendLinkPrime.initiateCrossChainLoan(
    sourceChain,    // Ethereum
    destChain,      // Etherlink (central hub)
    collateralToken, // stETH
    borrowToken,    // USDC
    collateralAmount,
    borrowAmount
)

// Execute cross-chain swap via Etherlink
await lendLinkPrime.executeCrossChainSwap(
    loanId,
    srcToken,       // stETH
    dstToken,       // USDC
    amount,
    minReturn
)
```

## 📊 Monitoring & Analytics

### Protocol Metrics on Etherlink
- **Total Value Locked (TVL)**: Real-time protocol TVL on Etherlink
- **Total Debt**: Outstanding borrows on Etherlink
- **Health Factors**: User position health on Etherlink
- **Cross-Chain Stats**: Bridge volume via Etherlink

### Price Feeds
- **Pyth Network**: Real-time ETH, stETH, rETH USD prices
- **Multi-chain**: Price feeds across all supported chains
- **Confidence Intervals**: Price accuracy metrics
- **Status Monitoring**: Live/stale/error indicators

## 🔒 Security Features

### Core Security (Etherlink Optimized)
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- **Access Control**: Role-based permissions
- **Pausable**: Emergency pause functionality
- **Health Factor Monitoring**: Automatic liquidation triggers
- **L2 Security**: Etherlink-specific security measures

### Prime Security (Cross-Chain via Etherlink)
- **Cross-Chain Validation**: Bridge transaction verification via Etherlink
- **Slippage Protection**: 1inch swap protection
- **Fallback Mechanisms**: Graceful degradation
- **Multi-Signature**: Bridge security

### Price Feed Security
- **Real-time Validation**: Pyth Network price verification
- **Confidence Intervals**: Price accuracy monitoring
- **Fallback System**: Mock data when Pyth unavailable
- **Status Monitoring**: Price quality indicators

## 🛠️ Development

### Project Structure
```
lendlink/
├── contracts/          # Smart contracts (Etherlink deployed)
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
- **L2**: Etherlink (Tezos EVM) - Primary focus
- **DeFi**: 1inch Fusion+, Pyth Network, WalletConnect
- **Cross-Chain**: Etherlink as central settlement layer

## 📈 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed protocol analytics on Etherlink
- **Mobile App**: React Native implementation
- **DAO Governance**: Community governance on Etherlink
- **More LSTs**: Additional liquid staking tokens
- **Advanced Routing**: Multi-hop cross-chain swaps via Etherlink

### Integration Roadmap
- **LayerZero**: Cross-chain messaging via Etherlink
- **Chainlink**: Additional price feeds
- **Aave**: Flash loan integration on Etherlink
- **Uniswap**: DEX integration on Etherlink

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

- **Etherlink Team**: For L2 infrastructure and EVM compatibility
- **Pyth Network**: For real-time price feeds
- **1inch**: For Fusion+ protocol integration
- **OpenZeppelin**: For secure smart contracts
- **RainbowKit**: For wallet integration

---

**LendLink** - The premier DeFi lending protocol built on Etherlink L2 🚀 