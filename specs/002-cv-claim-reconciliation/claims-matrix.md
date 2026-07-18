# Claims matrix — portfolio surfaces (T2.2)

**Scope:** quantified / dated / contact claims in `src/`, `public/cv.tex`, `public/llms*.txt`, plus special attention to `JsonLd.tsx` and `ChatBot.tsx`.  
**Out of scope for the matrix body:** `specs/**`, `README.md`, `GITHUB_PROFILE_README.md`, `hybrid-preview.html` (noted in “extra surfaces” if relevant).  
**Method:** ripgrep for `80.25|18.8|6.5|99.03|92.52|0.8673|98.4|98.98|90.50|96.97|ahmed@|Jul 2026|May 2026|Mar 2026` and related date/contact patterns (2026-07-18).  
**Ground truth reference:** `ground-truth.md` (thesis PDF).

Legend: **OK** = matches thesis headline story · **SOFT** = incomplete qualifier or aggregation ambiguity · **DIVERGE** = conflicts with another surface or with thesis · **ABSENT** = string not found on live surfaces · **UNVERIFIED** = not in thesis PDF

---

## 0. Executive divergence board

| Claim family | Live-site story (dominant) | Thesis PDF | Divergence? |
| --- | --- | --- | --- |
| Headline AUROC | 99.03% ± 0.07% (binary airplane-vs-rest, 3-seed) | Same | **No** (OK) |
| Baseline + gain | 92.52% ± 11.07% → +6.5 pp | Same (+6.51 appendix) | **No** (OK) |
| `80.25` / `+18.8` | **Absent** from `src/`, `cv.tex`, `llms*.txt` | **Absent** (0 hits) | **No on live surfaces**; only in *candidate* CV (outside repo, per spec 002) |
| Seed-42 detail | 98.98% within-CIFAR | Same | **No** (OK when labeled) |
| External range | 90.50–96.97% (where stated) | Same; mean 94.17% rarely cited | **Soft** (mean often omitted) |
| Inkjet public AUROC | 0.8673 ± 0.0230 | Same | **Soft** when ± omitted |
| Production `98.4%` | Present, usually “threshold-dep. / production” | **UNVERIFIED** in thesis | **Soft** (not thesis-backed) |
| Thesis document date | — | **May 2026** | — |
| Thesis *submission* date | **Jul 2026** (CV, JsonLd, llms, About degree end) | **Not stated as Jul** | **DIVERGE** vs PDF cover/declaration |
| Canonical email | `ahmed@faultrix.com` | N/A | **OK on live surfaces**; candidate CV gmail is **not** in repo |

---

## 1. Matrix by claim

### 1.1 Headline: `99.03% ± 0.07%` AUROC (binary within-CIFAR, 3-seed mean)

| Location | Value as written |
| --- | --- |
| `src/components/Hero.tsx:88-89` | Display `99.03%` (stat tile) |
| `src/components/Hero.tsx:41-45` | Legend: `99.03% AUROC = CIFAR-10 thesis (binary, single-class airplane-vs-rest, 3-seed mean)` (+ i18n) |
| `src/components/TrustStrip.tsx:28-32` | `99.03% AUROC thesis result (binary, single-class)` (+ i18n) |
| `src/components/About.tsx:52` | `99.03% +/- 0.07% average AUROC (binary airplane-vs-rest, 3-seed mean)` (+ i18n) |
| `src/components/About.tsx:115` | `99.03% +/- 0.07% AUROC` (binary airplane-vs-rest, 3-seed mean) |
| `src/components/Evidence.tsx:29` | `99.03% +/- 0.07% AUROC` |
| `src/components/Projects.tsx:22-26` | `99.03% +/- 0.07% average AUROC` + binary / single-ID caveat (+ i18n) |
| `src/components/Projects.tsx:94` | Metric card `99.03% +/- 0.07% Avg AUROC` |
| `src/components/Research.tsx:44-48` | `99.03% +/- 0.07%` + airplane-vs-rest + +6.5pp (+ i18n) |
| `src/components/Research.tsx:76` | `lambda = 0.02 reached 99.03% +/- 0.07%` |
| `src/components/Research.tsx:150,157` | Body + metric `99.03` |
| `src/components/JsonLd.tsx:11,136,224,264,288,389,447` | Multiple Person/FAQ/Thesis structured-data strings with `99.03%` (most include binary/single-ID caveat) |
| `src/components/ChatBot.tsx:102` | `99.03% +/- 0.07% average AUROC` + binary single-ID caveat |
| `src/lib/case-studies.ts:26-30,52` | Case-study summary + results |
| `src/lib/blog-posts.ts` | Many (all 5 langs of OOD thesis post); e.g. `40,42,49,89,...` |
| `src/app/layout.tsx:47` | Meta description `99.03% +/- 0.07%` + binary split |
| `src/app/case-studies/diffusion-ood/page.tsx:8` | Page meta description with `99.03%` + binary split |
| `public/cv.tex:104,130` | `99.03% ± 0.07%` (3-seed mean / airplane-vs-rest) |
| `public/llms.txt:16-17,24,43` | `99.03% ± 0.07%` with binary/single-ID language |
| `public/llms-full.txt:16-17,24,43,70,84,92,96` | Same family |

**Status:** **OK** — dominant live story matches thesis.  
**Soft spots:** Hero tile (`Hero.tsx:88`) and TrustStrip omit `± 0.07%`; Research metric tile (`Research.tsx:157`) shows bare `99.03`.

---

### 1.2 Baseline `92.52% ± 11.07%` and gain `+6.5` pp

| Location | Value as written |
| --- | --- |
| `src/components/Hero.tsx:92` | Stat tile `+6.5pp` |
| `src/components/ChatBot.tsx:104` | Baseline `92.52% +/- 11.07%`, `+6.5` percentage points |
| `src/components/Projects.tsx:22-26` | `improving average performance by 6.5 percentage points` (baseline not always named in same sentence) |
| `src/components/Research.tsx:44-48,76,150` | `+6.5pp` / baseline `92.52% +/- 11.07%` |
| `src/components/JsonLd.tsx:264,389,447` | `6.5 percentage points` / `+6.5pp` over baseline |
| `src/lib/case-studies.ts:53` | `+6.5 percentage points over the non-separated baseline` (**does not name 92.52**) |
| `src/lib/blog-posts.ts` | e.g. `42,73,90,100` and translations |
| `public/cv.tex:104` | `92.52% ± 11.07%` → `99.03% ± 0.07%` (`+6.5 pp`, 3-seed mean) |
| `public/llms.txt:17,43` | `+6.5` over `92.52% ± 11.07%` |
| `public/llms-full.txt:17,43,84,89` | Same |

**Status:** **OK** for the story.  
**Soft:** `case-studies.ts:53` and some Project strings claim +6.5 without naming **92.52**.

---

### 1.3 Forbidden pair: `80.25` and `18.8`

| Location | Value |
| --- | --- |
| `src/**` | **ABSENT** (0 hits) |
| `public/cv.tex` | **ABSENT** |
| `public/llms.txt`, `public/llms-full.txt` | **ABSENT** |
| Thesis PDF | **ABSENT** (see `ground-truth.md`) |
| Candidate CV (`~/Downloads/...`, not in repo) | Per **spec 002**: claims `80.25% → 99.03%` and **+18.8pp** |

**Status:** Live portfolio is clean. Do not reintroduce. Closest real seed is **79.73%**, not 80.25 (`ground-truth.md`).

---

### 1.4 Seed-42 `98.98%` within-CIFAR

| Location | Value as written |
| --- | --- |
| `src/components/ChatBot.tsx:103` | `Seed-42 achieved 98.98% AUROC within-CIFAR` |
| `src/lib/blog-posts.ts` | e.g. `49,95` (+ translations) |
| `public/cv.tex:105` | `98.98% AUROC ... (seed-42)` |
| `public/llms-full.txt:92` | `seed-42 achieved 98.98% within-CIFAR` |

**Status:** **OK** when labeled seed-42. Must never replace 99.03 as sole primary headline.

---

### 1.5 External OOD `90.50–96.97%` (and mean `94.17%`)

| Location | Value as written |
| --- | --- |
| `src/components/Research.tsx:150` | `external OOD 90.50%-96.97%` |
| `src/lib/blog-posts.ts` | e.g. `96,179,262,345,428` |
| `public/cv.tex:105` | `90.50--96.97%` across five named datasets |
| `public/llms-full.txt:92,96` | `90.50%–96.97%` zero-shot / five benchmarks |
| `src/components/ChatBot.tsx:103` | Names five datasets; **does not quote the numeric range** |
| `src/lib/case-studies.ts:54` | Names five datasets; **no numeric range** |
| External mean `94.17%` in `src/` / `public/cv.tex` / `llms*` | **ABSENT** (only in root `README.md`, out of matrix scope) |

**Status:** Range is thesis-supported. **Soft** inconsistency: some surfaces give range, some only dataset names; mean almost never shown.

---

### 1.6 Inkjet public baseline `0.8673 ± 0.0230`

| Location | Value as written |
| --- | --- |
| `src/components/About.tsx:115` | `0.8673 AUROC` (**no ±0.0230**) |
| `src/components/Evidence.tsx:35` | `0.8673 +/- 0.0230 AUROC · FTI_Zer0P 5-fold` |
| `src/components/Hero.tsx:41-45` | `0.8673 AUROC = industrial FTI_Zer0P 5-fold baseline` (**no ±**) |
| `src/components/Projects.tsx:105` | `0.8673 AUROC (5-Fold CV)` (**no ±**) |
| `src/components/Research.tsx:237,241` | `0.8673 +/- 0.0230` + metric tile |
| `src/components/ChatBot.tsx:105` | `0.8673 +/- 0.0230 AUROC` |
| `src/components/JsonLd.tsx:447` | `0.8673 ± 0.0230 AUROC` |
| `src/lib/case-studies.ts:102,112` | `0.8673 +/- 0.0230` + thesis link label |
| `src/lib/blog-posts.ts` | Many (inkjet post + OOD post transfer paragraphs) |
| `src/app/layout.tsx:47` | `0.8673 +/- 0.0230 industrial baseline` |
| `public/cv.tex:114` | `0.8673 ± 0.0230 AUROC` |
| `public/llms.txt:24-25,44` | `0.8673 ± 0.0230` |
| `public/llms-full.txt:24-25,44,71,98,115` | Same |

**Status:** Value **OK**. **Soft DIVERGE** on precision: some high-visibility tiles drop `± 0.0230`.

---

### 1.7 Production accuracy `98.4%`

| Location | Value as written |
| --- | --- |
| `src/components/Experience.tsx:57` | `98.4% (threshold-dep., production)` (+ i18n) |
| `src/components/JsonLd.tsx:11,136,224,288,401` | `98.4%` industrial / production accuracy with threshold-dependent qualifier (varies by block) |
| `src/lib/blog-posts.ts` | Inkjet post FAQs/results, e.g. `472,519,524` (+ translations) |
| `public/llms.txt:18` | `98.4% defect detection accuracy in production ... threshold-dependent` |
| `public/llms-full.txt:18,106,111,115,132` | Same family |
| `public/cv.tex` | **ABSENT** for `98.4` |

**Status:** Present and mostly qualified. **UNVERIFIED** against thesis PDF. Not a thesis-table metric.

---

### 1.8 Degree / thesis dates

| Location | Value as written |
| --- | --- |
| `src/components/About.tsx:15-19` | “submitted an M.Sc. thesis … (degree expected **2026**)” — **no month** |
| `src/components/About.tsx:70` | Degree dates `Oct 2024 - Jul 2026` |
| `src/components/Experience.tsx:34` | Role dates `Dec 2024` / `Jul 2026` |
| `src/components/JsonLd.tsx:11,77,79,136,256` | `thesis submitted Jul 2026, degree expected 2026` |
| `src/components/ChatBot.tsx:101` | submitted … degree expected 2026 (**no Jul**) |
| `public/cv.tex:72` | `thesis submitted Jul 2026, degree expected 2026` |
| `public/cv.tex:100` | Role `Dec 2024 -- Jul 2026` |
| `public/cv.tex:143-144` | Degree `Oct 2024 -- Jul 2026`; `Thesis submitted Jul 2026` |
| `public/llms.txt:3,37,43` | `submitted Jul 2026`; M.Sc. `Oct 2024 – Jul 2026` |
| `public/llms-full.txt:3,37,43,73` | Same |
| Thesis PDF cover/declaration | **May 2026** |

**Status:** **DIVERGE** — portfolio/CV say **Jul 2026 submission**; thesis document date is **May 2026**. Neither **Mar 2026** (candidate CV) nor calendar-day precision appears in thesis PDF.

---

### 1.9 Contact email

| Location | Value as written |
| --- | --- |
| `src/components/Contact.tsx:57-58` | `ahmed@faultrix.com` |
| `src/components/Footer.tsx:14` | mailto `ahmed@faultrix.com` |
| `src/components/ChatBot.tsx:108` | `Contact: ahmed@faultrix.com` |
| `src/components/JsonLd.tsx:14,107,240,272,314,455` | `ahmed@faultrix.com` |
| `src/app/layout.tsx:110` | `ahmed@faultrix.com` |
| `src/app/feed.xml/route.ts:28` | `ahmed@faultrix.com` |
| `public/cv.tex:65` | `ahmed@faultrix.com` |
| `public/llms.txt:9` | `ahmed@faultrix.com` |
| `public/llms-full.txt:9,160` | `ahmed@faultrix.com` |
| `ahmed.mo.0595@gmail.com` (candidate CV per spec 002) | **ABSENT** from live `src/` / `public/cv.tex` / `llms*` |

**Status:** **OK** — single canonical email on live surfaces. Gmail is only a candidate-CV risk, not a current repo conflict.

---

## 2. Cross-surface consistency checklist (high-signal strings)

| String | In `src/` | In `public/cv.tex` | In `llms*.txt` | Thesis | Notes |
| --- | --- | --- | --- | --- | --- |
| `99.03` | Yes | Yes | Yes | Yes | Primary headline |
| `92.52` | Yes (not every surface) | Yes | Yes | Yes | Named on CV/llms/Research/ChatBot; omitted on some tiles |
| `6.5` / `+6.5` | Yes | Yes | Yes | Yes | Consistent story |
| `80.25` | No | No | No | No | Clean |
| `18.8` | No | No | No | No | Clean |
| `98.98` | Yes | Yes | Yes (`llms-full`) | Yes | Secondary detail |
| `0.8673` | Yes | Yes | Yes | Yes | ± sometimes dropped |
| `98.4` | Yes | No | Yes | No (UNVERIFIED) | Operational metric |
| `90.50` / `96.97` | Partial | Yes | Partial | Yes | OK when present |
| `Jul 2026` (submission) | Yes (JsonLd etc.) | Yes | Yes | No | **DIVERGE** vs PDF **May 2026** |
| `ahmed@faultrix.com` | Yes | Yes | Yes | N/A | OK |

---

## 3. Notable remaining soft issues (for T2.3 after Ahmed decides)

1. **Date story:** pick canonical submission wording (May vs Jul) and align `cv.tex`, `JsonLd.tsx`, `About.tsx`, `llms*`, Experience end dates if needed.
2. **Always name the baseline with +6.5** (`92.52% ± 11.07%`, 3-seed `λ=0`) where gain is shown alone (`Hero`, `case-studies`).
3. **Always attach `± 0.0230`** next to `0.8673` on high-visibility tiles (Hero, About, Projects).
4. **Keep `80.25` / `+18.8` banned** if regenerating from any external CV draft.
5. **`98.4%`** remains an internal/operational claim — keep threshold language or demote further; it is not thesis-table evidence.
6. **i18n parity:** blog and component `copy` blocks generally keep numbers in sync across en/de/fr/es/ar; no numeric language split found for the key metrics.

---

## 4. Answer to the central numerical conflict (matrix view)

Across **all live portfolio claim surfaces inspected**, the story is already the thesis story:

> **92.52% ± 11.07% → 99.03% ± 0.07% (+6.5 pp), binary airplane-vs-rest, 3-seed mean.**

The competing **80.25 → 99.03 (+18.8 pp)** narrative does **not** appear in `src/`, `public/cv.tex`, or `llms*.txt`. It only appears as a **rejected candidate-CV** claim in spec 002. Reconciliation work is therefore less about choosing between two live numbers and more about (a) **locking** the +6.5 story permanently and (b) fixing **date/email/precision** soft divergences.
