import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { mainnet, sepolia, polygon, optimism, arbitrum } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App'

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        mainnet,
        sepolia,
        polygon,
        optimism,
        arbitrum,
        {
            id: 128123,
            name: 'Etherlink',
            network: 'Etherlink Testnet',
            nativeCurrency: {
                decimals: 18,
                name: 'Tezos',
                symbol: 'XTZ',
            },
            rpcUrls: {
                public: { http: ['https://node.ghostnet.etherlink.com'] },
                default: { http: ['https://node.ghostnet.etherlink.com'] },
            },
            blockExplorers: {
                default: { name: 'Etherlink Explorer', url: 'https://explorer.etherlink.com' },
            },
        },
    ],
    [publicProvider()]
)

// Set up wagmi config with a simple project ID
const { connectors } = getDefaultWallets({
    appName: 'LendLink',
    projectId: 'demo-project-id', // Simple demo project ID
    chains,
})

const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
})

// Set up React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <RainbowKitProvider chains={chains}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </QueryClientProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    </React.StrictMode>,
) 