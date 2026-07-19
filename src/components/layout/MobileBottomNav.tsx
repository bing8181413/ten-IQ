import { Link, useLocation } from 'react-router-dom';
import { Activity, CircleUserRound, House, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
const items = [
  { to: '/', label: '首页', icon: House },
  { to: '/zh/sports/live', label: '实时', icon: Activity },
  { to: '/zh/predictions', label: '搜索', icon: Search },
  { to: '/account', label: '账户', icon: CircleUserRound },
];
export function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-sticky md:hidden"
      aria-label="底部导航"
    >
      {items.map(({ to, label, icon: Icon }) => {
        const active =
          to === '/'
            ? location.pathname === '/' && !location.search
            : location.pathname === to || location.pathname.startsWith(`${to}/`);
        return (
          <Link
            key={label}
            to={to}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-control text-[11px] font-medium',
              active ? 'text-brand' : 'text-muted',
            )}
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
