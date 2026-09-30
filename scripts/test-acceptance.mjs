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

// ---- Motion ----
const mo = await browser.newPage({ viewport: { width: 1200, height: 720 } });

// 14. Headbang on the hero, and its glyph box clears the thesis line.
await mo.goto(url, { waitUntil: 'networkidle' });
const hb = await mo.evaluate(async () => {
  await document.fonts.ready;
  const name = document.querySelector('.hero-name');
  const thesis = document.querySelector('.hero-thesis');
  return {
    fam: getComputedStyle(name).fontFamily,
    loaded: [...document.fonts].some((f) => /headbang/i.test(f.family) && f.status === 'loaded'),
    nameBottom: name.getBoundingClientRect().bottom,
    thesisTop: thesis.getBoundingClientRect().top,
  };
});
check('Headbang loaded on hero', hb.loaded && /headbang/i.test(hb.fam), hb.fam);
check('hero name clears thesis', hb.nameBottom <= hb.thesisTop + 1, `${hb.nameBottom} vs ${hb.thesisTop}`);

// 15. Load sequence: name settles before the race starts. At 300ms the name
//     should be mid-animation; the race should not have moved until >1.4s.
await mo.goto(url, { waitUntil: 'commit' });
await mo.waitForTimeout(300);
const early = await mo.evaluate(() => ({
  nameAnim: document.querySelector('.hero-name')?.getAnimations().map((a) => `${a.animationName}:${a.playState}`).join(',') ?? 'none',
  fill: document.querySelector('.lane-mine .lane-fill')?.style.width,
}));
check('hero name animating at 300ms', /ink-settle:running/.test(early.nameAnim), early.nameAnim);
check('race not started at 300ms', early.fill === '0%', String(early.fill));
await mo.waitForTimeout(1500);
const later = await mo.evaluate(() => parseFloat(document.querySelector('.lane-mine .lane-fill')?.style.width));
check('race running by 1.8s', later > 0, String(later));

// 16. Idle animations are live after the race lands.
await mo.waitForTimeout(2800);
const idle = await mo.evaluate(() => {
  const running = (el) => (el ? el.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName) : []);
  const pseudoRunning = (el, ps) => (el ? el.getAnimations({ subtree: true }).filter((a) => a.effect?.pseudoElement === ps && a.playState === 'running').map((a) => a.animationName) : []);
  return {
    stamp: running(document.querySelector('.lane-mine .lane-time')),
    cursor: pseudoRunning(document.querySelector('.race-caption'), '::after'),
    ring: running(document.querySelector('.ring')),
    portrait: running(document.querySelector('.portrait img')),
    bands: running(document.querySelector('.tile[data-active] .tile-bands')),
    done: !!document.querySelector('.race-caption[data-done]'),
  };
});
check('race finished', idle.done);
check('idle: stamp breathes', idle.stamp.includes('stamp-breathe'), idle.stamp.join(','));
check('idle: caption cursor blinks', idle.cursor.includes('cursor-blink'), idle.cursor.join(','));
check('idle: ring drifts', idle.ring.includes('ring-drift'), idle.ring.join(','));
check('idle: portrait drifts', idle.portrait.includes('portrait-drift'), idle.portrait.join(','));
check('idle: active tile bands pulse', idle.bands.includes('bands-pulse'), idle.bands.join(','));

// 17. Ring has no Tailwind `.ring` box-shadow.
const ringShadow = await mo.$eval('.ring', (el) => getComputedStyle(el).boxShadow);
check('ring has no utility box-shadow', ringShadow === 'none', ringShadow);

// 18. Scroll reveal: Work section stagger actually transitions.
await mo.evaluate(() => document.querySelector('#work').scrollIntoView({ block: 'start', behavior: 'instant' }));
await mo.waitForTimeout(80);
const revealStart = await mo.evaluate(() => ({
  inView: document.querySelector('#work').classList.contains('in-view'),
  frameOpacity: parseFloat(getComputedStyle(document.querySelector('#work .treemap-frame')).opacity),
}));
await mo.waitForTimeout(1600);
const revealEnd = await mo.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#work .treemap-frame')).opacity));
check('work section marked in-view', revealStart.inView);
check('treemap frame fades in (start < 1, end ≈ 1)', revealStart.frameOpacity < 1 && revealEnd > 0.99, `${revealStart.frameOpacity} → ${revealEnd}`);

// 19. Theme flip crossfades: background is mid-way between palettes ~150ms in.
await mo.evaluate(() => window.scrollTo(0, 0));
const flip = await mo.evaluate(async () => {
  const html = document.documentElement;
  const bg = () => getComputedStyle(html).backgroundColor;
  document.querySelector('.theme-toggle').click();
  const t0 = performance.now();
  await new Promise((r) => setTimeout(r, 150 - (performance.now() - t0)));
  const mid = bg();
  const midFlipping = html.classList.contains('theme-flipping');
  await new Promise((r) => setTimeout(r, 700));
  return { mid, midFlipping, end: bg(), endFlipping: html.classList.contains('theme-flipping') };
});
const midRgb = flip.mid.match(/\d+/g).map(Number);
check('theme flip mid-transition at 150ms', flip.midFlipping && midRgb[0] > 23 && midRgb[0] < 243, `${flip.mid} flipping=${flip.midFlipping}`);
check('theme flip settles dark, class removed', flip.end === 'rgb(23, 20, 15)' && !flip.endFlipping, `${flip.end} flipping=${flip.endFlipping}`);

// 20. Reduced motion: no idle animations, everything visible, race at final state.
const rm = await browser.newPage({ viewport: { width: 1200, height: 720 }, reducedMotion: 'reduce' });
await rm.goto(url, { waitUntil: 'networkidle' });
await rm.waitForTimeout(400);
const reduced = await rm.evaluate(() => {
  const anims = document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity);
  return {
    infinite: anims.map((a) => a.animationName),
    fill: document.querySelector('.lane-mine .lane-fill')?.style.width,
    done: !!document.querySelector('.race-caption[data-done]'),
    revealReady: document.documentElement.classList.contains('reveal-ready'),
    sectionOpacity: [...document.querySelectorAll('.section')].map((s) => getComputedStyle(s).opacity),
  };
});
check('reduced motion: no infinite animations', reduced.infinite.length === 0, reduced.infinite.join(','));
check('reduced motion: race at final state immediately', reduced.done && reduced.fill !== '0%', `done=${reduced.done} fill=${reduced.fill}`);
check('reduced motion: no reveal dimming', !reduced.revealReady && reduced.sectionOpacity.every((o) => o === '1'), `ready=${reduced.revealReady} ${reduced.sectionOpacity.join(',')}`);

await browser.close();

let fails = 0;
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '  → ' + r.detail}`);
  if (!r.ok) fails++;
}
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
