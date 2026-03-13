import { signOut } from '@/auth'

export async function POST() {
  console.log('[AUTH LOGOUT] User logging out')
  // signOut() will handle the redirect
  await signOut({ redirectTo: '/auth/login' })
}
