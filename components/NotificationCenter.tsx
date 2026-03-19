'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'shop_purchase' | 'admin_bonus' | 'transfer' | 'bet_created' | 'bet_won' | 'bet_lost'
  title: string
  message: string
  relatedUser: {
    id: string
    name: string
  }
  read: boolean
  createdAt: string
}

export default function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [session?.user?.id])

  const fetchNotifications = async () => {
    try {
      // הוספנו את cache: 'no-store' - קריטי ב-Next.js!
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    // קסם מס' 1: מעדכנים את המסך מיד! (Optimistic Update)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )

    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      if (!res.ok) {
        console.error('Failed to mark as read:', res.statusText)
        // אם משהו השתבש בשרת, נמשוך מחדש את המידע האמיתי
        fetchNotifications()
        return
      }
      // אין צורך לקרוא ל-fetchNotifications פה כי המסך כבר מעודכן
    } catch (error) {
      console.error('Failed to mark as read:', error)
      fetchNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    // 1. עדכון אופטימי - הופכים את הכל לנקרא באופן מיידי על המסך
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

    try {
      // מוצאים רק את אלה שעדיין לא נקראו כדי לא להעמיס על השרת
      const unreadNotifications = notifications.filter((n) => !n.read)
      
      // אם אין התראות חדשות, עוצרים כאן חבל על הבקשות
      if (unreadNotifications.length === 0) return

      // 2. שולחים את כל הבקשות לשרת במקביל
      const results = await Promise.all(
        unreadNotifications.map((notif) =>
          fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: notif.id }),
          })
        )
      )

      const failedCount = results.filter((r) => !r.ok).length
      if (failedCount > 0) {
        console.warn(`Failed to mark ${failedCount} notifications as read`)
        // רק אם משהו נכשל בשרת, נמשוך מחדש כדי לסנכרן את התצוגה
        fetchNotifications()
      }
      
      // פה היה ה-fetchNotifications() שעשה בעיות - העפנו אותו!
      
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      fetchNotifications() // משיכה מחדש במקרה של קריסה
    }
  }

  const handleDelete = async (notificationId: string) => {
    // מעלימים את ההתראה מיד מהמסך
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

    try {
      const res = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      if (!res.ok) {
        console.error('Failed to delete notification:', res.statusText)
        fetchNotifications() // מתקנים את התצוגה אם נכשל
        return
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      fetchNotifications()
    }
  }

  if (!session?.user?.id) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-dark-400 hover:text-coins transition-colors"
        title="Notifications"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {mounted &&
        isOpen &&
        createPortal(
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            onClose={() => setIsOpen(false)}
            bellRef={bellRef}
          />,
          document.body
        )}
    </>
  )
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClose: () => void
  bellRef: React.RefObject<HTMLButtonElement>
}

function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
  bellRef,
}: NotificationDropdownProps) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, bellRef])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shop_purchase':
        return '🛍️'
      case 'admin_bonus':
        return '🎁'
      case 'transfer':
        return '💸'
      case 'bet_created':
        return '🎲'
      case 'bet_won':
        return '🎉'
      case 'bet_lost':
        return '😔'
      default:
        return '📬'
    }
  }

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none" onClick={onClose} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-12 right-4 w-80 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
      >
        <div className="sticky top-0 bg-dark-800 border-b border-dark-600 p-4 flex items-center justify-between">
          <h3 className="text-white font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkAllAsRead()
              }}
              className="text-xs text-coins hover:text-yellow-300 transition-colors font-medium cursor-pointer"
              title="Mark all as read"
            >
              Mark all
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-dark-400">No notifications yet</div>
        ) : (
          <div>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-b border-dark-700 p-3 hover:bg-dark-700 transition-colors ${
                  !notif.read ? 'bg-dark-750' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{notif.title}</p>
                      <p className="text-dark-400 text-xs mt-1 break-words">
                        {notif.message}
                      </p>
                      <p className="text-dark-600 text-xs mt-2">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(notif.id)
                      }}
                      className="text-coins hover:text-yellow-300 flex-shrink-0 text-xs font-medium"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(notif.id)
                    }}
                    className="text-dark-500 hover:text-red-400 flex-shrink-0 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
