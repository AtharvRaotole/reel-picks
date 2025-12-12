import { NextRequest, NextResponse } from 'next/server';
import { getTmdbApiKey } from '@/app/lib/config';
import {
  MovieDetails,
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
} from '@/app/types/movie';

/**
 * TMDB API detailed movie response structure
 */
interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string | null;
  release_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  original_title: string;
  adult: boolean;
  video: boolean;
  runtime: number | null;
  tagline: string | null;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  status: string;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
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
 * Transform TMDB detailed movie to our MovieDetails interface
 */
function transformTmdbMovieDetails(tmdbMovie: TmdbMovieDetails): MovieDetails {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview || undefined,
    releaseDate: tmdbMovie.release_date || undefined,
    posterPath: tmdbMovie.poster_path,
    backdropPath: tmdbMovie.backdrop_path,
    voteAverage: tmdbMovie.vote_average,
    voteCount: tmdbMovie.vote_count,
    genreIds: tmdbMovie.genres.map((g) => g.id),
    genres: tmdbMovie.genres.map(
      (g): Genre => ({
        id: g.id,
        name: g.name,
      })
    ),
    popularity: tmdbMovie.popularity,
    originalLanguage: tmdbMovie.original_language,
    originalTitle: tmdbMovie.original_title,
    adult: tmdbMovie.adult,
    video: tmdbMovie.video,
    runtime: tmdbMovie.runtime || undefined,
    tagline: tmdbMovie.tagline || undefined,
    budget: tmdbMovie.budget || undefined,
    revenue: tmdbMovie.revenue || undefined,
    homepage: tmdbMovie.homepage || undefined,
    imdbId: tmdbMovie.imdb_id || undefined,
    status: tmdbMovie.status || undefined,
    productionCompanies: tmdbMovie.production_companies.map(
      (pc): ProductionCompany => ({
        id: pc.id,
        name: pc.name,
        logoPath: pc.logo_path,
        originCountry: pc.origin_country,
      })
    ),
    productionCountries: tmdbMovie.production_countries.map(
      (pc): ProductionCountry => ({
        iso31661: pc.iso_3166_1,
        name: pc.name,
      })
    ),
    spokenLanguages: tmdbMovie.spoken_languages.map(
      (sl): SpokenLanguage => ({
        englishName: sl.english_name,
        iso6391: sl.iso_639_1,
        name: sl.name,
      })
    ),
  };
}

/**
 * GET /api/movies/[id]
 *
 * Fetches detailed movie information by TMDB ID
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the movie ID
 * @returns JSON response with detailed movie data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get and validate ID parameter
    const { id } = await params;
    const movieId = id.trim();

    if (!movieId || movieId.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid Request',
          message: 'Movie ID is required',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Validate ID is a number
    const numericId = parseInt(movieId, 10);
    if (isNaN(numericId) || numericId < 1) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid Request',
          message: 'Movie ID must be a positive integer',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Get API key (server-side only - never exposed to client)
    const apiKey = getTmdbApiKey();

    // TMDB API endpoint for movie details
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${numericId}`;

    // Make request to TMDB API using Next.js fetch with caching
    const response = await fetch(
      `${tmdbUrl}?api_key=${apiKey}&language=en-US&append_to_response=`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        // Cache for 1 hour, revalidate in background after 30 minutes
        next: {
          revalidate: 3600, // 1 hour in seconds
        },
      }
    );

    // Handle HTTP errors
    if (!response.ok) {
      // Movie not found
      if (response.status === 404) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Not Found',
            message: `Movie with ID ${numericId} was not found`,
            statusCode: 404,
          },
          { status: 404 }
        );
      }

      // Rate limiting
      if (response.status === 429) {
        return NextResponse.json<ErrorResponse>(
          {
            error: 'Rate Limit Exceeded',
            message: 'Too many requests. Please try again later.',
            statusCode: 429,
          },
          { status: 429 }
        );
      }

      // Invalid API key
      if (response.status === 401) {
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

      // Other API errors
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json<ErrorResponse>(
        {
          error: 'API Error',
          message:
            (errorData as { status_message?: string })?.status_message ||
            `An error occurred while fetching movie details (${response.status})`,
          statusCode: response.status,
        },
        { status: response.status }
      );
    }

    // Parse and transform response
    const tmdbMovie: TmdbMovieDetails = await response.json();

    // Transform TMDB response to our format
    const movieDetails: MovieDetails = transformTmdbMovieDetails(tmdbMovie);

    return NextResponse.json<MovieDetails>(movieDetails, {
      status: 200,
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('TMDB API Network Error:', error);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Network Error',
          message: 'Unable to connect to TMDB API. Please try again later.',
          statusCode: 503,
        },
        { status: 503 }
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

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.error('JSON Parse Error:', error);
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Parse Error',
          message: 'Invalid response from TMDB API',
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

