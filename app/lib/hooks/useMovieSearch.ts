'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchMovies, ApiError } from '@/app/lib/api-client';
import { SearchResponse } from '@/app/types/movie';

/**
 * Return type for useMovieSearch hook
 */
export interface UseMovieSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResponse | null;
  loading: boolean;
  error: ApiError | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  hasSearched: boolean;
}

/**
 * Options for useMovieSearch hook
 */
export interface UseMovieSearchOptions {
  debounceMs?: number; // Debounce delay in milliseconds (default: 500)
  minQueryLength?: number; // Minimum query length to trigger search (default: 1)
  autoSearch?: boolean; // Automatically search when query changes (default: true)
}

/**
 * Custom React hook for movie search with debouncing
 * 
 * Manages search query, results, loading, and error states.
 * Debounces search input to prevent excessive API calls.
 * 
 * @param options - Configuration options for the hook
 * @returns Object with search state and functions
 * 
 * @example
 * ```typescript
 * const { query, setQuery, results, loading, error } = useMovieSearch();
 * 
 * // The search will automatically trigger when query changes (debounced)
 * <input 
 *   value={query} 
 *   onChange={(e) => setQuery(e.target.value)} 
 * />
 * 
 * // Or manually trigger search
 * const { search } = useMovieSearch({ autoSearch: false });
 * <button onClick={() => search('inception')}>Search</button>
 * ```
 */
export function useMovieSearch(
  options: UseMovieSearchOptions = {}
): UseMovieSearchReturn {
  const {
    debounceMs = 500,
    minQueryLength = 1,
    autoSearch = true,
  } = options;

  const [query, setQueryState] = useState<string>('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Refs to track debounce timer and current request
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRequestIdRef = useRef<number>(0);
  const lastQueryRef = useRef<string>('');

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(
    async (searchQuery: string): Promise<void> => {
      const trimmedQuery = searchQuery.trim();

      // Clear results if query is empty
      if (trimmedQuery.length === 0) {
        setResults(null);
        setError(null);
        setLoading(false);
        setHasSearched(false);
        lastQueryRef.current = '';
        return;
      }

      // Check minimum query length
      if (trimmedQuery.length < minQueryLength) {
        setResults(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Prevent duplicate requests for the same query
      if (trimmedQuery === lastQueryRef.current && loading) {
        return;
      }

      // Generate unique request ID
      const requestId = ++currentRequestIdRef.current;
      lastQueryRef.current = trimmedQuery;

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchMovies({
          query: trimmedQuery,
          page: 1,
        });

        // Only update state if this is still the current request
        if (requestId === currentRequestIdRef.current) {
          setResults(searchResults);
          setError(null);
          setHasSearched(true);
        }
      } catch (err) {
        // Only update state if this is still the current request
        if (requestId === currentRequestIdRef.current) {
          const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown Error', 'An unexpected error occurred', err);
          setError(apiError);
          setResults(null);
          setHasSearched(true);
        }
      } finally {
        // Only update loading state if this is still the current request
        if (requestId === currentRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [minQueryLength, loading]
  );

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  /**
   * Manual search function (immediate, no debounce)
   */
  const search = useCallback(
    async (searchQuery: string): Promise<void> => {
      // Clear any pending debounced search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Increment request ID to invalidate any in-flight requests
      currentRequestIdRef.current++;

      await performSearch(searchQuery);
    },
    [performSearch]
  );

  /**
   * Set query with optional auto-search
   */
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);

      if (autoSearch) {
        debouncedSearch(newQuery);
      }
    },
    [autoSearch, debouncedSearch]
  );

  /**
   * Clear search and results
   */
  const clearSearch = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Invalidate any in-flight requests
    currentRequestIdRef.current++;

    setQueryState('');
    setResults(null);
    setError(null);
    setLoading(false);
    setHasSearched(false);
    lastQueryRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Invalidate any in-flight requests by incrementing request ID
      // This prevents stale results from being set after unmount
      currentRequestIdRef.current++;
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    clearSearch,
    hasSearched,
  };
}

