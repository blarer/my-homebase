# DESIGN: louds.net, "Datasheet"

Authority for the visual system of louds.net from 2026-10-30. Supersedes
`design/DIRECTION.md` (the retired "Offprint" monograph), which stays in the
repository as evidence only. Product truth lives in `PRODUCT.md`; this file
only describes how that truth is presented.

## Thesis

The site is the datasheet of an engineer, set the way TI, Analog Devices and
NXP set an IC datasheet. A datasheet is the one document engineers already
trust to separate measured values from adjectives: every claim is a
parameter with a unit and a test condition, every figure is numbered, every
change is in the revision history. That is the product's positioning
("evidence over adjectives") turned into a form the audience reads daily.
It refuses the category default of a portfolio: hero, avatar, card grid of
projects, contact button.

## World

| Element | Decision |
|---|---|
| Ground | Datasheet white `#ffffff`, paper-2 `#f4f5f5` for group rows and the package body only |
| Ink | `#111314`, secondary `#3b3f42`, tertiary `#5a6064` (6.1:1 on white, used for units and conditions) |
| Rules | Ink at 2px for table tops/bottoms, page header and footer; ink at 1px under headings; `#c9cdcf` hairlines between table rows |
| Manufacturer colour | BLARE teal `#006670` (6.6:1 on white). Two jobs only: the header bar on every page, and measured values (Features links, TYP of my rows, highlighted traces, selection). Never decoration |
| Dark | The same sheet in a dark PDF viewer: graphite `#1d1f21`, ink `#e9eaea`, teal lifted to `#52c6cf`; still one accent, still rules |
| Data colour | GitHub Linguist colours inside the floorplan and composition figures only, because there colour is data |
| Text face | Hanken Grotesk 400/500/700 (next/font, self-hosted). A sober neo-grotesk, no display mannerisms |
| Value face | Red Hat Mono 400/500 with tabular figures, for values, units, part and pin names, identifiers. Never for running text |
| Corners, shadows | None. Square boxes, hairlines, no shadows, no gradients except the private-repo hatch |

Old fonts (Old Standard, Courier Prime, Headbang) and the WebGL Atlas are
removed. The Atlas was a generative field, not a measurement; a datasheet
figure must plot something real, and nothing it drew was, so it went.

## Document structure

Two pages, one continuous numbering, as a printed datasheet runs over pages.

| Page | Route | Sections | Figures / Tables |
|---|---|---|---|
| 1 Datasheet | `/` | 1 Features, 2 Applications, 3 Description, 4 Pin Configuration and Functions, 5 Ordering Information | Figure 1 block diagram, Table 1 block summary, Figure 2 package, Table 2 pin functions, Table 3 ordering |
| 2 Characterization | `/work/` | 6 Specifications, 7 Timing Characteristics (7.1 to 7.4), 8 Die Floorplan, 9 Composition, 10 Revision History | Table 4 electrical characteristics, Figures 3 to 6 timing, Figure 7 floorplan, Figure 8 composition ring, Table 5 composition, Table 6 revisions |

Every page carries the header block (teal bar: part `BLARE-1`, document
`LOUDS-DS-001`, `REV` = newest revision letter, build date), a running line
(part + title, page links p.1 / p.2, light/dark switch) on a 2px rule, and a
footer rule with document id, page n of 2, colophon and links.

Section numbers are information here, not decoration: they continue across
pages and are cross-referenced in the text ("see 6 Specifications").

## FIRST VIEWPORT

Desktop 1440 x 900, page 1:

1. Teal header bar across the full width (40px): `BLARE-1` left, `LOUDS-DS-001 · REV R · <date>` right, in white.
2. Running line under it on a 2px ink rule: part and title left, `p.1 Datasheet` (current, teal underline) / `p.2 Characterization` / theme switch right.
3. Title block, left aligned to the 1200px sheet: `BLARE-1` in Red Hat Mono at ~56px in teal, the title "Systems-Software Engineer, Measured One Layer Below" at ~21px bold, then the thesis sentence from the old title page ("Systems programmer. I build the tools I wish I had, then measure whether they were worth building."), closed by a 1px ink rule.
4. Two-column body (5fr / 7fr). Left: 1 Features (seven bullets, four carrying the measured headline values as teal mono links into page 2), 2 Applications. Right: Figure 1, the functional block diagram: one die outline, six blocks (SCAN, DICT, PWR, TRIM, CFG, SITE), each with its input signal and pin on the left edge, output on the right, the layer where the fix lived inside the block, and the measured result in teal.
5. The primary action is in the first viewport twice over: every measured value and every measured block links to its characterization figure on page 2; p.2 sits in the running line.

Mobile 390 wide: same order in one column; the header drops the document
number (keeps REV and date); the block diagram keeps a 560px drawing and
scrolls horizontally inside its figure rather than shrinking type below
legibility.

## Signature interaction

**Block select.** Pointing at a block in Figure 1 (hover or keyboard focus)
selects it: the block, its wires and both pins switch to teal at 2px, the
other five blocks drop to hairline grey, and the matching row of Table 1
lights (teal wash, teal block name). Pointing at a Table 1 row selects its
block the same way. Leaving clears the selection. Each block is a link: the
four measured ones go to their timing diagram on page 2, the two unmeasured
ones go to their repository. The floorplan (Figure 7) carries the same
grammar: pointing at a die block outlines it in teal and reads it out below;
pointing inside it names the language band under the pointer.

## Motion grammar

- One unit: the tick, 100 ms. Everything moves in whole ticks, never on an easing curve, the way a logic analyser redraws.
- One authored moment: the timing diagrams on page 2. A diagram that starts below the fold arms empty; when it scrolls into view a teal cursor sweeps the axis in 24 ticks and each BUSY trace is drawn up to the cursor; traces fall as the cursor passes their value, and the value prints at the falling edge. A diagram already on screen at load is drawn complete, so first paint never flashes from full to empty.
- State changes (selection, theme, nav) are instant: one frame, no transition.
- No idle motion. Nothing loops, breathes or drifts.
- Reduced motion and no JavaScript: the server render is the finished capture; nothing arms, nothing sweeps.

## Honesty rules for the tables

- MIN / TYP / MAX are filled only where truthful. A benchmark run reported once is a TYP with MIN and MAX empty. MAX is used for the Discord upload limits (a real limit). MIN/TYP/MAX together appear only for source bytes per repository (smallest, median, largest of the real snapshot).
- Advertised third-party numbers say so in the test conditions ("Advertised, not measured here").
- The revision history is generated from `git log` by `scripts/sync-revisions.mjs` into `lib/revisions.json` (one revision per working day; letters skip I, O, Q, S, X, Z as datasheets do). The header REV is the newest entry. Re-run the script when committing a change that should bump the revision.
- No employers, testimonials, job history or numbers that are not in `lib/figures.js` or `lib/repos.json`.

## Files

- Tokens `app/styles/tokens.css`; sheet chrome, columns, sections, tables `app/styles/sheet.css`; figures `app/styles/figures.css`.
- Content model `lib/datasheet.js` (part, blocks, pins, totals), `lib/figures.js` (benchmarks), `lib/revision.js` + `lib/revisions.json`.
- Components `components/sheet/*` (header, footer), `components/home/*` (BlockDiagram, Pinout), `components/work/*` (SpecTable, Timing, Treemap, Languages, LanguageRing, RevisionHistory).

## Seed

Direction chosen by the user from the impeccable direction round, seed
reference `seed:ea23ad7e0c4f2399`. Build path: code-led (no image
generation available).
