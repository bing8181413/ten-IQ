import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOrderBook } from '@/hooks/useMarketExtras';
import type { BookLevel } from '@/types/marketExtras';
import type { Market } from '@/types/market';
export function OrderBook({ market }: { market: Market }) {
  const outcome = market.outcomes[0];
  const bookQuery = useOrderBook(market.id, outcome?.id ?? 'missing');
  if (bookQuery.isLoading) return <Skeleton className="h-64" />;
  if (bookQuery.isError || !bookQuery.data) {
    return <ErrorState onRetry={() => void bookQuery.refetch()} />;
  }
  const book = bookQuery.data.data;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">订单簿</h2>
          <p className="mt-1 text-xs text-muted">演示深度，不代表真实报价</p>
        </div>
        <span className="text-xs font-semibold text-brand">{outcome?.label} 市场</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <BookSide title="买单" rows={book.buys} tone="positive" />
        <BookSide title="卖单" rows={book.sells} tone="negative" />
      </div>
    </Card>
  );
}
function BookSide({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: BookLevel[];
  tone: 'positive' | 'negative';
}) {
  return (
    <div className="p-4">
      <div className="mb-3 flex justify-between text-xs font-semibold text-muted">
        <span>{title}</span>
        <span>份额</span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={`${title}-${row.price}`}
            className="relative flex min-h-8 items-center justify-between overflow-hidden rounded-control px-2 text-xs"
          >
            <span
              className={
                tone === 'positive' ? 'font-semibold text-positive' : 'font-semibold text-negative'
              }
            >
              {row.price}¢
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {row.shares.toLocaleString('zh-CN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
