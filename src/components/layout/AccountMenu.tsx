import { Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Activity,
  Bell,
  ChevronDown,
  CircleDollarSign,
  CircleUserRound,
  Gift,
  ListChecks,
  LogOut,
  ShieldCheck,
  Star,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAccount } from '@/hooks/useAccount';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/cn';

export function AccountMenu() {
  const accountQuery = useAccount();
  const watchlistQuery = useWatchlist();
  const account = accountQuery.data?.data;
  if (!account) {
    return (
      <button type="button" disabled className="pm-auth-button h-9 px-3 text-sm text-muted">
        演示账户加载中
      </button>
    );
  }
  const menuItems = [
    {
      label: '个人主页',
      detail: '资料、等级与公开统计',
      to: '/account',
      icon: CircleUserRound,
      tone: 'neutral',
    },
    {
      label: '我的持仓',
      detail: `${account.openPositions} 个进行中`,
      to: '/account#positions',
      icon: ListChecks,
      tone: 'neutral',
    },
    {
      label: '关注市场',
      detail: `${watchlistQuery.data?.data.marketIds.length ?? account.watchlistMarketIds.length} 个观察项`,
      to: '/account#watchlist',
      icon: Star,
      tone: 'neutral',
    },
    {
      label: '账户活动',
      detail: '订单预览与提醒记录',
      to: '/account#activity',
      icon: Activity,
      tone: 'neutral',
    },
    {
      label: '奖励中心',
      detail: `${account.rewardsProgress}% 本周进度`,
      to: '/account#rewards',
      icon: Gift,
      tone: 'brand',
    },
    {
      label: '安全设置',
      detail: '身份与签名接入前检查',
      to: '/account#security',
      icon: ShieldCheck,
      tone: 'positive',
    },
  ] as const;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="pm-auth-button inline-flex h-9 items-center gap-2 border border-border bg-surface px-2.5 text-sm font-semibold text-foreground hover:border-border-strong hover:bg-surface-hover"
          aria-label="打开个人中心"
        >
          <AccountAvatar size="sm" initials={account.initials} />
          <span className="hidden max-w-24 truncate 2xl:inline">{account.handle}</span>
          <ChevronDown aria-hidden="true" size={14} className="text-subtle" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[100] w-80 animate-enter rounded-panel border border-border bg-surface p-2 shadow-popover"
        >
          <div className="rounded-card border border-border bg-surface p-3">
            <div className="flex items-start gap-3">
              <AccountAvatar initials={account.initials} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-foreground">{account.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span>{account.handle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{account.level}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <AccountMetric
                icon={CircleDollarSign}
                label="演示资金"
                value={account.balance}
                tone="positive"
              />
              <AccountMetric
                icon={TrendingUp}
                label="组合价值"
                value={account.portfolioValue}
                tone="brand"
              />
            </div>
            <p className="mt-3 rounded-control bg-surface-muted px-2.5 py-2 text-xs leading-5 text-muted">
              当前为演示账户。充值、提现、钱包签名和真实交易需完成独立安全评审后接入。
            </p>
          </div>

          <div className="mt-2 grid gap-1">
            {menuItems.map((item) => (
              <DropdownMenu.Item key={item.label} asChild>
                <AccountMenuLink {...item} />
              </DropdownMenu.Item>
            ))}
          </div>

          <DropdownMenu.Separator className="my-2 h-px bg-border" />
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 px-1">
            <Button variant="outline" size="sm" disabled className="justify-start">
              <WalletCards aria-hidden="true" size={15} />
              连接钱包（待接入）
            </Button>
            <button
              type="button"
              disabled
              className="inline-flex size-8 items-center justify-center rounded-control text-subtle disabled:opacity-50"
              aria-label="退出登录（演示不可用）"
            >
              <LogOut aria-hidden="true" size={16} />
            </button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MobileAccountSummary({ onNavigate }: { onNavigate: () => void }) {
  const accountQuery = useAccount();
  const account = accountQuery.data?.data;
  if (!account) return null;
  return (
    <Link
      to="/account"
      onClick={onNavigate}
      className="mt-4 block rounded-card border border-border bg-surface-muted p-3 hover:bg-surface-hover"
    >
      <div className="flex items-center gap-3">
        <AccountAvatar initials={account.initials} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">{account.name}</div>
          <div className="mt-0.5 text-xs text-muted">{account.handle}</div>
        </div>
        <Bell aria-hidden="true" size={17} className="text-foreground" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <AccountMetric
          icon={CircleDollarSign}
          label="演示资金"
          value={account.balance}
          tone="positive"
        />
        <AccountMetric
          icon={ListChecks}
          label="持仓"
          value={`${account.openPositions} 个`}
          tone="neutral"
        />
      </div>
    </Link>
  );
}

export function AccountAvatar({
  size = 'md',
  initials = 'TI',
}: {
  size?: 'sm' | 'md' | 'lg';
  initials?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pm-account-avatar inline-flex shrink-0 items-center justify-center rounded-full text-white ring-2 ring-surface',
        size === 'sm'
          ? 'size-7 text-[11px]'
          : size === 'lg'
            ? 'size-14 text-base'
            : 'size-10 text-sm',
        'font-bold tracking-normal',
      )}
    >
      {initials}
    </span>
  );
}

function AccountMetric({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'brand';
}) {
  return (
    <div className="rounded-control border border-border bg-surface px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-subtle">
        <Icon
          aria-hidden="true"
          size={13}
          className={cn(
            tone === 'positive'
              ? 'text-positive'
              : tone === 'brand'
                ? 'text-brand'
                : 'text-foreground',
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          'mt-0.5 text-sm font-bold tabular-nums',
          tone === 'positive' ? 'text-positive' : 'text-foreground',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function AccountMenuLink({
  label,
  detail,
  to,
  icon: Icon,
  tone,
}: {
  label: string;
  detail: string;
  to: string;
  icon: typeof CircleUserRound;
  tone: 'neutral' | 'positive' | 'brand';
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-control px-2.5 py-2.5 outline-none hover:bg-surface-muted focus:bg-surface-muted"
    >
      <span
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-control',
          tone === 'positive'
            ? 'text-positive'
            : tone === 'brand'
              ? 'text-brand'
              : 'text-foreground',
        )}
      >
        <Icon aria-hidden="true" size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block truncate text-xs text-muted">{detail}</span>
      </span>
    </Link>
  );
}
