const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = '/private/tmp/foretell-pixel-audit';
fs.mkdirSync(outDir, { recursive: true });

function slug(value) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function styleOf(locator, name) {
  const count = await locator.count();
  if (!count) return { name, found: false };
  const element = locator.first();
  await element.scrollIntoViewIfNeeded().catch(() => {});
  return await element.evaluate((node, label) => {
    const cs = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      name: label,
      found: true,
      tag: node.tagName.toLowerCase(),
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      rect: {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        w: Math.round(rect.width * 10) / 10,
        h: Math.round(rect.height * 10) / 10,
      },
      style: {
        display: cs.display,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        backgroundImage: cs.backgroundImage,
        border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        margin: `${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
        gap: cs.gap,
      },
    };
  }, name);
}

async function cardWithText(page, text) {
  const textLocator = page.getByText(text, { exact: false }).first();
  const candidates = [
    textLocator.locator('xpath=ancestor::*[@role="article"][1]'),
    textLocator.locator('xpath=ancestor::*[contains(@class,"card") or contains(@class,"Card")][1]'),
    textLocator.locator('xpath=ancestor::article[1]'),
    textLocator.locator('xpath=ancestor::div[.//button or .//a][3]'),
  ];
  for (const candidate of candidates) {
    if (await candidate.count()) return candidate;
  }
  return textLocator;
}

async function collect(page, name, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, `${slug(name)}.png`), fullPage: false });

  const featureCard = await cardWithText(page, 'Portugal vs. Uzbekistan');
  const comboCard = await cardWithText(page, '创建世界杯组合');
  const championCard = await cardWithText(page, '世界杯冠军');
  const btcCard = await cardWithText(page, '比特币上涨或下跌5个月');
  const promoCard = await cardWithText(page, '世界杯 价格与预测');
  const iranCard = await cardWithText(page, '美国-伊朗');

  const result = {
    name,
    url,
    viewport: page.viewportSize(),
    screenshot: path.join(outDir, `${slug(name)}.png`),
    elements: [
      await styleOf(page.locator('header').first(), 'header'),
      await styleOf(page.locator('input[placeholder*="搜索"]').first(), 'search input'),
      await styleOf(
        page
          .getByText('玩法介绍', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]'),
        'help button',
      ),
      await styleOf(
        page
          .getByText('登录', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]'),
        'login button',
      ),
      await styleOf(
        page
          .getByText('注册', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]'),
        'signup button',
      ),
      await styleOf(
        page
          .getByText('热门', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]')
          .first(),
        'topic nav hot',
      ),
      await styleOf(featureCard, 'featured card'),
      await styleOf(
        page.getByRole('button', { name: 'Portugal', exact: true }).first(),
        'featured red tab',
      ),
      await styleOf(
        page.getByRole('button', { name: '平局', exact: true }).first(),
        'featured neutral tab',
      ),
      await styleOf(
        page.getByRole('button', { name: 'Uzbekistan', exact: true }).first(),
        'featured blue tab',
      ),
      await styleOf(
        page
          .getByText('PRT -4.5', { exact: true })
          .locator('xpath=ancestor::*[self::button or self::div][1]')
          .first(),
        'spread button left',
      ),
      await styleOf(
        page
          .getByText('UZB +4.5', { exact: true })
          .locator('xpath=ancestor::*[self::button or self::div][1]')
          .first(),
        'spread button right',
      ),
      await styleOf(comboCard, 'combo card'),
      await styleOf(
        page
          .getByText('开始', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]')
          .first(),
        'combo start button',
      ),
      await styleOf(
        page.getByText('热门话题', { exact: true }).locator('xpath=ancestor::*[1]').first(),
        'hot topics heading',
      ),
      await styleOf(
        page
          .getByText('探索全部', { exact: true })
          .locator('xpath=ancestor::*[self::a or self::button][1]')
          .first(),
        'explore all button',
      ),
      await styleOf(page.getByText('所有盘口', { exact: true }).first(), 'all markets heading'),
      await styleOf(page.getByRole('button', { name: '全部', exact: true }).first(), 'all chip'),
      await styleOf(championCard, 'world cup card'),
      await styleOf(btcCard, 'btc card'),
      await styleOf(promoCard, 'promo card'),
      await styleOf(iranCard, 'iran card'),
      await styleOf(
        page
          .getByText('是.', { exact: true })
          .locator('xpath=ancestor::*[self::span or self::button][1]')
          .first(),
        'yes pill',
      ),
      await styleOf(
        page
          .getByText('否.', { exact: true })
          .locator('xpath=ancestor::*[self::span or self::button][1]')
          .first(),
        'no pill',
      ),
    ],
  };

  fs.writeFileSync(path.join(outDir, `${slug(name)}.json`), JSON.stringify(result, null, 2));
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  });
  const targetPage = await context.newPage();
  const localPage = await context.newPage();
  const target = await collect(targetPage, 'target-polymarket-zh', 'https://polymarket.com/zh');
  const local = await collect(localPage, 'local-foretell', 'http://127.0.0.1:5175/');
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ target, local }, null, 2));
  await browser.close();
  console.log(
    JSON.stringify({ outDir, target: target.screenshot, local: local.screenshot }, null, 2),
  );
})();
