# CLAUDE.md

Project overview, dev commands, and conventions live in **[AGENTS.md](AGENTS.md)** —
read it first.

## Claude-specific

- **`main` is the only long-lived branch.** For each change, branch off `main`, commit,
  then open a PR into `main`. Never commit feature work directly to `main`.
- Merged PR branches are **deleted automatically** ("Automatically delete head branches"
  is enabled on the repo). Afterwards, prune locally: `git fetch --prune`, then
  `git branch -d <branch>`.
- Never edit `gh-pages` (auto-generated deploy output).

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
