import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

console.log('[STARTUP] Firebase admin imported in signup route')

export async function POST(request: Request) {
  console.log('[SIGNUP] ========== REQUEST STARTED ==========')
  try {
    console.log('[SIGNUP] Parsing request body...')
    const { email, name, password, confirmPassword } = await request.json()
    console.log('[SIGNUP] Body parsed:', { email, name })

    // Validation
    if (!email || !name || !password || !confirmPassword) {
      console.log('[SIGNUP] Validation failed: missing fields')
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      console.log('[SIGNUP] Validation failed: passwords dont match')
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('[SIGNUP] Validation failed: password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    console.log('[SIGNUP] Checking if user exists in Firestore...')
    // Check if user already exists
    const existingUserSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .get()
    console.log('[SIGNUP] ✓ Firestore query complete, found:', !existingUserSnapshot.empty)

    if (!existingUserSnapshot.empty) {
      console.log('[SIGNUP] User already exists')
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    console.log('[SIGNUP] Creating user in Firebase Auth...')
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })
    console.log('[SIGNUP] ✓ User created in Auth, uid:', userRecord.uid)

    // Create user document in Firestore
    console.log('[SIGNUP] Creating user document in Firestore...')
    const now = new Date()
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      balance: 50,
      isAdmin: email === 'alex@example.com',
      createdAt: now,
      updatedAt: now,
    })
    console.log('[SIGNUP] ✓ User document created in Firestore')

    console.log('[SIGNUP] ✓ SUCCESS - Account created')
    return NextResponse.json(
      {
        success: true,
        user: {
          id: userRecord.uid,
          email,
          name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[SIGNUP] ❌ ERROR CAUGHT:', {
      message: error?.message,
      code: error?.code,
      type: error?.constructor?.name,
    })
    
    // Handle Firebase-specific errors
    if (error.code === 'auth/email-already-exists') {
      console.log('[SIGNUP] Firebase auth error: email already exists')
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    console.error('[SIGNUP] Full error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}
