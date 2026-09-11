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
- Deploy: `.github/workflows/deploy.yml` builds and deploys to GitHub Pages via the
  Actions artifact (`actions/deploy-pages`) — there is no deploy branch; the repo is
  single-branch (`main` only).

## Commands

```bash
npm ci          # install (lockfile is committed — use ci, not install)
npm run dev     # local dev server
npm run build   # production static export — MUST pass before pushing
npm run lint    # eslint
```

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
path is the only mechanism that works. The PR is authored with `NEWS_PAT` (the
owner's identity) when that secret is set — PRs authored by `github-actions[bot]`
get their `pull_request` workflows gated behind manual approval, which nobody
grants at 06:23 UTC (discovered 2026-09-11: delta PRs sat in `action_required`
until a human clicked Approve). `npm run build` and
`.github/news/check-news-links.mjs` gate the delta before the PR is opened, and
the merge dispatches `deploy.yml` explicitly only when it ran as `GITHUB_TOKEN`
(those merges fire no push events; a `NEWS_PAT` merge's push event deploys
already). It is fully serverless —
the Action is the backend and git is the dedup store; no hosting needed. On a quiet day
the agent prints `{ "items": [] }` and publish is a no-op. A missing or non-JSON
stdout is a hard failure — never invent an empty delta.

Required repository secrets:
- `NEWS_PAT` — fine-grained personal access token (owner identity; repository
  access limited to this repo with **Contents: Read and write**, **Pull requests:
  Read and write**, **Actions: Read and write**) that the news publish job uses to
  author and merge its delta PR. Required for unattended publishes since
  2026-09-11: PRs authored by `github-actions[bot]` get their `pull_request`
  workflows gated behind manual approval, so a GITHUB_TOKEN-authored delta PR's
  lanes never start until a human clicks Approve. Without this secret the
  workflow still runs but falls back to GITHUB_TOKEN plus a best-effort
  self-approve that GitHub may reject — publishes then need a human approval
  during the 15-minute check-wait window.
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
  components such as `src/components/Hero.tsx`. Add a translation for every language key.
- Run `npm run build` before pushing; the static export must succeed.
