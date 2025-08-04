import React, { useEffect, useState } from 'react'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'

const PYTH_PRICE_FEEDS = {
    ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    stETH: '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5',
    rETH: '0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13',
} as const

export default function PythTest() {
    const [status, setStatus] = useState<string>('Initializing...')
    const [prices, setPrices] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }

    useEffect(() => {
        const testPyth = async () => {
            try {
                addLog('Starting Pyth test...')
                setStatus('Connecting to Pyth...')

                const pythConnection = new EvmPriceServiceConnection(
                    'https://hermes.pyth.network',
                    {
                        priceFeedRequestConfig: {
                            binary: true,
                        },
                    }
                )

                addLog('Pyth connection created')
                setStatus('Fetching price feeds...')

                // Test with timeout - fetch all available price feeds
                const priceFeedsPromise = pythConnection.getLatestPriceFeeds([
                    PYTH_PRICE_FEEDS.ETH,
                    PYTH_PRICE_FEEDS.stETH,
                    PYTH_PRICE_FEEDS.rETH
                ])

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
                )

                const priceFeeds = await Promise.race([priceFeedsPromise, timeoutPromise]) as any

                addLog(`Received ${priceFeeds?.length || 0} price feeds`)
                console.log('Pyth test - Raw response:', priceFeeds)

                if (!priceFeeds || priceFeeds.length === 0) {
                    throw new Error('No price feeds returned')
                }

                const processedPrices = priceFeeds.map((feed: any) => {
                    // Convert price from string to number and apply exponent
                    const priceString = feed.price?.price
                    const exponent = feed.price?.expo
                    const price = priceString && exponent ? parseFloat(priceString) * Math.pow(10, exponent) : 0

                    // Convert confidence from string to number
                    const confidence = feed.price?.confidence ? parseFloat(feed.price.confidence) : 0

                    // Map feed ID to symbol
                    let symbol = 'UNKNOWN'
                    const feedId = feed.id

                    if (feedId === PYTH_PRICE_FEEDS.ETH || feedId === PYTH_PRICE_FEEDS.ETH.substring(2)) {
                        symbol = 'ETH'
                    } else if (feedId === PYTH_PRICE_FEEDS.stETH || feedId === PYTH_PRICE_FEEDS.stETH.substring(2)) {
                        symbol = 'stETH'
                    } else if (feedId === PYTH_PRICE_FEEDS.rETH || feedId === PYTH_PRICE_FEEDS.rETH.substring(2)) {
                        symbol = 'rETH'
                    }

                    return {
                        id: feed.id,
                        price: price,
                        confidence: confidence,
                        timestamp: feed.price?.publishTime,
                        symbol: symbol
                    }
                })

                setPrices(processedPrices)
                setStatus('Success!')
                setError(null)
                addLog('Pyth test completed successfully')

            } catch (err) {
                console.error('Pyth test error:', err)
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setStatus('Failed')
                addLog(`Error: ${errorMessage}`)
            }
        }

        testPyth()
    }, [])

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pyth Network Test</h3>

            <div className="mb-4">
                <p className="text-sm text-gray-600">Status: {status}</p>
                {error && (
                    <p className="text-sm text-red-600 mt-2">Error: {error}</p>
                )}
            </div>

            {prices.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-medium mb-2">Price Feeds:</h4>
                    <div className="space-y-2">
                        {prices.map((price, index) => (
                            <div key={index} className="text-sm">
                                <p><strong>{price.symbol}:</strong> ${typeof price.price === 'number' ? price.price.toFixed(2) : 'N/A'}</p>
                                <p className="text-gray-500">Confidence: {typeof price.confidence === 'number' ? price.confidence.toFixed(6) : 'N/A'}</p>
                                <p className="text-gray-500">Timestamp: {price.timestamp ? new Date(price.timestamp * 1000).toLocaleString() : 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h4 className="font-medium mb-2">Debug Logs:</h4>
                <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
                    {logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry Test
                </button>
            </div>
        </div>
    )
} 