'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from '@/app/lib/hooks/useKeyboardShortcuts';
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay';

export interface KeyboardShortcutsProviderProps {
  children: ReactNode;
  onFocusSearch?: () => void;
  onCloseModal?: () => void;
  onClearSearch?: () => void;
  onNavigateResults?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

/**
 * Keyboard Shortcuts Provider
 * 
 * Provides global keyboard shortcuts functionality throughout the app.
 * Also shows a first-visit hint for keyboard shortcuts.
 */
export default function KeyboardShortcutsProvider({
  children,
  onFocusSearch,
  onCloseModal,
  onClearSearch,
  onNavigateResults,
}: KeyboardShortcutsProviderProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has seen the hint before
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenHint = localStorage.getItem('hasSeenKeyboardShortcutsHint');
    if (!hasSeenHint) {
      // Show hint after a short delay on first visit
      const timeout = setTimeout(() => {
        setShowHint(true);
        // Auto-hide after 5 seconds
        hintTimeoutRef.current = setTimeout(() => {
          setShowHint(false);
          localStorage.setItem('hasSeenKeyboardShortcutsHint', 'true');
        }, 5000);
      }, 2000);

      return () => {
        clearTimeout(timeout);
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
        }
      };
    }
  }, []);

  // Dismiss hint
  const dismissHint = () => {
    setShowHint(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenKeyboardShortcutsHint', 'true');
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
  };

  // Focus search handler
  const handleFocusSearch = () => {
    if (onFocusSearch) {
      onFocusSearch();
    } else {
      // Dispatch custom event for MovieSearch to handle
      window.dispatchEvent(new CustomEvent('focusSearchInput'));
    }
  };

  // Navigate results handler
  const handleNavigateResults = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (onNavigateResults) {
      onNavigateResults(direction);
    } else {
      // Dispatch custom event for MovieSearch to handle
      window.dispatchEvent(new CustomEvent('navigateSearchResults', { detail: { direction } }));
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    if (onCloseModal) {
      onCloseModal();
    } else {
      // Try to find and close any open modal
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('button[aria-label*="close" i], button[aria-label*="Close" i]') as HTMLButtonElement;
        closeButton?.click();
      }
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement | null;
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: handleFocusSearch,
    onCloseModal: handleCloseModal,
    onClearSearch: handleClearSearch,
    onNavigateResults: handleNavigateResults,
    onShowShortcuts: () => setShowOverlay(true),
    enabled: true,
  });

  return (
    <>
      {children}

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
      />

      {/* First Visit Hint */}
      {showHint && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 font-sans">
                Press <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded font-mono">?</kbd> for shortcuts
              </p>
            </div>
            <button
              onClick={dismissHint}
              className="flex-shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
              aria-label="Dismiss hint"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
