# my-homebase

Personal site at [louds.net](https://louds.net). Next.js App Router, static
export, deployed to Cloudflare Workers via OpenNext.

The canonical origin used for metadata, the sitemap, and robots.txt lives in
`lib/site.js`. Change it there if the domain moves.

## The idea

The site argues rather than asserts. The hero runs the `storage-manager-swift`
benchmark as a race on a shared time axis, and the work section is a squarified
treemap of the real repositories, each tile sized by actual source bytes and
split into language bands. There is no brand accent colour, so every saturated
colour on the page is carrying data.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # treemap property tests
npm run build      # static production build
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
| `app/page.jsx` | Section order, reads the snapshot |
| `app/globals.css` | Design tokens and all component styles |
| `components/Hero.jsx` | Benchmark race |
| `components/Work.jsx` | Repository treemap and readout |
| `components/Stack.jsx` | Language ranking |
| `lib/treemap.js` | Squarified treemap layout |
| `scripts/sync-repos.mjs` | Writes `lib/repos.json` |
| `scripts/test-treemap.mjs` | Property tests for the layout |

## Deploying

```bash
npm run preview:cf   # build and serve the Worker locally
npm run deploy:cf    # build and deploy
```
