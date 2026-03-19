import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb } from '@/lib/firebase-admin'
import { notifyAllUsers } from '@/lib/notifications'

// חשוב: הרשימה פה חייבת להיות זהה לחלוטין לרשימה בקומפוננטה!
const PRIZES = [
  { id: 1, label: '+20 Coins', value: 20, type: 'coins' },
  { id: 2, label: 'Leader Veto', value: 'veto', type: 'item' },
  { id: 3, label: '+10 Coins', value: 10, type: 'coins' },
  { id: 4, label: '-10 Coins', value: -10, type: 'penalty' },
  { id: 5, label: 'No Driving', value: 'no_driving', type: 'special' },
  { id: 6, label: 'Try Again', value: 0, type: 'empty' },
  { id: 7, label: '-15 Coins', value: -15, type: 'penalty' },
  { id: 8, label: '+5 Coins', value: 5, type: 'coins' },
]

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRef = adminDb.collection('users').doc(session.user.id)
    const userDoc = await userRef.get()
    const userData = userDoc.data()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // --- חסימת סיבוב כפול (מבוטל כרגע לצורכי טסטים) ---
    /*
    const lastSpin = userData.lastSpinAt?.toDate()
    if (lastSpin) {
      const hoursSinceLastSpin = (Date.now() - lastSpin.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastSpin < 24) {
        return NextResponse.json(
          { error: 'You already spun today! Come back tomorrow.' }, 
          { status: 400 }
        )
      }
    }
    */

    // 1. השרת מגריל את התוצאה!
    const winningIndex = Math.floor(Math.random() * PRIZES.length)
    const prize = PRIZES[winningIndex]

    // 2. פותחים Batch לעדכון מסד הנתונים
    const batch = adminDb.batch()
    const now = new Date()

    // שומרים את זמן הסיבוב הנוכחי
    batch.update(userRef, { lastSpinAt: now })

    let notificationMessage = `${userData.name} spun the wheel and got ${prize.label}!`

    // 3. לוגיקה לפי סוג הפרס
    if (prize.type === 'coins' || prize.type === 'penalty') {
      const currentBalance = userData.balance || 0
      // לא נותנים למינוס להוריד את המאזן מתחת ל-0
      const newBalance = Math.max(0, currentBalance + (prize.value as number)) 
      
      batch.update(userRef, { balance: newBalance })

      // מתעדים את התנועה (Transaction)
      const txRef = adminDb.collection('transactions').doc()
      batch.set(txRef, {
        fromId: (prize.value as number) > 0 ? 'system' : session.user.id,
        toId: (prize.value as number) > 0 ? session.user.id : 'system',
        amount: Math.abs(prize.value as number),
        action: `Wheel Spin: ${prize.label}`,
        createdAt: now,
      })
    } 
    else if (prize.type === 'item' || prize.type === 'special') {
      // מכניסים את החפץ ישירות לתיק (Inventory) שיצרנו קודם!
      const inventoryRef = userRef.collection('inventory').doc()
      batch.set(inventoryRef, {
        name: prize.label,
        description: 'Won from the Daily Wheel! 🎡',
        type: prize.value,
        acquiredAt: now.toISOString()
      })
    }

    // מבצעים את כל הכתיבות לפיירבייס יחד
    await batch.commit()

    // מודיעים לכולם אם זו זכייה משמעותית (מעל 10 מטבעות או חפץ מיוחד)
   if (prize.type === 'item' || prize.type === 'special' || (prize.type === 'coins' && (prize.value as number) > 10)) {
      await notifyAllUsers({
        type: 'wheel_spin',
        title: 'Big Win! 🎡',
        message: notificationMessage,
        excludeUserId: session.user.id, // <--- הנה השורה שהייתה חסרה!
        relatedUserId: session.user.id,
        relatedUserName: userData.name,
      }).catch(console.error) // לא מכשיל את הסיבוב אם ההתראה נכשלה
    }

    // מחזירים ללקוח איזה אינדקס ניצח כדי שהוא יידע איך לסובב את האנימציה
    return NextResponse.json({ success: true, prizeIndex: winningIndex, prize })

  } catch (error) {
    console.error('Wheel spin error:', error)
    return NextResponse.json({ error: 'Failed to spin wheel' }, { status: 500 })
  }
}