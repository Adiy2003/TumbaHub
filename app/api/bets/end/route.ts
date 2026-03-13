import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'
import { notifyUsers } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin by fetching from database
    const userDoc = await adminDb.collection('users').doc(session.user.id).get()
    const user = userDoc.data()

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    const { betId, winningSide } = await request.json()

    if (!betId || !winningSide || (winningSide !== 'A' && winningSide !== 'B')) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get bet document
    const betDoc = await adminDb.collection('bets').doc(betId).get()

    if (!betDoc.exists) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    const betData = betDoc.data()
    
    if (!betData) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    const voters = betData.voters || []

    if (betData.ended) {
      return NextResponse.json({ error: 'Bet already ended' }, { status: 400 })
    }

    // Calculate winners and losers
    const winners = voters.filter((v: any) => v.side === winningSide)
    const losers = voters.filter((v: any) => v.side !== winningSide)

    // Calculate total pot and winnings per winner
    const totalPot = betData.amount * voters.length
    const winnings = Math.floor(totalPot / (winners.length || 1))

    // Prepare batch updates
    const batch = adminDb.batch()
    const now = new Date()

    // End bet
    batch.update(betDoc.ref, {
      ended: true,
      winningSide,
      endedAt: now,
    })

    // Give winnings to winners
    for (const winner of winners) {
      const userRef = adminDb.collection('users').doc(winner.userId)
      const userDoc = await userRef.get()
      const userData = userDoc.data()

      batch.update(userRef, {
        balance: (userData?.balance || 0) + winnings,
        updatedAt: now,
      })
    }

    // Commit batch
    await batch.commit()

    // Send notifications to winners
    try {
      const winnerIds = winners.map((w: any) => w.userId)
      await notifyUsers({
        type: 'bet_won',
        title: '🎉 You Won!',
        message: `You won ${winnings} TumbaCoins in the bet "${betData.title}"`,
        relatedUserId: 'admin',
        relatedUserName: 'System',
        userIds: winnerIds,
      })
    } catch (error) {
      console.error('Failed to send winner notifications:', error)
    }

    // Send notifications to losers
    try {
      const loserIds = losers.map((l: any) => l.userId)
      await notifyUsers({
        type: 'bet_lost',
        title: '😔 Bet Ended',
        message: `The bet "${betData.title}" ended. Side ${winningSide} won.`,
        relatedUserId: 'admin',
        relatedUserName: 'System',
        userIds: loserIds,
      })
    } catch (error) {
      console.error('Failed to send loser notifications:', error)
    }

    return NextResponse.json({
      success: true,
      message: `Bet ended. ${winners.length} winners received ${winnings} TumbaCoins each.`,
    })
  } catch (error) {
    console.error('Error ending bet:', error)
    return NextResponse.json({ error: 'Failed to end bet' }, { status: 500 })
  }
}
