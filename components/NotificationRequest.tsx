'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { getMessaging, getToken } from 'firebase/messaging'
import { Bell } from 'lucide-react'
import app from '@/lib/firebase'

export default function NotificationRequest() {
  const { data: session } = useSession()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // בודקים מה מצב ההרשאה הנוכחי בדפדפן
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    try {
      setLoading(true)
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)

      if (currentPermission === 'granted') {
        const messaging = getMessaging(app)
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        })

        if (token) {
          console.log('Got FCM Token!', token)
          // שולחים את הטוקן לשרת שלנו לשמירה
          await fetch('/api/users/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          })
        }
      }
    } catch (error) {
      console.error('Error getting notification permission:', error)
    } finally {
      setLoading(false)
    }
  }

  // אם הוא כבר אישר או חסם, לא נציג לו את הכפתור
  if (permission !== 'default' || !session) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-dark-800 border border-coins/30 rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg shadow-coins/10"
      >
        <div className="flex items-center gap-3">
          <div className="bg-coins/20 p-2 rounded-full">
            <Bell className="text-coins w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Enable Notifications</h3>
            <p className="text-dark-400 text-xs">Get alerts for new bets & transfers</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestPermission}
          disabled={loading}
          className="bg-coins text-dark-900 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-yellow-400 transition-colors"
        >
          {loading ? 'Wait...' : 'Enable'}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}