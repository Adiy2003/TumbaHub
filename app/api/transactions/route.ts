import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
import { notifyUsers } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { toId, amount, description } = await request.json()

    if (!toId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Get sender user
    const senderDoc = await adminDb.collection('users').doc(session.user.id).get()
    const sender = senderDoc.data()

    if (!sender || sender.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Check if recipient exists
    const recipientDoc = await adminDb.collection('users').doc(toId).get()
    if (!recipientDoc.exists) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Perform transaction using Firestore batch write
    const batch = adminDb.batch()
    const now = new Date()
    const transactionRef = adminDb.collection('transactions').doc()

    // Deduct from sender
    batch.update(adminDb.collection('users').doc(session.user.id), {
      balance: sender.balance - amount,
      updatedAt: now,
    })

    // Add to recipient
    const recipientData = recipientDoc.data() as any
    if (!recipientData) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }
    batch.update(adminDb.collection('users').doc(toId), {
      balance: recipientData.balance + amount,
      updatedAt: now,
    })

    // Record transaction
    batch.set(transactionRef, {
      fromId: session.user.id,
      toId,
      amount,
      action: 'Transfer',
      description: description || '',
      createdAt: now,
    })

    await batch.commit()

    // Notify recipient only
    try {
      await notifyUsers({
        type: 'transfer',
        title: 'Transfer Received',
        message: `${sender.name} sent you ${amount} TumbaCoins${description ? ': ' + description : ''}`,
        relatedUserId: session.user.id,
        relatedUserName: sender.name,
        userIds: [toId],
      })
    } catch (notifError) {
      console.error('Failed to send notification:', notifError)
      // Don't fail the transaction if notification fails
    }

    const transaction = {
      id: transactionRef.id,
      fromId: session.user.id,
      toId,
      amount,
      action: 'Transfer',
      description: description || '',
      createdAt: now,
    }

    return NextResponse.json(
      { success: true, transaction },
      { status: 200 }
    )
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all transactions ordered by createdAt (simple query, no composite index needed)
    const snapshot = await adminDb
      .collection('transactions')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    // Filter transactions where user is sender or recipient (in JavaScript)
    const userTransactions = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter((tx: any) => tx.fromId === session.user.id || tx.toId === session.user.id)
      .slice(0, 50)

    // Fetch user details for transactions
    const transactions = await Promise.all(
      userTransactions.map(async (tx: any) => {
        const fromDoc = await adminDb.collection('users').doc(tx.fromId).get()
        const toDoc = await adminDb.collection('users').doc(tx.toId).get()

        return {
          ...tx,
          from: {
            id: fromDoc.id,
            name: fromDoc.data()?.name,
            email: fromDoc.data()?.email,
          },
          to: {
            id: toDoc.id,
            name: toDoc.data()?.name,
            email: toDoc.data()?.email,
          },
        }
      })
    )

    return NextResponse.json(
      { transactions },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
