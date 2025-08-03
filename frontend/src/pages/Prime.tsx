import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
    GlobeAltIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline'
import { useLendLinkPrime, usePythPrices } from '../hooks/useLendLinkPrime'
import { usePythPrices as usePythPricesBase } from '../hooks/usePythPrices'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Prime() {
    const { isConnected } = useAccount()
    const { crossChainLoans, protocolStats, supportedTokens, supportedChains, isLoading } = useLendLinkPrime()
    const { data: prices } = usePythPricesBase()

    const [activeTab, setActiveTab] = useState<'overview' | 'initiate' | 'manage' | 'bridge'>('overview')
    const [selectedSourceChain, setSelectedSourceChain] = useState(1)
    const [selectedDestChain, setSelectedDestChain] = useState(128123)
    const [selectedCollateral, setSelectedCollateral] = useState('stETH')
    const [selectedBorrow, setSelectedBorrow] = useState('USDC')
    const [collateralAmount, setCollateralAmount] = useState('')
    const [borrowAmount, setBorrowAmount] = useState('')

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading LendLink Prime...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">LendLink Prime</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Cross-chain lending powered by 1inch Fusion+ and Etherlink routing
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <ConnectButton />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <GlobeAltIcon className="h-4 w-4 inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('initiate')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'initiate'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <BanknotesIcon className="h-4 w-4 inline mr-2" />
                        Initiate Loan
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'manage'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <ChartBarIcon className="h-4 w-4 inline mr-2" />
                        Manage Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('bridge')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'bridge'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                        Bridge Status
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'overview' && <OverviewTab protocolStats={protocolStats} prices={prices} />}
            {activeTab === 'initiate' && (
                <InitiateTab
                    supportedChains={supportedChains}
                    supportedTokens={supportedTokens}
                    selectedSourceChain={selectedSourceChain}
                    setSelectedSourceChain={setSelectedSourceChain}
                    selectedDestChain={selectedDestChain}
                    setSelectedDestChain={setSelectedDestChain}
                    selectedCollateral={selectedCollateral}
                    setSelectedCollateral={setSelectedCollateral}
                    selectedBorrow={selectedBorrow}
                    setSelectedBorrow={setSelectedBorrow}
                    collateralAmount={collateralAmount}
                    setCollateralAmount={setCollateralAmount}
                    borrowAmount={borrowAmount}
                    setBorrowAmount={setBorrowAmount}
                />
            )}
            {activeTab === 'manage' && <ManageTab crossChainLoans={crossChainLoans} />}
            {activeTab === 'bridge' && <BridgeTab crossChainLoans={crossChainLoans} />}
        </div>
    )
}

// Overview Tab Component
function OverviewTab({ protocolStats, prices }: any) {
    return (
        <div className="space-y-6">
            {/* Protocol Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Cross-Chain TVL</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-primary-600">
                            ${protocolStats?.totalCrossChainTVL ? Number(protocolStats.totalCrossChainTVL).toLocaleString() : '5,000,000'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Total Value Locked</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Debt</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-warning-600">
                            ${protocolStats?.totalCrossChainDebt ? Number(protocolStats.totalCrossChainDebt).toLocaleString() : '2,500,000'}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Outstanding Loans</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Active Loans</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-info-600">
                            {protocolStats?.activeLoans || 25}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Cross-Chain Positions</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Total Bridges</h3>
                    </div>
                    <div className="card-body text-center">
                        <div className="text-3xl font-bold text-success-600">
                            {protocolStats?.totalBridges || 150}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Bridge Transactions</p>
                    </div>
                </div>
            </div>

            {/* Real-time Prices */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Real-time Cross-Chain Prices</h2>
                    <p className="text-sm text-gray-500">Powered by Pyth Network & 1inch Fusion+</p>
                </div>
                <div className="card-body">
                    {prices && prices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {prices.map((price: any) => (
                                <div key={price.symbol} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{price.symbol}</h3>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-gray-500">Live</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${price.price.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ± {((price.confidence / price.price) * 100).toFixed(2)}%
                                    </div>
                                </div>
                            ))}
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
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Cross-Chain Infrastructure</h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GlobeAltIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Etherlink Routing</h3>
                            <p className="text-sm text-gray-600">
                                Etherlink serves as the cross-chain settlement layer, routing transactions between chains
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowPathIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">1inch Fusion+</h3>
                            <p className="text-sm text-gray-600">
                                Advanced DEX aggregation with MEV protection and optimal routing across chains
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pyth Oracles</h3>
                            <p className="text-sm text-gray-600">
                                Real-time price feeds with sub-second updates and high accuracy across all chains
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Initiate Tab Component
function InitiateTab({
    supportedChains,
    supportedTokens,
    selectedSourceChain,
    setSelectedSourceChain,
    selectedDestChain,
    setSelectedDestChain,
    selectedCollateral,
    setSelectedCollateral,
    selectedBorrow,
    setSelectedBorrow,
    collateralAmount,
    setCollateralAmount,
    borrowAmount,
    setBorrowAmount
}: any) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Initiating cross-chain loan:', {
            sourceChain: selectedSourceChain,
            destChain: selectedDestChain,
            collateral: selectedCollateral,
            borrow: selectedBorrow,
            collateralAmount,
            borrowAmount
        })
    }

    return (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Initiate Cross-Chain Loan</h2>
                    <p className="text-sm text-gray-500">Bridge collateral and borrow across chains using 1inch Fusion+</p>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Chain Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Source Chain (Collateral)</label>
                                <select
                                    value={selectedSourceChain}
                                    onChange={(e) => setSelectedSourceChain(Number(e.target.value))}
                                    className="input"
                                    required
                                >
                                    {supportedChains.map((chain: any) => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.icon} {chain.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Destination Chain (Borrow)</label>
                                <select
                                    value={selectedDestChain}
                                    onChange={(e) => setSelectedDestChain(Number(e.target.value))}
                                    className="input"
                                    required
                                >
                                    {supportedChains.map((chain: any) => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.icon} {chain.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Token Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Collateral Token</label>
                                <select
                                    value={selectedCollateral}
                                    onChange={(e) => setSelectedCollateral(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="stETH">stETH - Liquid staked Ether</option>
                                    <option value="rETH">rETH - Rocket Pool ETH</option>
                                    <option value="USDC">USDC - USD Coin</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Borrow Token</label>
                                <select
                                    value={selectedBorrow}
                                    onChange={(e) => setSelectedBorrow(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="USDC">USDC - USD Coin</option>
                                    <option value="USDT">USDT - Tether</option>
                                    <option value="WETH">WETH - Wrapped Ether</option>
                                </select>
                            </div>
                        </div>

                        {/* Amount Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Collateral Amount</label>
                                <input
                                    type="number"
                                    value={collateralAmount}
                                    onChange={(e) => setCollateralAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="input"
                                    required
                                    min="0"
                                    step="0.000001"
                                />
                            </div>
                            <div>
                                <label className="label">Borrow Amount</label>
                                <input
                                    type="number"
                                    value={borrowAmount}
                                    onChange={(e) => setBorrowAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="input"
                                    required
                                    min="0"
                                    step="0.000001"
                                />
                            </div>
                        </div>

                        {/* Transaction Details */}
                        {collateralAmount && borrowAmount && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <h3 className="font-semibold text-gray-900">Transaction Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bridge Route:</span>
                                            <span className="font-medium">
                                                {getChainName(selectedSourceChain)} → {getChainName(selectedDestChain)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Collateral:</span>
                                            <span className="font-medium">{collateralAmount} {selectedCollateral}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Borrow:</span>
                                            <span className="font-medium">{borrowAmount} {selectedBorrow}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">LTV:</span>
                                            <span className="font-medium">80%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bridge Fee:</span>
                                            <span className="font-medium">~0.001 ETH</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Swap Fee:</span>
                                            <span className="font-medium">~0.3%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={!collateralAmount || !borrowAmount}
                        >
                            <GlobeAltIcon className="h-5 w-5 mr-2" />
                            Initiate Cross-Chain Loan
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Manage Tab Component
function ManageTab({ crossChainLoans }: any) {
    return (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Your Cross-Chain Loans</h2>
                </div>
                <div className="card-body">
                    {crossChainLoans && crossChainLoans.length > 0 ? (
                        <div className="space-y-4">
                            {crossChainLoans.map((loan: any) => (
                                <div key={loan.bridgeId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-1">
                                                <span>{getChainIcon(loan.sourceChain)}</span>
                                                <span className="text-sm text-gray-500">→</span>
                                                <span>{getChainIcon(loan.destinationChain)}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                                                {getLoanStatusText(loan.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(Number(loan.createdAt) * 1000).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Collateral:</span>
                                            <div className="font-medium">
                                                {formatCrossChainAmount(loan.collateralAmount)} {loan.collateralToken === '0x2222222222222222222222222222222222222222' ? 'stETH' : 'rETH'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Borrowed:</span>
                                            <div className="font-medium">
                                                {formatCrossChainAmount(loan.borrowAmount, 6)} USDC
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Health Factor:</span>
                                            <div className={`font-medium ${getHealthFactorStatus(loan.healthFactor)}`}>
                                                {Number(formatCrossChainAmount(loan.healthFactor)).toFixed(2)}x
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex space-x-2">
                                        <button className="btn-outline text-xs">
                                            View Details
                                        </button>
                                        {loan.status === 3 && (
                                            <button className="btn-primary text-xs">
                                                Repay
                                            </button>
                                        )}
                                        {loan.status === 1 && (
                                            <button className="btn-outline text-xs">
                                                Execute Swap
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No cross-chain loans</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Initiate your first cross-chain loan to get started
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Bridge Tab Component
function BridgeTab({ crossChainLoans }: any) {
    return (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h2 className="text-lg font-semibold text-gray-900">Bridge Status</h2>
                    <p className="text-sm text-gray-500">Monitor cross-chain bridge transactions</p>
                </div>
                <div className="card-body">
                    {crossChainLoans && crossChainLoans.length > 0 ? (
                        <div className="space-y-4">
                            {crossChainLoans.map((loan: any) => (
                                <div key={loan.bridgeId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <span>{getChainIcon(loan.sourceChain)}</span>
                                                <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                                                <span>{getChainIcon(loan.destinationChain)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {loan.status === 1 && <ClockIcon className="h-4 w-4 text-yellow-500" />}
                                                {loan.status === 3 && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                                                {loan.status === 7 && <XCircleIcon className="h-4 w-4 text-red-500" />}
                                                <span className="text-sm font-medium">{getLoanStatusText(loan.status)}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {loan.bridgeId.slice(0, 8)}...{loan.bridgeId.slice(-8)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Amount:</span>
                                            <div className="font-medium">
                                                {formatCrossChainAmount(loan.collateralAmount)} {loan.collateralToken === '0x2222222222222222222222222222222222222222' ? 'stETH' : 'rETH'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Bridge Fee:</span>
                                            <div className="font-medium">~0.001 ETH</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex space-x-2">
                                        <button className="btn-outline text-xs">
                                            View on Explorer
                                        </button>
                                        <button className="btn-outline text-xs">
                                            Track Status
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No bridge transactions</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Bridge transactions will appear here when you initiate cross-chain loans
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Import utility functions
import {
    getChainName,
    getChainIcon,
    getLoanStatusText,
    getLoanStatusColor,
    formatCrossChainAmount,
    getHealthFactorStatus
} from '../hooks/useLendLinkPrime' 