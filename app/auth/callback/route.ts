import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback route handler
 * 
 * Handles magic link authentication callback from Supabase.
 * Exchanges the code from URL query parameters for a session,
 * sets authentication cookies, and redirects to home page.
 * 
 * Route: /auth/callback
 * Method: GET
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  // If no code is present, redirect to auth page
  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_code', requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[auth/callback] Missing Supabase environment variables');
    return NextResponse.redirect(
      new URL('/auth?error=configuration_error', requestUrl.origin)
    );
  }

  // Create response object for redirect
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  // Create Supabase client with cookie handling for route handlers
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  try {
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // Session is now set in cookies via the supabase client
    // The response will include the authentication cookies
    return response;
  } catch (error) {
    console.error('[auth/callback] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }
}

