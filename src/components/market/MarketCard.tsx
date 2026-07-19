import { Link } from 'react-router-dom';
import { Bookmark, Gift, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatProbability, formatSignedPercent } from '@/lib/format';
import type { Market, Outcome } from '@/types/market';
import { MarketAvatar } from './MarketAvatar';

export function MarketCard({
  market,
  onOutcomeSelect,
  watchlisted = false,
  onWatchlistToggle,
}: {
  market: Market;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
  watchlisted?: boolean;
  onWatchlistToggle?: (market: Market, active: boolean) => void;
}) {
  const visible = market.outcomes.slice(0, 3);
  const leading = [...market.outcomes].sort((a, b) => b.probability - a.probability)[0];
  return (
    <Card
      role="article"
      className="pm-market-card group flex flex-col p-3 transition-colors hover:border-border-strong"
      data-testid="market-card"
    >
      <div className="flex items-start gap-2.5">
        <MarketAvatar icon={market.icon} className="size-9" />
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-muted">{market.category}</span>
          <h3 className="mt-1 line-clamp-2 text-[15px] leading-5 font-semibold text-foreground">
            <Link
              to={`/markets/${market.slug}`}
              className="rounded-sm decoration-brand decoration-2 underline-offset-4 hover:underline"
            >
              {market.title}
            </Link>
          </h3>
        </div>
        <span className="shrink-0 text-lg font-bold text-foreground tabular-nums">
          {formatProbability(leading?.probability ?? 0)}
        </span>
      </div>
      <div className="mt-3 flex-1 space-y-1.5">
        {visible.map((outcome) => (
          <button
            key={outcome.id}
            type="button"
            onClick={() => onOutcomeSelect?.(market, outcome)}
            className="flex min-h-10 w-full items-center justify-between rounded-control bg-surface-muted px-3 text-sm font-semibold transition-colors hover:bg-surface-hover"
          >
            <span className="truncate text-foreground">{outcome.label}</span>
            <span className="text-brand tabular-nums">
              {formatProbability(outcome.probability)}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-2">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-muted">
            <Radio aria-hidden="true" size={13} />
            {market.status === 'live' ? '实时' : market.status === 'closing' ? '即将截止' : '开放'}
          </span>
          <span
            className={
              leading && leading.priceChange24h >= 0
                ? 'font-semibold text-positive'
                : 'font-semibold text-negative'
            }
          >
            {leading ? formatSignedPercent(leading.priceChange24h) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>
            {formatCurrency(market.volume)} <span>成交量</span>
            <span className="sr-only">交易量</span>
          </span>
          <span className="flex items-center gap-1 text-subtle">
            <Gift aria-label="该市场包含演示奖励" size={14} />
            <button
              type="button"
              aria-label={watchlisted ? `取消收藏 ${market.title}` : `收藏 ${market.title}`}
              aria-pressed={watchlisted}
              disabled={!onWatchlistToggle}
              onClick={() => onWatchlistToggle?.(market, !watchlisted)}
              className="inline-flex size-10 items-center justify-center rounded-control hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Bookmark aria-hidden="true" size={15} fill={watchlisted ? 'currentColor' : 'none'} />
            </button>
          </span>
        </div>
      </div>
    </Card>
  );
}
