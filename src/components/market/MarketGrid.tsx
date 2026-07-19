import type { Market, Outcome } from '@/types/market';
import { MarketCard } from './MarketCard';
import { MarketCardSkeleton } from './MarketCardSkeleton';

export function MarketGrid({
  markets,
  loading = false,
  onOutcomeSelect,
  watchlistedIds = [],
  onWatchlistToggle,
}: {
  markets: Market[];
  loading?: boolean;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
  watchlistedIds?: string[];
  onWatchlistToggle?: (market: Market, active: boolean) => void;
}) {
  if (loading)
    return (
      <div className="market-grid gap-3" role="status" aria-busy="true" aria-label="正在加载盘口">
        {Array.from({ length: 8 }, (_, index) => (
          <MarketCardSkeleton key={index} />
        ))}
      </div>
    );
  return (
    <div className="market-grid gap-3">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          watchlisted={watchlistedIds.includes(market.id)}
          {...(onOutcomeSelect ? { onOutcomeSelect } : {})}
          {...(onWatchlistToggle ? { onWatchlistToggle } : {})}
        />
      ))}
    </div>
  );
}
