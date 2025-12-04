import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session token from cookies
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnLogin = pathname.startsWith('/login')
  const isLoggedIn = !!sessionToken

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
