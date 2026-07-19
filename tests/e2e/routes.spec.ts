import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/zh',
  '/zh/sports/world-cup',
  '/zh/breaking',
  '/zh/politics',
  '/zh/crypto',
  '/zh/esports',
  '/zh/iran',
  '/zh/finance',
  '/zh/geopolitics',
  '/zh/tech',
  '/zh/pop-culture',
  '/zh/economy',
  '/zh/weather',
  '/zh/mentions',
  '/zh/elections',
  '/zh/pop-culture/art',
  '/zh/predictions',
  '/zh/predictions/combine',
  '/zh/sports/live',
  '/zh/sports/futures',
  '/zh/asset/sp500',
  '/zh/asset/btc',
  '/zh/asset/eth',
  '/zh/asset/sol',
  '/zh/how-it-works',
  '/zh/leaderboard',
  '/zh/accuracy',
  '/zh/activity',
  '/account',
  '/zh/account',
  '/zh/portfolio',
  '/markets/2026-world-cup-winner',
  '/markets/bitcoin-above-150k-2026',
  '/markets/open-model-top-benchmark-2026',
  '/markets/mars-cargo-launch-before-2028',
  '/markets/global-rate-cuts-q4-2026',
  '/markets/major-game-release-on-time',
  '/markets/ev-global-share-2027',
  '/markets/film-billion-box-office-2026',
  '/markets/global-election-turnout-2026',
  '/markets/esports-world-final-2026',
  '/markets/iran-framework-deal-2026',
  '/markets/global-temperature-record-2026',
  '/zh/event/world-cup-winner',
];

test('all public routes render without a 404 or page error', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  test.skip(
    testInfo.project.name.includes('mobile'),
    'desktop route inventory; mobile flows have dedicated coverage',
  );
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: '页面不存在' })).toHaveCount(0);
  }

  expect(pageErrors).toEqual([]);
});

test('unknown zh routes render the explicit not-found page', async ({ page }) => {
  await page.goto('/zh/not-a-real-market-section');
  await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible();
});
