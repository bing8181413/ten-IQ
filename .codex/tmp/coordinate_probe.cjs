const { chromium } = require('@playwright/test');

const url = process.argv[2] || 'https://polymarket.com/zh';
const outputPath = process.argv[3] || '/private/tmp/foretell-pixel-audit/coordinate-probe.json';

const points = {
  featureShellTopLeft: [72, 143],
  featureShellCenter: [520, 380],
  comboShellTopLeft: [1012, 144],
  comboShellCenter: [1190, 254],
  comboButton: [1190, 329],
  outcomeRed: [150, 262],
  outcomeDraw: [263, 262],
  outcomeYellow: [371, 262],
  spreadPrimary: [174, 374],
  totalPrimary: [174, 470],
  carouselPill: [708, 656],
  exploreButton: [1190, 656],
  marketCardTopLeft: [72, 806],
  marketCardCenter: [230, 890],
  yesPill: [309, 881],
  noPill: [353, 881],
};

function briefStyle(element) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    tag: element.tagName,
    id: element.id || '',
    className:
      typeof element.className === 'string' ? element.className : element.className?.baseVal || '',
    text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 140),
    rect: {
      x: Math.round(rect.x * 100) / 100,
      y: Math.round(rect.y * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
    },
    style: {
      display: style.display,
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
      overflow: style.overflow,
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

  const result = await page.evaluate((probePoints) => {
    function briefStyle(element) {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        tag: element.tagName,
        id: element.id || '',
        className:
          typeof element.className === 'string'
            ? element.className
            : element.className?.baseVal || '',
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 140),
        rect: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        },
        style: {
          display: style.display,
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
          overflow: style.overflow,
        },
      };
    }

    const data = {};
    for (const [name, [x, y]] of Object.entries(probePoints)) {
      const element = document.elementFromPoint(x, y);
      const chain = [];
      let current = element;
      while (current && current !== document.body && chain.length < 10) {
        chain.push(briefStyle(current));
        current = current.parentElement;
      }
      data[name] = { point: { x, y }, chain };
    }
    return data;
  }, points);

  require('fs').writeFileSync(
    outputPath,
    JSON.stringify({ url, capturedAt: new Date().toISOString(), points: result }, null, 2),
  );
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
