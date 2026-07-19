import { Link } from 'react-router-dom';
import { ArrowRight, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatProbability } from '@/lib/format';
import type { Market, Outcome } from '@/types/market';
import type { SportsEvent } from '@/types/product';
import { MarketAvatar } from './MarketAvatar';
import { Sparkline } from './Sparkline';

export function FeaturedMarketCard({
  market,
  sportsEvent,
  onOutcomeSelect,
}: {
  market: Market;
  sportsEvent?: SportsEvent;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
}) {
  if (sportsEvent) return <SportsFeaturedCard market={market} event={sportsEvent} />;
  const visibleOutcomes = market.outcomes.slice(0, 4);
  const leader = [...market.outcomes].sort((a, b) => b.probability - a.probability)[0];

  return (
    <Card className="pm-feature-card overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="grid min-h-[27rem] gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3">
            <MarketAvatar icon={market.icon} className="size-11" />
            <div>
              <p className="text-sm font-semibold text-muted">{market.category}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-subtle">
                <Radio aria-hidden="true" size={12} />
                {market.status === 'live' ? '实时盘口' : '开放盘口'}
              </p>
            </div>
          </div>

          <h2 className="mt-4 text-2xl leading-8 font-semibold text-foreground">
            <Link
              to={`/markets/${market.slug}`}
              className="hover:underline hover:underline-offset-4"
            >
              {market.title}
            </Link>
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{market.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {visibleOutcomes.map((outcome) => (
              <button
                key={outcome.id}
                type="button"
                onClick={() => onOutcomeSelect?.(market, outcome)}
                className="flex min-h-11 items-center justify-between rounded-control bg-brand-softer px-3 text-sm font-semibold text-brand hover:bg-brand-soft"
              >
                <span className="truncate">{outcome.label}</span>
                <span className="tabular-nums">{formatProbability(outcome.probability)}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <span className="text-muted">{formatCurrency(market.volume)} 成交量</span>
            <Link
              to={`/markets/${market.slug}`}
              className="inline-flex min-h-10 items-center gap-1 rounded-control px-2 font-semibold text-brand hover:bg-brand-soft"
            >
              查看详情 <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>

        <div className="min-w-0 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted">当前领先</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{leader?.label ?? '—'}</p>
            </div>
            <p className="text-4xl font-bold text-foreground tabular-nums">
              {formatProbability(leader?.probability ?? 0)}
            </p>
          </div>
          <div className="mt-5 border-y border-border py-5">
            <Sparkline values={market.sparkline} className="h-[250px]" />
          </div>
          <p className="mt-3 text-xs leading-5 text-subtle">
            概率由演示数据动态生成，不代表事实或收益保证。
          </p>
        </div>
      </div>
    </Card>
  );
}

function SportsFeaturedCard({ market, event }: { market: Market; event: SportsEvent }) {
  const homeSeries = market.sparkline.map((value) => Math.max(1, Math.min(99, value + 30)));
  const awaySeries = homeSeries.map((value) => 100 - value);
  const prices = [
    `${event.home.short} ${event.home.price}¢`,
    `${event.away.short} ${event.away.price}¢`,
    ...event.spread,
    ...event.total,
  ];
  return (
    <Card className="pm-feature-card overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="grid min-h-[25rem] gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3">
            <MarketAvatar icon="football" className="size-11" />
            <div>
              <p className="text-sm font-semibold text-foreground">{event.league}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-negative">
                <Radio aria-hidden="true" size={12} /> {event.status}
              </p>
            </div>
          </div>
          <h2 className="mt-3 text-2xl leading-8 font-semibold text-foreground">
            {event.home.name} vs. {event.away.name}
          </h2>
          <div className="mt-3 space-y-2 border-y border-border py-3">
            {[event.home, event.away].map((team) => (
              <div key={team.short} className="flex items-center gap-3 text-sm">
                <span className="inline-flex size-8 items-center justify-center rounded-control bg-surface-muted text-xs font-bold text-muted">
                  {team.short}
                </span>
                <span className="flex-1 font-semibold text-foreground">{team.name}</span>
                <strong className="text-lg tabular-nums">{team.score}</strong>
                <span className="min-w-12 text-right font-bold text-brand tabular-nums">
                  {team.price}¢
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {prices.map((price) => (
              <Link
                key={price}
                to="/zh/sports/live"
                className="inline-flex min-h-10 items-center justify-center rounded-control bg-brand-softer px-2 text-xs font-semibold text-brand hover:bg-brand-soft"
              >
                {price}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted">{event.volume} 成交量</span>
            <Link to="/zh/sports/live" className="font-semibold text-brand hover:underline">
              查看全部体育盘口
            </Link>
          </div>
        </div>
        <div className="min-w-0 border-t border-border pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{event.home.short}</p>
              <p className="text-xs text-muted">胜率走势</p>
            </div>
            <strong className="text-3xl text-brand tabular-nums">{event.home.price}%</strong>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{event.away.short}</p>
              <p className="text-xs text-muted">胜率走势</p>
            </div>
            <strong className="text-3xl text-negative tabular-nums">{event.away.price}%</strong>
          </div>
          <div className="relative mt-4 h-[285px] border-y border-border py-4">
            <Sparkline
              values={homeSeries}
              fill={false}
              className="absolute inset-4 h-[250px] w-[calc(100%-2rem)]"
            />
            <Sparkline
              values={awaySeries}
              tone="negative"
              fill={false}
              className="absolute inset-4 h-[250px] w-[calc(100%-2rem)]"
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-subtle">
            体育价格来自版本化演示数据，不代表事实或收益保证。
          </p>
        </div>
      </div>
    </Card>
  );
}
