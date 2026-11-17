# Datasheet on Astryx: section plan (for owner approval)

Branch `agent/astryx-datasheet`, on top of PR #6. All live Datasheet content is
kept. Theme and chrome are the already-approved `homebase` theme and
`shell-top-nav`. Rough screenshots: `design/screens/review/*.png`.

Starting templates (suggested by `astryx build`): **documentation-technical**
for both pages (numbered sections, captions, dense reading column) and
**table-grouped** for the specification table.

## Page 1: Datasheet (`/`)

| # | Section | Template / pattern | Astryx components | State |
|---|---|---|---|---|
| shell | Part number, p.1/p.2 nav, theme toggle | shell-top-nav | AppShell, TopNav, TopNavHeading, Switch | rough |
| - | Title block (part, doc no., rev, title, lede) | documentation-technical header | Heading, Text, Badge (REV) | old CSS, to do |
| 1 | Features | documentation-technical list | Section, List | rough |
| 2 | Applications | same | Section, List | rough |
| - | Figure 1, block diagram | custom SVG in a Card | Card, Caption, SVG styled from tokens | rough, text scale to fix |
| - | Table 1, block summary | table-grouped (flat) | Table, Link, Text | rough |
| 3 | Description, with photo | documentation-technical prose | Avatar or Image, Text | old CSS, to do |
| 4 | Pin configuration (Figure 2, Table 2) | custom SVG plus table | Card, Table, Badge for pin type | old CSS, to do |
| 5 | Ordering information (Table 3) | table | Table, Link | old CSS, to do |
| - | Sheet footer (page x of 2, typeset, sync date) | page footer | Divider, Text | old CSS, to do |

## Page 2: Characterization (`/work/`)

| # | Section | Template / pattern | Astryx components | State |
|---|---|---|---|---|
| 6 | Specifications (Table 4) | **table-grouped** | Table with grouped TableBody, Link in group rows | rough, good |
| 7 | Timing characteristics (Figures 3 to 6) | documentation-technical subsections | Card, Badge (headline), SVG from tokens, List legend | rough, text scale to fix |
| 8 | Die floorplan (Figure 7) | custom treemap | Card, Caption, readout with Link and Text | rough, good |
| 9 | Composition (Figure 8, Table 5) | ring plus table | Card, Table, ProgressBar | rough, good |
| 10 | Revision history (Table 6) | table | Table, Collapsible per revision | rough |

## Questions for the owner

1. Is **documentation-technical** right for both pages, with **table-grouped** for Table 4?
2. Should the figures sit in Cards (a framed panel, as in the screenshots), or go borderless like a printed datasheet?
3. Should the Revision history keep its collapsible rows, or show every change in full?

## Known rough edges (fixed in the full build, not design choices)

Dark mode is not applied yet. SVG text is oversized. The title, pinout, ordering
and footer sections still use the old CSS. Nothing has been checked on phone.
