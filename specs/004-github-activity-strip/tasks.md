# Tasks — 004 GitHub Activity Strip

**Delegation legend:** `[P]` parallelizable · `→Tnnn` depends on · **Agent** = suggested type.

> ✅ **No blocking decisions** — this spec is fully buildable as-is. Safe to delegate whole.

### T4.1 [P] — Build-time fetch script
**Agent:** general-purpose (edit)
Write `.github/activity/fetch-activity.mjs`: call GitHub REST
(`/users/ahmed-3m/events/public` + pinned repos), filter noise (drop `WatchEvent`,
low-value forks), take last 6 meaningful events, write typed JSON
(`src/lib/github-activity.json` + a `.ts` loader). Auth via `GITHUB_TOKEN` env. On failure,
exit 0 and leave the existing committed JSON untouched.

### T4.2 [P] — ActivityStrip component
**Agent:** general-purpose (edit)
Build `src/components/ActivityStrip.tsx` rendering the committed JSON: repo, event type,
message, relative date, link. Lazy-load into `src/app/page.tsx`. a11y-labeled, i18n static
labels, respects reduced-motion. (Can be built in parallel with T4.1 against a hand-written
sample JSON.)

### T4.3 — Wire into deploy workflow  →T4.1
**Agent:** general-purpose (edit)
In `.github/workflows/deploy.yml`, run `node .github/activity/fetch-activity.mjs` before
`npm run build`, passing `GITHUB_TOKEN`. Commit the refreshed JSON back (or accept it as a
build artifact). Confirm PR/local builds still render from committed JSON with no token.

### T4.4 — Verify  →T4.2 →T4.3
**Agent:** general-purpose + `verify` skill
`npm run build` passes; strip renders on exported homepage with **zero runtime fetches**
(grep the exported HTML/JS). Simulate a fetch failure → build still succeeds with stale
data. Every item links to a real public URL. Component is code-split.

**Suggested wave plan:** {T4.1 [P], T4.2 [P]} → T4.3 → T4.4.
