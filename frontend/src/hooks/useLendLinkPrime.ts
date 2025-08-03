import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import axios from 'axios'

// Contract addresses (these would be deployed addresses)
const LENDLINK_PRIME_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder for deployed LendLinkPrime address

// ABI imports (simplified for demo)
const LENDLINK_PRIME_ABI = [
    'function getCrossChainLoan(bytes32 loanId) external view returns (tuple(address borrower, uint256 sourceChain, uint256 destinationChain, address collateralToken, address borrowToken, uint256 collateralAmount, uint256 borrowAmount, uint256 healthFactor, uint256 createdAt, uint256 lastUpdateTime, bool isActive, bytes32 bridgeId, bytes32 swapId, uint8 status))',
    'function getUserLoans(address user) external view returns (bytes32[])',
    'function getLoanHealthFactor(bytes32 loanId) external view returns (uint256)',
    'function canLiquidateLoan(bytes32 loanId) external view returns (bool)',
    'function getSwapQuote(address srcToken, address dstToken, uint256 amount) external view returns (uint256 returnAmount, uint256 gasEstimate)',
    'function getBridgeFee(uint256 sourceChain, uint256 destinationChain, address token, uint256 amount) external view returns (uint256)',
    'function initiateCrossChainLoan(uint256 sourceChain, uint256 destinationChain, address collateralToken, address borrowToken, uint256 collateralAmount, uint256 borrowAmount) external',
    'function executeCrossChainSwap(bytes32 loanId, address srcToken, address dstToken, uint256 amount, uint256 minReturn) external',
    'function repayCrossChainLoan(bytes32 loanId, uint256 repayAmount) external',
    'function liquidateCrossChainLoan(bytes32 loanId) external',
]

export interface CrossChainLoan {
    borrower: string
    sourceChain: number
    destinationChain: number
    collateralToken: string
    borrowToken: string
    collateralAmount: bigint
    borrowAmount: bigint
    healthFactor: bigint
    createdAt: bigint
    lastUpdateTime: bigint
    isActive: boolean
    bridgeId: string
    swapId: string
    status: number
}

export interface SwapQuote {
    returnAmount: bigint
    gasEstimate: bigint
}

export interface BridgeFee {
    fee: bigint
    sourceChain: number
    destinationChain: number
    token: string
    amount: bigint
}

export interface ChainInfo {
    id: number
    name: string
    icon: string
    rpcUrl: string
    explorer: string
}

// Supported chains
export const SUPPORTED_CHAINS: ChainInfo[] = [
    {
        id: 1,
        name: 'Ethereum',
        icon: '🔵',
        rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
        explorer: 'https://etherscan.io'
    },
    {
        id: 128123,
        name: 'Etherlink',
        icon: '🟢',
        rpcUrl: 'https://node.ghostnet.etherlink.com',
        explorer: 'https://explorer.etherlink.com'
    },
    {
        id: 137,
        name: 'Polygon',
        icon: '🟣',
        rpcUrl: 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com'
    },
    {
        id: 42161,
        name: 'Arbitrum',
        icon: '🔴',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io'
    }
]

// Mock data for development
const mockCrossChainLoans: CrossChainLoan[] = [
    {
        borrower: '0x1234567890123456789012345678901234567890',
        sourceChain: 1,
        destinationChain: 128123,
        collateralToken: '0x2222222222222222222222222222222222222222', // stETH
        borrowToken: '0x1111111111111111111111111111111111111111', // USDC
        collateralAmount: ethers.parseEther('10'),
        borrowAmount: ethers.parseUnits('15000', 6),
        healthFactor: ethers.parseEther('2.5'),
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 3600),
        lastUpdateTime: BigInt(Math.floor(Date.now() / 1000)),
        isActive: true,
        bridgeId: '0x1234567890123456789012345678901234567890123456789012345678901234',
        swapId: '0x5678901234567890123456789012345678901234567890123456789012345678',
        status: 3 // Active
    }
]

export function useLendLinkPrime() {
    const { address, isConnected } = useAccount()

    // For now, use mock data instead of contract reads
    const isLoading = false
    const crossChainLoans = mockCrossChainLoans

    // Get protocol stats from API
    const { data: protocolStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['primeProtocolStats'],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/prime/overview`)
                return response.data.data
            } catch (error) {
                console.warn('Failed to fetch protocol stats, using mock data:', error)
                return {
                    totalCrossChainTVL: '5000000',
                    totalCrossChainDebt: '2500000',
                    activeLoans: 25,
                    totalBridges: 150
                }
            }
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })

    // Get supported tokens from API
    const { data: supportedTokens, isLoading: isLoadingTokens } = useQuery({
        queryKey: ['primeSupportedTokens'],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/prime/supported-tokens`)
                return response.data.data
            } catch (error) {
                console.warn('Failed to fetch supported tokens, using mock data:', error)
                return {
                    ethereum: ['stETH', 'rETH', 'USDC'],
                    etherlink: ['stETH', 'rETH', 'USDC'],
                    polygon: ['USDC', 'USDT', 'WETH'],
                    arbitrum: ['USDC', 'USDT', 'WETH']
                }
            }
        },
        refetchInterval: 60000, // Refetch every minute
    })

    return {
        crossChainLoans,
        protocolStats,
        supportedTokens,
        supportedChains: SUPPORTED_CHAINS,
        isLoading: isLoading || isLoadingStats || isLoadingTokens
    }
}

// Contract write hooks
export function useInitiateCrossChainLoan() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_PRIME_ADDRESS as `0x${string}`,
        abi: LENDLINK_PRIME_ABI,
        functionName: 'initiateCrossChainLoan',
    })

    return useContractWrite(config)
}

export function useExecuteCrossChainSwap() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_PRIME_ADDRESS as `0x${string}`,
        abi: LENDLINK_PRIME_ABI,
        functionName: 'executeCrossChainSwap',
    })

    return useContractWrite(config)
}

export function useRepayCrossChainLoan() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_PRIME_ADDRESS as `0x${string}`,
        abi: LENDLINK_PRIME_ABI,
        functionName: 'repayCrossChainLoan',
    })

    return useContractWrite(config)
}

export function useLiquidateCrossChainLoan() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_PRIME_ADDRESS as `0x${string}`,
        abi: LENDLINK_PRIME_ABI,
        functionName: 'liquidateCrossChainLoan',
    })

    return useContractWrite(config)
}

// Utility functions
export function getChainName(chainId: number): string {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
    return chain ? chain.name : `Chain ${chainId}`
}

export function getChainIcon(chainId: number): string {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
    return chain ? chain.icon : '🔗'
}

export function getLoanStatusText(status: number): string {
    switch (status) {
        case 0: return 'Pending'
        case 1: return 'Bridging'
        case 2: return 'Swapping'
        case 3: return 'Active'
        case 4: return 'Repaying'
        case 5: return 'Completed'
        case 6: return 'Liquidated'
        case 7: return 'Failed'
        default: return 'Unknown'
    }
}

export function getLoanStatusColor(status: number): string {
    switch (status) {
        case 0: return 'text-yellow-600'
        case 1: return 'text-blue-600'
        case 2: return 'text-purple-600'
        case 3: return 'text-green-600'
        case 4: return 'text-orange-600'
        case 5: return 'text-gray-600'
        case 6: return 'text-red-600'
        case 7: return 'text-red-600'
        default: return 'text-gray-600'
    }
}

export function formatCrossChainAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals)
}

export function parseCrossChainAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals)
}

export function formatCrossChainUSD(amount: bigint): string {
    const value = Number(ethers.formatEther(amount))
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

export function getHealthFactorStatus(healthFactor: bigint): 'safe' | 'warning' | 'danger' {
    const value = Number(ethers.formatEther(healthFactor))
    if (value >= 2.0) return 'safe'
    if (value >= 1.5) return 'warning'
    return 'danger'
}

// API base URL
const API_BASE_URL = 'http://localhost:3002/api/v1' 