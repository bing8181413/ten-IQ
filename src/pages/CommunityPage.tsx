import { useMemo, useState } from 'react';
import { Activity, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

const leaders = [
  ['MacroPilot', '+$42,680', '68%'],
  ['SignalRoom', '+$36,210', '64%'],
  ['EventHorizon', '+$28,940', '71%'],
  ['DataFirst', '+$21,605', '62%'],
  ['QuietAlpha', '+$18,320', '66%'],
] as const;

const feed = [
  ['世界杯冠军', '西班牙概率升至 21%', '刚刚'],
  ['BTC 价格', '“是”方向 24 小时上升 3.2%', '4 分钟前'],
  ['全球利率', '新增 18 个演示观点', '18 分钟前'],
  ['火星货运', '结算来源说明已更新', '1 小时前'],
] as const;

export function CommunityPage({
  view = 'leaderboard',
}: {
  view?: 'leaderboard' | 'accuracy' | 'activity';
}) {
  const [period, setPeriod] = useState('本周');
  const config = useMemo(() => {
    if (view === 'accuracy')
      return { eyebrow: '准确率', title: '市场概率校准', icon: CheckCircle2 };
    if (view === 'activity') return { eyebrow: '动态', title: '市场最新变化', icon: Activity };
    return { eyebrow: '排行榜', title: '表现领先的演示账户', icon: Award };
  }, [view]);
  const Icon = config.icon;

  return (
    <div className="pm-shell py-7 pb-24 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Icon aria-hidden="true" size={16} />
            {config.eyebrow}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{config.title}</h1>
        </div>
        <div className="flex rounded-control bg-surface-muted p-1">
          {['今日', '本周', '本月'].map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={period === item}
              onClick={() => setPeriod(item)}
              className={cn(
                'h-8 rounded-control px-3 text-xs font-semibold',
                period === item ? 'bg-surface text-foreground shadow-card' : 'text-muted',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {view === 'accuracy' ? (
        <AccuracyView />
      ) : view === 'activity' ? (
        <ActivityView />
      ) : (
        <LeaderboardView />
      )}
    </div>
  );
}

function LeaderboardView() {
  return (
    <Card className="mt-5 overflow-hidden p-0">
      <div className="grid grid-cols-[48px_minmax(0,1fr)_100px_80px] gap-3 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold text-muted">
        <span>排名</span>
        <span>账户</span>
        <span className="text-right">演示盈亏</span>
        <span className="text-right">胜率</span>
      </div>
      {leaders.map(([name, pnl, rate], index) => (
        <div
          key={name}
          className="grid min-h-14 grid-cols-[48px_minmax(0,1fr)_100px_80px] items-center gap-3 border-b border-border px-4 text-sm last:border-b-0"
        >
          <span className="font-bold text-muted">{index + 1}</span>
          <span className="truncate font-semibold text-foreground">{name}</span>
          <span className="text-right font-bold text-positive tabular-nums">{pnl}</span>
          <span className="text-right text-foreground tabular-nums">{rate}</span>
        </div>
      ))}
    </Card>
  );
}
function ActivityView() {
  return (
    <div className="mt-5 grid gap-3">
      {feed.map(([title, detail, time]) => (
        <Card key={title} className="flex items-start gap-3 p-4">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand">
            <TrendingUp aria-hidden="true" size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-foreground">{title}</div>
            <div className="mt-1 text-sm text-muted">{detail}</div>
          </div>
          <span className="shrink-0 text-xs text-subtle">{time}</span>
        </Card>
      ))}
    </div>
  );
}
function AccuracyView() {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_2fr]">
      <Card className="p-5">
        <div className="text-sm font-semibold text-muted">演示校准分数</div>
        <div className="mt-2 text-4xl font-bold text-brand tabular-nums">0.084</div>
        <p className="mt-3 text-sm leading-6 text-muted">
          分数越低，历史概率与最终结果越接近。此处仅用于界面演示，不代表真实业绩。
        </p>
      </Card>
      <Card className="p-5">
        <h2 className="text-base font-bold text-foreground">概率区间表现</h2>
        <div className="mt-5 space-y-4">
          {[
            ['20–40%', '31%', 31],
            ['40–60%', '52%', 52],
            ['60–80%', '71%', 71],
            ['80–100%', '91%', 91],
          ].map(([bucket, resolved, width]) => (
            <div
              key={bucket as string}
              className="grid grid-cols-[70px_1fr_50px] items-center gap-3 text-xs"
            >
              <span className="font-semibold text-muted">{bucket}</span>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-brand" style={{ width: `${width}%` }} />
              </div>
              <span className="text-right font-bold text-foreground tabular-nums">{resolved}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
