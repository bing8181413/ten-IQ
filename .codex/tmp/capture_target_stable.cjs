const { chromium } = require('@playwright/test');

async function captureTarget() {
  const outputPath =
    process.argv[2] || '/private/tmp/foretell-pixel-audit/target-current-stable.png';
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  await page.goto('https://polymarket.com/zh', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(6500);
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    timeout: 90000,
    animations: 'disabled',
  });

  await browser.close();
}

captureTarget().catch((error) => {
  console.error(error);
  process.exit(1);
});
