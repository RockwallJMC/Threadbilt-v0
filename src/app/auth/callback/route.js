/**
 * OAuth Callback Route Handler
 *
 * Handles OAuth redirects from providers (Google, Azure)
 * Exchanges authorization code for session and redirects based on user state
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Create error redirect URL
 * @param {string} baseUrl - Base URL from request
 * @param {string} errorType - Error type (auth_failed, server_error)
 * @returns {URL} Login URL with error parameter
 */
function createErrorRedirect(baseUrl, errorType) {
  const loginUrl = new URL('/authentication/default/jwt/login', baseUrl);
  loginUrl.searchParams.set('error', errorType);
  return loginUrl;
}

/**
 * GET handler for OAuth callback
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Redirect response
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Early return: No code provided
  if (!code) {
    return NextResponse.redirect(
      new URL('/authentication/default/jwt/login', request.url)
    );
  }

  try {
    const supabase = await createClient();

    // Exchange authorization code for session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    // Early return: Code exchange failed
    if (sessionError || !sessionData?.session) {
      return NextResponse.redirect(createErrorRedirect(request.url, 'auth_failed'));
    }

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Early return: User retrieval failed
    if (userError || !userData?.user) {
      return NextResponse.redirect(createErrorRedirect(request.url, 'auth_failed'));
    }

    // Check if user has an active organization
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, is_active')
      .eq('user_id', userData.user.id)
      .single();

    // Early return: Database error (not "no rows" error)
    if (memberError && memberError.code !== 'PGRST116') {
      return NextResponse.redirect(createErrorRedirect(request.url, 'server_error'));
    }

    // Early return: User has no organization - redirect to setup
    if (!memberData || !memberData.organization_id) {
      return NextResponse.redirect(
        new URL('/organization-setup', request.url)
      );
    }

    // Success: User has organization - redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    // Catch-all: Unexpected error - redirect to login with error
    return NextResponse.redirect(createErrorRedirect(request.url, 'server_error'));
  }
}
