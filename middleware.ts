export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validateEnvironmentVariables } from '@/lib/env-validation'

// Validate environment variables on startup
validateEnvironmentVariables()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth routes
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  const session = await auth()

  // If user is not authenticated and tries to access protected routes, redirect to login
  const protectedRoutes = ['/', '/leaderboard', '/profile', '/bets', '/album', '/transactions', '/shop', '/admin']
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Note: Admin route protection should be checked in the route handler using the isAdmin field from database
  // This middleware level check is for basic route protection only
  // Detailed admin checks are done at the API endpoint level

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

