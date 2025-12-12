'use client';

import { useEffect, useState } from 'react';
import { getMovieDetails, ApiError } from '@/app/lib/api-client';
import { MovieDetails as MovieDetailsType } from '@/app/types/movie';
import { useFavorites } from '@/app/lib/hooks/useFavorites';
import { useToast } from '@/app/components/ui/ToastProvider';
import { useSoundEffects } from '@/app/components/SoundEffects';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Badge from '@/app/components/ui/Badge';
import Confetti from '@/app/components/Confetti';
import { Star, Heart, Calendar, Clock, X } from 'lucide-react';
import MoviePoster from '@/app/components/MoviePoster';
import { clsx } from 'clsx';

/**
 * Extract year from release date
 */
function getYear(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return isNaN(year) ? null : year.toString();
}

/**
 * Format runtime in minutes to hours and minutes
 */
function formatRuntime(runtime?: number): string {
  if (!runtime) return 'N/A';
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Star Rating Component
 */
interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const displayRating = hoveredRating ?? value;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !disabled && setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={disabled}
          className={clsx(
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label={`Rate ${rating} out of 5`}
          aria-pressed={value === rating}
        >
          <Star
            className={clsx(
              'h-6 w-6 transition-all duration-200',
              rating <= displayRating
                ? 'fill-primary-500 text-primary-500'
                : 'fill-none text-neutral-600',
              !disabled && 'hover:scale-110'
            )}
            aria-hidden="true"
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-neutral-400" aria-live="polite">
          {value}/5
        </span>
      )}
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function MovieDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster Skeleton */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[2/3] bg-neutral-800 rounded-lg" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-3/4" />
          <div className="h-4 bg-neutral-800 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-neutral-800 rounded w-16" />
            <div className="h-6 bg-neutral-800 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded" />
            <div className="h-4 bg-neutral-800 rounded w-5/6" />
            <div className="h-4 bg-neutral-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MovieDetails Modal Component Props
 */
export interface MovieDetailsProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MovieDetails Modal Component
 */
/**
 * MovieDetails Component
 * 
 * Displays detailed information about a movie in a modal dialog.
 * Features include:
 * - Large poster image with fallback
 * - Movie metadata (year, runtime, genres, rating)
 * - Full overview and tagline
 * - Add/remove from favorites functionality
 * - User rating and notes (if favorited)
 * - Production details (budget, revenue, companies, countries)
 * 
 * @param props - Component props
 * @returns JSX element
 */
export default function MovieDetails({
  movieId,
  isOpen,
  onClose,
}: MovieDetailsProps) {
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);

  const {
    isFavorite,
    getFavorite,
    addFavorite,
    removeFavorite,
    updateFavorite,
    favoritesCount,
  } = useFavorites();
  const { showSuccess, showError } = useToast();
  const { play: playSound } = useSoundEffects();

  // Fetch movie details when modal opens
  useEffect(() => {
    if (isOpen && movieId) {
      setLoading(true);
      setError(null);
      setMovie(null);

      getMovieDetails({ id: movieId })
        .then((data) => {
          setMovie(data);
          setError(null);

          // Load favorite data if movie is favorited
          const favorite = getFavorite(movieId);
          if (favorite) {
            setRating(favorite.rating);
            setNotes(favorite.notes || '');
          } else {
            setRating(1);
            setNotes('');
          }
        })
        .catch((err) => {
          const apiError =
            err instanceof ApiError
              ? err
              : new ApiError(500, 'Unknown Error', 'Failed to load movie details', err);
          setError(apiError);
          setMovie(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset state when modal closes
      setMovie(null);
      setError(null);
      setLoading(false);
      setNotes('');
      setRating(1);
    }
  }, [isOpen, movieId, getFavorite]);

  const favorited = movieId ? isFavorite(movieId) : false;
  const year = movie ? getYear(movie.releaseDate) : null;
  const runtime = movie ? formatRuntime(movie.runtime) : null;

  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isRatingUpdating, setIsRatingUpdating] = useState(false);
  const [isNotesUpdating, setIsNotesUpdating] = useState(false);

  const handleToggleFavorite = async () => {
    if (!movie || !movieId || isFavoriteLoading) return;

    setIsFavoriteLoading(true);
    try {
      if (favorited) {
        removeFavorite(movieId);
        playSound('unfavorite');
        showSuccess(`${movie.title} removed from favorites`);
      } else {
        // Check if this is the first favorite
        const wasFirstFavorite = favoritesCount === 0;
        
        addFavorite({
          movie,
          rating,
          notes: notes.trim() || undefined,
        });
        
        // Heart beat animation
        setHeartBeat(true);
        setTimeout(() => setHeartBeat(false), 600);
        
        // Confetti for first favorite
        if (wasFirstFavorite) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        // Play sound effect
        playSound('favorite');
        
        showSuccess(`${movie.title} added to favorites`);
      }
    } catch {
      showError('Failed to update favorites. Please try again.');
    } finally {
      // Small delay for visual feedback
      setTimeout(() => setIsFavoriteLoading(false), 300);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!movieId) return;

    setRating(newRating);
    if (favorited) {
      setIsRatingUpdating(true);
      try {
        updateFavorite({
          movieId,
          rating: newRating,
        });
        showSuccess('Rating updated');
      } catch {
        showError('Failed to update rating. Please try again.');
      } finally {
        setTimeout(() => setIsRatingUpdating(false), 200);
      }
    }
  };

  const handleNotesChange = async (newNotes: string) => {
    if (!movieId) return;

    setNotes(newNotes);
    if (favorited) {
      setIsNotesUpdating(true);
      try {
        updateFavorite({
          movieId,
          notes: newNotes.trim() || undefined,
        });
        // Only show success if notes were actually changed and saved
        if (newNotes.trim()) {
          showSuccess('Notes saved');
        }
      } catch {
        showError('Failed to save notes. Please try again.');
      } finally {
        setTimeout(() => setIsNotesUpdating(false), 200);
      }
    }
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      closeOnBackdropClick={true}
      className="max-h-[90vh]"
    >
      <div className="py-2">
        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <MovieDetailsSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4">
              <X className="h-12 w-12 text-error-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to Load Movie
            </h3>
            <p className="text-neutral-300 mb-6">{error.message}</p>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {/* Movie Details */}
        {movie && !loading && !error && (
          <div className="space-y-6 transition-opacity duration-300">
            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
              {/* Poster */}
              <div className="w-full sm:w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
                <MoviePoster
                  posterPath={movie.posterPath}
                  title={movie.title}
                  size="medium"
                  loading="eager"
                  priority={true}
                  hover={false}
                  className="rounded-lg"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                {/* Title and Year */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                    {movie.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-neutral-400">
                    {year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{year}</span>
                      </div>
                    )}
                    {runtime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{runtime}</span>
                      </div>
                    )}
                    {movie.voteAverage && movie.voteAverage > 0 && (
                      <Badge variant="primary" size="md" showIcon>
                        {movie.voteAverage.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge key={genre.id} variant="default" size="sm">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Overview */}
                {movie.overview && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                      Overview
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}

                {/* Tagline */}
                {movie.tagline && (
                  <div className="italic text-neutral-300 border-l-4 border-primary-500 pl-4">
                    &ldquo;{movie.tagline}&rdquo;
                  </div>
                )}

                {/* Favorite Actions */}
                <div className="pt-4 border-t border-neutral-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={favorited ? 'secondary' : 'primary'}
                      onClick={handleToggleFavorite}
                      isLoading={isFavoriteLoading}
                      disabled={isFavoriteLoading}
                      className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto touch-manipulation"
                      size="md"
                    >
                      <Heart
                        className={clsx(
                          'h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300',
                          favorited && 'fill-current',
                          heartBeat && 'animate-heartbeat'
                        )}
                      />
                      <span className="text-sm sm:text-base">
                        {favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                      </span>
                    </Button>
                  </div>

                  {/* Rating and Notes (shown when favorited) */}
                  {favorited && (
                    <div className="space-y-4 pt-4 border-t border-neutral-800">
                      {/* Rating */}
                      <div>
                        <label 
                          htmlFor="movie-rating"
                          className="block text-sm sm:text-base font-medium text-neutral-300 mb-2"
                        >
                          Your Rating
                          {isRatingUpdating && (
                            <span className="ml-2 text-xs text-neutral-400" aria-live="polite">
                              Saving...
                            </span>
                          )}
                        </label>
                        <div 
                          id="movie-rating"
                          className={clsx('transition-opacity', isRatingUpdating && 'opacity-60')}
                          role="group"
                          aria-label="Rate this movie from 1 to 5 stars"
                        >
                          <StarRating
                            value={rating}
                            onChange={handleRatingChange}
                            disabled={isRatingUpdating}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label
                          htmlFor="movie-notes"
                          className="block text-sm sm:text-base font-medium text-neutral-300 mb-2"
                        >
                          Your Notes
                          {isNotesUpdating && (
                            <span className="ml-2 text-xs text-neutral-400" aria-live="polite">
                              Saving...
                            </span>
                          )}
                        </label>
                        <textarea
                          id="movie-notes"
                          value={notes}
                          onChange={(e) => handleNotesChange(e.target.value)}
                          placeholder="Add your thoughts about this movie..."
                          rows={4}
                          disabled={isNotesUpdating}
                          aria-label="Movie notes"
                          aria-describedby="notes-description"
                          className={clsx(
                            'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 sm:px-4 py-2.5 text-sm sm:text-base text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 resize-none min-h-[100px]',
                            isNotesUpdating && 'opacity-60 cursor-wait'
                          )}
                        />
                        <p id="notes-description" className="sr-only">
                          Add your personal notes and thoughts about this movie
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(movie.budget ||
              movie.revenue ||
              movie.productionCompanies?.length ||
              movie.productionCountries?.length) && (
              <div className="pt-4 sm:pt-6 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                {movie.budget && movie.budget > 0 && (
                  <div>
                    <span className="text-neutral-400">Budget: </span>
                    <span className="text-white">
                      ${movie.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                {movie.revenue && movie.revenue > 0 && (
                  <div>
                    <span className="text-neutral-400">Revenue: </span>
                    <span className="text-white">
                      ${movie.revenue.toLocaleString()}
                    </span>
                  </div>
                )}
                {movie.productionCompanies &&
                  movie.productionCompanies.length > 0 && (
                    <div>
                      <span className="text-neutral-400">Production: </span>
                      <span className="text-white">
                        {movie.productionCompanies
                          .map((pc) => pc.name)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                {movie.productionCountries &&
                  movie.productionCountries.length > 0 && (
                    <div>
                      <span className="text-neutral-400">Countries: </span>
                      <span className="text-white">
                        {movie.productionCountries
                          .map((pc) => pc.name)
                          .join(', ')}
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
    <Confetti active={showConfetti} />
    </>
  );
}

