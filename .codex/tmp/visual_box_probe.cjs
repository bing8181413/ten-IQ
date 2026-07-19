const { chromium } = require('@playwright/test');
const fs = require('fs');

const url = process.argv[2] || 'https://polymarket.com/zh';
const outputPath = process.argv[3] || '/private/tmp/foretell-pixel-audit/visual-box-probe.json';
const screenshotPath = process.argv[4] || '/private/tmp/foretell-pixel-audit/visual-box-probe.png';

const points = {
  featureCard: [74, 145],
  featureCenter: [520, 380],
  firstOutcome: [88, 178],
  drawOutcome: [188, 178],
  thirdOutcome: [282, 178],
  spreadHeader: [263, 189],
  spreadButtonLeft: [88, 234],
  spreadButtonRight: [265, 234],
  chartSurface: [602, 308],
  comboCard: [1012, 145],
  comboTopGlowLeft: [1046, 162],
  comboTopGlowCenter: [1190, 164],
  comboTopGlowRight: [1332, 164],
  comboButton: [1040, 330],
  topicRow: [1030, 444],
  marketCard: [74, 806],
  marketCardHeader: [92, 834],
  marketPillYes: [227, 884],
  marketPillNo: [274, 884],
  promoCard: [730, 806],
};

const selectors = {
  searchInput: 'form[role="search"] input',
  helpButton: 'a:has-text("玩法介绍"), button:has-text("玩法介绍")',
  loginButton: 'a:has-text("登录"), button:has-text("登录")',
  registerButton: 'button:has-text("注册")',
  comboButton: 'a:has-text("开始"), button:has-text("开始")',
  exploreButton: 'a:has-text("探索全部"), button:has-text("探索全部")',
  allMarketsHeading: 'text=所有盘口',
};

function round(value) {
  return Math.round(value * 100) / 100;
}

function styleSummary(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    tag: element.tagName,
    className:
      typeof element.className === 'string' ? element.className : element.className?.baseVal || '',
    text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 180),
    rect: {
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
    },
    style: {
      background: style.background,
      backgroundColor: style.backgroundColor,
      border: style.border,
      borderColor: style.borderColor,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      color: style.color,
      display: style.display,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      margin: style.margin,
      opacity: style.opacity,
      overflow: style.overflow,
      padding: style.padding,
    },
  };
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
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(url.includes('polymarket') ? 5000 : 1200);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const selectorData = {};
  for (const [name, selector] of Object.entries(selectors)) {
    try {
      const locator = page.locator(selector).first();
      const count = await locator.count();
      if (!count) {
        selectorData[name] = null;
      } else {
        selectorData[name] = await locator.evaluate((element) => {
          function round(value) {
            return Math.round(value * 100) / 100;
          }
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            tag: element.tagName,
            className:
              typeof element.className === 'string'
                ? element.className
                : element.className?.baseVal || '',
            text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 180),
            rect: {
              x: round(rect.x),
              y: round(rect.y),
              width: round(rect.width),
              height: round(rect.height),
            },
            style: {
              background: style.background,
              backgroundColor: style.backgroundColor,
              border: style.border,
              borderColor: style.borderColor,
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              color: style.color,
              display: style.display,
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeight: style.lineHeight,
              margin: style.margin,
              opacity: style.opacity,
              overflow: style.overflow,
              padding: style.padding,
            },
          };
        });
      }
    } catch (error) {
      selectorData[name] = { error: error.message };
    }
  }

  const pointData = await page.evaluate(
    ({ probePoints }) => {
      function round(value) {
        return Math.round(value * 100) / 100;
      }

      function styleSummary(element) {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          className:
            typeof element.className === 'string'
              ? element.className
              : element.className?.baseVal || '',
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 180),
          rect: {
            x: round(rect.x),
            y: round(rect.y),
            width: round(rect.width),
            height: round(rect.height),
          },
          style: {
            background: style.background,
            backgroundColor: style.backgroundColor,
            border: style.border,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            color: style.color,
            display: style.display,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            margin: style.margin,
            opacity: style.opacity,
            overflow: style.overflow,
            padding: style.padding,
          },
        };
      }

      const result = {};
      for (const [name, point] of Object.entries(probePoints)) {
        const [x, y] = point;
        const chain = [];
        let current = document.elementFromPoint(x, y);
        while (current && current !== document.body && chain.length < 8) {
          chain.push(styleSummary(current));
          current = current.parentElement;
        }
        result[name] = { point: { x, y }, chain };
      }
      return result;
    },
    { probePoints: points },
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        url,
        capturedAt: new Date().toISOString(),
        screenshotPath,
        selectors: selectorData,
        points: pointData,
      },
      null,
      2,
    ),
  );

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
