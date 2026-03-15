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
    const envValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    
    try {
      // Try base64 decode first (for GitHub Actions)
      console.log('[FIREBASE-ADMIN] Trying to decode as base64...')
      const decoded = Buffer.from(envValue, 'base64').toString('utf-8')
      serviceAccount = JSON.parse(decoded)
      console.log('[FIREBASE-ADMIN] ✓ Service account decoded from base64, projectId:', serviceAccount.project_id)
    } catch (base64Error) {
      try {
        // Try plain JSON next
        console.log('[FIREBASE-ADMIN] Base64 decode failed, trying plain JSON...')
        serviceAccount = JSON.parse(envValue)
        console.log('[FIREBASE-ADMIN] ✓ Service account parsed from plain JSON, projectId:', serviceAccount.project_id)
      } catch (jsonError) {
        // If JSON fails, treat as file path
        console.log('[FIREBASE-ADMIN] JSON parse failed, treating as file path...')
        if (!fs.existsSync(envValue)) {
          throw new Error(`Service account: neither valid JSON/base64 nor file found at ${envValue}`)
        }
        serviceAccount = JSON.parse(fs.readFileSync(envValue, 'utf-8'))
        console.log('[FIREBASE-ADMIN] ✓ Service account loaded from file, projectId:', serviceAccount.project_id)
      }
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
