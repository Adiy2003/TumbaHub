import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'
import { notifyAllUsers } from '@/lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    
    // --- 1. יצירת רפרנס למסמך החדש בתוך התיק של המשתמש ---
    const inventoryRef = adminDb
      .collection('users')
      .doc(session.user.id)
      .collection('inventory')
      .doc()

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

    // --- 2. שמירת נתוני החפץ בתוך התיק! ---
    batch.set(inventoryRef, {
      name: item.name,
      description: item.description || '',
      type: item.type || 'mystery', // ברירת מחדל למקרה שאין סוג מוגדר בחנות
      imageUrl: item.imageUrl || null,
      acquiredAt: now.toISOString(),
    })

    // מבצעים את כל ה-3 פעולות במכה אחת!
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
