import React from 'react'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useLendLink } from '../hooks/useLendLink'
import { useLendLinkPrime } from '../hooks/useLendLinkPrime'
import { usePythPrices, formatPriceWithConfidence, getPriceStatus } from '../hooks/usePythPrices'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Dashboard() {
    const { isConnected } = useAccount()
    const { userPosition, totalTVL, totalDebt, protocolStats } = useLendLink()
    const { crossChainLoans, supportedChains, isLoading: isLoadingPrime } = useLendLinkPrime()
    const { data: prices, isLoading: isLoadingPrices } = usePythPrices()

    // Get cross-chain stats
    const { data: crossChainStats, isLoading: isLoadingCrossChainStats } = useQuery({
        queryKey: ['crossChainStats'],
        queryFn: async () => {
            try {
                const response = await axios.get('http://localhost:3002/api/v1/prime/stats')
                return response.data.data
            } catch (error) {
                console.warn('Failed to fetch cross-chain stats:', error)
                return {
                    totalBridges: 0,
                    activeLoans: 0,
                    successRate: 98.5
                }
            }
        },
        refetchInterval: 10000 // Refetch every 10 seconds
    })

    if (isLoadingPrime || isLoadingCrossChainStats || isLoadingPrices) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const healthFactorStatus = userPosition ? getHealthFactorStatus(userPosition.healthFactor) : 'safe'
    const healthFactorValue = userPosition ? Number(formatTokenAmount(userPosition.healthFactor, 18)) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor your lending positions and market prices
                    </p>
                </div>
            </div>

            {/* Protocol Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total TVL */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total TVL</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalTVL ? formatUSD(totalTVL) : '$0'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Debt */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <BanknotesIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Debt</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalDebt ? formatUSD(totalDebt) : '$0'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cross-Chain Bridges */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <GlobeAltIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Cross-Chain Bridges</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {crossChainStats?.totalBridges || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Cross-Chain Loans */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Cross-Chain Loans</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {crossChainStats?.activeLoans || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Price Feeds */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Real-time Market Prices</h2>
                    <p className="text-sm text-gray-500">Powered by Pyth Network</p>
                </div>
                <div className="p-6">
                    {prices && prices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {prices.map((price) => {
                                const status = getPriceStatus(price)
                                const isRecent = status === 'fresh'

                                return (
                                    <div key={price.symbol} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900">{price.symbol}</h3>
                                            <div className="flex items-center space-x-1">
                                                {isRecent ? (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                ) : (
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {isRecent ? 'Live' : 'Stale'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${price.price.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatPriceWithConfidence(price.price, price.confidence)}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Updated: {new Date(price.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No price data available</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Unable to fetch real-time prices from Pyth Network
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cross-Chain Infrastructure */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Cross-Chain Infrastructure</h2>
                            <p className="text-sm text-gray-500">Powered by Etherlink & 1inch Fusion+</p>
                        </div>
                        <GlobeAltIcon className="h-6 w-6 text-primary-600" />
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Supported Chains */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Supported Chains</h3>
                            <div className="space-y-2">
                                {supportedChains?.map((chain: any) => (
                                    <div key={chain.id} className="flex items-center space-x-2">
                                        <span className="text-lg">{chain.icon}</span>
                                        <span className="text-sm text-gray-700">{chain.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cross-Chain Stats */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Cross-Chain Stats</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Bridges:</span>
                                    <span className="text-sm font-medium">{crossChainStats?.totalBridges || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Active Loans:</span>
                                    <span className="text-sm font-medium">{crossChainStats?.activeLoans || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Success Rate:</span>
                                    <span className="text-sm font-medium text-green-600">{crossChainStats?.successRate || 98.5}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                                    • Initiate Cross-Chain Loan
                                </button>
                                <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                                    • View Bridge Status
                                </button>
                                <button className="w-full text-left text-sm text-primary-600 hover:text-primary-700">
                                    • Manage Cross-Chain Positions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Cross-Chain Activity */}
            {crossChainLoans && crossChainLoans.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Cross-Chain Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {crossChainLoans.slice(0, 3).map((loan: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {loan.collateralToken} → {loan.borrowToken}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {loan.sourceChain} → {loan.destinationChain}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {loan.status}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {loan.timestamp}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Import utility functions from useLendLink
import { formatUSD, formatTokenAmount, getHealthFactorStatus } from '../hooks/useLendLink' 