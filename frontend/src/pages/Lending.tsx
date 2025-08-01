import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useLendLink, formatUSD, formatTokenAmount, getHealthFactorStatus } from '../hooks/useLendLink'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Lending() {
    const { isConnected } = useAccount()
    const {
        userPosition,
        userCollaterals,
        userBorrows,
        isLoading
    } = useLendLink()

    const [activeTab, setActiveTab] = useState<'deposit' | 'borrow' | 'repay'>('deposit')
    const [selectedToken, setSelectedToken] = useState('')
    const [amount, setAmount] = useState('')

    // if (!isConnected) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <div className="mx-auto h-12 w-12 text-gray-400">
    //                     <BanknotesIcon className="h-12 w-12" />
    //                 </div>
    //                 <h3 className="mt-2 text-sm font-semibold text-gray-900">Connect Wallet</h3>
    //                 <p className="mt-1 text-sm text-gray-500">
    //                     Connect your wallet to start lending and borrowing
    //                 </p>
    //                 <div className="mt-6">
    //                     <ConnectButton />
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your positions...</p>
                </div>
            </div>
        )
    }

    const healthFactorStatus = userPosition ? getHealthFactorStatus(userPosition.healthFactor) : 'safe'
    const healthFactorValue = userPosition ? Number(formatTokenAmount(userPosition.healthFactor, 18)) : 0

    const supportedTokens = [
        { address: '0x2222222222222222222222222222222222222222', symbol: 'stETH', name: 'Liquid staked Ether' },
        { address: '0x3333333333333333333333333333333333333333', symbol: 'rETH', name: 'Rocket Pool ETH' },
        { address: '0x1111111111111111111111111111111111111111', symbol: 'USDC', name: 'USD Coin' },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle transaction submission
        console.log(`${activeTab} ${amount} ${selectedToken}`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lending</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Deposit LSTs as collateral and borrow stablecoins
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <ConnectButton />
                </div>
            </div>

            {/* Health Factor Warning */}
            {healthFactorStatus === 'danger' && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                    <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-danger-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-danger-800">
                                Health Factor Critical
                            </h3>
                            <p className="mt-1 text-sm text-danger-700">
                                Your position is at risk of liquidation. Consider adding more collateral or repaying debt.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Lending Interface */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="card-header">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveTab('deposit')}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'deposit'
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <ArrowDownIcon className="h-4 w-4 inline mr-1" />
                                    Deposit Collateral
                                </button>
                                <button
                                    onClick={() => setActiveTab('borrow')}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'borrow'
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <ArrowUpIcon className="h-4 w-4 inline mr-1" />
                                    Borrow Assets
                                </button>
                                <button
                                    onClick={() => setActiveTab('repay')}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'repay'
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <BanknotesIcon className="h-4 w-4 inline mr-1" />
                                    Repay Debt
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Token Selection */}
                                <div>
                                    <label className="label">
                                        {activeTab === 'deposit' ? 'Collateral Token' :
                                            activeTab === 'borrow' ? 'Borrow Token' : 'Repay Token'}
                                    </label>
                                    <select
                                        value={selectedToken}
                                        onChange={(e) => setSelectedToken(e.target.value)}
                                        className="input"
                                        required
                                    >
                                        <option value="">Select a token</option>
                                        {supportedTokens.map((token) => (
                                            <option key={token.address} value={token.address}>
                                                {token.symbol} - {token.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount Input */}
                                <div>
                                    <label className="label">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="input"
                                        required
                                        min="0"
                                        step="0.000001"
                                    />
                                </div>

                                {/* Transaction Details */}
                                {amount && selectedToken && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Token:</span>
                                            <span className="font-medium">
                                                {supportedTokens.find(t => t.address === selectedToken)?.symbol}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-medium">{amount}</span>
                                        </div>
                                        {activeTab === 'deposit' && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">LTV:</span>
                                                <span className="font-medium">80%</span>
                                            </div>
                                        )}
                                        {activeTab === 'borrow' && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Interest Rate:</span>
                                                <span className="font-medium">8% APY</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn-primary w-full"
                                    disabled={!amount || !selectedToken}
                                >
                                    {activeTab === 'deposit' ? 'Deposit Collateral' :
                                        activeTab === 'borrow' ? 'Borrow Assets' : 'Repay Debt'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Position Overview */}
                <div className="space-y-6">
                    {/* Health Factor */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Health Factor</h3>
                        </div>
                        <div className="card-body text-center">
                            <div className={`health-factor ${healthFactorStatus} mx-auto mb-2`}>
                                <ShieldCheckIcon className="h-4 w-4" />
                                <span>{healthFactorValue.toFixed(2)}x</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {healthFactorStatus === 'safe' && 'Your position is healthy'}
                                {healthFactorStatus === 'warning' && 'Monitor your position closely'}
                                {healthFactorStatus === 'danger' && 'Add collateral or repay debt'}
                            </p>
                        </div>
                    </div>

                    {/* Position Summary */}
                    {userPosition && userPosition.isActive && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Position Summary</h3>
                            </div>
                            <div className="card-body space-y-3">
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
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="card-body space-y-2">
                            <button className="btn-outline w-full text-sm">
                                Execute Auto-Repay
                            </button>
                            <button className="btn-outline w-full text-sm">
                                View All Positions
                            </button>
                            <button className="btn-outline w-full text-sm">
                                Emergency Withdraw
                            </button>
                        </div>
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
                        <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
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