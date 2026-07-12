# Feature Specification: Portfolio Claim Integrity Alignment

**Feature Branch**: `claude-work` (lane; no per-feature git branch)  
**Spec directory**: `specs/001-claim-integrity-alignment`  
**Created**: 2026-07-12  
**Updated**: 2026-07-12 (merged second-audit findings; rejected its false thesis-metric “corrections”)  
**Status**: Draft  
**Input**: User description: "Create a Speckit-driven plan for the verified portfolio integrity issues: CV contradicts site/thesis numbers and dates; industrial proof card points 0.8673 AUROC at a negative-result PDF with no metrics; bare 98.4% in high-visibility surfaces; 99.03% missing airplane-vs-rest scope; degree status claimed inconsistently; future-dated blog post; stale news after link-check failures; i18n orthography gaps; truncated thesis title on Research." Plus: "Add any missing verified verdict from the second audit without adopting its incorrect thesis extraction."

## Source-of-truth metrics (adjudicated)

These values were re-verified by full-text extraction of
`public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf` (not by trusting either review alone).

| Role | Value | Notes |
|------|--------|--------|
| **Primary headline (3-seed mean, λ=0.02)** | **99.03% ± 0.07% AUROC** | Thesis abstract + body; **12** occurrences of `99.03` |
| **Primary baseline (3-seed mean, λ=0)** | **92.52% ± 11.07% AUROC** | Thesis abstract + body; **9** occurrences of `92.52` |
| **Primary gain** | **+6.5 pp** | Thesis abstract |
| **Seed-42 within-CIFAR detail** | **98.98% AUROC** | Optional secondary detail only — **not** a replacement primary headline |
| **λ=0 individual seeds** | **79.73%, 98.81%, 99.01%** | Documented in thesis; mean is 92.52% |
| **Industrial public baseline** | **0.8673 ± 0.0230 AUROC** | Thesis (5-fold FTI_Zer0P); **not** the 2024 industrial report |
| **Forbidden / unsourced on CV** | **80.25%**, **+18.8 pp** | **0** hits for `80.25` in thesis; do not treat as “worst seed” (true worst documented seed is 79.73%) |

**Anti-regression rule:** A secondary audit claimed thesis had zero `99.03` / `92.52` and that the headline should become bare 98.98%. That audit’s PDF extraction was incomplete. Implementers MUST NOT demote the portfolio to seed-42-only 98.98% as the sole primary claim while keeping a 3-seed story elsewhere.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Skeptical hiring manager verifies the hero (Priority: P1)

A hiring manager lands on the portfolio, reads the headline thesis numbers (+6.5 pp, 99.03% AUROC), clicks **Download CV**, and compares the CV to the page and optionally the thesis PDF.

**Why this priority**: One-click contradiction on the primary conversion path destroys trust faster than any other defect.

**Independent Test**: Download the CV from the live/build site; compare headline OOD numbers, education dates, role structure, and contact email to the hero/about content and the thesis PDF. All must match the adjudicated source of truth above.

**Acceptance Scenarios**:

1. **Given** the published CV is downloaded from the portfolio, **When** the OOD thesis result is read, **Then** it reports the same **primary** mean AUROC, baseline, and percentage-point gain as the site and thesis (99.03% ± 0.07%, baseline 92.52% ± 11.07%, +6.5 pp).
2. **Given** the CV, **When** searched for `80.25` or `+18.8`, **Then** those strings are absent (they are not in the thesis and must not reappear as a “worst-seed” story).
3. **Given** the CV optionally mentions seed-42 **98.98%**, **When** present, **Then** it is clearly labeled as seed-42 / within-CIFAR detail and does not replace the 3-seed mean as the only headline.
4. **Given** the CV education section, **When** compared to About education dates, **Then** program window and thesis submission/award language agree (site window: Oct 2024 – Jul 2026 style, not CV’s outdated Oct 2020 – Present / Mar 2026 submission only).
5. **Given** the CV contact line, **When** compared to the site contact, **Then** the preferred public email matches (site: `ahmed@faultrix.com`; CV must not leave only `ahmed.mo.0595@gmail.com` if that is no longer preferred).
6. **Given** professional experience for JKU / PROFACTOR, **When** read on CV vs Experience, **Then** role boundaries and dates do not invent a single merged “Apr 2024 – Present” role that conflicts with the site’s sequential roles (unless the site is intentionally updated to the same merged framing everywhere).

---

### User Story 2 - Reviewer follows a “Proof” card to the metric source (Priority: P1)

A technical reviewer opens the Proof section, sees the industrial baseline **0.8673 ± 0.0230 AUROC**, and opens the linked artifact.

**Why this priority**: Pointing a precise metric at a document that neither contains it nor supports a success narrative is actively misleading. The 2024 report also contradicts *itself* (abstract “superior performance” vs conclusion unable to reach anticipated performance / never reached stage two).

**Independent Test**: Click every proof card that displays a numeric metric; confirm the linked artifact contains that metric (or the card is relabeled so no metric is implied).

**Acceptance Scenarios**:

1. **Given** the evidence card (or Research surface) that displays 0.8673 AUROC, **When** the primary proof link is opened, **Then** the linked document contains that figure and describes the 5-fold FTI_Zer0P baseline (thesis PDF).
2. **Given** the 2024 industrial technical report (negative result), **When** it is still linked from the portfolio, **Then** it is labeled as an early / negative-result technical report that motivated later work — not as proof of the 0.8673 baseline, and not as an unqualified success.
3. **Given** AI-facing summaries (`llms.txt` / `llms-full.txt`) that cite the industrial report, **When** a reader follows the URL for 0.8673, **Then** they are not sent only to a PDF that lacks AUROC metrics.
4. **Given** Research Track 2 footer links, **When** “industrial report” is offered next to the 0.8673 metric, **Then** the metric’s primary proof path remains the thesis (or the report link is clearly separated as historical negative-result context).

---

### User Story 3 - Expert reader checks headline OOD protocol (Priority: P2)

An OOD / ML interviewer sees “99.03% AUROC on CIFAR-10” in hero, trust strip, About, or FAQ-style structured data and checks whether the protocol is standard multi-class CIFAR-10 OOD or a restricted split.

**Why this priority**: Unqualified leaderboard-adjacent claims fail expert scrutiny; the thesis itself warns that direct numerical comparison with standard multi-class OOD benchmarks is inappropriate.

**Independent Test**: Read hero legend, About thesis line, and public FAQ/Person structured-data answers; each high-visibility 99.03% mention must include or clearly point to airplane-vs-rest / single-ID (binary) scope and 3-seed mean where averages are claimed.

**Acceptance Scenarios**:

1. **Given** the hero primary stats/legend, **When** 99.03% is presented, **Then** scope includes CIFAR-10 airplane-vs-rest (or equivalent “single ID class / binary within-CIFAR”) and multi-seed mean language consistent with the thesis.
2. **Given** FAQ or Person structured data quoted by search/AI tools, **When** 99.03% appears, **Then** the same scope qualifier is present.
3. **Given** deeper research/case-study copy that already says “binary”, **When** compared to hero copy, **Then** hero and schemas are at least as honest as the deep copy.
4. **Given** a reader might confuse seed-42 **98.98%** with the 3-seed **99.03%**, **When** both appear, **Then** labels make the aggregation level obvious (mean vs single seed).

---

### User Story 4 - Recruiter trusts production accuracy claims (Priority: P2)

A recruiter or hiring manager sees **98.4%** industrial defect accuracy on Experience badges, structured data, or AI recall files and may treat it like a published benchmark.

**Why this priority**: The figure is absent from the thesis (**0** hits); blog posts already qualify it — headline surfaces must not be stronger than the documented source. Structured data is especially risky because Google/AI assistants quote it.

**Independent Test**: Search all public portfolio surfaces for “98.4”; each remaining instance either is removed from headline position or carries an operational / threshold-dependent qualifier. Inventory at minimum: Experience badge, Person description, Website description, FAQ answers, Projects schema entry, and `llms*.txt` key achievements (**five** JsonLd-class surfaces, not four).

**Acceptance Scenarios**:

1. **Given** Experience timeline badges, **When** 98.4% is shown, **Then** it is either removed or qualified (e.g. production threshold-dependent classification).
2. **Given** structured data (Person, Website, FAQ, Projects) and `llms*.txt` key achievements, **When** 98.4% appears, **Then** the same qualifier is present or the claim is demoted to long-form blog only.
3. **Given** blog posts that already distinguish AUROC vs operational accuracy, **When** they remain, **Then** they stay qualified and consistent with the above.

---

### User Story 5 - Background check on degree and timeline (Priority: P2)

Someone verifying education status sees “completed an M.Sc.”, “M.Sc. candidate”, structured credential `dateCreated` (e.g. 2026-07), thesis title-page date (May 2026), and education end date (Jul 2026).

**Why this priority**: Claiming an awarded degree before it is awarded is a background-check risk; under-claiming is safer. Schema “credential awarded” is a natural reading of `EducationalOccupationalCredential` + date — not only prose.

**Independent Test**: Inventory every surface that states degree status or M.Sc. dates; all must use one agreed phrasing for the true status as of the change date.

**Acceptance Scenarios**:

1. **Given** About narrative, CV, structured credentials, and education dates, **When** compared, **Then** they describe one consistent state (e.g. thesis submitted / degree expected Month Year — or awarded if true).
2. **Given** Research thesis title display, **When** compared to thesis title page and schema, **Then** the full title including “in Inkjet Print Quality Control” is present or intentionally shortened with ellipsis that does not invent a different title.

---

### User Story 6 - Visitor trusts freshness of content (Priority: P3)

A visitor checks blog dates and the news page for currency and correctness.

**Why this priority**: Future-dated posts and stalled automation undermine the “evidence-first / living portfolio” brand without blocking core hireability.

**Independent Test**: No blog `date` is after “today” at publish time; news automation either lands new items or fails with an actionable diagnosis (not assumed to be “missing secret” when the secret already exists).

**Acceptance Scenarios**:

1. **Given** the thesis-related blog post previously dated `2026-07-20`, **When** dates are audited, **Then** its public date is on or before the publish/merge day (or clearly marked scheduled and not emitted into RSS until that day).
2. **Given** weekly news runs that failed on 2026-06-29 and 2026-07-06 after a 2026-06-25 success, **When** the failure is investigated, **Then** operators identify the actual failing step (historically: **news link check** after successful collect+build), not only “create `ZAI_NEWS_TOKEN`” if that secret is already present.
3. **Given** a successful fix, **When** the workflow is re-dispatched, **Then** either new items merge to main or the remaining blocker is documented.

---

### User Story 7 - DACH / multilingual reader (Priority: P3)

A German- or Spanish-speaking recruiter switches language and reads hero/about/experience strings.

**Why this priority**: Locale quality signals care and language competence the site claims.

**Independent Test**: Spot-check high-traffic de/es strings for stripped diacritics that change meaning; prefer correct orthography or consistent `ue`/`oe`/`ae` transliteration.

**Acceptance Scenarios**:

1. **Given** Spanish “Years in AI/ML” style labels (`Hero` years string), **When** displayed, **Then** “Años” (or an unambiguous alternative) is used — not “Anos” (confirmed present as `Anos en IA/ML` in current source).
2. **Given** German high-traffic strings (Founder, for, Austria — e.g. `Grunder`, `fur`, `Osterreich`), **When** displayed, **Then** they use proper umlauts or consistent ASCII transliteration (`Gruender`/`fuer`/`Oesterreich`), not inconsistent stripped forms mixed with `ue` style elsewhere.
3. **Given** French/Spanish copy with missing accents (`Base a Linz`, `selectionnees`, etc.), **When** high-traffic surfaces are fixed, **Then** either proper accents or a deliberate ASCII policy is applied consistently on those surfaces.

---

### Edge Cases

- A metric appears in only one language locale — all locales for that string must stay aligned.
- An artifact is renamed or moved — proof links and `llms*.txt` absolute URLs must update together.
- Degree status changes after merge (e.g. formal award) — a small follow-up update is expected; the interim wording must remain defensible.
- 98.4% cannot be documented publicly — remove from headlines rather than invent a source.
- News link checker fails on third-party URLs — automation should fail closed (no bad merge) but not leave operators without a clear fix path.
- A future audit re-extracts the thesis poorly and claims `99.03` / `92.52` are absent — re-run full-text extraction; do not rewrite headlines to seed-42-only 98.98% based on incomplete OCR.
- Research shows 0.8673 near an industrial-report link — juxtaposition must not reintroduce the false proof path after Evidence is fixed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portfolio MUST treat the master’s thesis PDF as the source of truth for published CIFAR-10 OOD metrics (mean AUROC, baseline mean ± variance, pp gain, seed-level narrative when cited).
- **FR-002**: Downloadable CV MUST use the same **primary** OOD headline metrics as the site and thesis (99.03% ± 0.07%, 92.52% ± 11.07%, +6.5 pp). Strings **80.25** and **+18.8** MUST be removed; they are unsourced in the thesis (not a documented seed).
- **FR-003**: Downloadable CV MUST use consistent education window, thesis submission/award language, role timeline framing, and public contact email relative to the site.
- **FR-004**: Any UI or AI-recall surface that presents **0.8673 ± 0.0230 AUROC** MUST primary-link to an artifact that contains that metric (thesis), not solely to the 2024 negative-result industrial report.
- **FR-005**: The 2024 industrial technical report, if retained, MUST be presented as early/negative-result context (including honest abstract-vs-conclusion tension if summarized), not as proof of the successful public FTI_Zer0P baseline.
- **FR-006**: High-visibility **99.03%** claims (hero, trust strip, About, FAQ/Person structured data at minimum) MUST include airplane-vs-rest / single-ID binary scope (or equivalent plain language) consistent with the thesis abstract, and MUST NOT invite bare multi-class CIFAR-10 OOD leaderboard comparison without that scope.
- **FR-007**: **98.4%** MUST NOT appear unqualified on Experience badges, structured data (Person, Website, FAQ, Projects — all hits), or `llms*.txt` key achievements; either qualify as operational/threshold-dependent production accuracy or remove from those surfaces.
- **FR-008**: Degree status wording MUST be unified across About, CV, structured credentials (including credential date fields), and education dates to the true status at time of change.
- **FR-009**: Research thesis title display MUST not omit the industrial application suffix (“in Inkjet Print Quality Control”) present on the thesis title page without a clear, non-misleading short form.
- **FR-010**: No public blog post date MUST be in the future relative to the day it is published on the live site / RSS.
- **FR-011**: Multilingual high-traffic strings MUST fix meaning-breaking orthography (especially Spanish ñ / “Anos”) and reduce inconsistent German stripping vs transliteration on hero/experience/about (and related high-traffic strings).
- **FR-012**: After claim edits, production build MUST still succeed and static routes remain valid.
- **FR-013**: News automation failures MUST be diagnosed by failing step. If collect+build succeed and link-check fails, fix links/checker rather than only rotating API secrets. Restoring weekly freshness is in scope once claim P1 items are stable, or can ship as a follow-up if timeboxed separately.
- **FR-014**: When both **99.03%** (3-seed mean) and **98.98%** (seed-42) appear, copy MUST label aggregation level so seed-42 cannot be mistaken for the multi-seed headline (and seed-42 MUST NOT replace the mean as the sole primary claim).
- **FR-015**: Optional CV seed-level narrative, if used, MUST use thesis-documented seeds (e.g. 79.73% / 98.81% / 99.01% at λ=0), not invented baselines.

### Key Entities

- **Claim**: A public assertion (metric, date, degree status, email, title) that can appear on multiple surfaces.
- **Surface**: A place a claim appears (hero, CV PDF, Evidence card, Research, Experience, JsonLd, llms files, blog, news).
- **Source artifact**: Authoritative document or dataset (thesis PDF, industrial report, repo README) used to justify a claim.
- **Scope qualifier**: Protocol text that prevents misreading a metric (split type, seeds, CV folds, threshold dependence).
- **Primary vs detail metric**: Primary = multi-seed mean used in hero/CV headline; detail = single-seed or per-dataset figures used only with labels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer comparing hero OOD numbers to the downloadable CV finds zero contradictions on mean AUROC, baseline, and pp gain.
- **SC-002**: Opening the proof path for 0.8673 AUROC lands on a document that contains that number (or the number is removed from that card).
- **SC-003**: Searching public surfaces for `80.25` and `+18.8` returns zero hits on CV and site.
- **SC-004**: Every remaining high-visibility `98.4` instance includes an operational/threshold qualifier, or headline instances are zero (including all structured-data hits).
- **SC-005**: Every high-visibility `99.03` instance includes airplane-vs-rest / single-ID (or equivalent) scope language.
- **SC-006**: Degree-status phrases across About, CV, and structured credentials describe one consistent state.
- **SC-007**: No blog post in the public feed carries a date after the publish day.
- **SC-008**: Production build gate passes after the change set.
- **SC-009**: Spanish “years” label no longer renders as “Anos”.
- **SC-010**: Portfolio primary OOD headline remains the thesis 3-seed mean (99.03% ± 0.07%), not seed-42-only 98.98%, unless a deliberate global rebrand documents that change everywhere.
- **SC-011**: News workflow diagnosis documents the real failing step; a re-run either merges items or records a remaining blocker other than a secret that already exists.

## Assumptions

- True thesis metrics are those in `Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf` as listed in **Source-of-truth metrics (adjudicated)**.
- Preferred public email remains `ahmed@faultrix.com` unless the owner decides otherwise when regenerating the CV.
- Degree is not assumed “awarded” without owner confirmation; default safe wording is thesis-submitted / degree-expected if still pending.
- Regenerating the CV may use existing local CV source materials (`cv_ref` or similar) if present; if only the PDF exists, a new PDF generation step is required.
- News: `ZAI_NEWS_TOKEN` / Exa secrets may already exist; do not treat “create secret” as the default fix without checking the Actions failing step (link check observed on recent failures).
- News automation fix may be a separate commit if link-check failures need more than copy changes.
- Work proceeds on an existing lane branch (`claude-work` or `agents-work`), not a new Speckit feature git branch, per repository branch model.
- Scope is claim integrity and related copy/automation hygiene — not a visual redesign or new product features.

## Out of Scope

- Redesigning the site visual system or adding new case studies.
- Deploying the optional chat Cloudflare Worker (separate security track).
- Rewriting the thesis PDF content itself.
- Expanding language coverage beyond the five existing locales.
- Creating per-feature git branches or changing the three-lane branch policy.
- Replacing the entire portfolio metric system with seed-42-only reporting (unless explicitly requested as a separate decision).

## Review adjudication (for implementers)

| Topic | First deep review | Second verdict | Spec decision |
|-------|-------------------|----------------|---------------|
| CV vs site (80.25 / dates / role / email) | Confirmed | Confirmed | **In scope P1** |
| Thesis 92.52 / 99.03 / +6.5 | Correct | Incorrectly disputed | **Keep first review / thesis abstract** |
| 80.25 “worst seed” vs unsourced | Slightly soft | Better: unsourced | **Adopt second: unsourced; drop** |
| 0.8673 → wrong PDF | Confirmed | Confirmed + abstract/conclusion tension | **In scope P1** |
| Bare 98.4 (incl. schemas) | Confirmed (×5 JsonLd-class) | Confirmed (undercounted ×4) | **Sweep all hits incl. Projects schema** |
| Airplane-vs-rest qualifier | Confirmed | Confirmed + leaderboard caveat | **In scope P2** |
| Degree inconsistency | Confirmed | Confirmed + schema reading | **In scope P2** |
| Future blog date | Confirmed | Confirmed | **In scope P3** |
| News failures | Soft on root cause | Soft on “create token” | **Diagnose by step; link-check first** |
| Diacritics / Anos | Confirmed | Falsely said Anos missing | **Anos is real; fix it** |
| Thesis title suffix | Confirmed | Confirmed | **In scope P2** |
| Fix order | CV → evidence → 98.4 → scope → hygiene | Same | **Endorse** |
