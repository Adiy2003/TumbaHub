import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDNnKn2fxSw_8jLps3rxHioYlNjRxzDtK0",
  authDomain: "tumbahub.firebaseapp.com",
  projectId: "tumbahub",
  storageBucket: "tumbahub.firebasestorage.app",
  messagingSenderId: "954420545043",
  appId: "1:954420545043:web:66571e7f4449e83869a1e6",
  measurementId: "G-MXNLR9SY0R"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
