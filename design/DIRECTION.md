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

- The hero is a **title page**: the name at monograph-title size, a thesis
  line, then the thick-thin Oxford rule that period journals drew under the
  masthead.
- Sections are **numbered figures**, because they literally are figures:
  `Fig. 1 — Work` is a treemap, `Fig. 2 — Languages` is a ring and a table.
  About is `Notes`, not a figure, because it is prose.
- The footer closes with the same Oxford rule, and the theme switch reads
  **Daylight / Lamplight**.

## Motion

Unchanged mechanics (rAF race, IntersectionObserver reveals, reduced-motion
bails). Sections rise 18px as they enter, on `cubic-bezier(0.22, 1, 0.36, 1)`.
Durations: 140ms flip, 320ms move, 600ms reveal.
