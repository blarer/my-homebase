# Direction B — "Strip Chart"

The site is about measurement, so the page becomes the instrument: a strip
chart recorder mid-run. Light mode is the chart paper (green-grid engineering
pad, the K&E kind), dark mode is the night instrument panel (green-black
glass, amber signal lamps). Everything measured renders as a *trace*: the
benchmark race, the language bars, the section markers.

The previous direction ("Vellum & Redline", warm cream + terracotta) was
handsome but generic — it is the default look of AI-designed pages. This one
is owned by the subject.

## Rules

1. **The grid is readable, not subliminal.** Real chart paper has a visible
   grid; the data is plotted against it. Minor line every 24px, major every
   5th (120px) — the 5:1 rhythm of engineering pads, not the 4:1 of graph
   paper.
2. **One signal colour per theme, and it means "measured".** Daylight trace
   is ultramarine ink (the recorder pen). Night signal is amber (panel lamp).
   It appears only on measured/verified things: the winning benchmark lane,
   finished times, needles, focus rings, active states.
3. **Zero border-radius.** Instruments are machined, not rounded.
4. **Everything server-rendered stays visible without JS.** The chart is
   printed even when the recorder is off.

## Palette

### Light — chart paper

| Token | Value | Note |
|---|---|---|
| `--paper` | `#f3f5ef` | chart white, faint green undertone |
| `--paper-raised` | `#fbfcf8` | plate |
| `--ink` | `#131c16` | green-black recorder ink |
| `--ink-soft` | `#46544a` | |
| `--ink-faint` | `#75837a` | annotations |
| `--accent` | `#2038dd` | ultramarine pen trace |
| `--accent-soft` | `rgba(32, 56, 221, 0.10)` | |
| `--grid` | `rgba(58, 125, 88, 0.16)` | minor, visibly green |
| `--grid-major` | `rgba(58, 125, 88, 0.30)` | every 5th line |
| `--rule` | `rgba(19, 28, 22, 0.22)` | |
| `--rule-soft` | `rgba(19, 28, 22, 0.10)` | |
| `--track` | `rgba(19, 28, 22, 0.07)` | |

### Dark — night panel

| Token | Value | Note |
|---|---|---|
| `--paper` | `#0b100d` | green-black glass |
| `--paper-raised` | `#121a15` | |
| `--ink` | `#e9f0e6` | mint-white |
| `--ink-soft` | `#9fae9f` | |
| `--ink-faint` | `#6d7a6e` | |
| `--accent` | `#ffb454` | amber signal lamp |
| `--accent-soft` | `rgba(255, 180, 84, 0.14)` | |
| `--grid` | `rgba(120, 190, 150, 0.07)` | phosphor-faint |
| `--grid-major` | `rgba(120, 190, 150, 0.14)` | |
| `--rule` | `rgba(233, 240, 230, 0.18)` | |
| `--rule-soft` | `rgba(233, 240, 230, 0.08)` | |
| `--track` | `rgba(233, 240, 230, 0.07)` | |

Shadows stay, halved: paper sits nearly flat, plates lift barely.

## Type

- **Display + data: Space Mono.** 700 uppercase for headings (the engraved
  nameplate voice — its quirky geometric forms are the personality of the
  page), 400 for every number and label. Monospace means numerals align by
  construction.
- **Prose: Instrument Sans.** 400/500. Clean, slightly warm, and literally
  named for the job. Running text only: theses, ledes, notes, About body.
- Drop: Archivo, IBM Plex Mono, IBM Plex Serif.

## Motion

Unchanged mechanics (rAF race, IntersectionObserver reveals, reduced-motion
bails), new voice: `--ease-snap: cubic-bezier(0.3, 0.9, 0.2, 1)` — pen
flick. Durations: 140ms flip, 320ms move, 600ms reveal. Reveals slide 16px
*horizontally* (paper feeding through the recorder), not vertically.

## Signature moves per section

- **Hero:** nameplate header (Space Mono 700, boxed rule), then the benchmark
  race drawn as a real strip chart: time axis with second ticks and labels,
  lanes plotted against the visible grid, winning lane in signal colour with
  a pen-head dot. Caption typed under the plot like an operator's note.
- **Work:** treemap framed as an instrument bezel with corner screws
  (radial-gradient dots), title block in the frame's top rule like a drawing
  header. Probe tooltip is the cursor readout.
- **Languages:** ring becomes a gauge (tick ring outside the donut); ranked
  bars are traces with needle tips riding the shared grid.
- **About:** operator's log — serifless, plain, portrait in a bezel with a
  calibration caption.
- **Footer:** chart footer strip: sync timestamp reads like a plot stamp,
  theme toggle is a panel switch labelled DAY / NIGHT.
