const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendLinkCore", function () {
  let lendLinkCore;
  let priceOracle;
  let mockUSDC;
  let mockStETH;
  let mockRETH;
  let owner;
  let user1;
  let user2;

  const INITIAL_BALANCE = ethers.utils.parseEther("1000");
  const DEPOSIT_AMOUNT = ethers.utils.parseEther("10");
  const BORROW_AMOUNT = ethers.utils.parseUnits("100", 6); // USDC has 6 decimals

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Price Oracle
    const PriceOracle = await ethers.getContractFactory("MockPriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.deployed();

    // Deploy LendLink Core
    const LendLinkCore = await ethers.getContractFactory("LendLinkCore");
    lendLinkCore = await LendLinkCore.deploy(priceOracle.address);
    await lendLinkCore.deployed();

    // Deploy Mock Tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.deployed();

    const MockLSTToken = await ethers.getContractFactory("MockLSTToken");
    mockStETH = await MockLSTToken.deploy("Liquid staked Ether", "stETH");
    await mockStETH.deployed();

    mockRETH = await MockLSTToken.deploy("Rocket Pool ETH", "rETH");
    await mockRETH.deployed();

    // Set token prices in oracle
    await priceOracle.setPrice(mockStETH.address, ethers.utils.parseEther("2000")); // $2000 per stETH
    await priceOracle.setPrice(mockRETH.address, ethers.utils.parseEther("1800")); // $1800 per rETH
    await priceOracle.setPrice(mockUSDC.address, ethers.utils.parseEther("1")); // $1 per USDC

    // Configure supported collateral tokens
    await lendLinkCore.setSupportedCollateral(
      mockStETH.address,
      true,
      ethers.utils.parseEther("0.8"), // 80% LTV
      ethers.utils.parseEther("0.85"), // 85% liquidation threshold
      true, // is LST
      ethers.utils.parseEther("0.05") // 5% reward rate
    );

    await lendLinkCore.setSupportedCollateral(
      mockRETH.address,
      true,
      ethers.utils.parseEther("0.75"), // 75% LTV
      ethers.utils.parseEther("0.8"), // 80% liquidation threshold
      true, // is LST
      ethers.utils.parseEther("0.04") // 4% reward rate
    );

    // Configure supported borrow tokens
    await lendLinkCore.setSupportedBorrowToken(
      mockUSDC.address,
      true,
      ethers.utils.parseEther("0.08") // 8% interest rate
    );

    // Mint tokens to users
    await mockStETH.mint(user1.address, INITIAL_BALANCE);
    await mockRETH.mint(user1.address, INITIAL_BALANCE);
    await mockUSDC.mint(lendLinkCore.address, INITIAL_BALANCE.mul(1000)); // Protocol needs USDC to lend
  });

  describe("Deployment", function () {
    it("Should deploy with correct price oracle", async function () {
      expect(await lendLinkCore.priceOracle()).to.equal(priceOracle.address);
    });

    it("Should have correct owner", async function () {
      expect(await lendLinkCore.owner()).to.equal(owner.address);
    });
  });

  describe("Configuration", function () {
    it("Should configure collateral tokens correctly", async function () {
      const stETHConfig = await lendLinkCore.collateralConfigs(mockStETH.address);
      expect(stETHConfig.isActive).to.be.true;
      expect(stETHConfig.ltv).to.equal(ethers.utils.parseEther("0.8"));
      expect(stETHConfig.liquidationThreshold).to.equal(ethers.utils.parseEther("0.85"));
      expect(stETHConfig.isLST).to.be.true;
      expect(stETHConfig.rewardRate).to.equal(ethers.utils.parseEther("0.05"));
    });

    it("Should configure borrow tokens correctly", async function () {
      const usdcConfig = await lendLinkCore.borrowConfigs(mockUSDC.address);
      expect(usdcConfig.isActive).to.be.true;
      expect(usdcConfig.interestRate).to.equal(ethers.utils.parseEther("0.08"));
    });
  });

  describe("Deposit Collateral", function () {
    beforeEach(async function () {
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
    });

    it("Should allow users to deposit collateral", async function () {
      const initialBalance = await mockStETH.balanceOf(user1.address);
      const initialTVL = await lendLinkCore.getTotalTVL();

      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);

      expect(await mockStETH.balanceOf(user1.address)).to.equal(initialBalance.sub(DEPOSIT_AMOUNT));
      expect(await lendLinkCore.userCollateral(user1.address, mockStETH.address)).to.equal(DEPOSIT_AMOUNT);
      expect(await lendLinkCore.getTotalTVL()).to.be.gt(initialTVL);
    });

    it("Should update user position after deposit", async function () {
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);

      const position = await lendLinkCore.getUserPosition(user1.address);
      expect(position.isActive).to.be.true;
      expect(position.totalCollateralValue).to.be.gt(0);
      expect(position.totalBorrowValue).to.equal(0);
    });

    it("Should revert if token is not supported as collateral", async function () {
      const unsupportedToken = mockUSDC.address;
      await mockUSDC.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);

      await expect(
        lendLinkCore.connect(user1).depositCollateral(unsupportedToken, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Token not supported as collateral");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        lendLinkCore.connect(user1).depositCollateral(mockStETH.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Borrow", function () {
    beforeEach(async function () {
      // Deposit collateral first
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);
    });

    it("Should allow users to borrow against collateral", async function () {
      const initialBalance = await mockUSDC.balanceOf(user1.address);
      const initialDebt = await lendLinkCore.getTotalDebt();

      await lendLinkCore.connect(user1).borrow(mockUSDC.address, BORROW_AMOUNT);

      expect(await mockUSDC.balanceOf(user1.address)).to.equal(initialBalance.add(BORROW_AMOUNT));
      expect(await lendLinkCore.userBorrows(user1.address, mockUSDC.address)).to.equal(BORROW_AMOUNT);
      expect(await lendLinkCore.getTotalDebt()).to.be.gt(initialDebt);
    });

    it("Should update user position after borrow", async function () {
      await lendLinkCore.connect(user1).borrow(mockUSDC.address, BORROW_AMOUNT);

      const position = await lendLinkCore.getUserPosition(user1.address);
      expect(position.isActive).to.be.true;
      expect(position.totalCollateralValue).to.be.gt(0);
      expect(position.totalBorrowValue).to.be.gt(0);
      expect(position.healthFactor).to.be.gt(ethers.utils.parseEther("1"));
    });

    it("Should revert if no collateral deposited", async function () {
      await expect(
        lendLinkCore.connect(user2).borrow(mockUSDC.address, BORROW_AMOUNT)
      ).to.be.revertedWith("No collateral deposited");
    });

    it("Should revert if borrow amount exceeds available amount", async function () {
      const largeAmount = ethers.utils.parseUnits("10000", 6);
      await expect(
        lendLinkCore.connect(user1).borrow(mockUSDC.address, largeAmount)
      ).to.be.revertedWith("Insufficient borrowing power");
    });

    it("Should revert if token is not supported for borrowing", async function () {
      const unsupportedToken = mockStETH.address;
      await expect(
        lendLinkCore.connect(user1).borrow(unsupportedToken, BORROW_AMOUNT)
      ).to.be.revertedWith("Token not supported for borrowing");
    });
  });

  describe("Repay", function () {
    beforeEach(async function () {
      // Deposit collateral and borrow
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).borrow(mockUSDC.address, BORROW_AMOUNT);
    });

    it("Should allow users to repay debt", async function () {
      const repayAmount = ethers.utils.parseUnits("50", 6);
      await mockUSDC.connect(user1).approve(lendLinkCore.address, repayAmount);

      const initialBalance = await mockUSDC.balanceOf(user1.address);
      const initialDebt = await lendLinkCore.userBorrows(user1.address, mockUSDC.address);

      await lendLinkCore.connect(user1).repay(mockUSDC.address, repayAmount);

      expect(await mockUSDC.balanceOf(user1.address)).to.equal(initialBalance.sub(repayAmount));
      expect(await lendLinkCore.userBorrows(user1.address, mockUSDC.address)).to.equal(initialDebt.sub(repayAmount));
    });

    it("Should update user position after repay", async function () {
      const repayAmount = ethers.utils.parseUnits("50", 6);
      await mockUSDC.connect(user1).approve(lendLinkCore.address, repayAmount);

      await lendLinkCore.connect(user1).repay(mockUSDC.address, repayAmount);

      const position = await lendLinkCore.getUserPosition(user1.address);
      expect(position.totalBorrowValue).to.be.lt(ethers.utils.parseEther("100"));
    });

    it("Should revert if repay amount exceeds debt", async function () {
      const largeAmount = ethers.utils.parseUnits("1000", 6);
      await mockUSDC.connect(user1).approve(lendLinkCore.address, largeAmount);

      await expect(
        lendLinkCore.connect(user1).repay(mockUSDC.address, largeAmount)
      ).to.be.revertedWith("Insufficient debt to repay");
    });
  });

  describe("Health Factor", function () {
    beforeEach(async function () {
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);
    });

    it("Should calculate health factor correctly", async function () {
      const healthFactor = await lendLinkCore.getHealthFactor(user1.address);
      expect(healthFactor).to.equal(ethers.constants.MaxUint256); // No debt, so max health factor
    });

    it("Should calculate health factor with debt", async function () {
      await lendLinkCore.connect(user1).borrow(mockUSDC.address, BORROW_AMOUNT);
      
      const healthFactor = await lendLinkCore.getHealthFactor(user1.address);
      expect(healthFactor).to.be.gt(ethers.utils.parseEther("1")); // Should be healthy
    });
  });

  describe("Available Borrow Amount", function () {
    beforeEach(async function () {
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);
    });

    it("Should calculate available borrow amount correctly", async function () {
      const availableAmount = await lendLinkCore.getAvailableBorrowAmount(user1.address, mockUSDC.address);
      expect(availableAmount).to.be.gt(0);
    });

    it("Should return zero if no collateral", async function () {
      const availableAmount = await lendLinkCore.getAvailableBorrowAmount(user2.address, mockUSDC.address);
      expect(availableAmount).to.equal(0);
    });
  });

  describe("Events", function () {
    it("Should emit CollateralDeposited event", async function () {
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);

      await expect(lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT))
        .to.emit(lendLinkCore, "CollateralDeposited")
        .withArgs(user1.address, mockStETH.address, DEPOSIT_AMOUNT, ethers.utils.parseEther("20000"));
    });

    it("Should emit AssetBorrowed event", async function () {
      await mockStETH.connect(user1).approve(lendLinkCore.address, DEPOSIT_AMOUNT);
      await lendLinkCore.connect(user1).depositCollateral(mockStETH.address, DEPOSIT_AMOUNT);

      await expect(lendLinkCore.connect(user1).borrow(mockUSDC.address, BORROW_AMOUNT))
        .to.emit(lendLinkCore, "AssetBorrowed")
        .withArgs(user1.address, mockUSDC.address, BORROW_AMOUNT, ethers.utils.parseEther("100"));
    });
  });
}); 