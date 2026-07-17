# Spec 003 — Interactive OOD / Defect-Detection Demo

**Status:** Ready for next session
**Priority:** P1 (differentiator — "show, don't tell")
**Depends on:** Spec 002 (claims must be honest before we spotlight the result).

## Problem

The site *describes* diffusion-based OOD detection and inkjet defect inspection in prose.
For an applied-ML role, a **working, in-browser demo** is far more convincing than any
metric sentence. No portfolio visitor can currently *interact* with the model's behavior.

## Goal

A single, self-contained interactive widget on one case-study page that lets a visitor
feed an input and see the model's OOD / defect judgment live, entirely client-side (the
site is a static GitHub Pages export — **no backend, no paid inference**).

## Approach options (pick one in-session, by feasibility)

1. **Precomputed gallery (lowest risk, ship first).** Ship a set of in-distribution vs
   OOD example images with the model's *precomputed* AUROC score / heatmap. Visitor clicks
   an image → sees score, ID-vs-OOD verdict, and why. No model runs in the browser; zero
   runtime risk. Honest if labeled "precomputed on N held-out samples."
2. **Real in-browser inference (highest impact).** Export a small classifier/anomaly model
   to ONNX; run via `onnxruntime-web` or `transformers.js` (WASM/WebGPU). Visitor uploads
   or picks an image → live score. Constraint: model + weights must be small enough to
   inline/lazy-load without wrecking the static bundle; must degrade gracefully.
3. **Threshold explorer (cheap, illustrative).** Interactive AUROC/FPR95 curve from real
   held-out scores (shipped as JSON): drag the threshold, watch TPR/FPR and the confusion
   matrix update. Teaches the *tradeoff* the thesis is about, with real numbers, no model.

Recommended sequence: ship **(1) or (3)** first (guaranteed to land), then attempt **(2)**
as an enhancement.

## Requirements

- Lives on `src/app/case-studies/diffusion-ood/page.tsx` (or `inkjet-ood`), as a new
  `src/components/OodDemo.tsx`.
- Fully static-export compatible; no network calls at runtime; works offline.
- Lazy-loaded (dynamic import) so it never blocks first paint or the Lighthouse score.
- Accessible: keyboard-operable, labeled controls, respects reduced-motion.
- Honest labeling: state exactly what's precomputed vs live, and on what data.
- i18n: any UI strings follow the existing 5-language `copy` pattern.

## Acceptance criteria

- [ ] A visitor can perform ≥1 interaction and see a model-derived result change.
- [ ] `npm run build` (static export) succeeds; the demo renders on the exported HTML.
- [ ] Bundle impact measured; demo code is code-split, not in the main chunk.
- [ ] No runtime console errors; graceful fallback if WebGPU/WASM unavailable (option 2).
- [ ] Every number shown is real (from held-out eval), not invented for the demo.

## Out of scope

- Training or fine-tuning any model (use existing thesis artifacts / exported weights).
- Server-side inference or any paid API.

## Open questions for Ahmed

- Do exported model weights / held-out score files exist to draw from, or must they be
  produced from the thesis repo first?
- Which case study is the flagship for this — diffusion-OOD (CIFAR) or inkjet (FTI_Zer0P)?
