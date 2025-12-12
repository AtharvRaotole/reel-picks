'use client';

import { Heart, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/app/components/SoundEffects';

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();

  // Get favorites count from localStorage on mount and when it changes
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        const favorites = localStorage.getItem('favoriteMovies');
        const count = favorites ? JSON.parse(favorites).length : 0;
        setFavoritesCount(count);
      } catch {
        setFavoritesCount(0);
      }
    };

    // Initial load
    updateFavoritesCount();

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', updateFavoritesCount);
    
    // Custom event for same-tab updates
    window.addEventListener('favoritesUpdated', updateFavoritesCount);

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white transition-colors hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-sm min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Movie Explorer</span>
              <span className="sm:hidden">Movies</span>
            </span>
          </Link>

          {/* Navigation & Favorites */}
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link
              href="/"
              className="hidden sm:block text-sm font-medium text-neutral-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-sm min-h-[44px] px-3 flex items-center"
              aria-label="Navigate to discover movies page"
            >
              Discover
            </Link>
            
            <Link
              href="/favorites"
              className="relative flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 min-h-[44px] touch-manipulation"
              aria-label={`Navigate to favorites page${favoritesCount > 0 ? `. ${favoritesCount} favorite${favoritesCount === 1 ? '' : 's'}` : ''}`}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Favorites</span>
              
              {/* Favorites Badge */}
              {favoritesCount > 0 && (
                <span 
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-xs font-semibold text-white shadow-lg shadow-primary-500/30 transition-all"
                  aria-label={`${favoritesCount} favorite${favoritesCount === 1 ? '' : 's'}`}
                >
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Sound Effects Toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? 'Sound effects: ON' : 'Sound effects: OFF'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

