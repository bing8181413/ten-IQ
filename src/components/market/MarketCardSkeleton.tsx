import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
export function MarketCardSkeleton() {
  return (
    <Card className="min-h-72 p-4" aria-label="正在加载市场">
      <div className="flex gap-3">
        <Skeleton className="size-11 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="mt-7 border-t border-border pt-4">
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  );
}
