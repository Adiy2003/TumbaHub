/** 
 * Firebase Admin SDK initialization
 * This module requires Node.js runtime and cannot run on Edge runtime
 */
import * as admin from 'firebase-admin';

let app: admin.app.App;

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// פונקציה פנימית לאתחול
function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // בדיקת בטיחות - אם חסר מפתח, נדפיס לוג ברור
  if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error('[FIREBASE-ADMIN] ❌ MISSING CREDENTIALS!', {
      hasProjectId: !!serviceAccount.projectId,
      hasClientEmail: !!serviceAccount.clientEmail,
      hasPrivateKey: !!serviceAccount.privateKey,
    });
    throw new Error('Firebase Admin credentials missing');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: `${serviceAccount.projectId}.appspot.com`,
  });
}

try {
  app = initializeAdmin();
  console.log('[FIREBASE-ADMIN] ✅ Initialized successfully');
} catch (error) {
  console.error('[FIREBASE-ADMIN] ❌ Initialization failed:', error);
}

// ייצוא המשתנים בצורה שתמיד תפעיל את האתחול אם הוא חסר
export const adminAuth = admin.auth(app!);
export const adminDb = admin.firestore(app!);
export const adminStorage = admin.storage(app!);