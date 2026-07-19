const fs = require('fs');
const { chromium } = require('@playwright/test');

const points = [
  { name: 'feature.card', x: 75, y: 146 },
  { name: 'feature.upButton', x: 125, y: 260 },
  { name: 'feature.downButton', x: 310, y: 260 },
  { name: 'feature.icon', x: 116, y: 190 },
  { name: 'feature.chartArea', x: 470, y: 250 },
  { name: 'feature.targetBadge', x: 910, y: 360 },
  { name: 'combo.card', x: 1014, y: 146 },
  { name: 'combo.start', x: 1040, y: 330 },
  { name: 'exploreAll', x: 1030, y: 656 },
  { name: 'market.card1', x: 75, y: 810 },
  { name: 'market.card2', x: 405, y: 810 },
  { name: 'market.card3', x: 735, y: 810 },
  { name: 'market.card4', x: 1065, y: 810 },
  { name: 'market.yesPill', x: 306, y: 881 },
  { name: 'market.noPill', x: 353, y: 881 },
  { name: 'search.input', x: 270, y: 36 },
  { name: 'signup.button', x: 1295, y: 36 },
];

function readNode(node, depth) {
  const cs = getComputedStyle(node);
  const r = node.getBoundingClientRect();
  return {
    depth,
    tag: node.tagName.toLowerCase(),
    className: typeof node.className === 'string' ? node.className.slice(0, 180) : '',
    text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    rect: {
      x: Math.round(r.x * 10) / 10,
      y: Math.round(r.y * 10) / 10,
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
    },
    style: {
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow,
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      overflow: cs.overflow,
    },
  };
}

async function probe(page, url, label) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(2000);
  return await page.evaluate(
    ({ points, label }) => {
      return points.map((point) => {
        const node = document.elementFromPoint(point.x, point.y);
        const chain = [];
        let current = node;
        let depth = 0;
        while (current && depth < 9) {
          chain.push(readNode(current, depth));
          current = current.parentElement;
          depth += 1;
        }
        return { ...point, page: label, chain };
      });
      function readNode(node, depth) {
        const cs = getComputedStyle(node);
        const r = node.getBoundingClientRect();
        return {
          depth,
          tag: node.tagName.toLowerCase(),
          className: typeof node.className === 'string' ? node.className.slice(0, 180) : '',
          text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
          rect: {
            x: Math.round(r.x * 10) / 10,
            y: Math.round(r.y * 10) / 10,
            w: Math.round(r.width * 10) / 10,
            h: Math.round(r.height * 10) / 10,
          },
          style: {
            backgroundColor: cs.backgroundColor,
            backgroundImage: cs.backgroundImage,
            border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
            borderRadius: cs.borderRadius,
            boxShadow: cs.boxShadow,
            padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
            color: cs.color,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight,
            overflow: cs.overflow,
          },
        };
      }
    },
    { points, label },
  );
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'media' || type === 'font') return route.abort();
    return route.continue();
  });
  const target = await probe(page, 'https://polymarket.com/zh', 'target');
  const local = await probe(page, 'http://127.0.0.1:5175/', 'local');
  const out = { target, local };
  fs.writeFileSync(
    '/private/tmp/foretell-pixel-audit/point-probe.json',
    JSON.stringify(out, null, 2),
  );
  console.log('/private/tmp/foretell-pixel-audit/point-probe.json');
  await browser.close();
})();
