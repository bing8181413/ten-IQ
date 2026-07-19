import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatProbability } from '@/lib/format';
import type { Market, Outcome } from '@/types/market';
import { Sparkline } from './Sparkline';

const lineSteps = ['1.5', '2.5'];
const totalSteps = ['1.5', '2.5', '3.5'];

export function FeaturedMarketCard({
  market,
  onOutcomeSelect,
}: {
  market: Market;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
}) {
  const leading = market.outcomes[0];
  const second = market.outcomes[1];
  const third = market.outcomes[2];
  const sportsLike = market.category === '体育';
  if (sportsLike) {
    return <SoccerFeaturedCard market={market} {...(onOutcomeSelect ? { onOutcomeSelect } : {})} />;
  }
  const eventTitle = sportsLike ? 'Colombia vs. DR Congo' : market.title;
  const leadingLabel = sportsLike ? 'Colombia' : (leading?.label ?? '是');
  const secondLabel = sportsLike ? 'DR Congo' : (second?.label ?? '否');
  const middleLabel = sportsLike ? '平局' : '平局';
  return (
    <Card className="pm-feature-card relative overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="grid gap-6 lg:grid-cols-[346px_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-muted">
            <span>{sportsLike ? '体育' : market.category}</span>
            {(sportsLike ? ['Soccer', 'World Cup'] : market.tags.slice(0, 2)).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1">
                <span aria-hidden="true">·</span>
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-2 text-2xl leading-7 font-semibold text-foreground">
            <Link
              to={`/markets/${market.slug}`}
              className="hover:underline hover:underline-offset-4"
            >
              {eventTitle}
            </Link>
          </h2>

          <div className="mt-[9px] grid grid-cols-[129px_72px_129px] gap-2">
            <OutcomeTab
              label={leadingLabel}
              tone="yellow"
              onClick={() => leading && onOutcomeSelect?.(market, leading)}
            />
            <OutcomeTab label={middleLabel} tone="neutral" />
            <OutcomeTab
              label={secondLabel}
              tone="blue"
              onClick={() => second && onOutcomeSelect?.(market, second)}
            />
          </div>

          <div className="mt-4 border-t border-border pt-4" />
          <BettingRow
            title="点差"
            values={lineSteps}
            primary={sportsLike ? 'COL -1.5' : `${leadingLabel} -2.5`}
            secondary={sportsLike ? 'CDR +1.5' : `${secondLabel} +2.5`}
            activeIndex={0}
          />
          <BettingRow
            title="总计"
            values={totalSteps}
            primary={sportsLike ? 'O 2.5' : 'O 4.5'}
            secondary={sportsLike ? 'U 2.5' : 'U 4.5'}
            activeIndex={1}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamLockup
              label={leadingLabel}
              value={sportsLike ? '' : formatProbability(leading?.probability ?? 0)}
              flag="colombia"
            />
            <div className="text-center">
              <div className="text-base leading-6 font-semibold text-foreground tabular-nums">
                {sportsLike ? '上午 10:00' : leading?.probability}
              </div>
              <div className="mt-2 text-base leading-5 font-medium text-muted">
                {sportsLike ? '六月 24' : '实时 · 12'}
              </div>
            </div>
            <TeamLockup
              label={secondLabel}
              value={sportsLike ? '' : formatProbability(second?.probability ?? 0)}
              align="end"
              flag="dr-congo"
            />
          </div>
          <div className="relative border-y border-border py-5">
            <Sparkline values={market.sparkline} className="h-[240px]" />
            <div className="absolute top-6 right-8 text-right">
              <div className="pm-yellow-text text-sm">{leadingLabel}</div>
              <div className="pm-yellow-text text-[32px] leading-8 font-bold tabular-nums">
                {sportsLike ? '64%' : formatProbability(leading?.probability ?? 0)}
              </div>
            </div>
            {sportsLike ? (
              <div className="absolute right-8 bottom-[40px] text-right">
                <div className="text-sm text-muted">Draw</div>
                <div className="text-2xl font-bold text-muted tabular-nums">24%</div>
              </div>
            ) : null}
            {third || sportsLike ? (
              <div className="absolute right-8 bottom-[-18px] text-right">
                <div className="text-sm text-brand">{sportsLike ? 'DR Congo' : third?.label}</div>
                <div className="text-2xl font-bold text-brand tabular-nums">
                  {sportsLike ? '14%' : formatProbability(third?.probability ?? 0)}
                </div>
              </div>
            ) : null}
            <div className="absolute bottom-4 left-3 space-y-2 text-xs font-semibold tabular-nums">
              <div className="pm-yellow-text">+ $9</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-5 text-sm text-subtle">
        {sportsLike ? '$1M' : formatCurrency(market.volume)} 成交量
      </div>
      <div className="absolute right-5 bottom-4 text-sm font-semibold text-subtle">ten-IQ</div>
    </Card>
  );
}

function SoccerFeaturedCard({
  onOutcomeSelect,
}: {
  market: Market;
  onOutcomeSelect?: (market: Market, outcome: Outcome) => void;
}) {
  const displayMarket = {
    id: 'featured-norway-france',
    slug: 'norway-vs-france',
  } as Market;
  const norway = { id: 'norway', label: 'Norway', probability: 0.4, priceChange24h: -0.1 };
  const draw = { id: 'draw', label: '平局', probability: 2.5, priceChange24h: 0 };
  const france = { id: 'france', label: 'France', probability: 97.4, priceChange24h: 0.8 };

  return (
    <Card className="pm-feature-card relative overflow-hidden p-5 transition-colors hover:border-border-strong">
      <div className="grid gap-6 lg:grid-cols-[346px_minmax(0,1fr)]">
        <div className="min-w-0 pt-[2px]">
          <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-muted">
            <span>体育</span>
            <span>·</span>
            <span>Soccer</span>
            <span>·</span>
            <span>World Cup</span>
          </div>
          <h2 className="mt-[6px] text-[24px] leading-[30px] font-semibold text-foreground">
            <Link
              to="/markets/2026-world-cup-winner"
              className="hover:underline hover:underline-offset-4"
            >
              Norway vs. France
            </Link>
          </h2>

          <div className="mt-[14px] grid grid-cols-[129px_72px_129px] gap-2">
            <OutcomeTab
              label="Norway"
              tone="red"
              onClick={() => onOutcomeSelect?.(displayMarket, norway)}
            />
            <OutcomeTab
              label="平局"
              tone="neutral"
              onClick={() => onOutcomeSelect?.(displayMarket, draw)}
            />
            <OutcomeTab
              label="France"
              tone="blue"
              onClick={() => onOutcomeSelect?.(displayMarket, france)}
            />
          </div>

          <div className="mt-[16px] border-t border-border pt-[18px]">
            <BettingRow
              title="点差"
              values={['1.5', '2.5', '3.5']}
              primary="FRA -2.5"
              secondary="NOR +2.5"
              activeIndex={1}
            />
            <BettingRow
              title="总计"
              values={['3.5', '4.5', '5.5']}
              primary="O 4.5"
              secondary="U 4.5"
              activeIndex={1}
            />
          </div>
        </div>

        <div className="relative min-w-0 pt-[5px]" aria-hidden="true">
          <div className="relative mb-[28px] h-[73px]">
            <div className="absolute top-0 left-[31px] w-24">
              <TeamLockup label="Norway" value="" align="center" flag="norway" />
            </div>
            <div className="absolute top-[8px] left-1/2 -translate-x-1/2 text-center">
              <div className="text-[32px] leading-8 font-semibold text-foreground tabular-nums">
                1 - 3
              </div>
              <div className="mt-3 text-sm leading-5 font-semibold text-negative">● 2H - 73</div>
            </div>
            <div className="absolute top-0 right-[27px] w-24">
              <TeamLockup label="France" value="" align="center" flag="france" />
            </div>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 495 304"
            className="absolute top-[104px] left-0 h-[304px] w-full"
          >
            <path
              d="M0 12H460M0 64H460M0 116H460M0 168H460M0 220H460M0 274H460"
              className="pm-feature-grid-line"
              strokeDasharray="1 4"
            />
            <g fontSize="13" fontWeight="600" textAnchor="start">
              <text x="12" y="154" className="pm-soccer-red-fill">
                + $100
              </text>
              <text x="12" y="180" className="pm-soccer-red-fill">
                + $8
              </text>
              <text x="12" y="207" className="pm-soccer-red-fill">
                + $28
              </text>
              <text x="12" y="232" className="pm-soccer-red-fill">
                + $5
              </text>
              <text x="12" y="260" className="pm-soccer-red-fill">
                + $3
              </text>
            </g>
            <path
              d="M0 166H86V158H186V166H258V150H292V108H310V64H330V32H356"
              className="pm-soccer-blue-stroke"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 248H138V238H284V238H330V230H356"
              className="pm-soccer-red-stroke"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 218H284V206H326V204H356"
              className="pm-soccer-gray-stroke"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="356" cy="32" r="5" className="pm-soccer-blue-fill" />
            <circle cx="356" cy="204" r="5" className="pm-soccer-gray-fill" />
            <circle cx="356" cy="230" r="5" className="pm-soccer-red-fill" />
            <g className="pm-chart-axis-labels" fontSize="12" fontWeight="500">
              <text x="464" y="16">
                100%
              </text>
              <text x="464" y="68">
                75%
              </text>
              <text x="464" y="120">
                50%
              </text>
              <text x="464" y="172">
                25%
              </text>
              <text x="464" y="224">
                0%
              </text>
            </g>
            <g className="pm-chart-date-labels" fontSize="12" fontWeight="500">
              <text x="50" y="288">
                8:00 上午
              </text>
              <text x="132" y="288">
                12:00 下午
              </text>
              <text x="214" y="288">
                4:00 下午
              </text>
              <text x="296" y="288">
                8:00 下午
              </text>
            </g>
          </svg>
          <div className="absolute top-[124px] right-[58px] text-left">
            <div className="text-sm leading-4 font-semibold text-brand">France</div>
            <div className="text-[32px] leading-8 font-bold text-brand tabular-nums">97.4%</div>
          </div>
          <div className="absolute top-[304px] right-[58px] text-left">
            <div className="text-sm leading-4 font-semibold text-muted">Draw</div>
            <div className="text-[28px] leading-8 font-bold text-muted tabular-nums">2.5%</div>
          </div>
          <div className="absolute top-[348px] right-[58px] text-left">
            <div className="pm-soccer-red text-sm leading-4 font-semibold">Norway</div>
            <div className="pm-soccer-red text-[32px] leading-8 font-bold tabular-nums">0.4%</div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[17px] left-5 text-sm font-semibold text-subtle">
        $33M 成交量
      </div>
      <div className="absolute right-5 bottom-4 flex items-center gap-2 text-sm font-semibold text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <span className="pm-footer-mark" aria-hidden="true" />
          ten-IQ
        </span>
      </div>
    </Card>
  );
}

function OutcomeTab({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: 'yellow' | 'red' | 'blue' | 'neutral';
  onClick?: () => void;
}) {
  const toneClass =
    tone === 'yellow'
      ? 'pm-tab-yellow'
      : tone === 'red'
        ? 'pm-tab-red'
        : tone === 'blue'
          ? 'pm-tab-blue'
          : 'pm-tab-neutral';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${toneClass} h-14 rounded-control px-4 text-center text-base ${
        tone === 'neutral' ? 'font-medium' : 'font-semibold'
      } transition-opacity hover:opacity-90`}
    >
      {label}
    </button>
  );
}

function BettingRow({
  title,
  values,
  primary,
  secondary,
  activeIndex = 2,
}: {
  title: string;
  values: string[];
  primary: string;
  secondary: string;
  activeIndex?: number;
}) {
  const [selectedStep, setSelectedStep] = useState(activeIndex);
  const [selectedSide, setSelectedSide] = useState<'primary' | 'secondary' | null>(null);
  return (
    <div className="mt-0 mb-4 last:mb-0" role="group" aria-label={title}>
      <div className="mb-[18px] flex items-center text-sm font-semibold text-foreground">
        <span className="min-w-10">{title}</span>
        <div className="ml-auto flex w-[198px] items-center justify-between">
          <ChevronLeft aria-hidden="true" size={16} className="text-subtle" />
          <div
            className={`flex items-center justify-around overflow-hidden text-sm font-medium text-muted ${
              values.length > 2 ? 'w-[122px]' : 'w-[88px] translate-x-[18px]'
            }`}
          >
            {values.slice(0, 5).map((value, index) => (
              <button
                key={`${title}-${value}`}
                type="button"
                aria-pressed={selectedStep === index}
                onClick={() => setSelectedStep(index)}
                className={
                  selectedStep === index ? 'text-[15px] font-semibold text-foreground' : undefined
                }
              >
                {value}
              </button>
            ))}
          </div>
          <ChevronRight aria-hidden="true" size={16} className="text-subtle" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={selectedSide === 'primary'}
          onClick={() => setSelectedSide('primary')}
          className="min-h-10 rounded-control bg-surface-muted px-3 text-[13px] font-medium text-muted hover:bg-surface-hover hover:text-foreground aria-pressed:bg-brand-soft aria-pressed:text-brand"
        >
          {primary}
        </button>
        <button
          type="button"
          aria-pressed={selectedSide === 'secondary'}
          onClick={() => setSelectedSide('secondary')}
          className="min-h-10 rounded-control bg-surface-muted px-3 text-[13px] font-medium text-muted hover:bg-surface-hover hover:text-foreground aria-pressed:bg-brand-soft aria-pressed:text-brand"
        >
          {secondary}
        </button>
      </div>
    </div>
  );
}

function TeamLockup({
  label,
  value,
  align = 'center',
  flag,
}: {
  label: string;
  value: string;
  align?: 'start' | 'center' | 'end';
  flag?:
    | 'colombia'
    | 'dr-congo'
    | 'portugal'
    | 'uzbekistan'
    | 'england'
    | 'ghana'
    | 'switzerland'
    | 'canada'
    | 'norway'
    | 'france';
}) {
  return (
    <div
      className={
        align === 'end'
          ? 'justify-self-end text-center'
          : align === 'center'
            ? 'justify-self-center text-center'
            : 'justify-self-start text-center'
      }
    >
      <div
        className={`mb-2 inline-flex h-9 w-12 items-center justify-center rounded-control text-sm font-bold text-foreground ${
          flag === 'portugal'
            ? 'pm-flag-portugal'
            : flag === 'uzbekistan'
              ? 'pm-flag-uzbekistan'
              : flag === 'colombia'
                ? 'pm-flag-colombia'
                : flag === 'dr-congo'
                  ? 'pm-flag-dr-congo'
                  : flag === 'switzerland'
                    ? 'pm-flag-switzerland'
                    : flag === 'canada'
                      ? 'pm-flag-canada'
                      : flag === 'norway'
                        ? 'pm-flag-norway'
                        : flag === 'france'
                          ? 'pm-flag-france'
                          : flag === 'england'
                            ? 'pm-flag-england'
                            : flag === 'ghana'
                              ? 'pm-flag-ghana'
                              : 'bg-surface-muted'
        }`}
      >
        {flag ? null : label.slice(0, 1)}
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      {value ? <div className="mt-1 text-xs font-bold text-brand tabular-nums">{value}</div> : null}
    </div>
  );
}
