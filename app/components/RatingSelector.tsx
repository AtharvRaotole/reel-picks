'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * RatingSelector Component Props
 */
export interface RatingSelectorProps {
  /**
   * Current rating value (0-5)
   * 0 = no rating, 1-5 = number of filled stars
   */
  value: number;
  
  /**
   * Callback when rating changes (only in interactive mode)
   */
  onChange?: (rating: number) => void;
  
  /**
   * Whether the component is interactive
   * @default true
   */
  interactive?: boolean;
  
  /**
   * Size of the stars
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether to show the numeric rating value
   * @default false
   */
  showValue?: boolean;
  
  /**
   * Custom className for the container
   */
  className?: string;
  
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Color variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  
  /**
   * ARIA label for the rating selector
   */
  'aria-label'?: string;
}

/**
 * Get star size classes
 */
function getStarSize(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-8 w-8';
    case 'md':
    default:
      return 'h-5 w-5';
  }
}

/**
 * Get color classes for filled stars
 */
function getFilledColor(variant: 'primary' | 'secondary' | 'accent' | 'warning'): string {
  switch (variant) {
    case 'secondary':
      return 'fill-secondary-500 text-secondary-500';
    case 'accent':
      return 'fill-accent-500 text-accent-500';
    case 'warning':
      return 'fill-warning-500 text-warning-500';
    case 'primary':
    default:
      return 'fill-primary-500 text-primary-500';
  }
}

/**
 * Get color classes for empty stars
 */
function getEmptyColor(): string {
  return 'fill-none text-neutral-600';
}

/**
 * RatingSelector Component
 * 
 * A flexible star rating component that supports both display and interactive modes.
 * 
 * @example
 * ```tsx
 * // Interactive mode
 * <RatingSelector 
 *   value={rating} 
 *   onChange={(newRating) => setRating(newRating)} 
 * />
 * 
 * // Display-only mode
 * <RatingSelector 
 *   value={4.5} 
 *   interactive={false} 
 *   showValue 
 * />
 * ```
 */
export default function RatingSelector({
  value,
  onChange,
  interactive = true,
  size = 'md',
  showValue = false,
  className,
  disabled = false,
  variant = 'primary',
  'aria-label': ariaLabel,
}: RatingSelectorProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [focusedRating, setFocusedRating] = useState<number | null>(null);

  // Clamp value between 0 and 5
  const clampedValue = Math.max(0, Math.min(5, value));
  
  // Determine if component is actually interactive
  const isInteractive = interactive && !disabled && onChange !== undefined;

  // Get the rating to display (hover > focused > value)
  const displayRating = hoveredRating ?? focusedRating ?? clampedValue;

  // Handle star click
  const handleClick = useCallback(
    (rating: number) => {
      if (!isInteractive) return;
      onChange?.(rating);
    },
    [isInteractive, onChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, rating: number) => {
      if (!isInteractive) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleClick(rating);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (rating < 5) {
            const nextButton = document.querySelector(
              `[data-rating-star="${rating + 1}"]`
            ) as HTMLButtonElement;
            nextButton?.focus();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (rating > 1) {
            const prevButton = document.querySelector(
              `[data-rating-star="${rating - 1}"]`
            ) as HTMLButtonElement;
            prevButton?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          const firstButton = document.querySelector(
            '[data-rating-star="1"]'
          ) as HTMLButtonElement;
          firstButton?.focus();
          break;
        case 'End':
          e.preventDefault();
          const lastButton = document.querySelector(
            '[data-rating-star="5"]'
          ) as HTMLButtonElement;
          lastButton?.focus();
          break;
      }
    },
    [isInteractive, handleClick]
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(
    (rating: number) => {
      if (!isInteractive) return;
      setHoveredRating(rating);
    },
    [isInteractive]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoveredRating(null);
  }, [isInteractive]);

  // Handle focus
  const handleFocus = useCallback(
    (rating: number) => {
      if (!isInteractive) return;
      setFocusedRating(rating);
    },
    [isInteractive]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    if (!isInteractive) return;
    setFocusedRating(null);
  }, [isInteractive]);

  const starSize = getStarSize(size);
  const filledColor = getFilledColor(variant);
  const emptyColor = getEmptyColor();

  // Determine if a star should be filled
  const isStarFilled = (starIndex: number): boolean => {
    return starIndex <= Math.floor(displayRating);
  };

  // Determine if a star should be half-filled
  const isStarHalfFilled = (starIndex: number): boolean => {
    const floorRating = Math.floor(displayRating);
    return starIndex === floorRating + 1 && displayRating % 1 >= 0.5;
  };

  const defaultAriaLabel = isInteractive
    ? `Rate ${clampedValue > 0 ? clampedValue : '0'} out of 5 stars`
    : `Rating: ${clampedValue} out of 5 stars`;

  return (
    <div
      className={clsx(
        'flex items-center gap-1',
        className
      )}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={ariaLabel || defaultAriaLabel}
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const filled = isStarFilled(rating);
        const halfFilled = isStarHalfFilled(rating);

        if (isInteractive) {
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              onFocus={() => handleFocus(rating)}
              onBlur={handleBlur}
              onKeyDown={(e) => handleKeyDown(e, rating)}
              disabled={disabled}
              data-rating-star={rating}
              className={clsx(
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-neutral-950',
                'rounded-sm p-1 sm:p-0.5 min-h-[44px] min-w-[44px] flex items-center justify-center',
                'touch-manipulation',
                disabled && 'cursor-not-allowed opacity-50',
                !disabled && 'hover:scale-110 active:scale-95'
              )}
              aria-label={`Rate ${rating} out of 5`}
              aria-checked={clampedValue >= rating}
              role="radio"
            >
              <Star
                className={clsx(
                  starSize,
                  'transition-all duration-200',
                  filled
                    ? filledColor
                    : halfFilled
                    ? `${filledColor} opacity-50`
                    : emptyColor
                )}
              />
            </button>
          );
        }

        // Display-only mode
        return (
          <div
            key={rating}
            className="relative"
            aria-hidden="true"
          >
            <Star
              className={clsx(
                starSize,
                'transition-all duration-200',
                filled ? filledColor : emptyColor
              )}
            />
            {halfFilled && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: '50%' }}
              >
                <Star
                  className={clsx(starSize, filledColor)}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Show numeric value if requested */}
      {showValue && (
        <span
          className={clsx(
            'ml-2 font-medium',
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm',
            'text-neutral-400'
          )}
        >
          {clampedValue > 0 ? clampedValue.toFixed(1) : '0.0'}/5
        </span>
      )}
    </div>
  );
}

