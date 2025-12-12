/**
 * Basic movie data structure from API
 */
export interface Movie {
  id: string | number;
  title: string;
  overview?: string;
  releaseDate?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  voteCount?: number;
  genreIds?: number[];
  genres?: Genre[];
  popularity?: number;
  originalLanguage?: string;
  originalTitle?: string;
  adult?: boolean;
  video?: boolean;
}

/**
 * Genre information
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Extended movie with user-specific data (rating and notes)
 */
export interface FavoriteMovie extends Movie {
  rating?: number; // User's rating (e.g., 1-10 or 1-5)
  notes?: string; // User's personal notes about the movie
  favoritedAt?: string; // ISO date string when movie was favorited
}

/**
 * API response structure for movie search/list endpoints
 */
export interface SearchResponse {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}

/**
 * Detailed movie information with additional fields
 */
export interface MovieDetails extends Movie {
  runtime?: number; // Runtime in minutes
  tagline?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdbId?: string;
  status?: string; // e.g., "Released", "Post Production"
  productionCompanies?: ProductionCompany[];
  productionCountries?: ProductionCountry[];
  spokenLanguages?: SpokenLanguage[];
}

/**
 * Production company information
 */
export interface ProductionCompany {
  id: number;
  name: string;
  logoPath?: string | null;
  originCountry?: string;
}

/**
 * Production country information
 */
export interface ProductionCountry {
  iso31661: string;
  name: string;
}

/**
 * Spoken language information
 */
export interface SpokenLanguage {
  englishName: string;
  iso6391: string;
  name: string;
}

