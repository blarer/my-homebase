# Astryx: how this site is built

Replaces the Offprint direction (`DIRECTION.md`, `ARCHITECTURE.md` and
`AUDIT.md` remain as history). Approved by the owner on 2026-11-17.

## Decisions (2026-11-17)

- **Design system:** Astryx `@astryxdesign/core` 0.7.16 with the prebuilt
  CSS path (`reset.css`, `astryx.css`, theme CSS). No StyleX compiler; no
  site CSS files.
- **Theme:** `homebase`, made with `astryx experimental theme editor` on the
  chocolate base. Fountain-pen blue accent `#2b4fb3` (dark mode uses the
  generated lighter shade), warm grey neutral `#6b6358`, small corners, serif
  headings, system body font (no third-party font request), monospace
  figures, toned danger `#b3261e` and success `#3d7a3a`. Source in
  `themes/homebase/`, built copy in `src/themes/homebase/`.
- **Templates:** `shell-top-nav` for the site frame, `centered-hero` for `/`,
  `dashboard` for `/work`, plain shell content for 404.
- **Dropped:** the Headbang lit letters, the running head, the scroll
  progress hairline, the theme-flip view transition. None has an Astryx
  equivalent.
- **Kept:** all copy, data, routes, the privacy redaction, the Atlas CPPN
  (now inked from theme tokens), the races, the treemap probe, the ring.

## What each page uses

| Page | Template | Components |
|---|---|---|
| all | `shell-top-nav` | Theme, LinkProvider, AppShell, TopNav, TopNavHeading, TopNavItem, Switch |
| `/` | `centered-hero` | Layout, LayoutContent, VStack, HStack, Heading, Text, Button, Icon, Section, Card, AspectRatio, Grid, Avatar, Link, Divider, Code |
| `/work` | `dashboard` | Layout, LayoutContent, VStack, HStack, StackItem, Grid, Card, Heading, Text, Button, Divider, Table, Link, Collapsible, Badge, ProgressBar, AspectRatio, List, ListItem, Icon, Code |
| 404 | `shell-top-nav` content | Layout, LayoutContent, VStack, Heading, Text, Button |

## Where raw values remain, and why

- `components/work/Treemap.jsx`: tiles are absolutely positioned from the
  squarify layout at run time, so they are native buttons with inline
  percentage geometry. Every colour, border and radius there is a theme
  token.
- `lib/languageColors.js`: GitHub Linguist colours. They are data (one hue
  per language), used for treemap bands, ring segments and swatches.
- `components/home/Atlas.jsx` and `components/work/LanguageRing.jsx`: a
  canvas and an SVG; the canvas palette is read from theme tokens.
- `app/opengraph-image.jsx`: rendered by Satori outside the page, which
  cannot read CSS variables; it copies the homebase light token values.
