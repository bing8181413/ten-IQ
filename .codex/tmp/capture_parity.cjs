const { chromium } = require('@playwright/test');

async function capture() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  const page = await context.newPage();

  await page.goto('https://polymarket.com/zh', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: '/private/tmp/foretell-pixel-audit/target-current-pass54.png',
    fullPage: false,
  });

  await page.goto('http://127.0.0.1:5175/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: '/private/tmp/foretell-pixel-audit/local-5175-pass54-before.png',
    fullPage: false,
  });

  await browser.close();
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
