import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import {
    HomeIcon,
    BanknotesIcon,
    ChartBarIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Lending from './pages/Lending'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { useLendLink } from './hooks/useLendLink'

function App() {
    const { isConnected } = useAccount()
    const { isLoading } = useLendLink()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="spinner w-12 h-12 mx-auto mb-6"></div>
                    <p className="text-slate-600 font-medium">Loading LendLink...</p>
                </div>
            </div>
        )
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Lending', href: '/lending', icon: BanknotesIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Layout navigation={navigation}>
                <div className="flex-1">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/lending" element={<Lending />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </Layout>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </div>
    )
}

export default App 