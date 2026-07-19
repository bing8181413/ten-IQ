import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, CircleHelp, Menu, Search, X } from 'lucide-react';
import { AccountMenu } from './AccountMenu';
import { Brand } from './Brand';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

type NavIconKind = 'hot' | 'worldCup';
const topicNav: { label: string; to: string; icon?: NavIconKind }[] = [
  { label: '热门', to: '/zh', icon: 'hot' },
  { label: '世界杯', to: '/zh/sports/world-cup', icon: 'worldCup' },
  { label: '组合', to: '/zh/predictions/combine' },
  { label: '永续合约', to: '/zh/asset/sp500' },
  { label: '突发', to: '/zh/breaking' },
  { label: '政治', to: '/zh/politics' },
  { label: '体育', to: '/zh/sports' },
  { label: '加密', to: '/zh/crypto' },
  { label: '电竞', to: '/zh/esports' },
  { label: '伊朗', to: '/zh/iran' },
  { label: '财务', to: '/zh/finance' },
  { label: '地缘政治', to: '/zh/geopolitics' },
  { label: '科技', to: '/zh/tech' },
  { label: '文化', to: '/zh/pop-culture' },
  { label: '经济', to: '/zh/economy' },
  { label: '天气', to: '/zh/weather' },
  { label: '提及', to: '/zh/mentions' },
  { label: '选举', to: '/zh/elections' },
];
const moreNav = [
  { label: '全部预测', to: '/zh/predictions' },
  { label: '艺术', to: '/zh/pop-culture/art' },
  { label: '商业', to: '/?category=商业' },
  { label: 'AI', to: '/?category=AI' },
];

function SearchForm({ mobile = false, onDone }: { mobile?: boolean; onDone?: () => void }) {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const navigate = useNavigate();
  function submit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    void navigate(next ? `/?q=${encodeURIComponent(next)}` : '/');
    onDone?.();
  }
  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn('relative', mobile ? 'w-full' : 'hidden w-[600px] flex-none md:block')}
    >
      <Search
        aria-hidden="true"
        size={17}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle"
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索 markets..."
        aria-label="搜索市场"
        className="pm-search-input h-10 border-transparent bg-surface-muted py-1 pr-3 pl-11 text-sm"
      />
      <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-sm text-subtle sm:block">
        /
      </span>
    </form>
  );
}
export function TopNav() {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="pm-shell pm-top-row">
        <div className="w-[161px] shrink-0">
          <Brand />
        </div>
        <SearchForm />
        <Link
          to="/zh/how-it-works"
          className="pm-auth-button hidden h-9 w-[110px] min-w-[110px] items-center justify-center gap-2 px-3 text-sm font-semibold whitespace-nowrap text-brand hover:bg-brand-softer md:inline-flex"
        >
          <CircleHelp aria-hidden="true" size={14} className="shrink-0" />
          <span className="shrink-0 whitespace-nowrap">玩法介绍</span>
        </Link>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="pm-auth-button inline-flex h-9 items-center justify-center px-3 text-sm font-semibold whitespace-nowrap text-brand hover:bg-brand-softer"
          >
            登陆
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="pm-auth-button inline-flex h-9 items-center justify-center bg-brand px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-brand-strong"
          >
            注册
          </button>
          <AccountMenu />
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <IconButton className="ml-auto md:hidden" aria-label="打开菜单">
              <Menu aria-hidden="true" size={20} />
            </IconButton>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
            <Dialog.Content className="fixed inset-x-3 top-3 z-50 animate-enter rounded-panel border border-border bg-surface p-4 shadow-popover">
              <div className="flex items-center justify-between">
                <Brand />
                <Dialog.Close asChild>
                  <IconButton aria-label="关闭菜单">
                    <X aria-hidden="true" size={20} />
                  </IconButton>
                </Dialog.Close>
              </div>
              <div className="mt-4">
                <SearchForm mobile onDone={() => setOpen(false)} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Dialog.Close asChild>
                  <Link
                    to="/account"
                    className="rounded-control px-3 py-3 text-center text-sm font-semibold text-brand hover:bg-brand-softer"
                  >
                    登陆
                  </Link>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Link
                    to="/account"
                    className="rounded-control bg-brand px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-strong"
                  >
                    注册
                  </Link>
                </Dialog.Close>
              </div>
              <nav className="mt-4 grid gap-1" aria-label="移动导航">
                {topicNav.slice(0, 10).map((topic) => (
                  <MobileLink key={topic.label} to={topic.to} onClick={() => setOpen(false)}>
                    {topic.label}
                  </MobileLink>
                ))}
                <MobileLink to="/account" onClick={() => setOpen(false)}>
                  账户
                </MobileLink>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <nav aria-label="市场主题" className="pm-shell pm-topic-row scrollbar-none">
        {topicNav.map((topic) => {
          return (
            <NavLink
              key={topic.label}
              to={topic.to}
              tone={topic.icon === 'worldCup' ? 'gold' : topic.icon === 'hot' ? 'strong' : 'muted'}
            >
              {topic.icon ? <TopicIcon kind={topic.icon} /> : null}
              {topic.label}
            </NavLink>
          );
        })}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-[9px] px-3 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
            >
              更多
              <ChevronDown aria-hidden="true" size={14} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-[100] min-w-40 rounded-card border border-border bg-surface p-1.5 shadow-popover"
            >
              {moreNav.map((item) => (
                <DropdownMenu.Item key={item.label} asChild>
                  <Link
                    to={item.to}
                    className="block rounded-control px-3 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted"
                  >
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </nav>
      <AuthDialog mode={authMode} onOpenChange={(nextOpen) => !nextOpen && setAuthMode(null)} />
    </header>
  );
}

function AuthDialog({
  mode,
  onOpenChange,
}: {
  mode: 'login' | 'register' | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={mode !== null} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[111] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-border bg-surface p-5 shadow-popover">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">
                {mode === 'register' ? '创建 ten-IQ 账户' : '登陆 ten-IQ'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted">
                当前连接到演示账户，不会收集或保存真实身份信息。
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton aria-label="关闭账户窗口">
                <X aria-hidden="true" size={18} />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className="mt-5 grid gap-3">
            {mode === 'register' ? <Input aria-label="用户名" placeholder="用户名" /> : null}
            <Input aria-label="邮箱" type="email" placeholder="邮箱地址" />
            <Dialog.Close asChild>
              <Link
                to="/account"
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                进入演示账户
              </Link>
            </Dialog.Close>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            真实认证、钱包和资金功能需完成独立安全与合规评审后接入。
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function TopicIcon({ kind }: { kind: NavIconKind }) {
  return (
    <span
      aria-hidden="true"
      className={kind === 'hot' ? 'pm-nav-hot-icon' : 'pm-nav-worldcup-icon'}
    />
  );
}
function NavLink({
  to,
  children,
  tone = 'muted',
}: {
  to: string;
  children: ReactNode;
  tone?: 'muted' | 'strong' | 'gold';
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[9px] px-2.5 text-sm font-semibold hover:bg-surface-muted hover:text-foreground',
        tone === 'gold' ? 'pm-nav-gold' : tone === 'strong' ? 'text-foreground' : 'text-muted',
      )}
    >
      {children}
    </Link>
  );
}
function MobileLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-control px-3 py-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
    >
      {children}
    </Link>
  );
}
