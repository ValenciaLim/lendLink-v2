const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LendLink Prime contracts to Etherlink...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy mock tokens first
  console.log("\n1. Deploying mock tokens...");
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockStETH = await MockERC20.deploy("Liquid staked Ether", "stETH");
  await mockStETH.waitForDeployment();
  console.log("Mock stETH deployed to:", await mockStETH.getAddress());

  const mockRETH = await MockERC20.deploy("Rocket Pool ETH", "rETH");
  await mockRETH.waitForDeployment();
  console.log("Mock rETH deployed to:", await mockRETH.getAddress());

  const mockUSDC = await MockERC20.deploy("USD Coin", "USDC");
  await mockUSDC.waitForDeployment();
  console.log("Mock USDC deployed to:", await mockUSDC.getAddress());

  const mockUSDT = await MockERC20.deploy("Tether USD", "USDT");
  await mockUSDT.waitForDeployment();
  console.log("Mock USDT deployed to:", await mockUSDT.getAddress());

  const mockWETH = await MockERC20.deploy("Wrapped Ether", "WETH");
  await mockWETH.waitForDeployment();
  console.log("Mock WETH deployed to:", await mockWETH.getAddress());

  // Deploy Pyth Price Oracle
  console.log("\n2. Deploying Pyth Price Oracle...");
  const PythPriceOracle = await ethers.getContractFactory("PythPriceOracle");
  const pythPriceOracle = await PythPriceOracle.deploy();
  await pythPriceOracle.waitForDeployment();
  console.log("Pyth Price Oracle deployed to:", await pythPriceOracle.getAddress());

  // Deploy Mock 1inch Router
  console.log("\n3. Deploying Mock 1inch Router...");
  const Mock1inchRouter = await ethers.getContractFactory("Mock1inchRouter");
  const mock1inchRouter = await Mock1inchRouter.deploy();
  await mock1inchRouter.waitForDeployment();
  console.log("Mock 1inch Router deployed to:", await mock1inchRouter.getAddress());

  // Deploy Mock Bridge
  console.log("\n4. Deploying Mock Bridge...");
  const MockBridge = await ethers.getContractFactory("MockBridge");
  const mockBridge = await MockBridge.deploy();
  await mockBridge.waitForDeployment();
  console.log("Mock Bridge deployed to:", await mockBridge.getAddress());

  // Deploy LendLink Prime
  console.log("\n5. Deploying LendLink Prime...");
  const LendLinkPrime = await ethers.getContractFactory("LendLinkPrime");
  const lendLinkPrime = await LendLinkPrime.deploy(
    await pythPriceOracle.getAddress(),
    await mock1inchRouter.getAddress(),
    await mockBridge.getAddress()
  );
  await lendLinkPrime.waitForDeployment();
  console.log("LendLink Prime deployed to:", await lendLinkPrime.getAddress());

  // Configure supported tokens for different chains
  console.log("\n6. Configuring supported tokens...");
  
  // Ethereum chain (ID: 1)
  await lendLinkPrime.setSupportedToken(1, await mockStETH.getAddress(), true);
  await lendLinkPrime.setSupportedToken(1, await mockRETH.getAddress(), true);
  await lendLinkPrime.setSupportedToken(1, await mockUSDC.getAddress(), true);
  
  // Etherlink chain (ID: 128123)
  await lendLinkPrime.setSupportedToken(128123, await mockStETH.getAddress(), true);
  await lendLinkPrime.setSupportedToken(128123, await mockRETH.getAddress(), true);
  await lendLinkPrime.setSupportedToken(128123, await mockUSDC.getAddress(), true);
  
  // Polygon chain (ID: 137)
  await lendLinkPrime.setSupportedToken(137, await mockUSDC.getAddress(), true);
  await lendLinkPrime.setSupportedToken(137, await mockUSDT.getAddress(), true);
  await lendLinkPrime.setSupportedToken(137, await mockWETH.getAddress(), true);
  
  // Arbitrum chain (ID: 42161)
  await lendLinkPrime.setSupportedToken(42161, await mockUSDC.getAddress(), true);
  await lendLinkPrime.setSupportedToken(42161, await mockUSDT.getAddress(), true);
  await lendLinkPrime.setSupportedToken(42161, await mockWETH.getAddress(), true);

  console.log("Supported tokens configured");

  // Configure collateral settings
  console.log("\n7. Configuring collateral settings...");
  
  // stETH collateral config
  const stETHConfig = {
    isActive: true,
    ltv: ethers.parseEther("0.8"), // 80% LTV
    liquidationThreshold: ethers.parseEther("0.85"), // 85% liquidation threshold
    isLST: true,
    rewardRate: ethers.parseEther("0.05"), // 5% annual reward rate
    lastRewardUpdate: Math.floor(Date.now() / 1000)
  };

  // rETH collateral config
  const rETHConfig = {
    isActive: true,
    ltv: ethers.parseEther("0.75"), // 75% LTV
    liquidationThreshold: ethers.parseEther("0.8"), // 80% liquidation threshold
    isLST: true,
    rewardRate: ethers.parseEther("0.04"), // 4% annual reward rate
    lastRewardUpdate: Math.floor(Date.now() / 1000)
  };

  // Configure collateral for all chains
  for (const chainId of [1, 128123]) {
    await lendLinkPrime.setCollateralConfig(chainId, await mockStETH.getAddress(), stETHConfig);
    await lendLinkPrime.setCollateralConfig(chainId, await mockRETH.getAddress(), rETHConfig);
  }

  console.log("Collateral settings configured");

  // Configure borrow settings
  console.log("\n8. Configuring borrow settings...");
  
  const borrowConfig = {
    isActive: true,
    interestRate: ethers.parseEther("0.08"), // 8% annual interest rate
    lastInterestUpdate: Math.floor(Date.now() / 1000)
  };

  // Configure borrow tokens for all chains
  for (const chainId of [1, 128123, 137, 42161]) {
    await lendLinkPrime.setBorrowConfig(chainId, await mockUSDC.getAddress(), borrowConfig);
    await lendLinkPrime.setBorrowConfig(chainId, await mockUSDT.getAddress(), borrowConfig);
    if (chainId !== 1 && chainId !== 128123) {
      await lendLinkPrime.setBorrowConfig(chainId, await mockWETH.getAddress(), borrowConfig);
    }
  }

  console.log("Borrow settings configured");

  // Set initial prices in Pyth oracle
  console.log("\n9. Setting initial prices in Pyth oracle...");
  
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Set prices for all tokens
  const tokenPrices = [
    { token: await mockStETH.getAddress(), price: ethers.parseEther("2000") },
    { token: await mockRETH.getAddress(), price: ethers.parseEther("2000") },
    { token: await mockUSDC.getAddress(), price: ethers.parseEther("1") },
    { token: await mockUSDT.getAddress(), price: ethers.parseEther("1") },
    { token: await mockWETH.getAddress(), price: ethers.parseEther("2000") }
  ];

  for (const { token, price } of tokenPrices) {
    const priceFeedId = ethers.keccak256(ethers.toUtf8Bytes(token));
    await pythPriceOracle.updatePrice(priceFeedId, price, currentTime);
  }

  console.log("Initial prices set");

  // Deploy initial liquidity for testing
  console.log("\n10. Deploying initial liquidity...");
  
  const initialAmounts = {
    stETH: ethers.parseEther("1000"), // 1000 stETH
    rETH: ethers.parseEther("500"), // 500 rETH
    USDC: ethers.parseUnits("1000000", 6), // 1M USDC
    USDT: ethers.parseUnits("1000000", 6), // 1M USDT
    WETH: ethers.parseEther("100") // 100 WETH
  };

  // Mint tokens to deployer
  await mockStETH.mint(deployer.address, initialAmounts.stETH);
  await mockRETH.mint(deployer.address, initialAmounts.rETH);
  await mockUSDC.mint(deployer.address, initialAmounts.USDC);
  await mockUSDT.mint(deployer.address, initialAmounts.USDT);
  await mockWETH.mint(deployer.address, initialAmounts.WETH);

  console.log("Initial liquidity deployed");

  // Print deployment summary
  console.log("\n=== LENDLINK PRIME DEPLOYMENT SUMMARY ===");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Pyth Price Oracle:", await pythPriceOracle.getAddress());
  console.log("Mock 1inch Router:", await mock1inchRouter.getAddress());
  console.log("Mock Bridge:", await mockBridge.getAddress());
  console.log("LendLink Prime:", await lendLinkPrime.getAddress());
  console.log("Mock Tokens:");
  console.log("  - stETH:", await mockStETH.getAddress());
  console.log("  - rETH:", await mockRETH.getAddress());
  console.log("  - USDC:", await mockUSDC.getAddress());
  console.log("  - USDT:", await mockUSDT.getAddress());
  console.log("  - WETH:", await mockWETH.getAddress());
  console.log("========================\n");

  // Save deployment addresses for frontend
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      pythPriceOracle: await pythPriceOracle.getAddress(),
      mock1inchRouter: await mock1inchRouter.getAddress(),
      mockBridge: await mockBridge.getAddress(),
      lendLinkPrime: await lendLinkPrime.getAddress(),
      mockStETH: await mockStETH.getAddress(),
      mockRETH: await mockRETH.getAddress(),
      mockUSDC: await mockUSDC.getAddress(),
      mockUSDT: await mockUSDT.getAddress(),
      mockWETH: await mockWETH.getAddress(),
    },
    supportedChains: [1, 128123, 137, 42161],
    chainNames: {
      1: 'Ethereum',
      128123: 'Etherlink',
      137: 'Polygon',
      42161: 'Arbitrum'
    },
    timestamp: new Date().toISOString(),
  };

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-prime-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-prime-info.json");

  console.log("\n✅ LendLink Prime deployment completed successfully!");
  console.log("\n🎯 Cross-Chain Features:");
  console.log("  - 1inch Fusion+ integration for optimal swaps");
  console.log("  - Cross-chain bridge functionality");
  console.log("  - Real-time Pyth price feeds");
  console.log("  - Multi-chain token support");
  console.log("  - Etherlink as settlement layer");
  console.log("\nNext steps:");
  console.log("1. Update frontend with contract addresses");
  console.log("2. Test cross-chain loan initiation");
  console.log("3. Test 1inch Fusion+ swap execution");
  console.log("4. Test bridge functionality");
  console.log("5. Deploy to mainnet when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 