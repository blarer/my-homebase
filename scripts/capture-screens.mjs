import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// PLAYWRIGHT_PATH points at any playwright install; CHROME_PATH at any
// Chromium build (default: the installed Chrome channel).
const pwPath = process.env.PLAYWRIGHT_PATH ?? 'playwright';
const { chromium } = require(pwPath);

const url = process.env.URL ?? 'http://127.0.0.1:3778/';
const outDir = process.env.OUT_DIR ?? 'design/screens/review';

const routes = [
  { name: 'front', path: '' },
  { name: 'work', path: 'work/' },
  { name: '404', path: 'no-such-page/' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
    : { channel: 'chrome' },
);
for (const route of routes) {
  for (const vp of viewports) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
      // The stored choice is read before first paint, so set it before load.
      await context.addInitScript((t) => {
        try { localStorage.setItem('theme', t); } catch {}
      }, theme);
      const page = await context.newPage();
      await page.goto(new URL(route.path, url).href, { waitUntil: 'networkidle' });
      // Open every folded figure so the capture shows the races. Clicked in
      // the page (no actionability waits) and only Collapsible triggers.
      await page.evaluate(() => {
        document
          .querySelectorAll('.astryx-collapsible-trigger[aria-expanded="false"]')
          .forEach((t) => t.click());
      });
      await page.waitForTimeout(3200);
      // A full-page capture stitches scrolled frames; return to the top so
      // the sticky top nav sits where it belongs.
      await page.evaluate(() => scrollTo(0, 0));
      const file = `${outDir}/${route.name}-${vp.name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', file);
      await context.close();
    }
  }
}
await browser.close();
