import { expect, test } from '@playwright/test';
import path from 'node:path';

test.describe.configure({ mode: 'serial' });

const evidenceDirectory = path.resolve(
  '.agent/tasks/20260720-0131-full-reference-parity-mock-backend-and-acceptance/evidence',
);

test('@visual @visual-desktop home visual contract', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('market-card').first().waitFor();
  await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true });
});

test('@visual @visual-desktop exact viewport evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/zh');
  await page.getByTestId('market-card').first().waitFor();
  expect(page.viewportSize()).toEqual({ width: 1440, height: 1000 });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'local-home-1440x1000-round4.png'),
    fullPage: false,
    animations: 'disabled',
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/zh');
  await page.getByTestId('market-card').first().waitFor();
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'local-home-390x844-round4.png'),
    fullPage: false,
    animations: 'disabled',
  });
});

test('@visual @visual-desktop core route and state matrix', async ({ page }) => {
  test.setTimeout(90_000);
  const states = [
    { name: 'detail', url: '/zh/event/2026-world-cup-winner', ready: '市场规则' },
    { name: 'sports', url: '/zh/sports/live', ready: '体育' },
    { name: 'account', url: '/account', ready: 'ten-IQ' },
    { name: 'stale', url: '/?__scenario=stale', ready: '当前显示陈旧演示数据' },
    { name: 'error', url: '/?__scenario=server-error', ready: '市场数据加载失败' },
  ];
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const state of states) {
      await page.goto(state.url);
      await page.getByText(state.ready, { exact: false }).first().waitFor();
      const artifactName = `local-${state.name}-${viewport.width}x${viewport.height}-round4.png`;
      await page.screenshot({
        path: path.join(evidenceDirectory, artifactName),
        fullPage: false,
        animations: 'disabled',
      });
      await expect(page).toHaveScreenshot(`${state.name}-${viewport.name}.png`, {
        fullPage: false,
      });
    }
  }
});
