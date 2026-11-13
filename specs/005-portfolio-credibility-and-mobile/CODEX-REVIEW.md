# Codex review follow-up — 2026-11-13

Reviewed PR #205 at d56e591 and addressed the independent review plus all four inline review threads.

## Corrections

- Removed the unqualified benchmark number from the homepage share card. The diffusion card now names the within-CIFAR airplane-vs-rest binary split and single ID class beside its three-seed result. Regenerated and visually inspected both 1200 × 630 PNGs.
- Localized the changed project metric labels and explorer equation/mean-error labels in all five languages. Isolated mathematical expressions for RTL rendering.
- Updated the modified dates of the edited diffusion case study and the two edited research posts, keeping the full-post and metadata catalogs synchronized.
- Removed the unused, superseded separation-gap-clean.png illustration. This supersedes the initial implementation report's retain/delete decision.
- Added an industrial-result local answer in five languages. Exact translated starter prompts and industrial-domain questions now reach the same fallback used by both no-provider and provider-failure paths.
- Corrected the industrial benchmark citation in llms-full.txt to point to the thesis; retained the early report under an explicit 2024 negative-result label.
- Limited the edited industrial FAQ metadata, fallback answers, and extended AI-recall text to publicly documented benchmark evidence.

## Verification

- Industrial starter fallback: passed for en/de/fr/es/ar, including the public benchmark value, scope, negative transfer result, and thesis source.
- Routing regression checks: public industrial AUROC question routes to the industrial answer; thesis, Sihem, contact, and unrelated-query behavior preserved.
- npm run lint: 0 errors, 9 existing image warnings.
- npm run typecheck: passed.
- News catalog self-test: passed (200 items).
- Worker proxy self-test: passed.
- Local production build: compilation and type checking passed; Windows sandbox EPERM directory-write errors prevented completing static export. This is not recorded as a successful local build.
- Required checks must pass on the final PR head in GitHub Actions before merge. No fresh Lighthouse score is claimed by this follow-up.
