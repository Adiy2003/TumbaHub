'use client'

import { useState, useEffect } from 'react'
import { BarChartBig, ChevronDown, ChevronUp, Plus, MessageSquare } from 'lucide-react'

interface RecapPoint {
  id: string
  text: string
  monthId: string
  createdByName: string
  createdAt: string
}

// פונקציית עזר לייצור רשימת החודשים האחרונים (לדוגמה: 6 חודשים אחרונים)
const generateRecentMonths = (count = 6) => {
  const months = []
  const d = new Date()
  for (let i = 0; i < count; i++) {
    const month = d.getMonth()
    const year = d.getFullYear()
    const monthName = d.toLocaleString('en-US', { month: 'long' })
    months.push({
      id: `${year}-${String(month + 1).padStart(2, '0')}`, // לדוגמה: "2026-03"
      label: `${monthName} ${year}`
    })
    d.setMonth(d.getMonth() - 1)
  }
  return months
}

export default function RecapsPage() {
  const [points, setPoints] = useState<RecapPoint[]>([])
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [newPointText, setNewPointText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const recentMonths = generateRecentMonths(6)

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      const res = await fetch('/api/recaps')
      const data = await res.json()
      if (data.points) {
        setPoints(data.points)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load recaps', error)
      setLoading(false)
    }
  }

  const toggleMonth = (monthId: string) => {
    if (expandedMonth === monthId) {
      setExpandedMonth(null)
    } else {
      setExpandedMonth(monthId)
      setNewPointText('') // מאפס את הטקסט כשפותחים חודש חדש
    }
  }

  const handleAddPoint = async (e: React.FormEvent, monthId: string) => {
    e.preventDefault()
    if (!newPointText.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/recaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newPointText, monthId })
      })
      const data = await res.json()
      if (data.success) {
        setPoints([...points, data.point])
        setNewPointText('')
      }
    } catch (error) {
      console.error('Error adding point', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <BarChartBig className="text-coins" size={28} strokeWidth={2} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
              Monthly Recaps
            </h1>
          </div>
          <p className="text-dark-400 text-sm mt-1">The hall of fame and shame. What happened this month?</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {recentMonths.map((month) => {
            const isExpanded = expandedMonth === month.id
            // מסננים רק את הנקודות ששייכות לחודש הזה
            const monthPoints = points.filter(p => p.monthId === month.id)

            return (
              <div key={month.id} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-lg transition-all duration-300">
                {/* כפתור האקורדיון */}
                <button
                  onClick={() => toggleMonth(month.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{month.label}</h2>
                    <span className="bg-dark-900 text-coins text-xs font-bold px-2 py-1 rounded-full border border-dark-600">
                      {monthPoints.length} updates
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="text-coins" size={20} />
                  ) : (
                    <ChevronDown className="text-dark-400" size={20} />
                  )}
                </button>

                {/* תוכן החודש (נפתח רק כשלוחצים) */}
                {isExpanded && (
                  <div className="p-5 border-t border-dark-700 bg-dark-900/30">
                    
                    {/* רשימת הנקודות */}
                    <div className="space-y-3 mb-6">
                      {monthPoints.length === 0 ? (
                        <p className="text-dark-500 text-sm italic text-center py-4">No recaps added yet. Be the first!</p>
                      ) : (
                        monthPoints.map((point) => (
                          <div key={point.id} className="flex gap-3 bg-dark-800 p-3 rounded-lg border border-dark-700">
                            <MessageSquare className="text-dark-500 shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-white text-sm">{point.text}</p>
                              <p className="text-dark-400 text-xs mt-1">Added by {point.createdByName}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* טופס הוספת נקודה */}
                    <form onSubmit={(e) => handleAddPoint(e, month.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={newPointText}
                        onChange={(e) => setNewPointText(e.target.value)}
                        placeholder="Add a memory, event or fine..."
                        className="flex-1 bg-dark-900 border border-dark-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-coins transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !newPointText.trim()}
                        className="bg-coins text-dark-900 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <Plus size={20} strokeWidth={2.5} />
                      </button>
                    </form>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
