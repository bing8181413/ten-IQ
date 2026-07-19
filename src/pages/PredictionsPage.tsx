import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MarketAvatar } from '@/components/market/MarketAvatar';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FreshnessNotice } from '@/components/ui/FreshnessNotice';
import { useInfiniteMarkets } from '@/hooks/useMarkets';
import { formatCurrency, formatProbability } from '@/lib/format';
import { cn } from '@/lib/cn';

const sorts = ['热门', '流动性', '交易量', '最晚封盘', '即将封盘', '竞争度'];
const topics = ['全部', '实时加密货币', '政治', '体育', '文化', '科技', '人工智能'];

export function PredictionsPage() {
  const [sort, setSort] = useState('热门');
  const [status, setStatus] = useState('进行中');
  const [topic, setTopic] = useState('全部');
  const [query, setQuery] = useState('');
  const category =
    topic === '人工智能'
      ? 'AI'
      : topic === '实时加密货币'
        ? '加密'
        : topic === '全部'
          ? '全部'
          : topic;
  const serverSort = sort === '交易量' ? 'volume' : sort === '最晚封盘' ? 'newest' : 'trending';
  const marketQuery = useInfiniteMarkets({
    category,
    sort: serverSort,
    ...(status === '已结算' ? { status: 'resolved' as const } : {}),
    ...(query.trim() ? { search: query.trim() } : {}),
  });
  const visible = useMemo(() => {
    const result = (marketQuery.data?.pages.flatMap((page) => page.data) ?? []).filter((market) => {
      if (status === '进行中') return market.status !== 'resolved';
      return true;
    });
    return [...result].sort((a, b) => {
      if (sort === '流动性') return b.liquidity - a.liquidity;
      if (sort === '交易量') return b.volume - a.volume;
      if (sort === '最晚封盘') return Date.parse(b.endDate) - Date.parse(a.endDate);
      if (sort === '即将封盘') return Date.parse(a.endDate) - Date.parse(b.endDate);
      if (sort === '竞争度') {
        return (
          Math.abs((a.outcomes[0]?.probability ?? 0) - 50) -
          Math.abs((b.outcomes[0]?.probability ?? 0) - 50)
        );
      }
      return Number(b.trending) - Number(a.trending) || b.volume - a.volume;
    });
  }, [marketQuery.data?.pages, sort, status]);

  function reset() {
    setSort('热门');
    setStatus('进行中');
    setTopic('全部');
    setQuery('');
  }

  return (
    <div className="pm-shell py-5 pb-24 md:pb-10">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold text-brand">浏览</span>
          <h1 className="mt-1 text-2xl font-bold text-foreground">热门预测与实时赔率</h1>
        </div>
        <div className="relative w-full sm:w-80">
          <Search
            aria-hidden="true"
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="搜索预测"
            placeholder="搜索预测..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-4 flex scrollbar-none gap-2 overflow-x-auto pb-1 md:hidden">
        {topics.map((item) => (
          <FilterButton key={item} active={topic === item} onClick={() => setTopic(item)}>
            {item}
          </FilterButton>
        ))}
      </div>
      <div
        className="mt-2 flex scrollbar-none gap-2 overflow-x-auto pb-1 md:hidden"
        aria-label="移动排序"
      >
        {sorts.map((item) => (
          <FilterButton key={item} active={sort === item} onClick={() => setSort(item)}>
            {item}
          </FilterButton>
        ))}
      </div>
      <div
        className="mt-2 flex scrollbar-none gap-2 overflow-x-auto pb-1 md:hidden"
        aria-label="移动状态筛选"
      >
        {['进行中', '已结算', '全部'].map((item) => (
          <FilterButton key={item} active={status === item} onClick={() => setStatus(item)}>
            {item}
          </FilterButton>
        ))}
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-36 space-y-6">
            <FilterGroup title="排序方式" values={sorts} selected={sort} onSelect={setSort} />
            <FilterGroup
              title="事件状态"
              values={['进行中', '已结算', '全部']}
              selected={status}
              onSelect={setStatus}
            />
            <FilterGroup title="话题" values={topics} selected={topic} onSelect={setTopic} />
            <Button variant="ghost" size="sm" onClick={reset}>
              清空筛选
            </Button>
          </div>
        </aside>

        <section className="min-w-0" aria-labelledby="prediction-list-title">
          {marketQuery.data?.pages[0]?.meta ? (
            <FreshnessNotice
              stale={marketQuery.data.pages[0].meta.stale}
              updatedAt={marketQuery.data.pages[0].meta.updatedAt}
              onRefresh={() => void marketQuery.refetch()}
            />
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <h2 id="prediction-list-title" className="text-lg font-bold text-foreground">
              预测市场
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted">
              <SlidersHorizontal aria-hidden="true" size={14} /> {visible.length} 个结果
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {marketQuery.isLoading ? (
              <div
                className="space-y-2"
                role="status"
                aria-busy="true"
                aria-label="正在加载预测市场"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-32" />
                ))}
              </div>
            ) : marketQuery.isError ? (
              <ErrorState onRetry={() => void marketQuery.refetch()} />
            ) : null}
            {!marketQuery.isLoading && !marketQuery.isError
              ? visible.map((market) => {
                  const leading = market.outcomes[0];
                  return (
                    <Card
                      key={market.id}
                      role="article"
                      className="p-4 transition-colors hover:border-border-strong"
                    >
                      <div className="flex items-start gap-3">
                        <MarketAvatar icon={market.icon} className="size-10" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>{market.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{market.tags.join(' · ')}</span>
                          </div>
                          <Link
                            to={`/zh/event/${market.slug}`}
                            className="mt-1 block text-[15px] leading-5 font-semibold text-foreground hover:text-brand"
                          >
                            {market.title}
                          </Link>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {market.outcomes.slice(0, 3).map((outcome) => (
                              <span
                                key={outcome.id}
                                className="rounded-control bg-surface-muted px-2.5 py-1.5 text-xs font-semibold text-foreground"
                              >
                                {outcome.label}{' '}
                                <span className="text-brand">
                                  {formatProbability(outcome.probability)}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xl font-bold text-foreground tabular-nums">
                            {formatProbability(leading?.probability ?? 0)}
                          </div>
                          <div className="mt-1 text-xs text-muted">
                            {formatCurrency(market.volume)} 交易量
                          </div>
                          <div className="mt-1 text-xs text-subtle">
                            {formatCurrency(market.liquidity)} 流动性
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              : null}
            {!marketQuery.isLoading && !marketQuery.isError && !visible.length ? (
              <Card className="p-12 text-center">
                <p className="text-sm font-semibold text-foreground">没有符合条件的预测</p>
                <Button className="mt-4" variant="outline" onClick={reset}>
                  清空筛选
                </Button>
              </Card>
            ) : null}
            {marketQuery.hasNextPage ? (
              <Button
                className="mt-3"
                variant="outline"
                fullWidth
                disabled={marketQuery.isFetchingNextPage}
                onClick={() => void marketQuery.fetchNextPage()}
              >
                {marketQuery.isFetchingNextPage ? '正在加载更多…' : '加载更多预测'}
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
        <ArrowDownUp aria-hidden="true" size={14} /> {title}
      </h2>
      <div className="grid gap-1">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected === value}
            onClick={() => onSelect(value)}
            className={cn(
              'min-h-10 rounded-control px-3 text-left text-sm font-medium',
              selected === value
                ? 'bg-brand-soft text-brand'
                : 'text-muted hover:bg-surface-muted hover:text-foreground',
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-10 shrink-0 rounded-control px-3 text-sm font-semibold',
        active ? 'bg-brand-soft text-brand' : 'border border-border text-muted',
      )}
    >
      {children}
    </button>
  );
}
