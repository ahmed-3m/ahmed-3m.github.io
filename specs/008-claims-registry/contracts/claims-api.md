# Contract: Claims Registry API

This is the module `@/lib/claims`. It is client-safe: it has no `node:` imports and no
file access. Consumers are:

- page components;
- `JsonLd.tsx`;
- the OG generator;
- Genie (`knowledge.ts`, `prompts.ts`);
- the tests and the check.

## Exports

```ts
export type ClaimId = /* union of current named-claim ids */
/**
 * value:     the number with its unit            (99.03%, +6.5 pp, 0.8673)
 * spread:    with its spread, where it has one   (99.03% ± 0.07%)  — the default
 * metric:    the spread form and the metric      (99.03% ± 0.07% AUROC)
 * full:      the metric form and its qualifiers  (99.03% ± 0.07% AUROC (3-seed mean))
 * qualifier: the required qualifiers alone       (3-seed mean), or ''
 */
export type Variant = 'value' | 'spread' | 'metric' | 'full' | 'qualifier'

export const CLAIMS: Readonly<Record<ClaimId, Claim>>
export const DERIVED: /* values computed from the data file, for isBackedValue */
export const QUALIFIERS: Readonly<Record<QualifierId, Qualifier>>

/** Display form of a claim in one language. Throws for an unknown or retired id. */
export function formatClaim(id: ClaimId, lang: Language, variant?: Variant): string   // default 'spread'

/** The parts of a figure, for layouts that style the number and unit separately
 *  ('99,03' + ' %'). No isolates: the caller places them. Throws like formatClaim. */
export function claimParts(id: ClaimId, lang: Language): { number: string; unit: string; spread?: string }

/** Locale number formatting: de and fr use a decimal comma and a space before %. Moved from genie/links.ts. */
export function formatLocaleNumber(raw: string, lang: Language): string

/** True when the number equals a named claim, a data-file value or a derived value. */
export function isBackedValue(n: number): boolean

// Not exported here: retired figures. They live in src/lib/claims/retired.ts, which only
// check.ts imports, so they never reach the client bundle (research R1).
```

## Behaviour

- **Precision**: `formatClaim` never rounds. Values print with `claim.decimals` digits.
- **Gains**: `formatClaim('thesis.gainPp', lang)` computes the gain from the two means at
  call time. A changed data value moves every surface (SC-003).
- **Retired ids**: an id that is not a current claim, retired ones included, throws
  `Error('unknown claim <id>')`. Static
  export prerendering runs this, so the build fails (FR-005). TypeScript also rejects
  such ids at compile time.
- **Arabic**: the figure (with its spread and metric) is wrapped in U+2066…U+2069, so
  callers must not add their own isolates around it. In `full`, the qualifier follows
  outside the isolate, in Arabic. `±` sits between no-break spaces.

## Examples

These show expected output for the current data.

| Call | Result |
|---|---|
| `formatClaim('thesis.mean', 'en')` | `99.03% ± 0.07%` |
| `formatClaim('thesis.mean', 'de')` | `99,03 % ± 0,07 %` |
| `formatClaim('thesis.mean', 'en', 'metric')` | `99.03% ± 0.07% AUROC` |
| `formatClaim('thesis.mean', 'en', 'full')` | `99.03% ± 0.07% AUROC (3-seed mean)` |
| `formatClaim('thesis.mean', 'de', 'full')` | `99,03 % ± 0,07 % AUROC (3-Seed-Mittel)` |
| `formatClaim('thesis.gainPp', 'fr', 'value')` | `+6,5 pp` |
| `formatClaim('inkjet.baseline', 'en', 'qualifier')` | `5-fold CV` |
| `claimParts('thesis.mean', 'fr')` | `{ number: '99,03', unit: ' %', spread: '0,07' }` |
| `formatClaim('inkjet.baseline', 'ar', 'spread')` | `⁦0.8673 ± 0.0230⁩` |

The Arabic row has no-break spaces around `±`. The `full` wording per language comes from
the qualifier texts in `src/lib/claims/qualifiers.ts`, taken from the on-site wording
(FR-004). PRs B1 and B2 list each change from the earlier text (FR-011).

## Compatibility

`@/lib/genie/links` keeps exporting `formatLocaleNumber`, as a re-export, so existing
Genie callers and tests do not change.
