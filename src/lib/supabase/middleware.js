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

export default createClient;
