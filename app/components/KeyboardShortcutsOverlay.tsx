'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Keyboard key component for styling keyboard shortcuts
 */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 mx-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm font-mono">
      {children}
    </kbd>
  );
}

/**
 * Keyboard Shortcuts Overlay Component
 * 
 * Displays a beautiful overlay with keyboard shortcuts help.
 * Features backdrop blur, smooth animations, and click-outside-to-close.
 */
export default function KeyboardShortcutsOverlay({
  isOpen,
  onClose,
}: KeyboardShortcutsOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        overlayRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Small delay to prevent immediate close on open
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus search' },
    { key: 'ESC', description: 'Close/Clear' },
    { key: 'F', description: 'View favorites' },
    { key: 'D', description: 'Toggle theme' },
    { key: '?', description: 'Show this help' },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className={clsx(
          'relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl',
          'border border-neutral-200 dark:border-neutral-800',
          'transform transition-all duration-300 ease-out',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2
            id="keyboard-shortcuts-title"
            className="text-xl font-bold text-neutral-900 dark:text-white font-sans"
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900"
            aria-label="Close keyboard shortcuts"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <span className="text-sm text-neutral-700 dark:text-neutral-300 font-sans">
                  {shortcut.description}
                </span>
                <Kbd>{shortcut.key}</Kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-sans">
            Click outside or press <Kbd>ESC</Kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
