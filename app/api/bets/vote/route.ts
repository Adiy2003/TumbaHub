import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { betId, side } = await request.json()

    if (!betId || !side || (side !== 'A' && side !== 'B')) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get bet document
    const betDoc = await adminDb.collection('bets').doc(betId).get()

    if (!betDoc.exists) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    const betData = betDoc.data()
    const voters = betData?.voters || []

    // Check if user already voted
    if (voters.some((v: any) => v.userId === session.user.id)) {
      return NextResponse.json({ error: 'You have already voted on this bet' }, { status: 400 })
    }

    // Get user to check balance
    const userDoc = await adminDb.collection('users').doc(session.user.id).get()
    const userData = userDoc.data()

    if (!userData || !betData || userData.balance < betData.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Update bet with new voter
    const now = new Date()
    const newVoters = [...voters, { userId: session.user.id, side }]

    const batch = adminDb.batch()

    // Update bet
    batch.update(betDoc.ref, {
      voters: newVoters,
      updatedAt: now,
    })

    // Deduct coins from user
    batch.update(adminDb.collection('users').doc(session.user.id), {
      balance: userData.balance - betData.amount,
      updatedAt: now,
    })

    // Commit batch
    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Voted for side ${side}!`,
    })
  } catch (error) {
    console.error('Error voting on bet:', error)
    return NextResponse.json({ error: 'Failed to vote on bet' }, { status: 500 })
  }
}
