/**
 * Server-side configuration utilities
 * Safely access environment variables with validation
 */

/**
 * Get TMDB API key from environment variables
 * Throws an error if the key is not set (server-side only)
 */
export function getTmdbApiKey(): string {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
    throw new Error(
      'TMDB_API_KEY is not set or is using the placeholder value. Please set it in .env.local'
    );
  }

  return apiKey;
}

/**
 * Get the application base URL
 * Defaults to localhost:3000 if not set
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Configuration object with all environment variables
 */
export const config = {
  tmdbApiKey: getTmdbApiKey,
  appUrl: getAppUrl,
} as const;

