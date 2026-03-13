'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import BalanceCard from '@/components/BalanceCard'

interface User {
  id: string
  name: string
  email: string
  balance: number
  profilePicture?: string
}

interface Activity {
  id: string
  action: string
  amount: number
  from: { name: string; email: string }
  to: { name: string; email: string }
  createdAt: string
}

export default function Home() {
  const { data: session } = useSession()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [taxiDriver, setTaxiDriver] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [meRes, activitiesRes, usersRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/transactions'),
        fetch('/api/users/all'),
      ])

      const meData = await meRes.json()
      const activitiesData = await activitiesRes.json()
      const usersData = await usersRes.json()

      if (meData.user) {
        setCurrentUser(meData.user)
      }

      if (activitiesData.transactions) {
        setActivities(activitiesData.transactions)
      }

      if (usersData.users && usersData.users.length > 0) {
        // Find the user with the lowest balance
        const lowest = usersData.users.reduce((prev: User, current: User) => 
          current.balance < prev.balance ? current : prev
        )
        setTaxiDriver(lowest)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coins"></div>
          <p className="mt-4 text-dark-400">Loading TumbaHub...</p>
        </div>
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
                TumbaHub
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current User Balance */}
        {currentUser && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-dark-400 mb-6">Your Balance</h2>
            <BalanceCard user={currentUser} isCurrentUser={true} />
          </section>
        )}

        {/* This Weekend's Taxi Driver */}
        {taxiDriver && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-coins/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {taxiDriver.profilePicture ? (
                      <img 
                        src={taxiDriver.profilePicture} 
                        alt={taxiDriver.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="text-coins text-sm font-medium">🚕 This weekend&apos;s taxi driver</p>
                    <p className="text-xl font-bold text-white">{taxiDriver.name}</p>
                  </div>
                </div>
                <div className="text-3xl">🤦</div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-dark-400">📋 Recent Activity</h2>
            <Link
              href="/transactions"
              className="text-sm px-3 py-1 bg-coins text-dark-900 font-medium rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Make a Transaction
            </Link>
          </div>
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark-400">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity) => {
                  const isIncoming = activity.to.email === currentUser?.email
                  const otherUser = isIncoming ? activity.from : activity.to

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {activity.action}
                        </p>
                        <p className="text-dark-400 text-sm mt-1">
                          {isIncoming ? '📥 From' : '📤 To'} <span className="text-white font-medium">{otherUser.name}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                          {isIncoming ? '+' : '-'}{activity.amount}
                        </p>
                        <p className="text-dark-400 text-xs mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
