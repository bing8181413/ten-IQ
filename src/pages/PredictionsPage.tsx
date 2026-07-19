import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MarketAvatar } from '@/components/market/MarketAvatar';
import { mockMarkets } from '@/data/mockMarkets';
import { formatCurrency, formatProbability } from '@/lib/format';
import { cn } from '@/lib/cn';

const sorts = ['热门', '流动性', '交易量', '最新发布', '即将封盘', '竞争度'];
const topics = ['全部', '实时加密货币', '政治', '体育', '文化', '科技', '人工智能'];

export function PredictionsPage() {
  const [sort, setSort] = useState('热门');
  const [status, setStatus] = useState('进行中');
  const [topic, setTopic] = useState('全部');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = mockMarkets.filter((market) => {
      const matchesTopic =
        topic === '全部' ||
        market.category === topic ||
        (topic === '人工智能' && market.category === 'AI') ||
        (topic === '实时加密货币' && market.category === '加密');
      const matchesQuery =
        !normalized ||
        market.title.toLowerCase().includes(normalized) ||
        market.tags.some((tag) => tag.toLowerCase().includes(normalized));
      const matchesStatus = status !== '已结算' || market.status === 'resolved';
      return matchesTopic && matchesQuery && matchesStatus;
    });
    return [...result].sort((a, b) => {
      if (sort === '流动性') return b.liquidity - a.liquidity;
      if (sort === '交易量') return b.volume - a.volume;
      if (sort === '即将封盘') return Date.parse(a.endDate) - Date.parse(b.endDate);
      if (sort === '最新发布') return a.title.localeCompare(b.title, 'zh-CN');
      if (sort === '竞争度') {
        return (
          Math.abs((a.outcomes[0]?.probability ?? 0) - 50) -
          Math.abs((b.outcomes[0]?.probability ?? 0) - 50)
        );
      }
      return Number(b.trending) - Number(a.trending) || b.volume - a.volume;
    });
  }, [query, sort, status, topic]);

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
          <div className="flex items-center justify-between gap-3">
            <h2 id="prediction-list-title" className="text-lg font-bold text-foreground">
              预测市场
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted">
              <SlidersHorizontal aria-hidden="true" size={14} /> {visible.length} 个结果
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {visible.map((market) => {
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
            })}
            {!visible.length ? (
              <Card className="p-12 text-center">
                <p className="text-sm font-semibold text-foreground">没有符合条件的预测</p>
                <Button className="mt-4" variant="outline" onClick={reset}>
                  清空筛选
                </Button>
              </Card>
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
              'min-h-9 rounded-control px-3 text-left text-sm font-medium',
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
        'h-9 shrink-0 rounded-control px-3 text-sm font-semibold',
        active ? 'bg-brand-soft text-brand' : 'border border-border text-muted',
      )}
    >
      {children}
    </button>
  );
}
