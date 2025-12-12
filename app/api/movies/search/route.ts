import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getTmdbApiKey } from '@/app/lib/config';
import { Movie, SearchResponse } from '@/app/types/movie';

/**
 * TMDB API response structure
 */
interface TmdbMovie {
  id: number;
  title: string;
  overview: string | null;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity: number;
  original_language: string;
  original_title: string;
  adult: boolean;
  video: boolean;
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * Transform TMDB movie to our Movie interface
 */
function transformTmdbMovie(tmdbMovie: TmdbMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview || undefined,
    releaseDate: tmdbMovie.release_date || undefined,
    posterPath: tmdbMovie.poster_path,
    backdropPath: tmdbMovie.backdrop_path,
    voteAverage: tmdbMovie.vote_average,
    voteCount: tmdbMovie.vote_count,
    genreIds: tmdbMovie.genre_ids,
    popularity: tmdbMovie.popularity,
    originalLanguage: tmdbMovie.original_language,
    originalTitle: tmdbMovie.original_title,
    adult: tmdbMovie.adult,
    video: tmdbMovie.video,
  };
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * GET /api/movies/search
 * 
 * Searches for movies using TMDB API
 * 
 * Query parameters:
 * - query (required): Search query string
 * - page (optional): Page number (default: 1)
 * 
 * @param request - Next.js request object
 * @returns JSON response with movie search results or error
 */
export async function GET(request: NextRequest) {
  try {
    // Get and validate query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';

    if (!query || query.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid Request',
          message: 'Query parameter is required and cannot be empty',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate page parameter
    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid Request',
          message: 'Page parameter must be a positive integer',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Get API key (server-side only - never exposed to client)
    const apiKey = getTmdbApiKey();

    // TMDB API endpoint
    const tmdbUrl = 'https://api.themoviedb.org/3/search/movie';

    // Make request to TMDB API
    const response = await axios.get<TmdbSearchResponse>(tmdbUrl, {
      params: {
        api_key: apiKey,
        query: query.trim(),
        page: pageNumber,
        language: 'en-US',
        include_adult: false,
      },
      timeout: 10000, // 10 second timeout
    });

    // Transform TMDB response to our format
    const searchResponse: SearchResponse = {
      page: response.data.page,
      results: response.data.results.map(transformTmdbMovie),
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
    };

    return NextResponse.json<SearchResponse>(searchResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network errors
      if (!axiosError.response) {
        console.error('TMDB API Network Error:', axiosError.message);
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Network Error',
            message: 'Unable to connect to TMDB API. Please try again later.',
            statusCode: 503,
          },
          { status: 503 }
        );
      }

      // API errors
      const status = axiosError.response.status;
      const data = axiosError.response.data as { status_message?: string; status_code?: number };

      // Rate limiting (429)
      if (status === 429) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Rate Limit Exceeded',
            message: 'Too many requests. Please try again later.',
            statusCode: 429,
          },
          { status: 429 }
        );
      }

      // Invalid API key (401)
      if (status === 401) {
        console.error('TMDB API Authentication Error: Invalid API key');
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Authentication Error',
            message: 'Invalid API configuration. Please contact support.',
            statusCode: 500,
          },
          { status: 500 }
        );
      }

      // Resource not found (404)
      if (status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Not Found',
            message: 'The requested resource was not found.',
            statusCode: 404,
          },
          { status: 404 }
        );
      }

      // Other API errors
      return NextResponse.json<ErrorResponse>(
        {
          error: 'API Error',
          message: data?.status_message || 'An error occurred while fetching movies.',
          statusCode: status,
        },
        { status: status }
      );
    }

    // Handle configuration errors (missing API key)
    if (error instanceof Error && error.message.includes('TMDB_API_KEY')) {
      console.error('Configuration Error:', error.message);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Configuration Error',
          message: 'Server configuration error. Please contact support.',
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected Error:', error);
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

