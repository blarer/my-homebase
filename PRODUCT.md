# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Engineers** (confirmed): peers who arrive from GitHub, a link, or a shared project. They want to judge quickly whether the work is real, how deep it goes, and whether the author thinks clearly about performance and systems.
- **Employers** (confirmed): hiring managers and recruiters assessing fit for systems / performance / tooling roles. They want a fast read on who this is, what he has built, evidence it works, and how to reach him.

## Product Purpose

louds.net is the personal site of Blare (GitHub `blarer`). It introduces him as a systems-software engineer and shows the work with evidence. Success: an engineer or employer leaves knowing what he builds, believing it is measured rather than claimed, and with an obvious path to the code and to contact.

## Positioning

Each project got faster by removing work, not adding threads: the fix lives a layer below where people usually look (syscalls, stream copy, transport, direct sensor reads). The site's claims are measured: the benchmark and repository figures come from real runs and real source bytes, not adjectives.

## Operating Context

- Next.js 15 App Router, static, deployed to Cloudflare Workers via OpenNext. A push to `main` deploys.
- Repository data in `lib/repos.json`, refreshed by the `sync-repos` workflow from the GitHub API. Private repos appear anonymised; `scripts/test-privacy.mjs` guards that.
- Routes: `/` (introduction) and `/work` (measured work).

## Capabilities and Constraints

- Must keep: about copy (systems software, the four "layer below" examples, current ML study), avatar, links to GitHub and `/work`, the `storage-manager-swift` benchmark race, the repository treemap sized by source bytes with language bands, language totals.
- The living neural-network figure (Atlas, WebGL) exists; whether it stays is a visual decision for the redesign.
- Content must render without JavaScript; respects reduced motion.
- Existing tests (treemap, band probe, privacy) and the acceptance harness must stay meaningful.

## Brand Commitments

- None for the visual identity. The user asked for a fully new look; the previous "Offprint" monograph direction (`design/DIRECTION.md`) is retired as authority and kept only as evidence.
- Voice: first person, plain, specific, no marketing language (the old "crafting exceptional digital experiences" copy was removed on purpose).

## Evidence on Hand

- `lib/repos.json`: real repositories, languages, source bytes.
- Benchmark data for `storage-manager-swift` in the Race component.
- `public/avatar.png`.
- Absent, do not fabricate: employers, testimonials, job history, CV, contact email beyond what exists in code.

## Product Principles

1. Evidence over adjectives: every claim on the page is something measured or linkable.
2. A fast read for a busy employer, depth for a curious engineer.
3. The code is the proof: every project leads to its source.
4. Works for everyone: no-JS readable, accessible, reduced-motion safe.
