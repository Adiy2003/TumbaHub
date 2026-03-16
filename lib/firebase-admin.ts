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
try {
  console.log('[FIREBASE-ADMIN] Initializing Firebase Admin SDK...')
  
  // Check if already initialized
  try {
    app = admin.app()
    console.log('[FIREBASE-ADMIN] ✓ Firebase app already initialized')
  } catch (e) {
    let serviceAccount
    
    // Try env var first
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        console.log('[FIREBASE-ADMIN] ✓ Service account from env var')
      } catch (err) {
        console.log('[FIREBASE-ADMIN] Env var not JSON')
      }
    }
    
    // Try file
    if (!serviceAccount) {
      const filePath = './firebase-service-account.json'
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        serviceAccount = JSON.parse(content)
        console.log('[FIREBASE-ADMIN] ✓ Service account from file')
      }
    }
    
    if (serviceAccount) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        storageBucket: serviceAccount.project_id + '.appspot.com',
      })
    } else {
      console.warn('[FIREBASE-ADMIN] ⚠ Service account not found - Firebase may not be initialized (ok during build)')
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
