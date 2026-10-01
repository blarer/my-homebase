# my-homebase

Personal site at [louds.net](https://louds.net). Next.js App Router, static
export, deployed to Cloudflare Workers via OpenNext.

The canonical origin used for metadata, the sitemap, and robots.txt lives in
`lib/site.js`. Change it there if the domain moves.

## The idea

The front page is an introduction: a title page, one living figure (a tiny
neural network painting a field that drifts and never repeats), and a few
paragraphs. The measured work lives at `/work`: the `storage-manager-swift`
benchmark run as a race, folded under the page title; a squarified treemap
of the real repositories, each tile sized by actual source bytes and split
into language bands; and the languages, counted. One signal colour per theme
(fountain-pen blue by daylight, old gold by lamplight) marks only what has
been measured; every other saturated colour on the page is carrying data.
The full design direction lives in `design/DIRECTION.md`.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # treemap, band-probe, and privacy tests
npm run build      # static production build
```

Two browser-driven scripts need a server running and Chrome installed
(they load Playwright from the npx cache, no install step):

```bash
npx next start -p 3778 &
npm run test:acceptance          # ~80 checks over / and /work: fonts, layout, atlas, motion, theme, reduced motion
URL=http://localhost:3000/ npm run screens   # regenerate design/screens/review/
```

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
| `app/page.jsx` | Front page: title, atlas, about |
| `app/work/page.jsx` | The figures: benchmark, treemap, languages |
| `app/globals.css` | Design tokens and all component styles |
| `app/motion.css` | Load sequence, idle motion, reveals, theme crossfade |
| `components/Hero.jsx` | Title page |
| `components/Atlas.jsx` | The drifting CPPN figure |
| `components/Benchmark.jsx` | Benchmark race, as a disclosure |
| `components/Work.jsx` | Repository treemap and readout |
| `components/Stack.jsx` | Language ranking |
| `lib/treemap.js` | Squarified treemap layout |
| `scripts/sync-repos.mjs` | Writes `lib/repos.json` |
| `scripts/test-treemap.mjs` | Property tests for the layout |
| `scripts/test-acceptance.mjs` | Browser acceptance checks against a running server |
| `scripts/capture-screens.mjs` | Full-page screenshots, both themes, desktop and mobile |

## Deploying

```bash
npm run preview:cf   # build and serve the Worker locally
npm run deploy:cf    # build and deploy
```
