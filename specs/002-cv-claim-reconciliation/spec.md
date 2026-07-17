# Spec 002 — CV ↔ Site ↔ Thesis Claim Reconciliation

**Status:** Ready for next session
**Priority:** P0 (credibility risk — highest leverage)
**Origin:** Follow-up to `001-claim-integrity-alignment`. A candidate CV
(`~/Downloads/cv_ref/Ahmed_Mohammed_CV/Ahmed_Mohammed_CV.pdf`, reviewed 2026-07-18)
was found to contradict the live site and was **not** adopted.

## Problem

The portfolio was previously hardened (PRs #29/#30) to state the thesis result honestly:
a **within-CIFAR airplane-vs-rest binary split (single ID class)**, **99.03% ± 0.07%
AUROC**, a **+6.5pp** gain from a 92.52% ± 11.07% baseline via separation loss, explicitly
**"not comparable to multi-class CIFAR-10 OOD benchmarks."** The candidate CV regresses to
the older overclaim and introduces new inconsistencies.

### Confirmed discrepancies (CV vs. live site)

| Field | Candidate CV | Live site (source of truth) |
| --- | --- | --- |
| Thesis result framing | "CIFAR-10 AUROC 80.25% → 99.03%" (reads as multi-class benchmark) | within-CIFAR airplane-vs-rest **binary, single ID class**; not multi-class CIFAR-10 |
| Improvement magnitude | **+18.8pp** (from 80.25%) | **+6.5pp** (from 92.52% ± 11.07% baseline) |
| Thesis submission date | **Mar 2026** | **Jul 2026** (`JsonLd.tsx`) |
| Contact email | `ahmed.mo.0595@gmail.com` | `ahmed@faultrix.com` (`Contact.tsx`) |
| External OOD | "90.50–96.97% AUROC across five datasets" | site names the 5 datasets (CIFAR-100, Places365, FashionMNIST, Textures, SVHN) but does not publish this range — verify against thesis |

## Goal

One reconciled set of claims that is **identical and defensible** across every surface:
the CV (`public/cv.tex` → `public/cv.pdf`), the site components, JSON-LD, `llms.txt`, and
the chatbot — every number traceable to the thesis PDF.

## Decisions required from Ahmed (blocking)

1. **Which baseline/improvement is the real headline** — the +6.5pp (separation-loss gain
   over 92.52%) OR the +18.8pp (over an 80.25% base)? Pick the one the thesis actually
   supports and use it everywhere, with the baseline named.
2. **True thesis submission date** — Mar 2026 or Jul 2026?
3. **Canonical contact email** — `ahmed@faultrix.com` vs the gmail on the CV.
4. **External-benchmark numbers** — confirm the 90.50–96.97% range against the thesis, or
   drop it.

## Acceptance criteria

- [ ] `grep` for `80.25`, `18.8`, `6.5`, `99.03`, `0.8673`, `98.4` returns a single
      consistent story across `src/`, `public/cv.tex`, `public/llms*.txt`.
- [ ] Every quantified claim on the site links to (or is traceable to) an artifact in
      `public/` (thesis PDF page, report, repo). No orphan metrics.
- [ ] The "within-CIFAR binary / not multi-class CIFAR-10" caveat is preserved wherever
      99.03% appears — including any regenerated CV.
- [ ] `public/cv.pdf` is regenerated from the corrected `public/cv.tex` and matches the site.
- [ ] Thesis submission date is identical in CV, `About.tsx`, `JsonLd.tsx`, `Experience.tsx`.

## Out of scope

- New portfolio features (see spec 003).
- Rewriting thesis content — only the *claims about it* are in scope.

## Verification

`npm run build` must pass (the `news-items.ts` guard and TS build). Manually diff the CV
PDF text against the site's stat blocks before closing.
