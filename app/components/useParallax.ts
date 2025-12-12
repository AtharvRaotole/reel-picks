'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook for parallax scroll effect
 * 
 * Creates a subtle parallax effect on scroll for enhanced visual depth.
 * Respects prefers-reduced-motion for accessibility.
 * 
 * @param speed - Parallax speed multiplier (0-1, default: 0.1)
 * @returns Ref to attach to the element
 * 
 * @example
 * ```tsx
 * const parallaxRef = useParallax(0.15);
 * <div ref={parallaxRef}>Content</div>
 * ```
 */
export function useParallax(speed: number = 0.1) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        const scrolled = window.scrollY;
        const offset = scrolled * speed;
        element.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (element) {
        element.style.transform = '';
      }
    };
  }, [speed]);

  return elementRef;
}

