import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Create a Supabase client for use in Next.js middleware
 * Handles session refresh and cookie management
 *
 * @param {Request} request - The incoming request
 * @returns {Object} { supabase, response } - Supabase client and response with updated cookies
 */
export function createClient(request) {
  // Create a response object to update cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Check if a pathname matches public routes
 * @param {string} pathname - The request pathname
 * @returns {boolean} True if the route is public
 */
function isPublicRoute(pathname) {
  const publicRoutes = [
    '/authentication',
    '/auth/callback',
    '/_next',
    '/favicon.ico',
    '/api',
  ];
  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if a pathname matches protected routes
 * @param {string} pathname - The request pathname
 * @returns {boolean} True if the route is protected
 */
function isProtectedRoute(pathname) {
  const protectedRoutes = [
    '/dashboard',
    '/apps',
    '/pages',
  ];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Update session and handle route protection
 * Refreshes the Supabase session and redirects based on auth state
 *
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} Response with updated session or redirect
 */
export async function updateSession(request) {
  const { supabase, response } = createClient(request);

  // Refresh session by calling getUser
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If there's an auth error or no user on protected route, redirect to login
  if ((error || !user) && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/authentication/default/jwt/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to CRM dashboard
  if (user && pathname.startsWith('/authentication') && !pathname.includes('/callback')) {
    const dashboardUrl = new URL('/dashboard/crm', request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export default createClient;
