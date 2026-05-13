import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role as string | undefined

  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(role === 'admin' ? '/admin' : '/dashboard', req.url)
      )
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
