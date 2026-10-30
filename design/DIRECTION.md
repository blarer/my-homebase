> **Superseded 2026-10-30.** This direction is retired. The authority for the visual system is now `design/DESIGN.md` ("Datasheet"). This file is kept as evidence of the previous look only; do not build from it.

# Direction C — "Offprint"

The site is a scientific monograph, printed. Not a metaphor for one: the
hero is a title page, the sections are numbered figures, the running text
is set in the modern-face serif that turn-of-the-century journals were set
in, and every number is typewritten, as if pasted in from the lab report.

The two previous directions (Vellum & Redline, Strip Chart) both dressed the
page as an instrument. This one dresses it as the paper the instrument's
results were published in, which is what a personal site about measurement
actually is.

## Rules

1. **Flat paper.** No grid, no grain, no vignette. Book paper is a colour,
   not a texture.
2. **One spot colour per theme, and it means "measured".** By daylight it is
   the fountain-pen blue of a corrected proof. By lamplight it is old gold.
   It appears only on measured/verified things: the winning benchmark lane,
   finished times, needles, focus rings, active states.
3. **Zero border-radius.** Type is set in rectangles.
4. **Everything server-rendered stays visible without JS.** The page is
   printed even when the reader has no script.

## Palette

### Daylight — book paper

| Token | Value | Note |
|---|---|---|
| `--paper` | `#f3f1ec` | book paper, warm off-white |
| `--paper-raised` | `#faf9f6` | plate stock |
| `--ink` | `#1c1a17` | iron-gall black |
| `--ink-soft` | `#4d4840` | |
| `--ink-faint` | `#7d766a` | |
| `--accent` | `#23408e` | proof-corrector's fountain pen |
| `--accent-soft` | `rgba(35, 64, 142, 0.10)` | |
| `--rule` | `rgba(28, 26, 23, 0.20)` | |
| `--rule-soft` | `rgba(28, 26, 23, 0.09)` | |
| `--track` | `rgba(28, 26, 23, 0.06)` | |

### Lamplight — the same page at night

| Token | Value | Note |
|---|---|---|
| `--paper` | `#17140f` | lampblack, still warm |
| `--paper-raised` | `#1f1b15` | |
| `--ink` | `#ece4d2` | aged cream |
| `--ink-soft` | `#b3a88f` | |
| `--ink-faint` | `#7f7562` | |
| `--accent` | `#d4a94c` | old gold |
| `--accent-soft` | `rgba(212, 169, 76, 0.16)` | |
| `--rule` | `rgba(236, 228, 210, 0.18)` | |
| `--rule-soft` | `rgba(236, 228, 210, 0.08)` | |
| `--track` | `rgba(236, 228, 210, 0.07)` | |

## Type

- **Old Standard TT** (400/700, italic) for the title, every heading, and
  all running text. A revival of the modern-face serifs of 1900s scientific
  journals: high contrast, vertical stress, bracketed serifs. Display
  capitals get `letter-spacing: 0.02em` of air; body copy sets at
  15px/1.85.
- **Courier Prime** (400/700) for every number, label, tag, identifier, and
  repository name. Typewritten figures pasted onto the typeset page.
  Monospace means the columns align by construction.

## Structure as information

Two pages.

- **`/` is an introduction.** Title page (the name in Headbang, one line
  about the person, the thick-thin Oxford rule), then one living figure,
  then Notes. Everything is centred on one axis, the way a title page is.
  No benchmark, no treemap, no ring: a first visit meets a person before a
  dataset.
- **`/work` is the figures.** `Fig. 1 — Benchmark` is folded under the page
  title as a `<details>` disclosure, so the syscall detail is one click
  away rather than in the reader's face; `Fig. 2 — Work` is the treemap;
  `Fig. 3 — Languages` is the ring and the table. Figure heads are centred
  on the same axis as the page title.
- The footer closes with the same Oxford rule, and the theme switch reads
  **Daylight / Lamplight**.

### The letters

The two letters of the title page light on hover, and which pair of lights
you get is a coin flip made once per visit:

| Pair | J | L |
|---|---|---|
| Elemental | Ice, pale blue falling to deep water | Fire, hottest at the base, cooling to yellow-white |
| Celestial | Void, near-black with a violet rim | Solar, white-hot at the crown falling to amber |

This is the one piece of the page that is purely for pleasure: everything
else is a measurement. It earns its place by staying out of the way. The
resting state is plain ink, the lights only exist under the cursor, and the
flip never shifts a glyph, so the title page still reads as a title page.

The colour is a gradient clipped to a second copy of the glyph, because a
gradient cannot be a text colour. Headbang is blackletter and both letters
overhang their advance width, so that copy is given a box half an em larger
on every side, pulled back by the same amount, with padding to put it back
in register. Without that, the J's tail and the L's foot stay black while
the body of the letter lights up.

The flip runs in an effect rather than during render: the server cannot
agree with the client on a random number, and a mismatch would be a
hydration error. `?hero=elemental` or `?hero=celestial` pins the pair for
screenshots and acceptance runs.

### Fig. 0 — Atlas

The front page's one figure is a CPPN: a four-hidden-layer MLP (16 wide,
~1.2k weights) mapping `(x, y, r, 1)` to three channels, run over a 128×128
field at 12 fps. The weights are seeded from the visit time and drift on a
superposition of slow sines, so the field flows and never repeats. Output
is mapped into the page's own palette (paper, soft ink, accent) read from
computed styles, so it re-inks on a theme flip. The canvas is masked with a
feathered edge and a 1.5px blur so it dissolves into the paper rather than
sitting in a box. It pauses offscreen and when the tab is hidden, renders
one still under reduced motion, and shows a static SVG without JS.

## Motion

Unchanged mechanics (rAF race, IntersectionObserver reveals, reduced-motion
bails). Sections rise 18px as they enter, on `cubic-bezier(0.22, 1, 0.36, 1)`.
Durations: 140ms flip, 320ms move, 600ms reveal.
