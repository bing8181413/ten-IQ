import { expect, test } from '@playwright/test';

test('predictions route filters and searches markets', async ({ page }) => {
  await page.goto('/zh/predictions');
  await expect(page.getByRole('heading', { name: '热门预测与实时赔率' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(6);
  await page.getByRole('button', { name: '加载更多预测' }).click();
  await expect(page.getByRole('article')).toHaveCount(12);
  await page.getByRole('textbox', { name: '搜索预测' }).fill('比特币');
  await expect(page.getByText('比特币会在 2026 年底前突破 15 万美元吗？')).toBeVisible();
  await page.getByRole('textbox', { name: '搜索预测' }).fill('不存在的预测');
  await expect(page.getByText('没有符合条件的预测')).toBeVisible();
  await page.getByRole('button', { name: '清空筛选' }).last().click();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('stale scenario is visible and refreshable across core data pages', async ({ page }) => {
  for (const route of [
    '/?__scenario=stale',
    '/markets/2026-world-cup-winner?__scenario=stale',
    '/zh/sports/live?__scenario=stale',
    '/account?__scenario=stale',
    '/zh/leaderboard?__scenario=stale',
  ]) {
    await page.goto(route);
    await expect(page.getByText(/当前显示陈旧演示数据/)).toBeVisible();
    await expect(page.getByRole('button', { name: '刷新', exact: true })).toBeVisible();
  }
});

test('sports routes and selection controls work', async ({ page }) => {
  await page.goto('/zh/sports/live');
  await expect(page.getByRole('heading', { name: '体育实时' })).toBeVisible();
  await page.getByRole('button', { name: '远期' }).click();
  await expect(page).toHaveURL('/zh/sports/futures');
  await expect(page.getByText('Liberty', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '实时' }).click();
  await page.getByRole('button', { name: '世界杯' }).click();
  await expect(page.getByText('西班牙', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /ESP 60¢/ }).click();
  await expect(page.getByRole('button', { name: /ESP 60¢/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('体育联盟').getByRole('button', { name: '更多' }).click();
  await expect(page.getByRole('button', { name: '高尔夫' })).toBeVisible();
  await page.getByRole('button', { name: '预览盘口' }).click();
  await expect(page.getByText(/体育选择：spain-argentina:ESP 60¢/)).toBeVisible();
});

test('combo builder calculates and previews selected legs', async ({ page }) => {
  await page.goto('/zh/predictions/combine');
  await expect(page.getByRole('heading', { name: '将多个体育观点合并为一个组合' })).toBeVisible();
  await expect(page.getByText('32.4%')).toBeVisible();
  await page.getByRole('button', { name: 'D. Galan' }).click();
  await expect(page.getByText('17.8%')).toBeVisible();
  await page.getByLabel('演示金额').fill('25');
  await page.getByRole('button', { name: '预览组合' }).click();
  await expect(page.getByText(/组合 3 项（独立概率演示估算）/)).toBeVisible();
});

test('perps asset tabs, range and preview work', async ({ page }) => {
  await page.goto('/zh/asset/sp500');
  await expect(page.getByRole('heading', { name: 'SP500-USD', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /BTC-USD/ }).click();
  await expect(page).toHaveURL('/zh/asset/btc');
  await page.getByRole('button', { name: '4小时' }).click();
  await expect(page.getByRole('button', { name: '4小时' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '做空' }).click();
  await page.getByLabel('演示金额').fill('100');
  await page.getByRole('button', { name: '预览做空' }).click();
  await expect(page.getByText(/BTC-USD 做空意图/)).toBeVisible();
});

test('how it works and footer routes form a complete public loop', async ({ page }) => {
  await page.goto('/zh/how-it-works');
  await expect(page.getByRole('heading', { name: '预测市场如何工作' })).toBeVisible();
  await page.getByRole('button', { name: '组合与单个市场有什么区别？' }).click();
  await expect(page.getByText('组合要求每一项结果都成立')).toBeVisible();
  await page.getByRole('link', { name: '排行榜' }).click();
  await expect(page).toHaveURL('/zh/leaderboard');
  await expect(page.getByRole('heading', { name: '表现领先的演示账户' })).toBeVisible();
});

test('community pages expose working period controls', async ({ page }) => {
  await page.goto('/zh/accuracy');
  await expect(page.getByRole('heading', { name: '市场概率校准' })).toBeVisible();
  await expect(page.getByText('0.084')).toBeVisible();
  await page.getByRole('button', { name: '本月' }).click();
  await expect(page.getByRole('button', { name: '本月' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('0.079')).toBeVisible();
  await page.goto('/zh/activity');
  await expect(page.getByRole('heading', { name: '市场最新变化' })).toBeVisible();
});

test('topic routes show stable non-empty market lists', async ({ page }) => {
  for (const route of [
    '/zh/politics',
    '/zh/esports',
    '/zh/iran',
    '/zh/geopolitics',
    '/zh/weather',
    '/zh/elections',
  ]) {
    await page.goto(route);
    await expect(page.getByTestId('market-card').first()).toBeVisible();
    await expect(page.getByText('没有匹配的市场')).toHaveCount(0);
  }
});
