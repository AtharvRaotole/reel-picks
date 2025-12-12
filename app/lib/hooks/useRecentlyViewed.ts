'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/app/types/movie';

export interface RecentlyViewedMovie {
  movie: Movie;
  viewedAt: string; // ISO date string
}

const RECENTLY_VIEWED_STORAGE_KEY = 'recentlyViewedMovies';
const MAX_RECENTLY_VIEWED = 5;

/**
 * Load recently viewed movies from localStorage
 */
function loadRecentlyViewed(): RecentlyViewedMovie[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate and filter out invalid entries
    return parsed
      .filter((item: any) => item && item.movie && item.viewedAt)
      .slice(0, MAX_RECENTLY_VIEWED);
  } catch (error) {
    console.error('Failed to load recently viewed movies:', error);
    return [];
  }
}

/**
 * Save recently viewed movies to localStorage
 */
function saveRecentlyViewed(movies: RecentlyViewedMovie[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(movies));
    return true;
  } catch (error) {
    console.error('Failed to save recently viewed movies:', error);
    return false;
  }
}

/**
 * Hook for managing recently viewed movies
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedMovie[]>([]);

  // Load on mount and listen for changes
  useEffect(() => {
    const loadData = () => {
      // Defer state update to avoid updating during render
      setTimeout(() => {
        const loaded = loadRecentlyViewed();
        setRecentlyViewed(loaded);
      }, 0);
    };

    // Initial load
    const loaded = loadRecentlyViewed();
    setRecentlyViewed(loaded);

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', loadData);
    
    // Listen for custom event for same-tab updates
    window.addEventListener('recentlyViewedUpdated', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('recentlyViewedUpdated', loadData);
    };
  }, []);

  /**
   * Add a movie to recently viewed
   */
  const addRecentlyViewed = useCallback((movie: Movie) => {
    setRecentlyViewed((current) => {
      // Remove if already exists
      const filtered = current.filter((item) => item.movie.id !== movie.id);

      // Add new entry at the beginning
      const updated: RecentlyViewedMovie[] = [
        {
          movie,
          viewedAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_RECENTLY_VIEWED);

      saveRecentlyViewed(updated);
      
      // Dispatch custom event to notify other components (defer to avoid render issues)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
        }, 0);
      }
      
      return updated;
    });
  }, []);

  /**
   * Clear all recently viewed
   */
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    saveRecentlyViewed([]);
    
    // Dispatch custom event to notify other components (defer to avoid render issues)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
      }, 0);
    }
  }, []);

  /**
   * Remove a specific movie from recently viewed
   */
  const removeRecentlyViewed = useCallback((movieId: string | number) => {
    setRecentlyViewed((current) => {
      const updated = current.filter((item) => item.movie.id !== movieId);
      saveRecentlyViewed(updated);
      
      // Dispatch custom event to notify other components (defer to avoid render issues)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
        }, 0);
      }
      
      return updated;
    });
  }, []);

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
    removeRecentlyViewed,
    count: recentlyViewed.length,
  };
}

