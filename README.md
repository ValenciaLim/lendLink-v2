# LendLink - Decentralized LST Lending Protocol

A simple decentralized lending protocol that allows users to deposit Liquid Staking Tokens (LSTs) as collateral and borrow stablecoins.

## 🚀 Features

### Core LendLink Protocol
- **LST Collateral**: Deposit stETH, rETH, and other Liquid Staking Tokens
- **Stablecoin Borrowing**: Borrow USDC against LST collateral
- **Auto-Repay**: LST staking rewards automatically reduce outstanding debt
- **Liquidation Protection**: Dynamic LTV and liquidation threshold calculations
- **Interest Rate Model**: Risk-based interest rates
- **Health Factor Monitoring**: Real-time position health tracking

## 🏗️ Architecture

```
lendlink/
├── contracts/          # Smart contracts (Solidity)
├── frontend/           # React frontend (Vite)
├── backend/            # Node.js backend & subgraph
├── scripts/            # Deployment & utility scripts
├── docs/              # Documentation
└── hardhat.config.js  # Hardhat configuration
```

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: React, Vite, ethers.js, wagmi
- **Backend**: Node.js, Express, GraphQL
- **Blockchains**: Etherlink (Tezos), Ethereum (Sepolia)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or similar wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lendlink

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:local

# Start frontend
npm run dev
```

## 📋 Environment Variables

Create a `.env` file with the following variables:

```env
# Network Configuration
ETHERLINK_RPC_URL=https://node.etherlink.com
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# API Keys
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key

# Oracle Configuration
PRICE_FEED_ADDRESS=0x... # Chainlink price feed address
```

## 🏛️ Smart Contracts

### Core Contracts
- `LendLinkCore.sol`: Main lending protocol logic
- `MockPriceOracle.sol`: Mock price oracle for testing
- `MockERC20.sol`: Mock ERC20 tokens for testing
- `MockLSTToken.sol`: Mock Liquid Staking Tokens with auto-yield

### Key Features
- **LTV Calculation**: Dynamic loan-to-value ratios based on collateral type
- **Auto-Repay**: LST rewards automatically reduce debt
- **Cross-Chain**: Atomic swaps via 1inch Fusion+
- **Oracle Integration**: Real-time price feeds

## 🌐 Frontend

The React frontend provides:
- **Dashboard**: View positions, health factors, and rewards
- **Lending Interface**: Deposit collateral and borrow assets
- **Cross-Chain Flow**: Seamless multi-chain operations
- **Portfolio Management**: Track positions across chains

## 🔗 Cross-Chain Integration

### Supported Chains
- **Etherlink** (Tezos EVM): Primary deployment
- **Ethereum**: LST collateral source
- **Cosmos**: Cross-chain borrowing
- **Near**: Alternative borrowing destination

### 1inch Fusion+ Features
- **Meta-Orders**: Cross-chain asset transfers
- **Hashlock**: Secure atomic swaps
- **Timelock**: Time-based transaction security
- **Gas Optimization**: Efficient cross-chain operations

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:contracts
npm run test:frontend
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📊 Monitoring & Analytics

- **Subgraph**: Index protocol events and user positions
- **Backend API**: Real-time position tracking
- **Analytics Dashboard**: Protocol metrics and user analytics

## 🔒 Security

- **Audited Contracts**: OpenZeppelin security patterns
- **Multi-Sig**: Protocol governance
- **Emergency Pause**: Circuit breaker functionality
- **Oracle Redundancy**: Multiple price feed sources

## 📈 Roadmap

### Phase 1: Core Protocol
- [x] LST collateral system
- [x] Stablecoin borrowing
- [x] Auto-repay mechanism
- [x] Basic liquidation

### Phase 2: Cross-Chain (LendLink Prime)
- [x] 1inch Fusion+ integration
- [x] Multi-chain support
- [x] Atomic swap mechanics

### Phase 3: Advanced Features
- [ ] Advanced risk models
- [ ] Governance token
- [ ] Additional LST support
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.lendlink.io](https://docs.lendlink.io)
- **Discord**: [discord.gg/lendlink](https://discord.gg/lendlink)
- **Telegram**: [t.me/lendlink](https://t.me/lendlink)

---

Built with ❤️ by the LendLink team 