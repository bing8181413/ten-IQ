import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Radio, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { FreshnessNotice } from '@/components/ui/FreshnessNotice';
import { useSportsEvents } from '@/hooks/useProductData';
import { useProductPreview } from '@/hooks/useProductPreview';
import { cn } from '@/lib/cn';
import type { SportsEvent } from '@/types/product';

export function SportsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.pathname.endsWith('/futures') ? '远期' : '实时';
  const [mode, setMode] = useState<'实时' | '远期'>(initialMode);
  const [league, setLeague] = useState('全部');
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedLeagues, setExpandedLeagues] = useState(false);
  const previewMutation = useProductPreview();
  const modeKey = mode === '实时' ? 'live' : 'futures';
  const eventsQuery = useSportsEvents(modeKey, league);
  const sportsLeagues = eventsQuery.data?.meta.leagues ?? ['全部'];
  const leagueOptions = expandedLeagues ? sportsLeagues : sportsLeagues.slice(0, 6);
  const visible = eventsQuery.data?.data ?? [];

  return (
    <div className="pm-shell py-5 pb-24 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-negative">
            <Radio aria-hidden="true" size={15} /> 体育盘口
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground">体育{mode}</h1>
        </div>
        <div className="inline-flex rounded-control bg-surface-muted p-1" aria-label="体育时间范围">
          {(['实时', '远期'] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => {
                setMode(item);
                setLeague('全部');
                setSelected(null);
                previewMutation.reset();
                void navigate(item === '实时' ? '/zh/sports/live' : '/zh/sports/futures');
              }}
              className={cn(
                'h-8 rounded-control px-4 text-sm font-semibold',
                mode === item ? 'bg-surface text-foreground shadow-card' : 'text-muted',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex scrollbar-none gap-2 overflow-x-auto pb-1" aria-label="体育联盟">
        {leagueOptions.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={league === item}
            onClick={() => {
              setLeague(item);
              setSelected(null);
              previewMutation.reset();
            }}
            className={cn(
              'h-9 shrink-0 rounded-control px-4 text-sm font-semibold',
              league === item
                ? 'bg-brand-soft text-brand'
                : 'border border-border bg-surface text-muted hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={expandedLeagues}
          onClick={() => setExpandedLeagues((current) => !current)}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-control border border-border px-4 text-sm font-semibold text-muted"
        >
          {expandedLeagues ? '收起' : '更多'} <ChevronDown aria-hidden="true" size={14} />
        </button>
      </div>
      {eventsQuery.data?.meta ? (
        <FreshnessNotice
          stale={eventsQuery.data.meta.stale}
          updatedAt={eventsQuery.data.meta.updatedAt}
          onRefresh={() => void eventsQuery.refetch()}
        />
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 space-y-5" aria-labelledby="sports-events-title">
          <div className="flex items-center justify-between">
            <h2 id="sports-events-title" className="text-lg font-bold text-foreground">
              {league === '全部' ? '所有体育赛事' : league}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              disabled={league === '全部'}
              onClick={() => {
                setLeague('全部');
                setSelected(null);
                previewMutation.reset();
              }}
            >
              <SlidersHorizontal aria-hidden="true" size={15} /> 重置筛选
            </Button>
          </div>
          {eventsQuery.isLoading ? (
            <div className="space-y-3" role="status" aria-busy="true" aria-label="正在加载体育赛事">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : eventsQuery.isError ? (
            <ErrorState onRetry={() => void eventsQuery.refetch()} />
          ) : visible.length ? (
            <div className="space-y-3">
              {visible.map((match) => (
                <SportsMatchCard
                  key={match.id}
                  match={match}
                  selected={selected}
                  onSelect={(value) => {
                    setSelected(value);
                    previewMutation.reset();
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center text-sm text-muted">该联盟暂时没有演示赛事。</Card>
          )}
        </section>

        <aside className={selected ? 'block' : 'hidden xl:block'}>
          <Card className="fixed inset-x-3 bottom-20 z-30 p-4 shadow-popover xl:sticky xl:inset-auto xl:top-36 xl:shadow-card">
            <h2 className="text-base font-bold text-foreground">体育订单</h2>
            {selected ? (
              <>
                <p className="mt-3 rounded-control bg-brand-softer p-3 text-sm font-semibold text-brand">
                  已选择 {selected}
                </p>
                <Button
                  className="mt-4"
                  fullWidth
                  disabled={previewMutation.isPending}
                  onClick={() =>
                    previewMutation.mutate({ kind: 'sports', selection: selected, amount: 10 })
                  }
                >
                  {previewMutation.isPending ? '正在生成预览…' : '预览盘口'}
                </Button>
                <Button
                  className="mt-2 xl:hidden"
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setSelected(null);
                    previewMutation.reset();
                  }}
                >
                  清除选择
                </Button>
                {previewMutation.data ? (
                  <p
                    role="status"
                    className="mt-3 rounded-control bg-positive-soft p-3 text-sm font-semibold text-positive"
                  >
                    {previewMutation.data.data.summary}；预计演示返回 $
                    {previewMutation.data.data.estimatedReturn.toFixed(2)}。不会提交真实订单。
                  </p>
                ) : null}
                {previewMutation.isError ? (
                  <p role="alert" className="mt-3 text-sm text-negative">
                    {previewMutation.error.message}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                选择任意胜负、让分或总分价格后在此预览。
              </p>
            )}
            <Link
              to="/zh/predictions/combine"
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-control border border-border text-sm font-semibold text-foreground hover:bg-surface-muted"
            >
              创建组合
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SportsMatchCard({
  match,
  selected,
  onSelect,
}: {
  match: SportsEvent;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  const prices = [
    `${match.home.short} ${match.home.price}¢`,
    `${match.away.short} ${match.away.price}¢`,
    ...match.spread,
    ...match.total,
  ];
  return (
    <Card role="article" className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-2 text-xs text-muted">
        <span className="font-semibold text-foreground">{match.league}</span>
        <span>
          {match.status} · {match.volume} 交易量
        </span>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(180px,1fr)_2fr]">
        <div className="space-y-3">
          {[match.home, match.away].map((team) => (
            <div key={team.short} className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-control bg-surface-muted text-xs font-bold text-muted">
                {team.short}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {team.name}
              </span>
              <span className="text-lg font-bold text-foreground tabular-nums">{team.score}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {prices.map((price, index) => (
            <button
              key={price}
              type="button"
              aria-pressed={selected === `${match.id}:${price}`}
              onClick={() => onSelect(`${match.id}:${price}`)}
              className={cn(
                'h-10 rounded-control border px-2 text-xs font-semibold tabular-nums',
                selected === `${match.id}:${price}`
                  ? 'border-brand bg-brand-soft text-brand'
                  : index % 2 === 0
                    ? 'border-transparent bg-positive-soft text-positive'
                    : 'border-transparent bg-negative-soft text-negative',
              )}
            >
              {price}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
