// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBridge.sol";

/**
 * @title MockBridge
 * @dev Mock implementation of cross-chain bridge for testing
 */
contract MockBridge is IBridge, Ownable {
    // Bridge status tracking
    mapping(bytes32 => BridgeTransaction) public bridgeTransactions;
    mapping(uint256 => bool) public supportedChains;
    
    // Bridge fees (simplified)
    uint256 public constant BASE_BRIDGE_FEE = 0.001 ether;
    uint256 public constant FEE_PER_TOKEN = 0.0001 ether;
    
    // Bridge status enum
    enum BridgeStatus {
        Pending,
        Processing,
        Completed,
        Failed
    }
    
    // Bridge transaction struct
    struct BridgeTransaction {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 sourceChain;
        uint256 destinationChain;
        uint256 timestamp;
        BridgeStatus status;
        bytes32 transactionHash;
    }
    
    // Events
    event MockBridgeInitiated(
        bytes32 indexed bridgeId,
        address indexed sender,
        uint256 sourceChain,
        uint256 destinationChain,
        address token,
        uint256 amount
    );

    event MockBridgeCompleted(
        bytes32 indexed bridgeId,
        address indexed recipient,
        uint256 destinationChain,
        address token,
        uint256 amount
    );

    constructor() {
        // Set up supported chains
        supportedChains[1] = true; // Ethereum
        supportedChains[128123] = true; // Etherlink
        supportedChains[137] = true; // Polygon
        supportedChains[42161] = true; // Arbitrum
    }

    /**
     * @dev Bridge tokens from source chain to destination chain
     */
    function bridgeTokens(
        address token,
        uint256 amount,
        address recipient,
        uint256 destinationChain
    ) external payable override returns (bytes32 bridgeId) {
        require(supportedChains[destinationChain], "Destination chain not supported");
        require(msg.value >= getBridgeFee(block.chainid, destinationChain, token, amount), "Insufficient bridge fee");

        // Generate unique bridge ID
        bridgeId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            recipient,
            destinationChain,
            block.timestamp
        ));

        // Create bridge transaction
        bridgeTransactions[bridgeId] = BridgeTransaction({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            sourceChain: block.chainid,
            destinationChain: destinationChain,
            timestamp: block.timestamp,
            status: BridgeStatus.Pending,
            transactionHash: keccak256(abi.encodePacked(bridgeId, block.timestamp))
        });

        emit MockBridgeInitiated(
            bridgeId,
            msg.sender,
            block.chainid,
            destinationChain,
            token,
            amount
        );

        // Simulate bridge processing (in production, this would be handled by bridge validators)
        _processBridge(bridgeId);

        return bridgeId;
    }

    /**
     * @dev Claim bridged tokens on destination chain
     */
    function claimTokens(
        bytes32 bridgeId,
        address recipient,
        address token,
        uint256 amount,
        bytes32[] calldata proof
    ) external override {
        BridgeTransaction storage transaction = bridgeTransactions[bridgeId];
        require(transaction.status == BridgeStatus.Completed, "Bridge not completed");
        require(transaction.recipient == recipient, "Invalid recipient");
        require(transaction.token == token, "Invalid token");
        require(transaction.amount == amount, "Invalid amount");

        // Simulate token transfer (in production, this would mint tokens)
        emit MockBridgeCompleted(
            bridgeId,
            recipient,
            transaction.destinationChain,
            token,
            amount
        );
    }

    /**
     * @dev Get bridge status
     */
    function getBridgeStatus(bytes32 bridgeId) external view override returns (
        uint8 status,
        uint256 sourceChain,
        uint256 destinationChain,
        uint256 amount,
        uint256 timestamp
    ) {
        BridgeTransaction memory transaction = bridgeTransactions[bridgeId];
        return (
            uint8(transaction.status),
            transaction.sourceChain,
            transaction.destinationChain,
            transaction.amount,
            transaction.timestamp
        );
    }

    /**
     * @dev Get bridge fee for a specific route
     */
    function getBridgeFee(
        uint256 sourceChain,
        uint256 destinationChain,
        address token,
        uint256 amount
    ) external view override returns (uint256 fee) {
        require(supportedChains[sourceChain], "Source chain not supported");
        require(supportedChains[destinationChain], "Destination chain not supported");

        // Calculate fee based on amount and distance
        uint256 distanceMultiplier = _calculateDistanceMultiplier(sourceChain, destinationChain);
        fee = BASE_BRIDGE_FEE.add(amount.mul(FEE_PER_TOKEN).div(1e18)).mul(distanceMultiplier).div(1e18);

        return fee;
    }

    /**
     * @dev Check if a chain is supported
     */
    function isChainSupported(uint256 chainId) external view override returns (bool supported) {
        return supportedChains[chainId];
    }

    /**
     * @dev Get supported chains
     */
    function getSupportedChains() external view override returns (uint256[] memory chainIds) {
        uint256 count = 0;
        for (uint256 i = 0; i < 1000; i++) { // Arbitrary upper limit
            if (supportedChains[i]) {
                count++;
            }
        }

        chainIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < 1000; i++) {
            if (supportedChains[i]) {
                chainIds[index] = i;
                index++;
            }
        }

        return chainIds;
    }

    /**
     * @dev Add supported chain (admin function)
     */
    function addSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = true;
    }

    /**
     * @dev Remove supported chain (admin function)
     */
    function removeSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = false;
    }

    /**
     * @dev Complete bridge transaction (admin function for testing)
     */
    function completeBridge(bytes32 bridgeId) external onlyOwner {
        BridgeTransaction storage transaction = bridgeTransactions[bridgeId];
        require(transaction.status == BridgeStatus.Pending, "Bridge not pending");

        transaction.status = BridgeStatus.Completed;

        emit MockBridgeCompleted(
            bridgeId,
            transaction.recipient,
            transaction.destinationChain,
            transaction.token,
            transaction.amount
        );
    }

    /**
     * @dev Fail bridge transaction (admin function for testing)
     */
    function failBridge(bytes32 bridgeId) external onlyOwner {
        BridgeTransaction storage transaction = bridgeTransactions[bridgeId];
        require(transaction.status == BridgeStatus.Pending, "Bridge not pending");

        transaction.status = BridgeStatus.Failed;
    }

    /**
     * @dev Internal function to process bridge
     */
    function _processBridge(bytes32 bridgeId) internal {
        BridgeTransaction storage transaction = bridgeTransactions[bridgeId];
        
        // Simulate processing time
        transaction.status = BridgeStatus.Processing;
        
        // In production, this would be handled by bridge validators
        // For testing, we'll auto-complete after a short delay
        transaction.status = BridgeStatus.Completed;
    }

    /**
     * @dev Calculate distance multiplier for fee calculation
     */
    function _calculateDistanceMultiplier(uint256 sourceChain, uint256 destinationChain) internal pure returns (uint256) {
        // Simplified distance calculation
        if (sourceChain == destinationChain) return 1e18;
        
        // Higher multiplier for cross-chain bridges
        if (sourceChain == 1 || destinationChain == 1) {
            return 2e18; // Ethereum bridges cost more
        }
        
        return 15e17; // 1.5x for other cross-chain bridges
    }

    /**
     * @dev Get bridge transaction details
     */
    function getBridgeTransaction(bytes32 bridgeId) external view returns (BridgeTransaction memory) {
        return bridgeTransactions[bridgeId];
    }

    /**
     * @dev Get all bridge transactions for a user
     */
    function getUserBridgeTransactions(address user) external view returns (bytes32[] memory bridgeIds) {
        // This is a simplified implementation
        // In production, you would maintain a mapping of user to bridge transactions
        bridgeIds = new bytes32[](0);
    }
} 