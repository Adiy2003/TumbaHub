import * as admin from 'firebase-admin';
// מייבאים את הסוגים באופן מפורש
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

let app: admin.app.App;

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error('[FIREBASE-ADMIN] ❌ MISSING CREDENTIALS!', {
      hasProjectId: !!serviceAccount.projectId,
      hasClientEmail: !!serviceAccount.clientEmail,
      hasPrivateKey: !!serviceAccount.privateKey,
    });
    // בזמן Build אנחנו לא רוצים שהכל יקרוס אם אין מפתחות
    return admin.initializeApp({
      projectId: serviceAccount.projectId,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// מאתחלים
app = initializeAdmin();

// ייצוא עם הגדרת סוג מפורשת (זה מה שפתר את השגיאה!)
export const adminAuth: Auth = admin.auth(app);
export const adminDb: Firestore = admin.firestore(app);
export const adminStorage: Storage = admin.storage(app);