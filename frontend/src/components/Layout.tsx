import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Bars3Icon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface NavigationItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

interface LayoutProps {
    children: React.ReactNode
    navigation: NavigationItem[]
}

export default function Layout({ children, navigation }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Mobile sidebar */}
            <div className={clsx(
                'fixed inset-0 z-50 lg:hidden',
                sidebarOpen ? 'block' : 'hidden'
            )}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl">
                    <div className="flex h-20 items-center justify-between px-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
                                <div className="relative h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <span className="text-xl font-bold text-gradient">LendLink</span>
                                <p className="text-xs text-slate-500">DeFi Protocol</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        'nav-item',
                                        isActive && 'active'
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-xl">
                    <div className="flex h-20 items-center px-8">
                        <div className="flex items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
                                <div className="relative h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <SparklesIcon className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <span className="text-2xl font-bold text-gradient">LendLink</span>
                                <p className="text-sm text-slate-500">DeFi Protocol</p>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 space-y-2 px-6 py-8">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        'nav-item',
                                        isActive && 'active'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-80 flex flex-col flex-1">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-6 shadow-sm sm:gap-x-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1"></div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span>Connected to Etherlink</span>
                            </div>
                            <ConnectButton />
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-8">
                        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
} 