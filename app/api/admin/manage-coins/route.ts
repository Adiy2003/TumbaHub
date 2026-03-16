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

    // Check if admin
    const adminDoc = await adminDb.collection('users').doc(session.user.id).get()
    const admin = adminDoc.data()

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { userId, actionId, customAmount, description } = await request.json()

    if (!userId || (!actionId && customAmount === undefined)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    let amount = customAmount
    let action = 'Admin adjustment'

    if (actionId) {
      const actionDoc = await adminDb.collection('actions').doc(actionId).get()
      if (!actionDoc.exists) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 })
      }
      const actionData = actionDoc.data()
      amount = actionData?.amount
      action = actionData?.name
    }

    // Update user balance
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const user = userDoc.data()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create transaction record using batch write
    const batch = adminDb.batch()
    const now = new Date()
    const transactionRef = adminDb.collection('transactions').doc()

    // Update user balance
    batch.update(adminDb.collection('users').doc(userId), {
      balance: user.balance + amount,
      updatedAt: now,
    })

    // Record transaction
    batch.set(transactionRef, {
      fromId: session.user.id,
      toId: userId,
      amount: Math.abs(amount),
      action,
      description: description || `${amount > 0 ? '+' : ''}${amount} coins`,
      createdAt: now,
    })

    await batch.commit()

    // Notify all users
    try {
      await notifyAllUsers({
        type: 'admin_bonus',
        title: 'Admin Bonus',
        message: `${user.name} received ${Math.abs(amount)} TumbaCoins: ${action}`,
        excludeUserId: userId,
        relatedUserId: userId,
        relatedUserName: user.name,
      })
    } catch (notifError) {
      console.error('Failed to send notifications:', notifError)
      // Don't fail the operation if notifications fail
    }

    const transaction = {
      id: transactionRef.id,
      fromId: session.user.id,
      toId: userId,
      amount: Math.abs(amount),
      action,
      description: description || `${amount > 0 ? '+' : ''}${amount} coins`,
      createdAt: now,
    }

    return NextResponse.json({ success: true, transaction }, { status: 200 })
  } catch (error) {
    console.error('Admin operation error:', error)
    return NextResponse.json(
      { error: 'Failed to process operation' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDoc = await adminDb.collection('users').doc(session.user.id).get()
    const admin = adminDoc.data()

    if (!admin?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch users, actions, and transactions in parallel
    const [usersSnapshot, actionsSnapshot, transactionsSnapshot] = await Promise.all([
      adminDb.collection('users').orderBy('email', 'asc').get(),
      adminDb.collection('actions').orderBy('amount', 'desc').get(),
      adminDb.collection('transactions').orderBy('createdAt', 'desc').limit(50).get(),
    ])

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      balance: doc.data().balance,
    }))

    const actions = actionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Fetch user data for transactions
    const transactions = await Promise.all(
      transactionsSnapshot.docs.map(async doc => {
        const data = doc.data()
        const fromDoc = await adminDb.collection('users').doc(data.fromId).get()
        const toDoc = await adminDb.collection('users').doc(data.toId).get()
        
        return {
          id: doc.id,
          ...data,
          from: { name: fromDoc.data()?.name },
          to: { name: toDoc.data()?.name },
        }
      })
    )

    return NextResponse.json(
      { users, actions, transactions },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch admin data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
