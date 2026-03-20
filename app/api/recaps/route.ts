import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// שליפת כל נקודות הסיכום
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('recap_points')
      .orderBy('createdAt', 'asc')
      .get()
      
    const points = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ points }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch recaps:', error)
    return NextResponse.json({ error: 'Failed to fetch recaps' }, { status: 500 })
  }
}

// הוספת נקודת סיכום חדשה
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, monthId } = await request.json()

    if (!text || !monthId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPointRef = adminDb.collection('recap_points').doc()
    const now = new Date()

    const pointData = {
      text,
      monthId, // לדוגמה: "2026-03"
      createdById: session.user.id,
      createdByName: session.user.name,
      createdAt: now.toISOString(),
    }

    await newPointRef.set(pointData)

    return NextResponse.json({ success: true, point: { id: newPointRef.id, ...pointData } })
  } catch (error) {
    console.error('Failed to add recap point:', error)
    return NextResponse.json({ error: 'Failed to add recap point' }, { status: 500 })
  }
}