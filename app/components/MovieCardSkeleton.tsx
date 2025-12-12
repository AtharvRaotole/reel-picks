import Card from '@/app/components/ui/Card';

/**
 * MovieCardSkeleton Component
 * 
 * Loading skeleton that matches the MovieCard layout.
 * Uses subtle pulse animation for a professional look.
 * 
 * @example
 * ```tsx
 * // In a grid
 * <div className="grid grid-cols-4 gap-6">
 *   {Array.from({ length: 8 }).map((_, i) => (
 *     <MovieCardSkeleton key={i} />
 *   ))}
 * </div>
 * ```
 */
export default function MovieCardSkeleton() {
  return (
    <Card
      hover={false}
      interactive={false}
      className="overflow-hidden h-full flex flex-col"
    >
      {/* Poster Skeleton */}
      <div className="relative w-full aspect-[2/3] bg-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-800 to-neutral-900 animate-pulse" />
        
        {/* Rating Badge Skeleton */}
        <div className="absolute top-2 right-2">
          <div className="h-5 w-12 bg-neutral-700 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Movie Info Skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-neutral-800 rounded w-3/4 animate-pulse" />
          <div className="h-5 bg-neutral-800 rounded w-1/2 animate-pulse" />
        </div>

        {/* Year/Votes Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-neutral-800 rounded w-16 animate-pulse" />
          <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse" />
        </div>

        {/* Overview Skeleton */}
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-neutral-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-neutral-800 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-neutral-800 rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

