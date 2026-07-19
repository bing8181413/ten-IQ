const { chromium } = require('@playwright/test');

const targetUrl = process.argv[2] || 'https://polymarket.com/zh';
const outputPath = process.argv[3] || '/private/tmp/foretell-pixel-audit/style-probe.json';

const selectors = {
  header: 'header',
  search:
    'form[role="search"] input, input[placeholder*="polymarkets"], input[placeholder*="markets"]',
  help: 'a:has-text("玩法介绍")',
  login: 'a:has-text("登录"), button:has-text("登录")',
  register: 'button:has-text("注册")',
  featureCard:
    'main section article, main section [data-testid="market-card"], main section > div > div:first-child',
  comboCard: 'a:has-text("开始"), text=创建世界杯组合',
  comboButton: 'a:has-text("开始"), button:has-text("开始")',
  outcomeRed: 'button:has-text("England")',
  outcomeDraw: 'button:has-text("平局")',
  outcomeYellow: 'button:has-text("Ghana")',
  spreadButton: 'button:has-text("ENG")',
  totalButton: 'button:has-text("O 2.5")',
  carouselPill: 'button:has-text("Golden Boot")',
  exploreButton: 'a:has-text("探索全部"), button:has-text("探索全部")',
  marketCard: '[data-testid="market-card"]',
  yesPill: 'text=是',
  noPill: 'text=否',
};

function elementData(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    tag: element.tagName,
    text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160),
    rect: {
      x: Math.round(rect.x * 100) / 100,
      y: Math.round(rect.y * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
    },
    style: {
      background: style.background,
      backgroundColor: style.backgroundColor,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      padding: style.padding,
      margin: style.margin,
    },
  };
}

async function queryOne(page, selector) {
  try {
    const locator = page.locator(selector).first();
    const count = await locator.count();
    if (!count) return null;
    return await locator.evaluate(elementData);
  } catch (error) {
    return { error: error.message };
  }
}

async function run() {
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
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(targetUrl.includes('polymarket') ? 5000 : 1200);

  const data = {
    url: targetUrl,
    capturedAt: new Date().toISOString(),
    items: {},
  };
  for (const [name, selector] of Object.entries(selectors)) {
    data.items[name] = await queryOne(page, selector);
  }

  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
