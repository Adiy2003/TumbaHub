import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'
import { notifyAllUsers } from '@/lib/notifications'
import type { DocumentSnapshot } from 'firebase-admin/firestore'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ended = searchParams.get('ended')
    
    // Fetch all bets first
    const allBetsSnapshot = await adminDb.collection('bets').orderBy('createdAt', 'desc').get()

    // Filter locally to handle backwards compatibility with missing 'ended' field
    let betsToMap = allBetsSnapshot.docs
    
    if (ended === 'true') {
      betsToMap = betsToMap.filter(doc => doc.data().ended === true)
    } else if (ended === 'false') {
      betsToMap = betsToMap.filter(doc => {
        const betData = doc.data()
        // If ended field doesn't exist, treat as false
        return !betData.ended || betData.ended === false
      })
    }

    const bets = await Promise.all(
      betsToMap.map(async (doc: DocumentSnapshot) => {
        const betData = doc.data()
        
        // Fetch creator data
        let creator = { name: 'Unknown' }
        if (betData?.creatorId) {
          try {
            const creatorDoc = await adminDb.collection('users').doc(betData.creatorId).get()
            const creatorData = creatorDoc.data()
            creator = { name: creatorData?.name || 'Unknown' }
          } catch (error) {
            console.error('Failed to fetch creator:', error)
          }
        }

        return {
          id: doc.id,
          ...betData,
          createdAt: betData?.createdAt?.toDate?.() || new Date(),
          creator,
        }
      })
    )

    return NextResponse.json(bets)
  } catch (error) {
    console.error('Error fetching bets:', error)
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, sideA, sideB, amount, chosenSide } = await request.json()

    if (!title || !sideA || !sideB || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    // Validate chosenSide
    const side = chosenSide === 'B' ? 'B' : 'A'

    // Get creator user to check balance
    const userDoc = await adminDb.collection('users').doc(session.user.id).get()
    const userData = userDoc.data()

    if (!userData || userData.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create bet document
    const now = new Date()
    const betRef = adminDb.collection('bets').doc()

    const batch = adminDb.batch()

    // Create bet
    batch.set(betRef, {
      title,
      sideA,
      sideB,
      amount,
      voters: [
        {
          userId: session.user.id,
          side: side, // Creator votes for their chosen side
        },
      ],
      createdAt: now,
      creatorId: session.user.id,
      ended: false,
    })

    // Deduct coins from creator
    batch.update(adminDb.collection('users').doc(session.user.id), {
      balance: userData.balance - amount,
      updatedAt: now,
    })

    // Commit batch
    await batch.commit()

    // Notify all users about the new bet
    try {
      await notifyAllUsers({
        type: 'bet_created',
        title: '🎲 New Bet Created',
        message: `${session.user.name} created a bet: "${title}"`,
        excludeUserId: session.user.id,
        relatedUserId: session.user.id,
        relatedUserName: session.user.name,
      })
    } catch (error) {
      console.error('Failed to send bet creation notification:', error)
    }

    return NextResponse.json(
      {
        success: true,
        bet: {
          id: betRef.id,
          title,
          sideA,
          sideB,
          amount,
          voters: [{ userId: session.user.id, side: 'A' }],
          createdAt: now.toISOString(),
          creatorId: session.user.id,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 })
  }
}
