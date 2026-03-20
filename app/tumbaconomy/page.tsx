'use client'

import { useState } from 'react'
import { Store, Dices, TrendingUp, History } from 'lucide-react'

// מייבאים את הקומפוננטות החדשות שיצרנו!
import ShopTab from '@/components/ShopTab'
import BetsTab from '@/components/BetsTab'
import BetHistoryTab from '@/components/BetHistoryTab'

type TabType = 'shop' | 'bets' | 'history'

export default function TumbaConomyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('shop')

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-coins" size={28} strokeWidth={2} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
              TumbaConomy
            </h1>
          </div>
          <p className="text-dark-400 text-sm mt-1">Spend coins, make bets, get rich.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {/* Toggle Switch (Tabs) */}
        <div className="flex bg-dark-800 p-1 rounded-xl border border-dark-700 mb-8 max-w-lg mx-auto shadow-lg overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-dark-700 text-coins shadow-md'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <Store size={18} />
            Shop
          </button>
          
          <button
            onClick={() => setActiveTab('bets')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'bets'
                ? 'bg-dark-700 text-coins shadow-md'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <Dices size={18} />
            Active Bets
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-dark-700 text-coins shadow-md'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <History size={18} />
            History
          </button>
          
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'shop' && <ShopTab />}
          {activeTab === 'bets' && <BetsTab />}
          {activeTab === 'history' && <BetHistoryTab />}
        </div>
      </main>
    </div>
  )
}