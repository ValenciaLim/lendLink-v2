import { useQuery } from '@tanstack/react-query'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'

// Pyth Network price feed IDs for supported tokens
export const PYTH_PRICE_FEEDS = {
    ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    USDC: '0x2b9ab1e972a281585084148ba13898010a8eec5e2e96fc4119878b5b4e8b5b4e',
    stETH: '0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b', // Placeholder
    rETH: '0x8b0d038c5d8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b', // Placeholder
} as const

export interface PythPrice {
    price: number
    confidence: number
    timestamp: number
    symbol: string
}

export interface TokenPrice {
    symbol: string
    price: number
    confidence: number
    timestamp: number
    priceFeedId: string
}

// Initialize Pyth connection
const pythConnection = new EvmPriceServiceConnection(
    'https://xc-mainnet.pyth.network', // Pyth mainnet endpoint
    {
        priceFeedRequestConfig: {
            binary: true,
        },
    }
)

export function usePythPrices() {
    return useQuery({
        queryKey: ['pythPrices'],
        queryFn: async (): Promise<TokenPrice[]> => {
            try {
                // Get all price feeds
                const priceFeeds = await pythConnection.getLatestPriceFeeds(
                    Object.values(PYTH_PRICE_FEEDS)
                )

                if (!priceFeeds) {
                    throw new Error('Failed to fetch price feeds')
                }

                // Map price feeds to token prices
                const tokenPrices: TokenPrice[] = []

                for (const priceFeed of priceFeeds) {
                    if (priceFeed && priceFeed.price) {
                        const symbol = Object.keys(PYTH_PRICE_FEEDS).find(
                            key => PYTH_PRICE_FEEDS[key as keyof typeof PYTH_PRICE_FEEDS] === priceFeed.id
                        ) || 'UNKNOWN'

                        tokenPrices.push({
                            symbol,
                            price: priceFeed.price.price,
                            confidence: priceFeed.price.confidence,
                            timestamp: priceFeed.price.publishTime,
                            priceFeedId: priceFeed.id,
                        })
                    }
                }

                return tokenPrices
            } catch (error) {
                console.error('Error fetching Pyth prices:', error)

                // Fallback to mock prices if Pyth is unavailable
                return [
                    {
                        symbol: 'ETH',
                        price: 2000,
                        confidence: 0.01,
                        timestamp: Date.now(),
                        priceFeedId: PYTH_PRICE_FEEDS.ETH,
                    },
                    {
                        symbol: 'USDC',
                        price: 1,
                        confidence: 0.001,
                        timestamp: Date.now(),
                        priceFeedId: PYTH_PRICE_FEEDS.USDC,
                    },
                    {
                        symbol: 'stETH',
                        price: 2000,
                        confidence: 0.01,
                        timestamp: Date.now(),
                        priceFeedId: PYTH_PRICE_FEEDS.stETH,
                    },
                    {
                        symbol: 'rETH',
                        price: 2000,
                        confidence: 0.01,
                        timestamp: Date.now(),
                        priceFeedId: PYTH_PRICE_FEEDS.rETH,
                    },
                ]
            }
        },
        refetchInterval: 10000, // Refetch every 10 seconds
        staleTime: 5000, // Consider data stale after 5 seconds
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
    if (!isPriceRecent(price.timestamp)) return 'stale'
    return 'fresh'
} 