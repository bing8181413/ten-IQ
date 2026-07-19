import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';
import { SiteFooter } from './SiteFooter';
import { TopNav } from './TopNav';
export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <TopNav />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
