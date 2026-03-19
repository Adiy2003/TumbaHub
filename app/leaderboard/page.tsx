'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import BalanceCard from '@/components/BalanceCard' // הוספנו ייבוא של הכרטיסייה!
import { X, Crown } from 'lucide-react'

// הוספנו את שדות התאריכים לממשק
interface User {
  id: string
  name: string
  email: string
  balance: number
  profilePicture?: string
  lastDriveDate?: string | null
  lastHostDate?: string | null
}

interface Activity {
  action: string
  to: { email: string }
  createdAt: string
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null) // משתנה למעקב מי נבחר למודאל

  useEffect(() => {
    fetchUsersAndTransactions()
  }, [])

  // פונקציה משולבת שמושכת גם משתמשים וגם עסקאות, ומחברת ביניהם!
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

        // אם יש עסקאות, אנחנו מחשבים את תאריכי הנהיגה/אירוח לכל משתמש
        if (txData.transactions) {
          enrichedUsers = usersData.users.map((user: User) => {
            const incomingTxs = txData.transactions.filter((tx: Activity) => tx.to.email === user.email)
            const sortedTxs = incomingTxs.sort((a: Activity, b: Activity) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            const lastDriveTx = sortedTxs.find((tx: Activity) => 
              tx.action.toLowerCase().includes('short ride') || tx.action.toLowerCase().includes('long ride')
            )
            const lastHostTx = sortedTxs.find((tx: Activity) => 
              tx.action.toLowerCase().includes('regular host') || tx.action.toLowerCase().includes('special host')
            )

            return {
              ...user,
              lastDriveDate: lastDriveTx ? new Date(lastDriveTx.createdAt).toLocaleDateString('en-GB') : null,
              lastHostDate: lastHostTx ? new Date(lastHostTx.createdAt).toLocaleDateString('en-GB') : null,
            }
          })
        }

        const sorted = [...enrichedUsers].sort((a, b) => b.balance - a.balance)
        setUsers(sorted)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  // פונקציה לסגירת המודאל (גם בלחיצה על X וגם בלחיצה על הרקע)
  const closeModal = () => setSelectedUser(null)

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
    <div className="min-h-screen bg-dark-900 pb-24 relative">
      <header className="border-b border-dark-700 bg-dark-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-dark-400 text-sm mt-1">Who has the most TumbaCoins?</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <table className="w-full table-fixed sm:table-auto">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-700">
                <th className="w-12 sm:w-20 px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-dark-400">Rank</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-dark-400">Name</th>
                <th className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-dark-400">Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const isNegative = user.balance < 0
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)} // הפעולה שפותחת את המודאל!
                    className={`border-b border-dark-700 transition-colors hover:bg-dark-600 cursor-pointer ${
                      isNegative ? 'bg-red-900/20' : index === 0 ? 'bg-dark-700/50' : ''
                    }`}
                  >
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-3">
                        <span className={`text-base sm:text-lg font-bold ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-dark-400'}`}>
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <Crown 
                          className="w-5 h-5 sm:w-6 sm:h-6 text-coins drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" 
                            strokeWidth={2} 
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {user.profilePicture ? (
                            <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                          ) : (
                            <span className="text-sm sm:text-lg">👤</span>
                          )}
                        </div>
                        <span className={`text-sm sm:text-base font-semibold truncate max-w-[90px] sm:max-w-none ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-white'}`}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <span className={`font-bold text-sm sm:text-lg ${isNegative ? 'text-red-400' : index === 0 ? 'text-coins' : 'text-yellow-400'}`}>
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

      {/* --- המודאל שקופץ כשלוחצים על משתמש --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* הרקע הכהה - לחיצה עליו סוגרת את המודאל */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          {/* התוכן של המודאל */}
          <div className="relative z-10 w-full max-w-sm transform animate-fade-in-up">
            {/* כפתור סגירה */}
            <button 
              onClick={closeModal}
              className="absolute -top-4 -right-4 bg-dark-700 hover:bg-dark-600 text-white rounded-full p-2 shadow-lg transition-colors border border-dark-600 z-20"
            >
              <X size={20} />
            </button>
            
            {/* כרטיסיית המשתמש במלוא הדרה! */}
            <BalanceCard user={selectedUser} isCurrentUser={false} />
          </div>
        </div>
      )}

    </div>
  )
}