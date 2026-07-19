import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';
import { SiteFooter } from './SiteFooter';
import { TopNav } from './TopNav';
export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas pb-20 text-foreground md:pb-0">
      <a
        href="#main-content"
        className="sr-only z-[200] rounded-control bg-surface px-4 py-3 text-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        跳到主要内容
      </a>
      <TopNav />
      <main id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
