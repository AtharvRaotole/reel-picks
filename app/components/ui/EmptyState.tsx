import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Film, Search, Heart, AlertCircle } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: 'film' | 'search' | 'heart' | 'alert' | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

const iconMap = {
  film: Film,
  search: Search,
  heart: Heart,
  alert: AlertCircle,
} as const;

type IconKey = keyof typeof iconMap;

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = 'film',
      title,
      description,
      actionLabel,
      onAction,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const renderIcon = () => {
      if (typeof icon === 'string' && icon in iconMap) {
        const IconComponent = iconMap[icon as IconKey];
        return <IconComponent className="h-12 w-12" />;
      }
      if (icon && typeof icon !== 'string') {
        return icon;
      }
      return null;
    };

    const iconElement = renderIcon();

    return (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center text-center py-12 px-4',
          variant === 'default' && 'rounded-xl bg-neutral-900 border border-neutral-800',
          className
        )}
        {...props}
      >
        {iconElement && (
          <div
            className={clsx(
              'mb-4 rounded-full p-4',
              variant === 'default'
                ? 'bg-neutral-800 text-neutral-500'
                : 'text-neutral-600'
            )}
            aria-hidden="true"
          >
            {iconElement}
          </div>
        )}

        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

        {description && (
          <p className="text-neutral-300 max-w-md mb-6">{description}</p>
        )}

        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;

