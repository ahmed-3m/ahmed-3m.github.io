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

The repo is intentionally kept to **three working branches plus the deploy branch.**
**Do not create new branches** (no `codex/*`, `fix/*`, `feature/*` — those were cleaned up).

| Branch        | Purpose                                                        |
| ------------- | ------------------------------------------------------------- |
| `main`        | Source of truth. Stable, deployable. Change only via PR.       |
| `claude-work` | Claude Code's working lane.                                    |
| `agents-work` | Shared lane for **all other agents** (Codex, Gemini, Cursor…). |
| `gh-pages`    | Auto-generated deploy output. **Never edit by hand.**          |

Rules:
- If you are **not** Claude Code, do all work on **`agents-work`**. Commit there, then
  open a PR into `main`.
- Never commit feature work directly to `main` — always go through a PR from your lane.
- Do not open per-feature branches. Keep everything on your single lane.
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
5. Commit on **`agents-work`** and open a PR into `main` (see branch rules above).

### Automated weekly pipeline

`.github/workflows/news-update.yml` runs this loop automatically every Monday (and on
manual dispatch): GLM-5.2 via the Z.ai endpoint + the Exa research MCP collect recent
news, dedupe against `news-items.ts`, append items, then the workflow runs `npm run build`
and `scripts/check-news-links.mjs` and **auto-merges to `main` only if both pass**. It is
fully serverless — the Action is the backend and git is the dedup store; no hosting needed.

Required repository secrets:
- `NEXT_PUBLIC_ZAI_TOKEN` — existing Z.ai / GLM key, reused by the agent.
- `EXA_API_KEY` — Exa API key (https://exa.ai).

The agent's instructions live in `.github/news/task.md`; the Exa MCP config in
`.github/news/exa-mcp.json`. The news bot is the one sanctioned exception to the
"no direct commits to `main`" rule.

## Conventions

- Match the surrounding code style.
- UI strings are multilingual (en / de / fr / es / ar) — see the `copy` objects in
  components such as `src/components/Hero.tsx`. Add a translation for every language key.
- Run `npm run build` before pushing; the static export must succeed.
