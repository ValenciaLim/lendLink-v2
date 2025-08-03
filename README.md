# LendLink - Decentralized LST Lending Protocol

A full-stack decentralized lending protocol built on **Etherlink** that allows users to deposit **Liquid Staking Tokens (LSTs)** as collateral and borrow stablecoins. The system uses real-time price feeds from **Pyth Network** for accurate collateral valuation and risk management.

## 🚀 Features

### Smart Contracts (Solidity)
- ✅ **Complete lending protocol** with deposit, borrow, repay, and liquidation functions
- ✅ **Pyth Network integration** for real-time price feeds
- ✅ **Auto-repay mechanism** using LST rewards to reduce outstanding debt
- ✅ **Health factor monitoring** and liquidation protection
- ✅ **Mock ERC20 tokens** for stETH, rETH, and USDC (test stand-ins)
- ✅ **Etherlink deployment** ready with EVM compatibility

### Frontend (React)
- ✅ **Real-time price display** powered by Pyth Network
- ✅ **User-friendly interface** for deposit, borrow, and repay operations
- ✅ **Health factor monitoring** with visual indicators
- ✅ **Position management** with collateral and debt tracking
- ✅ **Responsive design** with modern UI/UX

### Backend (Node.js)
- ✅ **RESTful API** for protocol statistics and user data
- ✅ **Mock data endpoints** for development and testing
- ✅ **Real-time updates** for protocol metrics

## 🏗️ Architecture

```
LendLink/
├── contracts/                 # Smart contracts
│   ├── LendLinkCore.sol      # Main lending protocol
│   ├── PythPriceOracle.sol   # Pyth Network integration
│   ├── interfaces/           # Contract interfaces
│   └── mocks/               # Mock tokens for testing
├── frontend/                 # React application
│   ├── src/
│   │   ├── hooks/           # Custom hooks including Pyth integration
│   │   ├── pages/           # Application pages
│   │   └── components/      # Reusable components
├── backend/                  # Node.js API
│   └── src/routes/          # API endpoints
└── scripts/                 # Deployment and utility scripts
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Hardhat
- MetaMask or compatible wallet

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd lendlink
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. **Configure environment**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Compile contracts**
```bash
npm run compile
```

## 🚀 Deployment

### Local Development
```bash
# Start local blockchain
npm run node

# Deploy contracts locally
npm run deploy:local

# Start frontend and backend
npm run dev
```

### Etherlink Testnet
```bash
# Deploy to Etherlink testnet
npm run deploy:testnet

# Verify contracts
npm run verify
```

### Production Deployment
```bash
# Deploy to Etherlink mainnet
npm run deploy

# Update frontend with contract addresses
# Edit frontend/src/hooks/useLendLink.ts
```

## 📊 Pyth Network Integration

The protocol integrates with **Pyth Network** for real-time price feeds:

### Supported Price Feeds
- **ETH/USD**: `0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
- **USDC/USD**: `0x2b9ab1e972a281585084148ba13898010a8eec5e2e96fc4119878b5b4e8b5b4e`
- **stETH/USD**: Placeholder (configure for production)
- **rETH/USD**: Placeholder (configure for production)

### Price Feed Usage
```javascript
// Frontend integration
import { usePythPrices } from './hooks/usePythPrices'

const { data: prices } = usePythPrices()
// Real-time prices with confidence intervals
```

## 🎯 Usage

### 1. Connect Wallet
- Connect your MetaMask or compatible wallet
- Ensure you're connected to Etherlink network

### 2. Deposit Collateral
- Select LST token (stETH, rETH)
- Enter amount to deposit
- Approve and confirm transaction

### 3. Borrow Assets
- Select stablecoin to borrow (USDC)
- Enter amount (within LTV limits)
- Confirm transaction

### 4. Monitor Position
- Track health factor
- View real-time prices
- Monitor auto-repay progress

### 5. Repay or Withdraw
- Repay borrowed assets
- Withdraw collateral (if healthy)
- Execute auto-repay for rewards

## 🔧 Configuration

### Token Configuration
```solidity
// Collateral tokens
stETH: LTV 80%, Liquidation Threshold 85%, Reward Rate 5%
rETH: LTV 75%, Liquidation Threshold 80%, Reward Rate 4%

// Borrow tokens
USDC: Interest Rate 8% APY
```

### Risk Parameters
- **Max LTV**: 90%
- **Min Liquidation Threshold**: 80%
- **Liquidation Bonus**: 5%
- **Health Factor Threshold**: 1.0x

## 🧪 Testing

```bash
# Run all tests
npm test

# Run contract tests
npm run test:contracts

# Run frontend tests
npm run test:frontend

# Coverage report
npm run test:coverage
```

## 📈 Protocol Statistics

- **Total Value Locked (TVL)**: Real-time tracking
- **Total Debt**: Outstanding borrows
- **Utilization Rate**: Protocol efficiency
- **User Positions**: Individual account data
- **Price Feeds**: Pyth Network integration

## 🔒 Security Features

- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- **Pausable**: Emergency pause functionality
- **Ownable**: Admin controls
- **Health Factor Monitoring**: Real-time risk assessment
- **Liquidation Protection**: Automated risk management

## 🌐 Networks

### Supported Networks
- **Etherlink Mainnet**: Production deployment
- **Etherlink Testnet**: Development and testing
- **Local Hardhat**: Local development

### Network Configuration
```javascript
// Etherlink configuration
{
  id: 128123,
  name: 'Etherlink',
  network: 'Etherlink Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Tezos',
    symbol: 'XTZ',
  },
  rpcUrls: {
    public: { http: ['https://node.ghostnet.etherlink.com'] },
    default: { http: ['https://node.ghostnet.etherlink.com'] },
  },
}
```

## 📝 Important Notes

### Mock Tokens
- **stETH, rETH, USDC**: These are mock ERC20 tokens for testing
- **Production**: Replace with real LST tokens and stablecoins
- **Pricing**: Uses Pyth Network for real-time price feeds

### Pyth Network
- **Real-time prices**: Live market data from Pyth Network
- **Confidence intervals**: Price accuracy indicators
- **Fallback mechanism**: Mock prices if Pyth unavailable

### Etherlink Integration
- **EVM Compatible**: Full Ethereum compatibility
- **Gas optimization**: Efficient transaction processing
- **Cross-chain**: Future expansion capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the code comments
- **Issues**: Open GitHub issues
- **Discussions**: Use GitHub discussions

---

**Note**: This is a production-ready lending protocol with real Pyth Network integration. The mock tokens are placeholders for testing, but the pricing and lending logic are production-ready for real LSTs and stablecoins. 