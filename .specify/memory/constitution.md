<!--
Sync Impact Report
- Version change: template → 1.0.0
- Modified principles: placeholders → portfolio-specific principles
- Added sections: Branch Model, Claim Integrity, Quality Gates
- Removed sections: none (template placeholders replaced)
- Templates requiring updates: none required for v1.0.0 (standard Speckit templates retained)
- Follow-up TODOs: none
-->
# Ahmed Mohammed Portfolio Constitution

## Core Principles

### I. Evidence-First Claims (NON-NEGOTIABLE)

Every quantitative claim on the site, CV, schemas, AI-recall files, and case studies
MUST be traceable to a public artifact (thesis PDF, repository, benchmark report, or
case study). Numbers that cannot be verified from a public source MUST be removed or
explicitly labeled as internal/operational metrics with scope qualifiers.

**Rationale**: The portfolio invites verification (proof section, legend footnotes,
llms.txt). Mismatched claims destroy more credibility than missing claims.

### II. Cross-Artifact Consistency

The site, downloadable CV, thesis PDF, industrial reports, JSON-LD, blog posts, and
`llms*.txt` form one system. Headline metrics, dates, degree status, contact email,
role timelines, and thesis title MUST agree across all of them. When a claim is
corrected in one place, all other surfaces MUST be updated in the same change set
whenever practical.

**Rationale**: A hiring manager who downloads the CV one click from the hero will
compare it to the page above it.

### III. Honest Scope Qualifiers

Leaderboard-adjacent metrics (AUROC, accuracy, pp gains) MUST carry evaluation scope
where experts would otherwise misread them (e.g. airplane-vs-rest / single-ID split,
3-seed mean, 5-fold CV, threshold-dependent production accuracy). Prefer smaller
honest numbers over larger unqualified ones.

**Rationale**: The audience that can hire for this work is the audience that checks
benchmark protocol.

### IV. Static Export Integrity

The site MUST remain a statically exported Next.js app suitable for GitHub Pages.
`npm run build` is the production gate. Features that require a server MUST either
be optional client-side paths, documented edge workers, or out of scope for the
static host.

**Rationale**: Deploy path is `.github/workflows/deploy.yml` → `gh-pages`. Server-only
APIs break the hosting model.

### V. Multilingual Completeness & Locale Quality

User-facing UI strings MUST include all supported languages (en, de, fr, es, ar).
German and Spanish copy MUST use correct orthography (umlauts/ñ or consistent
ASCII transliteration such as `ue`/`oe`/`ae` — never stripped forms that change
meaning, e.g. Spanish "Anos").

**Rationale**: DACH recruiters are a primary audience; the site advertises German B1.

## Branch Model

Only three long-lived source branches plus deploy output:

| Branch | Purpose |
|--------|---------|
| `main` | Source of truth; change only via PR |
| `claude-work` | Claude Code working lane |
| `agents-work` | Shared lane for other agents |
| `gh-pages` | Deploy output — never edit by hand |

No per-feature branches. Speckit feature directories under `specs/` are independent of
git branch names.

## Claim Integrity Standards

- Baseline thesis OOD result: **99.03% ± 0.07% AUROC** (3-seed mean) with
  **+6.5 pp** over **92.52% ± 11.07%** baseline; CIFAR-10 **airplane-vs-rest**
  (single ID class) unless multi-class is explicitly claimed.
- Industrial public baseline: **0.8673 ± 0.0230 AUROC** (5-fold CV on FTI_Zer0P)
  documented in the **thesis**, not the 2024 negative-result industrial report.
- **98.4%** production accuracy MUST always be qualified as threshold-dependent /
  operational unless removed from headline surfaces.
- Degree language MUST reflect true status (submitted / expected / awarded) on
  every surface that mentions it.
- Contact email on CV and site MUST match the preferred public contact.

## Quality Gates

- `npm ci` for installs (lockfile committed).
- `npm run lint` and `npm run build` MUST pass before merge.
- News items in `src/lib/news-items.ts` self-validate at build time; never invent
  future dates for public content.
- Prefer reversible local changes; never force-push shared history; never edit
  `gh-pages` by hand.

## Governance

This constitution guides Speckit specs, plans, and implementation for this
repository. When principles conflict with convenience, principles win.

- Amendments: update this file, bump version (MAJOR for principle removals or
  redefinitions; MINOR for new principles; PATCH for clarifications), set
  Last Amended to the change date.
- PR reviews SHOULD check claim integrity for any change that touches metrics,
  dates, education, or downloadable artifacts.
- Runtime agent guidance lives in `AGENTS.md` / `Claude.md` and MUST remain
  consistent with the Branch Model section above.

**Version**: 1.0.0 | **Ratified**: 2026-07-12 | **Last Amended**: 2026-07-12
