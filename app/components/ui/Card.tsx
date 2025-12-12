import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', hover = true, interactive = false, ...props },
    ref
  ) => {
    // Glassmorphism base styles - modern iOS/macOS aesthetic
    const glassmorphismBase =
      'rounded-lg transition-all duration-300 backdrop-blur-xl backdrop-saturate-150';

    const baseStyles =
      'rounded-lg transition-all duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800';

    const variants = {
      default: 'bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl backdrop-saturate-150 border-white/30 dark:border-neutral-700/20',
      elevated: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl backdrop-saturate-150 border-white/40 dark:border-neutral-700/30 shadow-lg dark:shadow-xl dark:shadow-black/20',
      outlined: 'bg-transparent border-2 border-neutral-300/50 dark:border-neutral-700/50',
      glass: 'bg-white/5 dark:bg-neutral-900/5 backdrop-blur-2xl backdrop-saturate-150 border-white/10 dark:border-white/5 shadow-xl dark:shadow-2xl dark:shadow-black/30',
    };

    const hoverStyles = hover
      ? 'hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/30 hover:border-white/40 dark:hover:border-white/15 hover:-translate-y-0.5 hover:bg-white/85 dark:hover:bg-neutral-900/85'
      : '';

    const interactiveStyles = interactive
      ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2'
      : '';

    const handleKeyDown = interactive
      ? (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        }
      : undefined;

    // Use glassmorphism base for default and elevated variants
    const useGlassmorphism = variant === 'default' || variant === 'elevated' || variant === 'glass';
    
    return (
      <div
        ref={ref}
        className={clsx(
          useGlassmorphism ? glassmorphismBase : baseStyles,
          variants[variant],
          hoverStyles,
          interactiveStyles,
          className
        )}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;
