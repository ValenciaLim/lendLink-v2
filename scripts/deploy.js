const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying LendLink contracts to Etherlink...");

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

  // Deploy Pyth Price Oracle
  console.log("\n2. Deploying Pyth Price Oracle...");
  const PythPriceOracle = await ethers.getContractFactory("PythPriceOracle");
  const pythPriceOracle = await PythPriceOracle.deploy();
  await pythPriceOracle.waitForDeployment();
  console.log("Pyth Price Oracle deployed to:", await pythPriceOracle.getAddress());

  // Deploy LendLinkCore with Pyth oracle
  console.log("\n3. Deploying LendLinkCore...");
  const LendLinkCore = await ethers.getContractFactory("LendLinkCore");
  const lendLinkCore = await LendLinkCore.deploy(await pythPriceOracle.getAddress());
  await lendLinkCore.waitForDeployment();
  console.log("LendLinkCore deployed to:", await lendLinkCore.getAddress());

  // Configure price feed IDs for tokens
  console.log("\n4. Configuring price feed IDs...");
  
  // Pyth Network price feed IDs (these are the actual IDs for mainnet)
  const ETH_PRICE_FEED_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
  const USDC_PRICE_FEED_ID = "0x2b9ab1e972a281585084148ba13898010a8eec5e2e96fc4119878b5b4e8b5b4e";
  const STETH_PRICE_FEED_ID = "0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b"; // Placeholder
  const RETH_PRICE_FEED_ID = "0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b"; // Placeholder

  // Set price feed IDs for tokens
  await lendLinkCore.setTokenPriceFeedId(await mockStETH.getAddress(), STETH_PRICE_FEED_ID);
  await lendLinkCore.setTokenPriceFeedId(await mockRETH.getAddress(), RETH_PRICE_FEED_ID);
  await lendLinkCore.setTokenPriceFeedId(await mockUSDC.getAddress(), USDC_PRICE_FEED_ID);
  
  console.log("Price feed IDs configured");

  // Configure supported collateral tokens
  console.log("\n5. Configuring supported collateral tokens...");
  
  // stETH as collateral (LST with rewards)
  await lendLinkCore.setSupportedCollateral(
    await mockStETH.getAddress(),
    true, // isActive
    ethers.parseEther("0.8"), // 80% LTV
    ethers.parseEther("0.85"), // 85% liquidation threshold
    true, // isLST
    ethers.parseEther("0.05") // 5% annual reward rate
  );

  // rETH as collateral (LST with rewards)
  await lendLinkCore.setSupportedCollateral(
    await mockRETH.getAddress(),
    true, // isActive
    ethers.parseEther("0.75"), // 75% LTV
    ethers.parseEther("0.8"), // 80% liquidation threshold
    true, // isLST
    ethers.parseEther("0.04") // 4% annual reward rate
  );

  console.log("Collateral tokens configured");

  // Configure supported borrow tokens
  console.log("\n6. Configuring supported borrow tokens...");
  
  // USDC as borrow token
  await lendLinkCore.setSupportedBorrowToken(
    await mockUSDC.getAddress(),
    true, // isActive
    ethers.parseEther("0.08") // 8% annual interest rate
  );

  console.log("Borrow tokens configured");

  // Set initial prices in Pyth oracle (for testing)
  console.log("\n7. Setting initial prices in Pyth oracle...");
  
  const currentTime = Math.floor(Date.now() / 1000);
  
  await pythPriceOracle.updatePrice(
    ETH_PRICE_FEED_ID,
    ethers.parseEther("2000"), // $2000 per ETH
    currentTime
  );
  
  await pythPriceOracle.updatePrice(
    USDC_PRICE_FEED_ID,
    ethers.parseEther("1"), // $1 per USDC
    currentTime
  );
  
  await pythPriceOracle.updatePrice(
    STETH_PRICE_FEED_ID,
    ethers.parseEther("2000"), // $2000 per stETH
    currentTime
  );
  
  await pythPriceOracle.updatePrice(
    RETH_PRICE_FEED_ID,
    ethers.parseEther("2000"), // $2000 per rETH
    currentTime
  );

  console.log("Initial prices set");

  // Deploy some initial liquidity for testing
  console.log("\n8. Deploying initial liquidity...");
  
  const initialStETHAmount = ethers.parseEther("1000"); // 1000 stETH
  const initialRETHAmount = ethers.parseEther("500"); // 500 rETH
  const initialUSDCAmount = ethers.parseUnits("1000000", 6); // 1M USDC

  // Mint tokens to deployer
  await mockStETH.mint(deployer.address, initialStETHAmount);
  await mockRETH.mint(deployer.address, initialRETHAmount);
  await mockUSDC.mint(deployer.address, initialUSDCAmount);

  console.log("Initial liquidity deployed");

  // Print deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Pyth Price Oracle:", await pythPriceOracle.getAddress());
  console.log("LendLinkCore:", await lendLinkCore.getAddress());
  console.log("Mock stETH:", await mockStETH.getAddress());
  console.log("Mock rETH:", await mockRETH.getAddress());
  console.log("Mock USDC:", await mockUSDC.getAddress());
  console.log("========================\n");

  // Save deployment addresses for frontend
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      pythPriceOracle: await pythPriceOracle.getAddress(),
      lendLinkCore: await lendLinkCore.getAddress(),
      mockStETH: await mockStETH.getAddress(),
      mockRETH: await mockRETH.getAddress(),
      mockUSDC: await mockUSDC.getAddress(),
    },
    priceFeedIds: {
      ETH: ETH_PRICE_FEED_ID,
      USDC: USDC_PRICE_FEED_ID,
      stETH: STETH_PRICE_FEED_ID,
      rETH: RETH_PRICE_FEED_ID,
    },
    timestamp: new Date().toISOString(),
  };

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-info.json");

  console.log("\n✅ LendLink deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update frontend with contract addresses");
  console.log("2. Configure Pyth price feeds for production");
  console.log("3. Test the lending protocol functionality");
  console.log("4. Deploy to mainnet when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 