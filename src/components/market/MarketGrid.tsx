import type { Market, Outcome } from '@/types/market';
import { MarketCard, type MarketCardVariant } from './MarketCard';
import { MarketCardSkeleton } from './MarketCardSkeleton';

const targetVariants: MarketCardVariant[] = [
  'worldCupChampion',
  'btcDirection',
  'fadedChart',
  'iranNuclear',
  'portugalMatch',
  'englandMatch',
  'croatiaMatch',
  'teamMatch',
];
export function MarketGrid({
  markets,
  loading = false,
  onOutcomeSelect,
}: {
  markets: Market[];
  loading?: boolean;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
}) {
  if (loading)
    return (
      <div className="market-grid gap-3" aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    );
  const useTargetShowcase =
    markets.length >= targetVariants.length && markets[0]?.id === 'mkt-world-cup-2026';
  return (
    <div className="market-grid gap-3">
      {markets.map((market, index) => (
        <MarketCard
          key={market.id}
          market={market}
          {...(useTargetShowcase && targetVariants[index]
            ? { variant: targetVariants[index] }
            : {})}
          {...(onOutcomeSelect ? { onOutcomeSelect } : {})}
        />
      ))}
    </div>
  );
}
