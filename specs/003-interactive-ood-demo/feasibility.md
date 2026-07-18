# Feasibility probe — Interactive OOD demo (T3.1)

**Scope:** What can be built *from this portfolio repository* (and named external thesis artefacts) without inventing metrics.  
**Constraints:** Static GitHub Pages export — no backend, no paid inference. Spec 003 options: (1) precomputed gallery, (2) live ONNX, (3) threshold/AUROC explorer.  
**Date of probe:** 2026-07-18. Read-only.

---

## 1. Inventory: what exists *in this repo*

### 1.1 Model weights / checkpoints / ONNX

| Asset type | Present in repo? | Notes |
| --- | --- | --- |
| `.pt` / `.pth` / `.ckpt` | **No** | Recursive search under workspace (excluding `node_modules`/`.git`) found none |
| `.onnx` / `.safetensors` / `.bin` model files | **No** | None |
| Hugging Face weights vendored into `public/` | **No** | None |
| Export scripts for browser inference | **No** | None |

**Plain answer:** this portfolio repo does **not** contain exportable model weights. Option 2 is **not viable from in-repo artefacts alone**.

### 1.2 Held-out per-sample scores

| Asset type | Present in repo? | Notes |
| --- | --- | --- |
| Per-sample score JSON / CSV / NPZ / tensors | **No** | No score files under `public/` or `src/` |
| Precomputed ROC curve *data* (arrays) | **No** | Only raster PNG plots |
| Threshold / confusion-matrix tables as data | **No** | Metrics exist as prose + thesis tables only |

**Plain answer:** option 3 cannot ship **today** without first producing and committing a held-out scores file (from the thesis/DiffusionOOD artefacts).

### 1.3 Precomputed visual artefacts (usable for option 1)

Committed under `public/` (non-exhaustive, demo-relevant):

| Path | Role |
| --- | --- |
| `public/ood-roc-cifar10.png` | CIFAR ROC figure |
| `public/ood-score-distributions.png` | ID vs OOD score distributions |
| `public/ood-separation-loss-ablation.png` | Separation-loss ablation |
| `public/ood-model-comparison.png` | Method comparison |
| `public/ood-industrial-roc.png` | Industrial ROC figure |
| `public/fig_lambda_sweep.png` | λ sweep |
| `public/fig_k_ablation.png` | K ablation |
| `public/fig_calibration.png` | Calibration / threshold view |
| `public/fig_per_timestep_error.png` | Per-timestep analysis |
| `public/fig_inkjet_lambda.png` | Inkjet per-feature λ |
| `public/fig_cross_domain_comparison.png` | Cross-domain |
| `public/research/separation-*.png` | Conceptual separation visuals |
| `public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf` | Source of truth for numbers |

Also available as **links** (not in-repo bytes):

| External (named by thesis / case-studies) | Claimed contents |
| --- | --- |
| `https://huggingface.co/ahmed-3m/DiffusionOOD` | Pre-trained CIFAR CDM weights (thesis §5.4.4) |
| `https://github.com/ahmed-3m/DiffusionOOD` | Training/eval code; raw-score artefacts referenced by thesis |
| `https://huggingface.co/ahmed-3m/InkjetOOD` | Inkjet CDM weights |
| `https://github.com/ahmed-3m/InkjetOOD` | Inkjet pipeline code |

**Existence of remote HF/GitHub artefacts was not re-verified in this probe** (network / out of scope). They are **documented** by the thesis and linked from `src/lib/case-studies.ts`, but **not vendored** here.

### 1.4 Case-study surfaces already wired

| Slug | Page | Artefacts linked |
| --- | --- | --- |
| `diffusion-ood` | `src/app/case-studies/diffusion-ood/page.tsx` | Thesis PDF, GitHub DiffusionOOD |
| `inkjet-ood` | `src/app/case-studies/inkjet-ood/page.tsx` | Thesis PDF, 2024 report, InkjetOOD repo, HF InkjetOOD weights URL |

No `OodDemo.tsx` component exists yet (expected for T3.2).

---

## 2. Option assessment

| Option | Feasible *from this repo alone*? | Data source if pursued | Risk |
| --- | --- | --- | --- |
| **1 — Precomputed ID-vs-OOD gallery** | **Yes (limited)** | Existing PNGs + thesis-sourced labels; optionally a small set of public CIFAR/inkjet example images with **hand-entered** scores taken from thesis Table 6.1 / prose (not per-sample unless exported later) | Honest only if labeled “illustrative / precomputed”; **cannot** show real per-image model scores without exporting them |
| **2 — Live in-browser ONNX** | **No (today)** | Would need weights from HF DiffusionOOD/InkjetOOD, conversion to ONNX, size budget, WASM/WebGPU path | ~68.8M-param UNet + K MC trials is heavy for static portfolio; conversion not proven |
| **3 — Threshold / AUROC explorer** | **No (today)** | Needs committed held-out score arrays (ID scores + OOD scores) | Best teaching tool for FPR95 tradeoff **after** scores are exported from thesis artefacts |

---

## 3. Recommendation (single build path)

### Chosen option: **Option 1 — precomputed ID-vs-OOD gallery**

**Why**

1. It is the **only** option that can ship entirely from **current in-repo assets** plus thesis-cited numbers, without blocking on remote weight download/conversion or score export.
2. Spec 003 and tasks explicitly prefer shipping a guaranteed version first (1 or 3); 3 lacks data today.
3. Option 2 is a future enhancement **only if** Ahmed confirms HF checkpoints exist, convert cleanly, and meet bundle/latency constraints.

### Concrete data source for v1

| Layer | Source |
| --- | --- |
| Headline metrics shown in UI | Thesis Table 6.1 / abstract — already reconciled in `specs/002-.../ground-truth.md` (99.03 / 98.98 / FPR95 / external range / 0.8673) |
| Interactive clicks | Gallery cards: visitor selects an **example image** (CIFAR airplane = ID; non-airplane or external-domain sample = OOD) |
| “Model result” shown | **Precomputed** verdict + score **band** or table-derived summary for that *class of* example, clearly labeled  
  e.g. “Illustrative: seed-42 within-CIFAR FPR95 operating point (4.7% FPR at 95% TPR); not a live forward pass.” |
| Visual evidence | Existing `public/ood-*.png` / `fig_*.png` embedded as “how the real eval looks” |
| Not claimed | Live denoising, live AUROC recomputation, or per-pixel heatmaps unless pre-rendered assets are added |

### Flagship case study: **`diffusion-ood`**

| Criterion | Winner |
| --- | --- |
| Stronger headline metrics & clearer ID/OOD story | **diffusion-ood** (airplane-vs-rest, external OOD suite) |
| Richer precomputed figures already in `public/` | **diffusion-ood** (multiple OOD figures) |
| Public datasets easy to show ethically | **diffusion-ood** (CIFAR-class examples; no proprietary print IP) |
| Inkjet strengths | Good secondary / later: null-result on separation loss is honest research, but less “wow” for a first interactive widget; HF weights link exists but still not in-repo |

**Flagship page:** `src/app/case-studies/diffusion-ood/page.tsx` via lazy `OodDemo.tsx`.

---

## 4. What would unlock options 2 and 3 later

### Path to option 3 (recommended second phase)

1. From DiffusionOOD release artefacts (thesis: “raw-score tensors”, seed-42, `λ=0.02`, K=100):
   - Export `scores_id.json` / `scores_ood_by_dataset.json` (or one combined file).
2. Commit under e.g. `public/demo/diffusion-ood-scores.json` (size-check; subsample if needed).
3. Build threshold slider → live TPR/FPR/confusion matrix from **real** held-out scores.
4. Label: “Recomputed from committed held-out scores of seed-42 eval; not live inference.”

This is the highest-integrity interactive teaching tool once data exists.

### Path to option 2 (optional enhancement)

1. Confirm HF `ahmed-3m/DiffusionOOD` checkpoint loads.
2. Distill / prune **or** export a tiny surrogate scorer (full 68.8M UNet × K steps is unlikely to feel interactive on Pages).
3. Convert to ONNX; integrate `onnxruntime-web` with WASM fallback.
4. Keep option 1/3 as graceful fallback when WebGPU/WASM fails.

**Do not block the first ship on option 2.**

---

## 5. Honest constraints to show the visitor

Whatever ships must state:

- Numbers come from the **thesis / held-out eval**, not from a browser forward pass (unless option 2 actually lands).
- Scope is **binary airplane-vs-rest**, not multi-class CIFAR-10 OOD leaderboard comparison.
- Separation-loss headline is **+6.5 pp over 92.52% ± 11.07%** (see ground-truth); never invent per-image scores.

---

## 6. Decision summary (for Ahmed)

| Question | Answer |
| --- | --- |
| Exported weights in this repo? | **No** |
| Held-out per-sample scores in this repo? | **No** |
| Precomputed figures usable for a demo? | **Yes** (`public/ood-*.png`, `fig_*.png`, research PNGs) |
| Remote weights/scores claimed by thesis? | Yes — HF + GitHub (not re-verified here) |
| **Chosen build path** | **Option 1 — precomputed gallery** |
| **Flagship** | **`diffusion-ood`** |
| Follow-on | Option 3 after committing real score JSON; option 2 only if a *small* exportable model is available |

---

## 7. Suggested T3.2 acceptance slice (non-binding)

1. Lazy-load `OodDemo` on diffusion-ood case study.
2. ≥6 gallery tiles (ID + near-OOD + far-OOD examples) with precomputed labels.
3. Show thesis-correct metrics in a side panel (99.03 / 98.98 / FPR95 / external range).
4. Explicit “precomputed / not live inference” badge.
5. No network calls at runtime; static export clean.
