'use client';

import { useState, useEffect } from 'react';
import { useMovieSearch } from '@/app/lib/hooks/useMovieSearch';
import { Movie } from '@/app/types/movie';
import { Input, EmptyState } from '@/app/components/ui';
import MovieCardSkeleton from '@/app/components/MovieCardSkeleton';
import MovieCard from '@/app/components/MovieCard';
import MovieDetails from '@/app/components/MovieDetails';
import { useRecentlyViewed } from '@/app/lib/hooks/useRecentlyViewed';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Extracts the year from a release date string.
 * 
 * @param releaseDate - ISO date string (e.g., "2023-12-25")
 * @returns The year as a string, or null if invalid
 */
function getYear(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return isNaN(year) ? null : year.toString();
}

/**
 * Truncates text to a specified maximum length, adding ellipsis if needed.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * ```typescript
 * truncateText("This is a long text", 10) // "This is a..."
 * ```
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Movie Card Component
 */
interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  onClick: () => void;
}


/**
 * MovieSearch Component
 */
export default function MovieSearch() {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    hasSearched,
    search,
    clearSearch,
  } = useMovieSearch();

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { addRecentlyViewed } = useRecentlyViewed();

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setIsDetailsModalOpen(true);
    
    // Add to recently viewed
    const movie = results?.results.find((m) => Number(m.id) === movieId);
    if (movie) {
      addRecentlyViewed(movie);
    }
  };

  // Listen for recently viewed clicks from header
  useEffect(() => {
    const handleOpenMovieDetails = (event: CustomEvent<{ movieId: number }>) => {
      handleMovieClick(event.detail.movieId);
    };

    window.addEventListener('openMovieDetails', handleOpenMovieDetails as EventListener);
    return () => {
      window.removeEventListener('openMovieDetails', handleOpenMovieDetails as EventListener);
    };
  }, [results]);

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="mb-6 sm:mb-8">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          isLoading={loading}
          showClearButton
          onClear={clearSearch}
          className="text-base sm:text-lg py-3 sm:py-4 min-h-[44px] touch-manipulation"
        />
      </div>

      {/* Loading State - Show skeleton cards */}
      {loading && (
        <div>
          <div className="mb-6">
            <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-48 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-12">
          <EmptyState
            icon={<AlertCircle className="h-12 w-12" />}
            title="Search Error"
            description={error.message || 'An error occurred while searching for movies.'}
            actionLabel="Try Again"
            onAction={() => search(query)}
          />
        </div>
      )}

      {/* Empty State - No Search Performed */}
      {!hasSearched && !loading && !error && (
        <div className="py-12">
          <EmptyState
            icon="search"
            title="Discover Movies"
            description="Start typing to search for your favorite movies"
          />
        </div>
      )}

      {/* No Results State */}
      {hasSearched && !loading && !error && results && results.results.length === 0 && (
        <div className="py-12">
          <EmptyState
            icon="search"
            title="No Movies Found"
            description={`We couldn't find any movies matching "${query}". Try a different search term.`}
            actionLabel="Clear Search"
            onAction={clearSearch}
          />
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && results && results.results.length > 0 && (
        <div>
          {/* Results Count */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-sans">
              Found <span className="text-neutral-900 dark:text-white font-semibold">{results.totalResults.toLocaleString()}</span>{' '}
              {results.totalResults === 1 ? 'movie' : 'movies'}
            </p>
            {results.totalPages > 1 && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                Page {results.page} of {results.totalPages}
              </p>
            )}
          </div>

          {/* Movie Grid - Responsive: 1 col mobile, 2 tablet, 3 lg, 4 xl */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {results.results.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie}
                priority={index < 4}
                showHint={index === 0}
                onClick={() => handleMovieClick(Number(movie.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movie Details Modal */}
      <MovieDetails
        movieId={selectedMovieId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedMovieId(null);
        }}
      />
    </div>
  );
}

