/**
 * Browser acceptance checks against a running server (default
 * http://localhost:3778/). Drives real Chrome via Playwright from the npx
 * cache. Covers both routes: the front page (title page, atlas, about) and
 * /work (benchmark race, treemap, languages), plus motion, theme, and a
 * reduced-motion pass.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pwPath = '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const base = (process.env.URL ?? 'http://localhost:3778/').replace(/\/?$/, '/');
const WORK = new URL('work/', base).href;
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const watch = (page) => {
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
};

// ---------------------------------------------------------------- front page
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
const res = await page.goto(base, { waitUntil: 'networkidle' });
check('front: 200', res.status() === 200, String(res.status()));

const fam = (p, sel) => p.$eval(sel, (el) => getComputedStyle(el).fontFamily);
const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))];
});
check('front: Old Standard loaded', fonts.some((f) => /Old Standard/.test(f)), fonts.join(', '));
check('front: Courier Prime loaded', fonts.some((f) => /Courier Prime/.test(f)), fonts.join(', '));
check('front: Headbang loaded', fonts.some((f) => /headbang/i.test(f)), fonts.join(', '));
check('front: no legacy fonts', !fonts.some((f) => /Space|Instrument|Archivo|Plex/.test(f)), fonts.join(', '));
check('front: h1 is JL', (await page.textContent('h1.hero-name'))?.trim() === 'JL');
check('front: h1 Headbang', /headbang/i.test(await fam(page, 'h1.hero-name')));
check('front: .num typewriter', /Courier|typewriter/.test(await fam(page, '.num')));
check('front: prose serif', /Old|old-serif/.test(await fam(page, '.about-body')));

// Layout: the front page is an introduction. No race, no treemap, no ring.
const frontHas = await page.evaluate(() => ({
  race: !!document.querySelector('.race'),
  treemap: !!document.querySelector('.treemap'),
  ring: !!document.querySelector('.ring'),
  atlas: !!document.querySelector('canvas.atlas'),
  about: !!document.querySelector('#about'),
  workLinks: [...document.querySelectorAll('a[href="/work/"]')].length,
}));
check('front: no race', !frontHas.race);
check('front: no treemap', !frontHas.treemap);
check('front: no ring', !frontHas.ring);
check('front: atlas present', frontHas.atlas);
check('front: about present', frontHas.about);
check('front: links to /work/ (about + footer)', frontHas.workLinks >= 2, String(frontHas.workLinks));

// Centred: hero name and thesis are horizontally centred in the shell.
const centred = await page.evaluate(() => {
  const mid = (el) => {
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2;
  };
  const shell = document.querySelector('.hero .shell');
  return {
    shell: mid(shell),
    name: mid(document.querySelector('.hero-name')),
    thesis: mid(document.querySelector('.hero-thesis')),
    caption: mid(document.querySelector('.atlas-caption')),
    aboutTitle: mid(document.querySelector('.about-title')),
    textAlign: getComputedStyle(document.querySelector('.hero-head')).textAlign,
  };
});
const near = (a, b) => Math.abs(a - b) < 2;
check('front: hero name centred', near(centred.name, centred.shell) && centred.textAlign === 'center', JSON.stringify(centred));
check('front: thesis centred', near(centred.thesis, centred.shell));
check('front: atlas caption centred', near(centred.caption, centred.shell));
check('front: about title centred', near(centred.aboutTitle, centred.shell));

// Hero name clears the thesis (Headbang descenders).
const hb = await page.evaluate(() => ({
  nameBottom: document.querySelector('.hero-name').getBoundingClientRect().bottom,
  thesisTop: document.querySelector('.hero-thesis').getBoundingClientRect().top,
}));
check('front: hero name clears thesis', hb.nameBottom <= hb.thesisTop + 1, JSON.stringify(hb));

// Palette: flat paper, no grid.
check('front: no body grid', (await page.$eval('body', (el) => getComputedStyle(el).backgroundImage)) === 'none');
check('front: light paper', (await page.$eval('html', (el) => getComputedStyle(el).backgroundColor)) === 'rgb(243, 241, 236)');

// ---- Atlas ----
await page.waitForTimeout(1500);
const atlas = await page.evaluate(async () => {
  const c = document.querySelector('canvas.atlas');
  const ctx = c.getContext('2d');
  const grab = () => Array.from(ctx.getImageData(0, 0, c.width, c.height).data);
  const f0 = Number(c.dataset.frames);
  const s0 = grab();
  await new Promise((r) => setTimeout(r, 600));
  const f1 = Number(c.dataset.frames);
  const s1 = grab();
  let diff = 0;
  for (let i = 0; i < s0.length; i += 4) diff += Math.abs(s0[i] - s1[i]) + Math.abs(s0[i + 1] - s1[i + 1]) + Math.abs(s0[i + 2] - s1[i + 2]);
  const colours = new Set();
  for (let i = 0; i < s1.length; i += 4) colours.add((s1[i] << 16) | (s1[i + 1] << 8) | s1[i + 2]);
  // Frame cost: time one render via the exposed frame counter is not
  // possible from outside, so measure a long task proxy: how long does a
  // 600ms window of rAF callbacks get blocked? Sample main-thread gaps.
  const gaps = [];
  let last = performance.now();
  await new Promise((r) => {
    let n = 0;
    const tick = (t) => {
      gaps.push(t - last);
      last = t;
      if (++n < 30) requestAnimationFrame(tick);
      else r();
    };
    requestAnimationFrame(tick);
  });
  const worst = Math.max(...gaps.slice(1));
  return {
    seed: c.dataset.seed,
    running: c.dataset.running,
    frames: f1 - f0,
    diff,
    colours: colours.size,
    worstGap: Math.round(worst),
    w: c.width,
    h: c.height,
  };
});
check('atlas: seeded', /^\d+$/.test(atlas.seed), atlas.seed);
check('atlas: running', atlas.running === 'true');
check('atlas: ~12fps (>=5 frames in 600ms)', atlas.frames >= 5, String(atlas.frames));
check('atlas: pixels change between frames', atlas.diff > 10000, String(atlas.diff));
check('atlas: rich field (>500 colours)', atlas.colours > 500, String(atlas.colours));
check('atlas: no long frames (worst rAF gap < 60ms)', atlas.worstGap < 60, `${atlas.worstGap}ms`);
check('atlas: 128x128 buffer', atlas.w === 128 && atlas.h === 128, `${atlas.w}x${atlas.h}`);

// Pauses when scrolled offscreen; resumes when back.
await page.evaluate(() => document.querySelector('.footer').scrollIntoView());
await page.waitForTimeout(400);
const paused = await page.evaluate(async () => {
  const c = document.querySelector('canvas.atlas');
  const f0 = Number(c.dataset.frames);
  await new Promise((r) => setTimeout(r, 500));
  return { running: c.dataset.running, frames: Number(c.dataset.frames) - f0 };
});
check('atlas: pauses offscreen', paused.running === 'false' && paused.frames === 0, JSON.stringify(paused));
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
check('atlas: resumes onscreen', (await page.$eval('canvas.atlas', (c) => c.dataset.running)) === 'true');

// Re-inks on theme flip: the plate's mean colour must move once the palette
// swaps (dark paper + cream ink read lighter on average than light paper +
// iron-gall ink, so the direction is not fixed; only the change is).
const meanRgb = (c) => {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4;
  return [r / n, g / n, b / n];
};
const beforeFlip = await page.$eval('canvas.atlas', meanRgb);
// Clicking the footer toggle scrolls the atlas offscreen, which pauses it;
// the MutationObserver still repaints one re-inked frame on theme change.
// Wait for that frame (frames counter advances by at least one).
const f0 = await page.$eval('canvas.atlas', (c) => Number(c.dataset.frames));
await page.click('.theme-toggle');
await page.waitForFunction((n) => Number(document.querySelector('canvas.atlas').dataset.frames) > n, f0, { timeout: 3000 });
const afterFlip = await page.$eval('canvas.atlas', meanRgb);
const flipDist = Math.hypot(...beforeFlip.map((v, i) => v - afterFlip[i]));
check('atlas: re-inks on theme flip (mean colour moves > 30)', flipDist > 30, `Δ=${flipDist.toFixed(0)} ${beforeFlip.map((v) => v.toFixed(0))} → ${afterFlip.map((v) => v.toFixed(0))}`);

// Theme flip itself (the crossfade runs 480ms; wait it out before sampling).
await page.waitForFunction(() => !document.documentElement.classList.contains('theme-flipping'), null, { timeout: 2000 });
check('theme: dark after toggle', (await page.$eval('html', (el) => el.dataset.theme)) === 'dark');
check('theme: label Lamplight', (await page.textContent('.theme-toggle-label'))?.trim() === 'Lamplight');
check('theme: dark paper', (await page.$eval('html', (el) => getComputedStyle(el).backgroundColor)) === 'rgb(23, 20, 15)');
check('theme: persisted', (await page.evaluate(() => localStorage.getItem('theme'))) === 'dark');
await page.reload({ waitUntil: 'domcontentloaded' });
check('theme: survives reload', (await page.$eval('html', (el) => el.dataset.theme)) === 'dark');

// Static assets + metadata.
const avatar = await page.request.get(new URL('avatar.png', base).href);
const abuf = await avatar.body();
check('avatar: 200 PNG 460px', avatar.status() === 200 && abuf.slice(1, 4).toString() === 'PNG' && abuf.readUInt32BE(16) === 460);
const og = await page.request.get(new URL('opengraph-image', base).href);
const obuf = await og.body();
check('og: 200 PNG 1200x630', og.status() === 200 && obuf.slice(1, 4).toString() === 'PNG' && obuf.readUInt32BE(16) === 1200 && obuf.readUInt32BE(20) === 630);
const metas = await page.$$eval('meta[name="theme-color"]', (els) => els.map((e) => e.content));
check('meta: theme-color both', metas.includes('#f3f1ec') && metas.includes('#17140f'), metas.join(', '));
const sitemap = await (await page.request.get(new URL('sitemap.xml', base).href)).text();
check('sitemap: lists /work/', /\/work\//.test(sitemap));

// Load sequence on the front page: name settles, atlas develops after.
await page.evaluate(() => localStorage.removeItem('theme'));
await page.goto(base, { waitUntil: 'commit' });
await page.waitForTimeout(300);
const early = await page.evaluate(() => ({
  name: document.querySelector('.hero-name')?.getAnimations().map((a) => `${a.animationName}:${a.playState}`).join(',') ?? 'none',
  plateOpacity: parseFloat(getComputedStyle(document.querySelector('.atlas-plate')).opacity),
}));
check('load: hero name settling at 300ms', /ink-settle:running/.test(early.name), early.name);
check('load: atlas plate not yet developed at 300ms', early.plateOpacity < 0.5, String(early.plateOpacity));
await page.waitForTimeout(2200);
check('load: atlas plate developed by 2.5s', (await page.$eval('.atlas-plate', (el) => parseFloat(getComputedStyle(el).opacity))) > 0.99);

// Idle on the front page: portrait drifts.
await page.evaluate(() => document.querySelector('#about').scrollIntoView());
await page.waitForTimeout(600);
check('idle: portrait drifts', await page.$eval('.portrait img', (el) => el.getAnimations().some((a) => a.animationName === 'portrait-drift' && a.playState === 'running')));

// Mobile.
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mob);
await mob.goto(base, { waitUntil: 'networkidle' });
check('mobile: no horizontal overflow', (await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
check('mobile: hero name fits', await mob.$eval('h1.hero-name', (el) => el.getBoundingClientRect().right <= window.innerWidth));
check('mobile: atlas 4:3', await mob.$eval('canvas.atlas', (c) => { const r = c.getBoundingClientRect(); return Math.abs(r.width / r.height - 4 / 3) < 0.05; }));

// ---------------------------------------------------------------- /work
const work = await browser.newPage({ viewport: { width: 1200, height: 720 } });
watch(work);
const wres = await work.goto(WORK, { waitUntil: 'networkidle' });
check('work: 200', wres.status() === 200, String(wres.status()));
const workHas = await work.evaluate(() => ({
  race: !!document.querySelector('.benchmark .race'),
  treemap: !!document.querySelector('.treemap'),
  ring: !!document.querySelector('.ring'),
  atlas: !!document.querySelector('canvas.atlas'),
  home: document.querySelector('a.work-home')?.getAttribute('href'),
  tags: [...document.querySelectorAll('.section-head .tag')].map((e) => e.textContent.trim()),
  title: document.title,
}));
check('work: race present', workHas.race);
check('work: treemap present', workHas.treemap);
check('work: ring present', workHas.ring);
check('work: no atlas', !workHas.atlas);
check('work: home link', workHas.home === '/', String(workHas.home));
check('work: Fig. 1/2/3 order', workHas.tags[0]?.startsWith('Fig. 1') && workHas.tags[1]?.startsWith('Fig. 2') && workHas.tags[2]?.startsWith('Fig. 3'), workHas.tags.join(' | '));
check('work: title', /the work, measured/i.test(workHas.title), workHas.title);

// The benchmark is folded under the title: closed by default, race idle.
const folded = await work.evaluate(() => {
  const d = document.querySelector('details#benchmark');
  return {
    isDetails: !!d,
    open: d?.open,
    summaryText: d?.querySelector('summary')?.textContent.trim(),
    raceVisible: d ? d.querySelector('.race').checkVisibility() : null,
    fill: d?.querySelector('.lane-mine .lane-fill')?.style.width,
  };
});
check('work: benchmark is a <details>', folded.isDetails);
check('work: benchmark closed by default', folded.open === false, String(folded.open));
check('work: summary carries the figure head', /Fig\. 1/.test(folded.summaryText) && /three ways/.test(folded.summaryText), folded.summaryText);
check('work: race hidden while closed', folded.raceVisible === false);
check('work: race not started while closed', folded.fill === '0%', String(folded.fill));

// Every head on /work sits on the same centre axis as the page title.
const workCentred = await work.evaluate(() => {
  const mid = (el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
  const axis = mid(document.querySelector('.work-title'));
  return {
    axis,
    heads: [...document.querySelectorAll('.section-head h2, .benchmark-title')].map((h) => mid(h) - axis),
    ledes: [...document.querySelectorAll('.section-lede')].filter((h) => h.checkVisibility()).map((h) => mid(h) - axis),
  };
});
check('work: figure titles centred on page axis', workCentred.heads.every((d) => Math.abs(d) < 2), workCentred.heads.map((d) => d.toFixed(1)).join(','));
check('work: ledes centred on page axis', workCentred.ledes.every((d) => Math.abs(d) < 2), workCentred.ledes.map((d) => d.toFixed(1)).join(','));

// Race sequence: open the figure, then delayed start, run, finish, breathe.
await work.goto(WORK, { waitUntil: 'networkidle' });
await work.click('details#benchmark > summary');
await work.waitForTimeout(300);
check('work: benchmark opens on click', await work.$eval('details#benchmark', (d) => d.open));
check('work: race visible once open', await work.$eval('details#benchmark .race', (el) => el.checkVisibility()));
check('work: race not started at 300ms after open', (await work.$eval('.lane-mine .lane-fill', (el) => el.style.width)) === '0%');
await work.waitForTimeout(1500);
check('work: race running by 1.8s after open', (await work.$eval('.lane-mine .lane-fill', (el) => parseFloat(el.style.width))) > 0);
await work.waitForTimeout(2800);
const idle = await work.evaluate(() => {
  const running = (el) => (el ? el.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName) : []);
  const pseudo = (el, ps) => (el ? el.getAnimations({ subtree: true }).filter((a) => a.effect?.pseudoElement === ps && a.playState === 'running').map((a) => a.animationName) : []);
  return {
    done: !!document.querySelector('.race-caption[data-done]'),
    stamp: running(document.querySelector('.lane-mine .lane-time')),
    cursor: pseudo(document.querySelector('.race-caption'), '::after'),
    axisAligned: Math.abs(document.querySelector('.race-axis-track').getBoundingClientRect().left - document.querySelector('.lane-track').getBoundingClientRect().left) < 1,
  };
});
check('work: race finished', idle.done);
check('work: stamp breathes', idle.stamp.includes('stamp-breathe'), idle.stamp.join(','));
check('work: caption cursor blinks', idle.cursor.includes('cursor-blink'), idle.cursor.join(','));
check('work: axis aligned with lanes', idle.axisAligned);

// Reveal + idle further down. With the benchmark folded, #work sits near
// the fold at 720px tall, so use a shorter viewport for this one so the
// section genuinely starts offscreen and has to reveal.
await work.setViewportSize({ width: 1200, height: 480 });
await work.goto(WORK, { waitUntil: 'networkidle' });
check('work: treemap starts dimmed below the fold', (await work.$eval('#work .treemap-frame', (el) => parseFloat(getComputedStyle(el).opacity))) < 1);
await work.evaluate(() => document.querySelector('#work').scrollIntoView({ block: 'start', behavior: 'instant' }));
await work.waitForTimeout(80);
const r0 = await work.$eval('#work .treemap-frame', (el) => parseFloat(getComputedStyle(el).opacity));
await work.waitForTimeout(1600);
const r1 = await work.$eval('#work .treemap-frame', (el) => parseFloat(getComputedStyle(el).opacity));
check('work: treemap frame fades in', r0 < 1 && r1 > 0.99, `${r0} → ${r1}`);
await work.setViewportSize({ width: 1200, height: 720 });
check('work: active tile bands pulse', await work.$eval('.tile[data-active] .tile-bands', (el) => el.getAnimations().some((a) => a.animationName === 'bands-pulse')));
await work.evaluate(() => document.querySelector('#languages').scrollIntoView());
await work.waitForTimeout(800);
check('work: ring drifts', await work.$eval('.ring', (el) => el.getAnimations().some((a) => a.animationName === 'ring-drift' && a.playState === 'running')));
check('work: ring no utility box-shadow', (await work.$eval('.ring', (el) => getComputedStyle(el).boxShadow)) === 'none');

// Mobile /work.
await mob.goto(WORK, { waitUntil: 'networkidle' });
check('work mobile: no horizontal overflow', (await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);

// ---------------------------------------------------------------- reduced motion
const rm = await browser.newPage({ viewport: { width: 1200, height: 720 }, reducedMotion: 'reduce' });
watch(rm);
await rm.goto(base, { waitUntil: 'networkidle' });
await rm.waitForTimeout(600);
const reducedFront = await rm.evaluate(async () => {
  const c = document.querySelector('canvas.atlas');
  const f0 = Number(c.dataset.frames);
  await new Promise((r) => setTimeout(r, 500));
  return {
    infinite: document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).map((a) => a.animationName),
    atlasFrames: Number(c.dataset.frames),
    atlasGrew: Number(c.dataset.frames) - f0,
    atlasRunning: c.dataset.running,
    sections: [...document.querySelectorAll('.section')].map((s) => getComputedStyle(s).opacity),
  };
});
check('reduced: no infinite animations on front', reducedFront.infinite.length === 0, reducedFront.infinite.join(','));
check('reduced: atlas renders exactly one frame', reducedFront.atlasFrames === 1 && reducedFront.atlasGrew === 0 && reducedFront.atlasRunning === 'false', JSON.stringify(reducedFront));
check('reduced: no reveal dimming', reducedFront.sections.every((o) => o === '1'));
await rm.goto(WORK, { waitUntil: 'networkidle' });
await rm.click('details#benchmark > summary');
await rm.waitForTimeout(400);
const reducedWork = await rm.evaluate(() => ({
  done: !!document.querySelector('.race-caption[data-done]'),
  fill: document.querySelector('.lane-mine .lane-fill')?.style.width,
  infinite: document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length,
}));
check('reduced: race at final state', reducedWork.done && reducedWork.fill !== '0%', JSON.stringify(reducedWork));
check('reduced: no infinite animations on /work', reducedWork.infinite === 0, String(reducedWork.infinite));

check('no console/page errors', errors.length === 0, errors.join(' | '));

await browser.close();

let fails = 0;
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '  → ' + r.detail}`);
  if (!r.ok) fails++;
}
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
