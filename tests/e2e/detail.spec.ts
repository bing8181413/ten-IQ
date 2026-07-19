import { expect, test } from '@playwright/test';
test('market detail exposes rules and trade preview', async ({ page }) => {
  await page.goto('/markets/bitcoin-above-150k-2026');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('比特币会在 2026 年底前', {
    timeout: 10000,
  });
  await expect(page.getByRole('button', { name: '预览交易' })).toBeVisible();
  await page.getByRole('button', { name: '1小时' }).click();
  await expect(page.getByRole('button', { name: '1小时' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '预览交易' }).click();
  await expect(page.getByText('演示订单已生成，不会提交资金或真实订单。')).toBeVisible();
  await page.getByRole('tab', { name: '规则' }).click();
  await expect(page.getByRole('heading', { name: '结算规则' })).toBeVisible();
});

test('reference-style event route resolves to the same market', async ({ page }) => {
  await page.goto('/zh/event/world-cup-winner');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('谁会赢得 2026 世界杯？');
  await expect(page.getByRole('region', { name: '概率走势' })).toBeVisible();
  await expect(page.getByRole('region', { name: '市场结果' })).toBeVisible();
});
