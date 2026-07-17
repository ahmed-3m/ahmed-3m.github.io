# CLAUDE.md

Project overview, dev commands, and conventions live in **[AGENTS.md](AGENTS.md)** —
read it first.

## Claude-specific

- **Your working branch is `claude-work`.** Do feature work there, then open a PR into `main`.
- The repo is kept to exactly three branches — `main`, `claude-work`, `agents-work`
  (plus the auto-managed `gh-pages`). **Do not create per-feature branches.**
- Other agents (Codex, Gemini, Cursor) share the `agents-work` lane — don't commit to it.
- Never commit feature work directly to `main`, and never edit `gh-pages` (deploy output).

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
