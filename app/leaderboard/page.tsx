'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark-400">Name</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-dark-400">Balance</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${
                          isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-dark-400'
                        }`}>
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="text-2xl">👑</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        <span className={`font-semibold ${
                          isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-white'
                        }`}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-lg ${
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
