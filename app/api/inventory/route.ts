import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

// מונע מ-Next.js לשמור את זה בזיכרון (כדי שתמיד נראה את המלאי המעודכן)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // הולכים לתת-הקולקציה inventory של המשתמש
    const inventorySnapshot = await adminDb
      .collection('users')
      .doc(session.user.id)
      .collection('inventory')
      .get()

    // ממירים את המסמכים של פיירבייס למערך שהקומפוננטה שלנו מבינה
    const items = inventorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ items })

  } catch (error) {
    console.error('Failed to fetch inventory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}