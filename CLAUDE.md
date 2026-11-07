# CLAUDE.md

Project overview, dev commands, file map, theming / i18n / claim-integrity rules and the
UI verification checklist live in **[AGENTS.md](AGENTS.md)**. Read it first.

## Claude-specific

- **`main` is the only long-lived branch.** For each change, branch off `main`, commit,
  then open a PR into `main`. Never commit feature work directly to `main`. Agents never
  merge their own PRs.
- Merged PR branches are **deleted automatically** ("Automatically delete head branches"
  is enabled on the repo). Afterwards, prune locally: `git fetch --prune`, then
  `git branch -d <branch>`.
- **Before pushing follow-up commits to an existing PR branch, check that the PR is still
  open** (`gh pr view <n> --json state`). If it was merged, pushing re-creates the
  deleted branch. Instead, branch fresh from `origin/main`, cherry-pick, and open a new PR.
- Never edit `gh-pages` (auto-generated deploy output).

## Running and previewing

- `.claude/launch.json` defines **"Next.js Dev"** (`npm run dev`, port 3000). Start it with
  the preview tool rather than a raw shell command.
- `npm run build` fetches Google Fonts. If the sandbox blocks network access, the build
  fails with "Failed to fetch Space Grotesk"; rerun it with network access instead of
  changing the code.
- After a scripted (non-Edit-tool) write to `globals.css`, Turbopack's watcher can miss the
  change. A small follow-up edit, or a dev-server restart, forces a recompile.
- When verifying UI, switch theme and locale in the page instead of clicking through
  menus:
  `document.documentElement.setAttribute('data-theme','light')` and
  `localStorage.setItem('language','ar'); location.reload()`.
  Reset `language` to `en` afterwards.

<!-- SPECKIT START -->
Spec Kit context: the project principles are in `.specify/memory/constitution.md`, and
feature specs (spec / plan / tasks) are under `specs/NNN-*/`. The active feature
directory is recorded in `.specify/feature.json`. Read that feature's `spec.md` and
`tasks.md` before working on it.
<!-- SPECKIT END -->
