import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pwPath = '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const url = process.env.URL ?? 'http://localhost:3778/';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const res = await page.goto(url, { waitUntil: 'networkidle' });
check('page 200', res.status() === 200, String(res.status()));

// 1. Hero renamed to JL
const h1 = await page.textContent('h1.hero-name');
check('hero h1 is JL', h1?.trim() === 'JL', JSON.stringify(h1));

// 2. Fonts: Old Standard on headings/prose, Courier Prime on data. Check
//    the resolved family AND that the loaded font actually rendered.
const fam = (sel) =>
  page.$eval(sel, (el) => getComputedStyle(el).fontFamily);
const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded');
  return [...new Set(loaded.map((f) => f.family))];
});
check('Old Standard loaded', fonts.some((f) => /Old_Standard|Old Standard/.test(f)), fonts.join(', '));
check('Courier Prime loaded', fonts.some((f) => /Courier_Prime|Courier Prime/.test(f)), fonts.join(', '));
check('no Space Mono / Instrument / Archivo / Plex', !fonts.some((f) => /Space|Instrument|Archivo|Plex/.test(f)), fonts.join(', '));
check('h1 family serif var', /old-serif|Old/.test(await fam('h1.hero-name')), await fam('h1.hero-name'));
check('.num family typewriter var', /typewriter|Courier/.test(await fam('.num')), await fam('.num'));
check('.tag family typewriter var', /typewriter|Courier/.test(await fam('.tag')), await fam('.tag'));
check('body prose family serif', /old-serif|Old/.test(await fam('.about-body')), await fam('.about-body'));

// 3. Palette: flat paper, no grid, accent colours.
const bodyBg = await page.$eval('body', (el) => getComputedStyle(el).backgroundImage);
check('body has no grid background', bodyBg === 'none', bodyBg);
const bodyBefore = await page.$eval('body', (el) => getComputedStyle(el, '::before').content);
check('no grain pseudo-element', bodyBefore === 'none', bodyBefore);
const lightPaper = await page.$eval('html', (el) => getComputedStyle(el).backgroundColor);
check('light paper #f3f1ec', lightPaper === 'rgb(243, 241, 236)', lightPaper);
const accent = await page.$eval('html', (el) => getComputedStyle(el).getPropertyValue('--accent').trim());
check('light accent #23408e', accent === '#23408e', accent);

// 4. Figure labels
const tags = await page.$$eval('.section-head .tag', (els) => els.map((e) => e.textContent.trim()));
check('Fig. 1 / Fig. 2 / Notes', tags[0]?.startsWith('Fig. 1') && tags[1]?.startsWith('Fig. 2') && tags[2]?.startsWith('Notes'), tags.join(' | '));

// 5. Time axis exists and aligns with lane tracks (same left edge)
const axisBox = await page.$eval('.race-axis-track', (el) => el.getBoundingClientRect().left);
const laneBox = await page.$eval('.lane-track', (el) => el.getBoundingClientRect().left);
check('axis aligns with lane track', Math.abs(axisBox - laneBox) < 1, `${axisBox} vs ${laneBox}`);

// 6. Hero name not clipped at left edge: glyph box must be inside the shell.
const clip = await page.$eval('h1.hero-name', (el) => {
  const shell = el.closest('.shell').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { h1Left: r.left, shellLeft: shell.left, padding: parseFloat(getComputedStyle(el.closest('.shell')).paddingLeft) };
});
check('hero name inside shell padding', clip.h1Left >= clip.shellLeft, JSON.stringify(clip));

// 7. Theme toggle: click switches to dark, labels read Lamplight, palette flips.
await page.click('.theme-toggle');
await page.waitForTimeout(400);
const theme = await page.$eval('html', (el) => el.dataset.theme);
check('toggle → dark', theme === 'dark', theme);
const label = await page.textContent('.theme-toggle-label');
check('label reads Lamplight', label?.trim() === 'Lamplight', JSON.stringify(label));
const darkPaper = await page.$eval('html', (el) => getComputedStyle(el).backgroundColor);
check('dark paper #17140f', darkPaper === 'rgb(23, 20, 15)', darkPaper);
const darkAccent = await page.$eval('html', (el) => getComputedStyle(el).getPropertyValue('--accent').trim());
check('dark accent #d4a94c', darkAccent === '#d4a94c', darkAccent);
const stored = await page.evaluate(() => localStorage.getItem('theme'));
check('theme persisted', stored === 'dark', String(stored));

// 8. Reload keeps dark without flash (ThemeScript path)
await page.reload({ waitUntil: 'domcontentloaded' });
const themeAfter = await page.$eval('html', (el) => el.dataset.theme);
check('theme survives reload', themeAfter === 'dark', themeAfter);

// 9. Avatar: served, 460px, PNG
const avatar = await page.request.get(new URL('/avatar.png', url).href);
check('avatar.png 200', avatar.status() === 200, String(avatar.status()));
const buf = await avatar.body();
check('avatar is PNG', buf.slice(1, 4).toString() === 'PNG', buf.slice(0, 8).toString('hex'));
const w = buf.readUInt32BE(16);
check('avatar 460px wide', w === 460, String(w));

// 10. OG image renders, 1200x630 PNG
const og = await page.request.get(new URL('/opengraph-image', url).href);
check('og image 200', og.status() === 200, String(og.status()));
const ogBuf = await og.body();
check('og image is PNG', ogBuf.slice(1, 4).toString() === 'PNG');
check('og 1200x630', ogBuf.readUInt32BE(16) === 1200 && ogBuf.readUInt32BE(20) === 630, `${ogBuf.readUInt32BE(16)}x${ogBuf.readUInt32BE(20)}`);

// 11. theme-color meta
const metas = await page.$$eval('meta[name="theme-color"]', (els) => els.map((e) => e.content));
check('theme-color metas', metas.includes('#f3f1ec') && metas.includes('#17140f'), metas.join(', '));

// 12. Mobile: no horizontal overflow
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(url, { waitUntil: 'networkidle' });
const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('mobile no horizontal overflow', overflow <= 0, `${overflow}px`);
const h1Mob = await mob.$eval('h1.hero-name', (el) => el.getBoundingClientRect().right <= window.innerWidth);
check('mobile hero name fits', h1Mob);

// 13. No JS errors
check('no console/page errors', consoleErrors.length === 0, consoleErrors.join(' | '));

await browser.close();

let fails = 0;
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '  → ' + r.detail}`);
  if (!r.ok) fails++;
}
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
