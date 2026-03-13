'use client'

import { useState, useEffect } from 'react'

interface ShopItem {
  id: string
  name: string
  price: number
  description?: string
  emoji: string
}

export default function ShopPage() {
  // const { data: session } = useSession()
  const [items, setItems] = useState<ShopItem[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, userRes] = await Promise.all([
        fetch('/api/shop/items'),
        fetch('/api/users/me'),
      ])

      const itemsData = await itemsRes.json()
      const userData = await userRes.json()

      if (itemsData.items) {
        setItems(itemsData.items)
      }

      if (userData.user) {
        setUserBalance(userData.user.balance)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch:', error)
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: string, itemPrice: number) => {
    if (userBalance < itemPrice) {
      setMessage('❌ Insufficient balance!')
      return
    }

    setPurchasing(itemId)
    setMessage('')

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage('❌ ' + (data.error || 'Purchase failed'))
        return
      }

      setMessage(`✅ You purchased "${data.item.name}"!`)
      setUserBalance(userBalance - itemPrice)
      setPurchasing(null)

      // Refresh after 2 seconds
      setTimeout(fetchData, 2000)
    } catch (error) {
      setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-dark-400">Loading shop...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
                🛍️ TumbaShop
              </h1>
              <p className="text-dark-400 text-sm mt-1">Spend your TumbaCoins on awesome perks</p>
            </div>
            <div className="bg-dark-700 rounded-lg px-4 py-2">
              <p className="text-dark-400 text-sm">Balance</p>
              <p className="text-2xl font-bold text-coins">{userBalance}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅')
              ? 'bg-green-900/20 text-green-400 border border-green-700'
              : 'bg-red-900/20 text-red-400 border border-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Shop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const canAfford = userBalance >= item.price
            return (
              <div
                key={item.id}
                className={`rounded-xl border ${
                  canAfford
                    ? 'bg-dark-800 border-dark-700 hover:border-coins/50'
                    : 'bg-dark-800 border-dark-700/50 opacity-60'
                } p-6 transition-all duration-300 flex flex-col`}
              >
                {/* Icon */}
                <div className="text-5xl mb-4">{item.emoji}</div>

                {/* Name & Price */}
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-dark-400 text-sm mb-4 flex-1">{item.description}</p>

                {/* Price */}
                <div className="mb-4 pt-4 border-t border-dark-700">
                  <p className="text-dark-400 text-sm">Cost</p>
                  <p className="text-2xl font-bold text-coins">{item.price}</p>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handlePurchase(item.id, item.price)}
                  disabled={!canAfford || purchasing === item.id}
                  className={`w-full font-semibold py-2 rounded-lg transition-colors ${
                    canAfford
                      ? purchasing === item.id
                        ? 'bg-coins/50 text-dark-900 cursor-wait'
                        : 'bg-coins text-dark-900 hover:bg-yellow-300'
                      : 'bg-dark-700 text-dark-400 cursor-not-allowed'
                  }`}
                >
                  {purchasing === item.id ? '⏳ Purchasing...' : '💳 Buy'}
                </button>
              </div>
            )
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-dark-400 text-lg">No items available in the shop</p>
          </div>
        )}
      </main>
    </div>
  )
}
