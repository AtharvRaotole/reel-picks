import Card from './ui/Card';

export default function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-2">
        {/* Title */}
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 animate-pulse" />

        {/* Meta */}
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 animate-pulse" />

        {/* Overview */}
        <div className="space-y-1.5 mt-2">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
