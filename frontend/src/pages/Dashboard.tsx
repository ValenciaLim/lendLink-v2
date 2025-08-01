import React from 'react'
import { useAccount } from 'wagmi'
import {
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    ClockIcon,
    UserGroupIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    FireIcon,
    SparklesIcon
} from '@heroicons/react/24/outline'
import { useLendLink, formatUSD, formatTokenAmount, getHealthFactorStatus } from '../hooks/useLendLink'

export default function Dashboard() {
    const { isConnected } = useAccount()
    const {
        userPosition,
        userCollaterals,
        userBorrows,
        totalTVL,
        totalDebt,
        isLoading
    } = useLendLink()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-12 h-12 mx-auto mb-6"></div>
                    <p className="text-slate-600 font-medium">Loading your positions...</p>
                </div>
            </div>
        )
    }

    const healthFactorStatus = userPosition ? getHealthFactorStatus(userPosition.healthFactor) : 'safe'
    const healthFactorValue = userPosition ? Number(formatTokenAmount(userPosition.healthFactor, 18)) : 0

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl"></div>
                <div className="relative px-8 py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4">
                                Welcome to LendLink
                            </h1>
                            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                                The next-generation decentralized lending protocol for Liquid Staking Tokens.
                                Deposit, borrow, and earn with institutional-grade security.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="btn-outline">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block lg:ml-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <BanknotesIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Protocol Stats</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600">TVL</span>
                                                <span className="font-semibold text-slate-900">{formatUSD(totalTVL)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600">Total Debt</span>
                                                <span className="font-semibold text-slate-900">{formatUSD(totalDebt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protocol Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card group">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <BanknotesIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="stat-value">{formatUSD(totalTVL)}</p>
                                    <p className="stat-label">Total Value Locked</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-600 text-sm font-semibold">+12.5%</span>
                                <span className="text-slate-500 text-xs">vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="stat-value">{formatUSD(totalDebt)}</p>
                                    <p className="stat-label">Total Debt</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-600 text-sm font-semibold">+8.3%</span>
                                <span className="text-slate-500 text-xs">vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                                    <UserGroupIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="stat-value">1,247</p>
                                    <p className="stat-label">Active Users</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-600 text-sm font-semibold">+15.2%</span>
                                <span className="text-slate-500 text-xs">vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card group">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <ChartBarIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="stat-value">$2.4M</p>
                                    <p className="stat-label">24h Volume</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-600 text-sm font-semibold">+23.7%</span>
                                <span className="text-slate-500 text-xs">vs last day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Position Overview */}
            {userPosition && userPosition.isActive && (
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Your Position</h2>
                                <p className="text-slate-600 mt-1">Real-time overview of your lending activities</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`network-status ${isConnected ? 'connected' : 'disconnected'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Health Factor */}
                            <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                                <div className={`health-factor ${healthFactorStatus} mx-auto mb-4`}>
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    <span className="text-lg font-bold">{healthFactorValue.toFixed(2)}x</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Health Factor</p>
                                {healthFactorStatus === 'danger' && (
                                    <div className="liquidation-warning">
                                        <div className="flex items-center gap-2">
                                            <FireIcon className="w-4 h-4 liquidation-warning-icon" />
                                            <span className="liquidation-warning-text text-sm">Risk of liquidation</span>
                                        </div>
                                    </div>
                                )}
                                {healthFactorStatus === 'warning' && (
                                    <p className="text-xs text-amber-600 font-medium">
                                        <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                                        Monitor closely
                                    </p>
                                )}
                                {healthFactorStatus === 'safe' && (
                                    <p className="text-xs text-emerald-600 font-medium">
                                        <ShieldCheckIcon className="h-3 w-3 inline mr-1" />
                                        Position healthy
                                    </p>
                                )}
                            </div>

                            {/* Collateral Value */}
                            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50">
                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <BanknotesIcon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mb-2">
                                    {formatUSD(userPosition.totalCollateralValue)}
                                </p>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Total Collateral</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-emerald-600 text-sm font-semibold">+5.2%</span>
                                    <span className="text-slate-500 text-xs">this week</span>
                                </div>
                            </div>

                            {/* Borrow Value */}
                            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <CurrencyDollarIcon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 mb-2">
                                    {formatUSD(userPosition.totalBorrowValue)}
                                </p>
                                <p className="text-sm font-semibold text-slate-700 mb-2">Total Borrowed</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-amber-600 text-sm font-semibold">+2.1%</span>
                                    <span className="text-slate-500 text-xs">this week</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collateral Details */}
            {userCollaterals && userCollaterals.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-2xl font-bold text-slate-900">Your Collateral</h2>
                        <p className="text-slate-600 mt-1">Assets deposited as collateral for borrowing</p>
                    </div>
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Amount</th>
                                        <th>Value</th>
                                        <th>LTV</th>
                                        <th>Liquidation Threshold</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userCollaterals.map((collateral, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="token-icon bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                                    <span className="font-semibold text-slate-900">{collateral.token}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="token-amount">{formatTokenAmount(collateral.amount)}</span>
                                                <span className="token-symbol">{collateral.token}</span>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-slate-900">{formatUSD(collateral.value)}</span>
                                            </td>
                                            <td>
                                                <span className="badge-info">
                                                    {(Number(formatTokenAmount(collateral.ltv, 18)) * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge-warning">
                                                    {(Number(formatTokenAmount(collateral.liquidationThreshold, 18)) * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${collateral.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                    {collateral.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Borrow Details */}
            {userBorrows && userBorrows.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-2xl font-bold text-slate-900">Your Borrows</h2>
                        <p className="text-slate-600 mt-1">Assets borrowed against your collateral</p>
                    </div>
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Amount</th>
                                        <th>Value</th>
                                        <th>Interest Rate</th>
                                        <th>Last Updated</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userBorrows.map((borrow, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="token-icon bg-gradient-to-r from-emerald-600 to-green-600"></div>
                                                    <span className="font-semibold text-slate-900">{borrow.token}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="token-amount">{formatTokenAmount(borrow.amount)}</span>
                                                <span className="token-symbol">{borrow.token}</span>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-slate-900">{formatUSD(borrow.value)}</span>
                                            </td>
                                            <td>
                                                <span className="badge-warning">
                                                    {(Number(formatTokenAmount(borrow.interestRate, 18)) * 100).toFixed(2)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-slate-600">
                                                    {new Date(Number(borrow.lastUpdateTime) * 1000).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${borrow.isActive ? 'badge-success' : 'badge-neutral'}`}>
                                                    {borrow.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* No Position State */}
            {(!userPosition || !userPosition.isActive) && (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <BanknotesIcon className="h-16 w-16" />
                        </div>
                        <h3 className="empty-state-title">No Active Position</h3>
                        <p className="empty-state-description">
                            Start your lending journey by depositing collateral to borrow assets.
                            Earn rewards while maintaining healthy positions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/lending" className="btn-primary">
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Start Lending
                            </a>
                            <button className="btn-outline">
                                <ChartBarIcon className="w-5 h-5 mr-2" />
                                View Analytics
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 