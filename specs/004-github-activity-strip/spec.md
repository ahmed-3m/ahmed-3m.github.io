# Spec 004 — Build-Time GitHub Activity Strip

**Status:** Ready for next session
**Priority:** P1 (proof-of-activity — fully buildable, no decisions blocking)
**Origin:** "Proof of activity" discussion, 2026-07-18.

## Problem

The site shows no signal that Ahmed ships *continuously*. Recruiters read momentum as
strongly as accomplishments. A static site can't fetch live data at runtime, so activity
must be baked in at build time.

## Goal

A "Recent activity" strip on the homepage showing Ahmed's latest public GitHub
activity (commits / repos / releases), fetched **at build time** in the deploy Action and
inlined into the static export — no runtime network calls, same serverless pattern as the
news pipeline.

## Approach

1. A build script (`.github/activity/fetch-activity.mjs`) calls the GitHub REST API
   (`/users/ahmed-3m/events/public` and/or pinned repos) during the deploy workflow, writes
   a small typed JSON (`src/lib/github-activity.ts` or a generated `.json`).
2. A lazy component (`src/components/ActivityStrip.tsx`) renders the JSON: repo name, event
   type, message, relative date, link.
3. `.github/workflows/deploy.yml` runs the fetch before `npm run build`. Auth via the
   Action's `GITHUB_TOKEN` (higher rate limit, no secret to manage). Commit the generated
   JSON so local builds and PRs still render without a token.

## Requirements

- **No runtime calls** — data is committed/generated at build; the exported HTML is static.
- **Graceful fallback** — if the API fails or rate-limits, keep the last committed JSON;
  never break the build.
- **Freshness cap** — show last N (e.g. 6) events; filter noise (ignore `WatchEvent`, forks
  unless meaningful).
- **Honest** — link every item to the real commit/repo; show real timestamps.
- Lazy-loaded, a11y-labeled, respects reduced-motion, i18n for any static labels.
- Privacy: only public activity; no private-repo leakage.

## Acceptance criteria

- [ ] Strip renders on the exported homepage from committed JSON with zero runtime fetches.
- [ ] Deploy workflow refreshes the JSON on each build; a failed fetch falls back cleanly.
- [ ] `npm run build` (static export) passes; component is code-split.
- [ ] Every item links to a real, public GitHub URL with a correct relative date.
- [ ] No secrets beyond the Action's built-in `GITHUB_TOKEN`.

## Out of scope

- Contribution-graph heatmap image (nice-to-have, separate).
- Any non-GitHub source (LinkedIn/HF) — could extend later.
