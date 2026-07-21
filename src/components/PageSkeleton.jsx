import { Skeleton } from './ui';

export default function PageSkeleton({ cards = 4, rows = 3 }) {
  return (
    <div className="animate-fade-up">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className={`mb-4 grid grid-cols-2 gap-3 xl:grid-cols-${cards}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
