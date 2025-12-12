'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  searchMovies,
  getMovieDetails,
  ApiError,
  SearchMoviesOptions,
  GetMovieDetailsOptions,
} from './api-client';
import { SearchResponse, MovieDetails } from '@/app/types/movie';

/**
 * Hook return type for API calls
 */
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for searching movies
 *
 * @param options - Search options (can be null/undefined to skip initial fetch)
 * @param immediate - Whether to fetch immediately on mount (default: false)
 * @returns State object with data, loading, error, and refetch function
 *
 * @example
 * ```typescript
 * const { data, loading, error, refetch } = useSearchMovies(
 *   { query: 'inception' },
 *   true // fetch immediately
 * );
 * ```
 */
export function useSearchMovies(
  options: SearchMoviesOptions | null,
  immediate: boolean = false
): UseApiState<SearchResponse> {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate && options !== null);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!options) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchMovies(options);
      setData(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown Error', 'An unexpected error occurred', err);
      setError(apiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (immediate && options) {
      fetchData();
    }
  }, [immediate, options, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * React hook for getting movie details
 *
 * @param options - Movie details options (can be null/undefined to skip initial fetch)
 * @param immediate - Whether to fetch immediately on mount (default: false)
 * @returns State object with data, loading, error, and refetch function
 *
 * @example
 * ```typescript
 * const { data, loading, error, refetch } = useMovieDetails(
 *   { id: 550 },
 *   true // fetch immediately
 * );
 * ```
 */
export function useMovieDetails(
  options: GetMovieDetailsOptions | null,
  immediate: boolean = false
): UseApiState<MovieDetails> {
  const [data, setData] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate && options !== null);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!options) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getMovieDetails(options);
      setData(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown Error', 'An unexpected error occurred', err);
      setError(apiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (immediate && options) {
      fetchData();
    }
  }, [immediate, options, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Generic hook for API calls with manual trigger
 *
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApiCall<SearchResponse>();
 *
 * const handleSearch = () => {
 *   execute(() => searchMovies({ query: 'inception' }));
 * };
 * ```
 */
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown Error', 'An unexpected error occurred', err);
      setError(apiError);
      setData(null);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

