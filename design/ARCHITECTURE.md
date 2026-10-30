# Architecture: louds.net after the revamp

Companion to `DIRECTION.md` (the visual world, unchanged in spirit) and
`AUDIT.md` (why each change below exists). This file is the map of the code.

## Principles

1. **Offprint stays.** Book paper, one spot colour meaning "measured", zero
   radius, Old Standard + Courier Prime, Headbang for the two letters.
   Deviations from DIRECTION.md are listed at the end and nowhere else.
2. **Server first.** Every figure renders its measured values on the server.
   JavaScript adds motion and interaction, never content.
3. **One cascade, declared up front.** CSS order is decided by `@layer`, not
   by which chunk Next happens to emit first.
4. **Data is not markup.** Measured numbers live in `lib/`, components only
   draw them.

## Directory layout

```
app/
  layout.jsx            fonts, metadata, <Masthead>, skip link, scripts
  page.jsx              /      : TitlePage, Atlas, About
  work/page.jsx         /work  : WorkHead, FigureIndex, 4 Races, Treemap, Languages
  not-found.jsx
  styles/
    index.css           @layer order + imports, the only CSS entry point
    reset.css           @layer reset      (replaces Tailwind preflight)
    tokens.css          @layer tokens     (palette, type scale, space, motion)
    base.css            @layer base       (elements, browser surfaces, type roles)
    layout.css          @layer layout     (shell, section, figure head)
    site.css            @layer components (masthead, footer, toggle, 404)
    home.css            @layer components (title page, atlas, about, portrait)
    race.css            @layer components (folded figures, lanes, axis)
    treemap.css         @layer components (tiles, probe, readout)
    languages.css       @layer components (ring, ranked list)
    motion.css          @layer motion     (load, idle, response, reveal)
components/
  site/   Masthead, Footer, ThemeToggle, ThemeScript, RevealScript
  ui/     Section, FigureHead          (the shared figure scaffold)
  home/   TitlePage, Atlas, About
  work/   Race, Figures, FigureIndex, Treemap, Languages, LanguageRing
lib/
  figures.js        the four benchmark figures as data (single source for
                    the races and the list of figures)
  format.js         bytes(), shared by treemap, ring, and list
  repos.json        synced snapshot (unchanged)
  treemap.js, languageColors.js, site.js (unchanged)
```

## CSS layering

```css
@layer reset, tokens, base, layout, components, motion;
```

- `reset` carries the reduced-motion kill with `!important`; in the layered
  cascade an important declaration in the *earliest* layer wins, so nothing
  later can re-enable motion by accident.
- `motion` is last so transitions and keyframes apply over component
  defaults without specificity tricks. The old "prefix with the section
  container to win ties" pattern is gone.
- Tailwind is removed. It was imported for preflight only, no utility class
  was used, and its `.ring` utility collided with the language ring.

## Design tokens (tokens.css)

| Group | Tokens |
|---|---|
| Colour | `--paper --paper-raised --ink --ink-soft --ink-faint --accent --accent-soft --rule --rule-soft --track --hatch --glow --glow-strong` per theme |
| Type | `--font-serif --font-mono --font-name`, scale `--step--1 … --step-5` (fluid `clamp`, ratio ≈ 1.25 → 1.333 across viewport) |
| Space | `--space-3xs … --space-3xl` fluid, `--gutter --shell --measure` |
| Motion | `--ease-snap --ease-settle` (both exponential out), `--dur-flip 140ms --dur-move 320ms --dur-reveal 600ms` |
| Chrome | `--masthead-h` |

## Page composition

### Site chrome (new)

- **Skip link** to `#main`.
- **Masthead**: a journal running head. Left: the J·L mark linking home.
  Centre: the running title, which follows the figure currently being read
  (IntersectionObserver over `[data-running-head]`). Right: navigation
  (Introduction, The work) with an accent rule that slides to the current
  page, and the theme switch. A hairline progress rule along its foot is a
  CSS scroll-driven animation (`animation-timeline: scroll()`), so it costs
  no JS. It tucks away on scroll down and returns on scroll up.
- **Footer** becomes a colophon: fonts, data provenance, links, the switch.

### `/`

Title page → Fig. 0 Atlas → About. Unchanged order. The "Notes — About"
eyebrow is removed; the heading speaks for itself.

### `/work`

Page title and lede, then a **List of figures**: a ruled table of contents
with dot leaders and the figure's unit, each row linking to its figure.
Following a link to a folded figure opens it (hash handling in `Race`).
Then the four folded races, the treemap, the languages.

### Figure heads

`ui/FigureHead` renders the title first and the figure designation under it
in the caption line ("Fig. 5 · Work"), the way a plate is captioned. This
replaces the eyebrow-above-heading pattern the detector flagged, and keeps
the cross-reference.

## Motion

One authored moment per page, then quiet:

- `/`: the title page composes (ink settles, Oxford rule draws), the atlas
  plate develops.
- `/work`: the list of figures draws its leaders row by row.
- Folded figures open and close with a height transition
  (`interpolate-size` + `::details-content`, progressive enhancement).
- Theme switch: a View Transition wipes the new palette in as a circle from
  the switch itself; falls back to the existing crossfade.
- Every keyframe has a settled reduced-motion state.

## Data flow

`lib/repos.json` → `app/work/page.jsx` (server) → `Treemap`, `Languages`
(client islands for hover only). `lib/figures.js` → `Figures` (server) →
`Race` (client) and `FigureIndex` (server). Nothing fetches at runtime.

## Performance and accessibility budget

- First load JS per route stays within 5 kB of baseline.
- Secondary text ≥ 4.5:1 in both themes; functional text ≥ 12px.
- Every interactive target ≥ 24×24 CSS px; visible focus on all.
- Masthead uses `<header>` + `<nav aria-label="Site">` with
  `aria-current="page"`.

## Deviations from DIRECTION.md

| Rule | Change | Reason |
|---|---|---|
| `--ink-faint` | `#7d766a` → `#6e675b` (daylight), `#7f7562` → `#8f8571` (lamplight) | 3.98:1 and 4.04:1 failed WCAG AA; now 4.96:1 and 5.04:1 |
| Figure heads | number moves from above the title to the caption line under it | eyebrow-over-heading is a detector ban; the number still cross-references |
| Two pages, no chrome | adds a masthead | there was no way to move between pages except the footer and an eyebrow chip |
