import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. מאפשרים גישה חופשית לעמודי ההתחברות וההרשמה
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // 2. בדיקה קלילה ומהירה של העוגייה (Cookie) במקום לייבא ספריות שרת כבדות
  const hasSession = request.cookies.has('next-auth.session-token') || 
                     request.cookies.has('__Secure-next-auth.session-token')

  // 3. הגדרת העמודים המוגנים (בלי הלוכסן הבעייתי)
  const protectedPaths = ['/leaderboard', '/profile', '/bets', '/album', '/transactions', '/shop', '/admin']
  
  // בודקים אם הנתיב הוא עמוד הבית (/) או אחד מהעמודים המוגנים
  const isProtectedRoute = pathname === '/' || protectedPaths.some(route => pathname.startsWith(route))

  // 4. אם אין חיבור ומנסים לגשת לעמוד מוגן - מעבירים להתחברות
  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
