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
  
  let serviceAccount
  
  // Try to load from environment variable first (CI/CD environments)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.log('[FIREBASE-ADMIN] Loading from FIREBASE_SERVICE_ACCOUNT_KEY env var...')
    try {
      // If it's a JSON string, parse it directly
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      console.log('[FIREBASE-ADMIN] ✓ Service account parsed from env var, projectId:', serviceAccount.project_id)
    } catch (parseError) {
      // If it fails, might be a file path
      console.log('[FIREBASE-ADMIN] Not valid JSON, treating as file path...')
      const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      if (!fs.existsSync(servicePath)) {
        throw new Error(`Service account file not found at ${servicePath}`)
      }
      serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf-8'))
      console.log('[FIREBASE-ADMIN] ✓ Service account loaded from file, projectId:', serviceAccount.project_id)
    }
  } else {
    // Fall back to file in project root
    const servicePath = './firebase-service-account.json'
    console.log('[FIREBASE-ADMIN] Checking for file at:', servicePath)
    
    if (!fs.existsSync(servicePath)) {
      console.error('[FIREBASE-ADMIN] ❌ Service account file not found!')
      throw new Error(
        `Service account key not found. ` +
        `Please ensure firebase-service-account.json exists in project root or set FIREBASE_SERVICE_ACCOUNT_KEY env var with JSON content.`
      )
    }
    
    console.log('[FIREBASE-ADMIN] ✓ Service account file found, reading...')
    serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf-8'))
    console.log('[FIREBASE-ADMIN] ✓ Service account parsed, projectId:', serviceAccount.project_id)
  }
  
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
