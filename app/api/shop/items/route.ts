import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('shop_items')
      .orderBy('price', 'asc')
      .get()

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ items }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch shop items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}
