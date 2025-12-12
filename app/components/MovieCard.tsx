'use client';

import { useState, useRef, useEffect } from 'react';
import { Movie } from '@/app/types/movie';
import { Card } from '@/app/components/ui';
import MoviePoster from '@/app/components/MoviePoster';
import { Badge } from '@/app/components/ui';
import { Heart, Clock } from 'lucide-react';
import { useFavorites } from '@/app/lib/hooks/useFavorites';
import { useReminders, formatTimeRemaining } from '@/app/lib/hooks/useReminders';
import { useToast } from '@/app/components/ui/ToastProvider';
import { clsx } from 'clsx';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  onClick: () => void;
  showHint?: boolean;
}

/**
 * Extracts the year from a release date string.
 */
function getYear(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return isNaN(year) ? null : year.toString();
}

export default function MovieCard({ movie, priority = false, onClick, showHint = false }: MovieCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { getReminder } = useReminders();
  const { showSuccess, showError } = useToast();
  const favorited = isFavorite(movie.id);
  const reminder = getReminder(movie.id);
  const hasUpcomingReminder = reminder && reminder.reminderTime > Date.now();

  const year = getYear(movie.releaseDate);
  const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';

  // Handle click outside to flip back (mobile)
  useEffect(() => {
    if (!isFlipped) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsFlipped(false);
      }
    };

    // Use both mouse and touch events for better mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFlipped]);

  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    // On mobile, toggle flip on tap
    if (window.innerWidth < 768) {
      e.preventDefault();
      e.stopPropagation();
      setIsFlipped(!isFlipped);
    } else {
      // On desktop, only navigate if not hovering (click through)
      if (!isFlipped) {
        onClick();
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      if (favorited) {
        removeFavorite(movie.id);
        showSuccess('Removed from favorites');
      } else {
        addFavorite({ movie, rating: 1 });
        showSuccess('Added to favorites');
      }
    } catch (error) {
      showError('Failed to update favorites. Please try again.');
    }
  };

  return (
    <div
      ref={cardRef}
      className="group perspective-1000"
      onMouseEnter={() => {
        // Desktop: flip on hover
        if (window.innerWidth >= 768) {
          setIsFlipped(true);
        }
      }}
      onMouseLeave={() => {
        // Desktop: flip back on leave
        if (window.innerWidth >= 768) {
          setIsFlipped(false);
        }
      }}
      onClick={handleCardClick}
      onTouchEnd={handleCardClick}
    >
      <div
        className={clsx(
          'relative w-full h-full transition-transform duration-600 preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <Card hover interactive className="overflow-hidden h-full flex flex-col">
            {/* Poster Image */}
            <div className="relative">
              <MoviePoster
                posterPath={movie.posterPath}
                title={movie.title}
                size="small"
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                hover={true}
                className="group"
              />

              {/* Rating Badge Overlay */}
              {movie.voteAverage && movie.voteAverage > 0 && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="primary" size="sm" showIcon>
                    {rating}
                  </Badge>
                </div>
              )}

              {/* Reminder Badge Overlay */}
              {hasUpcomingReminder && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge 
                    variant="secondary" 
                    size="sm" 
                    className="bg-accent-500/90 backdrop-blur-sm text-white border-0"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeRemaining(reminder.reminderTime)}
                  </Badge>
                </div>
              )}

              {/* Hint overlay - only show on first card */}
              {showHint && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg px-4 py-2 text-xs font-medium text-neutral-900 dark:text-white">
                    Hover to preview
                  </div>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight font-sans">
                {movie.title}
              </h3>

              <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-sans">
                {year && <span>{year}</span>}
                {year && movie.voteCount && movie.voteCount > 0 && <span aria-hidden="true">•</span>}
                {movie.voteCount && movie.voteCount > 0 && (
                  <span>{movie.voteCount.toLocaleString()} votes</span>
                )}
              </div>

              {/* Rating Stars */}
              {movie.voteAverage && movie.voteAverage > 0 && (
                <div className="flex items-center gap-1 mt-auto">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filledStars = Math.round((movie.voteAverage || 0) / 2);
                      return (
                        <div
                          key={star}
                          className={clsx(
                            'w-3 h-3 rounded-sm',
                            star <= filledStars
                              ? 'bg-accent-500'
                              : 'bg-neutral-300 dark:bg-neutral-700'
                          )}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">
                    {rating}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Card className="overflow-hidden h-full flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Gradient Background with Poster Colors */}
            <div className="absolute inset-0 opacity-20">
              <MoviePoster
                posterPath={movie.posterPath}
                title={movie.title}
                size="small"
                loading="lazy"
                priority={false}
                hover={false}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/80 dark:from-neutral-950/90 dark:via-neutral-900/70 dark:to-neutral-950/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full text-white">
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold mb-3 line-clamp-2 font-sans">
                {movie.title}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs sm:text-sm text-white/80">
                {year && <span>{year}</span>}
                {movie.voteAverage && movie.voteAverage > 0 && (
                  <>
                    {year && <span aria-hidden="true">•</span>}
                    <Badge variant="primary" size="sm" className="bg-white/20 text-white border-white/30">
                      {rating}
                    </Badge>
                  </>
                )}
                {movie.voteCount && movie.voteCount > 0 && (
                  <>
                    {(year || movie.voteAverage) && <span aria-hidden="true">•</span>}
                    <span>{movie.voteCount.toLocaleString()} votes</span>
                  </>
                )}
              </div>

              {/* Genres - Note: genreIds are available but genre names need to be fetched from details */}
              {movie.genreIds && movie.genreIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="default"
                    size="sm"
                    className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  >
                    {movie.genreIds.length} {movie.genreIds.length === 1 ? 'genre' : 'genres'}
                  </Badge>
                </div>
              )}

              {/* Full Overview */}
              {movie.overview && (
                <div className="flex-1 mb-4 overflow-y-auto">
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans line-clamp-6">
                    {movie.overview}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-4 border-t border-white/20">
                <button
                  onClick={handleFavoriteClick}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                    favorited
                      ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      : 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg hover:shadow-xl',
                    'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-neutral-900'
                  )}
                  aria-label={favorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                >
                  <Heart
                    className={clsx(
                      'h-4 w-4 transition-all',
                      favorited && 'fill-current'
                    )}
                    aria-hidden="true"
                  />
                  <span>{favorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

