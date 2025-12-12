import Card from './ui/Card';

export default function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-neutral-200 dark:bg-neutral-800 shimmer" />

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col space-y-2">
        {/* Title */}
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded shimmer" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 shimmer" />

        {/* Meta */}
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 shimmer" />

        {/* Overview */}
        <div className="space-y-1.5 mt-2">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded shimmer" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded shimmer" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 shimmer" />
        </div>
      </div>
    </Card>
  );
}
