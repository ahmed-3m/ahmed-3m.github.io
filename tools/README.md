# tools/

Dev-only scripts for the portfolio. Nothing here is wired into `npm run build` —
run them by hand when the relevant source changes.

## generate-icons.mjs

Regenerates **every** raster icon in `public/` (plus the mirrored
`src/app/favicon.ico`) from the single SVG source at `public/icon.svg`.

**When to run it:**

- After editing `public/icon.svg`.
- After changing the scales in `generate-icons.mjs` (the `0.62` maskable /
  `0.84` apple-touch magic numbers).
- After a `sharp` major-version bump, which can change PNG encoding.

**How:**

```bash
node tools/generate-icons.mjs
```

Then commit **all** changed files together:

```bash
git add public/icon.svg public/*.png public/favicon.ico src/app/favicon.ico
```

### Why this matters

The SVG and the committed PNGs are two representations of one mark. If the SVG
is edited without regenerating, the favicons/PWA icons silently keep the old
mark while the SVG shows the new one — exactly the drift the single-source
design exists to prevent. There is no automated drift check in CI (a
byte-for-byte comparison would flake across OSes, because `sharp`'s PNG
*encoding* is not guaranteed deterministic while its decoded pixels are), so the
regeneration step is a manual obligation of whoever edits the source.

If you only change the generator logic (not the SVG), expect all PNGs to be
rewritten — re-commit them. PNG output is byte-stable across reruns on the
**same** OS + `sharp` version, so on a clean rerun with no source change the
working tree should show no diff.
