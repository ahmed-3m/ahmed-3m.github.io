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
- Deploy: `.github/workflows/deploy.yml` builds and publishes to the `gh-pages` branch.

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

| Branch     | Purpose                                                   |
| ---------- | --------------------------------------------------------- |
| `main`     | Source of truth. Stable, deployable. Change only via PR.  |
| `gh-pages` | Auto-generated deploy output. **Never edit by hand.**     |

Rules:
- Branch off `main` for each change — this applies to every agent (Claude, Codex, Gemini,
  Cursor…). Name it for the work (e.g. `fix/…`, `chore/…`); it is short-lived.
- Never commit feature work directly to `main` — always go through a PR.
- On merge, GitHub deletes the branch automatically ("Automatically delete head branches"
  is enabled). Prune locally with `git fetch --prune`, then `git branch -d <branch>`.
- Never touch `gh-pages`; the deploy workflow owns it.

## History

Many scattered per-PR branches were consolidated into the structure above. Two branches
held unmerged commits, preserved as tags (recover with `git checkout <tag>`):

- `archive/glass-polish-fallback` — chatbot local `getLocalReply()` fallback + cursor fix
- `archive/cv-button-direct-download` — early `cv.pdf` for a direct-download button

## News update protocol (for automated agents)

The `/news` page is designed to be kept current by an agent. All content lives in
**`src/lib/news-items.ts`** — a typed, self-validating data module. To add news:

1. **Append** one `NewsItem` object to the `newsItems` array (don't reorder — sorting
   by date is done at read time, newest first).
2. **Fields:**
   - `id` — unique, stable, kebab-case. **Never reuse an id.**
   - `date` — ISO `YYYY-MM-DD`, not in the future.
   - `category` — exactly `'ai'` or `'agentic'`. Use `'agentic'` for autonomous agents,
     tool use, multi-agent systems, agent frameworks/protocols; `'ai'` for everything else.
   - `headline` — the source's headline (usually English).
   - `source` — outlet name (e.g. `'Anthropic'`, `'arXiv'`, `'The Verge'`).
   - `url` — canonical absolute `http(s)` link to the source.
   - `take.en` — required, a 1–2 sentence editorial take in Ahmed's voice. Other
     languages optional (`de`/`fr`/`es`/`ar`) and fall back to English.
   - `tags` — optional short chips.
3. **Dedupe:** skip items whose URL or substance already exists. Never duplicate `id`.
4. **Verify:** run `npm run build` — `news-items.ts` self-validates at build time and
   the build fails on malformed entries (bad id/date/category/url or empty `take.en`).
5. Commit on a short-lived branch and open a PR into `main` (see branch rules above).

### Automated daily pipeline

`.github/workflows/news-update.yml` runs this loop automatically **daily** (06:23 UTC,
and on manual dispatch): GLM-5.2 via Z.ai (api.z.ai, Anthropic-format
endpoint) + the Exa research MCP collect recent news, dedupe against `news-items.ts`,
append items, then the workflow runs `npm run build` and `.github/news/check-news-links.mjs`
and **auto-merges to `main` only if both pass**. It is fully serverless — the Action is the
backend and git is the dedup store; no hosting needed. On a quiet day with nothing new, the
agent writes no items and publish is a no-op.

Required repository secrets:
- `BIGMODEL_NEWS_TOKEN` — private Z.ai (api.z.ai) API key for the news agent. Never prefixed with `NEXT_PUBLIC_` — must NOT appear in the client bundle. The workflow falls back to the pre-migration `ZAI_NEWS_TOKEN` secret if this is unset. Note: the news agent uses the `/api/anthropic` endpoint (Claude Code speaks the Anthropic Messages API); the GLM Coding Plan `/api/coding/paas/v4` path does NOT support Claude Code. Keys are per-host: an open.bigmodel.cn key will not authenticate against api.z.ai.
- `NEXT_PUBLIC_BIGMODEL_TOKEN` — public, rate-limited Z.ai (api.z.ai) key for the portfolio chatbot (uses the GLM Coding Plan `/api/coding/paas/v4/chat/completions` endpoint, model `glm-5.3` — which always runs with thinking enabled). This IS inlined into the static JS bundle and is publicly extractable; use a disposable/capped key. The news agent must NOT reuse this key.
- `NEXT_PUBLIC_GROQ_TOKEN` — public, rate-limited Groq key for the portfolio chatbot's fallback model. Also inlined into the static JS bundle and publicly extractable; use a disposable/capped key.
- Chatbot model routing + overrides (optional, GitHub *repository variables*, not secrets): `NEXT_PUBLIC_BIGMODEL_MODEL` (deep lane, default `glm-5.3`), `NEXT_PUBLIC_ZAI_FAST_MODEL` (fast lane for simple prompts, default `glm-5-turbo`), `NEXT_PUBLIC_ZAI_ROUTER_MODEL` (classifier that picks the lane for non-obvious prompts, default `glm-5.3-flash`), and `NEXT_PUBLIC_GROQ_MODEL` (cross-provider fallback, default `openai/gpt-oss-20b`; Groq decommissioned `llama-3.1-8b-instant` on 2026-08-16). glm-5.3 always runs thinking (slow, thorough); the fast lane exists because simple questions don't need it.
- `EXA_API_KEY` — Exa API key (https://exa.ai).

`NEXT_PUBLIC_ZAI_TOKEN` is retired and unused. `ZAI_NEWS_TOKEN` survives only as the
news workflow's fallback when `BIGMODEL_NEWS_TOKEN` is unset. All GLM endpoints live on
api.z.ai (the international Z.ai host); open.bigmodel.cn-era keys will not authenticate there.

The agent's instructions live in `.github/news/task.md`; the Exa MCP config in
`.github/news/exa-mcp.json`. The news bot is the one sanctioned exception to the
"no direct commits to `main`" rule.

## Conventions

- Match the surrounding code style.
- UI strings are multilingual (en / de / fr / es / ar) — see the `copy` objects in
  components such as `src/components/Hero.tsx`. Add a translation for every language key.
- Run `npm run build` before pushing; the static export must succeed.
