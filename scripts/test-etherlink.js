const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing Etherlink L2 Connectivity...");
  
  // Test network connection
  try {
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name);
    console.log("✅ Chain ID:", network.chainId);
    
    // Test account balance
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    console.log("✅ Deployer address:", deployer.address);
    console.log("✅ Balance:", ethers.utils.formatEther(balance), "XTZ");
    
    // Test contract deployment
    console.log("\n🏗️ Testing contract deployment...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Test Token", "TEST", 18);
    await mockToken.deployed();
    
    console.log("✅ Test contract deployed to:", mockToken.address);
    console.log("✅ Transaction hash:", mockToken.deployTransaction.hash);
    
    // Verify on Etherlink explorer
    console.log("\n🔗 Verify on Etherlink Explorer:");
    console.log(`https://explorer.etherlink.com/address/${mockToken.address}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Check your .env file has PRIVATE_KEY");
    console.log("2. Ensure you have XTZ balance on Etherlink");
    console.log("3. Verify RPC URL is correct");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 