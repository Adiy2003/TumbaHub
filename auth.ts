export const runtime = 'nodejs'

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Server-side only import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getAdminDb = async () => {
  const { adminDb } = await import('@/lib/firebase-admin')
  return adminDb
}

const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          // Verify credentials with Firebase Auth REST API
          const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          if (!firebaseApiKey) {
            console.error('[AUTH] Firebase API key not configured')
            throw new Error('Authentication service not configured')
          }

          const authResponse = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                returnSecureToken: true,
              }),
            }
          )

          const authData = await authResponse.json()
          
          // Check for errors in the response
          if (authData.error) {
            const errorMessage = authData.error.message
            console.error('[AUTH] Firebase auth error:', errorMessage)
            
            if (errorMessage === 'INVALID_EMAIL_PASSWORD_USER_NOT_FOUND') {
              throw new Error('No user found with this email')
            } else if (errorMessage === 'INVALID_PASSWORD') {
              throw new Error('Invalid password')
            } else if (errorMessage === 'INVALID_EMAIL') {
              throw new Error('Invalid email address')
            } else if (errorMessage === 'USER_DISABLED') {
              throw new Error('This account has been disabled')
            }
            
            console.error('[AUTH] Unhandled Firebase error:', errorMessage)
            throw new Error('Invalid email or password')
          }

          const uid = authData.localId

          // Get user data from Firestore
          const adminDb = await getAdminDb()
          const userDoc = await adminDb.collection('users').doc(uid).get()

          if (!userDoc.exists) {
            console.error('[AUTH] User document not found in Firestore for uid:', uid)
            throw new Error('User data not found')
          }

          const userData = userDoc.data()

          console.log('[AUTH] User authenticated:', userData?.email)
          
          return {
            id: userDoc.id,
            email: userData?.email,
            name: userData?.name,
          }
        } catch (error) {
          console.error('[AUTH] Authorization error:', error)
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error('Authentication failed')
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // When user first logs in, store all their info
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        console.log('[AUTH JWT]', 'New login:', user.email)
      }
      // If session is being updated, update the token too
      if (trigger === 'update' && session) {
        token.id = session.id
        token.email = session.email
        token.name = session.name
        console.log('[AUTH JWT]', 'Token updated:', session.email)
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        console.log('[AUTH SESSION]', 'Session for:', session.user.email)
      }
      return session
    },
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { auth, handlers, signIn, signOut }: any = NextAuth(authConfig)
