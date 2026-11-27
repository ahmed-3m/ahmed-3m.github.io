# Quickstart: Claims Registry and Figure Check

This describes how the feature is used once it is built.

## Run the check

Run the source scan on its own. It is fast, needs no build, and covers all five
languages:

```powershell
npm test
```

Run the full gate, as CI does:

```powershell
npm run build
```

```powershell
npm run verify:export
```

## Prove it catches a planted figure (User Story 1)

1. In `public/llms.txt`, change the first `99.03%` under "Key Achievements" to `99.30%`.
   (The site pages call `formatClaim`, so there is no figure to plant there.)
2. Run `npm test`. It fails with output like:

   ```text
   public/llms.txt:19 (en) "99.30%" — unregistered: not a registered value
   ```

3. Revert the change, then repeat with these plants:
   - remove `± 0.07%` from an English line: `mean-without-spread`;
   - remove "5-fold" next to `0.8673` in `public/llms.txt`: `missing-qualifier`;
   - type the retired `80.25%` anywhere: `retired`.

## Use a figure in new copy (User Story 2)

```tsx
import { claimParts, formatClaim, QUALIFIERS } from '@/lib/claims'

const label = formatClaim('thesis.mean', lang, 'full')   // "99,03 % ± 0,07 % AUROC (3-Seed-Mittel)" in de
const short = formatClaim('thesis.mean', lang, 'metric') // without the qualifier, for a title that shows it elsewhere
const { number, unit } = claimParts('thesis.mean', lang) // to style the number and unit apart
```

For a qualifier shown on its own (a caption under a stat, say), use
`QUALIFIERS.<id>.text[lang]` from the same module.

Do not type figures into copy. If the check flags a number that is not a result (a
table reference, say), add a pattern with a reason to `tools/claims/non-results.json`.

## Change or retire a value

- **Corrected result**: change `src/lib/ood-explorer-data.ts`. Registry claims and
  derived values follow. Then:
  1. Run `npm test`; every typed-in copy left elsewhere (blog, manifests, README hero
     SVGs) is reported, and so is each OG card whose text no longer matches
     `tools/claims/og-cards.lock.json` (`stale-og-image`).
  2. Regenerate the stale OG images:

     ```powershell
     node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs
     ```

  3. Commit the PNGs and `tools/claims/og-cards.lock.json` together. The generator
     writes the lock: per card, a SHA-256 of its eyebrow, title, sub and stat, and a
     SHA-256 of the PNG (`tools/claims/og-lock.mjs`). A lock committed without its
     PNGs fails the check.
- **Retired result**: move the claim from `CLAIMS` in `src/lib/claims/registry.ts` to
  `src/lib/claims/retired.ts`, with a reason and date, and store the value as joined
  segments. Every surface that still uses it now fails the build.

## The baseline

`tools/claims/baseline.json` listed the findings that existed when the check landed.
PR B2 worked it down to `[]`, and a test keeps it empty (SC-002). Fix a new finding at
its source instead of adding it to the baseline.
