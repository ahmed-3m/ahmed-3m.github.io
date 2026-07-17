# Tasks — 003 Interactive OOD Demo

**Delegation legend:** `[P]` parallelizable · `→Tnnn` depends on · **Agent** = suggested type.

> ⚠️ **Gate:** T3.1 answers two open questions (flagship case study; do exported weights /
> held-out scores exist?). The build path (option 1/3 vs 2) depends on its answer.
> Do **not** start after spec 002 is unresolved — the demo must showcase honest numbers.

### T3.1 [P] — Feasibility probe & option pick
**Agent:** Explore / general-purpose (read-only)
Check the thesis repo/artifacts for: exported model weights, an ONNX-convertible checkpoint,
and any held-out per-sample scores. Recommend option 1 (precomputed gallery), 3 (threshold
explorer), or 2 (live ONNX). Pick flagship: `diffusion-ood` or `inkjet-ood`. **Output:**
`feasibility.md` with the chosen option + data sources.

### T3.2 — Ship the guaranteed version (option 1 or 3)  →T3.1
**Agent:** general-purpose (edit)
Build `src/components/OodDemo.tsx`: either a precomputed ID-vs-OOD gallery or a
threshold/AUROC explorer driven by a committed held-out-scores JSON. Lazy-load it into the
chosen case-study page via dynamic import. Real numbers only; label precomputed clearly.

### T3.3 [P] — i18n + a11y pass  →T3.2
**Agent:** general-purpose (edit)
Add all UI strings to the 5-language `copy` pattern. Keyboard operable, labeled controls,
respects `prefers-reduced-motion`.

### T3.4 — (Enhancement) Live in-browser inference (option 2)  →T3.2
**Agent:** general-purpose (edit) — only if T3.1 says weights are exportable
Export a small model to ONNX; run via `onnxruntime-web`/`transformers.js` (WASM→WebGPU).
Upload/pick image → live score. Graceful fallback if WebGPU/WASM unavailable.

### T3.5 — Verify  →T3.2 (→T3.4 if done)
**Agent:** general-purpose + `verify` skill
`npm run build` static export succeeds and the demo renders in exported HTML. Confirm
code-splitting (demo not in main chunk), measure bundle delta, no runtime console errors,
Lighthouse a11y unaffected.

**Suggested wave plan:** T3.1 → T3.2 → {T3.3 [P], T3.4 [P]} → T3.5.
