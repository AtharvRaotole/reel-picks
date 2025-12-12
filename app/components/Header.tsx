'use client';

import { Heart, Volume2, VolumeX, HelpCircle, Bell, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/app/components/SoundEffects';
import { useReminders, formatTimeRemaining } from '@/app/lib/hooks/useReminders';
import KeyboardShortcutsOverlay from '@/app/components/KeyboardShortcutsOverlay';
import RecentlyViewed from '@/app/components/RecentlyViewed';
import Modal from '@/app/components/ui/Modal';

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();
  const { getUpcomingReminders } = useReminders();
  const upcomingReminders = getUpcomingReminders();
  const remindersCount = upcomingReminders.length;

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

            {/* Recently Viewed */}
            <RecentlyViewed 
              onMovieClick={(movieId) => {
                // Dispatch custom event that MovieSearch can listen to
                window.dispatchEvent(new CustomEvent('openMovieDetails', { detail: { movieId } }));
              }}
            />

            {/* Reminders Bell */}
            {remindersCount > 0 && (
              <button
                onClick={() => setShowRemindersModal(true)}
                className="relative flex items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-400 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label={`${remindersCount} upcoming reminder${remindersCount === 1 ? '' : 's'}. Click to view.`}
                title={`${remindersCount} upcoming reminder${remindersCount === 1 ? '' : 's'}`}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                <span 
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 dark:bg-accent-600 px-1.5 text-xs font-semibold text-white shadow-sm"
                  aria-hidden="true"
                >
                  {remindersCount > 99 ? '99+' : remindersCount}
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" aria-hidden="true" />

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

      {/* Reminders Modal */}
      <Modal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
        title="Upcoming Reminders"
        size="md"
      >
        <div className="space-y-3">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-neutral-400 font-sans">
                No upcoming reminders
              </p>
            </div>
          ) : (
            upcomingReminders.map((reminder) => (
              <div
                key={reminder.movieId}
                className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-accent-300 dark:hover:border-accent-700 transition-colors cursor-pointer"
                onClick={() => {
                  // Dispatch event to open movie details
                  window.dispatchEvent(new CustomEvent('openMovieDetails', { detail: { movieId: Number(reminder.movieId) } }));
                  setShowRemindersModal(false);
                }}
              >
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white truncate font-sans">
                    {reminder.movieTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans mt-1">
                    {formatTimeRemaining(reminder.reminderTime)} remaining
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </header>
  );
}
