# Audit: louds.net (Offprint)

Audited 2026-10-30 on branch `agent/impeccable-revamp`, against commit
`main@HEAD` before any revamp work. Tooling: impeccable v0.1.18 detector
(`impeccable detect --json`), Next 15 production build, Node 22 (nix shell),
Chromium 156 (nix, `--no-sandbox` wrapper, used only for URL scans).

## Baseline commands

| Step | Result |
|---|---|
| `npm ci` | ok |
| `npm test` (treemap, band probe, privacy) | pass. Privacy name comparison reports UNVERIFIED because `gh` is not authenticated on this host; structural checks pass |
| `npm run build` | ok. `/` 10.2 kB (116 kB first load), `/work` 5.05 kB (110 kB) |
| `npm run lint` | no warnings |

## Detector, before

### Static HTML (`.next/server/app/{index,work}.html`)

The static scan cannot resolve `/_next/static/css/*` from the server output
directory, so it judges unstyled markup. Its only finding,
`flat-type-hierarchy` (h1 = h2 = body = 16px) on both pages, is a false
positive caused by missing CSS. The rendered scan below is the one that counts.

### Rendered (`next start`, `/` and `/work/`): 20 warnings, 2 advisories

| Rule | Count | Where | Verdict |
|---|---|---|---|
| `low-contrast` | 7 | `--ink-faint #7d766a` on paper `#f3f1ec` is 3.98:1. Used by every `.tag`, captions, lane notes, readout keys | **Real, P1.** WCAG AA fail on all secondary text. Lamplight `#7f7562` on `#17140f` is 4.04:1, same failure |
| `undersized-ui-text` | 4 | `.benchmark-hint` "Open the figure" at 10.5px | **Real, P2.** Functional affordance below the 11px floor |
| `kicker-above-heading` | 3 | "Notes — About", "Fig. 5 — Work", "Fig. 6 — Languages" stacked above h2 | **Real, P2.** Craft-floor ban. The figure number carries information (it is how a monograph cross-references), so it stays, but it should be set in the caption line, not as an eyebrow |
| `hero-eyebrow-chip` | 1 | "← Home" tracked caps above `/work` h1 | **Real, P2.** Navigation dressed as a label. There is no site navigation at all, so this chip is doing the job a masthead should |
| `cream-palette` | 2 | page background `#f3f1ec` | **Pinned by brief.** DIRECTION.md specifies book paper. Kept, documented deviation |
| `gradient-text` | 1 | hero letters, `background-clip: text` | **Pinned by brief.** The lit J/L are the one decorative moment DIRECTION.md asks for, and acceptance tests assert it. Kept |
| `text-overflow` | 1 | `.hero-letter-j` overflows by 84px | **Intended.** Headbang overhangs its advance width; DIRECTION.md explains the oversized lit copy. False positive |
| `bounce-easing` (advisory) | 2 | `motion.css:440` `cubic-bezier(0.34, 1.4, 0.64, 1)` on the theme knob | **Real, P3.** Contradicts the brief's one-easing rule |

## Code-level audit

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Secondary-text contrast fails AA in both themes. No skip link, no site navigation landmark; folded figures cannot be reached by URL hash (the `<details>` stays shut). Global `0.01ms` reduced-motion kill is acceptable here because every state change has a settled final frame |
| 2 | Performance | 3 | Static, small bundles, atlas pauses offscreen. `motion.css` imported from 7 components and `components.css` from 3, so the chunk graph decides cascade order |
| 3 | Theming | 3 | Full token set for both themes. A second token block lives in `components.css` (glow), and `--tw-*` overrides are patched into `globals.css` to fight a utility shadow |
| 4 | Responsive | 3 | No horizontal overflow at 390px. Six ad-hoc breakpoints (640/720/860/900) |
| 5 | Implementation integrity | 2 | See below |
| **Total** | | **13/20** | Acceptable, significant structural work needed |

### Implementation integrity verdict: fail on structure, pass on world

The visual world is coherent and specific (Offprint is not interchangeable
with anything else). The code under it is not:

- **Three global stylesheets with no layering.** `globals.css` (1573 lines),
  `components.css` (198) and `motion.css` (549) are all unlayered globals.
  `components.css` openly says its selectors are "prefixed with their
  section containers to win ties regardless of chunk order". Cascade
  correctness depends on Next's chunk order and selector weight.
- **Comment drift.** `globals.css` heads the title page section "Hero: the
  benchmark race", and `components.css` heads the lane glow "Hero". Both
  are leftovers of two earlier directions.
- **Flat `components/` folder.** Front-page, work-page, and site-chrome
  components sit side by side; `Benchmark.jsx` mixes measured data with
  rendering; `bytes()` formatting is duplicated across `Work`, `Stack`, and
  `LanguageRing`.
- **Section scaffolding is hand-copied** (`section > shell > section-head >
  tag + h2`) in four components with small differences.
- **No site chrome.** Pages have no masthead, no current-page indicator, no
  list of figures; the only way between pages is a link at the bottom of
  About, the footer, and the eyebrow chip.

## Priorities

1. P1 contrast: lift `--ink-faint` to ≥4.5:1 on paper and plate in both themes.
2. P2 structure: layered CSS (`@layer`), one stylesheet per component area,
   one shared `Section`/`FigureHead` primitive, data out of render code.
3. P2 chrome: masthead with real navigation and reading progress, a list of
   figures on `/work`, hash links that open folded figures.
4. P2 kicker/eyebrow: set figure numbers inline in the caption line.
5. P3 motion: one easing; animate `<details>` open/close; one authored
   entrance per page rather than the same rise everywhere.

## After

See the "After" section appended below once the revamp lands.
