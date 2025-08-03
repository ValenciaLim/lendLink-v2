# LendLink Prime - Cross-Chain Lending Protocol

**LendLink Prime** is a revolutionary cross-chain lending protocol that integrates **Etherlink** with **1inch Fusion+** to enable seamless cross-chain borrowing and lending. This extension showcases Etherlink's power as a cross-chain swap router and settlement layer.

## 🚀 Key Features

### 🔗 **Cross-Chain Infrastructure**
- **Etherlink L2 Settlement**: Deployed on Etherlink for fast, low-cost cross-chain transactions
- **1inch Fusion+ Integration**: Advanced DEX aggregation with MEV protection
- **Multi-Chain Support**: Ethereum, Etherlink, Polygon, Arbitrum
- **Real-time Price Feeds**: Pyth Network integration for accurate valuations

### 💰 **Cross-Chain Lending**
- **LST Collateral**: Deposit stETH, rETH across chains
- **Stablecoin Borrowing**: Borrow USDC, USDT on any supported chain
- **Auto-Repay**: LST rewards automatically reduce outstanding debt
- **Health Factor Monitoring**: Real-time risk management across chains

### 🔄 **1inch Fusion+ Integration**
- **Optimal Routing**: Find best swap paths across all DEXs
- **MEV Protection**: Protect against front-running and sandwich attacks
- **Slippage Control**: Configurable slippage tolerance
- **Gas Optimization**: Minimize transaction costs

### 🌉 **Bridge Functionality**
- **Cross-Chain Transfers**: Bridge tokens between chains
- **Fee Optimization**: Dynamic fee calculation based on route
- **Status Tracking**: Real-time bridge transaction monitoring
- **Fallback Logic**: Handle failed bridges gracefully

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ethereum      │    │   Etherlink     │    │   Polygon       │
│   (Chain ID: 1) │◄──►│  (Chain ID:     │◄──►│  (Chain ID: 137)│
│                 │    │   128123)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LendLink Prime                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Bridge    │  │  1inch      │  │   Pyth      │          │
│  │  Protocol   │  │  Fusion+    │  │   Oracle    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Smart Contracts

### Core Contracts
- **`LendLinkPrime.sol`**: Main cross-chain lending protocol
- **`PythPriceOracle.sol`**: Real-time price feeds from Pyth Network
- **`Mock1inchRouter.sol`**: Mock 1inch Fusion+ router for testing
- **`MockBridge.sol`**: Mock cross-chain bridge for testing

### Interfaces
- **`I1inchRouter.sol`**: 1inch Fusion+ integration interface
- **`IBridge.sol`**: Cross-chain bridge interface
- **`IPythPriceOracle.sol`**: Pyth Network price oracle interface

### Mock Tokens
- **`MockERC20.sol`**: Mock tokens for testing (stETH, rETH, USDC, USDT, WETH)

## 🛠️ Installation & Setup

### Prerequisites
```bash
# Node.js 18+ and npm
node --version
npm --version

# Hardhat
npm install -g hardhat

# Git
git --version
```

### 1. Clone and Install
```bash
git clone <repository-url>
cd lendlink
npm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Configure your environment variables
# Add your private keys and RPC URLs
```

### 3. Deploy Contracts
```bash
# Deploy to Etherlink testnet
npx hardhat run scripts/deploy-prime.js --network etherlink

# Deploy to local network for testing
npx hardhat run scripts/deploy-prime.js --network localhost
```

### 4. Start Backend
```bash
cd backend
npm install
npm start
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/LendLinkPrime.test.js

# Run with coverage
npx hardhat coverage
```

### Integration Tests
```bash
# Test cross-chain loan flow
npx hardhat test test/integration-prime.test.js

# Test 1inch Fusion+ integration
npx hardhat test test/1inch-integration.test.js
```

### Manual Testing
```bash
# Start local network
npx hardhat node

# Deploy contracts locally
npx hardhat run scripts/deploy-prime.js --network localhost

# Run test script
npx hardhat run scripts/test-prime.js --network localhost
```

## 🔧 Configuration

### Supported Chains
```javascript
const SUPPORTED_CHAINS = {
  1: 'Ethereum',
  128123: 'Etherlink',
  137: 'Polygon',
  42161: 'Arbitrum'
};
```

### Supported Tokens
```javascript
const SUPPORTED_TOKENS = {
  ethereum: ['stETH', 'rETH', 'USDC'],
  etherlink: ['stETH', 'rETH', 'USDC'],
  polygon: ['USDC', 'USDT', 'WETH'],
  arbitrum: ['USDC', 'USDT', 'WETH']
};
```

### Risk Parameters
```javascript
const RISK_PARAMS = {
  maxLTV: 0.9, // 90% max loan-to-value
  liquidationThreshold: 0.8, // 80% liquidation threshold
  healthFactorThreshold: 1.0, // Minimum health factor
  maxSlippage: 0.05 // 5% max slippage for swaps
};
```

## 📊 API Endpoints

### Prime API Routes
```javascript
// Protocol Overview
GET /api/v1/prime/overview

// Supported Tokens & Chains
GET /api/v1/prime/supported-tokens
GET /api/v1/prime/supported-chains

// Cross-Chain Loan Operations
POST /api/v1/prime/initiate-loan
POST /api/v1/prime/execute-swap
POST /api/v1/prime/repay-loan

// Loan Management
GET /api/v1/prime/loan/:loanId
GET /api/v1/prime/user/:address/loans

// Bridge & Swap Tracking
GET /api/v1/prime/bridge/:bridgeId
GET /api/v1/prime/swap/:swapId

// Quotes & Fees
GET /api/v1/prime/quote
GET /api/v1/prime/bridge-fee
```

## 🎯 Usage Examples

### 1. Initiate Cross-Chain Loan
```javascript
// User deposits stETH on Ethereum, borrows USDC on Etherlink
const loanParams = {
  sourceChain: 1, // Ethereum
  destinationChain: 128123, // Etherlink
  collateralToken: 'stETH',
  borrowToken: 'USDC',
  collateralAmount: '10.0',
  borrowAmount: '15000.0'
};

await lendLinkPrime.initiateCrossChainLoan(
  loanParams.sourceChain,
  loanParams.destinationChain,
  collateralToken,
  borrowToken,
  collateralAmount,
  borrowAmount
);
```

### 2. Execute 1inch Fusion+ Swap
```javascript
// Execute swap through 1inch Fusion+
const swapParams = {
  loanId: '0x...',
  srcToken: 'stETH',
  dstToken: 'USDC',
  amount: '10.0',
  minReturn: '19900.0'
};

await lendLinkPrime.executeCrossChainSwap(
  swapParams.loanId,
  swapParams.srcToken,
  swapParams.dstToken,
  swapParams.amount,
  swapParams.minReturn
);
```

### 3. Monitor Bridge Status
```javascript
// Get bridge transaction status
const bridgeStatus = await bridge.getBridgeStatus(bridgeId);
console.log('Bridge Status:', bridgeStatus);

// Track bridge completion
if (bridgeStatus.status === 'completed') {
  // Proceed with swap execution
  await executeCrossChainSwap(loanId, ...);
}
```

## 🔒 Security Features

### Risk Management
- **Health Factor Monitoring**: Real-time calculation across chains
- **Liquidation Protection**: Automatic liquidation of unhealthy positions
- **Slippage Control**: Configurable maximum slippage tolerance
- **Bridge Fallbacks**: Handle failed cross-chain transfers

### MEV Protection
- **1inch Fusion+**: Advanced MEV protection mechanisms
- **Slippage Tolerance**: Prevent excessive slippage
- **Gas Optimization**: Minimize transaction costs
- **Route Optimization**: Find optimal swap paths

### Oracle Security
- **Pyth Network**: High-frequency, low-latency price feeds
- **Multi-Source Validation**: Cross-reference multiple price sources
- **Confidence Intervals**: Account for price uncertainty
- **Fallback Mechanisms**: Handle oracle failures gracefully

## 🚀 Deployment

### Etherlink Testnet
```bash
# Configure Etherlink testnet
npx hardhat run scripts/deploy-prime.js --network etherlink-testnet
```

### Etherlink Mainnet
```bash
# Configure Etherlink mainnet
npx hardhat run scripts/deploy-prime.js --network etherlink-mainnet
```

### Multi-Chain Deployment
```bash
# Deploy to multiple chains
npx hardhat run scripts/deploy-prime-multichain.js
```

## 📈 Monitoring & Analytics

### Protocol Metrics
- **Cross-Chain TVL**: Total value locked across all chains
- **Active Loans**: Number of active cross-chain positions
- **Bridge Volume**: Total volume bridged between chains
- **Swap Volume**: Total volume swapped via 1inch Fusion+

### Health Monitoring
- **Health Factor Distribution**: Monitor loan health across chains
- **Liquidation Events**: Track liquidation frequency and amounts
- **Bridge Success Rate**: Monitor bridge transaction success rates
- **Swap Success Rate**: Monitor 1inch Fusion+ swap success rates

## 🔮 Future Enhancements

### Planned Features
- **Real 1inch Fusion+ Integration**: Replace mock with actual 1inch API
- **Additional Chains**: Support for more EVM-compatible chains
- **Advanced Risk Models**: More sophisticated risk management
- **Governance**: DAO governance for protocol parameters

### Research Areas
- **Cross-Chain MEV**: Research and implement cross-chain MEV protection
- **Optimistic Bridges**: Integration with optimistic bridge protocols
- **Layer 2 Scaling**: Explore additional L2 solutions
- **DeFi Integration**: Integrate with other DeFi protocols

## 🤝 Contributing

### Development Setup
```bash
# Fork the repository
git clone <your-fork>
cd lendlink

# Create feature branch
git checkout -b feature/cross-chain-lending

# Make changes and test
npm test

# Submit pull request
git push origin feature/cross-chain-lending
```

### Code Standards
- **Solidity**: Follow OpenZeppelin standards
- **TypeScript**: Use strict mode and proper typing
- **Testing**: Maintain >90% test coverage
- **Documentation**: Update docs for all changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **1inch Network**: For Fusion+ protocol integration
- **Pyth Network**: For real-time price feeds
- **Etherlink**: For L2 infrastructure and settlement layer
- **OpenZeppelin**: For secure smart contract libraries

## 📞 Support

- **Documentation**: [docs.lendlink.io](https://docs.lendlink.io)
- **Discord**: [discord.gg/lendlink](https://discord.gg/lendlink)
- **Twitter**: [@LendLinkProtocol](https://twitter.com/LendLinkProtocol)
- **Email**: support@lendlink.io

---

**LendLink Prime** - Revolutionizing cross-chain lending with Etherlink and 1inch Fusion+ 🚀 