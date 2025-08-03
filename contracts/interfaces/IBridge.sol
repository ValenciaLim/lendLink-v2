// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBridge
 * @dev Interface for cross-chain bridge functionality
 */
interface IBridge {
    /**
     * @dev Bridge tokens from source chain to destination chain
     * @param token Token address to bridge
     * @param amount Amount to bridge
     * @param recipient Recipient address on destination chain
     * @param destinationChain Destination chain ID
     * @return bridgeId Unique bridge transaction ID
     */
    function bridgeTokens(
        address token,
        uint256 amount,
        address recipient,
        uint256 destinationChain
    ) external payable returns (bytes32 bridgeId);

    /**
     * @dev Claim bridged tokens on destination chain
     * @param bridgeId Bridge transaction ID
     * @param recipient Recipient address
     * @param token Token address
     * @param amount Amount to claim
     * @param proof Merkle proof for verification
     */
    function claimTokens(
        bytes32 bridgeId,
        address recipient,
        address token,
        uint256 amount,
        bytes32[] calldata proof
    ) external;

    /**
     * @dev Get bridge status
     * @param bridgeId Bridge transaction ID
     * @return status Bridge status (pending, completed, failed)
     * @return sourceChain Source chain ID
     * @return destinationChain Destination chain ID
     * @return amount Bridged amount
     * @return timestamp Bridge timestamp
     */
    function getBridgeStatus(bytes32 bridgeId) external view returns (
        uint8 status,
        uint256 sourceChain,
        uint256 destinationChain,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Get bridge fee for a specific route
     * @param sourceChain Source chain ID
     * @param destinationChain Destination chain ID
     * @param token Token address
     * @param amount Amount to bridge
     * @return fee Bridge fee in native token
     */
    function getBridgeFee(
        uint256 sourceChain,
        uint256 destinationChain,
        address token,
        uint256 amount
    ) external view returns (uint256 fee);

    /**
     * @dev Check if a chain is supported
     * @param chainId Chain ID
     * @return supported Whether the chain is supported
     */
    function isChainSupported(uint256 chainId) external view returns (bool supported);

    /**
     * @dev Get supported chains
     * @return chainIds Array of supported chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory chainIds);
} 