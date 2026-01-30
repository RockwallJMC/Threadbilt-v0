import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set(name, value, options)
        },
        remove(name, options) {
          response.cookies.delete(name, options)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/dashboards') && !user) {
    const loginUrl = new URL('/authentication/default/jwt/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/authentication') && user) {
    const dashboardUrl = new URL('/dashboards/default', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/dashboards/:path*',
    '/authentication/:path*',
  ],
}
