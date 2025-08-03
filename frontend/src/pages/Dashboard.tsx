import React from 'react'
import { useAccount } from 'wagmi'
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useLendLink } from '../hooks/useLendLink'
import { usePythPrices, formatPriceWithConfidence, getPriceStatus } from '../hooks/usePythPrices'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Dashboard() {
    const { isConnected } = useAccount()
    const { userPosition, totalTVL, totalDebt, isLoading } = useLendLink()
    const { data: prices, isLoading: isLoadingPrices } = usePythPrices()

    if (isLoading || isLoadingPrices) {
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
                <div className="mt-4 sm:mt-0">
                    <ConnectButton />
                </div>
            </div>

            {/* Real-time Price Feeds */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Real-time Market Prices</h2>
                    <p className="text-sm text-gray-500">Powered by Pyth Network</p>
                </div>
                <div className="card-body">
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

            {/* Protocol Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Total Value Locked</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-primary-600">
                            {formatUSD(totalTVL)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Protocol TVL</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Total Debt</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-warning-600">
                            {formatUSD(totalDebt)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Outstanding Loans</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Utilization Rate</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-info-600">
                            {totalTVL > 0 ? ((Number(totalDebt) / Number(totalTVL)) * 100).toFixed(1) : '0'}%
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Protocol Utilization</p>
                    </div>
                </div>
            </div>

            {/* User Position */}
            {isConnected && userPosition && userPosition.isActive && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-lg font-semibold text-gray-900">Your Position</h2>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Health Factor */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-900">Health Factor</h3>
                                <div className={`health-factor ${healthFactorStatus} mx-auto mb-2`}>
                                    <span>{healthFactorValue.toFixed(2)}x</span>
                                </div>
                                <p className="text-sm text-gray-600 text-center">
                                    {healthFactorStatus === 'safe' && 'Your position is healthy'}
                                    {healthFactorStatus === 'warning' && 'Monitor your position closely'}
                                    {healthFactorStatus === 'danger' && 'Add collateral or repay debt'}
                                </p>
                            </div>

                            {/* Position Summary */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-900">Position Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Collateral:</span>
                                        <span className="text-sm font-medium">
                                            {formatUSD(userPosition.totalCollateralValue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Borrowed:</span>
                                        <span className="text-sm font-medium">
                                            {formatUSD(userPosition.totalBorrowValue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Available to Borrow:</span>
                                        <span className="text-sm font-medium text-success-600">
                                            {formatUSD(userPosition.totalCollateralValue * 80n / 100n - userPosition.totalBorrowValue)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="btn-primary">
                            <TrendingUpIcon className="h-5 w-5 mr-2" />
                            Deposit Collateral
                        </button>
                        <button className="btn-outline">
                            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                            Borrow Assets
                        </button>
                        <button className="btn-outline">
                            <ChartBarIcon className="h-5 w-5 mr-2" />
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="card-body">
                    <div className="text-center text-gray-500 py-8">
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Your lending activity will appear here
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Import utility functions from useLendLink
import { formatUSD, formatTokenAmount, getHealthFactorStatus } from '../hooks/useLendLink' 