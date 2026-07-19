import { expect, test } from '@playwright/test';
test('home market discovery works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('market-card').first()).toBeVisible();
  await page.getByRole('button', { name: '特朗普', exact: true }).click();
  await expect(page.getByRole('button', { name: '特朗普', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('没有匹配的市场')).toBeVisible();
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await expect(page.getByTestId('market-card').first()).toBeVisible();
});

test('home search and sort controls update visible state and URL', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('market-card').first().waitFor();
  await page.getByRole('button', { name: '搜索所有盘口' }).click();
  await page.getByRole('textbox', { name: '搜索所有盘口' }).fill('比特币');
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await expect(page).toHaveURL(/q=%E6%AF%94%E7%89%B9%E5%B8%81/);
  await expect(
    page.getByRole('link', { name: '比特币会在 2026 年底前突破 15 万美元吗？' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '筛选盘口' }).click();
  await page.getByRole('button', { name: '交易量' }).click();
  await expect(page.getByRole('button', { name: '交易量' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('featured and showcase market buttons produce state or navigation', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'desktop featured controls');
  await page.goto('/');
  const featured = page.locator('.pm-feature-card');
  await featured.getByRole('link', { name: /ESP 60¢/ }).click();
  await expect(page).toHaveURL('/zh/sports/live');
});

test('desktop account menu exposes personal center actions', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'desktop account control');
  await page.goto('/');
  await page.getByRole('button', { name: '登录' }).click();
  await page.getByRole('button', { name: '继续使用本地演示身份' }).click();
  await page.getByRole('button', { name: '打开个人中心' }).click();
  await expect(page.getByRole('menu', { name: '打开个人中心' })).toBeVisible();
  await expect(page.getByRole('link', { name: /个人主页/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /安全设置/ })).toBeVisible();
});

test('watchlist stays consistent from home to account', async ({ page }) => {
  await page.goto('/');
  const card = page
    .getByTestId('market-card')
    .filter({ hasText: '2026 年会刷新全球平均气温纪录吗？' });
  await card.getByRole('button', { name: /收藏/ }).click();
  await page.getByRole('link', { name: '个人中心' }).last().click();
  await expect(page).toHaveURL('/account');
  await expect(page.getByText('2026 年会刷新全球平均气温纪录吗？')).toBeVisible();
  await expect(page.getByText('4', { exact: true })).toBeVisible();
});

test('mobile navigation opens and reaches account', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile navigation control');
  await page.goto('/');
  await page.getByRole('button', { name: '打开菜单' }).click();
  await expect(page.getByRole('navigation', { name: '移动导航' })).toBeVisible();
  await page.getByRole('link', { name: '账户', exact: true }).click();
  await expect(page).toHaveURL('/account');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ten-IQ');
});

test('home renders a legitimate empty collection state', async ({ page }) => {
  await page.goto('/?__scenario=empty');
  await expect(page.getByText('没有匹配的市场')).toBeVisible();
  await expect(page.getByTestId('market-card')).toHaveCount(0);
});

for (const scenario of ['server-error', 'rate-limit', 'malformed'] as const) {
  test(`home exposes the ${scenario} failure state`, async ({ page }) => {
    await page.goto(`/?__scenario=${scenario}`);
    await expect(page.getByRole('alert').filter({ hasText: '市场数据加载失败' })).toBeVisible();
    await expect(page.getByRole('button', { name: '重新加载' })).toBeVisible();
  });
}

test('fail-first recovers through the configured query retry', async ({ page }) => {
  await page.goto('/?__scenario=fail-first');
  await expect(page.getByTestId('market-card').first()).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: '市场数据加载失败' })).toHaveCount(0);
});
