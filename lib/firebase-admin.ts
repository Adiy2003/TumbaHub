import * as admin from 'firebase-admin'
import * as fs from 'fs'
import type { Auth } from 'firebase-admin/auth'
import type { Firestore } from 'firebase-admin/firestore'
import type { Storage } from 'firebase-admin/storage'

console.log('[FIREBASE-ADMIN] Initializing Firebase Admin SDK...')

let app: admin.app.App

try {
  // Check if already initialized
  console.log('[FIREBASE-ADMIN] Checking if Firebase app already initialized...')
  app = admin.app()
  console.log('[FIREBASE-ADMIN] ✓ Firebase app already initialized')
} catch (e) {
  console.log('[FIREBASE-ADMIN] Firebase app not initialized yet, initializing...')
  // Initialize with service account credentials
  const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './firebase-service-account.json'
  console.log('[FIREBASE-ADMIN] Service account path:', servicePath)
  
  if (!fs.existsSync(servicePath)) {
    console.error('[FIREBASE-ADMIN] ❌ Service account file not found!')
    throw new Error(
      `Service account key not found at ${servicePath}. ` +
      `Please ensure firebase-service-account.json exists in the project root or set FIREBASE_SERVICE_ACCOUNT_KEY env var.`
    )
  }
  
  console.log('[FIREBASE-ADMIN] ✓ Service account file found, reading...')
  const serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf-8'))
  console.log('[FIREBASE-ADMIN] ✓ Service account parsed, projectId:', serviceAccount.project_id)
  
  console.log('[FIREBASE-ADMIN] Initializing Firebase app...')
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket: serviceAccount.project_id + '.appspot.com',
  })
  console.log('[FIREBASE-ADMIN] ✓ Firebase app initialized')
}

console.log('[FIREBASE-ADMIN] Getting auth and firestore references...')
export const adminAuth: Auth = admin.auth(app)
export const adminDb: Firestore = admin.firestore(app)
export const adminStorage: Storage = admin.storage(app)
console.log('[FIREBASE-ADMIN] ✓ Firebase Admin SDK ready')

export default app
