import { adminDb } from './firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

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
 * Create notifications for one or more users
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

  for (const recipientId of recipientIds) {
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
  }

  await batch.commit()
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
