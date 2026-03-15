import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
import { notifyAllUsers } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    // Get item details
    const itemDoc = await adminDb.collection('shop_items').doc(itemId).get()

    if (!itemDoc.exists) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = { id: itemDoc.id, ...itemDoc.data() as any }

    // Check user balance
    const userDoc = await adminDb.collection('users').doc(session.user.id).get()
    const user = userDoc.data()

    if (!user || user.balance < item.price) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Process purchase using batch write
    const batch = adminDb.batch()
    const now = new Date()
    const transactionRef = adminDb.collection('transactions').doc()

    // Deduct from user balance
    batch.update(adminDb.collection('users').doc(session.user.id), {
      balance: user.balance - item.price,
      updatedAt: now,
    })

    // Record purchase as self-transaction
    batch.set(transactionRef, {
      fromId: session.user.id,
      toId: session.user.id,
      amount: item.price,
      action: `Shop: ${item.name}`,
      description: item.description || '',
      createdAt: now,
    })

    await batch.commit()

    // Notify all users
    try {
      await notifyAllUsers({
        type: 'shop_purchase',
        title: 'Shop Purchase',
        message: `${user.name} bought ${item.name}!`,
        excludeUserId: session.user.id,
        relatedUserId: session.user.id,
        relatedUserName: user.name,
      })
    } catch (notifError) {
      console.error('Failed to send notifications:', notifError)
      // Don't fail the purchase if notifications fail
    }

    const purchase = {
      id: transactionRef.id,
      fromId: session.user.id,
      toId: session.user.id,
      amount: item.price,
      action: `Shop: ${item.name}`,
      description: item.description || '',
      createdAt: now,
    }

    return NextResponse.json(
      { success: true, purchase, item },
      { status: 200 }
    )
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
