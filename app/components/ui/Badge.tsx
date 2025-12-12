import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  icon?: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      showIcon = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200';

    const variants = {
      default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
      primary: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900',
      secondary: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white',
      accent: 'bg-accent-500/10 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 border border-accent-500/20 dark:border-accent-500/40',
      success: 'bg-success-500/10 dark:bg-success-500/20 text-success-600 dark:text-success-400 border border-success-500/20 dark:border-success-500/40',
      error: 'bg-error-500/10 dark:bg-error-500/20 text-error-600 dark:text-error-400 border border-error-500/20 dark:border-error-500/40',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    const iconElement = icon || (showIcon ? <Star className="h-3 w-3" /> : null);

    return (
      <div
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {iconElement && (
          <span className="flex-shrink-0" aria-hidden="true">
            {iconElement}
          </span>
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
