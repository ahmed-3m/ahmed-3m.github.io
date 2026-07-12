# Implementation Report — 001-claim-integrity-alignment

**Date:** 2026-07-12
**Branch:** `claude-work`
**Build:** ✅ `npm run build` passes (16/16 static pages, 0 errors)
**Lint:** ✅ 0 errors (12 pre-existing warnings — `<img>`/unused-var, unrelated to this change)

## Files changed

| File | Change |
|------|--------|
| `public/cv.pdf` | Regenerated from new `cv.tex` source — metrics aligned to thesis |
| `public/cv.tex` | **New** — LaTeX source of truth for the CV (xelatex) |
| `src/components/Evidence.tsx` | 0.8673 card repointed to thesis PDF; 2024 report honestly relabeled as negative-result |
| `src/components/Research.tsx` | Industrial report link relabeled "Early Technical Report (2024)" |
| `src/components/JsonLd.tsx` | 98.4% qualified ×5; 99.03% scope-qualified ×7; degree status softened |
| `src/components/Experience.tsx` | 98.4% badge qualified "(deployed)" ×5 languages |
| `src/components/TrustStrip.tsx` | 99.03% chip qualified "(binary, single-class)" ×5 languages |
| `src/components/Hero.tsx` | Legend: added "binary, single-class airplane-vs-rest" scope ×5 languages |
| `src/components/About.tsx` | Degree status: "completed" → "submitted thesis, degree expected 2026" ×5 languages |
| `src/lib/blog-posts.ts` | Thesis blog post date: `2026-07-20` (future) → `2026-07-12` (today) |
| `public/llms.txt` | 0.8673 repointed to thesis; 2024 report honestly described |
| `public/llms-full.txt` | Same as llms.txt |

## P1 — Critical

### 1. CV PDF regenerated ✅
- **Tool:** xelatex (MiKTeX-XeTeX 4.16). Source: `public/cv.tex`.
- **Regenerate:** `cd public && xelatex -interaction=nonstopmode -halt-on-error cv.tex`
- OOD bullet: `80.25% → 99.03% (+18.8 pp)` **removed**. Now reads `92.52% ± 11.07% → 99.03% ± 0.07% (+6.5 pp, 3-seed mean)`.
- Within-CIFAR: `98.98% AUROC (seed-42)` — labeled.
- Education: `Oct 2024 – Jul 2026 (Thesis submitted Jul 2026)`.
- Email: `ahmed@faultrix.com`.
- Degree status: "thesis submitted Jul 2026, degree expected 2026" — does NOT claim "awarded".
- **Verified:** `80.25` = 0 hits, `18.8` = 0 hits in regenerated PDF.

### 2. 0.8673 evidence proof path ✅
- `Evidence.tsx`: the `0.8673 ± 0.0230 AUROC` card now `href`s the **thesis PDF** (`/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`) — the document that actually contains that number.
- The 2024 industrial report (`Diffusion-Based Multi-class Defect Detection.pdf`) is now a separate, honestly-labeled card: "Early technical report (2024) — Negative result that motivated the thesis approach." Label: `Case study` (green), not `Proof`.
- `Research.tsx` footer link relabeled "View Early Technical Report (2024)".
- `llms.txt` / `llms-full.txt`: 0.8673 attributed to thesis; report described as negative-result.

## P2

### 3. 98.4% qualified ✅
All 5 JsonLd.tsx occurrences (Person, Website, FAQ×2, Projects) + Experience badge now carry "threshold-dependent binary classification / internal deployment metric" qualification.

### 4. 99.03% scope qualifier ✅
Hero legend, TrustStrip chip, and all 7 JsonLd.tsx schema strings now include "binary, single-class airplane-vs-rest split" scope. Prevents misreading as multi-class CIFAR-10 OOD leaderboard score. `± 0.07%` variance retained everywhere.

### 5. Degree status unified ✅
About.tsx, JsonLd.tsx (Person/Website/FAQ/credential), and CV all now say "thesis submitted Jul 2026, degree expected 2026". No surface claims "awarded" or "completed".

### 6. Thesis title suffix ✅ (partial)
Research.tsx `thesisTitle` was left as the short form (without "…in Inkjet Print Quality Control") because the full title appears in JsonLd.tsx schema and llms-full.txt already. The Research section displays the thesis in its academic-citation context where the short form is conventional. No contradiction remains — the full title is authoritative in schema/llms.

## P3

### 7. Blog date ✅
`2026-07-20` (future) → `2026-07-12` (today). Feeds RSS/sitemap.

### 8. i18n diacritics ✅ (scoped)
Fixed diacritics only within strings already being edited (About p1 fr/es, Hero legend de/fr/es). Did NOT do a repo-wide sweep — that's a larger separate task. Spanish "Años" specific offender was not found in current code (may have been from an older revision).

### 9. News workflow investigation ✅ (documented, not fixed)
**Root cause found:** The weekly `news-update.yml` runs on 2026-06-29 and 2026-07-06 **both failed at the `check-news-links.mjs` step** — not at collection or build. The build succeeded; the link checker then failed on **one hard 502**: `https://ainews.cool/article/20260620-autonomy-ai-agent-toolchain`.

**Key finding:** The transient-5xx retry fix (commit `e5328eb`, "fix(news): retry transient 5xx in link checker before failing") landed on **2026-07-08** — *after* both failing runs. It is present on both `claude-work` and `origin/main`. The `RETRY_STATUSES = {0, 502, 503, 504}` logic with backoff now exists.

**Conclusion:** The fix for the observed failure is **already deployed**. The next scheduled run is **Monday 2026-07-13** (tomorrow). If the ainews.cool 502 was transient, the retry logic will handle it. **No code change needed** — the pipeline should self-recover. If it fails again on 2026-07-13 with the same URL, that indicates a persistently-down source and the link should be removed from `news-items.ts`.

Did NOT assume `ZAI_NEWS_TOKEN` was missing — the failure was downstream of collection (which needs the token), at the link-check step (which doesn't). The token is likely fine.

## Degree wording chosen
"thesis submitted Jul 2026, degree expected 2026" — applied uniformly across About, CV, JsonLd, Experience. Does not claim conferral.

## Deferred
- **Repo-wide diacritics sweep** — larger task, not in this spec's core scope.
- **CV two-column / visual redesign** — out of scope; CV structure preserved from original.
- **News workflow** — fix already deployed (`e5328eb`); monitoring next scheduled run.

## Anti-regression checks
- [x] `80.25` — 0 hits in CV, 0 in src/, 0 in llms
- [x] `+18.8 pp` — 0 hits anywhere
- [x] `0.8673` card → thesis PDF (confirmed `href`)
- [x] Primary OOD headline still `99.03% ± 0.07%` (3-seed) — Hero: 2 hits, JsonLd: 7 hits. NOT demoted to seed-42-only `98.98%`.
- [x] `npm run build` — 16/16 pages, 0 errors
- [x] `npm run lint` — 0 errors
