---
description: "Task list for spec 008: claims registry and figure check"
---

# Tasks: Claims Registry and Figure Check

**Input**: design documents in `specs/008-claims-registry/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/),
[quickstart.md](quickstart.md).

**Tests**: included. The spec requires them: FR-006 asks for the check as a unit test,
SC-001 for planted figures, and FR-009/SC-007 for the Genie test's coverage. Tests use
`node:test` with `node:assert/strict`, under `tests/`, run by `npm test`.

**Delivery** (plan "Delivery"):
- **PR A** = Phases 1–3. The check lands; no visible change.
- **PR B** = Phases 4–5. Registry output and cleanup. Phase 5 waits on the owner's two
  open decisions (plan, "Open decisions for the owner").
- **Phase 6** (User Story 4) waits for spec 007.

Branch each PR fresh from `origin/main`, never from the spec branch.

**Commands used throughout:**
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`, then `npm run verify:export`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: US1–US4 from spec.md.

---

## Phase 1: Setup (shared infrastructure)

**Purpose**: module skeleton, script wiring and import guard. No behaviour yet.

- [ ] T001 Create the folders `src/lib/claims/`, `tools/claims/` and `tests/claims/`. Add `src/lib/claims/index.ts` as the public barrel; it re-exports only `registry.ts` and `format.ts`, never `check.ts` or `retired.ts`. Add `tools/claims/non-results.json` as `[]` and `tools/claims/baseline.json` as `[]`.
- [ ] T002 [P] In `package.json`, change the `verify:export` script to `node --import ./tools/test-hooks.mjs tools/verify-export.mjs`. Then run `npm run build` and `npm run verify:export` and confirm both still pass unchanged.
- [ ] T003 [P] In `eslint.config.mjs`, add a `no-restricted-imports` rule for files under `src/components/**` and `src/app/**`. It forbids `@/lib/claims/check`, `@/lib/claims/retired` and `@/lib/claims/read-figures` (research R1), with a message pointing to `@/lib/claims`. Confirm `npm run lint` passes.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: the registry, number formatting and figure reading that every story uses.

**⚠️ CRITICAL**: no user story work can begin until this phase is complete.

- [ ] T004 Create `src/lib/claims/qualifiers.ts`. Export `QualifierId` (`'threeSeeds' | 'seed42' | 'fiveFoldCv' | 'airplaneVsRest'`) and `QUALIFIERS: Record<QualifierId, { text: Record<Language,string>; accepts: Record<Language,RegExp> }>`.
  - Copy `accepts` for `threeSeeds`, `seed42` and `fiveFoldCv` exactly from `THREE_SEEDS`, `SEED_42` and `FIVE_FOLD` in `tests/genie/claims.test.ts`. Then widen them with the on-site phrasings listed in research R7: "3-Seed-Mittel", "moyenne 3 seeds", "3 graines", "media 3 seeds", "5-fach", "5-plis", "seed-42", "لبذرة 42".
  - Set `text` to today's on-site wording per language (for example, en "3-seed mean").
  - Build `airplaneVsRest` the same way. It is a candidate only, not enforced in PR A (data-model.md).
  - Import nothing except `@/lib/i18n-config` types.
- [ ] T005 Create `src/lib/claims/format.ts`.
  - Move the body of `formatLocaleNumber(raw, lang)` here from `src/lib/genie/links.ts`, unchanged.
  - In `src/lib/genie/links.ts`, replace the function with `export { formatLocaleNumber } from '@/lib/claims/format'`.
  - Confirm that `tests/genie/links.test.ts` and `tests/genie/claims.test.ts` still pass.
- [ ] T006 Create `src/lib/claims/registry.ts` (depends on T004).
  - Export `ClaimId`, `Claim` and `CLAIMS` per data-model.md "Claim".
  - Define the starting claims: `thesis.mean`, `thesis.baseline`, `thesis.gainPp`, `thesis.seed42`, `thesis.seed42Fpr95`, `benchmark.externalRange`, `benchmark.externalMean`, `inkjet.baseline`. Add `thesis.kAblation.*` and `thesis.lambdaSweep.*` entries only for values that a page quotes; find them with `grep` on the K-ablation and λ-sweep values in `src/` and `public/llms*.txt`.
  - Read every `value` and `spread` from `@/lib/ood-explorer-data`, never as a literal:
    - `CIFAR_LAMBDA_SWEEP` rows with `isOptimal` and with `lambda === '0.0'`;
    - `BENCHMARK_DATASETS`;
    - `INKJET_OVERALL_SWEEP['0.0']`.
  - Compute `thesis.gainPp` and `benchmark.externalMean` the same way `DERIVED` does in `tests/genie/claims.test.ts`.
  - Set `qualifiers` to enforced rules only, per data-model.md: `threeSeeds` on `thesis.mean`, `seed42` on `thesis.seed42`, `fiveFoldCv` on `inkjet.baseline`. Record candidate rules in a separate `candidateQualifiers` field.
  - Fill `evidence` from the constitution's Claim Integrity Standards and `specs/001-claim-integrity-alignment`: thesis table or page, or public artifact.
- [ ] T007 In `src/lib/claims/registry.ts`, export `isBackedValue(n)` (depends on T006).
  - It returns true for any named-claim value or spread, any computed value, and any number in the data file outside the keys `histogram`, `roc`, `id_pct` and `ood_pct`. That last set uses the same walk as `collectDataNumbers` in `tests/genie/claims.test.ts`, including decimals inside strings.
  - Compare with a tolerance of 1e-9.
- [ ] T008 [P] Create `src/lib/claims/retired.ts`.
  - Export `retiredFigures()` returning `{ id, text, unit, reason, retiredOn }[]`.
  - Cover `80.25%`, `+18.8pp`, "18.8 percentage" and `98.4%` (production accuracy, retired 2026-11-27).
  - Store each value as a joined segment array, as `FORBIDDEN_SUBSTRINGS` does in `tools/verify-export.mjs`, so the literal never appears in the file.
- [ ] T009 [P] Create `src/lib/claims/read-figures.ts` with `readFigures(text, lang): Figure[]`, per research R4 and contracts/figure-check.md:
  - **Cleaning**: strip tags; remove U+2066–2069, U+200E and U+200F; turn U+00A0 into a space; turn `+/-` into `±`.
  - **Tokens**: `\d+(?:[.,]\d+)+`.
  - **Thousands grouping**: skip `^\d{1,3}(,\d{3})+$` for en and ar, and `^\d{1,3}(\.\d{3})+$` (and space grouping for fr) for de, fr and es, unless the token is followed by `%`.
  - **Dates and ISO timestamps**: skip.
  - **Values**: read `.` or `,` as the decimal mark.
  - **`resultLooking`**: true when the token is followed by `%`, `pp` or a points word, or shares its clause with a metric word: AUROC, FPR, TPR, accuracy, mAP, Genauigkeit, précision, exactitud, دقة.
- [ ] T010 [P] Write `tests/claims/read-figures.test.ts` (depends on T009). Cover:
  - `9.000` and `6.408` in de and es, and `6,408` in ar, read as counts;
  - `99,03` read as 99.03 in every language;
  - `99.03<span>%</span>` and `+6.5<tspan>pp</tspan>` read as single figures;
  - text with bidi marks and NBSP;
  - `+/-` read as `±`;
  - dates skipped;
  - `rgba(0,0,0,0.38)` excluded by its context in the source scanner (assert this in T020 instead if it is out of scope here).
- [ ] T011 [P] Write `tests/claims/registry.test.ts` (depends on T006, T007). Assert:
  - each claim's value and spread equal the data-file fields they name;
  - `thesis.gainPp` equals optimal mean minus baseline mean, rounded to 1 decimal;
  - no claim value has 3 decimals with a non-zero integer part (the grouping collision, research R0);
  - every `qualifiers` and `candidateQualifiers` id exists in `QUALIFIERS` with all 5 languages;
  - `isBackedValue(99.03)` and `isBackedValue(0.8673)` are true, and `isBackedValue(99.30)` and `isBackedValue(98.9)` are false.

**Checkpoint**: `npm test`, `npm run typecheck` and `npm run lint` pass. The registry is usable, but no surface reads it yet.

---

## Phase 3: User Story 1 — a wrong or unqualified figure fails the build (Priority: P1) 🎯 MVP = PR A

**Goal**: one check, run from `npm test` and `verify:export`, fails on unregistered, retired, spread-less and unqualified figures in all five languages and every FR-006 surface. Today's findings sit in a shrink-only baseline.

**Independent Test**: plant one wrong figure per language and surface (quickstart.md, "Prove it catches a planted figure"). `npm test` fails once per plant and names the file and language. Remove the plants, and it passes.

### Tests for User Story 1

- [ ] T012 [P] [US1] Write `tests/claims/check.test.ts` with the planted-figure fixtures from contracts/figure-check.md "Fixtures". Build in-memory `TextUnit`s for:
  - a source map with the 5 language keys;
  - a manifest paragraph;
  - an SVG;
  - an OG card;
  - an HTML block.

  For each, plant:
  - `99,30 %` in de;
  - `99.03%` without its spread in en;
  - `0.8673 ± 0.0230 AUROC` without 5-fold in en (US1.4);
  - the retired `80.25%`, built from segments in the test;
  - an unlisted `Table 7.2` value next to "AUROC";
  - a listed non-result (US1.6).

  Assert exactly one finding per plant, with the right `rule`, `file` and `lang`, and none for the listed non-result. These tests fail until T013 is done.
- [ ] T013 [US1] Write `tests/claims/sources.test.ts`. It runs the real source scan (T016) and `compareWithBaseline(findings, baseline, ['source'])`. On failure, it prints every new finding and stale entry in the contracts/figure-check.md message format.

### Implementation for User Story 1

- [ ] T014 [US1] Create `src/lib/claims/check.ts` (depends on T007–T009). Export `checkUnit(unit, nonResults)`, `retiredFigures` (re-export from `retired.ts`) and `compareWithBaseline(findings, baseline, scopes)`, per contracts/figure-check.md.
  - **`unregistered`**: a `resultLooking` figure where `!isBackedValue` and no non-result pattern matches the unit text around it.
  - **`retired`**: any figure or phrase matching `retiredFigures()` in any decimal mark, with or without a space before the unit.
  - **`mean-without-spread`**: a named claim with a spread whose mean appears while its spread value does not appear anywhere in the unit (research R6).
  - **`missing-qualifier`**: for each enforced qualifier of a named claim present in the unit, the language's `accepts` regex must match the unit text.
  - **Findings**: carry `figure` as written, and `detail` and `fix` text as in the contract table.
  - **Baseline comparison**: compare counts per key `(scope, file, lang, figure, rule)`.
- [ ] T015 [P] [US1] Fill `tools/claims/non-results.json` with pattern entries (`id`, `pattern`, `reason`, `example`), per research R8. Classes:
  - thesis references (`Eq.|Fig.|Table|Abb.|شكل` followed by `x.y`);
  - GDPR article references;
  - `λ = x` and `s = x`;
  - version strings;
  - parameter counts (`25.86M params`);
  - bracketed intervals (`U[1,1000]`);
  - diff hunk headers.

  Keep it at 25 entries or fewer. `check.ts` must report a pattern that matches nothing as `unused non-result pattern`.
- [ ] T016 [US1] Create `tools/claims/scan-sources.mjs`, exporting `scanSources(): TextUnit[]` (research R5 and the contract's input table).
  - **Parsing**: load `typescript` through `createRequire` from the repository root. Parse every `src/**/*.ts` and `src/**/*.tsx` except `src/lib/ood-explorer-data.ts`.
  - **Units**:
    - each object literal is a card;
    - a string's language is the nearest ancestor property key in `en/de/fr/es/ar`, else `en`;
    - language-neutral strings join every language's card text;
    - JSX text joins the nearest enclosing JSX element that has words besides the figure.
  - **Skip** strings under `className`, `style`, `d` and `viewBox` attributes, and under CSS-valued properties.
  - **Text files**: add `public/llms.txt`, `public/llms-full.txt` and `README.md`, split into paragraphs, list items and table rows. Add `.github/readme/hero-dark.svg` and `hero-light.svg`, one unit per file. Add the card objects of `tools/generate-og-images.mjs`, one unit per card.
  - **Paths**: emit file paths repository-relative with `/` separators.
- [ ] T017 [US1] Create `tools/claims/run-check.mjs`, exporting `runClaimsCheck({ scopes, outDir? })`.
  - It loads the non-results and baseline JSON, runs `scanSources()` and `checkUnit`, adds the export units when `'export'` is in scopes (T018), and returns `{ newFindings, staleEntries }`.
  - Export findings whose figure and rule already have a `source` finding are dropped (research R9).
  - It also exports a `format(findings)` helper producing the contract's message lines.
- [ ] T018 [US1] Create `tools/claims/scan-export.mjs`.
  - It turns `out/**/*.html` into block units: `p`, `li`, `tr`, `h1`–`h6`, `dt`/`dd`, `figcaption`, `blockquote`, `title`, each `meta` `content`, and `div`s whose text holds a figure plus words, after removing `<script>` and `<style>` bodies.
  - It reads `out/_next/static/**/*.js` for the `retired` rule only.
  - Use no new dependency: use regex block splitting, like `stripExecutableBlocks` in `tools/verify-export.mjs`.
- [ ] T019 [US1] Edit `tools/verify-export.mjs`.
  - Remove the three metric entries from `FORBIDDEN_SUBSTRINGS`: the `80.25%` baseline, the `+18.8pp` delta and the percentage phrase. Keep the token and analytics entries (FR-008).
  - After the existing checks, call `runClaimsCheck({ scopes: ['source','export'], outDir })`. Print its findings, and set the exit code to 1 when either list is non-empty.
- [ ] T020 [US1] Measure and record the baseline.
  - Run the check with an empty baseline.
  - Triage each finding into one of:
    - a new non-result pattern (T015);
    - a missing qualifier phrasing to add to `QUALIFIERS` (T004);
    - a real finding.
  - Write the real findings to `tools/claims/baseline.json` (both scopes), including the `95.04%` blog figure, the rounded `98.9%`/`95.4%` in `src/components/OodDemo.tsx`, and the title findings. Then confirm that `npm test` and `npm run verify:export` pass.
  - Record in the PR A description:
    - counts per rule, file and scope;
    - the candidate-qualifier counts (`airplaneVsRest`, `threeSeeds` on the baseline and gain, `seed42` on FPR and external figures), measured but not enforced;
    - the source-scan time and the `verify:export` time before and after (SC-006, at most 5 s added).
- [ ] T021 [US1] Switch `tests/genie/claims.test.ts` to the registry (FR-009).
  - Replace `collectDataNumbers`, `DERIVED`, `isBacked`, `THREE_SEEDS`, `SEED_42`, `FIVE_FOLD` and `MEANS` with imports from `@/lib/claims` and `QUALIFIERS`.
  - Keep `decimals()` or replace it with `readFigures`, and keep the `NOT_RESULTS` set.
  - Keep every existing `describe` and `it` and its assertions, including the "would catch" cases and the `formatLocaleNumber` spread strings.
  - Before the change, record the test count with `node --import ./tools/test-hooks.mjs --test tests/genie/claims.test.ts`. After it, confirm the count is unchanged and all pass (SC-007).
- [ ] T022 [P] [US1] Amend `.specify/memory/constitution.md` (research R14). In "Claim Integrity Standards", change the 98.4% line to say 98.4% is retired, has no public artifact, and must not appear on any surface (spec 008). Bump the version to 1.0.2 and Last Amended to the PR date, and add a Sync Impact Report line.
- [ ] T023 [P] [US1] In `AGENTS.md`, in the claim-integrity section (around line 232), add three short points:
  - figures come from `@/lib/claims`;
  - the check runs in `npm test` and `verify:export`;
  - the baseline in `tools/claims/baseline.json` only shrinks.

  Link quickstart.md.
- [ ] T024 [US1] Prove SC-001 by hand on a scratch working copy, per quickstart.md:
  1. Plant `99,30%` in the de Hero line in `src/components/Hero.tsx`; `npm test` must fail naming the file and `de`.
  2. Revert, then repeat for one string in each of the other languages and surfaces: `public/llms.txt`, `README.md`, an SVG, and an OG card.
  3. Revert all plants.
  4. Put the output in the PR A description.
- [ ] T025 [US1] Open PR A from a fresh branch off `origin/main` (for example `feat/008-claims-check`).
  - **Checks**: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run verify:export` all pass locally.
  - **PR body**: says "no visible change" and carries the T020 and T024 records.

**Checkpoint**: PR A merged. New drift fails CI. Existing findings are listed in the baseline.

---

## Phase 4: User Story 2 — one place to change a figure (Priority: P2), PR B

**Goal**: `formatClaim(id, lang, variant)` renders every registered figure, with each language's decimal mark and qualifier. Retired ids cannot render. OG images carry a hash lock.

**Independent Test**: on a scratch branch, change `withinCifarMean` of the optimal row in `src/lib/ood-explorer-data.ts`. Every FR-010 surface shows the new value in all five languages (after T034–T042), and the check flags each remaining typed copy (quickstart.md, "Change or retire a value").

### Tests for User Story 2

- [ ] T026 [P] [US2] Extend `tests/claims/registry.test.ts` with the `formatClaim` examples table in contracts/claims-api.md, for all 4 variants and 5 languages:
  - de and fr: `99,03 % ± 0,07 %`;
  - en and es: `99.03% ± 0.07%`;
  - ar: wrapped in U+2066…U+2069, with U+00A0 around `±`;
  - pp gains: a leading `+`.

  Also assert that an unknown id throws `unknown claim`, and that `// @ts-expect-error` on a retired id compiles under `npm run typecheck`.

### Implementation for User Story 2

- [ ] T027 [US2] Implement `formatClaim(id, lang, variant = 'spread')` in `src/lib/claims/format.ts`, per contracts/claims-api.md and research R3. Print exactly `claim.decimals` digits, compute `thesis.gainPp` at call time, and throw `Error('unknown claim <id>')` for any id not in `CLAIMS`. Export it from `src/lib/claims/index.ts`.
- [ ] T028 [US2] Fix the `full` and `qualifier` wording per language in `src/lib/claims/qualifiers.ts` (`text`). Take it from today's on-site wording on the FR-010 surfaces (FR-004). Where surfaces disagree, choose one form per language and note it for the FR-011 list (T043).
- [ ] T029 [US2] Refactor `tools/generate-og-images.mjs`:
  - export the card definitions;
  - build the `stat` lines of `og-diffusion-ood.png`, `og-inkjet-ood.png`, `og-ood-diffusion-thesis.png` and `og-diffusion-models-anomaly-detection.png` from `formatClaim(…, 'en', …)` through `@/lib/claims`;
  - run the rendering `main` only when the file is executed directly (`process.argv[1] === fileURLToPath(import.meta.url)`);
  - when run, write `tools/claims/og-cards.lock.json`, mapping each PNG name to the SHA-256 of `eyebrow|title|sub|stat` (data-model.md "OgCardLock");
  - update the header comment's run command to `node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs`.
- [ ] T030 [US2] Add the `stale-og-image` rule to `tools/claims/run-check.mjs` (scope `source`). It recomputes each exported card's hash and compares it with `og-cards.lock.json`, failing with the contract message. Add a fixture case to `tests/claims/check.test.ts` with a changed card and an old hash.
- [ ] T031 [US2] Run the generator (sharp from `node_modules`). Commit the regenerated `public/og-*.png` and `tools/claims/og-cards.lock.json` together. If a PNG's pixels do not change (identical stat text), say so in the PR (FR-012).

**Checkpoint**: `formatClaim` is tested in five languages, and the OG lock is in place. Surfaces do not use them yet.

---

## Phase 5: User Story 3 — existing drift is cleaned up (Priority: P2), PR B

**Goal**: no typed-in registered figure is left on any FR-010 surface. Every baseline finding is fixed, and the baseline file is empty.

**Independent Test**: count typed-in registered figures on the FR-010 files before (T032) and after: after is 0 (SC-004). `npm test` and `verify:export` pass with `tools/claims/baseline.json` equal to `[]` (SC-002).

**⚠️ Blocked until the owner answers** the two plan decisions: (1) bare figures in titles (research R11), and (2) the `95.04%` YOLO figure. Record the answers in spec.md "Clarifications" before T040 and T041.

- [ ] T032 [US3] Before editing, record the SC-004 starting count.
  - **Count**: run `grep -cE "99[.,]03|92[.,]52|0[.,]8673|6[.,]5 ?pp|98[.,]98"` over each FR-010 file and put the totals in the PR B description. The files are:
    - `src/components/Hero.tsx`, `Evidence.tsx`, `Research.tsx`, `Experience.tsx`, `Projects.tsx`, `HeroSignal.tsx`, `OodDemo.tsx`, `JsonLd.tsx`;
    - `src/lib/portfolio-copy.ts`, `src/lib/case-studies.ts`;
    - `src/app/case-studies/diffusion-ood/page.tsx`, `src/app/case-studies/inkjet-ood/page.tsx`, `src/app/layout.tsx`;
    - `src/lib/genie/knowledge.ts`, `src/lib/genie/prompts.ts`;
    - `tools/generate-og-images.mjs`.
  - **Snapshot**: create `tools/claims/text-snapshot.mjs`, modelled on `tools/playwright-smoke.mjs`: the same `out/` server, `ROUTES` and Playwright loading via `PLAYWRIGHT_MODULE_ROOT`. For each route and each language (setting `localStorage.language`, then reloading), it writes `document.body.innerText` plus `document.title` and the meta description to `<dir>/<lang><route>.txt`.
  - Run it on a build of `origin/main` into the scratchpad, as the FR-011 "before".
- [ ] T033 [P] [US3] `src/components/Hero.tsx`: replace the typed figures in the five-language legend strings (lines around 71–75) with template strings built from `formatClaim`. The Spanish `99,03%` becomes `99.03%`, a listed fix.
- [ ] T034 [P] [US3] `src/components/Evidence.tsx`: replace the `meta` figures with `formatClaim`, and add the 3-seed qualifier to the card, resolving its baseline `missing-qualifier` entries.
- [ ] T035 [P] [US3] `src/components/Research.tsx`: move the copy map (lines around 32–36) and both metric tiles (lines around 268 and 338) onto `formatClaim`. Keep the `<span className="cd-rf-metric-unit">` split by using the `value` variant's number and unit parts, or add a `parts` helper to `format.ts` with a test.
- [ ] T036 [P] [US3] `src/components/Experience.tsx`: move the figures in the five thesis-role strings onto `formatClaim`. Keep the "standard deviation from … to …" prose (research R6) or switch it to the `spread` form, and list the choice.
- [ ] T037 [P] [US3] `src/lib/portfolio-copy.ts` (`metricValue` and `metricLabel` around lines 239–356) and `src/components/Projects.tsx`: move onto `formatClaim`. The de and fr `99.03%` and `+6.5pp` become `99,03 %` and `+6,5 pp`, listed.
- [ ] T038 [P] [US3] `src/components/OodDemo.tsx`: move the λ labels (lines around 233–244) and KPI `bdi` values (around 1173–1177) onto `formatClaim`. Replace the rounded `98.9%` and `95.4%` (line around 478, five languages) with the registered `98.87%` and `95.44%` read from `TIMESTEP_STRATEGIES`, a listed fix. Also `src/components/HeroSignal.tsx`: add the seed-42 qualifier to its figure description.
- [ ] T039 [P] [US3] `src/lib/case-studies.ts`, `src/app/case-studies/inkjet-ood/page.tsx` and `src/components/JsonLd.tsx`: move the figures onto `formatClaim`. JSON-LD stays English. Rewrite "Thesis PDF (0.8673 source)" so it names the claim with its spread, or drops the figure; list the change.
- [ ] T040 [US3] Titles, per the owner's answer to decision 1 (research R11 recommends option a). Apply it to:
  - `src/app/case-studies/diffusion-ood/page.tsx` (`title`, `description`, OpenGraph and Twitter);
  - `src/app/layout.tsx` (site description);
  - the blog title and description in `src/lib/blog-posts.ts` and `src/lib/blog-posts-meta.ts` (5 languages);
  - their copies in `public/llms.txt`, `public/llms-full.txt`, `README.md` and `src/lib/genie/knowledge.ts`.

  Do not change slugs or URLs.
- [ ] T041 [US3] The `95.04%` figure, per the owner's answer to decision 2.
  - **If there is a public artifact**: add an `inkjet.yoloMetric` claim to `src/lib/claims/registry.ts` with that evidence, and a spec.md FR-003 note.
  - **Otherwise**: remove the figure from the InkjetOOD paragraph in `src/lib/blog-posts.ts` (5 languages), and list the removal.
- [ ] T042 [US3] Genie: in `src/lib/genie/knowledge.ts` and `src/lib/genie/prompts.ts` (`LOCAL_REPLIES`), replace the typed figures and any remaining template fragments with `formatClaim`. Then run `tests/genie/*.test.ts`, which must pass unchanged.
- [ ] T043 [US3] Fix the remaining baseline entries in `public/llms.txt`, `public/llms-full.txt`, `README.md` and `src/lib/blog-posts*.ts` as text edits; these are check-only surfaces. Delete each fixed entry from `tools/claims/baseline.json` until it is `[]`. Then:
  1. Re-run `tools/claims/text-snapshot.mjs` on the PR B build.
  2. Diff it against T032's "before".
  3. Put every differing line in the PR B description under "Deliberate visible changes" (FR-011, SC-005), grouped by surface and language.

  An unlisted difference is a bug to fix.
- [ ] T044 [US3] Add a test to `tests/claims/sources.test.ts` asserting that `tools/claims/baseline.json` has length 0 (SC-002). Assert that `tools/claims/non-results.json` has at most 25 entries, each with a reason and an example. Re-run the T032 grep over the FR-010 files and confirm 0 typed copies (SC-004).
- [ ] T045 [US3] Prove SC-003 on a scratch copy:
  1. Change the optimal `withinCifarMean` in `src/lib/ood-explorer-data.ts`.
  2. Run `npm run build` and the text snapshot.
  3. Confirm every FR-010 surface changed in all five languages.
  4. Confirm the check flags `tools/claims/og-cards.lock.json` as stale.
  5. Revert.

  Put the result in the PR B description.
- [ ] T046 [US3] Open PR B from a fresh branch off `origin/main`, after PR A merges (for example `feat/008-claims-migration`), with all gates passing. Split it into B1 (T033–T039, T042) and B2 (T029–T031, T040, T041, T043) if the diff gets too large to review.

**Checkpoint**: the baseline is empty, the FR-010 surfaces use the registry, and every visible change is listed.

---

## Phase 6: User Story 4 — Genie's published knowledge from the registry (Priority: P3), blocked

**Goal**: once spec 007 publishes Genie's prompt as a site file, its figures are generated from the registry (FR-013).

- [x] T047 [US4] Done in spec 007, PR 1 (#316, tasks T007–T010): the build publishes `/genie/prompt.json` from the same knowledge entries, and `scanPromptFile` in `tools/claims/scan-export.mjs` checks its rules and entries in the export scope; a missing or unreadable file fails the check.

---

## Phase 7: Polish and cross-cutting concerns

- [ ] T048 [P] Check that `quickstart.md` matches what was built: file names, commands and message format. Update `specs/008-claims-registry/quickstart.md` and `contracts/*.md` where the implementation refined a name.
- [ ] T049 [P] Confirm the bundle guard: after `npm run build`, `out/_next/static/**/*.js` contains no retired value (the `verify:export` retired scan passes) and no `retired.ts` code. `npm run lint` must flag a test import of `@/lib/claims/retired` placed in `src/components/` (try it, then revert).
- [ ] T050 Run the full gate one last time: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run verify:export`. Record the timings against T020 (SC-006).

---

## Dependencies and execution order

### Phase dependencies

- **Setup (Phase 1)**: none.
- **Foundational (Phase 2)**: depends on Setup, and blocks every story.
- **US1 (Phase 3)**: depends on Phase 2. It is PR A.
- **US2 (Phase 4)**: depends on Phase 2. In practice it starts after PR A merges, because PR B branches from `main`.
- **US3 (Phase 5)**: depends on US1 (the check and baseline) and US2 (`formatClaim`, the OG lock), and on the owner's two decisions for T040 and T041.
- **US4 (Phase 6)**: blocked on spec 007.
- **Polish (Phase 7)**: after the PR it belongs to. T049 belongs to PR A; T048 and T050 belong to each PR.

### Within stories

- **Phase 2**: T004 → T006 → T007. T005, T008 and T009 are independent. T010 needs T009, and T011 needs T006 and T007.
- **US1**: T014 needs T007–T009. T016 → T017 → T018/T019. T020 needs T014–T019. T012 and T013 are written first and fail until T014 and T016.
- **US2**: T027 → T028 → T029 → T030 → T031.
- **US3**: T032 first. T033–T039 run in parallel (different files). T040 and T041 need the owner's answers. T042, then T043 → T044 → T045 → T046.

## Parallel examples

```text
# Phase 2, after T004:
T005 format.ts · T008 retired.ts · T009 read-figures.ts   (different files)

# US1 tests and data, while T016 is in progress:
T012 check.test.ts · T015 non-results.json · T022 constitution · T023 AGENTS.md

# US3 surface migration, after T032:
T033 Hero · T034 Evidence · T035 Research · T036 Experience · T037 portfolio-copy+Projects · T038 OodDemo+HeroSignal · T039 case-studies+JsonLd
```

## Implementation strategy

- **MVP (PR A)**: Phases 1–3 plus T049. This is the gate: new drift fails CI, nothing
  visible changes, and today's findings are listed.
- **Then PR B**: Phases 4–5, after PR A merges and the owner answers the two decisions.
  It may split into B1 (page surfaces) and B2 (OG, titles, manifests and blog fixes).
- **Later**: Phase 6, after spec 007.

## Notes

- Never write a retired value as a plain literal in any file. Join segments, as
  `retired.ts` and the tests do.
- Paths in findings and the baseline are repository-relative with `/`.
- Agents never merge their own PRs. Check each PR is still open before pushing
  follow-ups (CLAUDE.md).
