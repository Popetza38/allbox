import { Skeleton } from "@/components/ui/skeleton";

interface LoadingGridProps {
  count?: number;
}

export function LoadingGrid({ count = 6 }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="relative overflow-hidden">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

