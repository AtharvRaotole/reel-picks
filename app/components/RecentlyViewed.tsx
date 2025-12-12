'use client';

import { useState, useRef, useEffect } from 'react';
import { useRecentlyViewed } from '@/app/lib/hooks/useRecentlyViewed';
import { Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import MoviePoster from '@/app/components/MoviePoster';
import { clsx } from 'clsx';
import Link from 'next/link';

/**
 * Format time ago (e.g., "2 hours ago", "3 days ago")
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface RecentlyViewedProps {
  onMovieClick?: (movieId: number) => void;
}

export default function RecentlyViewed({ onMovieClick }: RecentlyViewedProps) {
  const { recentlyViewed, removeRecentlyViewed, clearRecentlyViewed, count } = useRecentlyViewed();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  if (count === 0) return null;

  const handleMovieClick = (movieId: number) => {
    if (onMovieClick) {
      onMovieClick(movieId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] touch-manipulation"
        aria-label={`Recently viewed movies (${count})`}
        aria-expanded={isOpen}
      >
        <Clock className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Recently Viewed</span>
        {count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 dark:bg-accent-600 px-1.5 text-xs font-semibold text-white">
            {count}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white font-sans">
              Pick up where you left off
            </h3>
            {count > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearRecentlyViewed();
                }}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Clear all recently viewed"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {recentlyViewed.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
                  No recently viewed movies
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {recentlyViewed.map((item) => (
                  <button
                    key={item.movie.id}
                    onClick={() => handleMovieClick(Number(item.movie.id))}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group"
                    aria-label={`View ${item.movie.title}`}
                  >
                    {/* Poster */}
                    <div className="flex-shrink-0 w-12 h-18 sm:w-16 sm:h-24">
                      <MoviePoster
                        posterPath={item.movie.posterPath}
                        title={item.movie.title}
                        size="small"
                        loading="lazy"
                        priority={false}
                        hover={false}
                        className="rounded"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors font-sans">
                        {item.movie.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        <span>{formatTimeAgo(item.viewedAt)}</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentlyViewed(item.movie.id);
                      }}
                      className="flex-shrink-0 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded"
                      aria-label={`Remove ${item.movie.title} from recently viewed`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

