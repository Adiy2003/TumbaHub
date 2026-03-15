import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      )
    }

    await adminDb
      .collection('users')
      .doc(session.user.id)
      .collection('notifications')
      .doc(notificationId)
      .update({ read: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
