const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy Price Oracle (Mock for now)
  console.log("\n📊 Deploying Price Oracle...");
  const PriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.deployed();
  console.log("✅ Price Oracle deployed to:", priceOracle.address);

  // Deploy LendLink Core
  console.log("\n🏦 Deploying LendLink Core...");
  const LendLinkCore = await ethers.getContractFactory("LendLinkCore");
  const lendLinkCore = await LendLinkCore.deploy(priceOracle.address);
  await lendLinkCore.deployed();
  console.log("✅ LendLink Core deployed to:", lendLinkCore.address);

  // Deploy Mock Tokens
  console.log("\n🪙 Deploying Mock Tokens...");
  
  // Mock USDC
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
  await mockUSDC.deployed();
  console.log("✅ Mock USDC deployed to:", mockUSDC.address);

  // Mock stETH
  const MockStETH = await ethers.getContractFactory("MockLSTToken");
  const mockStETH = await MockStETH.deploy("Liquid staked Ether", "stETH");
  await mockStETH.deployed();
  console.log("✅ Mock stETH deployed to:", mockStETH.address);

  // Mock rETH
  const MockRETH = await ethers.getContractFactory("MockLSTToken");
  const mockRETH = await MockRETH.deploy("Rocket Pool ETH", "rETH");
  await mockRETH.deployed();
  console.log("✅ Mock rETH deployed to:", mockRETH.address);

  // Configure LendLink Core
  console.log("\n⚙️ Configuring LendLink Core...");
  
  // Set supported collateral tokens
  await lendLinkCore.setSupportedCollateral(
    mockStETH.address,
    true,
    ethers.utils.parseEther("0.8"), // 80% LTV
    ethers.utils.parseEther("0.85"), // 85% liquidation threshold
    true, // is LST
    ethers.utils.parseEther("0.05") // 5% reward rate
  );
  console.log("✅ stETH configured as collateral");

  await lendLinkCore.setSupportedCollateral(
    mockRETH.address,
    true,
    ethers.utils.parseEther("0.75"), // 75% LTV
    ethers.utils.parseEther("0.8"), // 80% liquidation threshold
    true, // is LST
    ethers.utils.parseEther("0.04") // 4% reward rate
  );
  console.log("✅ rETH configured as collateral");

  // Set supported borrow tokens
  await lendLinkCore.setSupportedBorrowToken(
    mockUSDC.address,
    true,
    ethers.utils.parseEther("0.08") // 8% interest rate
  );
  console.log("✅ USDC configured as borrow token");

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      priceOracle: priceOracle.address,
      lendLinkCore: lendLinkCore.address,
      mockUSDC: mockUSDC.address,
      mockStETH: mockStETH.address,
      mockRETH: mockRETH.address
    },
    configuration: {
      stETH: {
        ltv: "80%",
        liquidationThreshold: "85%",
        rewardRate: "5%"
      },
      rETH: {
        ltv: "75%",
        liquidationThreshold: "80%",
        rewardRate: "4%"
      },
      USDC: {
        interestRate: "8%"
      }
    }
  };

  // Save deployment info to file
  const fs = require('fs');
  const deploymentPath = `deployments/${network.name}.json`;
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("Price Oracle:", deploymentInfo.contracts.priceOracle);
  console.log("LendLink Core:", deploymentInfo.contracts.lendLinkCore);
  console.log("Mock USDC:", deploymentInfo.contracts.mockUSDC);
  console.log("Mock stETH:", deploymentInfo.contracts.mockStETH);
  console.log("Mock rETH:", deploymentInfo.contracts.mockRETH);

  console.log("\n⚙️ Configuration:");
  console.log("stETH - LTV: 80%, Liquidation Threshold: 85%, Reward Rate: 5%");
  console.log("rETH - LTV: 75%, Liquidation Threshold: 80%, Reward Rate: 4%");
  console.log("USDC - Interest Rate: 8%");

  console.log("\nNext steps:");
  console.log("1. Run tests: npm test");
  console.log("2. Start frontend: npm run dev:frontend");
  console.log("3. Start backend: npm run dev:backend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 