import { expect, test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
for (const [name, route] of [
  ['home', '/'],
  ['market detail', '/markets/2026-world-cup-winner'],
  ['predictions', '/zh/predictions'],
  ['sports', '/zh/sports/live'],
  ['account', '/account'],
] as const) {
  test(`${name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.getByRole('heading', { level: 1 }).waitFor();
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      includedImpacts: ['critical', 'serious'],
    });
  });
}

test('keyboard navigation exposes a visible skip link and restores dialog focus', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.getByRole('link', { name: '跳到主要内容' }).press('Enter');
  const trigger = testInfo.project.name.includes('mobile')
    ? page.getByRole('button', { name: '打开菜单' })
    : page.getByRole('button', { name: '登录' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
