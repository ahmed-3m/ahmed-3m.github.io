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

1. In `src/components/Hero.tsx`, change the German `99,03%` to `99,30%`.
2. Run `npm test`. It fails with output like:

   ```text
   src/components/Hero.tsx:72 (de) "99,30%" — unregistered: not a registered value
   ```

3. Revert the change, then repeat with these plants:
   - remove `± 0.07%` from an English line: `mean-without-spread`;
   - remove "5-fold" next to `0.8673` in `public/llms.txt`: `missing-qualifier`;
   - type the retired `80.25%` anywhere: `retired`.

## Use a figure in new copy (User Story 2)

```tsx
import { formatClaim } from '@/lib/claims'

const label = formatClaim('thesis.mean', lang, 'full')   // "99,03 % ± 0,07 % AUROC (…)" in de
```

Do not type figures into copy. If the check flags a number that is not a result (a
table reference, say), add a pattern with a reason to `tools/claims/non-results.json`.

## Change or retire a value

- **Corrected result**: change `src/lib/ood-explorer-data.ts`. Registry claims and
  derived values follow. Then:
  1. Run `npm test`; every typed-in copy left elsewhere (blog, manifests) is reported.
  2. If an OG card's text changed, regenerate the images:

     ```powershell
     node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs
     ```

  3. Commit the PNGs and `tools/claims/og-cards.lock.json` together.
- **Retired result**: move the claim from `CLAIMS` to the retired list in
  `src/lib/claims/registry.ts`, with a reason and date, and store the value as joined
  segments. Every surface that still uses it now fails the build.

## The baseline

`tools/claims/baseline.json` lists findings that existed when the check landed. To work
it down:

1. Fix a finding.
2. Delete its entry. The check fails if you leave a stale entry behind.

The file must be empty when User Story 3 is done.
