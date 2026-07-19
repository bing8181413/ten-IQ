import {
  Activity,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Gift,
  ListChecks,
  Settings,
  ShieldCheck,
  Star,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountAvatar } from '@/components/layout/AccountMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { demoAccount } from '@/data/demoAccount';
import { cn } from '@/lib/cn';

const accountStats = [
  { label: '组合价值', value: demoAccount.portfolioValue, tone: 'brand', icon: WalletCards },
  { label: '可用演示资金', value: demoAccount.available, tone: 'positive', icon: CircleDollarSign },
  { label: '未实现盈亏', value: demoAccount.unrealizedPnl, tone: 'positive', icon: Activity },
  { label: '胜率', value: demoAccount.winRate, tone: 'neutral', icon: ShieldCheck },
  { label: '排名', value: demoAccount.rank, tone: 'neutral', icon: Star },
  { label: '关注市场', value: `${demoAccount.watchlist}`, tone: 'neutral', icon: Bell },
];

const quickActions = [
  { label: '我的持仓', href: '#positions', icon: ListChecks, tone: 'neutral' },
  { label: '关注列表', href: '#watchlist', icon: Star, tone: 'neutral' },
  { label: '活动记录', href: '#activity', icon: Activity, tone: 'neutral' },
  { label: '奖励中心', href: '#rewards', icon: Gift, tone: 'brand' },
  { label: '安全设置', href: '#security', icon: ShieldCheck, tone: 'positive' },
  { label: '偏好设置', href: '#settings', icon: Settings, tone: 'neutral' },
];

export function AccountPage() {
  return (
    <div className="pm-shell py-6 pb-24 md:pb-10">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-surface-muted p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <AccountAvatar size="lg" />
                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                      {demoAccount.name}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span>{demoAccount.handle}</span>
                      <span aria-hidden="true">·</span>
                      <span>{demoAccount.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{demoAccount.joined} 加入</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" disabled className="text-positive">
                    <WalletCards aria-hidden="true" size={16} />
                    充值（演示）
                  </Button>
                  <Button disabled>
                    <Bell aria-hidden="true" size={16} />
                    开启提醒
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
              {accountStats.map((stat) => (
                <div key={stat.label} className="bg-surface p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-subtle">
                    <stat.icon
                      aria-hidden="true"
                      size={14}
                      className={cn(
                        stat.tone === 'positive'
                          ? 'text-positive'
                          : stat.tone === 'brand'
                            ? 'text-brand'
                            : 'text-foreground',
                      )}
                    />
                    {stat.label}
                  </div>
                  <div
                    className={cn(
                      'mt-1 text-lg font-bold text-foreground tabular-nums',
                      stat.tone === 'positive' && 'text-positive',
                    )}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <section id="positions" aria-labelledby="positions-title">
            <SectionHeader
              id="positions-title"
              title="我的持仓"
              description="展示用户当前关注的市场方向、概率和演示组合价值。"
            />
            <div className="mt-3 grid gap-3">
              {demoAccount.positions.map((position) => (
                <Card key={position.market} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {position.market}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>{position.outcome}</span>
                        <span aria-hidden="true">·</span>
                        <span>{position.probability} 概率</span>
                        <span aria-hidden="true">·</span>
                        <span>{position.state}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-right sm:min-w-44">
                      <MiniStat label="价值" value={position.value} />
                      <MiniStat
                        label="盈亏"
                        value={position.pnl}
                        className={position.pnl.startsWith('+') ? 'text-positive' : 'text-negative'}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="watchlist" aria-labelledby="watchlist-title">
            <SectionHeader
              id="watchlist-title"
              title="关注市场"
              description="用于快速回到用户最关心的盘口。"
            />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {demoAccount.watchMarkets.map((market) => (
                <Card key={market.title} className="p-4">
                  <div className="text-sm font-semibold text-foreground">{market.title}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-subtle">当前概率</div>
                      <div className="mt-1 text-2xl font-bold text-brand tabular-nums">
                        {market.probability}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted">
                      <div>成交量</div>
                      <div className="mt-1 font-semibold text-foreground">{market.volume}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="text-base font-semibold text-foreground">个人中心</h2>
            <div className="mt-3 grid gap-1">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-control px-2.5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
                  >
                    <span className="inline-flex size-8 items-center justify-center rounded-control">
                      <ActionIcon
                        aria-hidden="true"
                        size={17}
                        className={cn(
                          action.tone === 'positive'
                            ? 'text-positive'
                            : action.tone === 'brand'
                              ? 'text-brand'
                              : 'text-foreground',
                        )}
                      />
                    </span>
                    <span className="flex-1">{action.label}</span>
                    <ChevronRight aria-hidden="true" size={15} className="text-subtle" />
                  </a>
                );
              })}
            </div>
          </Card>

          <Card id="activity" className="p-4">
            <h2 className="text-base font-semibold text-foreground">近期活动</h2>
            <div className="mt-3 divide-y divide-border">
              {demoAccount.activity.map((item) => (
                <div key={`${item.label}-${item.detail}`} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-subtle">{item.time}</div>
                  </div>
                  <div className="mt-1 text-sm text-muted">{item.detail}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card id="rewards" className="p-4">
            <h2 className="text-base font-semibold text-foreground">奖励中心</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              本周完成度基于演示行为计算，不代表真实奖励、返佣或收益承诺。
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${demoAccount.rewardsProgress}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-semibold text-brand tabular-nums">
              {demoAccount.rewardsProgress}% 已完成
            </div>
          </Card>

          <Card id="security" className="p-4">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-positive-soft text-positive">
              <ShieldCheck aria-hidden="true" size={18} />
            </span>
            <h2 className="mt-3 text-base font-semibold text-foreground">安全边界已预留</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              接入真实账户前，需要独立完成身份、签名、权限、限流、审计、异常恢复和监管评审。
            </p>
            <Button className="mt-4" variant="outline" fullWidth disabled>
              连接账户（待集成）
            </Button>
          </Card>

          <Card id="settings" className="p-4">
            <h2 className="text-base font-semibold text-foreground">偏好设置</h2>
            <div className="mt-3 grid gap-2">
              <PreferenceRow label="价格提醒" value="开启" />
              <PreferenceRow label="市场语言" value="中文" />
              <PreferenceRow label="默认排序" value="热门优先" />
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-control px-4 text-sm font-semibold text-brand hover:bg-brand-softer"
            >
              返回市场
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <div className="text-xs text-subtle">{label}</div>
      <div className={cn('mt-1 text-sm font-bold text-foreground tabular-nums', className)}>
        {value}
      </div>
    </div>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-control bg-surface-muted px-3 py-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm text-muted">{value}</span>
    </div>
  );
}
