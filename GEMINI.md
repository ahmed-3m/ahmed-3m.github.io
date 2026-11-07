# GEMINI.md

See **[AGENTS.md](AGENTS.md)** for the project overview, commands, and conventions.

## Branch rule

- `main` is the only long-lived branch.
- Branch off `main` using a short-lived descriptive branch (e.g. `fix/...`, `chore/...`, `feat/...`) and open a PR into `main`.
- Never commit directly to `main` — always go through a PR.
- Agents never merge their own PRs: open the PR, report, and stop — the owner reviews and merges.
