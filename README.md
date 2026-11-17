# my-homebase

Personal site at [louds.net](https://louds.net). Next.js App Router, static
export, deployed to Cloudflare Workers via OpenNext.

The canonical origin used for metadata, the sitemap, and robots.txt lives in
`lib/site.js`. Change it there if the domain moves.

## The idea

The front page is an introduction: a centred hero, one living figure (a tiny
neural network painting a field that drifts and never repeats), and a few
paragraphs. The measured work lives at `/work`: four benchmark results as
headline tiles, a list of figures, each benchmark run as a race folded under
its title, a squarified treemap of the real repositories sized by source bytes
and split into language bands, and the languages, counted.

The site is built with the [Astryx](https://github.com/meta/astryx) design
system (`@astryxdesign/core` 0.7.16). Every page starts from an Astryx
template and is composed from Astryx components; colours, type, spacing and
corners come from the `homebase` theme. See `design/ASTRYX.md`.

## Running it

```bash
npm install
npm run dev        # next dev; use `npx next dev -H 127.0.0.1` to stay off the LAN
npm test           # treemap, band-probe, and privacy tests
npm run build      # static production build
```

The screenshot script needs a server and a Playwright install (point
`PLAYWRIGHT_PATH` at one):

```bash
npx next start -H 127.0.0.1 -p 3778 &
PLAYWRIGHT_PATH=/path/to/node_modules/playwright npm run screens   # writes design/screens/review/
```

`scripts/test-acceptance.mjs` asserts the previous (Offprint) markup and has
not been ported to the Astryx pages.

## Repository data

The page renders from `lib/repos.json`, a committed snapshot of the GitHub API.
That keeps the build fully static: no runtime API calls, no rate limits, and a
deterministic page. Refresh it after pushing new work:

```bash
npm run sync:repos              # add GITHUB_TOKEN=... to raise the rate limit
```

Adding a repository needs nothing else. Its treemap tile, language bands, and
row in the languages table all derive from the snapshot. Optionally add a
sentence to `NOTES` in `components/Work.jsx` to override the GitHub description
in the readout, and a colour to `lib/languageColors.js` if the language is new.

## Layout

| Path | Purpose |
|---|---|
| `app/layout.jsx` | Astryx base CSS, theme script, site shell |
| `app/page.jsx` | Front page (template `centered-hero`) |
| `app/work/page.jsx` | The figures (template `dashboard`) |
| `app/not-found.jsx` | 404 inside the shell |
| `components/site/SiteShell.jsx` | `Theme`, `AppShell`, `TopNav`, dark-mode `Switch` (template `shell-top-nav`) |
| `components/site/ThemeScript.jsx` | Sets light/dark on `<html>` before first paint |
| `components/home/` | `Hero`, `Atlas` (CPPN canvas), `About` |
| `components/work/` | `MetricCard`, `FigureTable`, `Race`, `Treemap`, `Languages`, `LanguageRing` |
| `themes/homebase/` | Theme editor source and previews (`astryx experimental theme editor`) |
| `src/themes/homebase/`, `src/astryx-themes.js` | Built theme, generated; do not edit |
| `lib/treemap.js` | Squarified treemap layout |
| `scripts/sync-repos.mjs` | Writes `lib/repos.json` |
| `scripts/test-*.mjs` | Treemap, band probe and privacy tests |

## Changing the look

```bash
npm run astryx -- experimental theme editor set homebase <thing> <value>
npm run astryx -- experimental theme editor show homebase --png   # look at it
npm run astryx -- doctor
```

## Deploying

```bash
npm run preview:cf   # build and serve the Worker locally
npm run deploy:cf    # build and deploy
```
