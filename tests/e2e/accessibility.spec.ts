import { test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
test('home has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('market-card').first().waitFor();
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    includedImpacts: ['critical', 'serious'],
  });
});
