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
      'rounded-xl transition-all duration-300 bg-neutral-900 border border-neutral-800';

    const variants = {
      default: 'bg-neutral-900',
      elevated: 'bg-neutral-800 shadow-lg',
      outlined: 'bg-transparent border-2',
    };

    const hoverStyles = hover
      ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 hover:border-neutral-700'
      : '';

    const interactiveStyles = interactive
      ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'
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

