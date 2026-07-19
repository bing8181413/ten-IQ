import { expect, test } from '@playwright/test';
test('@visual @visual-desktop home visual contract', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('market-card').first().waitFor();
  await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true });
});
