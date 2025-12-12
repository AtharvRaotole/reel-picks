'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

const CONFETTI_SEEN_KEY = 'hasSeenConfetti';

/**
 * Custom hook for triggering confetti celebration
 * 
 * Only triggers on the first favorite ever, using localStorage to track.
 * Uses subtle, tasteful golden/movie-themed colors.
 * 
 * @returns Function to trigger confetti if it's the first time
 * 
 * @example
 * ```tsx
 * const triggerFirstFavoriteConfetti = useConfetti();
 * 
 * const handleAddFavorite = () => {
 *   addFavorite(movie);
 *   triggerFirstFavoriteConfetti();
 * };
 * ```
 */
export function useConfetti() {
  const triggerFirstFavoriteConfetti = useCallback(() => {
    // Check if user has already seen confetti
    if (typeof window === 'undefined') return;
    
    const hasSeenConfetti = localStorage.getItem(CONFETTI_SEEN_KEY);
    if (hasSeenConfetti === 'true') {
      return; // Already shown, don't show again
    }

    // Mark as seen before triggering (so it only fires once)
    localStorage.setItem(CONFETTI_SEEN_KEY, 'true');

    // Subtle, tasteful confetti with golden/movie-themed colors
    // Apple product reveal style - elegant and refined
    const colors = [
      '#FFD700', // Gold
      '#FFA500', // Orange
      '#FFC107', // Amber
      '#F4D03F', // Golden yellow
      '#E6C200', // Deep gold
    ];

    // Single elegant burst from center - subtle and classy
    confetti({
      particleCount: 50, // Moderate amount for elegance
      angle: 90, // Straight up
      spread: 55, // Natural spread
      origin: { x: 0.5, y: 0.6 }, // Slightly below center for better visual
      colors: colors,
      startVelocity: 25, // Gentle velocity
      decay: 0.92, // Slow decay for graceful fall
      gravity: 0.6, // Lighter gravity for elegance
      drift: 0, // No drift for clean effect
      ticks: 100, // Shorter duration for subtlety
      scalar: 1.2, // Slightly larger particles
    });
  }, []);

  return triggerFirstFavoriteConfetti;
}
