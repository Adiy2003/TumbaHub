'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import BalanceCard from '@/components/BalanceCard'
import CalendarWidget from '@/components/CalendarWidget'
import { User, Car, Frown, History, ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react'

// עדכנו את הממשק כדי שיכיל את התאריכים החדשים
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

      // --- הלוגיקה החדשה ששולפת את התאריכים! ---
      let enrichedUser = meData.user

      if (enrichedUser && activitiesData.transactions) {
        // מסננים רק עסקאות שבהן המשתמש קיבל כסף
        const incomingTxs = activitiesData.transactions.filter(
          (tx: Activity) => tx.to.email === enrichedUser.email
        )

        // מוודאים שהעסקאות ממוינות מהחדש לישן
        const sortedTxs = incomingTxs.sort((a: Activity, b: Activity) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        // מחפשים את הנהיגה האחרונה
        const lastDriveTx = sortedTxs.find((tx: Activity) => 
          tx.action.toLowerCase().includes('short ride') || 
          tx.action.toLowerCase().includes('long ride')
        )

        // מחפשים את האירוח האחרון
        const lastHostTx = sortedTxs.find((tx: Activity) => 
          tx.action.toLowerCase().includes('regular host') || 
          tx.action.toLowerCase().includes('special host')
        )

        // מעשירים את המשתמש עם התאריכים המפורמטים (DD/MM/YYYY)
        enrichedUser = {
          ...enrichedUser,
          lastDriveDate: lastDriveTx ? new Date(lastDriveTx.createdAt).toLocaleDateString('en-GB') : null,
          lastHostDate: lastHostTx ? new Date(lastHostTx.createdAt).toLocaleDateString('en-GB') : null,
        }
      }

      if (enrichedUser) {
        setCurrentUser(enrichedUser)
      }

      if (activitiesData.transactions) {
        setActivities(activitiesData.transactions)
      }

      if (usersData.users && usersData.users.length > 0) {
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
            {/* הוספנו פה div שעוטף את הכותרת ואת הכפתור ומצמיד אותם לצדדים */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-400">Your Balance</h2>
              
              {/* העברנו את הכפתור לפה! */}
              <Link
                href="/transactions"
                className="text-sm px-4 py-2 bg-coins text-dark-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-coins/20"
              >
                Make a Transaction
              </Link>
            </div>
            
            <BalanceCard user={currentUser} isCurrentUser={true} />
          </section>
        )}
        {/* This Weekend's Taxi Driver */}
        {taxiDriver && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-coins/30 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-coins to-yellow-400 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {taxiDriver.profilePicture ? (
                      <Image 
                        src={taxiDriver.profilePicture} 
                        alt={taxiDriver.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="text-dark-900" size={24} />
                    )}
                  </div>
                  <div>
                    <p className="text-coins text-sm font-medium flex items-center gap-1.5">
                      <Car size={16} strokeWidth={2} /> 
                      This weekend&apos;s taxi driver
                    </p>
                    <p className="text-xl font-bold text-white">{taxiDriver.name}</p>
                  </div>
                </div>
                <div className="text-dark-500 pr-2">
                  <Frown size={32} strokeWidth={1.5} className="opacity-50" />
                </div>
              </div>
            </div>
          </section>
        )}

       {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="text-coins" size={24} strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-dark-400">Tumba Calendar</h2>
          </div>
          <CalendarWidget />
        </section>


        {/* Recent Activity */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <History className="text-coins" size={24} strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-dark-400">Recent Activity</h2>
          </div>
          
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-xl">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark-400">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activities.map((activity) => {
                  const isIncoming = activity.to.email === currentUser?.email
                  const otherUser = isIncoming ? activity.from : activity.to

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors border border-dark-700/50">
                      <div className="flex-1">
                        <p className="font-medium text-white text-base">
                          {activity.action}
                        </p>
                        <p className="text-dark-400 text-sm mt-1 flex items-center gap-1.5">
                          {isIncoming ? (
                            <><ArrowDownLeft size={16} className="text-green-400" /> From</>
                          ) : (
                            <><ArrowUpRight size={16} className="text-red-400" /> To</>
                          )} 
                          <span className="text-white font-medium ml-1">{otherUser.name}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                          {isIncoming ? '+' : '-'}{activity.amount}
                        </p>
                        <p className="text-dark-400 text-xs mt-1 font-medium">
                          {new Date(activity.createdAt).toLocaleDateString('en-GB')}
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