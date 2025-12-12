'use client';

/**
 * Skip to Content Link Component
 * 
 * Provides a keyboard-accessible way to skip navigation and jump to main content.
 * Essential for screen reader users and keyboard navigation.
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[2000] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  );
}

