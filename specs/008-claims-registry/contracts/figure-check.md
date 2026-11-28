# Contract: Figure Check

## Pure API (`src/lib/claims/check.ts`, `read-figures.ts`)

```ts
/** Decimal figures in a text, read with that language's rules (research R4). */
export function readFigures(text: string, lang: Language): Figure[]
interface Figure { raw: string; value: number; resultLooking: boolean; index: number }

/** Findings for one text unit. Applies the non-result patterns; does not apply the baseline. */
export function checkUnit(unit: TextUnit, nonResults: NonResultEntry[]): Finding[]

/** Retired figures, joined from segments (from retired.ts; not importable by components). */
export function retiredFigures(): readonly { id: string; text: string; reason: string }[]

/** Splits findings against the baseline, for the scopes this runner scanned.
 *  Either list being non-empty is a failure. */
export function compareWithBaseline(findings: Finding[], baseline: BaselineEntry[], scopes: Array<'source' | 'export'>):
  { newFindings: Finding[]; staleEntries: BaselineEntry[] }
```

## Rules (FR-007)

| Rule | Fires when | Message detail |
|---|---|---|
| `unregistered` | A result-looking figure is not `isBackedValue` and matches no non-result pattern | `not a registered value`; fix: `correct it, register it in src/lib/claims/registry.ts, or add a non-result pattern with a reason to tools/claims/non-results.json` |
| `retired` | A figure matches a retired value in any form | `retired figure (<reason>)` |
| `mean-without-spread` | A named claim's mean appears and its spread value is absent from the unit | `mean without its spread (<expected spread form>)` |
| `missing-qualifier` | A named claim appears and a required qualifier's accepted phrasing is absent from the unit. PR A enforces only today's three rules (research R7). | `missing qualifier: <qualifier text in that language>` |
| `stale-og-image` | An OG card's text hash differs from `og-cards.lock.json`, or a committed `public/<png>` is missing or differs from the PNG hash there | `OG image <file> is stale — regenerate it`, or `OG image <file> does not match tools/claims/og-cards.lock.json — regenerate it` |
| `stale-baseline` | A baseline entry no longer occurs | `remove this entry from tools/claims/baseline.json` |

## Command-line behaviour

- **`npm test`**: `tests/claims/sources.test.ts` fails with one assertion message listing
  every new finding and stale entry.
- **`npm run verify:export`**: prints findings and exits 1, as the existing checks do.
  The source scan, HTML block scan and retired-figure bundle scan all run. Without
  `out/`, the script fails as it does today.

## Message format

There is one line per finding:

```text
<file>[:<line>] (<lang>) "<figure>" — <rule>: <detail>
  fix: <fix>
```

For example:

```text
src/components/Hero.tsx:72 (de) "99,30 %" — unregistered: not a registered value
  fix: correct it, register it in src/lib/claims/registry.ts, or add a non-result pattern with a reason to tools/claims/non-results.json
public/llms.txt:41 (en) "0.8673 ± 0.0230" — missing-qualifier: missing qualifier: 5-fold CV
  fix: add "5-fold CV" in the same sentence, list item, row or card
```

## Inputs scanned (FR-006)

| Source | Unit (research R5) | Language |
|---|---|---|
| `src/**/*.ts`, `src/**/*.tsx`, except `ood-explorer-data.ts` | Card or JSX block | From the nearest language key, else `en` |
| `public/llms.txt`, `public/llms-full.txt`, `README.md` | Paragraph, list item or table row | `en` |
| `.github/readme/hero-*.svg` | The whole file | `en` |
| `tools/generate-og-images.mjs` card definitions (its evaluated `CARDS` export, so `formatClaim` stat lines are scanned as rendered) | One card | `en` |
| `out/**/*.html` (export only) | Block element, `meta` content or `title` | `en` |
| `out/_next/static/**/*.js` (export only) | The whole file | Retired rule only |
| `out/genie/prompt.json` (export only; spec 007, `scanPromptFile`) | Each rules paragraph with its slots blanked, and each entry's title and facts. A missing or unreadable file fails the check | `en` |

**Not scanned**: `specs/`, `tests/`, `docs/`, manuscripts, PDFs,
`ood-explorer-data.ts` itself, and `src/lib/claims/` (the registry and its qualifier
texts).

## Fixtures (SC-001)

`tests/claims/check.test.ts` plants one wrong figure per language in each surface type:

- **a source map**: a string under each of the `en`, `de`, `fr`, `es` and `ar` keys;
- **a manifest paragraph**;
- **an SVG**;
- **an OG card**;
- **an HTML block**.

Each plant is checked against each rule. The test asserts exactly one finding per plant,
naming the file and language. These cover acceptance scenarios US1.2–US1.6.
