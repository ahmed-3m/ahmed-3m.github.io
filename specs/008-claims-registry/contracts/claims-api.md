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
export type Variant = 'value' | 'spread' | 'full' | 'qualifier'

export const CLAIMS: Readonly<Record<ClaimId, Claim>>
export const QUALIFIERS: Readonly<Record<QualifierId, Qualifier>>

/** Display form of a claim in one language. Throws for an unknown or retired id. */
export function formatClaim(id: ClaimId, lang: Language, variant?: Variant): string   // default 'spread'

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
- **Arabic**: output is wrapped in U+2066…U+2069, so callers must not add their own
  isolates around it.

## Examples

These show expected output for the current data.

| Call | Result |
|---|---|
| `formatClaim('thesis.mean', 'en')` | `99.03% ± 0.07%` |
| `formatClaim('thesis.mean', 'de')` | `99,03 % ± 0,07 %` |
| `formatClaim('thesis.mean', 'en', 'full')` | `99.03% ± 0.07% AUROC (3-seed mean)` |
| `formatClaim('thesis.gainPp', 'fr', 'value')` | `+6,5 pp` |
| `formatClaim('inkjet.baseline', 'ar', 'spread')` | `⁦0.8673 ± 0.0230⁩` |

The exact `full` wording per language is fixed in PR B from today's on-site wording
(FR-004). Any change from today's text is listed in the PR (FR-011).

## Compatibility

`@/lib/genie/links` keeps exporting `formatLocaleNumber`, as a re-export, so existing
Genie callers and tests do not change.
