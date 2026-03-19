'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import Image from 'next/image' // למקרה שנרצה תמונות לחפצים
import { Backpack } from 'lucide-react'

// המבנה של חפץ במלאי שלנו
interface InventoryItem {
  id: string
  name: string
  description: string
  type: 'boost' | 'shield' | 'cosmetic' | 'mystery' // סוגי החפצים שיהיו לנו
  imageUrl?: string // אופציונלי: לתמונה מותאמת אישית של החפץ
  acquiredAt: string
}

export default function InventoryCenter() {
  const { data: session } = useSession()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const backpackRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // משיכת החפצים מהשרת (בדיוק כמו בהתראות)
  useEffect(() => {
    if (session?.user?.id && isOpen) {
      fetchInventory()
    }
  }, [session?.user?.id, isOpen])

  const fetchInventory = async () => {
    try {
      // נצטרך ליצור את הראוט הזה בהמשך שיחזיר את הרשימה
      const res = await fetch('/api/inventory', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    }
  }

  // הפונקציה שמפעילה את החפץ (וקוראת ל-API שיצרנו בשלב הקודם)
  const handleUseItem = async (item: InventoryItem) => {
    if (loading) return
    setLoading(true)

    // 1. עדכון אופטימי (Optimistic UI): מעלימים את החפץ מיד מהמסך
    setItems((prev) => prev.filter((i) => i.id !== item.id))

    try {
      const res = await fetch('/api/inventory/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inventoryItemId: item.id,
          itemName: item.name 
        }),
      })

      if (!res.ok) {
        console.error('Failed to use item:', res.statusText)
        fetchInventory() // מחזירים את החפץ למסך אם השרת נכשל
      } else {
        // פה בעתיד אפשר להוסיף אפקט של קונפטי או סאונד! 🎉
        console.log(`Successfully used ${item.name}!`)
      }
    } catch (error) {
      console.error('Failed to use item:', error)
      fetchInventory()
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.id) return null

  return (
    <>
      <button
  ref={backpackRef}
  onClick={() => setIsOpen(!isOpen)}
  className="relative p-2 text-dark-400 hover:text-coins transition-colors"
  title="My Items"
>
  <Backpack className="w-6 h-6" strokeWidth={1.5} />
  
  {/* הבועה של המספר נשארת אותו דבר: */}
  {items.length > 0 && (
    <span className="absolute top-0 right-0 bg-coins text-dark-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center translate-x-1 -translate-y-1">
      {items.length}
    </span>
  )}
</button>

      {mounted &&
        isOpen &&
        createPortal(
          <InventoryDropdown
            items={items}
            onUse={handleUseItem}
            onClose={() => setIsOpen(false)}
            backpackRef={backpackRef}
            loading={loading}
          />,
          document.body
        )}
    </>
  )
}

// --- הקומפוננטה של התפריט עצמו ---

interface InventoryDropdownProps {
  items: InventoryItem[]
  onUse: (item: InventoryItem) => void
  onClose: () => void
  backpackRef: React.RefObject<HTMLButtonElement>
  loading: boolean
}

function InventoryDropdown({
  items,
  onUse,
  onClose,
  backpackRef,
  loading
}: InventoryDropdownProps) {
  
  // אותו פתרון קסם שעשינו בהתראות למניעת סגירה בטעות!
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        backpackRef.current && 
        !backpackRef.current.contains(e.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, backpackRef])

  // פונקציה לבחירת אייקון לפי סוג החפץ (אם אין תמונה)
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'boost': return '⚡'
      case 'shield': return '🛡️'
      case 'cosmetic': return '✨'
      case 'mystery': return '❓'
      default: return '📦'
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
        className="fixed top-12 right-16 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
      >
        <div className="sticky top-0 bg-dark-800 border-b border-dark-600 p-4">
          <h3 className="text-white font-semibold">My Backpack</h3>
        </div>
        
        {items.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-3 opacity-50">🕸️</span>
            <p className="text-dark-400">Your backpack is empty.</p>
            <p className="text-sm text-dark-500 mt-1">Visit the shop or spin the wheel to get items!</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-dark-750 border border-dark-700 rounded-lg p-3 flex items-center justify-between gap-3 hover:border-dark-600 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-dark-800 flex items-center justify-center text-xl flex-shrink-0 border border-dark-600 shadow-inner">
                    {item.imageUrl ? (
                       <Image src={item.imageUrl} alt={item.name} width={24} height={24} className="object-contain"/>
                    ) : (
                      getItemIcon(item.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-dark-400 text-xs truncate">{item.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => onUse(item)}
                  disabled={loading}
                  className="bg-coins/10 hover:bg-coins/20 text-coins border border-coins/30 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  USE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}