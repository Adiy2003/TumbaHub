'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, CheckCircle2, AlertCircle, Loader2 , Coffee , Beer , Ticket , Car , Bed, Package } from 'lucide-react'

interface ShopItem {
  id: string
  name: string
  price: number
  description?: string
  emoji: string
}

const getIconForItem = (emojiString: string) => {
  // אפשר להכניס פה את האימוג'ים הספציפיים שיש לכם בדאטה-בייס
  switch (emojiString) {
    case '🍺': return <Beer size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
    case '🚗': return <Car size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
    case '☕': return <Coffee size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
    case '🫡': return <Ticket size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
    case '🌙': return <Bed size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />

    // אייקון ברירת מחדל (קופסת הפתעה) לכל אימוג'י שלא הגדרנו מראש
    default: return <Package size={28} className="text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" />
  }
}

export default function ShopTab() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [userBalance, setUserBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

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
      setMessage({ text: 'Insufficient balance!', type: 'error' })
      return
    }

    setPurchasing(itemId)
    setMessage(null)

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || 'Purchase failed', type: 'error' })
        return
      }

      setMessage({ text: `You successfully purchased "${data.item.name}"!`, type: 'success' })
      setUserBalance(userBalance - itemPrice)
      
      setTimeout(fetchData, 2000)
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Unknown error occurred', type: 'error' })
    } finally {
      setPurchasing(null)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-coins" size={32} />
        <p className="text-dark-400 text-sm font-medium">Loading shop items...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-8">
      
      {/* אזור ההודעות (Success/Error) מעוצב מחדש */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in-up border ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* תצוגת רשימה (List) במקום Grid */}
      <div className="space-y-3 sm:space-y-4">
        {items.map((item) => {
          const canAfford = userBalance >= item.price
          const isPurchasing = purchasing === item.id

          return (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl border transition-all duration-300 ${
                canAfford
                  ? 'bg-dark-800 border-dark-700 hover:border-dark-500 hover:bg-dark-700/50'
                  : 'bg-dark-900 border-dark-800 opacity-75'
              }`}
            >
              
              {/* החלק השמאלי: אייקון וטקסט */}
              <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                {/* קופסת האימוג'י - מעודנת וקומפקטית */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  canAfford 
                    ? 'bg-dark-900 border-coins/30 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]' 
                    : 'bg-dark-900 border-dark-800 grayscale opacity-50'
                }`}>
                  {getIconForItem(item.emoji)}
                </div>
                
                <div>
                  <h3 className={`text-base sm:text-lg font-bold ${canAfford ? 'text-white' : 'text-dark-400'}`}>
                    {item.name}
                  </h3>
                  <p className="text-dark-400 text-xs sm:text-sm mt-0.5 line-clamp-2 max-w-[250px]">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* החלק הימני: מחיר וכפתור קנייה */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-dark-700 sm:border-0 pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-dark-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">Cost</p>
                  <p className={`font-bold ${canAfford ? 'text-coins' : 'text-dark-500'}`}>
                    {item.price.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handlePurchase(item.id, item.price)}
                  disabled={!canAfford || isPurchasing}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-all min-w-[100px] ${
                    canAfford
                      ? isPurchasing
                        ? 'bg-coins/20 text-coins cursor-wait'
                        : 'bg-coins text-dark-900 hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                      : 'bg-dark-800 text-dark-500 cursor-not-allowed border border-dark-700'
                  }`}
                >
                  {isPurchasing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag size={16} strokeWidth={2.5} />
                      Buy
                    </>
                  )}
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 border border-dashed border-dark-700 rounded-xl bg-dark-800/50 mt-4">
          <ShoppingBag className="mx-auto text-dark-500 mb-3" size={32} />
          <p className="text-dark-400 font-medium">No items available in the shop right now.</p>
        </div>
      )}
    </div>
  )
}
