# Thesis ground truth — `Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`

**Source:** `public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf` (104 physical PDF pages).  
**Extraction:** full-text via `pypdf` (2026-07-18 investigation for T2.1).  
**Citation convention:** `PDF pN` = physical page in the PDF file; body page numbers appear in the thesis footer when present.

Anything not found in the PDF is marked **`UNVERIFIED`**.

---

## 1. Protocol (what the headline number *is*)

| Item | Thesis value | Citation |
| --- | --- | --- |
| ID class | CIFAR-10 **airplane** only (single ID class) | Abstract PDF p2; §5.1.1 PDF p55 |
| OOD proxy (within-CIFAR) | Remaining **9** CIFAR-10 classes | Abstract PDF p2; §5.4.2 PDF p59 |
| Framing | **Binary** within-CIFAR airplane-vs-rest; multi-class generalisation is **future work** | Abstract PDF p2; §8.1.1 RQ1 PDF p83 |
| Model | Binary conditional diffusion model (CDM); class-conditional reconstruction error as OOD signal | Abstract PDF p2 |
| Novel training term | Class-conditional **separation loss** with weight `λ` | Abstract PDF p2; §6.4 PDF p69–71 |
| Primary multi-seed seeds | `{42, 123, 456}` | §5.2.1 PDF p56; Table 6.2 PDF p66 |
| Best-tested `λ` (headline) | **`λ = 0.02`** | Abstract PDF p2; Table 6.6 PDF p70; Appendix D PDF p103 |

**Not** a multi-class CIFAR-10 OOD leaderboard result. The thesis is explicit about single-ID / binary scope.

---

## 2. Headline AUROC (binary within-CIFAR)

### Primary claim (3-seed mean at best `λ`)

| Metric | Value | Conditions | Citation |
| --- | --- | --- | --- |
| **Headline AUROC** | **99.03% ± 0.07%** | `λ = 0.02`, seeds 42/123/456, K=50 (default multi-seed reporting) | Abstract PDF p2; Table 6.2 PDF p66; Table 6.6 PDF p70; §8.1.1 RQ1 PDF p83; Appendix D Table D.1 PDF p103 |
| Individual seeds at `λ=0.02` | **99.11%, 98.95%, 99.04%** | 3 seeds | §6.4.1 PDF p71 |

### Seed-42 reproducible core (raw-score artefact path)

| Metric | Value | Conditions | Citation |
| --- | --- | --- | --- |
| Within-CIFAR AUROC | **98.98%** | seed 42, `λ=0.02`, K=100, difference scoring | Abstract PDF p2; Table 6.1 PDF p64; §6.1.1 PDF p63 |
| Within-CIFAR FPR95 | **4.7%** | same | Table 6.1 PDF p64 |
| Within-CIFAR AUPRC | **99.87%** | same | Table 6.1 PDF p64 |

These are **two different aggregations** of the same method family: multi-seed mean (99.03) vs single-seed reproducible raw-score run (98.98). Both appear in the thesis; neither replaces the other.

---

## 3. Baselines and improvement — **resolving +6.5pp vs +18.8pp**

### Verdict (central open question)

| Story | Supported by thesis? | Detail |
| --- | --- | --- |
| **+6.5 pp over 92.52% ± 11.07%** | **YES — this is the thesis headline gain** | 3-seed mean `λ=0` → 3-seed mean `λ=0.02` |
| **+18.8 pp over 80.25%** | **NO — not in the thesis** | Full-text search: **0 hits** for `80.25` and **0 hits** for `18.8` |
| Both as co-equal headlines | **NO** | Only the +6.5 / 92.52 story is documented as the primary improvement |

### Documented baseline (`λ = 0`, no separation loss)

| Metric | Value | Citation |
| --- | --- | --- |
| 3-seed mean AUROC | **92.52% ± 11.07%** | Abstract PDF p2; Table 6.2 PDF p66; Table 6.6 PDF p70; §7.1.1 PDF p77 |
| Individual seeds at `λ=0` | **79.73%, 98.81%, 99.01%** | §6.4.1 PDF p70; §7.1.1 PDF p77; §8.1.1 RQ2 PDF p83–84 |
| Bootstrap 95% CI for 3-seed mean | **[91.96%, 93.06%]** | §8.1.1 RQ2 PDF p84 |

### Documented gain

| Metric | Value | Citation |
| --- | --- | --- |
| Primary gain (text) | **+6.5 percentage points** | Abstract PDF p2; §7.1.1 PDF p77; §8.1.1 RQ2 PDF p83; Appendix A PDF p92 |
| Primary gain (appendix table) | **+6.51** pp (`Δ` vs `λ=0`) | Appendix D Table D.1 PDF p103 |
| Intermediate (`λ=0.01`, 3-seed) | **98.82% ± 0.06%** (**+6.30** pp) | Appendix D Table D.1 PDF p103 |

Arithmetic check: `99.03 − 92.52 = 6.51` → rounded to **+6.5 pp** in the abstract and main text.

### Why 80.25 / +18.8 is *not* a second thesis baseline

1. **`80.25` never appears** in the PDF (0 hits).
2. The **documented worst seed** at `λ=0` is **79.73%**, not 80.25% (PDF p70, p77, p84).
3. If someone rounded 79.73→80.25 and computed `99.03 − 80.25 ≈ 18.78 → 18.8`, that would be an **unsourced single-seed worst-case narrative**, not a thesis claim.
4. Discussion explicitly prefers the multi-seed framing: the separation loss moves the mean to 99.03% ± 0.07%, “**a smaller +6.5 pp gain than the seed-42-only comparison suggested**,” but with dramatic variance reduction (§7.1.1 PDF p77). The thesis does **not** quantify that seed-42-only comparison as +18.8.

**Recommendation for Ahmed’s decision (spec 002 decision #1):**  
Adopt **+6.5 pp over 92.52% ± 11.07% (3-seed mean, `λ=0` → `λ=0.02`)** as the sole headline improvement. Treat **80.25 / +18.8 as forbidden unsourced strings** (consistent with spec 001). Optionally mention seed-level fragility via the **real** worst seed **79.73%**, never 80.25.

---

## 4. External OOD (seed-42, `λ=0.02`, K=100, raw scores)

From **Table 6.1** (PDF p64). Reference pool for external eval = **full CIFAR-10 test set** (10k images), not airplane-only (§5.4.3 PDF p59–60).

| Dataset | Type | AUROC (%) ↑ | FPR95 (%) ↓ | AUPRC (%) ↑ |
| --- | --- | --- | --- | --- |
| CIFAR-10 airplane-vs-rest | Within | **98.98** | **4.7** | **99.87** |
| CIFAR-100 | Near OOD | **96.97** | **14.8** | **99.65** |
| Places365 | Far OOD | **96.50** | **15.4** | **99.57** |
| FashionMNIST | Far OOD | **94.03** | **20.5** | **99.16** |
| Textures (DTD) | Far OOD | **92.84** | **30.1** | **95.97** |
| SVHN | Far OOD | **90.50** | **27.0** | **99.38** |

| Aggregate | Value | Citation |
| --- | --- | --- |
| External AUROC range | **90.50% – 96.97%** | Abstract PDF p2; §6.1.2 PDF p65 |
| External-set mean | **94.17%** | §6.1.2 PDF p65 |

**Verdict on external range:** the portfolio claim **“90.50–96.97% across five datasets”** is **thesis-supported** (Abstract + Table 6.1 + §6.1.2).

---

## 5. Inkjet / industrial track (public FTI_Zer0P)

| Metric | Value | Citation |
| --- | --- | --- |
| Public YOLO+CDM baseline AUROC | **0.8673 ± 0.0230** | Abstract PDF p2; §6.6.1 PDF p74; Table 6.8 PDF p75 |
| Setting | `λ = 0`, K=100, 5-fold image-level CV | Table 6.8 PDF p75 |
| Accuracy @ baseline | **0.8094 ± 0.0151** | Table 6.8 PDF p75 |
| FPR@95%TPR @ baseline | **0.5631 ± 0.1697** | Table 6.8 PDF p75 |
| Separation loss transfer | **No significant improvement** after Holm correction | Abstract PDF p2; §6.6.3 PDF p74–75 |

**`98.4%` production defect accuracy:** **`UNVERIFIED` in this thesis PDF** (0 hits for `98.4` in full-text search). That figure appears on the portfolio as an operational / threshold-dependent deployment metric, not as a thesis table result.

---

## 6. Submission date and supervisors

| Field | Thesis value | Citation |
| --- | --- | --- |
| Cover date | **May 2026** | Title page PDF p1 |
| Declaration place/date | **Linz, May 2026** | Declaration PDF p4 |
| Thesis supervisor | **Univ.-Prof. Dr. Sepp Hochreiter** | Title page PDF p1; Acknowledgements PDF p3 |
| Assistant thesis supervisor | **Claus Hofmann, MSc** | Title page PDF p1; Acknowledgements PDF p3 |
| Institute | Institute for Machine Learning, JKU Linz | Title page PDF p1 |
| Degree sought | Master of Science, Artificial Intelligence | Title page PDF p1 |
| Industrial host | PROFACTOR GmbH; Zer0P grant (Upper Austria) | Acknowledgements PDF p3 |
| PROFACTOR contact mentioned | Dr Christian Eitzinger (machine vision team leader) | Acknowledgements PDF p3 |

| Claim | Status |
| --- | --- |
| Exact university submission calendar day | **`UNVERIFIED`** (PDF gives month year only: May 2026) |
| “Jul 2026” submission (live site / CV) | **Not in thesis PDF** (0 hits for `Jul 2026`) |
| “Mar 2026” submission (candidate CV per spec 002) | **Not in thesis PDF** (0 hits for March/Mar 2026) |

**Date tension for Ahmed’s decision #2:** thesis document date is **May 2026**; portfolio surfaces currently say **thesis submitted Jul 2026**. These are different statements (document date vs administrative submission date). Only Ahmed can resolve which is the canonical *submission* claim.

---

## 7. Reproducibility artefacts named by the thesis (not in this portfolio repo)

| Artefact | Location claimed by thesis | Citation |
| --- | --- | --- |
| CIFAR / OOD code | `https://github.com/ahmed-3m/DiffusionOOD` | §5.4.4 PDF p60; §8.1.2 PDF p84 |
| CIFAR weights | `https://huggingface.co/ahmed-3m/DiffusionOOD` | §5.4.4 PDF p60; §8.1.2 PDF p84 |
| Inkjet code | `https://github.com/ahmed-3m/InkjetOOD` (commit `7c2451c` mentioned) | §5.4.4 PDF p60 |
| Inkjet weights | `https://huggingface.co/ahmed-3m/InkjetOOD` | §5.4.4 PDF p60; §8.1.2 PDF p85 |
| Raw-score tensors | “released public artefacts” / “current raw score files” (seed-42) | §6.1.1 PDF p63–64; §6.4.2 PDF p72 |

Existence and contents of those remote artefacts were **not verified** in this investigation (out of scope / network). They are **not committed** inside this portfolio repository (see `feasibility.md`).

---

## 8. Quick reference card (copy-paste ground truth)

```
Protocol:  within-CIFAR airplane-vs-rest binary (single ID class)
Headline:  99.03% ± 0.07% AUROC  (λ=0.02, 3 seeds, K=50)
Baseline:  92.52% ± 11.07% AUROC (λ=0,   3 seeds)
Gain:      +6.5 pp  (appendix +6.51)
Seed-42:   98.98% AUROC, 4.7% FPR95  (λ=0.02, K=100 raw scores)
External:  SVHN 90.50 / Textures 92.84 / FMNIST 94.03 / Places365 96.50 / CIFAR-100 96.97
           range 90.50–96.97%, mean 94.17%
Inkjet:    0.8673 ± 0.0230 AUROC (FTI_Zer0P, 5-fold, λ=0)
Date on PDF: May 2026
Supervisors: Univ.-Prof. Dr. Sepp Hochreiter; Claus Hofmann, MSc
FORBIDDEN:  80.25%, +18.8 pp  (not in thesis)
```
