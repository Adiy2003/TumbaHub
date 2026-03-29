import { NextResponse } from 'next/server'
import { auth } from '@/auth' // <-- הייבוא הנקי של NextAuth v5!
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    // בגרסה 5, ככה שולפים את הסשן בשרת - פשוט וקל
    const session = await auth() 
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // מעדכנים את מסמך המשתמש בפיירבייס עם הטוקן החדש שלו
    const usersRef = adminDb.collection('users')
    const querySnapshot = await usersRef.where('email', '==', session.user.email).get()

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      const currentTokens = userDoc.data().fcmTokens || []
      
      // מוסיפים את הטוקן רק אם הוא עדיין לא קיים שם
      if (!currentTokens.includes(token)) {
        await userDoc.ref.update({
          fcmTokens: [...currentTokens, token]
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}