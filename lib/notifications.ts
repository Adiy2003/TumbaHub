import { adminDb } from './firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging' // הוספנו את מנוע הפושים!

export type NotificationType = 'shop_purchase' | 'admin_bonus' | 'transfer' | 'bet_created' | 'bet_won' | 'bet_lost' | 'wheel_spin'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  relatedUser: {
    id: string
    name: string
  }
  read: boolean
  createdAt: Timestamp
}

interface CreateNotificationParams {
  type: NotificationType
  title: string
  message: string
  relatedUserId: string
  relatedUserName: string
  recipientIds: string[]
}

/**
 * Create notifications for one or more users AND send push notifications! 🚀
 */
export async function createNotifications({
  type,
  title,
  message,
  relatedUserId,
  relatedUserName,
  recipientIds,
}: CreateNotificationParams): Promise<void> {
  const batch = adminDb.batch()
  const timestamp = Timestamp.now()
  const pushTokens: string[] = [] // מערך שיאסוף את כל הטוקנים של המכשירים

  for (const recipientId of recipientIds) {
    // 1. יצירת ההתראה הפנימית לדאטה-בייס
    const notifRef = adminDb
      .collection('users')
      .doc(recipientId)
      .collection('notifications')
      .doc()

    batch.set(notifRef, {
      type,
      title,
      message,
      relatedUser: {
        id: relatedUserId,
        name: relatedUserName,
      },
      read: false,
      createdAt: timestamp,
    })

    // 2. שולפים את המשתמש כדי לראות אם יש לו טוקנים של התראות לטלפון (fcmTokens)
    try {
      const userDoc = await adminDb.collection('users').doc(recipientId).get()
      const userData = userDoc.data()
      
      if (userData?.fcmTokens && Array.isArray(userData.fcmTokens)) {
        // מכניסים את הטוקנים שלו למערך השיגור שלנו
        pushTokens.push(...userData.fcmTokens)
      }
    } catch (error) {
      console.error(`Failed to fetch user ${recipientId} for push tokens:`, error)
    }
  }

  // 3. שומרים את ההתראות בדאטה-בייס כמו תמיד
  await batch.commit()

  // 4. בום! אם אספנו טוקנים, יורים את הפוש לכולם במקביל
  if (pushTokens.length > 0) {
    try {
      const pushMessage = {
        notification: {
          title: title,
          body: message,
        },
        tokens: pushTokens, // יורה לכל המכשירים שנאספו!
      }

      const response = await getMessaging().sendEachForMulticast(pushMessage)
      console.log(`🚀 Push sent! Success: ${response.successCount}, Failed: ${response.failureCount}`)
    } catch (error) {
      console.error('❌ Error sending push notifications:', error)
    }
  }
}

/**
 * Notify all users except sender (for shop purchases, admin bonuses)
 */
export async function notifyAllUsers({
  type,
  title,
  message,
  excludeUserId,
  relatedUserId,
  relatedUserName,
}: {
  type: NotificationType
  title: string
  message: string
  excludeUserId: string
  relatedUserId: string
  relatedUserName: string
}): Promise<void> {
  const usersSnapshot = await adminDb.collection('users').get()
  const recipientIds = usersSnapshot.docs
    .map((doc) => doc.id)
    .filter((id) => id !== excludeUserId)

  await createNotifications({
    type,
    title,
    message,
    relatedUserId,
    relatedUserName,
    recipientIds,
  })
}

/**
 * Notify specific users (for direct transfers)
 */
export async function notifyUsers({
  type,
  title,
  message,
  relatedUserId,
  relatedUserName,
  userIds,
}: {
  type: NotificationType
  title: string
  message: string
  relatedUserId: string
  relatedUserName: string
  userIds: string[]
}): Promise<void> {
  await createNotifications({
    type,
    title,
    message,
    relatedUserId,
    relatedUserName,
    recipientIds: userIds,
  })
}