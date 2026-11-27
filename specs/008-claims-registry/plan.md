# Implementation Plan: Claims Registry and Figure Check

**Branch**: `spec/008-claims-registry` | **Date**: 2026-11-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-claims-registry/spec.md`

## Summary

The plan adds one claims registry, `src/lib/claims/`, which reads its values from
`src/lib/ood-explorer-data.ts`. On top of it sits a figure check, which:

- reads the published text surfaces in all five languages;
- fails on unregistered, retired, spread-less or unqualified result figures.

The check is one pure module, run from three places:

- **Unit test** (`npm test`): scans the source files of every language. It is the
  five-language gate.
- **Export verification** (`npm run verify:export`): runs the same source scan, plus the
  built HTML and the retired-figure scan of the JavaScript bundles.
- **Genie claims test**: reads its values, spreads and qualifiers from the registry
  instead of its own copy.

Figures that are wrong on the site today are recorded in a reviewed baseline file. The
baseline can only shrink, and it must be empty when the migration (User Stories 2–3)
lands.

The migration adds `formatClaim(id, lang)` and moves the FR-010 headline surfaces onto
it. Each deliberate visible fix (decimal marks, missing spreads, rounded values) is
listed in the PR.

A pre-plan measurement of today's site is in [research.md](research.md#r0-baseline-measurement).
It shows the check is fast (about 0.4 s for the source scan) and that the site has real
findings today. So the spec is amended in this PR: User Story 1's "current site passes"
now means "passes against the reviewed baseline".

## Technical Context

**Language/Version**: TypeScript 6 on Node 24.12. Node runs `.ts` directly through type
stripping, and `tools/test-hooks.mjs` resolves the `@/` alias.

**Primary Dependencies**:
- Next.js 16 (static export) and React 19;
- `typescript`, already a dev dependency, whose compiler API parses the source;
- no new dependencies.

**Storage**: source files only. Three files are added: the registry (TypeScript), the
non-result list and baseline (JSON), and the OG card lock (JSON).

**Testing**: `node --import ./tools/test-hooks.mjs --test "tests/**/*.test.ts"`, run as
`npm test`. The repository also runs `npx tsc --noEmit -p .`, `npx eslint src tests --quiet`
and `npm run verify:export` after `npm run build`.

**Target Platform**: GitHub Actions (`deploy.yml`: the required jobs `quality` and
`build`) and local Windows and Linux development.

**Project Type**: a statically exported website, plus build-time tooling.

**Performance Goals**: the check adds 5 s or less to build-and-verify (SC-006). The
measured source scan takes about 0.4 s for 86 files.

**Constraints**:
- **Client-safe registry**: client components import it, so no `node:` imports.
- **Retired literals**: stored as joined segments, never as plain text.
- **No visible change** except the listed fixes (FR-011).
- **English-only HTML export**: the other languages are checked from source.

**Scale/Scope**: about 250 figure occurrences in about 30 files and 5 languages. The
registry holds about 15 named claims and 4 retired ones.

## Constitution Check

*GATE: must pass before Phase 0 research, and again after Phase 1 design.*

| Principle / standard | How the plan meets it | Status |
|---|---|---|
| I. Evidence-First Claims | Every named claim carries an evidence reference. Values come from the thesis data file, and derived values are computed from it. A figure with no backing fails the check. | Pass (strengthens) |
| II. Cross-Artifact Consistency | One registry feeds the site, structured data, OG text and Genie. The check covers `llms*.txt` and the README. The CV and thesis PDFs stay manual under spec 002 (spec assumption). | Pass |
| III. Honest Scope Qualifiers | Qualifiers are part of each claim, and the check requires them near the figure in each language. | Pass (strengthens) |
| IV. Static Export Integrity | The check runs at build and test time only. The registry is plain TypeScript, with no server code. | Pass |
| V. Multilingual Completeness | Display forms and qualifier wording exist for en, de, fr, es and ar. The source scan reads each language with its own decimal mark. | Pass |
| Claim Integrity Standards | The 98.4% line becomes "retired" in the User Story 1 PR. This is a PATCH amendment (1.0.1 → 1.0.2) under Governance, because it clarifies a standard and changes no principle. | Pass (amendment planned) |
| Branch Discipline | Separate PRs into `main`: User Story 1 first, then Stories 2–3. User Story 4 waits for spec 007. | Pass |
| Quality Gates | `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`, then `verify:export`. No new dependency. | Pass |

**Re-check after Phase 1 design**: still all pass. The baseline file is a temporary
exception list with an emptiness gate at the end of User Story 3. It is not a lasting
waiver, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/008-claims-registry/
├── spec.md
├── plan.md              # this file
├── research.md          # decisions and the pre-plan measurement
├── data-model.md        # Claim, DisplayForm, NonResultEntry, Finding, Baseline
├── quickstart.md        # plant a figure, run the check, change a value
├── contracts/
│   ├── claims-api.md    # registry and formatClaim interface
│   └── figure-check.md  # check API, finding format, baseline and CLI behaviour
├── checklists/requirements.md
└── tasks.md             # made later by /speckit-tasks
```

### Source Code (repository root)

```text
src/lib/claims/
├── registry.ts          # named claims, built from ood-explorer-data.ts (no retired values)
├── retired.ts           # retired claims as joined segments; imported by check.ts only, never by components
├── format.ts            # locale number formatting; formatClaim(id, lang, variant)
├── qualifiers.ts        # qualifier display text and accepted phrasings, per language
├── read-figures.ts      # decimal reading per language: grouping, dates, bidi marks, tags
├── check.ts             # checkUnit(unit) -> Finding[]; pure, no fs
└── index.ts             # public surface

src/lib/genie/links.ts   # formatLocaleNumber re-exported from claims/format.ts (one implementation)

tools/claims/
├── scan-sources.mjs     # fs and the TypeScript AST: source files -> text units (lang, card)
├── scan-export.mjs      # out/ HTML -> block-level text units; JS bundles -> retired scan
├── non-results.json     # reviewed non-result patterns, each with a reason (at most 25)
└── baseline.json        # findings present before migration, split by scope (source | export); only shrinks; empty after US3

tools/verify-export.mjs  # metric deny-list entries removed; calls the claims scan
tools/generate-og-images.mjs   # (US2–US3) card text from formatClaim; writes tools/claims/og-cards.lock.json
package.json             # verify:export runs with --import ./tools/test-hooks.mjs

tests/claims/
├── read-figures.test.ts # grouping vs decimal per language, bidi marks, tags, "+/-"
├── check.test.ts        # each rule, planted figures in every language and surface (SC-001)
├── sources.test.ts      # the real source scan passes against the baseline
└── registry.test.ts     # derived values, display forms, retired claims throw
tests/genie/claims.test.ts   # switched to the registry (FR-009); same cases
```

**Structure Decision**:
- **Pure logic in `src/lib/claims/`**: the registry, number reading and rules. Tests,
  the export tool and components all import it. Client components only need
  `registry.ts` and `format.ts`.
- **File access in `tools/claims/`**: file walking, AST parsing and HTML block
  splitting. These are build-time only and never bundled.
- **Retired values stay out of the bundle.** `retired.ts` is imported only by `check.ts`.
  An ESLint `no-restricted-imports` rule stops `src/components` and `src/app` from
  importing `check.ts` or `retired.ts`. The bundle scan would otherwise fail on the
  registry's own retired values once the minifier folds the segments back into a
  literal.

## Delivery

1. **PR A: User Story 1, the check.**
   - **Registry core**: named and retired claims, plus data-backed values.
   - **Qualifier rules**: only today's three, the ones the Genie test enforces:
     - 3 seeds on the thesis mean;
     - seed 42 on the 98.98% run;
     - 5-fold CV on the inkjet baseline.

     The candidate rules in data-model.md are measured in PR A but not enforced. Each
     is turned on in PR B only after a spec amendment.
   - **Check**: number reading, the check itself, and both scanners.
   - **Lists**: the non-result list and the baseline from the first run.
   - **Wiring**: `verify-export` integration and the Genie test switch (FR-008, FR-009).
   - **Constitution**: the 98.4% amendment.
   - **Expected visible changes**: none. Only test and tooling changes; every existing
     finding, including `95.04%`, goes into the baseline.
2. **PR B: User Stories 2–3, registry output and cleanup.**
   - **Code**: `formatClaim`, the FR-010 surface migration, and OG generator, lock and
     image regeneration.
   - **Copy fixes**: `README.md` and `llms*.txt` (check-driven fixes only), and the
     blog fixes the baseline names.
   - **Result**: the baseline reaches zero.
   - If the diff gets large, it may split into B1 (page surfaces) and B2 (OG, manifests
     and blog fixes).
   - Each visible change is listed in the PR body (FR-011).
3. **Later: User Story 4.** Waits for spec 007.

## Open decisions for the owner

Both are needed before PR B. PR A carries the findings in the baseline either way.

**1. Bare figures in titles.** Today, blog titles, the diffusion case-study `<title>` and meta descriptions, and the
`llms*.txt` and README links to the blog say "How I Reached 99.03% AUROC …". That is a
mean without its spread or qualifier. The clarification "full precision, with spread" and
Principle III point to a fix during PR B. There are three ways to make it:

- add the spread and a short qualifier to each title;
- take the figure out of the title;
- name titles as an explicit exception class.

This is a visible, SEO-relevant change. See [research.md](research.md#r11-titles-with-a-bare-headline-figure).

**2. The `95.04%` YOLO figure.** It appears in the InkjetOOD blog paragraph in five
languages and is not in the thesis data file. If there is a public artifact for it, it
becomes a named claim with that evidence reference. Otherwise PR B removes it, as a
listed visible fix. The spec adds no new figures, so registering it needs the owner to
point at the artifact.

## Complexity Tracking

No constitution violations to justify.
