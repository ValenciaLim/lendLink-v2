import React from 'react'
import { useAccount } from 'wagmi'
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useLendLink, formatUSD } from '../hooks/useLendLink'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Analytics() {
    const { isConnected } = useAccount()
    const { totalTVL, totalDebt, protocolStats } = useLendLink()

    // if (!isConnected) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <div className="mx-auto h-12 w-12 text-gray-400">
    //                     <ChartBarIcon className="h-12 w-12" />
    //                 </div>
    //                 <h3 className="mt-2 text-sm font-semibold text-gray-900">Connect Wallet</h3>
    //                 <p className="mt-1 text-sm text-gray-500">
    //                     Connect your wallet to view protocol analytics
    //                 </p>
    //                 <div className="mt-6">
    //                     <ConnectButton />
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Protocol statistics and performance metrics
                    </p>
                </div>
            </div>

                         {/* Overview Stats */}
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {totalTVL ? formatUSD(totalTVL) : '$0'}
                                </p>
                                <p className="text-sm text-gray-500">Total Value Locked</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {totalDebt ? formatUSD(totalDebt) : '$0'}
                                </p>
                                <p className="text-sm text-gray-500">Total Debt</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {protocolStats?.totalTransactions || 0}
                                </p>
                                <p className="text-sm text-gray-500">Total Transactions</p>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TVL Chart */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Total Value Locked</h3>
                        <div className="mt-4">
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Chart placeholder - TVL over time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debt Chart */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Total Debt</h3>
                        <div className="mt-4">
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-500">Chart placeholder - Debt over time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                    <div className="mt-4">
                        <div className="flow-root">
                            <ul className="-mb-8">
                                <li>
                                    <div className="relative pb-8">
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                                    <CurrencyDollarIcon className="h-4 w-4 text-white" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">New deposit of <span className="font-medium text-gray-900">50 stETH</span></p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time>2h ago</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="relative pb-8">
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                    <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Borrow of <span className="font-medium text-gray-900">25,000 USDC</span></p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time>5h ago</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 