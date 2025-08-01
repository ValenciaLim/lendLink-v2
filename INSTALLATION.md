# LendLink Installation Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lendlink
```

### 2. Install Dependencies

The project uses different ethers versions for different components:
- **Root/Backend**: ethers v5 (for Hardhat compatibility)
- **Frontend**: ethers v6 (for wagmi compatibility)

Install dependencies with legacy peer deps to resolve conflicts:

```bash
# Install root dependencies
npm install --legacy-peer-deps

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# See env.example for required variables
```

### 4. Compile Contracts

```bash
# Compile smart contracts
npm run compile
```

### 5. Deploy Contracts (Optional)

```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet
```

### 6. Start Development

```bash
# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Start both frontend and backend
npm run dev
```

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Hardhat Issues

If Hardhat compilation fails:

```bash
# Clean Hardhat cache
npm run clean

# Recompile contracts
npm run compile
```

### Frontend Issues

If the frontend fails to start:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Network Configuration

Make sure your `hardhat.config.js` has the correct network configurations for your target networks.

## Project Structure

```
lendlink/
├── contracts/          # Smart contracts
├── frontend/           # React frontend
├── backend/            # Node.js backend
├── scripts/            # Deployment scripts
├── test/               # Contract tests
└── docs/              # Documentation
```

## Development Workflow

1. **Smart Contracts**: Edit contracts in `contracts/`
2. **Frontend**: Edit React components in `frontend/src/`
3. **Backend**: Edit API in `backend/src/`
4. **Deploy**: Use scripts in `scripts/`

## Testing

```bash
# Run contract tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

## Building for Production

```bash
# Build contracts
npm run build:contracts

# Build frontend
npm run build:frontend

# Build backend
cd backend && npm run build
```

## Support

For issues and questions:
- Check the README.md for detailed documentation
- Review the smart contract comments for implementation details
- Check the console for error messages during installation 