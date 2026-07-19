import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, Droplets, Link2, Share2, UsersRound } from 'lucide-react';
import { MarketAvatar } from '@/components/market/MarketAvatar';
import { MarketMeta } from '@/components/market/MarketMeta';
import { MarketTabs } from '@/components/trading/MarketTabs';
import { OrderBook } from '@/components/trading/OrderBook';
import { ProbabilityChart } from '@/components/trading/ProbabilityChart';
import { TradePanel } from '@/components/trading/TradePanel';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FreshnessNotice } from '@/components/ui/FreshnessNotice';
import { useMarket } from '@/hooks/useMarkets';
import { useCommentMutation, useComments } from '@/hooks/useMarketExtras';
import { useWatchlist, useWatchlistMutation } from '@/hooks/useWatchlist';
import { formatCount, formatCurrency } from '@/lib/format';
import { useTradeStore } from '@/stores/tradeStore';
import type { Market, Outcome } from '@/types/market';
export function MarketDetailPage() {
  const { slug = '' } = useParams();
  const [chartRange, setChartRange] = useState('全部');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const { data, isLoading, isError, refetch } = useMarket(slug);
  const watchlistQuery = useWatchlist();
  const watchlistMutation = useWatchlistMutation();
  if (isLoading) return <DetailSkeleton />;
  if (isError || !data)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  const market = data.data;
  const bookmarked = watchlistQuery.data?.data.marketIds.includes(market.id) ?? false;
  const leading = market.outcomes[0];
  const sizes: Record<string, number> = {
    '1小时': 3,
    '6小时': 4,
    '1天': 5,
    '1周': 6,
    '1个月': 8,
    全部: market.sparkline.length,
  };
  const chartValues = market.sparkline.slice(-(sizes[chartRange] ?? market.sparkline.length));
  function copyMarketLink() {
    setCopyError(false);
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => setCopyError(true));
  }
  return (
    <div className="pm-shell py-5 pb-24 md:pb-10">
      <FreshnessNotice
        stale={data.meta.stale}
        updatedAt={data.meta.updatedAt}
        onRefresh={() => void refetch()}
      />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <header className="border-b border-border pb-4">
            <div className="flex items-start gap-4">
              <MarketAvatar icon={market.icon} className="size-16 text-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted">
                  <Link
                    to={`/?category=${encodeURIComponent(market.category)}`}
                    className="hover:text-foreground"
                  >
                    {market.category}
                  </Link>
                  {market.tags.map((tag) => (
                    <span key={tag}>· {tag}</span>
                  ))}
                </div>
                <h1 className="mt-1 text-2xl leading-8 font-bold text-foreground sm:text-[27px]">
                  {market.title}
                </h1>
              </div>
              <div className="flex items-center gap-1">
                <DetailIcon
                  label={copied ? '链接已复制' : '复制市场链接'}
                  icon={<Link2 size={18} />}
                  onClick={copyMarketLink}
                />
                <DetailIcon label="分享市场" icon={<Share2 size={18} />} onClick={copyMarketLink} />
                <DetailIcon
                  label="收藏市场"
                  icon={<Bookmark size={18} />}
                  pressed={bookmarked}
                  onClick={() =>
                    watchlistMutation.mutate({ marketId: market.id, active: !bookmarked })
                  }
                />
              </div>
            </div>
            {copied || copyError ? (
              <p
                role={copyError ? 'alert' : 'status'}
                className={copyError ? 'mt-2 text-xs text-negative' : 'mt-2 text-xs text-positive'}
              >
                {copyError ? '复制失败，请从地址栏复制链接。' : '市场链接已复制。'}
              </p>
            ) : null}
          </header>

          <ProbabilityChart values={chartValues} label={leading?.label ?? '领先选项'} />

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-3">
            <MarketMeta status={market.status} volume={market.volume} endDate={market.endDate} />
            <div
              className="flex items-center gap-1 text-xs font-semibold text-muted"
              aria-label="图表时间范围"
            >
              {['1小时', '6小时', '1天', '1周', '1个月', '全部'].map((range) => (
                <button
                  key={range}
                  type="button"
                  aria-pressed={chartRange === range}
                  onClick={() => setChartRange(range)}
                  className={
                    chartRange === range
                      ? 'rounded-control bg-surface-muted px-2.5 py-2 text-foreground'
                      : 'rounded-control px-2.5 py-2 hover:bg-surface-muted hover:text-foreground'
                  }
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <section
            aria-labelledby="outcomes-heading"
            className="divide-y divide-border border-b border-border"
          >
            <h2 id="outcomes-heading" className="sr-only">
              市场结果
            </h2>
            {market.outcomes.map((outcome, index) => (
              <OutcomeRow key={outcome.id} market={market} outcome={outcome} index={index} />
            ))}
          </section>

          <div className="mt-6">
            <MarketTabs market={market} />
          </div>
          <div className="mt-5">
            <Discussion market={market} />
          </div>
          <div className="mt-5">
            <OrderBook market={market} />
          </div>
        </div>
        <aside>
          <TradePanel market={market} />
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-card border border-border p-4">
            <Stat
              icon={<Droplets size={15} />}
              label="流动性"
              value={formatCurrency(market.liquidity)}
            />
            <Stat
              icon={<UsersRound size={15} />}
              label="参与者"
              value={formatCount(market.traders)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function OutcomeRow({
  market,
  outcome,
  index,
}: {
  market: Market;
  outcome: Outcome;
  index: number;
}) {
  const selectOutcome = useTradeStore((state) => state.selectOutcome);
  const setSide = useTradeStore((state) => state.setSide);
  return (
    <div className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_70px_136px_136px] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-sm font-bold text-foreground">
          {index + 1}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{outcome.label}</div>
          <div className="mt-0.5 text-xs text-muted">
            {formatCurrency(Math.round(market.volume * (outcome.probability / 100)))} 交易量
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{outcome.probability}%</div>
      <button
        type="button"
        onClick={() => {
          selectOutcome(outcome.id);
          setSide('buy');
        }}
        className="min-h-11 rounded-control bg-positive-soft px-3 text-sm font-semibold text-positive hover:bg-positive hover:text-white"
      >
        买入 {outcome.label} {outcome.probability.toFixed(1)}%
      </button>
      <button
        type="button"
        onClick={() => {
          selectOutcome(outcome.id);
          setSide('sell');
        }}
        className="min-h-11 rounded-control bg-negative-soft px-3 text-sm font-semibold text-negative hover:bg-negative hover:text-white"
      >
        卖出 {outcome.label} {outcome.probability.toFixed(1)}%
      </button>
    </div>
  );
}

function DetailIcon({
  label,
  icon,
  onClick,
  pressed,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center rounded-control text-foreground hover:bg-surface-muted aria-pressed:bg-brand-soft aria-pressed:text-brand"
    >
      {icon}
    </button>
  );
}

function Discussion({ market }: { market: Market }) {
  const [text, setText] = useState('');
  const commentsQuery = useComments(market.id);
  const commentMutation = useCommentMutation(market.id);
  return (
    <section
      className="rounded-card border border-border bg-surface p-5"
      aria-labelledby="discussion-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="discussion-title" className="text-lg font-semibold text-foreground">
          评论
        </h2>
        <span className="text-xs text-muted">演示讨论区</span>
      </div>
      <label htmlFor="market-comment" className="sr-only">
        发表评论
      </label>
      <textarea
        id="market-comment"
        rows={3}
        placeholder="分享你对这个市场的判断..."
        value={text}
        maxLength={280}
        onChange={(event) => {
          setText(event.target.value);
          commentMutation.reset();
        }}
        className="mt-4 w-full resize-none rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-subtle focus:border-brand"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={!text.trim() || commentMutation.isPending}
          onClick={() =>
            commentMutation.mutate(text, {
              onSuccess: () => setText(''),
            })
          }
          className="min-h-10 rounded-control bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {commentMutation.isPending ? '正在发布…' : '以本地演示身份发布'}
        </button>
      </div>
      {commentMutation.isError ? (
        <p role="alert" className="mt-2 text-xs text-negative">
          {commentMutation.error.message || '评论发布失败，请重试。'}
        </p>
      ) : null}
      <div className="mt-4 space-y-4 border-t border-border pt-4 text-sm leading-6 text-muted">
        {commentsQuery.isLoading ? <Skeleton className="h-16" /> : null}
        {commentsQuery.isError ? <ErrorState onRetry={() => void commentsQuery.refetch()} /> : null}
        {commentsQuery.data?.data.map((comment) => (
          <article key={comment.id}>
            <strong className="text-foreground">{comment.author}</strong>
            <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
          </article>
        ))}
        {commentsQuery.data?.data.length === 0 ? <p>还没有评论，发布第一条本地演示观点。</p> : null}
      </div>
    </section>
  );
}
function Stat({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <Skeleton className="mb-5 h-5 w-28" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[32rem] w-full" />
      </div>
    </div>
  );
}
