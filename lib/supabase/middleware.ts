import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware helper for Supabase auth state management
 * 
 * This function creates a Supabase client in middleware context and
 * refreshes the user's session if needed.
 * 
 * Usage in middleware.ts:
 * ```ts
 * import { updateSession } from '@/lib/supabase/middleware'
 * 
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so the user
  // is never redirected, causing an infinite loop!

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  if (!user) {
    // No user, so we can return early
    return supabaseResponse;
  }

  // IMPORTANT: You *must* refresh the session BEFORE running any Server Component code
  // that uses the Supabase client. Otherwise, the Server Component will run with a stale
  // session and may cause issues.
  await supabase.auth.getSession();

  return supabaseResponse;
}

