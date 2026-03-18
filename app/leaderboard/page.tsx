'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  balance: number
  profilePicture?: string
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/all')
      const data = await response.json()
      
      if (data.users) {
        // Sort by balance descending
        const sorted = [...data.users].sort((a, b) => b.balance - a.balance)
        setUsers(sorted)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-dark-400 text-sm mt-1">Who has the most TumbaCoins?</p>
        </div>
      </header>

      {/* Main Content */}
<main className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-8 sm:py-12">
  <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
    {/* הוספנו table-fixed כדי למנוע מעמודת השם לדחוף את השאר החוצה */}
    <table className="w-full table-fixed sm:table-auto">
      <thead>
        <tr className="border-b border-dark-700 bg-dark-700">
          {/* עמודת דירוג: צרה יותר וריווח מותאם */}
          <th className="w-12 sm:w-20 px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-dark-400">
            Rank
          </th>
          
          {/* עמודת שם */}
          <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-dark-400">
            Name
          </th>
          
          {/* עמודת מאזן (TumbaCoins) */}
          <th className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-dark-400">
            Balance
          </th>
        </tr>
      </thead>
            <tbody>
  {users.map((user, index) => {
    const isNegative = user.balance < 0
    return (
      <tr
        key={user.id}
        className={`border-b border-dark-700 transition-colors hover:bg-dark-700 ${
          isNegative ? 'bg-red-900/20' : index === 0 ? 'bg-dark-700/50' : ''
        }`}
      >
        {/* תא דירוג: הקטנת ריווח וגודל הכתר במובייל */}
        <td className="px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-1 sm:gap-3">
            <span className={`text-base sm:text-lg font-bold ${
              isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-dark-400'
            }`}>
              #{index + 1}
            </span>
            {index === 0 && (
              <span className="text-lg sm:text-2xl">👑</span>
            )}
          </div>
        </td>

        {/* תא שם ותמונה: התאמת תמונה, ריווח, וטיפול בשמות ארוכים */}
        <td className="px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* הקטנו קצת את התמונה במובייל (w-8 h-8) */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {user.profilePicture ? (
                <Image 
                  src={user.profilePicture} 
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-sm sm:text-lg">👤</span>
              )}
            </div>
            {/* הוספנו truncate ו-max-w כדי ששם ארוך לא ישבור את הטבלה במובייל */}
            <span className={`text-sm sm:text-base font-semibold truncate max-w-[90px] sm:max-w-none ${
              isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-white'
            }`}>
              {user.name}
            </span>
          </div>
        </td>

        {/* תא מאזן: התאמת ריווח וגודל טקסט */}
        <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
          <span className={`font-bold text-sm sm:text-lg ${
            isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-yellow-400'
          }`}>
            {user.balance.toLocaleString()}
          </span>
        </td>
      </tr>
    )
  })}
</tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <p className="text-dark-400 text-sm mb-2">Total Coins in Circulation</p>
            <p className="text-3xl font-bold text-coins">
              {users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <p className="text-dark-400 text-sm mb-2">Average Balance</p>
            <p className="text-3xl font-bold text-yellow-400">
              {Math.round(users.reduce((sum, u) => sum + u.balance, 0) / users.length).toLocaleString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
