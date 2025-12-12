'use client';

import { Heart, Volume2, VolumeX, Sun, Moon, HelpCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/app/components/SoundEffects';
import { useTheme } from '@/app/components/ThemeProvider';
import { useReminders } from '@/app/lib/hooks/useReminders';
import KeyboardShortcutsOverlay from '@/app/components/KeyboardShortcutsOverlay';

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();
  const { getUpcomingReminders } = useReminders();
  const upcomingReminders = getUpcomingReminders();
  const remindersCount = upcomingReminders.length;
  
  // Theme hook with error handling for SSR
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme: () => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // ThemeProvider not available (SSR), use default
  }

  // Get favorites count from localStorage on mount and when it changes
  useEffect(() => {
    const updateFavoritesCount = () => {
      // Use setTimeout to defer state update and avoid React render warnings
      setTimeout(() => {
        try {
          const favorites = localStorage.getItem('favoriteMovies');
          const count = favorites ? JSON.parse(favorites).length : 0;
          setFavoritesCount(count);
        } catch {
          setFavoritesCount(0);
        }
      }, 0);
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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm dark:shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white transition-colors hover:text-accent-600 dark:hover:text-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 rounded-sm min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <span className="font-display font-bold tracking-tight text-neutral-900 dark:text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Reel Picks
            </span>
          </Link>

          {/* Navigation & Favorites */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="hidden sm:flex text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] items-center justify-center"
              aria-label="Navigate to discover movies page"
            >
              Discover
            </Link>
            
            <Link
              href="/favorites"
              className="relative flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] touch-manipulation"
              aria-label={`Navigate to favorites page${favoritesCount > 0 ? `. ${favoritesCount} favorite${favoritesCount === 1 ? '' : 's'}` : ''}`}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline whitespace-nowrap">Favorites</span>
              
              {/* Favorites Badge */}
              {favoritesCount > 0 && (
                <span 
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 dark:bg-accent-600 px-1.5 text-xs font-semibold text-white shadow-sm transition-all ml-0.5"
                  aria-label={`${favoritesCount} favorite${favoritesCount === 1 ? '' : 's'}`}
                >
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Reminders Bell */}
            {remindersCount > 0 && (
              <div className="relative flex items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-400 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label={`${remindersCount} upcoming reminder${remindersCount === 1 ? '' : 's'}`}
                title={`${remindersCount} upcoming reminder${remindersCount === 1 ? '' : 's'}`}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span 
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 dark:bg-accent-600 px-1.5 text-xs font-semibold text-white shadow-sm"
                  aria-hidden="true"
                >
                  {remindersCount > 99 ? '99+' : remindersCount}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" aria-hidden="true" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-400 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              )}
            </button>

            {/* Sound Effects Toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-400 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
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

            {/* Keyboard Shortcuts Help */}
            <button
              onClick={() => setShowShortcutsOverlay(true)}
              className="flex items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-400 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        isOpen={showShortcutsOverlay}
        onClose={() => setShowShortcutsOverlay(false)}
      />
    </header>
  );
}
