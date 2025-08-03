import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Settings() {
    const { isConnected } = useAccount()
    const [notifications, setNotifications] = useState({
        healthFactor: true,
        liquidation: true,
        rewards: false,
        updates: true
    })
    const [preferences, setPreferences] = useState({
        currency: 'USD',
        language: 'en',
        theme: 'light'
    })

    // if (!isConnected) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="text-center">
    //                 <div className="mx-auto h-12 w-12 text-gray-400">
    //                     <Cog6ToothIcon className="h-12 w-12" />
    //                 </div>
    //                 <h3 className="mt-2 text-sm font-semibold text-gray-900">Connect Wallet</h3>
    //                 <p className="mt-1 text-sm text-gray-500">
    //                     Connect your wallet to access settings
    //                 </p>
    //                 <div className="mt-6">
    //                     <ConnectButton />
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your preferences and protocol settings
                    </p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Notifications
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Health Factor Alerts</p>
                                    <p className="text-sm text-gray-500">Get notified when your health factor drops</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, healthFactor: !prev.healthFactor }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.healthFactor ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.healthFactor ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Liquidation Warnings</p>
                                    <p className="text-sm text-gray-500">Critical alerts for liquidation risk</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, liquidation: !prev.liquidation }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.liquidation ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.liquidation ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Reward Notifications</p>
                                    <p className="text-sm text-gray-500">Updates on LST staking rewards</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, rewards: !prev.rewards }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.rewards ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.rewards ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <Cog6ToothIcon className="h-5 w-5 mr-2 text-green-600" />
                            Preferences
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                <select
                                    value={preferences.currency}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Theme</label>
                                <select
                                    value={preferences.theme}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-600" />
                            Security
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                </div>
                                <button className="text-sm text-blue-600 hover:text-blue-500">
                                    Enable
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Session Management</p>
                                    <p className="text-sm text-gray-500">Manage active sessions</p>
                                </div>
                                <button className="text-sm text-blue-600 hover:text-blue-500">
                                    View
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Export Data</p>
                                    <p className="text-sm text-gray-500">Download your transaction history</p>
                                </div>
                                <button className="text-sm text-blue-600 hover:text-blue-500">
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protocol Info */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-600" />
                            Protocol Information
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Protocol Version</p>
                                <p className="text-sm text-gray-500">v1.0.0</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-900">Smart Contract</p>
                                <p className="text-sm text-gray-500 font-mono">0x1234...5678</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-900">Network</p>
                                <p className="text-sm text-gray-500">Etherlink (Tezos)</p>
                            </div>

                            <div className="pt-4">
                                <button className="text-sm text-blue-600 hover:text-blue-500">
                                    View on Explorer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="btn-primary">
                    Save Settings
                </button>
            </div>
        </div>
    )
} 