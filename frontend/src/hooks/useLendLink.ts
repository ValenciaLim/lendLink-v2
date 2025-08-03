import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import axios from 'axios'

// API base URL
const API_BASE_URL = 'http://localhost:3002/api/v1'

// Contract addresses (these would be deployed addresses)
const LENDLINK_CORE_ADDRESS = '0x0000000000000000000000000000000000000000' // Placeholder for deployed LendLinkCore address

// ABI imports (simplified for demo)
const LENDLINK_CORE_ABI = [
    'function getUserPosition(address user) external view returns (tuple(uint256 totalCollateralValue, uint256 totalBorrowValue, uint256 healthFactor, uint256 lastUpdateTime, bool isActive))',
    'function getUserCollaterals(address user) external view returns (tuple(address token, uint256 amount, uint256 value, uint256 ltv, uint256 liquidationThreshold, bool isActive)[])',
    'function getUserBorrows(address user) external view returns (tuple(address token, uint256 amount, uint256 value, uint256 interestRate, uint256 lastUpdateTime, bool isActive)[])',
    'function getTotalTVL() external view returns (uint256)',
    'function getTotalDebt() external view returns (uint256)',
    'function depositCollateral(address collateralToken, uint256 amount) external',
    'function withdrawCollateral(address collateralToken, uint256 amount) external',
    'function borrow(address borrowToken, uint256 amount) external',
    'function repay(address borrowToken, uint256 amount) external',
    'function executeAutoRepay(address user) external',
]

export interface UserPosition {
    totalCollateralValue: bigint
    totalBorrowValue: bigint
    healthFactor: bigint
    lastUpdateTime: bigint
    isActive: boolean
}

export interface CollateralInfo {
    token: string
    amount: bigint
    value: bigint
    ltv: bigint
    liquidationThreshold: bigint
    isActive: boolean
}

export interface BorrowInfo {
    token: string
    amount: bigint
    value: bigint
    interestRate: bigint
    lastUpdateTime: bigint
    isActive: boolean
}

export interface ProtocolStats {
    totalTVL: string
    totalDebt: string
    totalUsers: number
    totalTransactions: number
}

// Mock data for development
const mockUserPosition: UserPosition = {
    totalCollateralValue: ethers.parseEther('50000'), // $50,000
    totalBorrowValue: ethers.parseEther('25000'), // $25,000
    healthFactor: ethers.parseEther('2.5'), // 2.5x
    lastUpdateTime: BigInt(Math.floor(Date.now() / 1000)),
    isActive: true
}

const mockUserCollaterals: CollateralInfo[] = [
    {
        token: 'stETH',
        amount: ethers.parseEther('25'),
        value: ethers.parseEther('50000'),
        ltv: ethers.parseEther('0.75'),
        liquidationThreshold: ethers.parseEther('0.85'),
        isActive: true
    }
]

const mockUserBorrows: BorrowInfo[] = [
    {
        token: 'USDC',
        amount: ethers.parseUnits('25000', 6),
        value: ethers.parseEther('25000'),
        interestRate: ethers.parseEther('0.05'),
        lastUpdateTime: BigInt(Math.floor(Date.now() / 1000)),
        isActive: true
    }
]

const mockProtocolStats: ProtocolStats = {
    totalTVL: '1000000',
    totalDebt: '500000',
    totalUsers: 150,
    totalTransactions: 1250
}

export function useLendLink() {
    const { address, isConnected } = useAccount()

    // Get user position from API
    const { data: userPosition, isLoading: isLoadingPosition } = useQuery({
        queryKey: ['userPosition', address],
        queryFn: async () => {
            if (!address) return mockUserPosition
            try {
                const response = await axios.get(`${API_BASE_URL}/lending/user/${address}`)
                const data = response.data.data
                return {
                    totalCollateralValue: ethers.parseEther(data.totalCollateralValue),
                    totalBorrowValue: ethers.parseEther(data.totalBorrowValue),
                    healthFactor: ethers.parseEther(data.healthFactor),
                    lastUpdateTime: BigInt(Math.floor(Date.now() / 1000)),
                    isActive: true
                } as UserPosition
            } catch (error) {
                console.warn('Failed to fetch user position, using mock data:', error)
                return mockUserPosition
            }
        },
        refetchInterval: 10000, // Refetch every 10 seconds
        enabled: !!address
    })

    // Get user collaterals from API
    const { data: userCollaterals, isLoading: isLoadingCollaterals } = useQuery({
        queryKey: ['userCollaterals', address],
        queryFn: async () => {
            if (!address) return mockUserCollaterals
            try {
                const response = await axios.get(`${API_BASE_URL}/lending/user/${address}`)
                const data = response.data.data
                return data.collaterals.map((collateral: any) => ({
                    token: collateral.token,
                    amount: ethers.parseEther(collateral.amount),
                    value: ethers.parseEther(collateral.value),
                    ltv: ethers.parseEther(collateral.ltv),
                    liquidationThreshold: ethers.parseEther('0.85'),
                    isActive: true
                })) as CollateralInfo[]
            } catch (error) {
                console.warn('Failed to fetch user collaterals, using mock data:', error)
                return mockUserCollaterals
            }
        },
        refetchInterval: 10000, // Refetch every 10 seconds
        enabled: !!address
    })

    // Get user borrows from API
    const { data: userBorrows, isLoading: isLoadingBorrows } = useQuery({
        queryKey: ['userBorrows', address],
        queryFn: async () => {
            if (!address) return mockUserBorrows
            try {
                const response = await axios.get(`${API_BASE_URL}/lending/user/${address}`)
                const data = response.data.data
                return data.borrows.map((borrow: any) => ({
                    token: borrow.token,
                    amount: ethers.parseUnits(borrow.amount, 6), // USDC has 6 decimals
                    value: ethers.parseEther(borrow.value),
                    interestRate: ethers.parseEther(borrow.interestRate),
                    lastUpdateTime: BigInt(Math.floor(Date.now() / 1000)),
                    isActive: true
                })) as BorrowInfo[]
            } catch (error) {
                console.warn('Failed to fetch user borrows, using mock data:', error)
                return mockUserBorrows
            }
        },
        refetchInterval: 10000, // Refetch every 10 seconds
        enabled: !!address
    })

    // Get protocol stats from API
    const { data: protocolStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['protocolStats'],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/lending/overview`)
                return response.data.data as ProtocolStats
            } catch (error) {
                console.warn('Failed to fetch protocol stats, using mock data:', error)
                return mockProtocolStats
            }
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })

    // Get supported tokens from API
    const { data: supportedTokens, isLoading: isLoadingTokens } = useQuery({
        queryKey: ['supportedTokens'],
        queryFn: async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/lending/supported-tokens`)
                return response.data.data as string[]
            } catch (error) {
                console.warn('Failed to fetch supported tokens, using mock data:', error)
                return ['stETH', 'rETH', 'USDC']
            }
        },
        refetchInterval: 60000, // Refetch every minute
    })

    // Calculate total TVL and debt from protocol stats
    const totalTVL = protocolStats ? ethers.parseEther(protocolStats.totalTVL) : ethers.parseEther('1000000')
    const totalDebt = protocolStats ? ethers.parseEther(protocolStats.totalDebt) : ethers.parseEther('500000')

    return {
        userPosition: userPosition || mockUserPosition,
        userCollaterals: userCollaterals || mockUserCollaterals,
        userBorrows: userBorrows || mockUserBorrows,
        totalTVL,
        totalDebt,
        protocolStats,
        supportedTokens,
        isLoading: isLoadingPosition || isLoadingCollaterals || isLoadingBorrows || isLoadingStats || isLoadingTokens
    }
}

// Contract write hooks (placeholder for now)
export function useDepositCollateral() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_CORE_ADDRESS as `0x${string}`,
        abi: LENDLINK_CORE_ABI,
        functionName: 'depositCollateral',
    })

    return useContractWrite(config)
}

export function useWithdrawCollateral() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_CORE_ADDRESS as `0x${string}`,
        abi: LENDLINK_CORE_ABI,
        functionName: 'withdrawCollateral',
    })

    return useContractWrite(config)
}

export function useBorrow() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_CORE_ADDRESS as `0x${string}`,
        abi: LENDLINK_CORE_ABI,
        functionName: 'borrow',
    })

    return useContractWrite(config)
}

export function useRepay() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_CORE_ADDRESS as `0x${string}`,
        abi: LENDLINK_CORE_ABI,
        functionName: 'repay',
    })

    return useContractWrite(config)
}

export function useAutoRepay() {
    const { config } = usePrepareContractWrite({
        address: LENDLINK_CORE_ADDRESS as `0x${string}`,
        abi: LENDLINK_CORE_ABI,
        functionName: 'executeAutoRepay',
    })

    return useContractWrite(config)
}

// Real API functions for lending operations
export async function depositCollateral(token: string, amount: string, userAddress: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/lending/deposit`, {
            token,
            amount,
            userAddress
        })
        return response.data
    } catch (error) {
        console.error('Deposit error:', error)
        throw error
    }
}

export async function borrow(token: string, amount: string, userAddress: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/lending/borrow`, {
            token,
            amount,
            userAddress
        })
        return response.data
    } catch (error) {
        console.error('Borrow error:', error)
        throw error
    }
}

export async function repay(token: string, amount: string, userAddress: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/lending/repay`, {
            token,
            amount,
            userAddress
        })
        return response.data
    } catch (error) {
        console.error('Repay error:', error)
        throw error
    }
}

export async function setupAutoRepay(userAddress: string, loanId: string, lstToken: string, frequency: string) {
    try {
        const response = await axios.post(`${API_BASE_URL}/scheduler/setup-auto-repay`, {
            userAddress,
            loanId,
            lstToken,
            frequency
        })
        return response.data
    } catch (error) {
        console.error('Setup auto-repay error:', error)
        throw error
    }
}

export async function getUserObligations(userAddress: string) {
    try {
        const response = await axios.get(`${API_BASE_URL}/interest/user-obligations/${userAddress}`)
        return response.data
    } catch (error) {
        console.error('Get user obligations error:', error)
        throw error
    }
}

// Utility functions
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
    return ethers.formatUnits(amount, decimals)
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals)
}

export function formatUSD(amount: bigint): string {
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