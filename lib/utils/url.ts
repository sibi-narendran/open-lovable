/**
 * URL utilities for handling environment-specific URL generation
 */

/**
 * Get the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL in production, falls back to localhost for development
 * This ensures consistent URL generation across different deployment environments
 */
export function getBaseUrl(): string {
  // In production, use the configured app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // In development or when NEXT_PUBLIC_APP_URL is not set, fall back to localhost
  // Use window.location.origin if available (client-side), otherwise default to localhost:3000
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side fallback for development
  return 'http://localhost:3000';
}

/**
 * Generate the auth callback URL for magic links
 * This ensures magic links always point to the correct domain
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}
