'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/app/types/movie';

/**
 * Stored favorite movie with user-specific data
 */
export interface StoredFavorite {
  movie: Movie;
  rating: number; // 1-5
  notes?: string;
  dateAdded: string; // ISO date string
}

/**
 * Options for adding a favorite
 */
export interface AddFavoriteOptions {
  movie: Movie;
  rating?: number; // Defaults to 1 if not provided
  notes?: string;
}

/**
 * Options for updating a favorite
 */
export interface UpdateFavoriteOptions {
  movieId: string | number;
  rating?: number;
  notes?: string;
}

/**
 * Return type for useFavorites hook
 */
export interface UseFavoritesReturn {
  favorites: StoredFavorite[];
  isLoading: boolean;
  error: Error | null;
  addFavorite: (options: AddFavoriteOptions) => boolean;
  removeFavorite: (movieId: string | number) => boolean;
  updateFavorite: (options: UpdateFavoriteOptions) => boolean;
  isFavorite: (movieId: string | number) => boolean;
  getFavorite: (movieId: string | number) => StoredFavorite | null;
  clearAllFavorites: () => void;
  favoritesCount: number;
}

/**
 * LocalStorage key for favorites
 */
const FAVORITES_STORAGE_KEY = 'favoriteMovies';

/**
 * Validate rating is between 1 and 5
 */
function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Load favorites from localStorage
 */
function loadFavoritesFromStorage(): StoredFavorite[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as StoredFavorite[];
    
    // Validate the structure
    if (!Array.isArray(parsed)) {
      console.warn('Invalid favorites data in localStorage, resetting...');
      return [];
    }

    // Validate each favorite
    const validFavorites = parsed.filter((fav) => {
      if (!fav.movie || !fav.movie.id || !fav.movie.title) {
        return false;
      }
      if (!validateRating(fav.rating)) {
        return false;
      }
      if (!fav.dateAdded) {
        return false;
      }
      return true;
    });

    // If some favorites were invalid, save the cleaned version
    if (validFavorites.length !== parsed.length) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validFavorites));
      } catch (error) {
        console.error('Failed to save cleaned favorites:', error);
      }
    }

    return validFavorites;
  } catch (error) {
    console.error('Failed to load favorites from localStorage:', error);
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavoritesToStorage(favorites: StoredFavorite[]): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new Event('favoritesUpdated'));
    
    return true;
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
    
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Please clear some space.');
    }
    
    return false;
  }
}

/**
 * Custom React hook for managing favorite movies
 * 
 * Manages favorites in state and persists to localStorage.
 * Handles localStorage errors gracefully.
 * 
 * @returns Object with favorites array and management functions
 * 
 * @example
 * ```typescript
 * const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
 * 
 * // Add a favorite
 * addFavorite({ movie: movieData, rating: 5, notes: 'Great movie!' });
 * 
 * // Check if movie is favorited
 * if (isFavorite(movie.id)) {
 *   // Show favorite icon
 * }
 * 
 * // Remove a favorite
 * removeFavorite(movie.id);
 * ```
 */
export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<StoredFavorite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const loadedFavorites = loadFavoritesFromStorage();
      setFavorites(loadedFavorites);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load favorites');
      setError(error);
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) {
        try {
          const loadedFavorites = loadFavoritesFromStorage();
          setFavorites(loadedFavorites);
          setError(null);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to sync favorites');
          setError(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom favoritesUpdated event (same tab)
  useEffect(() => {
    const handleFavoritesUpdated = () => {
      try {
        const loadedFavorites = loadFavoritesFromStorage();
        setFavorites(loadedFavorites);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to sync favorites');
        setError(error);
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
  }, []);

  /**
   * Add a movie to favorites
   */
  const addFavorite = useCallback((options: AddFavoriteOptions): boolean => {
    const { movie, rating = 1, notes } = options;

    // Validate movie
    if (!movie || !movie.id || !movie.title) {
      console.error('Invalid movie data provided to addFavorite');
      return false;
    }

    // Validate rating
    const validRating = validateRating(rating) ? rating : 1;

    // Check if already favorited
    setFavorites((currentFavorites) => {
      const existingIndex = currentFavorites.findIndex(
        (fav) => String(fav.movie.id) === String(movie.id)
      );

      if (existingIndex !== -1) {
        // Update existing favorite
        const updated = [...currentFavorites];
        updated[existingIndex] = {
          ...updated[existingIndex],
          rating: validRating,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
        };
        
        const saved = saveFavoritesToStorage(updated);
        if (!saved) {
          setError(new Error('Failed to save favorite to localStorage'));
        }
        
        return updated;
      }

      // Add new favorite
      const newFavorite: StoredFavorite = {
        movie,
        rating: validRating,
        notes,
        dateAdded: new Date().toISOString(),
      };

      const updated = [...currentFavorites, newFavorite];
      const saved = saveFavoritesToStorage(updated);
      
      if (!saved) {
        setError(new Error('Failed to save favorite to localStorage'));
      }
      
      return updated;
    });

    return true;
  }, []);

  /**
   * Remove a movie from favorites
   */
  const removeFavorite = useCallback((movieId: string | number): boolean => {
    setFavorites((currentFavorites) => {
      const filtered = currentFavorites.filter(
        (fav) => String(fav.movie.id) !== String(movieId)
      );

      const saved = saveFavoritesToStorage(filtered);
      
      if (!saved) {
        setError(new Error('Failed to remove favorite from localStorage'));
        return currentFavorites; // Return original if save failed
      }

      return filtered;
    });

    return true;
  }, []);

  /**
   * Update an existing favorite
   */
  const updateFavorite = useCallback((options: UpdateFavoriteOptions): boolean => {
    const { movieId, rating, notes } = options;

    setFavorites((currentFavorites) => {
      const index = currentFavorites.findIndex(
        (fav) => String(fav.movie.id) === String(movieId)
      );

      if (index === -1) {
        console.warn(`Favorite with ID ${movieId} not found`);
        return currentFavorites;
      }

      const updated = [...currentFavorites];
      
      if (rating !== undefined) {
        if (!validateRating(rating)) {
          console.warn(`Invalid rating: ${rating}. Must be between 1 and 5.`);
          return currentFavorites;
        }
        updated[index] = { ...updated[index], rating };
      }

      if (notes !== undefined) {
        updated[index] = { ...updated[index], notes };
      }

      const saved = saveFavoritesToStorage(updated);
      
      if (!saved) {
        setError(new Error('Failed to update favorite in localStorage'));
        return currentFavorites;
      }

      return updated;
    });

    return true;
  }, []);

  /**
   * Check if a movie is favorited
   */
  const isFavorite = useCallback(
    (movieId: string | number): boolean => {
      return favorites.some((fav) => String(fav.movie.id) === String(movieId));
    },
    [favorites]
  );

  /**
   * Get a favorite by movie ID
   */
  const getFavorite = useCallback(
    (movieId: string | number): StoredFavorite | null => {
      return favorites.find((fav) => String(fav.movie.id) === String(movieId)) || null;
    },
    [favorites]
  );

  /**
   * Clear all favorites (for testing)
   */
  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    const saved = saveFavoritesToStorage([]);
    
    if (!saved) {
      setError(new Error('Failed to clear favorites from localStorage'));
    }
  }, []);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    updateFavorite,
    isFavorite,
    getFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length,
  };
}

