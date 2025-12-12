'use client';

import { Movie } from '@/app/types/movie';
import { Card, Badge } from '@/app/components/ui';
import Image from 'next/image';
import { Film } from 'lucide-react';

interface CinematicCardProps {
  movie: Movie;
  priority?: boolean;
  onClick: () => void;
}

/**
 * Get TMDB backdrop image URL
 */
function getBackdropUrl(backdropPath: string | null | undefined): string {
  if (!backdropPath) return '';
  // Use w1280 for high-quality cinematic backdrops
  return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
}

/**
 * Generate a blur data URL for placeholder
 */
function generateBlurDataUrl(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjYyNjI2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTcxNzE3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';
}

/**
 * Extracts the year from a release date string.
 */
function getYear(releaseDate?: string): string | null {
  if (!releaseDate) return null;
  const year = new Date(releaseDate).getFullYear();
  return isNaN(year) ? null : year.toString();
}

/**
 * Truncates text to a specified maximum length, adding ellipsis if needed.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * CinematicCard Component
 * 
 * Large dramatic cards with backdrop images for cinematic view mode:
 * - Full-width backdrop image
 * - Title overlay with gradient
 * - Larger, more dramatic
 * - 1-2 per row max
 * - Think Netflix homepage
 */
export default function CinematicCard({
  movie,
  priority = false,
  onClick,
}: CinematicCardProps) {
  const year = getYear(movie.releaseDate);
  const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';
  const backdropUrl = getBackdropUrl(movie.backdropPath);
  const hasBackdrop = !!movie.backdropPath && !!backdropUrl;
  const blurDataUrl = generateBlurDataUrl();

  return (
    <Card
      hover
      interactive
      onClick={onClick}
      className="group overflow-hidden h-full flex flex-col cursor-pointer relative aspect-video"
      aria-label={`View details for ${movie.title}${year ? ` (${year})` : ''}`}
    >
      {hasBackdrop ? (
        <>
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <Image
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
              placeholder="blur"
              blurDataURL={blurDataUrl}
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
              quality={90}
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/60 to-transparent" />

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8 md:p-10">
            {/* Rating Badge */}
            {movie.voteAverage && movie.voteAverage > 0 && (
              <div className="mb-4">
                <Badge variant="primary" size="sm" showIcon>
                  {rating}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-accent-400 transition-colors leading-tight font-sans drop-shadow-lg">
              {movie.title}
            </h3>

            {/* Year and Vote Count */}
            <div className="flex items-center gap-3 mb-4 text-sm sm:text-base text-neutral-200 font-sans">
              {year && <span>{year}</span>}
              {year && movie.voteCount && movie.voteCount > 0 && (
                <span aria-hidden="true">•</span>
              )}
              {movie.voteCount && movie.voteCount > 0 && (
                <span>{movie.voteCount.toLocaleString()} votes</span>
              )}
            </div>

            {/* Overview */}
            {movie.overview && (
              <p className="text-sm sm:text-base text-neutral-200 line-clamp-3 leading-relaxed font-sans max-w-2xl drop-shadow-md">
                {truncateText(movie.overview, 250)}
              </p>
            )}
          </div>
        </>
      ) : (
        // Fallback when no backdrop
        <div className="relative w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col justify-end p-6 sm:p-8 md:p-10">
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
            <Film className="h-24 w-24 sm:h-32 sm:w-32" />
          </div>

          {/* Rating Badge */}
          {movie.voteAverage && movie.voteAverage > 0 && (
            <div className="relative z-10 mb-4">
              <Badge variant="primary" size="sm" showIcon>
                {rating}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-accent-400 transition-colors leading-tight font-sans">
            {movie.title}
          </h3>

          {/* Year and Vote Count */}
          <div className="relative z-10 flex items-center gap-3 mb-4 text-sm sm:text-base text-neutral-300 font-sans">
            {year && <span>{year}</span>}
            {year && movie.voteCount && movie.voteCount > 0 && (
              <span aria-hidden="true">•</span>
            )}
            {movie.voteCount && movie.voteCount > 0 && (
              <span>{movie.voteCount.toLocaleString()} votes</span>
            )}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="relative z-10 text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed font-sans max-w-2xl">
              {truncateText(movie.overview, 250)}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
