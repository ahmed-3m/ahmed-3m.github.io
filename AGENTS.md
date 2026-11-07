<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Working guide for AI coding agents

This file is read automatically by Codex, Gemini, Cursor, and most AI coding agents.
Claude Code reads `CLAUDE.md`, which defers here. **Read this before making changes.**

## Project

Personal portfolio for Ahmed Mohammed (AI/ML engineer, Linz). Next.js 16 + React 19 +
TypeScript + Tailwind v4, statically exported to GitHub Pages.

- Routes: `src/app/`  ·  UI components: `src/components/`
- Static assets, CV, thesis PDF, research figures: `public/`
  - `public/cv.pdf` is not built here. It is generated in the job-application workspace
    (`cv_ref/base_cv/generate_cv_general.py --public`) and copied in. Do not edit or rebuild it in this repo.
- Deploy: `.github/workflows/deploy.yml` builds and deploys to GitHub Pages via the
  Actions artifact (`actions/deploy-pages`) — there is no deploy branch; the repo is
  single-branch (`main` only).

## Commands

```bash
npm ci              # install (lockfile is committed — use ci, not install)
npm run dev         # local dev server on http://localhost:3000
npm run build       # production static export to out/ — MUST pass before pushing
npm run lint        # eslint (src/)
npm run typecheck   # tsc --noEmit
node .github/news/news-selftest.mjs   # news catalog + link-validator self-test
node worker/chat-proxy.selftest.mjs   # Cloudflare Worker chat-proxy self-test
```

Build notes:
- `prebuild` runs `tools/emit-homepage-news.mjs` (writes `src/lib/news-homepage.json`);
  `postbuild` runs `tools/emit-sitemap-alias.mjs` (writes `out/sitemap-pages.xml`).
- `next/font/google` downloads Space Grotesk and the other fonts at build time, so
  **`npm run build` needs network access to fonts.googleapis.com**. In a sandbox without
  network it fails with "Failed to fetch Space Grotesk"; that is an environment problem,
  not a code regression.
- `NEXT_PUBLIC_CALENDLY_URL` overrides the default Calendly link; the chatbot keys are
  described under "Required repository secrets" below. None are needed for local dev.

## Where things live

| Path | What it holds |
| ---- | ------------- |
| `src/app/` | Routes: home (`page.tsx`), `blog/`, `news/`, `case-studies/`, `sitemap.ts`, `robots.ts`, `feed.xml/`, root `layout.tsx` (pre-paint theme script) |
| `src/app/globals.css` | All site styles: `--cd-*` design tokens, light/dark overrides, section styles (`.cd-hero*`, `.cd-signal*`, …) |
| `src/components/` | One component per homepage section (`Hero.tsx`, `HeroSignal.tsx`, `Research.tsx`, `OodDemo.tsx`, …), chatbot, buttons |
| `src/lib/i18n.tsx`, `i18n-config.ts` | `useI18n()` / `TranslationMap`; language persisted in `localStorage['language']` |
| `src/lib/ThemeContext.tsx` | Theme store (`localStorage['theme']` + `prefers-color-scheme`), sets `data-theme` on `<html>` |
| `src/lib/ood-explorer-data.ts` | **Single source of truth for thesis numbers** (benchmarks, histograms, λ sweep, K ablation, inkjet CV) |
| `src/lib/news-items.json` | News catalog (see the news protocol below) |
| `public/` | Static assets, CV, thesis PDF, research figures, `llms.txt` |
| `worker/` | Cloudflare Worker chat proxy (`chat-proxy.js`, `wrangler.toml`) and self-test |
| `tools/` | Build-time emitters (homepage news, sitemap alias) |
| `specs/NNN-*/` | Spec Kit feature specs (spec / tasks / reports); `.specify/memory/constitution.md` holds the project principles |
| `.github/` | Workflows (`deploy`, `news-update`, `news-update-monitor`, `site-health`, `claude`) and the news agent's task, validators and self-tests |

## Branch structure — read before you branch

**`main` is the only long-lived branch.** Every change goes through a short-lived branch
that is merged into `main` via a PR and then deleted automatically.

| Branch | Purpose                                                  |
| ------ | -------------------------------------------------------- |
| `main` | Source of truth. Stable, deployable. Change only via PR. |

Rules:
- Branch off `main` for each change — this applies to every agent (Claude, Codex, Gemini,
  Cursor…). Name it for the work (e.g. `fix/…`, `chore/…`); it is short-lived.
- Never commit feature work directly to `main` — always go through a PR.
- Agents never merge their own PRs. Open the PR, report, and stop — the owner
  reviews and merges. The news bot's JSON-only PR (which it merges itself once
  the required quality+build lanes pass) is the only sanctioned exception.
- On merge, GitHub deletes the branch automatically ("Automatically delete head branches"
  is enabled). Prune locally with `git fetch --prune`, then `git branch -d <branch>`.
- GitHub Pages deploys via the workflow artifact (`build_type: workflow` in repo
  settings, set 2026-09-07). The legacy `gh-pages` branch was a stale pre-Next.js
  relic and was deleted; don't recreate it.

## History

Many scattered per-PR branches were consolidated into the structure above. Branches that
held unmerged commits were preserved as tags (recover with `git checkout <tag>`):

- `archive/glass-polish-fallback` — chatbot local `getLocalReply()` fallback + cursor fix
- `archive/cv-button-direct-download` — early `cv.pdf` for a direct-download button
- `archive/a3m-brand-icons` — A3M mark icon set + `tools/generate-icons.mjs` (2026-09-07)
- `archive/news-link-redirect-validation` — fail-closed malformed-redirect handling in
  `.github/news/check-news-links.mjs` (2026-09-07)

On 2026-09-07 the repo was reduced to a single branch (`main`): `agents-work` (fully
merged), the two branches above, and the stale `gh-pages` relic were deleted.

## News update protocol (for automated agents)

The `/news` page is designed to be kept current by an agent. All content lives in
**`src/lib/news-items.json`** — a JSON array parsed by `parseNewsItems`. Agents emit
JSON; they do not edit TypeScript.

1. **Append** one `NewsItem` object to `src/lib/news-items.json` (don't reorder — sorting
   by date is done at read time, newest first). The daily research agent does **not**
   edit this file: it prints a `{ "items": [ ... ] }` delta on stdout (0–4 items).
   `parseNewsItems` is the only way to obtain `NewsItem[]` — do not validate-then-cast.
   The catalog is a rolling window of 200 items: when it is full, applying a delta
   evicts the oldest-dated items (earliest-appended first on ties) — that is normal
   behavior, not data loss, and the daily pipeline relies on it.
2. **Fields:**
   - `id` — unique, stable, kebab-case. **Never reuse an id.**
   - `date` — ISO `YYYY-MM-DD`, a real calendar day (e.g. `2026-02-31` is rejected), not
     in the future (UTC).
   - `category` — exactly `'ai'` or `'agentic'`. Use `'agentic'` for autonomous agents,
     tool use, multi-agent systems, agent frameworks/protocols; `'ai'` for everything else.
   - `headline` — localized object; `en` is the source's own headline (usually English),
     `de`/`fr`/`es`/`ar` are translations of it. A bare string is accepted as an en-only
     shorthand. Falls back to English like `take`.
   - `source` — outlet name (e.g. `'Anthropic'`, `'arXiv'`, `'The Verge'`).
   - `url` — canonical absolute `http(s)` link to the source. Must be unique after
     canonicalization (lowercase host, no hash, no default ports, no trailing slash).
   - `take.en` — required, a 1–2 sentence editorial take in Ahmed's voice. Other
     languages (`de`/`fr`/`es`/`ar`) fall back to English; the daily pipeline requires
     them — emit translations for every new item.
   - `tags` — optional short chips (`/^[a-z0-9-]+$/`, 1–6 tags, each 1–40 chars).
   Unknown fields are rejected. Allowed item keys: `id`, `date`, `category`,
   `headline`, `source`, `url`, `take`, `tags`. `take` and `headline` accept the same
   locale keys: `en` (required), `de`, `fr`, `es`, `ar`.
3. **Dedupe:** skip items whose URL (after canonicalization) or substance already exists.
   Never duplicate `id`.
4. **Verify:** run `npm run build` — `parseNewsItems` self-validates the catalog at
   build time and the build fails on malformed entries (bad id/date/category/url,
   empty `take.en`, unknown fields, duplicate canonical URLs). Also run
   `node .github/news/news-selftest.mjs`.
5. Commit on a short-lived branch and open a PR into `main` (see branch rules above).
   The daily news bot is the one sanctioned exception: it opens a JSON-only PR from its
   `news-delta/<run-id>` branch and merges it itself once the required checks pass.

### Automated daily pipeline

`.github/workflows/news-update.yml` runs this loop automatically **daily** (06:23 UTC,
and on manual dispatch): GLM-5.3 via Z.ai (api.z.ai, `/api/anthropic` — the only Z.ai
surface that serves the Anthropic Messages API Claude Code speaks) + the Exa research MCP collect recent news. The research job has **no Write
tool** and **no npm ci**; it prints a JSON `{ "items": [...] }` delta on stdout. A
validate job sanitizes that delta against current `main`, then publish lands it on
*current* `main` via a JSON-only PR (`news-delta/<run-id>` branch) that merges only
after the required `quality`+`build` lanes pass on the PR — direct pushes are
impossible under branch protection, and `workflow_dispatch` check runs do not
satisfy the push-time check matcher (the 2026-09-08..11 GH006 streak), so the PR
path is the only mechanism that works. One wrinkle: PRs authored by
`github-actions[bot]` get their `pull_request` workflows gated behind manual
approval (discovered 2026-09-11 — the gated run reports
`conclusion=action_required`); the publish loop detects the gated `deploy.yml`
run and approves it itself via the Actions API, which GitHub accepts
(live-proven end-to-end 2026-09-11, run 34658469518: PR #85 → self-approve →
lanes green → bot self-merge → deploy). Setting the optional `NEWS_PAT` secret
bypasses the gate entirely by authoring the PR as the owner. `npm run build` and
`.github/news/check-news-links.mjs` gate the delta before the PR is opened, and
the merge dispatches `deploy.yml` explicitly only when it ran as `GITHUB_TOKEN`
(those merges fire no push events; a `NEWS_PAT` merge's push event deploys
already). It is fully serverless —
the Action is the backend and git is the dedup store; no hosting needed. On a quiet day
the agent prints `{ "items": [] }` and publish is a no-op. A missing or non-JSON
stdout is a hard failure — never invent an empty delta.

Required repository secrets:
- `NEWS_PAT` — **optional hardening** (fine-grained personal access token; repository
  access limited to this repo with **Contents: Read and write**, **Pull requests:
  Read and write**, **Actions: Read and write**) that the news publish job can use
  to author and merge its delta PR as the owner. Background: PRs authored by
  `github-actions[bot]` get their `pull_request` workflows gated behind manual
  approval (discovered 2026-09-11 — delta PRs sat in `action_required` until
  approved). The publish loop self-approves its own gated run via the Actions API,
  which GitHub accepts (live-proven 2026-09-11, run 34658469518: PR #85 created →
  gated run approved by the bot → lanes green → bot self-merge → deploy). Set this
  PAT only if GitHub ever stops accepting bot self-approval; with it set, the PR is
  human-authored (no gate at all) and the merge's push event triggers deploy.yml
  without an explicit dispatch.
- `BIGMODEL_NEWS_TOKEN` — private Z.ai (api.z.ai) API key for the news agent. Never prefixed with `NEXT_PUBLIC_` — must NOT appear in the client bundle. The workflow falls back to the pre-migration `ZAI_NEWS_TOKEN` secret if this is unset. Note: the news agent stays on `/api/anthropic` — Claude Code speaks the Anthropic Messages API (`/v1/messages`), which the GLM Coding Plan base the chatbot uses (`/api/coding/paas/v4`) does NOT serve (404, probe-verified 2026-09-07). Since 2026-09-07 the agent model is `glm-5.3` wired via `ANTHROPIC_DEFAULT_SONNET/OPUS/HAIKU_MODEL` alias remapping (Z.ai's documented recipe): `glm-5.2` was server-side remapped to `glm-5.3` and broke the pipeline during that window, and `ANTHROPIC_MODEL` must never hold a `glm-*` id — Claude Code (≥2.1.200, flag-enforced since 2026-09-07) registry-validates SDK model switches and rejects non-Claude ids (`unrecognized_model`, issue #67). Keys are per-host: an open.bigmodel.cn key will not authenticate against api.z.ai.
- `NEXT_PUBLIC_BIGMODEL_TOKEN` — public, rate-limited Z.ai (api.z.ai) key for the portfolio chatbot (uses the GLM Coding Plan `/api/coding/paas/v4/chat/completions` endpoint, model `glm-5.3` — which always runs with thinking enabled). This IS inlined into the static JS bundle and is publicly extractable; use a disposable/capped key. The news agent must NOT reuse this key.
- `NEXT_PUBLIC_GROQ_TOKEN` — public, rate-limited Groq key for the portfolio chatbot's fallback model. Also inlined into the static JS bundle and publicly extractable; use a disposable/capped key.
- Chatbot model routing + overrides (optional, GitHub *repository variables*, not secrets): `NEXT_PUBLIC_BIGMODEL_MODEL` (deep lane, default `glm-5.3`), `NEXT_PUBLIC_ZAI_FAST_MODEL` (fast lane for simple prompts, default `glm-5-turbo`), `NEXT_PUBLIC_ZAI_ROUTER_MODEL` (classifier that picks the lane for non-obvious prompts, default `glm-5.3-flash`), and `NEXT_PUBLIC_GROQ_MODEL` (cross-provider fallback, default `openai/gpt-oss-20b`; Groq decommissioned `llama-3.1-8b-instant` on 2026-08-16). glm-5.3 always runs thinking (slow, thorough); the fast lane exists because simple questions don't need it.
- `EXA_API_KEY` — Exa API key (https://exa.ai).

`NEXT_PUBLIC_ZAI_TOKEN` is retired and unused. `ZAI_NEWS_TOKEN` survives only as the
news workflow's fallback when `BIGMODEL_NEWS_TOKEN` is unset. All GLM endpoints live on
api.z.ai (the international Z.ai host); open.bigmodel.cn-era keys will not authenticate there.

The agent's instructions live in `.github/news/task.md`; the Exa MCP config in
`.github/news/exa-mcp.json`. The news bot's self-merged JSON-only PR is the one
sanctioned exception to the "agents never merge their own PRs" rule.

## Conventions

- Match the surrounding code style.
- UI strings are multilingual (en / de / fr / es / ar) — see the `copy` objects in
  components such as `src/components/Hero.tsx`
  (`const copy = { … } satisfies Record<string, TranslationMap>`, read with `t(copy.key)`).
  Add a translation for every language key.
- Run `npm run build` before pushing; the static export must succeed.

### Theming (dark + light)

- The theme is the `data-theme="dark" | "light"` attribute on `<html>`. Dark is the
  default, and the OS preference is followed unless the visitor toggles.
- Use the `--cd-*` tokens from `globals.css` (`--cd-bg`, `--cd-surf`, `--cd-elev`,
  `--cd-b0/b1`, `--cd-fg1/2/3`, `--cd-accent`, `--cd-success`, `--cd-warn`, …), never
  hard-coded colours. Put light-specific tweaks under `[data-theme="light"] …`.
- Every visual change must be checked in **both** themes. In the browser console:
  `document.documentElement.setAttribute('data-theme', 'light')`.
- Respect `prefers-reduced-motion`. A global rule already shortens animations; don't
  rely on an animation's end state for layout.

### i18n and RTL

- Arabic switches the document to `dir="rtl"`. Use logical properties
  (`margin-inline-*`, `padding-inline-*`, `inset-inline-*`) instead of left/right.
- Wrap Latin text that ends in punctuation in `<bdi>` (see the hero name), or bidi
  moves the punctuation to the wrong side. Charts and plots can force `dir="ltr"`.
- To test a locale: `localStorage.setItem('language', 'ar'); location.reload()`.

### Claim integrity (numbers on the site)

- Never invent or round up a metric. Thesis figures come from
  `src/lib/ood-explorer-data.ts`; CV and claims reconciliation lives in `specs/001-*`
  and `specs/002-*`.
- Keep qualifiers next to headline numbers. Example: the hero's **99.03% ± 0.07 AUROC
  is the 3-seed mean** at λ = 0.02 (`CIFAR_LAMBDA_SWEEP`). The histogram in
  `HeroSignal` is the **single seed-42 run (98.98%)**. When both appear, label which
  is which.

### Verifying UI changes

- Run `npm run dev` and check desktop **and** 375 px mobile, in light and dark, in
  English and Arabic. Also check that the console has no errors.
- Known pre-existing issue (not a regression): on mobile the education cards overflow
  horizontally by about 70 px. (`npm run lint` currently passes with warnings only —
  any lint *error* is a real regression, not a known issue.)
