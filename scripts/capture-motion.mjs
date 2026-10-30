// Records the page-load sequence and the scroll reveals as frame strips, so
// motion can be reviewed as still images. Frames are sampled at fixed times
// after navigation; a filmstrip per phase is written to design/screens/motion/.
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
// PLAYWRIGHT_PATH points at any playwright install; CHROME_PATH at any
// Chromium build (default: the installed Chrome channel).
const pwPath = process.env.PLAYWRIGHT_PATH ?? '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const url = process.env.URL ?? 'http://localhost:3778/';
const out = 'design/screens/motion';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 720 } });

// Phase 1: load sequence. Sample the hero at these ms after navigation.
const loadTimes = [0, 200, 450, 700, 1000, 1400, 2200, 3200, 4200];
await page.goto(url, { waitUntil: 'commit' });
const t0 = Date.now();
for (const t of loadTimes) {
  const wait = t - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/load-${String(t).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: 1200, height: 720 } });
}

// Phase 2: scroll reveal of the Work section. Scroll it into view, sample.
await page.evaluate(() => document.querySelector('#work').scrollIntoView({ block: 'start', behavior: 'instant' }));
const revealTimes = [0, 150, 350, 600, 900, 1300];
const t1 = Date.now();
for (const t of revealTimes) {
  const wait = t - (Date.now() - t1);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/reveal-work-${String(t).padStart(4, '0')}.png` });
}

// Phase 3: languages reveal (rows stagger).
await page.evaluate(() => document.querySelector('#languages').scrollIntoView({ block: 'start', behavior: 'instant' }));
const t2 = Date.now();
for (const t of [0, 300, 600, 900, 1300]) {
  const wait = t - (Date.now() - t2);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/reveal-langs-${String(t).padStart(4, '0')}.png` });
}

// Phase 4: theme flip crossfade.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.click('.theme-toggle');
const t3 = Date.now();
for (const t of [0, 120, 240, 400, 600]) {
  const wait = t - (Date.now() - t3);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/theme-${String(t).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: 1200, height: 720 } });
}

await browser.close();
console.log('frames in', out);
