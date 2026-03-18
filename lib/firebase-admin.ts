/** 
 * Firebase Admin SDK initialization
 * This module requires Node.js runtime and cannot run on Edge runtime
 */

import * as admin from 'firebase-admin'
import * as fs from 'fs'
import type { Auth } from 'firebase-admin/auth'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

let app: admin.app.App | undefined
let _adminAuth: Auth | undefined
let _adminDb: Firestore | undefined
let _adminStorage: Storage | undefined

// Initialize Firebase - wrapped in try-catch so build doesn't fail if service account doesn't exist
// Initialize Firebase
try {
  console.log('[FIREBASE-ADMIN] Initializing Firebase Admin SDK...')
  
  try {
    app = admin.app()
    console.log('[FIREBASE-ADMIN] ✓ Firebase app already initialized')
  } catch (e) {
    // הדרך הבטוחה: אתחול דרך משתנים נפרדים במקום JSON ענק
    if (process.env.FIREBASE_PRIVATE_KEY) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // שורת הקסם שמתקנת את ירידות השורה ב-Vercel
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      })
      console.log('[FIREBASE-ADMIN] ✓ Firebase initialized with separate env vars')
    } else {
      console.warn('[FIREBASE-ADMIN] ⚠ Service account details missing - Firebase not initialized')
    }
  }
  
  
  if (app) {
    _adminAuth = admin.auth(app)
    _adminDb = admin.firestore(app)
    _adminStorage = admin.storage(app)
    console.log('[FIREBASE-ADMIN] ✓ Firebase initialized successfully')
  }
} catch (err) {
  console.error('[FIREBASE-ADMIN] ❌ Initialization error:', err instanceof Error ? err.message : String(err))
  console.warn('[FIREBASE-ADMIN] ⚠ Firebase will be unavailable (may be ok during build)')
}

// Export with type assertions - guaranteed to be non-null after initialization at runtime
// We use 'as' to ensure TypeScript knows these are safe to use in API routes
export const adminAuth = _adminAuth as unknown as Auth
export const adminDb = _adminDb as unknown as Firestore
export const adminStorage = _adminStorage as unknown as Storage

// Getter functions for explicit null checking if needed
export const getAdminAuth = (): Auth => {
  if (!_adminAuth) throw new Error('Firebase Auth not initialized')
  return _adminAuth
}

export const getAdminDb = (): Firestore => {
  if (!_adminDb) throw new Error('Firebase Firestore not initialized')
  return _adminDb
}

export const getAdminStorage = (): Storage => {
  if (!_adminStorage) throw new Error('Firebase Storage not initialized')
  return _adminStorage
}

export default app
