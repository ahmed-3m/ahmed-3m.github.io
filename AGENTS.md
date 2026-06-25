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

## Conventions

- Match the surrounding code style.
- UI strings are multilingual (en / de / fr / es / ar) — see the `copy` objects in
  components such as `src/components/Hero.tsx`. Add a translation for every language key.
- Run `npm run build` before pushing; the static export must succeed.
