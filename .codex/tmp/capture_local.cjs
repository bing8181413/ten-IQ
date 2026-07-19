const { chromium } = require('@playwright/test');

async function captureLocal() {
  const outputPath = process.argv[2] || '/private/tmp/foretell-pixel-audit/local-5175-pass54.png';
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

  await page.goto('http://127.0.0.1:5175/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });

  await browser.close();
}

captureLocal().catch((error) => {
  console.error(error);
  process.exit(1);
});
