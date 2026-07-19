import { Link } from 'react-router-dom';
import { Bookmark, Gift, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatProbability, formatSignedPercent } from '@/lib/format';
import type { Market, Outcome } from '@/types/market';
import { MarketAvatar } from './MarketAvatar';

export type MarketCardVariant =
  | 'worldCupChampion'
  | 'btcDirection'
  | 'worldCupPromo'
  | 'fadedChart'
  | 'iranNuclear'
  | 'portugalMatch'
  | 'englandMatch'
  | 'croatiaMatch'
  | 'teamMatch';

export function MarketCard({
  market,
  onOutcomeSelect,
  variant,
}: {
  market: Market;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
  variant?: MarketCardVariant;
}) {
  if (variant === 'worldCupChampion') return <WorldCupChampionCard market={market} />;
  if (variant === 'btcDirection')
    return <BtcDirectionCard market={market} {...(onOutcomeSelect ? { onOutcomeSelect } : {})} />;
  if (variant === 'worldCupPromo') return <WorldCupPromoCard />;
  if (variant === 'fadedChart') return <FadedChartMarketCard />;
  if (variant === 'iranNuclear') return <IranNuclearCard />;
  if (variant === 'portugalMatch')
    return (
      <MatchMarketCard
        rows={[
          { flag: '🇵🇹', label: 'Portugal', left: '3', right: '100%' },
          { flag: '🇺🇿', label: 'Uzbekistan', left: '0', right: '0%' },
        ]}
      />
    );
  if (variant === 'englandMatch')
    return (
      <MatchMarketCard
        rows={[
          { flag: '🏴', label: 'England', right: '84%' },
          { flag: '🇬🇭', label: 'Ghana', right: '6%' },
        ]}
      />
    );
  if (variant === 'croatiaMatch')
    return (
      <MatchMarketCard
        rows={[
          { flag: '🇵🇦', label: 'Panama', right: '13%' },
          { flag: '🇭🇷', label: 'Croatia', right: '67%' },
        ]}
      />
    );
  if (variant === 'teamMatch')
    return (
      <MatchMarketCard
        rows={[
          { flag: '🏎️', label: 'K27', right: '51%' },
          { flag: '🏁', label: 'Walczaki', right: '50%' },
        ]}
      />
    );

  const visible = market.outcomes.slice(0, 2);
  const leading = market.outcomes[0];
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
            className="flex h-8 w-full items-center justify-between rounded-control bg-surface-muted px-3 text-sm font-semibold transition-colors hover:bg-surface-hover"
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
            {market.status === 'live' ? '实时' : '最新'}
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
            <span>{formatCurrency(market.volume)}</span> <span>成交量</span>
            <span className="sr-only">交易量</span>
          </span>
          <span className="flex items-center gap-2 text-subtle">
            <Gift aria-hidden="true" size={14} />
            <Bookmark aria-hidden="true" size={14} />
          </span>
        </div>
      </div>
    </Card>
  );
}

function WorldCupChampionCard({ market }: { market: Market }) {
  return (
    <Card role="article" data-testid="market-card" className="pm-market-card relative pt-3">
      <div className="flex items-center gap-3 px-3">
        <span className="pm-worldcup-icon" aria-hidden="true" />
        <h3 className="text-[15px] font-semibold text-foreground">世界杯冠军</h3>
      </div>
      <div className="mt-[18px] space-y-3 px-3">
        <MarketRow label="法国" value="19%" yes="19%" no="81%" />
        <MarketRow label="阿根廷" value="15%" yes="15%" no="85%" />
      </div>
      <div className="mt-4 flex items-center justify-between px-3 text-xs text-muted">
        <span>$3B 交易量</span>
        <span className="flex items-center gap-3 text-subtle">
          <Gift aria-hidden="true" size={14} />
          <Bookmark aria-hidden="true" size={14} />
        </span>
      </div>
      <Link to={`/markets/${market.slug}`} className="sr-only">
        {market.title}
      </Link>
    </Card>
  );
}

function BtcDirectionCard({
  market,
  onOutcomeSelect,
}: {
  market: Market;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
}) {
  return (
    <Card role="article" data-testid="market-card" className="pm-market-card relative pt-3">
      <div className="flex items-start gap-3 px-3">
        <span className="pm-btc-icon inline-flex size-10 shrink-0 items-center justify-center rounded-[8px] text-2xl font-bold">
          ₿
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] leading-5 font-semibold text-foreground">
            比特币上涨或下跌5个月
          </h3>
        </div>
        <div className="pm-semi-gauge">
          <span>
            51%
            <small className="text-[10px] font-medium text-muted">Up</small>
          </span>
        </div>
      </div>
      <div className="absolute top-[54px] right-3 flex justify-end pr-1 text-xs leading-4 font-medium text-negative">
        <span className="grid grid-cols-2 gap-x-8 text-right tabular-nums">
          <span className="text-positive">+ $3</span>
          <span>+ $10</span>
          <span className="text-positive">+ $25</span>
          <span>+ $2</span>
          <span className="text-positive">+ $50</span>
          <span>+ $5</span>
        </span>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-2 px-3">
        <button
          type="button"
          onClick={() => market.outcomes[0] && onOutcomeSelect?.(market, market.outcomes[0])}
          className="pm-green-pill h-10 rounded-control text-sm font-semibold"
        >
          Up
        </button>
        <button
          type="button"
          onClick={() => market.outcomes[1] && onOutcomeSelect?.(market, market.outcomes[1])}
          className="pm-red-pill h-10 rounded-control text-sm font-semibold"
        >
          Down
        </button>
      </div>
      <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-[11px] leading-4 text-muted">
        <span className="text-negative">● 实时 · 比特币</span>
        <Bookmark aria-hidden="true" size={14} className="text-subtle" />
      </div>
      <Link to={`/markets/${market.slug}`} className="sr-only">
        {market.title}
      </Link>
    </Card>
  );
}

function WorldCupPromoCard() {
  return (
    <article data-testid="market-card" className="pm-promo-card relative p-5">
      <PromoFlag className="top-[3.75rem] left-[1.1rem] rotate-[-34deg]" flag="🇲🇦" value="2%" />
      <PromoFlag className="top-[2.7rem] left-[4.9rem] rotate-[-15deg]" flag="🇳🇴" value="3%" />
      <PromoFlag className="top-[2.15rem] left-[8.75rem] rotate-[1deg]" flag="🇯🇵" value="2%" />
      <PromoFlag className="top-[2.55rem] right-[4.35rem] rotate-[14deg]" flag="🇫🇷" value="19%" />
      <PromoFlag className="top-[3.5rem] right-[0.25rem] rotate-[28deg]" flag="🇦🇺" value="1%" />
      <h3 className="absolute bottom-2 left-5 text-[28px] leading-8 font-bold text-foreground">
        世界杯
        <br />
        价格与预测
      </h3>
    </article>
  );
}

function FadedChartMarketCard() {
  return (
    <Card
      role="article"
      data-testid="market-card"
      className="pm-market-card pm-faded-chart-card relative overflow-hidden"
    >
      <span
        className="pm-chart-sticker pm-chart-sticker-us top-[74px] left-[-50px] rotate-[-35deg]"
        aria-hidden="true"
      >
        <small />
      </span>
      <span
        className="pm-chart-sticker pm-chart-sticker-morocco top-[61px] left-[17px] rotate-[-43deg]"
        aria-hidden="true"
      >
        <small>2%</small>
      </span>
      <span
        className="pm-chart-sticker pm-chart-sticker-norway top-[31px] left-[78px] rotate-[-16deg]"
        aria-hidden="true"
      >
        <small>3%</small>
      </span>
      <span
        className="pm-chart-sticker pm-chart-sticker-japan top-[25px] left-[139px] rotate-[0deg]"
        aria-hidden="true"
      >
        <small>2%</small>
      </span>
      <span
        className="pm-chart-sticker pm-chart-sticker-france top-[27px] left-[196px] rotate-[9deg]"
        aria-hidden="true"
      >
        <small>19%</small>
      </span>
      <span
        className="pm-chart-sticker pm-chart-sticker-australia top-[44px] left-[247px] rotate-[28deg]"
        aria-hidden="true"
      >
        <small>0%</small>
      </span>
      <svg aria-hidden="true" viewBox="0 0 316 180" className="absolute inset-0 h-full w-full">
        <path
          d="M18 150H304M18 116H304M18 82H304M18 48H304"
          className="pm-faded-grid-line"
          strokeDasharray="1 4"
        />
        <path
          d="M24 166C58 146 86 128 116 111C150 92 181 74 214 56C239 43 262 33 294 22"
          className="pm-faded-chart-line"
          fill="none"
          strokeWidth="1.2"
        />
        <g className="pm-faded-chart-labels" fontSize="9" fontWeight="600">
          <text x="22" y="168" transform="rotate(-28 22 168)">
            2%
          </text>
          <text x="90" y="128" transform="rotate(-28 90 128)">
            3%
          </text>
          <text x="146" y="98" transform="rotate(-18 146 98)">
            2%
          </text>
          <text x="196" y="78" transform="rotate(-20 196 78)">
            19%
          </text>
          <text x="260" y="78" transform="rotate(26 260 78)">
            0%
          </text>
        </g>
      </svg>
    </Card>
  );
}

function PromoFlag({ flag, value, className }: { flag: string; value: string; className: string }) {
  return (
    <div className={`pm-promo-flag ${className}`}>
      {flag}
      <small>{value}</small>
    </div>
  );
}

function IranNuclearCard() {
  return (
    <Card role="article" data-testid="market-card" className="pm-market-card pt-3">
      <div className="flex items-start gap-3 px-3">
        <span className="pm-iran-deal-icon inline-flex size-10 rounded-control" aria-hidden="true">
          <span className="pm-iran-deal-flag pm-iran-deal-flag-us" />
          <span className="pm-iran-deal-flag pm-iran-deal-flag-ir" />
        </span>
        <h3 className="mt-2 line-clamp-1 flex-1 text-[15px] font-semibold text-foreground">
          美国-伊朗最终核协议……？
        </h3>
      </div>
      <div className="mt-4 space-y-3 px-3">
        <DatedRow date="8月31日" value="23%" yes="23%" no="77%" />
        <DatedRow date="8月18日" value="22%" yes="22%" no="78%" />
      </div>
      <div className="mt-4 flex items-center justify-between px-3 text-xs text-muted">
        <span>✨ 最新 · $627K 交易量</span>
        <span className="flex items-center gap-3 text-subtle">
          <Gift aria-hidden="true" size={14} />
          <Bookmark aria-hidden="true" size={14} />
        </span>
      </div>
    </Card>
  );
}

function MarketRow({
  label,
  value,
  yes,
  no,
}: {
  label: string;
  value: string;
  yes: string;
  no: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
      <span className="pm-market-pill pm-green-pill text-sm font-semibold">
        是.<span className="sr-only">{yes}</span>
      </span>
      <span className="pm-market-pill pm-red-pill text-sm font-semibold">
        否.<span className="sr-only">{no}</span>
      </span>
    </div>
  );
}

function DatedRow({
  date,
  value,
  yes,
  no,
}: {
  date: string;
  value: string;
  yes: string;
  no: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-1 text-sm">
      <span className="font-medium text-foreground">{date}</span>
      <span className="font-bold tabular-nums">{value}</span>
      <span className="pm-market-pill pm-green-pill text-sm font-semibold">
        是.<span className="sr-only">{yes}</span>
      </span>
      <span className="pm-market-pill pm-red-pill text-sm font-semibold">
        否.<span className="sr-only">{no}</span>
      </span>
    </div>
  );
}

function MatchMarketCard({
  rows,
}: {
  rows: { flag: string; label: string; left?: string; right: string }[];
}) {
  return (
    <Card role="article" data-testid="market-card" className="pm-market-card p-3">
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[2rem_auto_1fr_auto] items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-[4px] bg-surface-muted text-base">
              {row.flag}
            </span>
            {row.left ? (
              <span className="text-sm text-muted tabular-nums">{row.left}</span>
            ) : (
              <span />
            )}
            <span className="text-[15px] font-semibold text-foreground">{row.label}</span>
            <span className="text-lg font-bold text-foreground tabular-nums">{row.right}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <span className="h-10 rounded-control bg-negative-soft" />
        <span className="h-10 rounded-control border border-border bg-surface" />
        <span className="h-10 rounded-control bg-brand-soft" />
      </div>
    </Card>
  );
}
