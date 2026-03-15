import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('users')
      .orderBy('balance', 'desc')
      .get()

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      balance: doc.data().balance,
      profilePicture: doc.data().profilePicture,
    }))

    return NextResponse.json(
      { users },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
