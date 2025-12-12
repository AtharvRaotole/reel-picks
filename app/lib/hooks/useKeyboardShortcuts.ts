'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface KeyboardShortcutsOptions {
  onFocusSearch?: () => void;
  onCloseModal?: () => void;
  onClearSearch?: () => void;
  onNavigateResults?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onShowShortcuts?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook for keyboard shortcuts
 * 
 * Handles global keyboard shortcuts:
 * - "/" - Focus search input
 * - "ESC" - Close modal/clear search
 * - "?" - Show keyboard shortcuts help overlay
 * - "F" - Toggle favorites view
 * - "D" - Toggle dark/light mode
 * - Arrow keys - Navigate search results
 * 
 * @param options - Configuration options for shortcuts
 * @returns Object with overlay state and controls
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const {
    onFocusSearch,
    onCloseModal,
    onClearSearch,
    onNavigateResults,
    onShowShortcuts,
    enabled = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const [showOverlay, setShowOverlay] = useState(false);
  const isInputFocusedRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);

  // Safely get theme toggle function
  const getToggleTheme = useCallback(() => {
    try {
      // Dynamic import to avoid SSR issues
      const { useTheme } = require('@/app/components/ThemeProvider');
      const themeContext = useTheme();
      return themeContext.toggleTheme;
    } catch {
      // Fallback: manually toggle dark class
      return () => {
        if (typeof document !== 'undefined') {
          const isDark = document.documentElement.classList.contains('dark');
          document.documentElement.classList.toggle('dark', !isDark);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
          }
        }
      };
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const toggle = getToggleTheme();
    toggle();
  }, [getToggleTheme]);

  // Check if user is typing in an input/textarea
  const isTypingInInput = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false;
    const element = target as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea';
    const isContentEditable = element.contentEditable === 'true';
    return isInput || isContentEditable;
  }, []);

  // Focus search input
  const focusSearch = useCallback(() => {
    if (onFocusSearch) {
      onFocusSearch();
      return;
    }

    // Fallback: try to find search input by selector
    const searchInput = document.querySelector(
      'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
    ) as HTMLInputElement | null;

    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, [onFocusSearch]);

  // Handle ESC key
  const handleEscape = useCallback(() => {
    if (showOverlay) {
      setShowOverlay(false);
      return;
    }

    if (onCloseModal) {
      onCloseModal();
      return;
    }

    // Check if any modal is open
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
      const closeButton = modal.querySelector('button[aria-label*="close" i], button[aria-label*="Close" i]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
        return;
      }
    }

    // Clear search as fallback
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
  }, [showOverlay, onCloseModal, onClearSearch]);

  // Toggle favorites view
  const toggleFavorites = useCallback(() => {
    if (pathname === '/favorites') {
      router.push('/');
    } else {
      router.push('/favorites');
    }
  }, [pathname, router]);


  // Main keyboard event handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input (except for ESC and ?)
      if (isTypingInInput(e.target) && e.key !== 'Escape' && e.key !== '?') {
        isInputFocusedRef.current = true;
        return;
      }

      isInputFocusedRef.current = false;

      // Prevent default for shortcuts
      const shortcutKeys = ['/', '?', 'f', 'F', 'd', 'D', 'Escape'];
      if (shortcutKeys.includes(e.key)) {
        // Don't prevent if user is typing "/" in search (but allow if it's the first key)
        if (e.key === '/' && isTypingInInput(e.target)) {
          return;
        }
        e.preventDefault();
      }

      switch (e.key) {
        case '/':
          // Only focus search if not already typing
          if (!isTypingInInput(e.target)) {
            focusSearch();
          }
          break;

        case 'Escape':
          handleEscape();
          break;

        case '?':
          // Shift+? or just ? to show shortcuts
          if (onShowShortcuts) {
            onShowShortcuts();
          } else {
            setShowOverlay(true);
          }
          break;

        case 'f':
        case 'F':
          // Only if not typing
          if (!isTypingInInput(e.target)) {
            toggleFavorites();
          }
          break;

        case 'd':
        case 'D':
          // Only if not typing
          if (!isTypingInInput(e.target)) {
            toggleTheme();
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Only navigate if we have results and not typing
          if (!isTypingInInput(e.target)) {
            const directionMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
              ArrowUp: 'up',
              ArrowDown: 'down',
              ArrowLeft: 'left',
              ArrowRight: 'right',
            };
            const direction = directionMap[e.key];
            if (direction && onNavigateResults) {
              e.preventDefault();
              onNavigateResults(direction);
            }
          }
          break;
      }

      lastKeyRef.current = e.key;
    },
    [
      isTypingInInput,
      focusSearch,
      handleEscape,
      toggleFavorites,
      toggleTheme,
      onNavigateResults,
      onShowShortcuts,
    ]
  );

  // Set up keyboard listeners
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    showOverlay,
    setShowOverlay,
  };
}
