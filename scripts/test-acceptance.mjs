/**
 * Browser acceptance checks for the Datasheet design, against a running
 * server (default http://127.0.0.1:3778/). Drives Chromium via Playwright.
 *
 * Covers both pages of the sheet: the front page (header bar, title block,
 * features, block diagram and its table, description, pinout, ordering) and
 * /work (electrical characteristics, timing diagrams, floorplan,
 * composition, revision history), plus the signature interaction, the
 * motion grammar, theme, no-JS, reduced motion and mobile.
 *
 *   PLAYWRIGHT_PATH  any playwright install
 *   CHROME_PATH      any Chromium build (default: installed Chrome channel)
 *   URL              server origin
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pwPath = process.env.PLAYWRIGHT_PATH ?? '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const base = (process.env.URL ?? 'http://127.0.0.1:3778/').replace(/\/?$/, '/');
const WORK = new URL('work/', base).href;
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : { channel: 'chrome' },
);
const errors = [];
const watch = (page) => {
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
};
const rgb = (p, sel, prop) => p.$eval(sel, (el, pr) => getComputedStyle(el)[pr], prop);

// ---------------------------------------------------------------- page 1
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
const res = await page.goto(base, { waitUntil: 'networkidle' });
check('front: 200', res.status() === 200, String(res.status()));

const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))];
});
check('fonts: Hanken Grotesk loaded', fonts.some((f) => /Hanken/.test(f)), fonts.join(', '));
check('fonts: Red Hat Mono loaded', fonts.some((f) => /Red Hat Mono/.test(f)), fonts.join(', '));
check('fonts: no retired faces', !fonts.some((f) => /Old Standard|Courier|headbang|Space|Instrument|Plex/i.test(f)), fonts.join(', '));
const fam = (sel) => page.$eval(sel, (el) => getComputedStyle(el).fontFamily);
check('type: body is the grotesk', /Hanken/.test(await fam('.ds-desc p')));
check('type: values are mono', /Red Hat Mono/.test(await fam('.ds-measured')));
check('type: tabular figures on .num', (await page.$eval('.num', (el) => getComputedStyle(el).fontVariantNumeric)).includes('tabular-nums'));

// Header block on every page: bar, part, doc, rev, date.
const head = await page.evaluate(() => ({
  part: document.querySelector('.sheet-part')?.textContent.trim(),
  doc: document.querySelector('.sheet-doc')?.textContent.replace(/\s+/g, ' ').trim(),
  bar: getComputedStyle(document.querySelector('.sheet-bar')).backgroundColor,
}));
check('header: part number BLARE-1', head.part === 'BLARE-1', head.part);
check('header: doc, REV and ISO date', /LOUDS-DS-001 · REV [A-Z]+ · \d{4}-\d{2}-\d{2}/.test(head.doc), head.doc);
check('header: bar is the manufacturer colour', head.bar === 'rgb(0, 102, 112)', head.bar);
check('palette: white paper', (await rgb(page, 'html', 'backgroundColor')) === 'rgb(255, 255, 255)');
check('palette: black ink', (await rgb(page, 'body', 'color')) === 'rgb(17, 19, 20)');

// Numbered sections in datasheet order.
const sections = await page.$$eval('.ds-section > .ds-h2', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
check('front: sections 1–5 in order',
  ['1 Features', '2 Applications', '3 Description', '4 Pin Configuration and Functions', '5 Ordering Information'].every((s, i) => sections[i] === s),
  sections.join(' | '));
const captions = await page.$$eval('.ds-caption-n', (els) => els.map((e) => e.textContent.trim()));
check('front: Figure 1–2 and Table 1–3 captions', ['Figure 1.', 'Table 1.', 'Figure 2.', 'Table 2.', 'Table 3.'].every((c) => captions.includes(c)), captions.join(' '));

// Real content kept: about copy, avatar, links.
const content = await page.evaluate(() => ({
  about: document.querySelector('#about')?.textContent ?? '',
  avatar: document.querySelector('#about img')?.getAttribute('alt'),
  work: document.querySelectorAll('a[href="/work/"]').length,
  gh: document.querySelectorAll('a[href="https://github.com/blarer"]').length,
  mail: document.querySelectorAll('a[href="mailto:blare@louds.net"]').length,
  atlas: !!document.querySelector('canvas'),
}));
check('front: about copy kept (four layer-below examples)',
  ['syscall problem', 'stream-copy problem', 'transport problem', 'polling problem', 'machine learning'].every((s) => content.about.includes(s)));
check('front: avatar', content.avatar === 'Blare');
check('front: links to /work/, GitHub, email', content.work >= 2 && content.gh >= 2 && content.mail >= 2, JSON.stringify(content));
check('front: no WebGL atlas', !content.atlas);

// First viewport contract: title, features and the block diagram all
// visible above the fold at 1440x900.
const fold = await page.evaluate(() => {
  const top = (s) => document.querySelector(s)?.getBoundingClientRect().top ?? 1e9;
  return { h1: top('.ds-h1'), features: top('#features'), fbd: top('.fbd-svg'), apps: top('#applications') };
});
check('first viewport: title, features, applications, block diagram above the fold',
  fold.h1 < 900 && fold.features < 900 && fold.apps < 900 && fold.fbd < 900, JSON.stringify(fold));
const cols = await page.evaluate(() => {
  const a = document.querySelector('#features').getBoundingClientRect();
  const b = document.querySelector('.fbd-figure').getBoundingClientRect();
  return { featuresRight: a.right, diagramLeft: b.left };
});
check('desktop: two-column datasheet body', cols.featuresRight <= cols.diagramLeft, JSON.stringify(cols));

// Signature interaction: hovering a block selects its table row, and back.
const blocks = await page.$$eval('.fbd-block', (els) => els.map((e) => e.dataset.block));
check('fbd: six blocks', blocks.join(',') === 'scan,dict,pwr,trim,cfg,site', blocks.join(','));
await page.hover('.fbd-block[data-block="dict"] .fbd-box');
const sel = await page.evaluate(() => ({
  row: document.querySelector('.fbd-table tr[data-block="dict"]')?.hasAttribute('data-on'),
  others: [...document.querySelectorAll('.fbd-table tr[data-on]')].length,
  stroke: getComputedStyle(document.querySelector('.fbd-block[data-block="dict"] .fbd-box')).stroke,
  rowBg: getComputedStyle(document.querySelector('.fbd-table tr[data-block="dict"]')).backgroundColor,
  dim: getComputedStyle(document.querySelector('.fbd-block[data-block="scan"] .fbd-box')).stroke,
}));
check('signature: hover block lights its Table 1 row', sel.row && sel.others === 1, JSON.stringify(sel));
check('signature: selected block takes the accent', sel.stroke === 'rgb(0, 102, 112)', sel.stroke);
check('signature: other blocks recede', sel.dim !== 'rgb(17, 19, 20)', sel.dim);
await page.hover('.fbd-table tr[data-block="trim"]');
check('signature: hover row selects its block', await page.$eval('.fbd-block[data-block="trim"]', (el) => el.hasAttribute('data-on')));
await page.mouse.move(0, 0);
check('signature: selection clears on leave', (await page.$$('.fbd [data-on]')).length === 0);
await page.focus('.fbd-block[data-block="pwr"]');
check('signature: keyboard focus selects too', await page.$eval('.fbd-table tr[data-block="pwr"]', (el) => el.hasAttribute('data-on')));
const hrefs = await page.$$eval('.fbd-block', (els) => els.map((e) => e.getAttribute('href')));
check('fbd: measured blocks link to their timing figure', hrefs.slice(0, 4).join(',') === '/work/#benchmark,/work/#dictation,/work/#footprint,/work/#clip', hrefs.join(','));

// Pins are links; pin table has ten rows.
check('pins: ten pins, nine linked', (await page.$$('.pin-table tbody tr')).length === 10 && (await page.$$('.pkg-link')).length === 9);

// Theme.
await page.click('.theme-toggle');
await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark', null, { timeout: 3000 });
check('theme: dark graphite paper', (await rgb(page, 'html', 'backgroundColor')) === 'rgb(29, 31, 33)');
check('theme: label DARK', (await page.textContent('.theme-toggle-label'))?.trim() === 'DARK');
check('theme: dark keeps one accent on the bar', (await rgb(page, '.sheet-bar', 'backgroundColor')) === 'rgb(82, 198, 207)');
check('theme: persisted', (await page.evaluate(() => localStorage.getItem('theme'))) === 'dark');
await page.reload({ waitUntil: 'domcontentloaded' });
check('theme: survives reload', (await page.$eval('html', (el) => el.dataset.theme)) === 'dark');
await page.evaluate(() => localStorage.removeItem('theme'));

// Assets + metadata.
const avatar = await page.request.get(new URL('avatar.png', base).href);
const abuf = await avatar.body();
check('avatar: 200 PNG', avatar.status() === 200 && abuf.slice(1, 4).toString() === 'PNG');
const og = await page.request.get(new URL('opengraph-image', base).href);
const obuf = await og.body();
check('og: 200 PNG 1200x630', og.status() === 200 && obuf.slice(1, 4).toString() === 'PNG' && obuf.readUInt32BE(16) === 1200 && obuf.readUInt32BE(20) === 630);
const metas = await page.$$eval('meta[name="theme-color"]', (els) => els.map((e) => e.content));
check('meta: theme-color both', metas.includes('#ffffff') && metas.includes('#1d1f21'), metas.join(', '));
const sitemap = await (await page.request.get(new URL('sitemap.xml', base).href)).text();
check('sitemap: lists /work/', /\/work\//.test(sitemap));

// ---------------------------------------------------------------- page 2
const nav = await browser.newPage({ viewport: { width: 1200, height: 720 } });
watch(nav);
await nav.goto(base, { waitUntil: 'networkidle' });
await nav.click('.sheet-nav a[href="/work/"]');
await nav.waitForURL(/\/work\//);
await nav.waitForTimeout(600);
check('nav: client-side / → /work', await nav.evaluate(() => location.pathname === '/work/'));
check('nav: header marks page 2 current', (await nav.$eval('.sheet-nav [aria-current="page"]', (el) => el.textContent)).includes('p.2'));
await nav.close();

const work = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(work);
const wres = await work.goto(WORK, { waitUntil: 'networkidle' });
check('work: 200', wres.status() === 200, String(wres.status()));
const wsec = await work.$$eval('.ds-section > .ds-h2', (els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
check('work: sections 6–10 continue the numbering',
  ['6 Specifications', '7 Timing Characteristics', '8 Die Floorplan', '9 Composition', '10 Revision History'].every((s, i) => wsec[i] === s),
  wsec.join(' | '));
const wcap = await work.$$eval('.ds-caption-n', (els) => els.map((e) => e.textContent.trim()));
check('work: Figures 3–8 and Tables 4–6',
  ['Table 4.', 'Figure 3.', 'Figure 4.', 'Figure 5.', 'Figure 6.', 'Figure 7.', 'Table 5.', 'Figure 8.', 'Table 6.'].every((c) => wcap.includes(c)),
  wcap.join(' '));

// Electrical characteristics: MIN/TYP/MAX/UNIT header; real values; MIN/MAX
// only where a real spread or limit exists.
const spec = await work.evaluate(() => {
  const head = [...document.querySelectorAll('.spec-table thead th')].map((t) => t.textContent.trim());
  const rows = [...document.querySelectorAll('.spec-table tbody tr:not(.spec-group)')].map((tr) => [...tr.children].map((c) => c.textContent.trim()));
  return { head, rows };
});
check('spec: columns Parameter / Test conditions / MIN / TYP / MAX / UNIT', spec.head.join('|') === 'Parameter|Test conditions|MIN|TYP|MAX|UNIT', spec.head.join('|'));
const row = (p) => spec.rows.find((r) => r[0] === p);
check('spec: scan 2.2 s TYP, no invented MIN/MAX', row('Scan time, getattrlistbulk')?.slice(2).join('|') === '|2.2||s', JSON.stringify(row('Scan time, getattrlistbulk')));
check('spec: dictation 131 ms', row('Key release to text, edit-by-voice')?.[3] === '131');
check('spec: wattsbar 12 MB', row('Resident memory, Swift + IOKit')?.[3] === '12');
check('spec: free tier 9.4 under MAX 10', row('Output size, Free tier')?.slice(3, 5).join('|') === '9.4|10');
const perRepo = row('Source per repository');
check('spec: repo spread has MIN ≤ TYP ≤ MAX', perRepo && +perRepo[2] <= +perRepo[3] && +perRepo[3] <= +perRepo[4], JSON.stringify(perRepo));
const singles = spec.rows.filter((r) => r[0] !== 'Source per repository' && !/Output size, (Free|Nitro)/.test(r[0]));
check('spec: single measurements leave MIN and MAX empty', singles.every((r) => r[2] === '' && r[4] === ''));

// Timing diagrams.
const timing = await work.evaluate(() =>
  [...document.querySelectorAll('.timing')].map((t) => ({
    id: t.id,
    lanes: t.querySelectorAll('.timing-lane').length,
    mine: t.querySelectorAll('.timing-mine.timing-lane').length,
    repo: t.querySelector('figcaption a')?.getAttribute('href'),
    done: t.hasAttribute('data-done'),
  })),
);
check('timing: four diagrams in order', timing.map((t) => t.id).join(',') === 'benchmark,dictation,footprint,clip', timing.map((t) => t.id).join(','));
check('timing: lane counts 3/4/2/4', timing.map((t) => t.lanes).join(',') === '3,4,2,4');
check('timing: one highlighted trace each', timing.every((t) => t.mine === 1));
check('timing: each links its repo', timing.every((t) => /github\.com\/blarer\//.test(t.repo ?? '')));

// Motion grammar: a diagram below the fold arms empty and sweeps in whole
// steps when scrolled to; it is never mid-sweep with a smooth fraction.
const armed = await work.$eval('#clip', (el) => ({ armed: el.hasAttribute('data-armed'), done: el.hasAttribute('data-done') }));
check('motion: below-fold diagram armed, not yet drawn', armed.armed && !armed.done, JSON.stringify(armed));
await work.$eval('#clip', (el) => el.scrollIntoView({ block: 'center' }));
const samples = [];
for (let i = 0; i < 8; i++) {
  await work.waitForTimeout(140);
  samples.push(await work.$eval('#clip .timing-cursor', (c) => Number(c.getAttribute('x1'))).catch(() => null));
}
const xs = samples.filter((v) => v !== null);
check('motion: cursor sweeps forward', xs.length >= 3 && xs.every((v, i) => i === 0 || v >= xs[i - 1]) && xs[xs.length - 1] > xs[0], xs.join(','));
// Each cursor position is an integer number of ticks along the plot.
const step = await work.evaluate(() => {
  const plot = 640 - 204 - 78;
  const x = Number(document.querySelector('#clip .timing-cursor')?.getAttribute('x1') ?? NaN);
  return ((x - 204) / plot) * 24;
});
check('motion: cursor lands on whole ticks', Number.isNaN(step) || Math.abs(step - Math.round(step)) < 1e-6, String(step));
await work.waitForTimeout(3000);
check('motion: sweep completes', await work.$eval('#clip', (el) => el.hasAttribute('data-done')));
check('motion: final values printed', (await work.$$eval('#clip .timing-value', (els) => els.map((e) => e.textContent))).includes('9.4 MB'));
check('motion: no running CSS animations at rest', (await work.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)) === 0);

// Floorplan (treemap) and probe.
const fp = await work.evaluate(() => ({
  tiles: document.querySelectorAll('.treemap .tile').length,
  frame: getComputedStyle(document.querySelector('.treemap')).borderTopWidth,
}));
check('floorplan: one tile per repository (21)', fp.tiles === 21, String(fp.tiles));
check('floorplan: die outline drawn', fp.frame === '2px', fp.frame);
await work.$eval('#work', (el) => el.scrollIntoView());
const tile = await work.$('.tile:not([data-private])');
const tb = await tile.boundingBox();
await work.mouse.move(tb.x + tb.width / 2, tb.y + tb.height * 0.2);
await work.waitForTimeout(200);
check('floorplan: probe names a language', !!(await work.$('.probe')) && /\d+%/.test(await work.textContent('.probe')));
check('floorplan: readout links the repo', /github\.com\/blarer\//.test((await work.$eval('.readout-name a', (a) => a.href).catch(() => '')) ?? ''));

// Composition.
check('composition: ring present', !!(await work.$('svg.ring')));
const langRows = await work.$$eval('.lang-table tbody tr', (els) => els.length);
check('composition: one row per language (21)', langRows === 21, String(langRows));

// Revision history from git log.
const revs = await work.$$eval('.rev-table tbody tr', (els) => els.map((e) => e.querySelector('th').textContent.trim()));
check('revisions: present, newest first', revs.length >= 10 && revs[revs.length - 1] === 'A', revs.join(','));
const headRev = await work.$eval('.sheet-doc', (el) => el.textContent.match(/REV (\S+)/)?.[1]);
check('revisions: header REV is the newest revision', headRev === revs[0], `${headRev} vs ${revs[0]}`);

// ---------------------------------------------------------------- no JS
const nojsCtx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const nojs = await nojsCtx.newPage();
await nojs.goto(WORK, { waitUntil: 'load' });
const nj = await nojs.evaluate(() => ({
  timingDone: [...document.querySelectorAll('.timing')].every((t) => t.hasAttribute('data-done')),
  values: document.querySelectorAll('.timing-value').length,
  tiles: document.querySelectorAll('.treemap .tile').length,
  spec: document.querySelectorAll('.spec-table tbody tr').length,
}));
check('no-JS: timing diagrams render finished', nj.timingDone && nj.values === 13, JSON.stringify(nj));
check('no-JS: floorplan drawn', nj.tiles === 21, String(nj.tiles));
check('no-JS: spec table present', nj.spec > 15, String(nj.spec));
await nojs.goto(base, { waitUntil: 'load' });
check('no-JS: front block diagram present', (await nojs.$$('.fbd-block')).length === 6);
await nojsCtx.close();

// ---------------------------------------------------------------- reduced motion
const rmCtx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
const rm = await rmCtx.newPage();
watch(rm);
await rm.goto(WORK, { waitUntil: 'networkidle' });
await rm.waitForTimeout(400);
const rmState = await rm.evaluate(() => ({
  done: [...document.querySelectorAll('.timing')].every((t) => t.hasAttribute('data-done')),
  armed: document.querySelectorAll('.timing[data-armed]').length,
  cursors: document.querySelectorAll('.timing-cursor').length,
}));
check('reduced: every timing diagram static and complete', rmState.done && rmState.armed === 0 && rmState.cursors === 0, JSON.stringify(rmState));
await rmCtx.close();

// ---------------------------------------------------------------- mobile
for (const url of [base, WORK]) {
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(mob);
  await mob.goto(url, { waitUntil: 'networkidle' });
  const name = url === base ? 'front' : 'work';
  check(`mobile ${name}: no horizontal overflow`, (await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
  check(`mobile ${name}: header bar and nav fit`, await mob.$eval('.sheet-nav', (el) => el.getBoundingClientRect().right <= innerWidth + 0.5));
  if (name === 'front') {
    const one = await mob.evaluate(() => {
      const a = document.querySelector('#features').getBoundingClientRect();
      const b = document.querySelector('.fbd-figure').getBoundingClientRect();
      return b.top >= a.bottom;
    });
    check('mobile: single column', one);
  }
  await mob.close();
}

check('no console/page errors', errors.length === 0, errors.join(' | '));

await browser.close();

let fails = 0;
for (const r of results) {
  console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}${r.ok ? '' : '  → ' + r.detail}`);
  if (!r.ok) fails++;
}
console.log(`\n${results.length - fails} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
