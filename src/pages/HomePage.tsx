import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bookmark, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { FeaturedMarketCard } from '@/components/market/FeaturedMarketCard';
import type { MarketSort } from '@/components/market/MarketFilters';
import { MarketFilters } from '@/components/market/MarketFilters';
import { MarketGrid } from '@/components/market/MarketGrid';
import { TopicChips } from '@/components/market/TopicChips';
import { TrendingTopics } from '@/components/market/TrendingTopics';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { FreshnessNotice } from '@/components/ui/FreshnessNotice';
import { useMarkets } from '@/hooks/useMarkets';
import { useSportsEvents } from '@/hooks/useProductData';
import { useWatchlist, useWatchlistMutation } from '@/hooks/useWatchlist';
import { track } from '@/lib/analytics';
import { useTradeStore } from '@/stores/tradeStore';
import type { Market, Outcome } from '@/types/market';

const realCategories = new Set([
  '全部',
  '热门',
  '体育',
  '加密',
  'AI',
  '经济',
  '科技',
  '商业',
  '文化',
]);
const routeCategoryMap: Record<string, string> = {
  sports: '体育',
  crypto: '加密',
  finance: '经济',
  tech: '科技',
  'pop-culture': '文化',
  economy: '经济',
};
const routeSearchMap: Record<string, string> = {
  politics: '政治',
  esports: '电竞',
  iran: '伊朗',
  geopolitics: '地缘政治',
  weather: '天气',
  elections: '选举',
};
const routeTitleMap: Record<string, string> = {
  breaking: '突发市场',
  politics: '政治',
  crypto: '加密货币',
  esports: '电竞',
  iran: '伊朗',
  finance: '财务',
  geopolitics: '地缘政治',
  tech: '科技',
  'pop-culture': '文化',
  economy: '经济',
  weather: '天气',
  mentions: '提及市场',
  elections: '选举',
};

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const { section, subsection } = useParams();
  const sectionTitle =
    subsection === 'world-cup' ? '世界杯' : section ? (routeTitleMap[section] ?? '预测市场') : null;
  const navigate = useNavigate();
  const category =
    params.get('category') ?? (section ? routeCategoryMap[section] : undefined) ?? '全部';
  const topic = params.get('topic') ?? '';
  const sort =
    (params.get('sort') as MarketSort | null) ??
    (section === 'breaking' ? 'newest' : section === 'mentions' ? 'volume' : 'trending');
  const search = params.get('q') ?? (section ? routeSearchMap[section] : undefined) ?? '';
  const [showSearch, setShowSearch] = useState(params.get('focus') === 'search');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [marketSearch, setMarketSearch] = useState(search);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const effectiveCategory = realCategories.has(category) ? category : '全部';
  const filters = {
    category: effectiveCategory,
    sort,
    ...(search ? { search } : {}),
    ...(topic ? { topic } : {}),
  };
  const { data, isLoading, isError, refetch, isFetching } = useMarkets({ ...filters, limit: 50 });
  const featuredSportsQuery = useSportsEvents('live', '世界杯');
  const watchlistQuery = useWatchlist();
  const watchlistMutation = useWatchlistMutation();
  const watchlistedIds = watchlistQuery.data?.data.marketIds ?? [];
  const markets = data?.data ?? [];
  const visibleMarkets = watchlistOnly
    ? markets.filter((market) => watchlistedIds.includes(market.id))
    : markets;
  const featuredMarkets = markets
    .filter((market) => market.featured || market.trending)
    .slice(0, 6);
  const primaryFeatured =
    featuredMarkets.length > 0
      ? featuredMarkets[featuredIndex % featuredMarkets.length]
      : markets[0];
  const previousFeatured =
    featuredMarkets.length > 0
      ? featuredMarkets[(featuredIndex - 1 + featuredMarkets.length) % featuredMarkets.length]
      : undefined;
  const nextFeatured =
    featuredMarkets.length > 0
      ? featuredMarkets[(featuredIndex + 1) % featuredMarkets.length]
      : undefined;
  function selectTopic(value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === '全部') {
      next.delete('topic');
      next.delete('category');
      next.delete('q');
    } else if (realCategories.has(value)) {
      next.delete('topic');
      next.delete('q');
      next.set('category', value);
    } else {
      next.delete('category');
      next.delete('q');
      next.set('topic', value);
    }
    setParams(next);
  }
  function selectOutcome(market: Market, outcome: Outcome) {
    useTradeStore.getState().selectOutcome(outcome.id);
    track({ name: 'outcome_selected', marketId: market.id, outcomeId: outcome.id });
    void navigate(`/markets/${market.slug}`);
  }
  function submitMarketSearch() {
    const next = new URLSearchParams(params);
    const value = marketSearch.trim();
    next.delete('focus');
    if (value) next.set('q', value);
    else next.delete('q');
    setParams(next);
  }
  return (
    <div className="pm-shell pt-[23px] pb-6">
      <h1 className={sectionTitle ? 'text-2xl font-bold text-foreground' : 'sr-only'}>
        {sectionTitle ?? 'ten-IQ 预测市场'}
      </h1>
      {data?.meta ? (
        <FreshnessNotice
          stale={data.meta.stale}
          updatedAt={data.meta.updatedAt}
          onRefresh={() => void refetch()}
        />
      ) : null}
      {sectionTitle ? (
        <p className="mt-2 text-sm text-muted">
          浏览 {sectionTitle} 的最新概率、成交量和市场变化。
        </p>
      ) : null}
      <div className={sectionTitle ? 'hidden' : 'hidden md:block'}>
        <section className="pm-feature-grid">
          <div className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-[30rem] rounded-card" />
            ) : primaryFeatured ? (
              <FeaturedMarketCard
                market={primaryFeatured}
                {...(featuredSportsQuery.data?.data[0]
                  ? { sportsEvent: featuredSportsQuery.data.data[0] }
                  : {})}
                onOutcomeSelect={selectOutcome}
              />
            ) : (
              <EmptyState
                title="当前筛选暂无精选市场"
                description="清除搜索或切回全部市场，继续浏览有成交量的盘口。"
                onReset={() => setParams({})}
                className="min-h-[30rem]"
              />
            )}
            <div className="mt-[7px] flex items-center justify-between gap-3">
              <div className="ml-4 flex items-center gap-2" role="group" aria-label="精选市场轮播">
                {featuredMarkets.map((market, index) => (
                  <button
                    key={market.id}
                    type="button"
                    aria-label={`显示精选市场：${market.title}`}
                    aria-pressed={primaryFeatured?.id === market.id}
                    onClick={() => setFeaturedIndex(index)}
                    className="inline-flex size-10 items-center justify-center rounded-control"
                  >
                    <span
                      className={
                        primaryFeatured?.id === market.id
                          ? 'h-2 w-8 rounded-full bg-foreground'
                          : 'size-2 rounded-full bg-border-strong'
                      }
                    />
                  </button>
                ))}
              </div>
              <div className="hidden min-w-0 translate-x-[11px] items-center gap-3 text-sm font-medium text-muted sm:flex">
                <button
                  type="button"
                  disabled={!previousFeatured}
                  onClick={() =>
                    setFeaturedIndex(
                      (current) => (current - 1 + featuredMarkets.length) % featuredMarkets.length,
                    )
                  }
                  className="inline-flex h-14 items-center py-2 pr-1.5 pl-2 hover:text-foreground"
                >
                  <span className="inline-flex h-10 max-w-56 items-center gap-2 rounded-full bg-surface-muted px-[15px]">
                    <ChevronRight aria-hidden="true" size={15} className="rotate-180" />
                    <span className="truncate">{previousFeatured?.title ?? '上一项'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!nextFeatured}
                  onClick={() =>
                    setFeaturedIndex((current) => (current + 1) % featuredMarkets.length)
                  }
                  className="inline-flex h-14 items-center py-2 pr-1.5 pl-2 hover:text-foreground"
                >
                  <span className="inline-flex h-10 max-w-56 items-center gap-2 rounded-full bg-surface-muted px-[15px]">
                    <span className="truncate">{nextFeatured?.title ?? '下一项'}</span>
                    <ChevronRight aria-hidden="true" size={15} />
                  </span>
                </button>
              </div>
            </div>
          </div>
          <aside className="hidden lg:block">
            <TrendingTopics />
          </aside>
        </section>
      </div>

      <section className={sectionTitle ? 'mt-5' : 'mt-1 md:mt-[15px]'}>
        <div className="mb-[10px] flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="hidden text-[20px] leading-6 font-semibold text-foreground md:block">
              {sectionTitle ? `${sectionTitle}盘口` : '所有盘口'}
            </h2>
            <button
              type="button"
              aria-label="搜索所有盘口"
              aria-pressed={showSearch}
              onClick={() => setShowSearch((value) => !value)}
              className="flex h-10 w-full max-w-[250px] items-center gap-2 rounded-control bg-surface-muted px-3 text-sm text-muted md:hidden"
            >
              <Search aria-hidden="true" size={17} />
              搜索
            </button>
            {isFetching && !isLoading ? (
              <p className="mt-1 text-xs text-muted">市场正在更新</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <button
              type="button"
              aria-label="搜索所有盘口"
              aria-pressed={showSearch}
              onClick={() => setShowSearch((value) => !value)}
              className="hidden size-10 items-center justify-center rounded-control hover:bg-surface-muted md:inline-flex"
            >
              <Search aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-label="筛选盘口"
              aria-pressed={showFilters}
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex size-10 items-center justify-center rounded-control hover:bg-surface-muted"
            >
              <SlidersHorizontal aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              aria-label="收藏市场"
              aria-pressed={watchlistOnly}
              onClick={() => setWatchlistOnly((value) => !value)}
              className="inline-flex size-10 items-center justify-center rounded-control hover:bg-surface-muted aria-pressed:bg-brand-soft aria-pressed:text-brand"
            >
              <Bookmark aria-hidden="true" size={18} />
            </button>
          </div>
        </div>

        {showSearch || showFilters ? (
          <div className="mb-3 flex flex-col gap-3 border-y border-border bg-surface py-3 sm:flex-row sm:items-center sm:justify-between">
            {showSearch ? (
              <form
                role="search"
                className="flex min-w-0 flex-1 items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitMarketSearch();
                }}
              >
                <Input
                  value={marketSearch}
                  onChange={(event) => setMarketSearch(event.target.value)}
                  aria-label="搜索所有盘口"
                  placeholder="搜索盘口、主题或结果"
                  className="h-10 max-w-xl"
                />
                <button
                  type="submit"
                  className="min-h-10 rounded-control bg-foreground px-4 text-sm font-semibold text-white"
                >
                  搜索
                </button>
                <button
                  type="button"
                  aria-label="关闭搜索"
                  className="inline-flex size-10 items-center justify-center rounded-control text-muted hover:bg-surface-muted"
                  onClick={() => setShowSearch(false)}
                >
                  <X aria-hidden="true" size={17} />
                </button>
              </form>
            ) : null}
            {showFilters ? (
              <MarketFilters
                value={sort}
                onChange={(value) => {
                  const next = new URLSearchParams(params);
                  next.set('sort', value);
                  setParams(next);
                  track({ name: 'filter_changed', filter: 'sort', value });
                }}
              />
            ) : null}
          </div>
        ) : null}

        <div className="mb-[19px] flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <TopicChips
              value={topic || effectiveCategory}
              expanded={categoriesExpanded}
              onChange={(value) => {
                selectTopic(value);
                track({ name: 'filter_changed', filter: 'category', value });
              }}
            />
          </div>
          <button
            type="button"
            aria-label="查看更多分类"
            aria-expanded={categoriesExpanded}
            onClick={() => setCategoriesExpanded((value) => !value)}
            className="hidden size-8 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-foreground sm:inline-flex"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>

        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : visibleMarkets.length === 0 && !isLoading ? (
          <EmptyState
            title={watchlistOnly ? '关注列表还是空的' : '没有匹配的市场'}
            description={
              watchlistOnly ? '关闭收藏筛选，继续浏览全部盘口。' : '换一个关键词或清除当前分类。'
            }
            onReset={() => {
              setWatchlistOnly(false);
              setParams({});
            }}
          />
        ) : (
          <MarketGrid
            markets={visibleMarkets}
            loading={isLoading}
            onOutcomeSelect={selectOutcome}
            watchlistedIds={watchlistedIds}
            onWatchlistToggle={(market, active) =>
              watchlistMutation.mutate({ marketId: market.id, active })
            }
          />
        )}
      </section>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setWatchlistOnly(false);
            setParams({});
          }}
          className="inline-flex min-h-10 items-center gap-1 rounded-control px-4 text-sm font-semibold text-brand hover:bg-brand-softer hover:text-brand-strong"
        >
          探索全部
          <ChevronRight aria-hidden="true" size={15} />
        </button>
      </div>
    </div>
  );
}
