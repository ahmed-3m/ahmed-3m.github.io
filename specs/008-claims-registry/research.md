# Research: Claims Registry and Figure Check

Phase 0 output for [plan.md](plan.md). Each section records a decision, the reason for
it, and the alternatives that were considered.

## R0. Baseline measurement

**What was run.** A throwaway script outside the repository, run on 2026-11-27 against
commit `c2c6c89`. It:

- parsed every `.ts` and `.tsx` file under `src/` with the TypeScript compiler API, skipping
  the data file;
- read `public/llms*.txt`, `README.md`, the two README hero SVGs and the OG generator;
- applied the Genie test's rules (`tests/genie/claims.test.ts`), with the per-language
  number reading from R4.

The counts are heuristic. Tasks re-measure them as the first User Story 1 step, and the
real baseline file replaces them.

| Measure | Result |
|---|---|
| Source scan time | about 0.4 s (86 files, about 12,700 text units) |
| Registered values with three decimals and a non-zero integer part (they would clash with the thousands rule) | none |
| Unregistered decimals in result context | 26 hits, 5 distinct (table below) |
| Mean without its spread anywhere in the same unit | about 30 |
| Registered claim without its qualifier in the same unit (today's three rules only) | about 70; the largest group is blog titles at 26. The others:  `llms*.txt` 11, diffusion case-study metadata 6, Evidence, HeroSignal, Projects and Research tiles 15, other 12 |

The 5 distinct unregistered decimals:

| Figure | Where | Verdict |
|---|---|---|
| `98.9%`, `95.4%` (`98,9%`, `95,4%` in de and fr) | `OodDemo.tsx`, timestep-strategy note, 5 languages | **Rounded** copies of `98.87` and `95.44` in `TIMESTEP_STRATEGIES`. A real finding: the clarification says full precision only. |
| `95.04%` | `blog-posts.ts`, InkjetOOD YOLOv8m paragraph, 5 languages | **Not in the data file.** A YOLO detection metric. Baselined in PR A. The owner decides before PR B: register it with a public artifact, or remove it. |
| `6.8`, `6.1` | "Fig. 6.8", "Table 6.1", "art. 6.1.f" | Not results. Non-result patterns. |
| `1,1000` | `U[1,1000]` interval | Not a result. Non-result pattern for bracketed intervals. |

**Observations that change the spec's wording:**

- **German and French decimal marks are mixed today.** `Hero.tsx` and `OodDemo.tsx` use
  `99,03%`; `Evidence.tsx`, `Research.tsx` and `portfolio-copy.ts` use `99.03%` and `+6.5pp`
  in the de and fr entries. No page copy uses the spaced form `99,03 %`. Only Genie's German and French
  replies do, through `formatLocaleNumber`, and the Genie test asserts it. The Spanish Hero line uses `99,03%`, while all other
  Spanish copy uses a point.
- **Blog posts write the spread as `+/-`**, not `±`.
- **Some text states a spread apart from its mean.** `Experience.tsx` says "from 92.52% to
  99.03% … standard deviation from 11.07 to 0.07 percentage points". That is a valid
  statement of spread, so the rule must accept it (see R6).
- **German and Spanish group thousands with a point** (`9.000`, `6.408`), and Arabic copy
  with a comma.

## R1. Registry location and shape

**Decision**: the registry lives in `src/lib/claims/registry.ts`. It is a typed `const`
object of named claims built from `ood-explorer-data.ts`. The module imports only the data
file, never `node:` modules.

Retired claims live in `src/lib/claims/retired.ts`, with their values joined from
segments. Only `check.ts` imports that file. An ESLint `no-restricted-imports` rule keeps
it, and `check.ts`, out of `src/components` and `src/app`. Otherwise the retired values
would reach the client bundle, where the minifier can fold the segments back into a
literal and the bundle scan would fail on the registry itself.

**Rationale**:
- Components, the OG generator, Genie and the tests all need it.
- Keeping it beside the data file and client-safe lets the same object feed both
  rendering and the check.
- A typed `ClaimId` union of current claims means a retired id does not compile, which
  is an extra guard on FR-005.

**Alternatives considered**:
- A JSON registry: it cannot compute derived values and loses the type check.
- Putting the claims inside `ood-explorer-data.ts`: that mixes plot data with publishing
  rules, and the spec keeps the data file as the source and not the registry.

## R2. Named claims vs data-backed values

**Decision**: there are two tiers.

1. **Named claims.** These are about 15 headline results: the thesis mean and baseline,
   the gain, the seed-42 run, the external benchmark range and mean, the inkjet
   baseline, and the K-ablation and λ-sweep figures that pages quote. Each has a spread,
   qualifiers, an evidence reference and display forms. The spread and qualifier rules
   apply to these only.
2. **Data-backed values.** These are every other number in the data file outside plot
   arrays (the same walk `collectDataNumbers` does today), plus the derived values.
   They pass the "registered value" rule, but they carry no spread or qualifier rules.

**Rationale**:
- FR-009 needs the Genie test to keep exactly today's coverage, and today any data-file
  number is backed.
- Registering each of about 100 per-feature table values as a named claim would add bulk
  with no protection.

**Alternatives considered**:
- Named claims only. This would fail today's Genie knowledge on per-feature values, and
  it would push them onto the non-result list, which is capped at 25 entries.

## R3. Display forms and `formatClaim`

**Decision**: `formatClaim(id, lang, variant)` returns a string. The variants are:

| Variant | Example (en) |
|---|---|
| `value` | `99.03%` |
| `spread` | `99.03% ± 0.07%` |
| `full` | `99.03% ± 0.07% AUROC (3-seed mean)` |
| `qualifier` | the qualifier text alone, for labels |

The language forms are:

- **de and fr**: the decimal comma with a space before `%`, using the existing
  `formatLocaleNumber` rule (`99,03 % ± 0,07 %`).
- **en and es**: a decimal point.
- **ar**: a decimal point, with the figure wrapped in LRI…PDI isolates (`⁦…⁩`) and
  no-break spaces around `±`, as today's Arabic copy does.

`formatLocaleNumber` moves into `claims/format.ts`, and `genie/links.ts` re-exports it, so
there is one implementation.

**Rationale**:
- One formatter for the site and Genie.
- The spec (US2.2) names the spaced form.
- The Arabic isolates keep figures readable in right-to-left text, as
  `tokenizeBidiNumbers` already expects.

**Consequence**: the German and French page copy changes from `99.03%` or `99,03%` to
`99,03 %`. The Spanish Hero line changes from `99,03%` to `99.03%`. These are deliberate
fixes, listed in PR B (FR-011). The spec's US2.2 wording "matches what the site shows
today" is corrected in this PR.

**Alternatives considered**:
- Reproducing each surface's current form: this keeps the drift that the feature exists
  to remove.
- Returning React nodes: the OG generator, JSON-LD and Genie need plain strings.

## R4. Reading figures in text

**Decision**: before matching, `readFigures(text, lang)`:

- strips tags (JSX and SVG split figures, as in `99.03<span>%</span>` and
  `+6.5<tspan>pp</tspan>`);
- removes bidi marks (U+2066–2069, U+200E, U+200F);
- turns no-break spaces into spaces;
- reads `+/-` as `±`.

It then reads each `\d+([.,]\d+)+` token like this:

- **Thousands grouping** is skipped when the token is not followed by `%`:
  - en and ar: `^\d{1,3}(,\d{3})+$`
  - de, fr and es: `^\d{1,3}(\.\d{3})+$`
  - fr also: a thin or plain space between groups
- **Dates and ISO timestamps** are skipped.
- **Otherwise**, either `.` or `,` is read as the decimal mark in any language. The
  mixed copy in R0 means the value rule must not depend on the mark.

A token is **result-looking** if it is followed by `%`, `pp` or a points word, or if it
shares its clause with a metric word: AUROC, FPR, TPR, accuracy, mAP, or their
translations. Strings in `className`, `style`, SVG `d` and `viewBox` attributes, and in
CSS-valued properties, are never read.

**Rationale**:
- R0 found no registered value that clashes with the grouping rule.
- The metric-context filter cut the false positives from 207 (every decimal) to 26
  (result-looking), and those 26 were real findings or easy non-result patterns.

**Alternatives considered**:
- Enforcing each language's decimal mark as part of the value rule. The site would fail
  until PR B, and blog posts (check-only) would need rewording. Instead, mark style is
  reported as information on FR-010 surfaces, and `formatClaim` makes it uniform there.

## R5. Text units and "near"

**Decision**: one unit is used for both the spread rule and the qualifier rule:

| Surface | Unit |
|---|---|
| TS and TSX string or template literal inside an object literal | The **card**: the nearest enclosing object literal. Strings under a language key (`en`, `de`, `fr`, `es`, `ar`, at any depth below the card) belong to that language. Other strings are language-neutral and join every language's card text. |
| JSX text | The nearest enclosing JSX element that contains words besides the figure. |
| `llms*.txt`, `README.md` | A paragraph, list item or table row. |
| README hero SVG | The whole file (one image). |
| OG generator | One card entry. |
| Exported HTML | A block element (`p`, `li`, `tr`, `h1`–`h6`, `dt` or `dd`, `figcaption`, `blockquote`, `title`), each `meta` content, and any `div` whose text holds the figure plus words. |

The language of a string comes from the nearest ancestor property key in the language
set. Otherwise it is English: `en`, the language-neutral fallback.

**Rationale**:
- The spec defines "near" as the same sentence, list item, table row or card.
- An object literal is how this codebase builds cards: `metricValue`, `metricLabel`
  and a translation map per field. R0 used this unit and got sensible results.

**Known gap**: in metric tiles such as `Research.tsx`, the figure is JSX text and its
label is `{t(copy.x)}`, so the source scan cannot join them. These tiles are covered by
the HTML scan (the rendered `div` holds number, label and spread), and PR B moves them to
`formatClaim`.

**Alternatives considered**:
- Character-distance windows: they break on long prose and on short tiles.
- Rendering every locale to HTML: the export is English-only by design (spec
  assumption), and rendering four more locales would cost far more than 5 s.

## R6. Spread rule

**Decision**: a named claim's mean "has its spread" if the spread value, in any accepted
spelling, appears in the same unit as the mean. The form `mean ± spread` is preferred,
and `formatClaim` emits it. A sentence such as "standard deviation from 11.07 to 0.07
percentage points" also passes.

**Rationale**:
- The aim is a reader who sees the mean also sees its spread.
- `Experience.tsx` states the spread correctly in prose (R0).

**Alternatives considered**:
- Requiring an adjacent `±`: this flags correct prose, and the fix would be wording churn.

## R7. Qualifier rule

**Decision**: each named claim lists its required qualifiers, and each qualifier has a
display text and accepted phrasings per language in `claims/qualifiers.ts`. The starting
set is the Genie test's `THREE_SEEDS`, `SEED_42` and `FIVE_FOLD` patterns, with these
additions:

- **Phrasings found on the site today**: "3-Seed-Mittel", "moyenne 3 seeds", "3 graines",
  "media 3 seeds", "5-fach", "5-plis", "5-fold" in es and ar, "seed-42", and "لبذرة 42".
- **The airplane-vs-rest scope** (`airplane-vs-rest`, `Flugzeug-vs-Rest`, …), required by
  the constitution for the thesis claims unless multi-class is explicitly claimed.

New phrasings go into the registry, never into the check (spec assumption).

**Scope in PR A**: only today's three rules are enforced, the ones the Genie test
already applies:

- `threeSeeds` on the thesis mean (99.03%);
- `seed42` on the seed-42 run (98.98%);
- `fiveFoldCv` on the inkjet baseline (0.8673).

These candidate rules are measured in PR A, and the counts go into the PR A
description:

- `airplaneVsRest` on the thesis claims;
- `threeSeeds` on the baseline and the gain;
- `seed42` on FPR@95 and the external benchmark figures.

Each candidate is enforced only after a spec amendment in PR B, because the spec
assumption names today's phrasings and FR-009/SC-007 require the same Genie cases to
pass. The Genie test keeps applying exactly the three.

**Rationale**: the registry is the single place where the wording lives. The Genie
test's current patterns carry over unchanged, so its coverage holds (FR-009, SC-007).

## R8. Non-result list

**Decision**: `tools/claims/non-results.json` holds **patterns**, not literals. Each entry
has an id, a regex over the unit's text, a reason, and an example file. The starting
classes are:

- thesis references: Eq., Fig., Table, Abb., شكل, followed by `x.y`;
- legal references: `art. 6.1`;
- λ and hyperparameter assignments: `λ = x`, `s = x`;
- version strings: `vX.Y`, `glm-5.2`;
- parameter counts: `25.86M params`;
- bracketed intervals: `U[1,1000]`;
- diff hunk headers inside blog code blocks.

**Rationale**:
- SC-002 caps the list at 25 entries.
- R0 shows that patterns stay well under the cap, while literals would not (25.86
  alone appears 50 times).

**Alternatives considered**:
- Inline ignore comments in source: they do not work in `llms.txt` or the HTML, and the
  exceptions would be scattered across files.

## R9. Baseline of existing findings

**Decision**: `tools/claims/baseline.json` lists the findings present when the check
lands. Each finding is keyed by scope, file, language, figure and rule, with no line
numbers, so ordinary edits do not churn it.

- **Paths**: repository-relative with forward slashes, so a baseline written on Windows
  matches on the Linux CI runner.
- **Scope**: each entry is `source` (the source, manifest, README, SVG and OG scan,
  which both runners perform) or `export` (built HTML, which only `verify:export` sees).
  Each runner reports stale entries only for the scopes it scans, so `npm test` never
  sees the `export` partition as stale.
- **Duplicates in the export**: an export finding is dropped when its figure and rule
  already have a `source` finding. A blog title rendered on every page that links to
  it is then reported once, at its source. The export partition was not measured in R0.
  PR A's first task measures it.

The check:

- fails on any finding **not** in the baseline;
- fails on any baseline entry that **no longer occurs**, which forces the file to
  shrink;
- requires an empty baseline once PR B lands. A test asserts the file's length is 0, and
  that test is enabled in PR B.

**Rationale**:
- R0 shows about 100 current findings, many of them visible-wording decisions (R11).
- Fixing them all in PR A would mix the gate with a five-language copy rewrite and
  delay the protection that User Story 1 exists for.
- A shrink-only baseline gives the gate on day one. The spec's end state (SC-002, no
  exceptions beyond the non-result list) is unchanged.

**Alternatives considered**:
- Fixing everything in PR A: too large, and it needs the owner's decision on titles first.
- Warn-only mode until PR B: nothing would stop new drift in the meantime.

## R10. Where the check runs

**Decision**:

- **`npm test`** (CI job `quality`):
  - `tests/claims/*` scans every source file in five languages, `llms*.txt`, the README,
    the SVGs and the OG generator, and checks the result against the baseline;
  - it runs the planted-figure fixtures (SC-001);
  - `tests/genie/claims.test.ts` uses the registry.
- **`npm run verify:export`** (CI job `build`): it runs with
  `--import ./tools/test-hooks.mjs`, so it can import the TypeScript registry. It:
  - runs the same source scan, so the export gate stands even if tests were skipped;
  - scans `out/**/*.html` in block units;
  - scans `out/_next/static/**/*.js` for retired figures only.
- **The deny-list in `verify-export.mjs`** loses its three metric entries (FR-008). The
  token and analytics entries stay.

**Rationale**:
- Bundled JavaScript is minified code. Checking its numbers beyond the retired values
  would be noisy, and its translation strings are already covered by the source scan.
- Both CI jobs are required checks.

## R11. Titles with a bare headline figure

**Finding**: the blog post "How I Reached 99.03% AUROC on OOD Detection …" (title in 5
languages, also linked from `llms*.txt`, the README and Genie knowledge) and the diffusion
case study's `<title>` ("Diffusion OOD Detection — 99.03% AUROC (Case Study)") state the
mean without its spread or the 3-seed qualifier.

**Options for PR B** (owner's decision):
- (a) Add the spread and a short qualifier: "… 99.03% ± 0.07% AUROC (3-seed mean) …".
- (b) Drop the figure from titles and keep it in the description and body.
- (c) Add a "title" unit type that accepts a bare mean when the same page's description
  carries the spread and qualifier.

**Recommendation**: (a). It follows the clarification (full precision, with spread) and
Principle III. Titles grow by about 25 characters. Blog slugs and URLs do not change.

## R12. OG image staleness

**Decision**: the OG generator exports its card definitions and builds the stat lines
from `formatClaim` (PR B). Run by hand, it also writes `tools/claims/og-cards.lock.json`,
which maps each PNG to a SHA-256 of that card's text and a SHA-256 of the PNG it wrote.
The check recomputes the text hashes from the exported definitions without rendering,
and hashes the committed PNGs, so a lock committed without its PNGs fails too. When a
hash differs, the check fails: "OG image `og-diffusion-ood.png` is stale: run
`node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs`". The generator's
main block runs only when the file is executed directly (`import.meta.main`).

**Rationale**:
- Files checked out in CI all carry the same modification time, so dates cannot show
  staleness.
- A content hash is exact and needs no image work in CI.

**Alternatives considered**:
- Comparing git commit dates: shallow CI clones lack the history, and the comparison
  is fragile.
- Running OCR on the PNGs: heavy and inexact.

## R13. Retired claims

**Decision**: `src/lib/claims/retired.ts` (see R1) holds `80.25%`, `+18.8 pp`, "18.8 percentage" and `98.4%`
(production accuracy), each with a reason and the date it was retired. Values are stored
as joined segments. A retired value matches in any language, with either decimal mark,
with or without a space before the unit. Retired ids are not in `CLAIMS`, so
`formatClaim` throws "unknown claim" at prerender time, and the `ClaimId` type rejects
them at compile time. The build fails twice over (FR-005). Components cannot import
`retired.ts`, so retired values never reach the client bundle. R0 found no
current occurrence of `98.4`.

## R14. Constitution amendment

**Decision**: PR A changes the Claim Integrity Standards line on 98.4% to "retired: no
public artifact; must not appear on any surface (spec 008)". It bumps the version to
1.0.2 (PATCH: a clarification of a standard, not of a principle) and updates the Sync
Impact Report and Last Amended.
