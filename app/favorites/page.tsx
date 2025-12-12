'use client';

import { useState } from 'react';
import { useFavorites, StoredFavorite } from '@/app/lib/hooks/useFavorites';
import { useToast } from '@/app/components/ui/ToastProvider';
import MovieDetails from '@/app/components/MovieDetails';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import EmptyState from '@/app/components/ui/EmptyState';
import MovieCardSkeleton from '@/app/components/MovieCardSkeleton';
import { Heart, Star, Trash2, Calendar } from 'lucide-react';
import MoviePoster from '@/app/components/MoviePoster';
import { clsx } from 'clsx';

/**
 * Formats a date string to a human-readable format.
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Dec 25, 2023")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates text to a specified maximum length, adding ellipsis if needed.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Inline Star Rating Component
 */
interface InlineStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md';
}

function InlineStarRating({
  value,
  onChange,
  size = 'md',
}: InlineStarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          onMouseEnter={() => setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(null)}
          className="transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-sm p-0.5"
          aria-label={`Rate ${rating} out of 5`}
          aria-pressed={value === rating}
        >
          <Star
            className={clsx(
              starSize,
              'transition-all duration-200',
              rating <= (hoveredRating ?? value)
                ? 'fill-primary-500 text-primary-500'
                : 'fill-none text-neutral-600',
              'hover:scale-110'
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Favorite Card Component
 */
interface FavoriteCardProps {
  favorite: StoredFavorite;
  onRatingChange: (movieId: string | number, rating: number) => void;
  onClick: () => void;
}

function FavoriteCard({
  favorite,
  onRatingChange,
  onClick,
}: FavoriteCardProps) {
  const { movie, rating, notes, dateAdded } = favorite;

  return (
    <Card
      hover
      interactive
      onClick={onClick}
      className="group overflow-hidden h-full flex flex-col bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700 hover:border-primary-500/50 transition-all duration-300"
      aria-label={`View details for ${movie.title}. Your rating: ${rating} out of 5 stars${notes ? `. Notes: ${truncateText(notes, 50)}` : ''}`}
    >
      {/* Poster Image */}
      <div className="relative">
        <MoviePoster
          posterPath={movie.posterPath}
          title={movie.title}
          size="small"
          loading="lazy"
          priority={false}
          hover={true}
          className="group"
        />

        {/* Heart Badge Overlay */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-primary-500/90 backdrop-blur-sm rounded-full p-1.5">
            <Heart className="h-4 w-4 fill-white text-white" />
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col space-y-2 sm:space-y-3">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors leading-tight">
          {movie.title}
        </h3>

        {/* Date Added */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-300">
          <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Added {formatDate(dateAdded)}</span>
        </div>

        {/* Rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">
            Your Rating
          </label>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <InlineStarRating
              value={rating}
              onChange={(newRating) => onRatingChange(movie.id, newRating)}
              size="sm"
            />
            <span className="text-xs text-neutral-400 whitespace-nowrap">({rating}/5)</span>
          </div>
        </div>

        {/* Notes Preview */}
        {notes && (
          <div className="pt-2 border-t border-neutral-700">
            <p className="text-xs font-medium text-neutral-300 mb-1">Notes</p>
            <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 italic leading-relaxed">
              &ldquo;{truncateText(notes, 80)}&rdquo;
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Confirmation Modal Component
 */
interface ConfirmClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

function ConfirmClearModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: ConfirmClearModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Clear All Favorites?"
    >
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
          Are you sure you want to remove all{' '}
          <span className="text-white font-semibold">{count}</span> favorite
          {count === 1 ? ' movie' : ' movies'}? This action cannot be undone.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="w-full sm:w-auto bg-error-500 hover:bg-error-600 focus:ring-error-500 min-h-[44px] touch-manipulation"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Favorites Page Component
 */
export default function FavoritesPage() {
  const {
    favorites,
    isLoading,
    error,
    updateFavorite,
    clearAllFavorites,
    favoritesCount,
  } = useFavorites();
  const { showSuccess, showError } = useToast();

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleCardClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setIsDetailsModalOpen(true);
  };

  const handleRatingChange = (movieId: string | number, rating: number) => {
    try {
      updateFavorite({ movieId, rating });
      showSuccess('Rating updated');
    } catch {
      showError('Failed to update rating. Please try again.');
    }
  };

  const handleClearAll = () => {
    try {
      clearAllFavorites();
      setIsClearModalOpen(false);
      showSuccess('All favorites cleared');
    } catch {
      showError('Failed to clear favorites. Please try again.');
    }
  };

  // Loading state - Show skeleton cards
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-neutral-800 rounded w-64 mb-2 animate-pulse" />
          <div className="h-5 bg-neutral-800 rounded w-48 animate-pulse" />
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon="alert"
          title="Error Loading Favorites"
          description={error.message || 'Failed to load your favorite movies.'}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 fill-primary-500" />
            My Favorites
          </h1>
          <p className="text-sm sm:text-base text-neutral-300">
            Your personal collection of{' '}
            <span className="text-primary-400 font-semibold">
              {favoritesCount}
            </span>{' '}
            {favoritesCount === 1 ? 'movie' : 'movies'}
          </p>
        </div>

        {favoritesCount > 0 && (
          <Button
            variant="ghost"
            onClick={() => setIsClearModalOpen(true)}
            className="border border-neutral-700 hover:border-error-500 hover:text-error-400 min-h-[44px] w-full sm:w-auto touch-manipulation"
            size="md"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty State */}
      {favoritesCount === 0 && (
        <div className="py-16">
          <EmptyState
            icon="heart"
            title="Start Exploring Movies!"
            description="Add movies to your favorites to build your personal collection. Rate them, add notes, and keep track of what you love."
            actionLabel="Discover Movies"
            onAction={() => (window.location.href = '/')}
          />
        </div>
      )}

      {/* Favorites Grid - Responsive: 1 col mobile, 2 tablet, 3 lg, 4 xl */}
      {favoritesCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.movie.id}
              favorite={favorite}
              onRatingChange={handleRatingChange}
              onClick={() => handleCardClick(Number(favorite.movie.id))}
            />
          ))}
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

      {/* Clear All Confirmation Modal */}
      <ConfirmClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
        count={favoritesCount}
      />
    </div>
  );
}

