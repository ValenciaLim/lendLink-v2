import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useLendLink, formatUSD, formatTokenAmount, getHealthFactorStatus, depositCollateral, borrow, repay, setupAutoRepay, getUserObligations } from '../hooks/useLendLink'
import { useLendLinkPrime } from '../hooks/useLendLinkPrime'
import { use1inch } from '../hooks/use1inch'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Lending() {
    const { isConnected } = useAccount()
    const {
        userPosition,
        userCollaterals,
        userBorrows,
        isLoading
    } = useLendLink()

    // Prime functionality
    const { crossChainLoans, protocolStats: primeStats, supportedChains, isLoading: isLoadingPrime } = useLendLinkPrime()

    // 1inch functionality
    const { 
        getSwapQuote, 
        executeSwap, 
        getCrossChainSwapQuote, 
        executeCrossChainSwap,
        getTokenPrice,
        loading: isLoading1inch,
        error: error1inch,
        clearError: clearError1inch
    } = use1inch()

    const [activeTab, setActiveTab] = useState<'deposit' | 'borrow' | 'repay' | 'auto-repay' | 'cross-chain'>('deposit')
    const [selectedToken, setSelectedToken] = useState('')
    const [amount, setAmount] = useState('')

    // Cross-chain form state
    const [selectedSourceChain, setSelectedSourceChain] = useState(1)
    const [selectedDestChain, setSelectedDestChain] = useState(128123)
    const [selectedCollateral, setSelectedCollateral] = useState('stETH')
    const [selectedBorrow, setSelectedBorrow] = useState('USDC')
    const [collateralAmount, setCollateralAmount] = useState('')
    const [borrowAmount, setBorrowAmount] = useState('')

    // Swap state
    const [swapQuote, setSwapQuote] = useState<any>(null)
    const [isGettingQuote, setIsGettingQuote] = useState(false)

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

    if (isLoading || isLoadingPrime) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedToken || !amount) {
            alert('Please select a token and enter amount')
            return
        }

        const userAddress = '0x1234567890123456789012345678901234567890' // Mock address for now

        try {
            let result
            switch (activeTab) {
                case 'deposit':
                    result = await depositCollateral(selectedToken, amount, userAddress)
                    if (result.success) {
                        alert(`Successfully deposited ${amount} ${selectedToken}`)
                        setAmount('')
                        setSelectedToken('')
                    } else {
                        alert('Failed to deposit collateral')
                    }
                    break
                case 'borrow':
                    result = await borrow(selectedToken, amount, userAddress)
                    if (result.success) {
                        alert(`Successfully borrowed ${amount} ${selectedToken}`)
                        setAmount('')
                        setSelectedToken('')
                    } else {
                        alert('Failed to borrow assets')
                    }
                    break
                case 'repay':
                    result = await repay(selectedToken, amount, userAddress)
                    if (result.success) {
                        alert(`Successfully repaid ${amount} ${selectedToken}`)
                        setAmount('')
                        setSelectedToken('')
                    } else {
                        alert('Failed to repay debt')
                    }
                    break
                default:
                    console.log(`${activeTab} ${amount} ${selectedToken}`)
            }
        } catch (error) {
            console.error('Transaction error:', error)
            alert('Transaction failed. Please try again.')
        }
    }

    const handleCrossChainSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!collateralAmount || !borrowAmount) {
            alert('Please enter both collateral and borrow amounts')
            return
        }

        try {
            // Get cross-chain swap quote
            const quote = await getCrossChainSwapQuote(
                selectedCollateral,
                selectedBorrow,
                collateralAmount,
                selectedSourceChain,
                selectedDestChain
            )

            if (quote) {
                // Execute cross-chain swap
                const result = await executeCrossChainSwap({
                    ...quote,
                    from: '0x0000000000000000000000000000000000000000', // Mock address
                    slippage: 0.5
                })

                if (result?.success) {
                    alert(`Cross-chain swap executed! TX: ${result.txHash}`)
                    // Reset form
                    setCollateralAmount('')
                    setBorrowAmount('')
                } else {
                    alert('Failed to execute cross-chain swap')
                }
            } else {
                alert('Failed to get swap quote')
            }
        } catch (error) {
            console.error('Cross-chain swap error:', error)
            alert('Error executing cross-chain swap')
        }
    }

    const handleGetQuote = async () => {
        if (!selectedToken || !amount) {
            alert('Please select a token and enter amount')
            return
        }

        setIsGettingQuote(true)
        try {
            const quote = await getSwapQuote(
                selectedToken,
                'USDC', // Default destination
                amount,
                1 // Default chain
            )
            setSwapQuote(quote)
        } catch (error) {
            console.error('Quote error:', error)
        } finally {
            setIsGettingQuote(false)
        }
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

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('deposit')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'deposit'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <ArrowUpIcon className="h-4 w-4 inline mr-2" />
                        Deposit
                    </button>
                    <button
                        onClick={() => setActiveTab('borrow')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'borrow'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <ArrowDownIcon className="h-4 w-4 inline mr-2" />
                        Borrow
                    </button>
                    <button
                        onClick={() => setActiveTab('repay')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'repay'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <BanknotesIcon className="h-4 w-4 inline mr-2" />
                        Repay
                    </button>
                    <button
                        onClick={() => setActiveTab('auto-repay')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'auto-repay'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                        Auto-Repay
                    </button>
                    <button
                        onClick={() => setActiveTab('cross-chain')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'cross-chain'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <GlobeAltIcon className="h-4 w-4 inline mr-2" />
                        Cross-Chain
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'deposit' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Deposit Collateral</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Token
                            </label>
                            <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select a token</option>
                                {supportedTokens.filter(token => ['stETH', 'rETH'].includes(token.symbol)).map(token => (
                                    <option key={token.symbol} value={token.symbol}>
                                        {token.symbol} - {token.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Deposit Collateral
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'borrow' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Borrow Assets</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Token
                            </label>
                            <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select a token</option>
                                {supportedTokens.filter(token => ['USDC'].includes(token.symbol)).map(token => (
                                    <option key={token.symbol} value={token.symbol}>
                                        {token.symbol} - {token.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Borrow Assets
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'repay' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Repay Debt</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Token
                            </label>
                            <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select a token</option>
                                {supportedTokens.filter(token => ['USDC'].includes(token.symbol)).map(token => (
                                    <option key={token.symbol} value={token.symbol}>
                                        {token.symbol} - {token.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Repay Debt
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'auto-repay' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Automatic Interest Repayment</h2>
                    <div className="space-y-6">
                        {/* Auto-Repay Status */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ArrowPathIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900">Auto-Repay Status</h3>
                                    <p className="text-sm text-blue-700">
                                        Automatically repay loan interest using LST earnings
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Setup Auto-Repay Form */}
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            if (!selectedToken || !amount) {
                                alert('Please select LST token and enter frequency')
                                return
                            }
                            
                            const userAddress = '0x1234567890123456789012345678901234567890'
                            const loanId = '0x1234567890123456789012345678901234567890123456789012345678901234'
                            
                            try {
                                const result = await setupAutoRepay(userAddress, loanId, selectedToken, amount)
                                if (result.success) {
                                    alert('Auto-repay schedule created successfully!')
                                    setAmount('')
                                    setSelectedToken('')
                                } else {
                                    alert('Failed to setup auto-repay')
                                }
                            } catch (error) {
                                console.error('Auto-repay setup error:', error)
                                alert('Failed to setup auto-repay')
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    LST Token
                                </label>
                                <select
                                    value={selectedToken}
                                    onChange={(e) => setSelectedToken(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select LST token</option>
                                    <option value="stETH">stETH - Lido Finance</option>
                                    <option value="rETH">rETH - Rocket Pool</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Repayment Frequency
                                </label>
                                <select
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select frequency</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Setup Auto-Repay
                            </button>
                        </form>

                        {/* Auto-Repay Benefits */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-green-900 mb-2">Benefits</h3>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Automatic interest payments using LST yield</li>
                                <li>• No manual intervention required</li>
                                <li>• Optimized for gas efficiency</li>
                                <li>• Real-time yield monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'cross-chain' && (
                <div className="space-y-6">
                    {/* Cross-Chain Overview */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Cross-Chain Lending</h2>
                            <div className="flex items-center space-x-2">
                                <GlobeAltIcon className="h-5 w-5 text-primary-600" />
                                <span className="text-sm text-gray-600">Powered by 1inch Fusion+</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Bridge collateral across chains and borrow assets on any supported network using Etherlink routing.
                        </p>

                        {/* Protocol Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {primeStats?.totalCrossChainTVL ? formatUSD(BigInt(primeStats.totalCrossChainTVL)) : '$0'}
                                </div>
                                <div className="text-sm text-gray-600">Cross-Chain TVL</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {crossChainLoans?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Active Loans</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-gray-900">
                                    {supportedChains?.length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Supported Chains</div>
                            </div>
                        </div>
                    </div>

                    {/* Cross-Chain Loan Form */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Initiate Cross-Chain Loan</h3>
                        <form onSubmit={handleCrossChainSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Source Chain
                                    </label>
                                    <select
                                        value={selectedSourceChain}
                                        onChange={(e) => setSelectedSourceChain(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {supportedChains?.map((chain: any) => (
                                            <option key={chain.id} value={chain.id}>
                                                {chain.icon} {chain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Destination Chain
                                    </label>
                                    <select
                                        value={selectedDestChain}
                                        onChange={(e) => setSelectedDestChain(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {supportedChains?.map((chain: any) => (
                                            <option key={chain.id} value={chain.id}>
                                                {chain.icon} {chain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collateral Token
                                    </label>
                                    <select
                                        value={selectedCollateral}
                                        onChange={(e) => setSelectedCollateral(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="stETH">stETH - Liquid staked Ether</option>
                                        <option value="rETH">rETH - Rocket Pool ETH</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Borrow Token
                                    </label>
                                    <select
                                        value={selectedBorrow}
                                        onChange={(e) => setSelectedBorrow(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="USDC">USDC - USD Coin</option>
                                        <option value="USDT">USDT - Tether</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collateral Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={collateralAmount}
                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Borrow Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={borrowAmount}
                                        onChange={(e) => setBorrowAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <GlobeAltIcon className="h-4 w-4 inline mr-2" />
                                Initiate Cross-Chain Loan
                            </button>
                        </form>
                    </div>

                    {/* Active Cross-Chain Loans */}
                    {crossChainLoans && crossChainLoans.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Cross-Chain Loans</h3>
                            <div className="space-y-4">
                                {crossChainLoans.map((loan: any, index: number) => (
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
                    )}
                </div>
            )}
        </div>
    )
} 