import { useQuery } from '@tanstack/react-query'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'

// Correct Pyth price feed IDs from the official documentation
export const PYTH_PRICE_FEEDS = {
    // Ethereum price feed - this is the correct ID
    ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    // USDC doesn't have a direct Pyth feed, so we'll use a stable value
    USDC: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // Use ETH feed ID temporarily
    // stETH USD price feed (Liquid staked Ether)
    stETH: '0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5',
    // rETH USD price feed (Rocket Pool ETH)
    rETH: '0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13',
} as const

export interface TokenPrice {
    symbol: string
    price: number
    confidence: number
    timestamp: number
    priceFeedId: string
    status: 'live' | 'stale' | 'error'
}

// Initialize Pyth connection with proper configuration
const pythConnection = new EvmPriceServiceConnection(
    'https://hermes.pyth.network',
    {
        priceFeedRequestConfig: {
            binary: true,
        },
    }
)

// Fallback prices for when Pyth is unavailable
const FALLBACK_PRICES = {
    ETH: { price: 2000, confidence: 0.01 },
    USDC: { price: 1, confidence: 0.001 },
    stETH: { price: 2000, confidence: 0.01 },
    rETH: { price: 2000, confidence: 0.01 },
}

export function usePythPrices() {
    return useQuery({
        queryKey: ['pythPrices'],
        queryFn: async (): Promise<TokenPrice[]> => {
            try {
                console.log('🔄 Fetching Pyth price feeds...')

                // Fetch all available price feeds (ETH, stETH, rETH)
                const uniquePriceFeedIds = [
                    PYTH_PRICE_FEEDS.ETH,
                    PYTH_PRICE_FEEDS.stETH,
                    PYTH_PRICE_FEEDS.rETH
                ]

                console.log('🎯 Requesting price feeds for:', uniquePriceFeedIds)

                // Fetch latest price feeds with timeout
                const priceFeedsPromise = pythConnection.getLatestPriceFeeds(uniquePriceFeedIds)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Pyth request timeout')), 10000)
                )

                const priceFeeds = await Promise.race([priceFeedsPromise, timeoutPromise]) as any

                console.log('📊 Raw price feeds response:', priceFeeds)

                if (!priceFeeds || priceFeeds.length === 0) {
                    console.warn('⚠️ No price feeds returned from Pyth')
                    throw new Error('No price feeds available')
                }

                console.log(`✅ Received ${priceFeeds.length} price feeds from Pyth`)

                // Map price feeds to token prices
                const tokenPrices: TokenPrice[] = []
                const now = Date.now()

                for (const priceFeed of priceFeeds) {
                    console.log('🔍 Processing price feed:', priceFeed?.id, priceFeed?.price)

                    if (priceFeed && priceFeed.price) {
                        // Convert price from string to number and apply exponent
                        const priceString = priceFeed.price.price
                        const exponent = priceFeed.price.expo
                        const price = parseFloat(priceString) * Math.pow(10, exponent)

                        // Convert confidence from string to number
                        const confidence = parseFloat(priceFeed.price.confidence)
                        const timestamp = priceFeed.price.publishTime * 1000 // Convert to milliseconds

                        // Determine status based on timestamp
                        const isRecent = (now - timestamp) < 5 * 60 * 1000 // 5 minutes
                        const status: 'live' | 'stale' | 'error' = isRecent ? 'live' : 'stale'

                        // Map price feed ID to symbol (handle both with and without 0x prefix)
                        let symbol = 'UNKNOWN'
                        const feedId = priceFeed.id

                        if (feedId === PYTH_PRICE_FEEDS.ETH || feedId === PYTH_PRICE_FEEDS.ETH.substring(2)) {
                            symbol = 'ETH'
                        } else if (feedId === PYTH_PRICE_FEEDS.stETH || feedId === PYTH_PRICE_FEEDS.stETH.substring(2)) {
                            symbol = 'stETH'
                        } else if (feedId === PYTH_PRICE_FEEDS.rETH || feedId === PYTH_PRICE_FEEDS.rETH.substring(2)) {
                            symbol = 'rETH'
                        }

                        if (symbol !== 'UNKNOWN') {
                            tokenPrices.push({
                                symbol,
                                price,
                                confidence,
                                timestamp,
                                priceFeedId: priceFeed.id,
                                status,
                            })

                            console.log(`✅ Processed ${symbol}: $${price} ± ${confidence}`)
                        } else {
                            console.warn(`⚠️ Unknown price feed ID: ${priceFeed.id}`)
                        }
                    } else {
                        console.warn('⚠️ Invalid price feed data:', priceFeed)
                    }
                }

                // Create USDC price (stable at $1)
                tokenPrices.push({
                    symbol: 'USDC',
                    price: 1,
                    confidence: 0.001,
                    timestamp: Date.now(),
                    priceFeedId: PYTH_PRICE_FEEDS.USDC,
                    status: 'live',
                })

                console.log(`🎉 Successfully processed ${tokenPrices.length} token prices`)
                console.log('📈 Final token prices:', tokenPrices)
                return tokenPrices

            } catch (error) {
                console.error('❌ Error fetching Pyth prices:', error)
                console.error('🔍 Error details:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                    name: error instanceof Error ? error.name : 'Unknown'
                })

                // Return fallback data
                const fallbackPrices: TokenPrice[] = Object.entries(FALLBACK_PRICES).map(([symbol, data]) => ({
                    symbol,
                    price: data.price,
                    confidence: data.confidence,
                    timestamp: Date.now(),
                    priceFeedId: PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS],
                    status: 'error' as const,
                }))

                console.log('🔄 Using fallback prices due to Pyth error')
                return fallbackPrices
            }
        },
        refetchInterval: 10000, // Refetch every 10 seconds
        staleTime: 5000, // Consider data stale after 5 seconds
        retry: 3, // Retry up to 3 times
        retryDelay: 2000, // Wait 2 seconds between retries
        refetchOnWindowFocus: true, // Refetch when window regains focus
        // Add error handling for network issues
        retryOnMount: true,
        refetchOnReconnect: true,
    })
}

export function useTokenPrice(symbol: string) {
    const { data: prices } = usePythPrices()
    return prices?.find(price => price.symbol === symbol) || null
}

export function useTokenPrices(symbols: string[]) {
    const { data: prices } = usePythPrices()
    return prices?.filter(price => symbols.includes(price.symbol)) || []
}

// Utility function to format price with confidence interval
export function formatPriceWithConfidence(price: number, confidence: number): string {
    const confidencePercent = (confidence / price) * 100
    return `${price.toFixed(2)} ± ${confidencePercent.toFixed(2)}%`
}

// Utility function to check if price is recent (within last 5 minutes)
export function isPriceRecent(timestamp: number): boolean {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return timestamp > fiveMinutesAgo
}

// Utility function to get price status
export function getPriceStatus(price: TokenPrice): 'fresh' | 'stale' | 'error' {
    if (!price) return 'error'
    if (price.status === 'error') return 'error'
    if (price.status === 'stale') return 'stale'
    return 'fresh'
} 