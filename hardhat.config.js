require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/demo",
        blockNumber: 19000000,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    
    // Etherlink (Tezos EVM) - Main deployment
    etherlink: {
      url: process.env.ETHERLINK_RPC_URL || "https://rpc.etherlink.com",
      chainId: 1284,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    etherlink_testnet: {
      url: process.env.ETHERLINK_TESTNET_RPC_URL || "https://testnet.etherlink.com",
      chainId: 1284,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
    },
    
    // Ethereum networks
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/demo",
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/demo",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000,
    },
    
    
  },
  etherscan: {
    apiKey: {
      etherlink: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "etherlink",
        chainId: 1284,
        urls: {
          apiURL: "https://explorer.etherlink.com/api",
          browserURL: "https://explorer.etherlink.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 40000,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 