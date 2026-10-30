# my-homebase

Personal site at [louds.net](https://louds.net). Next.js App Router, static
export, deployed to Cloudflare Workers via OpenNext.

The canonical origin used for metadata, the sitemap, and robots.txt lives in
`lib/site.js`. Change it there if the domain moves.

## The idea

The site is the datasheet of an engineer, set like a semiconductor
datasheet. Page 1 (`/`) is the part's front page: features, applications,
a functional block diagram with one block per project, the description,
pinout and ordering information. Page 2 (`/work`) is the characterization:
an electrical characteristics table, the four benchmarks as timing
diagrams, the repositories as a die floorplan (a squarified treemap sized
by real source bytes and split into language bands), language composition,
and a revision history generated from git log. The design authority is
`design/DESIGN.md`.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # treemap, band-probe, and privacy tests
npm run build      # static production build
```

Two browser-driven scripts need a server running and Chromium. Point
`PLAYWRIGHT_PATH` at a playwright install and `CHROME_PATH` at a Chromium
binary (defaults: the npx cache and the installed Chrome channel):

```bash
npx next start -H 127.0.0.1 -p 3778 &
npm run test:acceptance          # ~80 checks: header block, sections, signature interaction, timing motion, no-JS, reduced motion, mobile
npm run screens                  # regenerate design/screens/review/
```

After committing, `node scripts/sync-revisions.mjs` refreshes
`lib/revisions.json`, which feeds the revision history table and the REV in
the page header.

## Repository data

The page renders from `lib/repos.json`, a committed snapshot of the GitHub API.
That keeps the build fully static: no runtime API calls, no rate limits, and a
deterministic page. Refresh it after pushing new work:

```bash
npm run sync:repos              # add GITHUB_TOKEN=... to raise the rate limit
```

Adding a repository needs nothing else. Its treemap tile, language bands, and
row in the languages table all derive from the snapshot. Optionally add a
sentence to `NOTES` in `components/work/Treemap.jsx` to override the GitHub description
in the readout, and a colour to `lib/languageColors.js` if the language is new.

## Layout

| Path | Purpose |
|---|---|
| `app/page.jsx` | Page 1: features, block diagram, description, pins, ordering |
| `app/work/page.jsx` | Page 2: specifications, timing, floorplan, composition, revisions |
| `app/styles/` | `tokens.css`, `base.css`, `sheet.css` (chrome, sections, tables), `figures.css` |
| `components/sheet/` | Page header block and footer |
| `components/home/` | `BlockDiagram` (Figure 1 + Table 1), `Pinout` |
| `components/work/` | `SpecTable`, `Timing`, `Treemap`, `Languages`, `LanguageRing`, `RevisionHistory` |
| `lib/datasheet.js` | Part number, blocks, pins, snapshot totals |
| `lib/figures.js` | The four benchmarks, quoted from each repository |
| `lib/treemap.js` | Squarified treemap layout |
| `scripts/sync-repos.mjs` | Writes `lib/repos.json` |
| `scripts/sync-revisions.mjs` | Writes `lib/revisions.json` from git log |
| `scripts/test-treemap.mjs` | Property tests for the layout |
| `scripts/test-acceptance.mjs` | Browser acceptance checks against a running server |
| `scripts/capture-screens.mjs` | Full-page screenshots, both themes, desktop and mobile |

## Deploying

```bash
npm run preview:cf   # build and serve the Worker locally
npm run deploy:cf    # build and deploy
```
