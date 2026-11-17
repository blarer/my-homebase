# Astryx redesign: direction proposal (awaiting owner decision)

Branch `agent/astryx-redesign`. Nothing is built on this yet.

## 1. Theme: `homebase`, made with the Astryx theme editor

Base: **chocolate** (warm paper browns, Fraunces/Albert Sans), tuned:

| Dial | Value | Why |
|---|---|---|
| accent | `#2b4fb3` fountain-pen blue (dark mode: generated lighter shade) | keeps "one spot colour means measured" |
| neutral | `#6b6358` warm grey | book-paper surfaces, warm dark mode |
| corners | small | close to Offprint's square type blocks without fighting component defaults |
| headings | serif, semibold, tight | editorial voice |
| code/numbers | system mono | figures still typewritten |
| danger / success | `#b3261e` / `#3d7a3a` | toned down from chocolate's bright red/green |

Contrast problems reported by `editor show`: none.

Light: `themes/homebase/preview.png`, `themes/homebase/sheet.png`
Dark: `themes/homebase/preview-dark.png`, `themes/homebase/sheet-dark.png`

Options considered: neutral (too generic for this site), gothic (dark-only, so no daylight theme),
stone (cooler, sans-only), chocolate (chosen: warm paper, serif headings).

## 2. Page templates

| Route | Template (`astryx build`) | Plan |
|---|---|---|
| shell (all) | `shell-top-nav` (AppShell + TopNav) | J·L mark, Introduction / The work, theme Switch; replaces the custom masthead |
| `/` | `centered-hero` | name + thesis centred, Atlas canvas in the hero picture slot, About as a Section with Avatar and links |
| `/work` | `dashboard` | headline tiles (the four benchmark results) → list of figures as a Table → races in Collapsibles (ProgressBar lanes) → treemap in a Card → languages ring + ranked Table |
| 404 | `shell-top-nav` content | Heading + Text + Link |

Content, data, routes and privacy rules unchanged. Dropped: the Headbang lit-letter hover,
the running head, the scroll-progress hairline (no Astryx equivalent; can keep if wanted).

## Questions for the owner

1. Approve chocolate-based `homebase` theme (or pick another base / accent)?
2. Approve the template per route above?
3. OK to drop the Headbang hover letters and running head?
