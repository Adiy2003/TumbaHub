'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import BalanceCard from '@/components/BalanceCard'
import CalendarWidget from '@/components/CalendarWidget'
import { User, Car, Frown, History, ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react'

// עדכנו את הממשק כדי שיכיל את התאריכים החדשים ואת הספירות!
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

// עדכנו את הפעילות שתתמוך בפורמטים החדשים והישנים
interface Activity {
  id: string
  action: string
  amount: number
  fromId?: string
  toId?: string
  toEmail?: string
  from?: { id?: string; name?: string; email?: string }
  to?: { id?: string; name?: string; email?: string }
  createdAt: any // תומך גם ב-Date וגם באובייקט של פיירבייס
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

      // --- הלוגיקה חסינת הכדורים החדשה ששולפת את התאריכים והספירות! ---
      let enrichedUser = meData.user

      if (enrichedUser && activitiesData.transactions) {
        // מסננים רק עסקאות שבהן המשתמש קיבל כסף (בצורה בטוחה)
        const incomingTxs = activitiesData.transactions.filter((tx: Activity) => {
          const matchId = tx.toId === enrichedUser.id || (tx.to && tx.to.id === enrichedUser.id)
          const matchEmail = tx.toEmail === enrichedUser.email || (tx.to && tx.to.email === enrichedUser.email)
          return matchId || matchEmail
        })

        // מוודאים שהעסקאות ממוינות מהחדש לישן (התמודדות עם זמני פיירבייס)
        const sortedTxs = incomingTxs.sort((a: Activity, b: Activity) => {
          const timeA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt || 0).getTime()
          const timeB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt || 0).getTime()
          return timeB - timeA
        })

        // מסננים כדי למצוא את כל עסקאות הנהיגה (לצורך ספירה)
        const driveTxs = sortedTxs.filter((tx: Activity) => {
          const action = (tx.action || '').toLowerCase()
          return action.includes('short ride') || action.includes('long ride') || action.includes('drive') || action.includes('taxi')
        })

        // מסננים כדי למצוא את כל עסקאות האירוח (לצורך ספירה)
        const hostTxs = sortedTxs.filter((tx: Activity) => {
          const action = (tx.action || '').toLowerCase()
          return action.includes('regular host') || action.includes('special host') || action.includes('host')
        })

        // פונקציית עזר להמרת תאריך
        const formatDate = (tx: Activity) => {
          const time = tx.createdAt?._seconds ? tx.createdAt._seconds * 1000 : new Date(tx.createdAt || 0).getTime()
          return new Date(time).toLocaleDateString('en-GB')
        }

        // מעשירים את המשתמש עם התאריכים והספירות
        enrichedUser = {
          ...enrichedUser,
          lastDriveDate: driveTxs.length > 0 ? formatDate(driveTxs[0]) : null,
          lastHostDate: hostTxs.length > 0 ? formatDate(hostTxs[0]) : null,
          driveCount: driveTxs.length,
          hostCount: hostTxs.length,
        }
      }

      if (enrichedUser) {
        setCurrentUser(enrichedUser)
      }

      // שמירת כלל העסקאות לתצוגה של הרשימה למטה
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

  // פונקציית עזר להמרת תאריכים מחוץ ל-fetchData (בשביל הרשימה למטה)
  const formatActivityDate = (createdAt: any) => {
    const time = createdAt?._seconds ? createdAt._seconds * 1000 : new Date(createdAt || 0).getTime()
    return new Date(time).toLocaleDateString('en-GB')
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark-400">Your Balance</h2>
              
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
                  // זיהוי בטוח אם הפעולה היא נכנסת או יוצאת
                  const isIncoming = activity.toId === currentUser?.id || activity.toEmail === currentUser?.email || (activity.to && activity.to.email === currentUser?.email)
                  
                  // אם השדות החדשים קיימים نשתמש בהם, אחרת ניפול חזרה למבנה הישן
                  const otherUserName = isIncoming 
                    ? (activity.from?.name || 'Someone') 
                    : (activity.to?.name || 'Someone')

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
                          <span className="text-white font-medium ml-1">{otherUserName}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
                          {isIncoming ? '+' : '-'}{activity.amount}
                        </p>
                        <p className="text-dark-400 text-xs mt-1 font-medium">
                          {formatActivityDate(activity.createdAt)}
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