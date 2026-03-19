import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inventoryItemId, itemName } = await request.json()

    if (!inventoryItemId || !itemName) {
      return NextResponse.json({ error: 'Missing item details' }, { status: 400 })
    }

    // 1. מחיקת החפץ מהמלאי של המשתמש (כי הוא השתמש בו)
    await adminDb
      .collection('users')
      .doc(session.user.id)
      .collection('inventory')
      .doc(inventoryItemId)
      .delete()

    // 2. פה בעתיד נוסיף את האפקט של החפץ (למשל: הכפלת מטבעות, מגן וכו')
    // ...

    // 3. שליחת התראה לכל המשתמשים באפליקציה!
    // אנחנו מושכים את כל המשתמשים
    const usersSnapshot = await adminDb.collection('users').get()
    
    // משתמשים ב-Batch כדי לעשות את כל הכתיבות לפיירבייס בפעולה אחת מהירה
    const batch = adminDb.batch()
    const now = new Date().toISOString()

    usersSnapshot.docs.forEach((userDoc) => {
      // יוצרים רפרנס להתראה חדשה אצל כל משתמש
      const notificationRef = adminDb
        .collection('users')
        .doc(userDoc.id)
        .collection('notifications')
        .doc()

      batch.set(notificationRef, {
        type: 'item_used', // סוג חדש של התראה בשביל האייקון!
        title: 'Item Used! 🪄',
        message: `${session.user?.name} just used a ${itemName}!`,
        relatedUser: {
          id: session.user.id,
          name: session.user.name
        },
        read: false,
        createdAt: now
      })
    })

    // מבצעים את כל הכתיבות במכה אחת
    await batch.commit()

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to use item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}