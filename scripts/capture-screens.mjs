import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pwPath = '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const url = 'http://localhost:3777/';
const outDir = 'design/screens/review';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const vp of viewports) {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('theme', t); } catch {}
    }, theme);
    await page.waitForTimeout(500);
    const file = `${outDir}/${vp.name}-${theme}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('saved', file);
    await page.close();
  }
}
await browser.close();
