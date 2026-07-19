import { ArrowDown, ArrowUp, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarkets } from '@/hooks/useMarkets';
import { useComboLegs, usePerpsAssets } from '@/hooks/useProductData';
import type { PerpsAsset } from '@/types/product';
import { Skeleton } from '@/components/ui/Skeleton';
import { MarketAvatar } from './MarketAvatar';

export function TrendingTopics() {
  const perpsQuery = usePerpsAssets();
  const combosQuery = useComboLegs();
  const marketsQuery = useMarkets({ category: '全部', sort: 'trending', limit: 8 });
  const perps = perpsQuery.data?.data.slice(0, 3) ?? [];
  const comboLegs = combosQuery.data?.data ?? [];
  const topics = [
    ...new Set((marketsQuery.data?.data ?? []).flatMap((market) => market.tags)),
  ].slice(0, 5);

  return (
    <div>
      <div className="pm-perps-card p-4">
        <div className="text-center">
          <h2 className="text-xl leading-6 font-semibold text-foreground">永续合约上线了</h2>
          <p className="mt-1 text-sm font-medium text-muted">使用演示数据预览做多或做空意图</p>
        </div>
        <div className="mt-3 space-y-2" aria-busy={perpsQuery.isLoading}>
          {perpsQuery.isLoading ? (
            <>
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </>
          ) : perpsQuery.isError ? (
            <InlineQueryState label="行情暂时不可用" onRetry={() => void perpsQuery.refetch()} />
          ) : perps.length ? (
            perps.map((asset, index) => (
              <PerpsRow key={asset.symbol} asset={asset} active={index === 1} />
            ))
          ) : (
            <p className="text-center text-xs text-muted">暂无演示行情</p>
          )}
        </div>
        {perps.length ? (
          <Link
            to={`/zh/asset/${perps[0]?.symbol ?? ''}`}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-foreground px-8 text-sm font-semibold text-white hover:bg-muted"
          >
            查看演示行情
          </Link>
        ) : null}
      </div>

      <div className="pm-combo-card relative mt-3 p-4">
        <div className="pm-combo-beta absolute top-4 right-5 text-xs font-semibold">测试版</div>
        <div className="pm-combo-content">
          <span className="inline-flex size-10 items-center justify-center rounded-control bg-brand-soft text-brand">
            <Layers3 aria-hidden="true" size={20} />
          </span>
          <div className="pm-combo-copy min-w-0 flex-1 text-left">
            <h2 className="pm-combo-title text-foreground">创建体育组合</h2>
            {combosQuery.isLoading ? (
              <Skeleton className="h-5 w-52" />
            ) : combosQuery.isError ? (
              <InlineQueryState
                label="组合项目暂时不可用"
                onRetry={() => void combosQuery.refetch()}
              />
            ) : comboLegs.length ? (
              <p className="pm-combo-description">从 {comboLegs.length} 个可用项目中选择 2–4 项</p>
            ) : (
              <p className="pm-combo-description">暂无可用组合项目</p>
            )}
          </div>
          {comboLegs.length ? (
            <Link
              to="/zh/predictions/combine"
              className="pm-purple-button flex h-10 w-24 shrink-0 items-center justify-center text-sm font-semibold"
            >
              开始
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-4 rounded-card border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">热门话题</h2>
          <Link to="/zh/predictions" className="text-xs font-semibold text-brand hover:underline">
            探索全部
          </Link>
        </div>
        <div className="mt-3 flex min-h-10 flex-wrap gap-2">
          {marketsQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : marketsQuery.isError ? (
            <InlineQueryState
              label="热门话题暂时不可用"
              onRetry={() => void marketsQuery.refetch()}
            />
          ) : topics.length ? (
            topics.map((topic) => (
              <Link
                key={topic}
                to={`/?topic=${encodeURIComponent(topic)}`}
                className="inline-flex min-h-10 items-center rounded-full bg-surface-muted px-3 text-xs font-semibold text-muted hover:text-foreground"
              >
                {topic}
              </Link>
            ))
          ) : (
            <p className="text-xs text-muted">暂无热门话题</p>
          )}
        </div>
      </section>
    </div>
  );
}

function InlineQueryState({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 text-xs text-negative">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-10 rounded-control px-2 font-semibold text-foreground hover:bg-surface-muted"
      >
        重试
      </button>
    </div>
  );
}

function PerpsRow({ asset, active }: { asset: PerpsAsset; active: boolean }) {
  const positive = asset.change >= 0;
  return (
    <Link
      to={`/zh/asset/${asset.symbol}`}
      className={
        active
          ? 'flex items-center gap-3 rounded-control bg-surface-muted p-1'
          : 'flex items-center gap-3 p-1'
      }
    >
      <MarketAvatar icon={asset.icon} className="size-8" />
      <span className="flex-1 text-sm font-bold text-foreground">{asset.name}</span>
      <span
        className={
          positive
            ? 'inline-flex items-center text-sm font-bold text-positive tabular-nums'
            : 'inline-flex items-center text-sm font-bold text-negative tabular-nums'
        }
      >
        {positive ? (
          <ArrowUp aria-hidden="true" size={13} />
        ) : (
          <ArrowDown aria-hidden="true" size={13} />
        )}
        {Math.abs(asset.change).toFixed(2)}%
      </span>
    </Link>
  );
}
