import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

// שליפת כל האירועים
export async function GET() {
  try {
    const snapshot = await adminDb.collection('events').get()
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// יצירת אירוע חדש
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, date, type } = await request.json()

    if (!title || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newEventRef = adminDb.collection('events').doc()
    const now = new Date()

    const eventData = {
      title,
      date, // נשמר בפורמט YYYY-MM-DD
      type: type || 'general', // סוג האירוע: נהיגה, אירוח או כללי
      createdById: session.user.id,
      createdByName: session.user.name,
      createdAt: now.toISOString(),
    }

    await newEventRef.set(eventData)

    return NextResponse.json({ success: true, event: { id: newEventRef.id, ...eventData } })
  } catch (error) {
    console.error('Failed to create event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}