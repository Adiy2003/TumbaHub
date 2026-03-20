'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import BalanceCard from '@/components/BalanceCard'
import { X, Crown, Car, Home, Award } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  balance: number
  profilePicture?: string
  lastDriveDate?: string | null
  lastHostDate?: string | null
  driveCount?: number 
  hostCount?: number  
}

// עדכנו את הממשק הזה כדי ש-TypeScript יכיר את כל השדות שמגיעים מפיירבייס!
interface Activity {
  id?: string
  action: string
  amount?: number
  fromId?: string
  toId?: string
  toEmail?: string
  to?: { id?: string, email?: string }
  createdAt: any // 'any' מאפשר גם תאריך רגיל וגם אובייקט זמן של פיירבייס
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsersAndTransactions()
  }, [])

  const fetchUsersAndTransactions = async () => {
    try {
      const [usersRes, transactionsRes] = await Promise.all([
        fetch('/api/users/all'),
        fetch('/api/transactions')
      ])
      
      const usersData = await usersRes.json()
      const txData = await transactionsRes.json()

      if (usersData.users) {
        let enrichedUsers = usersData.users

        if (txData.transactions) {
          enrichedUsers = usersData.users.map((user: User) => {
            // חסין כדורים 1: סינון מדויק לפי תעודת זהות של משתמש, ואם אין - אז לפי אימייל
            const incomingTxs = txData.transactions.filter((tx: Activity) => {
              const matchId = tx.toId === user.id || (tx.to && tx.to.id === user.id)
              const matchEmail = tx.toEmail === user.email || (tx.to && tx.to.email === user.email)
              return matchId || matchEmail
            })

            // חסין כדורים 2: מיון תאריכים שמטפל גם בזמנים של פיירבייס
            const sortedTxs = incomingTxs.sort((a: Activity, b: Activity) => {
              const timeA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt || 0).getTime()
              const timeB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt || 0).getTime()
              return timeB - timeA
            })

            // חסין כדורים 3: ספירת נהיגות בצורה בטוחה
            const driveTxs = sortedTxs.filter((tx: Activity) => {
              const action = (tx.action || '').toLowerCase()
              return action.includes('short ride') || action.includes('long ride') || action.includes('drive') || action.includes('taxi')
            })

            // חסין כדורים 4: ספירת אירוחים בצורה בטוחה
            const hostTxs = sortedTxs.filter((tx: Activity) => {
              const action = (tx.action || '').toLowerCase()
              return action.includes('regular host') || action.includes('special host') || action.includes('host')
            })

            // פונקציית עזר לתאריך אחרון
            const formatDate = (tx: Activity) => {
              const time = tx.createdAt?._seconds ? tx.createdAt._seconds * 1000 : new Date(tx.createdAt || 0).getTime()
              return new Date(time).toLocaleDateString('en-GB')
            }

            return {
              ...user,
              lastDriveDate: driveTxs.length > 0 ? formatDate(driveTxs[0]) : null,
              lastHostDate: hostTxs.length > 0 ? formatDate(hostTxs[0]) : null,
              driveCount: driveTxs.length,
              hostCount: hostTxs.length,
            }
          })
        }

        const sorted = [...enrichedUsers].sort((a: User, b: User) => b.balance - a.balance)
        setUsers(sorted)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const closeModal = () => setSelectedUser(null)

  // מציאת המלכים (רק אם יש להם יותר מ-0)
  const topDriver = users.length > 0 ? [...users].sort((a, b) => (b.driveCount || 0) - (a.driveCount || 0))[0] : null
  const topHost = users.length > 0 ? [...users].sort((a, b) => (b.hostCount || 0) - (a.hostCount || 0))[0] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400 font-medium">Loading rankings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pb-24 relative">
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2">
            <Award className="text-coins" size={28} strokeWidth={2} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-dark-400 text-sm mt-1">Who has the most TumbaCoins?</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- אזור היכל התהילה --- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
          {/* Top Driver Card */}
          {topDriver && (topDriver.driveCount || 0) > 0 && (
            <div className="bg-gradient-to-br from-blue-900/40 to-dark-800 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3 sm:gap-4 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                <Car className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Top Driver</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{topDriver.name}</p>
                <p className="text-xs text-dark-400">{topDriver.driveCount} rides</p>
              </div>
            </div>
          )}

          {/* Top Host Card */}
          {topHost && (topHost.hostCount || 0) > 0 && (
            <div className="bg-gradient-to-br from-green-900/40 to-dark-800 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 sm:gap-4 shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <Home className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-wider mb-0.5">Top Host</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{topHost.name}</p>
                <p className="text-xs text-dark-400">{topHost.hostCount} events</p>
              </div>
            </div>
          )}
        </div>

        {/* הטבלה */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl">
          <table className="w-full table-fixed sm:table-auto">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/50">
                <th className="w-14 sm:w-20 px-2 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-dark-400 uppercase tracking-wider">Rank</th>
                <th className="px-2 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-dark-400 uppercase tracking-wider">Name</th>
                <th className="px-2 sm:px-6 py-4 text-right text-xs sm:text-sm font-semibold text-dark-400 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const isNegative = user.balance < 0
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`border-b border-dark-700 transition-colors hover:bg-dark-700/50 cursor-pointer ${
                      isNegative ? 'bg-red-900/10' : index === 0 ? 'bg-dark-700/30' : ''
                    }`}
                  >
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-3">
                        <span className={`text-base sm:text-lg font-bold ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-dark-400'}`}>
                          #{index + 1}
                        </span>
                        {index === 0 && <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" strokeWidth={2} />}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-dark-700 to-dark-600 border border-dark-500 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative">
                          {user.profilePicture ? (
                            <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                          ) : (
                            <span className="text-sm sm:text-lg">👤</span>
                          )}
                        </div>
                        <span className={`text-sm sm:text-base font-semibold truncate ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-white'}`}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <span className={`font-bold text-sm sm:text-lg ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins drop-shadow-[0_0_5px_rgba(255,215,0,0.3)]' : 'text-white'}`}>
                        {user.balance.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Stats תחתונים */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-dark-800 rounded-xl p-5 border border-dark-700 shadow-lg">
            <p className="text-dark-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1">Total Coins</p>
            <p className="text-2xl sm:text-3xl font-bold text-coins">
              {users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-dark-800 rounded-xl p-5 border border-dark-700 shadow-lg">
            <p className="text-dark-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1">Avg Balance</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {Math.round(users.reduce((sum, u) => sum + u.balance, 0) / (users.length || 1)).toLocaleString()}
            </p>
          </div>
        </div>
      </main>

      {/* המודאל שמציג את פרופיל המשתמש */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="relative z-10 w-full max-w-sm transform animate-fade-in-up">
            <button onClick={closeModal} className="absolute -top-4 -right-4 bg-dark-700 hover:bg-dark-600 text-white rounded-full p-2 shadow-lg transition-colors border border-dark-600 z-20">
              <X size={20} />
            </button>
            <BalanceCard user={selectedUser} isCurrentUser={false} />
          </div>
        </div>
      )}
    </div>
  )
}