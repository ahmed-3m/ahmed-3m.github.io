# Portfolio Re-align — Sihem-forward + Rigor Positioning

**Status:** Revised draft (v2) — incorporates the deep source audit in
`specs/005-portfolio-modernization/analysis.md`
**Date:** 2026-07-30
**Branch:** to be created off `origin/main` (e.g. `feat/portfolio-rigor-realign`)
**Approach:** A′ — editorial re-rank, content-only, **plus two deletions** (see §3)

> **v2 changelog.** Corrected scope counts (§4); added the complete
> founder-vocabulary replacement map in all 5 languages (§5); found two
> occurrences no Latin-script grep catches (§6); replaced the "32 open models"
> hero stat with a defensible alternative and showed the evidence (§7.1);
> resolved all seven open questions (§7); rewrote the verification plan, whose
> v1 grep would have passed while the site still said "entrepreneur" (§9);
> folded in the diacritics fix, because it edits the same lines (§8); added a
> hard blocker on the email address (§2).

---

## 1. Why

The GitHub profile (`ahmed-3m/ahmed-3m`) was rewritten on 2026-07-30. It moved
the flagship narrative from **Faultrix** to **Sihem** + open LLM research, and
dropped Founder/Entrepreneur framing. The portfolio is out of sync:

| Area | New GitHub profile | Current portfolio |
|---|---|---|
| Flagship product | **Sihem** | **Faultrix** |
| Title | "AI/ML Engineer" | "AI/ML Engineer & **Entrepreneur**" |
| Email | gmail (see §2 — **unresolved**) | `ahmed@faultrix.com` |
| Featured work | Sihem · DiffusionOOD · InkjetOOD · HF models · EEG/BCI | Faultrix-led |

The thesis work (DiffusionOOD, 99.03% AUROC) is the stable anchor — consistent
across both, and untouched by this work.

---

## 2. ⛔ Blocker — resolve before writing any code

**The email address is not confirmed.** v1 §4.7/§4.8/§4.9 propagate
`ahmed.mo.0595@gmail.com` to **17 locations**, including JSON-LD `email`, the
RSS `managingEditor`, the `<noscript>` block, Contact, and Footer.

That address matches `GITHUB_PROFILE_README.md:45`. But the value on file for
this account is `ahmed.mu.0905@gmail.com` — differing in two places
(`mo`/`mu`, `0595`/`0905`), which is a classic transposition pattern. One of
these is wrong.

**Getting this wrong = a silently dead contact path on the primary
professional asset, in machine-readable schema Google will cache.** Confirm the
correct string before any `ahmed@faultrix.com` replacement runs. Everything
else in this plan can proceed without it — the founder-vocabulary work and the
email work touch disjoint lines except in `layout.tsx:108` and `ChatBot.tsx`.

**Second, smaller decision:** is `ahmed@faultrix.com` being *retired* or just
*deprioritized*? If Faultrix is still live and you still read that inbox,
keeping it on the Faultrix case study and project card costs nothing and is
more coherent than scrubbing it. Only the *primary identity* surfaces (Person
schema, Contact, Footer, `<noscript>`) need to change.

---

## 3. Decisions locked

1. **Positioning:** "AI/ML Engineer" only.
2. **No Founder / Entrepreneur vocabulary anywhere.** ← *user-locked, 2026-07-30.*
   This extends to the whole word family in every language: `founder`,
   `founded`, `entrepreneur`, `Gründer`/`Gruender`, `gegründet`, `Fondateur`,
   `fondé`, `Fundador`, `fundé`, `emprendedor`, `مؤسس`, `أسست`, `رائد أعمال`.
3. **Replacement principle: swap a title-claim for a build-claim.** Do not just
   delete the word — delete it and put concrete evidence in its place.
   "Founder" is a word anyone can type. "Sole engineer — zero to production,
   ÖNORM/DSGVO compliant" is not. For an engineering audience the second is
   *strictly stronger*, so this constraint costs nothing and gains signal.
4. **Narrative spine:** *"I build ML systems I can stand behind — verified
   error bars in research, eval harnesses in production."*
5. **Voice:** understated and dry. No superlatives. Trust the numbers; don't
   inflate them. **This rule is load-bearing — see §7.1.**
6. **Products:** Sihem = flagship. Faultrix = reframed as shipped past work,
   not deleted.
7. **Scope:** every founder-family reference, all i18n (en/de/fr/es/ar), SEO
   (`layout.tsx`, `JsonLd.tsx`), `llms.txt`, RSS, manifest, CV, repo docs.
8. **Approach A′:** editorial re-rank. Keep component structure and CSS, with
   **two exceptions** granted in §3.1.
9. **Icon branch:** `feat/a3m-brand-icons` stays separate. This branches off a
   clean `origin/main`.

### 3.1 Amendment to "no layout changes" — two deletions are cheaper than the rewrite

v1 §4.1 Edit 2 commissions a **new terminal mockup translated into 5
languages**. `specs/005` recommends **deleting the terminal entirely** (D2).
Doing both in sequence means writing that copy twice and throwing the first
version away.

Same for the stats row: v1 Edit 3 keeps four stat tiles plus the 3-line 11px
legend; `specs/005` D4 argues that staging four claims and then caveating all
of them in fine print converts rigor into apparent hedging.

**Resolution — allow exactly two deletions in this pass:**

- **Delete the terminal mockup** (`Hero.tsx`, and `copy.loading` / `copy.detect`
  / `copy.reportReady` / `copy.imagesFlagged` — 4 copy objects × 5 languages
  that become dead). It is already `display: none` below 768px
  (`globals.css:1247`), so **no mobile visitor has ever seen it.** Deleting is
  less work than translating a Sihem version of it, and it removes the
  `#ff0000` cursor block bug (`globals.css:444`) from above the fold as a side
  effect.
- **Delete the 4th stat tile** rather than swapping its content (see §7.1 for
  why "32 open models" should not go there). Three stats — years, AUROC,
  gain — with a **shortened** legend. Every remaining stat then has a caveat
  that fits on one line instead of a 3-clause run-on.

**Both deletions have a CSS consequence. Budget for them — they are the only
two CSS lines this plan touches:**

- `globals.css:353` — `.cd-hero-grid { grid-template-columns: 1fr 1fr; }`.
  Removing the terminal leaves an **empty right column on desktop**. The hero
  will read as half-blank until this becomes `1fr` (with a `max-width` on the
  text column so the line length stays readable — full-bleed body copy at
  desktop width is worse than the empty column). The mobile override at
  `:1246` already collapses to `1fr`, so mobile is unaffected.
- `globals.css:1249-1254` — the mobile stat grid is `repeat(2, 1fr)` with
  `.cd-stat:nth-child(odd)` getting a right border and
  `:nth-child(3), :nth-child(4)` losing their bottom border. **With 3 stats,
  #3 sits alone in the bottom row and — being odd — draws a right border
  against nothing.** Change to `repeat(3, 1fr)` on one row, or drop the
  `nth-child` rules.

Everything else stays Approach A: no other grid changes, no new components, no
CSS restructure. The full 11→5 section restructure stays in `specs/005` Phase 2.

---

## 4. Corrected scope

v1's counts were measured before the full audit. Actuals against `origin/main`:

| Metric | v1 said | Actual | Note |
|---|---|---|---|
| "Faultrix" hits | 201 / 22 files | **201 / 22 files** | ✅ accurate |
| founder-family files | 8 | **15** | v1 undercounted by ~half |
| founder-family sites | — | **~27** | see §5 |
| `ahmed@faultrix.com` | 15 | **17** | |

The undercount is why §5 exists as an explicit line-by-line map rather than a
"grep and fix" instruction.

---

## 5. Replacement map — every site, every language

### 5.1 User-facing UI (all 5 languages)

**`src/components/Hero.tsx:23-29`** — `copy.body`

| | Current | New |
|---|---|---|
| en | `AI/ML engineer and entrepreneur. I build systems that work in the real world - from research to production.` | `AI/ML engineer. I build ML systems I can stand behind — verified error bars in research, eval harnesses in production.` |
| de | `AI/ML Engineer und Grunder. Ich baue Systeme, die in der Praxis funktionieren...` | `AI/ML Engineer. Ich baue ML-Systeme, für die ich geradestehen kann — belegte Fehlerbalken in der Forschung, Eval-Harnesses in der Produktion.` |
| fr | `Ingenieur IA/ML et entrepreneur. Je construis des systemes...` | `Ingénieur IA/ML. Je construis des systèmes ML dont je peux répondre — barres d'erreur vérifiées en recherche, harnais d'évaluation en production.` |
| es | `Ingeniero de IA/ML y emprendedor. Construyo sistemas...` | `Ingeniero de IA/ML. Construyo sistemas de ML de los que puedo responder: barras de error verificadas en investigación, arneses de evaluación en producción.` |
| ar | `مهندس ذكاء اصطناعي وتعلم آلي ورائد أعمال. أبني أنظمة تعمل في الواقع من البحث إلى الإنتاج.` | `مهندس ذكاء اصطناعي وتعلم آلي. أبني أنظمة يمكنني الدفاع عنها — أشرطة خطأ موثّقة في البحث، وأطر تقييم في الإنتاج.` |

⚠️ The French string contains apostrophes (`d'erreur`, `d'évaluation`). The
codebase uses single-quoted JS strings — escape them or switch that value to
double quotes, or the build breaks.

**`src/components/TrustStrip.tsx:13-19` + `:45`** — rename key `founder` → `shipped`

| | Current | New |
|---|---|---|
| en | `Founder of Faultrix` | `AI QC platform shipped to production` |
| de | `Gruender von Faultrix` | `KI-Qualitätskontrolle in Produktion ausgeliefert` |
| fr | `Fondateur de Faultrix` | `Plateforme IA de contrôle qualité en production` |
| es | `Fundador de Faultrix` | `Plataforma de control de calidad con IA en producción` |
| ar | `مؤسس Faultrix` | `منصة ذكاء اصطناعي لضبط الجودة في الإنتاج` |

Update the `items` array at `:45`: `t(copy.founder)` → `t(copy.shipped)`.

**`src/components/Projects.tsx:8`** — `copy.live`, the Faultrix card eyebrow

| | Current | New |
|---|---|---|
| en | `Live SaaS - Founder` | `Shipped · built solo` |
| de | `Live SaaS - Grunder` | `Ausgeliefert · im Alleingang gebaut` |
| fr | `SaaS en ligne - Fondateur` | `Livré · conçu en solo` |
| es | `SaaS activo - Fundador` | `Publicado · construido en solitario` |
| ar | `منصة SaaS مباشرة - المؤسس` | `تم إطلاقه · بُني منفردًا` |

Sihem's promoted card gets a new key `copy.sihemLive` = `Live beta · @sihem_ai_bot`
(product name + handle; no translation needed beyond RTL punctuation).

**`src/components/Experience.tsx:21`** — `role`

| | Current | New |
|---|---|---|
| en | `Founder & Full-Stack Developer` | `AI/ML & Full-Stack Engineer` |
| de | `Grunder & Full-Stack Developer` | `AI/ML- & Full-Stack-Engineer` |
| fr | `Fondateur & developpeur full-stack` | `Ingénieur IA/ML & full-stack` |
| es | `Fundador y desarrollador full-stack` | `Ingeniero de IA/ML y full-stack` |
| ar | `المؤسس ومطور متكامل` | `مهندس ذكاء اصطناعي وتطوير متكامل` |

**`src/components/About.tsx:29-33`** — p3. Minimum viable change is one verb
(`founded` → `built`, `gegrundet` → `gebaut`, `J ai fonde` → `J'ai construit`,
`Funde` → `Construí`, `أسست` → `بنيت`). Recommended fuller rewrite, Sihem-forward:

- **en:** `I also build and ship — most recently Sihem, an LLM personal-mentor assistant, and before that Faultrix, an AI quality-control platform I took from zero to production on my own. Both taught me that production reliability is its own kind of rigor.`
- **de:** `Ich baue und liefere auch aus — zuletzt Sihem, einen LLM-gestützten persönlichen Mentor, davor Faultrix, eine KI-Plattform für Qualitätskontrolle, die ich allein von null bis in die Produktion gebracht habe. Beides hat mich gelehrt, dass Zuverlässigkeit im Betrieb eine eigene Form von Sorgfalt ist.`
- **fr:** `Je construis et je livre aussi — récemment Sihem, un assistant-mentor personnel fondé sur les LLM, et avant cela Faultrix, une plateforme IA de contrôle qualité que j'ai menée seul de zéro à la production. Les deux m'ont appris que la fiabilité en production est une rigueur à part entière.`
- **es:** `También construyo y publico: hace poco Sihem, un asistente-mentor personal basado en LLM, y antes Faultrix, una plataforma de control de calidad con IA que llevé yo solo de cero a producción. Ambos me enseñaron que la fiabilidad en producción es su propio tipo de rigor.`
- **ar:** `أبني وأُطلق أيضًا — مؤخرًا Sihem، مساعد ومرشد شخصي قائم على نماذج اللغة، وقبله Faultrix، منصة ذكاء اصطناعي لضبط الجودة نقلتها بمفردي من الصفر إلى الإنتاج. علّمني كلاهما أن الموثوقية في الإنتاج نوع خاص من الدقة.`

⚠️ `fondé sur les LLM` in the French keeps a form of *fonder* — it means
"based on," not "founded," and is correct French. Note it here so §9's grep
result is not treated as a miss. If that ambiguity is unwelcome, use
`s'appuyant sur les LLM`.

**`src/components/About.tsx:77`** — `value: 'Faultrix.com - Founder'`
→ `'faultrix.com — built solo'`.
*(This info-row value is hardcoded English today, not translated — pre-existing
inconsistency, out of scope to fix here, but worth a note.)*

**`src/lib/case-studies.ts:141-147`** — `role`. The fix is deleting two words:

| | Current | New |
|---|---|---|
| en | `Founder and full-stack builder across product, UX, AI workflow, and deployment.` | `Full-stack builder across product, UX, AI workflow, and deployment.` |
| de | `Gruender und Full-Stack-Builder ueber Produkt...` | `Full-Stack-Builder über Produkt, UX, KI-Workflow und Deployment.` |
| fr | `Fondateur et constructeur...` | `Constructeur full-stack : produit, UX, workflow IA et déploiement.` |
| es | `Fundador y constructor...` | `Constructor full-stack: producto, UX, flujo de IA y despliegue.` |
| ar | `المؤسس والباني...` | `باني متكامل عبر المنتج وتجربة المستخدم وسير عمل الذكاء الاصطناعي والنشر.` |

### 5.2 SEO / metadata (English only)

`src/app/layout.tsx` — lines **44** (title default), **47** (description),
**48** (keywords: drop `"AI Entrepreneur"`, add `"Sihem"`, `"LLM applications"`),
**54** (OG title), **58** (OG image alt), **107** (`<noscript>` `<h1>`),
**108** (`<noscript>` `<p>`, "Founder of Faultrix").
All titles become `Ahmed Mohammed | AI/ML Engineer`.

`src/components/JsonLd.tsx` — lines **10** & **322** (`jobTitle` → `AI/ML Engineer`),
**11**, **136**, **312** (`description`), **134** & **515** (`name`),
**232** (FAQ text → "…an AI-powered construction QC SaaS **built by** Ahmed Mohammed").

### 5.3 ChatBot

`src/components/ChatBot.tsx:100` — drop "and entrepreneur".
`:106` — "Ahmed **founded** Faultrix" → "Ahmed **built** Faultrix".
Add a Sihem persona fact. Keep the `faultrix_*` prompt suggestions (§7.7).
System prompt is English-only by design — no i18n needed.

### 5.4 Static content

| File | Lines |
|---|---|
| `public/llms.txt` | 1, 3, 11, 42 |
| `public/llms-full.txt` | 1, 3, 11, 42, 72, **148 (`Entrepreneurship` tag)** |
| `public/manifest.json` | 4 |
| `README.md` | 41 |
| `GITHUB_PROFILE_README.md` | 1, 3 |
| `public/cv.tex` | 72, 89, 96 — see §7.1 |

`llms-full.txt:42` already reads "Built AI construction analysis platform
**solo from zero to production**." That line needs no help — it is the model
the rest of this pass should imitate.

---

## 6. Two occurrences no Latin-script grep finds

Both were missed by every pattern in v1, and both are user-facing:

1. **`Hero.tsx:28`** — Arabic reads `ورائد أعمال` = "and **entrepreneur**". A
   different word from `مؤسس` (founder), so even an Arabic grep for "founder"
   misses it.
2. **`TrustStrip.tsx:15`** and **`case-studies.ts:143`** — German uses the
   ASCII ue-digraph `Gruender`, which `grep -i "gründer\|grunder"` does not
   match.

These are the reason §9's verification regex is not v1's regex.

---

## 7. Open questions — resolved

**7.1 CV (`cv.tex`) — strip "Founder" there too. Yes.**
The ATS argument does not hold: applicant tracking systems match on skills,
titles-being-searched-for, and tools — not on self-assigned company titles. No
recruiter searches for "Founder" to fill an ML engineering req. More
importantly, a CV/site mismatch recreates exactly the problem
`specs/002-cv-claim-reconciliation` was opened to fix. Concretely:

- `:72` `As founder of Faultrix, architected…` → `Building Faultrix, architected…`
- `:89` `\role{Founder \& ML Engineer}` → `\role{ML Engineer \& Full-Stack Developer}`
- `:96` `Sole technical founder — owned the full ML product cycle` →
  `Sole engineer — owned the full ML product cycle: model selection, pipeline
  architecture, deployment, iteration on production data.`

For an engineering role that last line reads **stronger**, not weaker.
*(Separately: `specs/005` R3 flags that `public/cv.tex` — the LaTeX **source** —
is served publicly alongside `cv.pdf`. Probably unintended. Cheap to fix while
you are in the file.)*

**7.2 `GITHUB_PROFILE_README.md` — delete it, leave a pointer.**
The source of truth is now the `ahmed-3m/ahmed-3m` repo, and this copy has
already diverged. A stale mirror is worse than no mirror: it is the file that
will get grepped and re-propagated six months from now. `specs/005` R2 flags
it as part of the root-clutter problem anyway.

**7.3 Faultrix featured card — demote to a normal card. Agreed.**
Keeps the work visible, which matters more than the slot.

**7.4 New HuggingFace project card — skip.** See 7.5; the same evidence
applies. A card is a bigger surface than a stat and would need real substance
to fill it.

**7.5 Hero 4th stat — delete the tile; do not use "32 open models."**

The count is accurate (36 repos, 4 private → 32 public). But the underlying
repos do not support promoting it next to "99.03% AUROC":

- **0 likes** across all 36 repos
- **~35 total downloads**; the two best-performing are **8 each**
- Many are training scratch: `DM_lora_zer0p_00/01/02`, `DM_lora_txt_enc`,
  `finetune_unet_prompts0/1/2/3`, `unet_new_prompts`
- Several have **no model card at all** (`region:us` tag only)
- **Two are tagged `negative-result`**

Presenting a checkpoint count as a headline achievement is the same overclaim
pattern `specs/001`/`specs/002` exist to prevent — and it would be doing so in
service of a *rigor* narrative whose own stated rule (§3.5) is "trust the
numbers; don't inflate them." A reviewer who clicks through finds checkpoint
spam under a stat tile, which costs more credibility than the tile buys.

**The defensible version of the same claim, for prose rather than a stat tile:**

> *Weights and code are public for every thesis result.*

That is verifiable, it is genuinely a rigor claim, and it survives someone
actually checking. Put it in the Evidence/Proof section next to the artifact
links, not in a hero tile.

**7.6 `faultrix.com` links — keep where useful.** Agreed with v1: keep on the
case study and project card, remove from primary identity (Hero, Person
schema).

**7.7 ChatBot `faultrix_*` suggestions — keep.** Legitimate product Q&A.

**7.8 (new) `JsonLd.tsx:161` `founder:` — remove the whole Organization node.**
This one is a genuine judgment call because `founder` there is a **schema.org
property name** on the `faultrix.com/#organization` node, not display copy. It
never renders. But it does assert the relationship to Google and can surface in
a knowledge panel.

Rather than keep a node and surgically strip one field, **delete
`OrganizationSchema` from the portfolio entirely** (and its `<OrganizationSchema />`
call at `layout.tsx:91`). It is not a personal site's job to publish a
company's structured data — faultrix.com should do that itself. Removing the
node drops `founder` and `foundingDate` as a side effect and leaves the Person
schema cleaner. Lower risk than it sounds: the Person schema is what carries
the identity signal, and it stays.

---

## 8. Fold in the diacritics fix — same lines, same pass

`specs/005` C1 (priority 36) is the highest trust-per-hour item on the site and
it **edits the same strings this plan already touches**:

`Offen fur` · `Standort Linz, Osterreich` · `Oeffentliche` · `gestutzte
Bauqualitatskontrolle` · `Aussergewohnliches` · `Uebergang` · `Beitrage` ·
`Base a Linz` · `Annees` · `Investigacion` — sitting in the *same files* as
correctly-accented `Frühzeitiger` (`Evidence.tsx:40`) and `binär`
(`Hero.tsx:42`, `TrustStrip.tsx:29`).

Two of the strings in §5.1 (`Hero.tsx` `open`/`based`, `TrustStrip.tsx`
`location`) are literally adjacent to founder-vocabulary keys in the same
object. Doing these as separate PRs means opening the same files twice and
producing two conflicting diffs of the same `copy` blocks.

**Include C1 in this branch.** For a portfolio aimed at Linz, a
German-speaking reader clocks `Osterreich` in the first sentence — it undoes
the Hochreiter credential faster than any positioning change can rebuild it.

---

## 9. Verification plan

**v1's step 3 was `grep -rni "entrepreneur\|founder"`. That check would have
reported clean while `Hero.tsx:28` still said "entrepreneur" in Arabic and two
files still said `Gruender`.** Use this instead:

```bash
grep -rniE "founder|founded|entrepreneur|Gr[uü]nder|Gruender|gegr[uü]ndet|Fondateur|Fundador|emprendedor|مؤسس|أسست|رائد أعمال" src/ public/ *.md
```

Expected survivors, all intentional:
- `fondé sur les LLM` in the French About copy (means "based on" — §5.1)
- nothing else

Full gate:

1. `npm run build` — static export succeeds (catches i18n/type errors, and the
   French apostrophe hazard in §5.1).
2. `npm run lint` — clean.
3. The regex above → only the documented survivor.
4. `grep -rn "ahmed@faultrix" src/ public/` → only the intentional Faultrix
   product surfaces per §2.
5. **Diacritics check:** `grep -rnE "'de':.*(fur |Osterreich|Oeffentlich|ue[a-z]*[a-z]|Beitrage)" src/` → zero.
   Same idea for `fr:` (`Base a `, `Annees`) and `es:` (`Investigacion`).
6. Visual, **desktop and ≤768px separately** (both §3.1 CSS consequences bite
   at different widths): desktop hero has no empty right column; mobile stat
   row has no orphaned right border on tile 3; Sihem card featured; Faultrix
   card present.
7. SEO: view-source built `index.html` — title, `og:title`, `<h1>`, JSON-LD
   `jobTitle` all say "AI/ML Engineer", no Organization node.
8. **Reverse check — what got *lost*, not just what got removed.** Every grep
   in this plan tests for absence. None of them catches the actual risk: that
   after the pass the site no longer signals *he took a product from zero to
   production alone.* Read the rendered Hero → TrustStrip → Projects →
   Experience path end to end and confirm that signal is still there in
   concrete form. If it is not, the constraint was applied as deletion instead
   of substitution (§3.3), and it needs another pass.

---

## 10. Rollout

1. Branch `feat/portfolio-rigor-realign` off clean `origin/main`.
2. **Resolve §2 (email) first.**
3. Implement §5 + §3.1 deletions + §8 diacritics.
4. Run §9.
5. PR into `main`, linking this doc.
6. After merge: confirm deploy to `gh-pages`.
7. `feat/a3m-brand-icons` separately.

---

## 11. Out of scope

- The 11→5 section restructure, effects-layer removal, palette work, real
  breakpoints — `specs/005` Phase 2.
- Image optimization (P1), Worker chat proxy (A6), tests/CI budget (R1/R4) —
  `specs/005` Phases 1 and 3.
- A3M icon / brand mark — separate branch.
- Thesis numbers and their caveats — already reconciled (`specs/002`).
- The interactive OOD demo (spec 003); news/activity automation.

---

## 12. Relationship to `specs/005-portfolio-modernization`

This plan is **content**. `specs/005` is **structure**. They are compatible if
sequenced in this order:

| | This plan (A′) | `specs/005` Phase 2 |
|---|---|---|
| Hero | new body copy, terminal deleted, 3 stats | rebuilt around one claim, caveat inline |
| Sections | 11, re-ranked | 11 → 5 |
| Effects | terminal + `#ff0000` block gone | cursor, orbit orb, outline text, eyebrows gone |

Running this plan first is right: it is cheap, it is reversible, and the
redesign needs final copy to lay out against. The one rule is **do not
commission 5-language copy for anything `specs/005` deletes** — which is
precisely what §3.1 prevents.
