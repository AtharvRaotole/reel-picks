'use client';

import Image from 'next/image';
import { Film } from 'lucide-react';
import { clsx } from 'clsx';
import { useParallax } from './useParallax';

/**
 * TMDB image base URLs
 */
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_SMALL = 'https://image.tmdb.org/t/p/w300';

/**
 * Generate a blur data URL for placeholder (SVG-based for SSR compatibility)
 */
function generateBlurDataUrl(): string {
  // SVG-based blur placeholder that works in SSR
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyNjI2MjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxNzE3MTciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';
}

/**
 * Get TMDB poster image URL
 */
function getPosterUrl(
  posterPath: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  if (!posterPath) {
    return '';
  }

  const baseUrl = size === 'small' ? TMDB_IMAGE_BASE_SMALL : TMDB_IMAGE_BASE;
  return `${baseUrl}${posterPath}`;
}

/**
 * MoviePoster Component Props
 */
export interface MoviePosterProps {
  /**
   * Poster path from TMDB API
   */
  posterPath: string | null | undefined;
  
  /**
   * Movie title for alt text
   */
  title: string;
  
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to use lazy loading
   * @default true
   */
  loading?: 'lazy' | 'eager';
  
  /**
   * Priority loading (for above-the-fold images)
   * @default false
   */
  priority?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Aspect ratio class
   * @default 'aspect-[2/3]'
   */
  aspectRatio?: string;
  
  /**
   * Whether to show hover scale effect
   * @default true
   */
  hover?: boolean;
}

/**
 * MoviePoster Component
 * 
 * Optimized movie poster image component with:
 * - Next.js Image optimization (WebP, responsive sizing)
 * - Blur placeholder for smooth loading experience
 * - Lazy loading support for below-the-fold images
 * - Graceful fallback UI when poster is unavailable
 * - Responsive sizing based on viewport
 * 
 * @param props - Component props
 * @param props.posterPath - TMDB poster path (e.g., "/path/to/poster.jpg")
 * @param props.title - Movie title for alt text and fallback
 * @param props.size - Image size variant: 'small' (w300), 'medium' (w500), 'large' (w500)
 * @param props.loading - Loading strategy: 'lazy' (default) or 'eager'
 * @param props.priority - Whether to prioritize loading (for above-the-fold images)
 * @param props.className - Additional CSS classes
 * @param props.aspectRatio - Aspect ratio class (default: 'aspect-[2/3]')
 * @param props.hover - Whether to show hover scale effect (default: true)
 * 
 * @returns JSX element
 * 
 * @example
 * ```tsx
 * // Above the fold (first 4 results)
 * <MoviePoster
 *   posterPath={movie.posterPath}
 *   title={movie.title}
 *   size="small"
 *   loading="eager"
 *   priority={true}
 * />
 * 
 * // Below the fold
 * <MoviePoster
 *   posterPath={movie.posterPath}
 *   title={movie.title}
 *   size="small"
 *   loading="lazy"
 *   priority={false}
 * />
 * ```
 */
export default function MoviePoster({
  posterPath,
  title,
  size = 'medium',
  loading = 'lazy',
  priority = false,
  className,
  aspectRatio = 'aspect-[2/3]',
  hover = true,
}: MoviePosterProps) {
  const posterUrl = getPosterUrl(posterPath, size);
  const hasPoster = !!posterPath && !!posterUrl;
  
  // Subtle parallax effect (only for larger posters, not in modals)
  // Always call hook, but only use ref when size is 'large'
  const parallaxRef = useParallax(size === 'large' ? 0.05 : 0);

  // Generate blur placeholder
  const blurDataUrl = generateBlurDataUrl();

  if (!hasPoster) {
    return (
      <div
        className={clsx(
          'relative w-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-500',
          aspectRatio,
          className
        )}
        aria-label={`${title} - No poster available`}
      >
        <Film className="h-16 w-16 sm:h-20 sm:w-20" />
      </div>
    );
  }

  return (
    <div
      ref={size === 'large' ? parallaxRef : null}
      className={clsx(
        'relative w-full bg-neutral-800 overflow-hidden',
        aspectRatio,
        className
      )}
    >
      <Image
        src={posterUrl}
        alt={`${title} movie poster`}
        fill
        className={clsx(
          'object-cover transition-transform duration-500 ease-out',
          hover && 'group-hover:scale-105',
          'parallax-poster'
        )}
        sizes={
          size === 'small'
            ? '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw'
            : size === 'large'
            ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw'
            : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
        }
        placeholder="blur"
        blurDataURL={blurDataUrl}
        loading={loading}
        priority={priority}
        quality={85}
        aria-hidden="false"
      />
    </div>
  );
}

