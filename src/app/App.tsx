import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';
const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const MarketDetailPage = lazy(() =>
  import('@/pages/MarketDetailPage').then((module) => ({ default: module.MarketDetailPage })),
);
const AccountPage = lazy(() =>
  import('@/pages/AccountPage').then((module) => ({ default: module.AccountPage })),
);
const SportsPage = lazy(() =>
  import('@/pages/SportsPage').then((module) => ({ default: module.SportsPage })),
);
const PredictionsPage = lazy(() =>
  import('@/pages/PredictionsPage').then((module) => ({ default: module.PredictionsPage })),
);
const CombosPage = lazy(() =>
  import('@/pages/CombosPage').then((module) => ({ default: module.CombosPage })),
);
const PerpsPage = lazy(() =>
  import('@/pages/PerpsPage').then((module) => ({ default: module.PerpsPage })),
);
const HowItWorksPage = lazy(() =>
  import('@/pages/HowItWorksPage').then((module) => ({ default: module.HowItWorksPage })),
);
const CommunityPage = lazy(() =>
  import('@/pages/CommunityPage').then((module) => ({ default: module.CommunityPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);
function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-4 py-8 sm:px-6">
      <Skeleton className="h-10 w-60" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/zh', element: <HomePage /> },
      { path: '/zh/predictions', element: <PredictionsPage /> },
      { path: '/zh/predictions/combine', element: <CombosPage /> },
      { path: '/zh/combo', element: <CombosPage /> },
      { path: '/zh/combos', element: <CombosPage /> },
      { path: '/zh/sports', element: <SportsPage /> },
      { path: '/zh/sports/live', element: <SportsPage /> },
      { path: '/zh/sports/futures', element: <SportsPage /> },
      { path: '/zh/asset/:symbol', element: <PerpsPage /> },
      { path: '/zh/how-it-works', element: <HowItWorksPage /> },
      { path: '/zh/leaderboard', element: <CommunityPage view="leaderboard" /> },
      { path: '/zh/accuracy', element: <CommunityPage view="accuracy" /> },
      { path: '/zh/activity', element: <CommunityPage view="activity" /> },
      { path: '/zh/:section/:subsection', element: <HomePage /> },
      { path: '/zh/:section', element: <HomePage /> },
      { path: '/markets/:slug', element: <MarketDetailPage /> },
      { path: '/zh/event/:slug', element: <MarketDetailPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/zh/account', element: <AccountPage /> },
      { path: '/zh/portfolio', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
