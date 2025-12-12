'use client';

import { Movie } from '@/app/types/movie';
import { Card, Badge } from '@/app/components/ui';
import MoviePoster from '@/app/components/MoviePoster';
import Image from 'next/image';

interface ListCardProps {
  movie: Movie;
  onClick: () => void;
}

/**
 * Get TMDB poster image URL for small thumbnails
 */
function getPosterUrl(posterPath: string | null | undefined): string {
  if (!posterPath) return '';
  return `https://image.tmdb.org/t/p/w300${posterPath}`;
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
 * ListCard Component
 * 
 * Compact row layout for list view mode:
 * - Poster thumbnail (100px) | Title, Year, Rating, Overview | Actions
 * - Borders between items
 * - Hover highlights row
 */
export default function ListCard({ movie, onClick }: ListCardProps) {
  const year = getYear(movie.releaseDate);
  const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';
  const posterUrl = getPosterUrl(movie.posterPath);

  return (
    <Card
      hover
      interactive
      onClick={onClick}
      className="group overflow-hidden cursor-pointer border-b border-neutral-200 dark:border-neutral-800 last:border-b-0 rounded-none sm:rounded-lg transition-all duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:shadow-md"
      aria-label={`View details for ${movie.title}${year ? ` (${year})` : ''}`}
    >
      <div className="flex gap-4 p-4">
        {/* Poster Thumbnail - 100px */}
        <div className="relative flex-shrink-0 w-[100px] h-[150px] bg-neutral-200 dark:bg-neutral-800 rounded overflow-hidden">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={`${movie.title} poster`}
              fill
              className="object-cover"
              sizes="100px"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight font-sans line-clamp-2">
              {movie.title}
            </h3>
            {movie.voteAverage && movie.voteAverage > 0 && (
              <div className="flex-shrink-0">
                <Badge variant="primary" size="sm" showIcon>
                  {rating}
                </Badge>
              </div>
            )}
          </div>

          {/* Year and Vote Count */}
          <div className="flex items-center gap-2 mb-3 text-sm text-neutral-700 dark:text-neutral-300 font-sans">
            {year && <span>{year}</span>}
            {year && movie.voteCount && movie.voteCount > 0 && (
              <span aria-hidden="true">•</span>
            )}
            {movie.voteCount && movie.voteCount > 0 && (
              <span>{movie.voteCount.toLocaleString()} votes</span>
            )}
          </div>

          {/* Overview - Truncated */}
          {movie.overview && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed font-sans flex-1">
              {truncateText(movie.overview, 200)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
