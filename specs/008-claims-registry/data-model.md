# Data Model: Claims Registry and Figure Check

Phase 1 output for [plan.md](plan.md). Types are written in TypeScript notation. Names
are the plan's working names, and the tasks may refine them.

## Language

```ts
type Language = 'en' | 'de' | 'fr' | 'es' | 'ar'   // existing, from src/lib/i18n-config.ts
```

## Claim (named claim)

```ts
interface Claim {
  id: ClaimId                    // stable, e.g. 'thesis.mean', 'thesis.baseline', 'thesis.gainPp'
  value: number                  // read from ood-explorer-data.ts, or computed
  spread?: number                // standard deviation where one exists
  decimals: number               // registered precision; display never rounds below it
  unit: '%' | 'auroc01' | 'pp'   // auroc01 = AUROC on a 0–1 scale
  metric: string                 // 'AUROC', 'FPR@95', …
  source: string                 // where the value comes from, e.g. "CIFAR_LAMBDA_SWEEP[isOptimal].withinCifarMean"
  qualifiers: QualifierId[]      // required near the figure on every surface
  evidence: string               // thesis table, figure or page, or a public artifact URL
}
```

**Validation**:

- `value` and `spread` are never number literals in the registry. They are expressions
  over the data file, and a test checks that each equals the data-file value or its
  computation (FR-002).
- `decimals` equals the precision the data file stores. Display uses exactly that
  number of decimals (no rounding, from Clarifications Q3).
- Every `qualifiers` entry exists in `QUALIFIERS` with text and phrasings for all five
  languages.

**Starting claims** (from FR-003). Final ids are set in tasks.

PR A enforces only today's three rules: `threeSeeds` on `thesis.mean`, `seed42` on
`thesis.seed42`, and `fiveFoldCv` on `inkjet.baseline`. "Candidate" rules are measured
but not enforced until a spec amendment (research R7).

| id | value | spread | qualifiers |
|---|---|---|---|
| `thesis.mean` | 99.03 % | 0.07 | `threeSeeds` (+ candidate `airplaneVsRest`) |
| `thesis.baseline` | 92.52 % | 11.07 | none enforced (candidates `threeSeeds`, `airplaneVsRest`) |
| `thesis.gainPp` | computed: mean − baseline = 6.5 pp | n/a | none enforced (candidate `threeSeeds`) |
| `thesis.seed42` | 98.98 % (`BENCHMARK_DATASETS.within_cifar`) | n/a | `seed42` |
| `thesis.seed42Fpr95` | 4.7 % | n/a | none enforced (candidate `seed42`) |
| `benchmark.externalRange` | min–max of the non-within datasets | n/a | none enforced (candidate `seed42`) |
| `benchmark.externalMean` | computed mean of the non-within datasets | n/a | none enforced (candidate `seed42`) |
| `thesis.kAblation.*` | the K-ablation values pages quote | n/a | none enforced |
| `thesis.lambdaSweep.*` | the λ-sweep values pages quote | per row | none enforced (candidate `threeSeeds`) |
| `inkjet.baseline` | 0.8673 | 0.0230 | `fiveFoldCv` |
| `inkjet.yoloMetric`? | 95.04 % | n/a | only if the owner names a public artifact; else removed in PR B (plan, open decision 2) |

## RetiredClaim

This lives in `src/lib/claims/retired.ts`. Only `check.ts` imports it; components never
do (research R1).

```ts
interface RetiredClaim {
  id: string                     // e.g. 'retired.cifarBaseline8025'
  valueSegments: string[]        // joined at runtime; never a plain literal in the file
  unit: '%' | 'pp' | 'phrase'
  reason: string                 // e.g. 'unsourced baseline (spec 001)'
  retiredOn: string              // ISO date
}
```

The starting entries are `80.25%`, `+18.8pp`, "18.8 percentage" and `98.4%`.

**Transition**: a claim moves from `CLAIMS` to `retired.ts`, never back without a spec
change. `formatClaim` then throws "unknown claim" for its id, and the type rejects it
(FR-005).

## Qualifier

```ts
type QualifierId = 'threeSeeds' | 'seed42' | 'fiveFoldCv' | 'airplaneVsRest'

interface Qualifier {
  id: QualifierId
  text: Record<Language, string>         // the display wording, e.g. de 'Mittelwert über drei Läufe'
  accepts: Record<Language, RegExp>      // the phrasings the check accepts
}
```

## DataBackedValue

These are derived, not stored. The set is every number in `ood-explorer-data.ts`
outside the plot arrays (`histogram`, `roc`, `id_pct`, `ood_pct`), plus the computed
values. They satisfy the "registered value" rule only (research R2).

## DisplayForm

`formatClaim(id, lang, variant)` produces it on demand. It is not stored.

```ts
type Variant = 'value' | 'spread' | 'full' | 'qualifier'
```

**Rules**:

- **de and fr**: `,` as the decimal mark, with a space before `%`.
- **en and es**: `.` as the decimal mark, with no space before `%`.
- **ar**: `.` as the decimal mark, the figure wrapped in U+2066…U+2069, and U+00A0 around
  `±`.
- **pp units**: a leading `+` for gains.

## NonResultEntry

This entry lives in `tools/claims/non-results.json`.

```ts
interface NonResultEntry {
  id: string            // 'thesis-reference'
  pattern: string       // regex source, matched against the unit text around the figure
  reason: string        // why numbers matching it are not results
  example: string       // one file where it occurs
}
```

**Validation**: at most 25 entries (SC-002). Each needs a reason and an example, and
each must match at least one real occurrence; unused entries fail the check.

## TextUnit

This is what the scanners produce and the check consumes.

```ts
interface TextUnit {
  file: string          // repository-relative path, or 'out/…' for the export
  lang: Language
  surface: 'source' | 'manifest' | 'readme' | 'og' | 'export-html'
  text: string          // the card, paragraph, list item, row or block text, before cleaning
  line?: number         // first line, for messages only
}
```

## Finding

```ts
type Rule = 'unregistered' | 'retired' | 'mean-without-spread' | 'missing-qualifier' | 'stale-og-image' | 'stale-baseline'

interface Finding {
  file: string
  lang: Language
  figure: string        // as written, e.g. '99,30 %'
  rule: Rule
  detail: string        // e.g. 'missing qualifier: 5-fold CV'
  fix: string           // e.g. 'use formatClaim("inkjet.baseline", "de", "full")'
  line?: number
}
```

## Baseline

This lives in `tools/claims/baseline.json`.

```ts
interface BaselineEntry {
  scope: 'source' | 'export'   // export = built HTML, seen only by verify:export
  file: string                 // repository-relative, forward slashes
  lang: Language
  figure: string
  rule: Rule
  note?: string
}
```

The key is `(scope, file, lang, figure, rule)`. Each runner checks staleness only for the
scopes it scans. When the same key occurs several times, it
needs a matching count, stored as repeated entries.

**Lifecycle**:

| Stage | Baseline |
|---|---|
| PR A | Created from the first run |
| Between PRs | Only shrinks: a stale entry fails the check |
| PR B | Must be empty (asserted by a test) |

## OgCardLock

This lives in `tools/claims/og-cards.lock.json`.

```ts
type OgCardLock = Record<string /* png file name */, string /* sha256 of eyebrow|title|sub|stat */>
```

The generator writes it, and the check compares against it.
