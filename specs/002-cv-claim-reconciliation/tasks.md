# Tasks — 002 CV/Claim Reconciliation

**Delegation legend:** `[P]` = parallelizable (no dependency on another in-flight task) ·
`→Tnnn` = depends on · **Agent** = suggested subagent type.

> ⚠️ **Gate:** T2.3+ are blocked until Ahmed answers the decisions in `spec.md`
> (headline improvement figure, submission date, external-benchmark range; the canonical contact address was already settled by PR #281, see section 9 of `ground-truth.md`).
> T2.1 and T2.2 can start immediately and *inform* those decisions.

### T2.1 [P] — Extract thesis ground truth
**Agent:** Explore / general-purpose (read-only)
Read `public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`. Produce a fact sheet:
exact AUROC (binary within-CIFAR), the true baseline(s) and improvement (is it +6.5pp over
92.52%, +18.8pp over 80.25%, or both from different baselines?), external OOD numbers per
dataset, FPR95, submission date, supervisor titles. Cite page numbers. **Output:** markdown
fact sheet committed to this folder as `ground-truth.md`.

### T2.2 [P] — Build the claim inventory
**Agent:** Explore / general-purpose (read-only)
Grep every quantified/dated/contact claim across `src/`, `public/cv.tex`,
`public/llms*.txt`, `JsonLd.tsx`, `ChatBot.tsx`. Produce a matrix: claim → every file:line
it appears → current value. Flag all divergences. **Output:** `claims-matrix.md`.

### T2.3 — Reconcile site source  →T2.1 →T2.2 + Ahmed decisions
**Agent:** general-purpose (edit)
Edit all site surfaces to the single agreed set of numbers/dates/email. Preserve the
"within-CIFAR binary / not multi-class CIFAR-10" caveat everywhere 99.03% appears. Update
all 5 i18n languages in each `copy` block.

### T2.4 — Regenerate the CV  →T2.3
**Agent:** none — owner action
The owner regenerates `public/cv.pdf` in the external CV workspace and copies the finished
PDF into this repository (see `AGENTS.md`). The CV is not built here: an agent must never
rebuild or edit the PDF in this repository.

### T2.5 — Verify  →T2.3 →T2.4
**Agent:** general-purpose + `verify` skill
`grep` for `80.25|18.8|6.5|99.03|0.8673|98.4` returns one consistent story. `npm run build`
passes. Manually diff CV PDF text vs site stat blocks. Confirm every metric traces to an
artifact.

**Suggested wave plan:** Wave 1 = {T2.1, T2.2} in parallel → collect Ahmed's decisions →
Wave 2 = T2.3 → Wave 3 = {T2.4} → Wave 4 = T2.5.
