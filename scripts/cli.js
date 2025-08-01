#!/usr/bin/env node

const { ethers } = require("hardhat");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("🚀 LendLink CLI - Smart Contract Interface");
  console.log("==========================================\n");

  try {
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`📝 Connected with account: ${signer.address}`);
    console.log(`💰 Balance: ${ethers.utils.formatEther(await signer.getBalance())} ETH\n`);

    // Load deployed contracts (you would need to update these addresses)
    const LendLinkCore = await ethers.getContractFactory("LendLinkCore");
    const lendLinkCore = LendLinkCore.attach("0x..."); // Replace with deployed address

    const MockStETH = await ethers.getContractFactory("MockLSTToken");
    const mockStETH = MockStETH.attach("0x..."); // Replace with deployed address

    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = MockUSDC.attach("0x..."); // Replace with deployed address

    while (true) {
      console.log("\n📋 Available Commands:");
      console.log("1. Check user position");
      console.log("2. Deposit collateral");
      console.log("3. Borrow assets");
      console.log("4. Repay debt");
      console.log("5. Execute auto-repay");
      console.log("6. Check health factor");
      console.log("7. View protocol stats");
      console.log("8. Exit");

      const choice = await askQuestion("\nEnter your choice (1-8): ");

      switch (choice) {
        case "1":
          await checkUserPosition(lendLinkCore, signer.address);
          break;
        case "2":
          await depositCollateral(lendLinkCore, mockStETH, signer);
          break;
        case "3":
          await borrowAssets(lendLinkCore, mockUSDC, signer);
          break;
        case "4":
          await repayDebt(lendLinkCore, mockUSDC, signer);
          break;
        case "5":
          await executeAutoRepay(lendLinkCore, signer);
          break;
        case "6":
          await checkHealthFactor(lendLinkCore, signer.address);
          break;
        case "7":
          await viewProtocolStats(lendLinkCore);
          break;
        case "8":
          console.log("👋 Goodbye!");
          process.exit(0);
        default:
          console.log("❌ Invalid choice. Please try again.");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

async function checkUserPosition(contract, userAddress) {
  console.log("\n📊 Checking user position...");
  
  try {
    const position = await contract.getUserPosition(userAddress);
    console.log("✅ Position retrieved successfully!");
    console.log(`   Total Collateral Value: $${ethers.utils.formatEther(position.totalCollateralValue)}`);
    console.log(`   Total Borrow Value: $${ethers.utils.formatEther(position.totalBorrowValue)}`);
    console.log(`   Health Factor: ${ethers.utils.formatEther(position.healthFactor)}x`);
    console.log(`   Is Active: ${position.isActive}`);
  } catch (error) {
    console.log("❌ Error checking position:", error.message);
  }
}

async function depositCollateral(contract, tokenContract, signer) {
  console.log("\n💰 Depositing collateral...");
  
  try {
    const amount = await askQuestion("Enter amount to deposit: ");
    const parsedAmount = ethers.utils.parseEther(amount);
    
    // Approve tokens first
    console.log("Approving tokens...");
    const approveTx = await tokenContract.approve(contract.address, parsedAmount);
    await approveTx.wait();
    
    // Deposit collateral
    console.log("Depositing collateral...");
    const tx = await contract.depositCollateral(tokenContract.address, parsedAmount);
    await tx.wait();
    
    console.log("✅ Collateral deposited successfully!");
  } catch (error) {
    console.log("❌ Error depositing collateral:", error.message);
  }
}

async function borrowAssets(contract, tokenContract, signer) {
  console.log("\n💸 Borrowing assets...");
  
  try {
    const amount = await askQuestion("Enter amount to borrow: ");
    const parsedAmount = ethers.utils.parseEther(amount);
    
    const tx = await contract.borrow(tokenContract.address, parsedAmount);
    await tx.wait();
    
    console.log("✅ Assets borrowed successfully!");
  } catch (error) {
    console.log("❌ Error borrowing assets:", error.message);
  }
}

async function repayDebt(contract, tokenContract, signer) {
  console.log("\n💳 Repaying debt...");
  
  try {
    const amount = await askQuestion("Enter amount to repay: ");
    const parsedAmount = ethers.utils.parseEther(amount);
    
    // Approve tokens first
    console.log("Approving tokens...");
    const approveTx = await tokenContract.approve(contract.address, parsedAmount);
    await approveTx.wait();
    
    // Repay debt
    console.log("Repaying debt...");
    const tx = await contract.repay(tokenContract.address, parsedAmount);
    await tx.wait();
    
    console.log("✅ Debt repaid successfully!");
  } catch (error) {
    console.log("❌ Error repaying debt:", error.message);
  }
}

async function executeAutoRepay(contract, signer) {
  console.log("\n🔄 Executing auto-repay...");
  
  try {
    const tx = await contract.executeAutoRepay(signer.address);
    await tx.wait();
    
    console.log("✅ Auto-repay executed successfully!");
  } catch (error) {
    console.log("❌ Error executing auto-repay:", error.message);
  }
}

async function checkHealthFactor(contract, userAddress) {
  console.log("\n🏥 Checking health factor...");
  
  try {
    const healthFactor = await contract.getHealthFactor(userAddress);
    const hfValue = ethers.utils.formatEther(healthFactor);
    
    console.log(`✅ Health Factor: ${hfValue}x`);
    
    if (hfValue >= 1.5) {
      console.log("🟢 Position is healthy");
    } else if (hfValue >= 1.1) {
      console.log("🟡 Position needs attention");
    } else {
      console.log("🔴 Position is at risk of liquidation");
    }
  } catch (error) {
    console.log("❌ Error checking health factor:", error.message);
  }
}

async function viewProtocolStats(contract) {
  console.log("\n📈 Viewing protocol stats...");
  
  try {
    const tvl = await contract.getTotalTVL();
    const debt = await contract.getTotalDebt();
    
    console.log("✅ Protocol Statistics:");
    console.log(`   Total Value Locked: $${ethers.utils.formatEther(tvl)}`);
    console.log(`   Total Debt: $${ethers.utils.formatEther(debt)}`);
    console.log(`   Utilization Rate: ${(Number(ethers.utils.formatEther(debt)) / Number(ethers.utils.formatEther(tvl)) * 100).toFixed(2)}%`);
  } catch (error) {
    console.log("❌ Error viewing protocol stats:", error.message);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ CLI Error:", error);
    process.exit(1);
  }); 