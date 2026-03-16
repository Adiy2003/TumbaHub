import { signOut } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  console.log('[AUTH LOGOUT] User logging out')
  // signOut() will handle the redirect
  await signOut({ redirectTo: '/auth/login' })
}
