import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// PLAYWRIGHT_PATH points at any playwright install; CHROME_PATH at any
// Chromium build (default: the installed Chrome channel).
const pwPath = process.env.PLAYWRIGHT_PATH ?? '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const url = process.env.URL ?? 'http://localhost:3777/';
const outDir = 'design/screens/review';

const routes = [
  // The hero pair is a coin flip per visit, so pin it here: review shots
  // should differ because the design changed, not because of the flip.
  { name: 'front', path: '?hero=elemental' },
  { name: 'work', path: 'work/' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : { channel: 'chrome' });
for (const route of routes) {
  for (const vp of viewports) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(new URL(route.path, url).href, { waitUntil: 'networkidle' });
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
        try { localStorage.setItem('theme', t); } catch {}
        // Open any folded figures so the capture shows them.
        document.querySelectorAll('details').forEach((d) => { d.open = true; });
      }, theme);
      // Walk the page once so every section's reveal fires, then return
      // to the top; a full-page capture does not scroll by itself.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(4500);
      const file = `${outDir}/${route.name}-${vp.name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', file);
      await page.close();
    }
  }
}
await browser.close();
