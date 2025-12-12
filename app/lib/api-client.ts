import { SearchResponse, MovieDetails } from '@/app/types/movie';

/**
 * API Error Response from Next.js API routes
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.statusCode === 503 || this.statusCode === 0;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Check if error is not found error
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Result type for API calls - either success or error
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * Search movies options
 */
export interface SearchMoviesOptions {
  query: string;
  page?: number;
}

/**
 * Get movie details options
 */
export interface GetMovieDetailsOptions {
  id: number;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const errorData: ApiErrorResponse = await response.json();
    return new ApiError(
      errorData.statusCode || response.status,
      errorData.error || 'Unknown Error',
      errorData.message || 'An error occurred',
      errorData
    );
  } catch {
    // If we can't parse the error response, create a generic error
    return new ApiError(
      response.status,
      'Unknown Error',
      `Request failed with status ${response.status}`,
      response
    );
  }
}

/**
 * Handle fetch errors (network errors, etc.)
 */
function handleFetchError(error: unknown): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError(
      503,
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.',
      error
    );
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    500,
    'Unknown Error',
    error instanceof Error ? error.message : 'An unexpected error occurred',
    error
  );
}

/**
 * Search for movies
 *
 * @param options - Search options including query and optional page
 * @returns Promise resolving to SearchResponse or throwing ApiError
 * @throws {ApiError} If the request fails
 *
 * @example
 * ```typescript
 * try {
 *   const results = await searchMovies({ query: 'inception' });
 *   console.log(results.results);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
export async function searchMovies(
  options: SearchMoviesOptions
): Promise<SearchResponse> {
  const { query, page = 1 } = options;

  if (!query || query.trim().length === 0) {
    throw new ApiError(
      400,
      'Invalid Request',
      'Query parameter is required and cannot be empty'
    );
  }

  try {
    const searchParams = new URLSearchParams({
      query: query.trim(),
      page: page.toString(),
    });

    const response = await fetch(`/api/movies/search?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw handleFetchError(error);
  }
}

/**
 * Search for movies with result type (no exception throwing)
 *
 * @param options - Search options including query and optional page
 * @returns Promise resolving to ApiResult<SearchResponse>
 *
 * @example
 * ```typescript
 * const result = await searchMoviesSafe({ query: 'inception' });
 * if (result.success) {
 *   // Handle results
 * } else {
 *   // Handle error
 * }
 * ```
 */
export async function searchMoviesSafe(
  options: SearchMoviesOptions
): Promise<ApiResult<SearchResponse>> {
  try {
    const data = await searchMovies(options);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error : handleFetchError(error),
    };
  }
}

/**
 * Get detailed movie information by ID
 *
 * @param options - Options including movie ID
 * @returns Promise resolving to MovieDetails or throwing ApiError
 * @throws {ApiError} If the request fails
 *
 * @example
 * ```typescript
 * try {
 *   const movie = await getMovieDetails({ id: 550 });
 *   console.log(movie.title, movie.runtime);
 * } catch (error) {
 *   if (error instanceof ApiError && error.isNotFoundError()) {
 *     console.log('Movie not found');
 *   }
 *   console.error(error.message);
 * }
 * ```
 */
export async function getMovieDetails(
  options: GetMovieDetailsOptions
): Promise<MovieDetails> {
  const { id } = options;

  if (!id || id < 1 || !Number.isInteger(id)) {
    throw new ApiError(
      400,
      'Invalid Request',
      'Movie ID must be a positive integer'
    );
  }

  try {
    const response = await fetch(`/api/movies/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    const data: MovieDetails = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw handleFetchError(error);
  }
}

/**
 * Get detailed movie information with result type (no exception throwing)
 *
 * @param options - Options including movie ID
 * @returns Promise resolving to ApiResult<MovieDetails>
 *
 * @example
 * ```typescript
 * const result = await getMovieDetailsSafe({ id: 550 });
 * if (result.success) {
 *   console.log(result.data.title);
 * } else {
 *   if (result.error.isNotFoundError()) {
 *     console.log('Movie not found');
 *   }
 * }
 * ```
 */
export async function getMovieDetailsSafe(
  options: GetMovieDetailsOptions
): Promise<ApiResult<MovieDetails>> {
  try {
    const data = await getMovieDetails(options);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error : handleFetchError(error),
    };
  }
}

/**
 * Loading state manager utility
 * Can be used with React hooks or standalone
 */
export class LoadingStateManager<T> {
  private loading: boolean = false;
  private error: ApiError | null = null;
  private data: T | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Get current error
   */
  getError(): ApiError | null {
    return this.error;
  }

  /**
   * Get current data
   */
  getData(): T | null {
    return this.data;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loading = loading;
    this.notify();
  }

  /**
   * Set error state
   */
  setError(error: ApiError | null): void {
    this.error = error;
    this.loading = false;
    this.notify();
  }

  /**
   * Set data
   */
  setData(data: T | null): void {
    this.data = data;
    this.error = null;
    this.loading = false;
    this.notify();
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.loading = false;
    this.error = null;
    this.data = null;
    this.notify();
  }

  /**
   * Execute an async function with loading state management
   */
  async execute<U>(
    fn: () => Promise<U>,
    onSuccess?: (data: U) => void,
    onError?: (error: ApiError) => void
  ): Promise<U | null> {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await fn();
      this.setData(result as T);
      onSuccess?.(result);
      return result;
    } catch (error) {
      const apiError =
        error instanceof ApiError ? error : handleFetchError(error);
      this.setError(apiError);
      onError?.(apiError);
      return null;
    }
  }
}

/**
 * Create a new loading state manager instance
 */
export function createLoadingStateManager<T>(): LoadingStateManager<T> {
  return new LoadingStateManager<T>();
}

