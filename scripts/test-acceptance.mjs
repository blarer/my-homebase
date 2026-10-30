/**
 * Browser acceptance checks against a running server (default
 * http://localhost:3778/). Drives real Chrome via Playwright from the npx
 * cache. Covers both routes: the front page (title page, atlas, about) and
 * /work (benchmark race, treemap, languages), plus motion, theme, and a
 * reduced-motion pass.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// PLAYWRIGHT_PATH points at any playwright install; CHROME_PATH at any
// Chromium build (default: the installed Chrome channel).
const pwPath = process.env.PLAYWRIGHT_PATH ?? '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const base = (process.env.URL ?? 'http://localhost:3778/').replace(/\/?$/, '/');
const WORK = new URL('work/', base).href;
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : { channel: 'chrome' });
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
check('front: h1 is JL', (await page.textContent('h1.hero-name'))?.replace(/\s+/g, '') === 'JL');
check('front: h1 Headbang', /headbang/i.test(await fam(page, 'h1.hero-name')));
check('front: .num typewriter', /Courier|typewriter/.test(await fam(page, '.num')));
check('front: prose serif', /Old|old-serif/.test(await fam(page, '.about-body')));

// Hero lighting. Each letter is lit by a gradient clipped to a copy of its
// own glyph, and which pair you get is a coin flip per visit. The resting
// state must be plain ink, so hover is the only thing that lights it.
const lit = async (sel) => {
  const before = (prop) => page.$eval(sel, (el, p) => getComputedStyle(el, '::before').getPropertyValue(p), prop);
  const rest = { opacity: await before('opacity'), image: await before('background-image') };
  await page.hover(sel);
  await page.waitForTimeout(450);
  const filter = await page.$eval(sel, (el) => getComputedStyle(el).filter);
  const hovered = { opacity: await before('opacity'), image: await before('background-image') };
  await page.mouse.move(0, 0);
  await page.waitForTimeout(450);
  return { rest, hovered, filter };
};
const pairNow = await page.$eval('.hero-name', (el) => el.dataset.pair);
check('front: hero pair chosen', ['elemental', 'celestial'].includes(pairNow), String(pairNow));

const litJ = await lit('.hero-letter-j');
const litL = await lit('.hero-letter-l');
check('front: J dark at rest', litJ.rest.opacity === '0', litJ.rest.opacity);
check('front: L dark at rest', litL.rest.opacity === '0', litL.rest.opacity);
check('front: J lights on hover', litJ.hovered.opacity === '1', litJ.hovered.opacity);
check('front: L lights on hover', litL.hovered.opacity === '1', litL.hovered.opacity);
check('front: J light is a gradient', /gradient/.test(litJ.hovered.image), litJ.hovered.image.slice(0, 48));
check('front: L light is a gradient', /gradient/.test(litL.hovered.image), litL.hovered.image.slice(0, 48));
check('front: J and L differ', litJ.hovered.image !== litL.hovered.image);
check('front: J glows on hover', /drop-shadow/.test(litJ.filter), litJ.filter.slice(0, 48));
check('front: L glows on hover', /drop-shadow/.test(litL.filter), litL.filter.slice(0, 48));
// The glyph copy must cover the whole letter, overhangs included: the box is
// grown half an em and pulled back by the same amount, so it starts above
// and left of the letter and ends below and right of it.
const cover = await page.evaluate(() => {
  const el = document.querySelector('.hero-letter-j');
  const b = el.getBoundingClientRect();
  const o = getComputedStyle(el, '::before');
  return { top: o.top, left: o.left, padding: o.padding, h: b.height };
});
check('front: lit copy overhangs the letter box',
  parseFloat(cover.top) < 0 && parseFloat(cover.left) < 0 && parseFloat(cover.padding) > 0,
  JSON.stringify(cover));

// Both pairs are reachable and paint different colours for the same letter.
const pairImage = async (pair, sel) => {
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p2.goto(new URL(`?hero=${pair}`, base).href, { waitUntil: 'domcontentloaded' });
  await p2.waitForFunction(() => document.querySelector('.hero-name')?.dataset.pair);
  const got = await p2.$eval('.hero-name', (el) => el.dataset.pair);
  const image = await p2.$eval(sel, (el) => getComputedStyle(el, '::before').backgroundImage);
  await p2.close();
  return { got, image };
};
const elemJ = await pairImage('elemental', '.hero-letter-j');
const celJ = await pairImage('celestial', '.hero-letter-j');
const elemL = await pairImage('elemental', '.hero-letter-l');
const celL = await pairImage('celestial', '.hero-letter-l');
check('front: ?hero pins elemental', elemJ.got === 'elemental', elemJ.got);
check('front: ?hero pins celestial', celJ.got === 'celestial', celJ.got);
check('front: ice and void differ', elemJ.image !== celJ.image);
check('front: fire and solar differ', elemL.image !== celL.image);
check('front: all four lights are gradients',
  [elemJ, celJ, elemL, celL].every((r) => /gradient/.test(r.image)));

// No pale fringe around a lit letter. The copy of the glyph that carries
// the gradient is anti-aliased, so any ink left underneath leaks out as a
// bright rim. Worst case is Lamplight with the void J: cream ink under a
// near-black letter.
//
// This has to be measured in pixels, not read off a rule, so: hover the J
// for real, screenshot a band along its left edge, and decode the shot by
// handing it back to the browser as a data URL and drawing it to a canvas.
// A fringe shows up as pixels far brighter than both the letter and the
// page behind it.
const fringePeak = await (async () => {
  const p2 = await browser.newPage({ viewport: { width: 1200, height: 620 }, colorScheme: 'dark' });
  await p2.goto(new URL('?hero=celestial', base).href, { waitUntil: 'networkidle' });
  await p2.waitForFunction(() => document.querySelector('.hero-name')?.dataset.pair);
  const box = await p2.$eval('.hero-letter-j', (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await p2.hover('.hero-letter-j');
  await p2.waitForTimeout(700);
  // A narrow strip straddling the left edge of the stem, below the head
  // serif, where the rim was reported.
  const shot = await p2.screenshot({
    clip: { x: box.x - 6, y: box.y + box.h * 0.35, width: 26, height: 40 },
  });
  const peak = await p2.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = Object.assign(document.createElement('canvas'), { width: img.width, height: img.height });
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      max = Math.max(max, (data[i] + data[i + 1] + data[i + 2]) / 3);
    }
    return max;
  }, shot.toString('base64'));
  await p2.close();
  return peak;
})();
// Lamplight paper is ~23/255 and the void letter is darker still; the cream
// ink that used to leak is ~235. Anything under 90 means no rim.
check('front: no pale fringe around the lit void J', fringePeak < 90, `peak luma ${fringePeak.toFixed(1)}`);

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
// Pixel reads must work on both renderers: getImageData on the 2D fallback,
// readPixels on WebGL. The GL context no longer uses preserveDrawingBuffer
// (it costs a copy per frame), so the backbuffer is undefined once a frame
// is presented: redraw via the component's hook and read in the same task.
// Registered as an init script so it survives reloads on this page.
const ATLAS_PIXELS = () => {
  window.__atlasPixels = (c, step = 1) => {
    if (c.dataset.renderer === 'webgl') {
      c.__atlasRedraw?.();
      const gl = c.getContext('webgl');
      const buf = new Uint8Array(c.width * c.height * 4);
      gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      if (step === 1) return buf;
      const out = new Uint8Array(Math.ceil(buf.length / 4 / step) * 4);
      for (let i = 0, j = 0; i < buf.length; i += 4 * step, j += 4) { out[j] = buf[i]; out[j + 1] = buf[i + 1]; out[j + 2] = buf[i + 2]; out[j + 3] = 255; }
      return out;
    }
    return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  };
};
await page.addInitScript(ATLAS_PIXELS);
await page.evaluate(ATLAS_PIXELS);
await page.waitForTimeout(1500);
const atlas = await page.evaluate(async () => {
  const c = document.querySelector('canvas.atlas');
  const grab = () => window.__atlasPixels(c, 7); // subsample: GL buffer is ~1M px
  const f0 = Number(c.dataset.frames);
  const s0 = grab();
  await new Promise((r) => setTimeout(r, 600));
  const f1 = Number(c.dataset.frames);
  const s1 = grab();
  let diff = 0;
  for (let i = 0; i < s0.length; i += 4) diff += Math.abs(s0[i] - s1[i]) + Math.abs(s0[i + 1] - s1[i + 1]) + Math.abs(s0[i + 2] - s1[i + 2]);
  const colours = new Set();
  for (let i = 0; i < s1.length; i += 4) colours.add((s1[i] << 16) | (s1[i + 1] << 8) | s1[i + 2]);
  // Main-thread cost proxy: worst gap between consecutive rAF callbacks
  // over a 30-frame window while the atlas is running.
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
  const rect = c.getBoundingClientRect();
  return {
    seed: c.dataset.seed,
    renderer: c.dataset.renderer,
    running: c.dataset.running,
    frames: f1 - f0,
    diff,
    samples: s1.length / 4,
    colours: colours.size,
    worstGap: Math.round(worst),
    w: c.width,
    h: c.height,
    cssW: Math.round(rect.width),
    cssH: Math.round(rect.height),
    dpr: window.devicePixelRatio,
  };
});
check('atlas: seeded', /^\d+$/.test(atlas.seed), atlas.seed);
check('atlas: WebGL renderer in Chrome', atlas.renderer === 'webgl', atlas.renderer);
check('atlas: running', atlas.running === 'true');
check('atlas: ~60fps on GL (>=25 frames in 600ms)', atlas.frames >= 25, String(atlas.frames));
check('atlas: pixels change between frames', atlas.diff / atlas.samples > 1, `${(atlas.diff / atlas.samples).toFixed(2)} per sample`);
check('atlas: rich field (>500 colours in subsample)', atlas.colours > 500, String(atlas.colours));
check('atlas: no long frames (worst rAF gap < 60ms)', atlas.worstGap < 60, `${atlas.worstGap}ms`);
check('atlas: GL buffer at native resolution (>= CSS px)', atlas.w >= atlas.cssW && atlas.h >= atlas.cssH && atlas.w > 128, `${atlas.w}x${atlas.h} buffer for ${atlas.cssW}x${atlas.cssH} css @${atlas.dpr}x`);

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
  const d = window.__atlasPixels(c, 7);
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4;
  return [r / n, g / n, b / n];
};
const beforeFlip = await page.$eval('canvas.atlas', meanRgb);
// Clicking the footer toggle scrolls the atlas offscreen, which pauses it;
// the MutationObserver still repaints one re-inked frame on theme change.
// Wait for that frame (frames counter advances by at least one).
// The theme is applied inside a View Transition callback where supported,
// which runs a frame after the click, so wait for the theme to land first
// and then for the re-inked frame.
const f0 = await page.$eval('canvas.atlas', (c) => Number(c.dataset.frames));
await page.click('.theme-toggle');
await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark', null, { timeout: 3000 });
await page.waitForTimeout(800);
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

// CPU fallback: ?atlas=cpu takes the path a WebGL-less browser would. Same
// network, 128px raster, 12fps, blur on.
const cpu = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(cpu);
await cpu.goto(new URL('?atlas=cpu', base).href, { waitUntil: 'networkidle' });
await cpu.waitForTimeout(1200);
const fallback = await cpu.evaluate(async () => {
  const c = document.querySelector('canvas.atlas');
  const ctx = c.getContext('2d');
  const f0 = Number(c.dataset.frames);
  const s0 = Array.from(ctx.getImageData(0, 0, c.width, c.height).data);
  await new Promise((r) => setTimeout(r, 600));
  const s1 = Array.from(ctx.getImageData(0, 0, c.width, c.height).data);
  let diff = 0;
  for (let i = 0; i < s0.length; i += 4) diff += Math.abs(s0[i] - s1[i]);
  return {
    renderer: c.dataset.renderer,
    running: c.dataset.running,
    frames: Number(c.dataset.frames) - f0,
    w: c.width,
    h: c.height,
    diff,
    blur: getComputedStyle(c).filter,
  };
});
check('atlas cpu: canvas2d renderer', fallback.renderer === 'canvas2d', fallback.renderer);
check('atlas cpu: 128x128 buffer', fallback.w === 128 && fallback.h === 128, `${fallback.w}x${fallback.h}`);
check('atlas cpu: running ~12fps', fallback.running === 'true' && fallback.frames >= 5, `${fallback.running} ${fallback.frames}`);
check('atlas cpu: pixels change', fallback.diff > 5000, String(fallback.diff));
check('atlas cpu: blur applied to hide raster', /blur/.test(fallback.blur), fallback.blur);
check('atlas gl: no blur at native res', !/blur/.test(await page.$eval('canvas.atlas', (c) => getComputedStyle(c).filter)));

// Mobile.
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mob);
await mob.goto(base, { waitUntil: 'networkidle' });
check('mobile: no horizontal overflow', (await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
check('mobile: hero name fits', await mob.$eval('h1.hero-name', (el) => el.getBoundingClientRect().right <= window.innerWidth));
check('mobile: atlas 4:3', await mob.$eval('canvas.atlas', (c) => { const r = c.getBoundingClientRect(); return Math.abs(r.width / r.height - 4 / 3) < 0.05; }));
check('mobile: atlas GL buffer under pixel cap', await mob.$eval('canvas.atlas', (c) => c.dataset.renderer !== 'webgl' || c.width * c.height <= 2.2e6));

// ---------------------------------------------------------------- /work
// Client-side navigation first: this is the path a visitor takes from the
// front page. The reveal must re-arm for the new route's sections, or the
// whole page sits at opacity 0 (the inline-script version did exactly that).
const nav = await browser.newPage({ viewport: { width: 1200, height: 720 } });
watch(nav);
await nav.goto(base, { waitUntil: 'networkidle' });
await nav.click('.footer a[href="/work/"]');
await nav.waitForURL(/\/work\//);
await nav.waitForTimeout(1200);
const afterNav = await nav.evaluate(() => ({
  path: location.pathname,
  visibleSections: [...document.querySelectorAll('.section')].filter((s) => s.getBoundingClientRect().top < innerHeight).map((s) => `${s.id}:${getComputedStyle(s).opacity}`),
  anyInView: !!document.querySelector('.section.in-view'),
}));
check('nav: client-side / → /work lands on /work/', afterNav.path === '/work/', afterNav.path);
check('nav: sections in viewport are visible after client nav', afterNav.visibleSections.length > 0 && afterNav.visibleSections.every((s) => s.endsWith(':1')), afterNav.visibleSections.join(' '));
await nav.click('a.work-home');
await nav.waitForURL((u) => u.pathname === '/');
await nav.waitForTimeout(1200);
const backHome = await nav.evaluate(() => ({
  aboutOpacity: getComputedStyle(document.querySelector('#about')).opacity,
  atlasRunning: document.querySelector('canvas.atlas')?.dataset.running,
}));
check('nav: back to / re-arms (about visible once scrolled)', await nav.evaluate(async () => { document.querySelector('#about').scrollIntoView(); await new Promise((r) => setTimeout(r, 1200)); return getComputedStyle(document.querySelector('#about')).opacity === '1'; }));
check('nav: atlas restarts on return to /', backHome.atlasRunning === 'true' || (await nav.$eval('canvas.atlas', (c) => c.dataset.running)) === 'true');
await nav.close();

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
check('work: Fig. 1–6 order', workHas.tags.length === 6 && workHas.tags.every((t, i) => t.startsWith(`Fig. ${i + 1}`)), workHas.tags.join(' | '));
check('work: title', /the work, measured/i.test(workHas.title), workHas.title);

// Four figures are folded under their titles: closed by default, races idle.
const folded = await work.evaluate(() =>
  [...document.querySelectorAll('details.benchmark')].map((d) => ({
    id: d.id,
    open: d.open,
    summaryText: d.querySelector('summary')?.textContent.trim(),
    raceVisible: d.querySelector('.race').checkVisibility(),
    fill: d.querySelector('.lane-mine .lane-fill')?.style.width,
    lanes: d.querySelectorAll('.lane').length,
    repoLink: d.querySelector('.race-caption a')?.getAttribute('href'),
  })),
);
check('work: four folded figures', folded.length === 4 && folded.map((f) => f.id).join(',') === 'benchmark,dictation,footprint,clip', folded.map((f) => f.id).join(','));
check('work: all closed by default', folded.every((f) => f.open === false));
check('work: summaries carry the figure heads', folded.every((f, i) => new RegExp(`Fig\\. ${i + 1}`).test(f.summaryText)), folded.map((f) => f.summaryText).join(' | '));
check('work: races hidden while closed', folded.every((f) => f.raceVisible === false));
check('work: races not started while closed', folded.every((f) => f.fill === '0%'), folded.map((f) => f.fill).join(','));
check('work: lane counts 3/4/2/4', folded.map((f) => f.lanes).join(',') === '3,4,2,4', folded.map((f) => f.lanes).join(','));
check('work: each figure links its repo', folded.every((f) => /github\.com\/blarer\//.test(f.repoLink ?? '')), folded.map((f) => f.repoLink).join(','));

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

// Race sequence: open the first figure, then delayed start, run, finish, breathe.
await work.goto(WORK, { waitUntil: 'networkidle' });
await work.click('details#benchmark > summary');
await work.waitForTimeout(300);
check('work: benchmark opens on click', await work.$eval('details#benchmark', (d) => d.open));
check('work: other figures stay closed', await work.evaluate(() => ['dictation', 'footprint', 'clip'].every((id) => !document.getElementById(id).open)));
check('work: race visible once open', await work.$eval('details#benchmark .race', (el) => el.checkVisibility()));
check('work: race not started at 300ms after open', (await work.$eval('details#benchmark .lane-mine .lane-fill', (el) => el.style.width)) === '0%');
await work.waitForTimeout(1500);
check('work: race running by 1.8s after open', (await work.$eval('details#benchmark .lane-mine .lane-fill', (el) => parseFloat(el.style.width))) > 0);
await work.waitForTimeout(2800);
const idle = await work.evaluate(() => {
  const d = document.querySelector('details#benchmark');
  const running = (el) => (el ? el.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName) : []);
  const pseudo = (el, ps) => (el ? el.getAnimations({ subtree: true }).filter((a) => a.effect?.pseudoElement === ps && a.playState === 'running').map((a) => a.animationName) : []);
  return {
    done: !!d.querySelector('.race-caption[data-done]'),
    stamp: running(d.querySelector('.lane-mine .lane-time')),
    cursor: pseudo(d.querySelector('.race-caption'), '::after'),
    axisAligned: Math.abs(d.querySelector('.race-axis-track').getBoundingClientRect().left - d.querySelector('.lane-track').getBoundingClientRect().left) < 1,
    finalTime: d.querySelector('.lane-mine .lane-time-live')?.textContent,
  };
});
check('work: race finished', idle.done);
check('work: winning time reads 2.2s', idle.finalTime === '2.2s', String(idle.finalTime));
check('work: stamp breathes', idle.stamp.includes('stamp-breathe'), idle.stamp.join(','));
check('work: caption cursor blinks', idle.cursor.includes('cursor-blink'), idle.cursor.join(','));
check('work: axis aligned with lanes', idle.axisAligned);

// The second figure runs its own race in its own unit when opened.
await work.click('details#dictation > summary');
await work.waitForTimeout(4300);
const dict = await work.evaluate(() => {
  const d = document.querySelector('details#dictation');
  return {
    done: !!d.querySelector('.race-caption[data-done]'),
    unit: d.querySelector('.race-axis-label')?.textContent.trim(),
    mine: d.querySelector('.lane-mine .lane-time-live')?.textContent,
    slowest: d.querySelector('.lane[data-lane="0"] .lane-time-live')?.textContent,
    firstStillOpen: document.querySelector('details#benchmark').open,
  };
});
check('work: dictation race finishes independently', dict.done && dict.firstStillOpen, JSON.stringify(dict));
check('work: dictation in milliseconds', /millisecond/.test(dict.unit) && dict.mine === '131ms' && dict.slowest === '450ms', JSON.stringify(dict));

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
check('reduced: atlas is a still (no frames after settle, not running)', reducedFront.atlasFrames <= 2 && reducedFront.atlasGrew === 0 && reducedFront.atlasRunning === 'false', JSON.stringify(reducedFront));
check('reduced: no reveal dimming', reducedFront.sections.every((o) => o === '1'));
await rm.goto(WORK, { waitUntil: 'networkidle' });
await rm.click('details#benchmark > summary');
await rm.waitForTimeout(400);
const reducedWork = await rm.evaluate(() => ({
  done: !!document.querySelector('details#benchmark .race-caption[data-done]'),
  fill: document.querySelector('details#benchmark .lane-mine .lane-fill')?.style.width,
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
