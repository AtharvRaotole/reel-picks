import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = 'default', hover = true, interactive = false, ...props },
    ref
  ) => {
    const baseStyles =
      'rounded-lg transition-all duration-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800';

    const variants = {
      default: 'bg-white dark:bg-neutral-900',
      elevated: 'bg-white dark:bg-neutral-900 shadow-md dark:shadow-lg dark:shadow-black/50',
      outlined: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-700',
    };

    const hoverStyles = hover
      ? 'hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/50 hover:border-neutral-300 dark:hover:border-neutral-700 hover:-translate-y-0.5'
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

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
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
