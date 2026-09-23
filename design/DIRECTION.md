# Direction A — Evolution: "Vellum & Redline"

The current site is an engineering drawing reduced to its minimum: grey graph
paper, one ink, no accent. It is honest but austere. This direction keeps the
technical-drafting soul and pushes it toward the *artifact itself*: a real
drafting sheet has warmth (vellum, not photocopier grey), depth (the sheet sits
on a desk, tools cast shadows), and one non-ink colour — the checker's red
pencil, which marks exactly the things that have been verified.

That last point resolves the old palette's rule ("the only saturated colour is
data") without breaking it: **red is not a brand accent, it is the checker's
markup**. It appears only where a claim has been measured and verified — the
`storage-manager` lane in the benchmark race, finished times, focus rings, the
active-tile ring. Hue still means something.

## Palette

### Light — vellum sheet

| Token | Value | Note |
|---|---|---|
| `--paper` | `#eae6dc` | warm vellum, replaces cool `#eceef0` |
| `--paper-raised` | `#f6f3ea` | brighter plate for framed surfaces |
| `--ink` | `#1a1712` | warm carbon black (graphite, not toner) |
| `--ink-soft` | `#524c3f` | warm dark grey |
| `--ink-faint` | `#847b68` | annotation grey |
| `--accent` | `#b03a24` | checker's red pencil |
| `--accent-soft` | `rgba(176, 58, 36, 0.14)` | redline wash |
| `--rule` | `rgba(26, 23, 18, 0.16)` | |
| `--rule-soft` | `rgba(26, 23, 18, 0.08)` | |
| `--grid` | `rgba(26, 23, 18, 0.055)` | minor gridline |
| `--grid-major` | `rgba(26, 23, 18, 0.10)` | major gridline, every 4th cell |
| `--track` | `rgba(26, 23, 18, 0.06)` | |
| `--hatch` | `rgba(26, 23, 18, 0.32)` | |
| `--shadow-low` | `0 1px 2px rgba(26,23,18,0.08), 0 4px 14px rgba(26,23,18,0.07)` | |
| `--shadow-high` | `0 2px 4px rgba(26,23,18,0.10), 0 14px 40px rgba(26,23,18,0.14)` | |

### Dark — cyanotype film

Dark stays "drafting film", but leans into the cyanotype: a blue-black ground
with cream ink (the literal inversion of ink on vellum), and the red pencil
brightened to survive the dark field.

| Token | Value | Note |
|---|---|---|
| `--paper` | `#0f151c` | blue-black film |
| `--paper-raised` | `#161e26` | |
| `--ink` | `#ece7da` | cream ink (warm, not white) |
| `--ink-soft` | `#a3a091` | |
| `--ink-faint` | `#77776a` | |
| `--accent` | `#e2593b` | red pencil under a lamp |
| `--accent-soft` | `rgba(226, 89, 59, 0.18)` | |
| `--rule` | `rgba(236, 231, 218, 0.17)` | |
| `--rule-soft` | `rgba(236, 231, 218, 0.08)` | |
| `--grid` | `rgba(151, 179, 204, 0.055)` | minor grid picks up the blueprint blue |
| `--grid-major` | `rgba(151, 179, 204, 0.10)` | |
| `--track` | `rgba(236, 231, 218, 0.07)` | |
| `--hatch` | `rgba(236, 231, 218, 0.34)` | |
| `--band-rest` / `--band-active` | `0.34` / `0.74` | slightly richer than before |
| `--shadow-low/high` | black-based, deeper | shadows on film are real darkness |

## Depth & texture (the "crafted" layer)

1. **Two-scale graph paper.** Minor grid every 26px, a heavier major line every
   4th cell (104px) — real graph paper, not a photocopy of one.
2. **Film grain + vignette.** A fixed full-viewport pseudo-element carries an
   SVG `feTurbulence` grain (data URI, zero deps) at ~5% opacity plus a soft
   radial vignette, so the sheet reads as material rather than as `#eee`.
3. **Real elevation.** The treemap frame and the hover probe get layered
   shadows (`--shadow-low` / `--shadow-high`); the frame gets drafting corner
   crosshair ticks drawn with gradients. Tiles lift with a shadow on hover.
4. **Zero border-radius stays.** The geometry is the identity; softness comes
   from light, not from rounding.

## Type pairing

- **Display:** Archivo (unchanged — the width axis *is* the drafting voice),
  still stretched, still uppercase.
- **Data:** IBM Plex Mono (unchanged) for every number, label, tag.
- **New — prose:** **IBM Plex Serif** (`next/font/google`, `IBM_Plex_Serif`)
  for running text only: hero thesis, section ledes, readout notes, race
  caption, the About body. Plex Serif is drawn on the same grid as Plex Mono,
  so the pairing reads as one family in two registers: measured things stay
  mono, *explained* things become bookish. This is the single biggest
  "crafted vs. austere" move and costs nothing structurally.

## Motion language

One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` ("drafting
snap" — fast attack, long settle, like a spring scale coming to rest).
Durations: 160ms flips (bands, ring dim), 360ms surface moves (lifts, stroke
widths, toggle), 700ms reveals (captions, section rises). All exposed as
`--ease-snap`, `--dur-flip`, `--dur-move`, `--dur-reveal`.

- **Scroll reveals:** sections fade-and-rise 24px using CSS scroll-driven
  animations (`animation-timeline: view()`) behind `@supports` — pure
  progressive enhancement, zero JS. The `prefers-reduced-motion` block
  explicitly detaches the timeline (`animation: none`), since a view-timeline
  animation has no duration to clamp.
- **Hero benchmark race, reimagined:** lanes become instrumented tracks with
  faint vertical tick marks (a time axis you can feel, half a grid cell
  apart). The two baseline lanes stay ink hatching; the `storage-manager`
  lane fills in **checker's red** with a soft red glow and a red needle
  playhead. Finished times stamp in ink; the winning time stamps in red at
  weight 600. The caption rises 6px while fading in on the snap curve, like a
  conclusion written under the plot. Race timing (2.4s wall clock, rAF,
  reduced-motion jumps to final state) untouched.
- **Language bands, reimagined:** treemap tiles lift with `--shadow-low` on
  hover/active and their bands saturate on the move duration; in the ranked
  list, each bar carries an ink needle at its leading edge (same playhead
  vocabulary as the hero) and rows glow with a soft track wash on hover. The
  ring's active segment widens on the snap curve.
- **Red appears in interaction chrome only as verification:** focus rings,
  selection highlight, link-hover underlines.

## What each section looks like

- **Hero:** warm vellum with visible two-scale grid; huge stretched Archivo
  "BLARE" in carbon ink; serif thesis; below, three instrument lanes with tick
  marks, two ink-hatched, one solid red with a glowing needle and a red 2.2s
  stamp.
- **Work:** treemap sits on a genuinely raised plate (shadow + corner
  crosshairs) over the vellum; tiles lift under the cursor; the probe tooltip
  floats with the high shadow.
- **Languages:** ring and ranked bars unchanged in data, richer in motion;
  needle-tipped bars; serif prose around them.
- **About:** serif body turns the page bookish; portrait keeps its
  grayscale-to-colour reveal, now seated with a plate shadow.
- **Footer:** unchanged structure; toggle knob travels on the shared curve.
