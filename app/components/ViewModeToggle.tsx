'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List, Film } from 'lucide-react';
import { clsx } from 'clsx';

export type ViewMode = 'grid' | 'list' | 'cinematic';

const STORAGE_KEY = 'movie-view-mode';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const viewModes: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
  { mode: 'list', icon: List, label: 'List View' },
  { mode: 'cinematic', icon: Film, label: 'Cinematic View' },
];

/**
 * ViewModeToggle Component
 * 
 * Toggle component for switching between grid, list, and cinematic view modes.
 * Persists user preference in localStorage.
 */
export default function ViewModeToggle({
  value,
  onChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700',
        className
      )}
      role="group"
      aria-label="View mode selector"
    >
      {viewModes.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={clsx(
            'p-2 rounded-md transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
            'touch-manipulation',
            value === mode
              ? 'bg-white dark:bg-neutral-700 text-accent-600 dark:text-accent-400 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
          )}
          aria-label={label}
          aria-pressed={value === mode}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

/**
 * Hook to manage view mode with localStorage persistence
 */
export function useViewMode(defaultMode: ViewMode = 'grid'): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      if (stored && ['grid', 'list', 'cinematic'].includes(stored)) {
        setViewMode(stored);
      }
    }
  }, []);

  // Save to localStorage when view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return [viewMode, handleViewModeChange];
}
