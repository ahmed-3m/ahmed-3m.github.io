# Feature Specification: Claims Registry and Figure Check

**Feature Branch**: `spec/008-claims-registry`

**Created**: 2026-11-27

**Status**: Draft

**Input**: User description: "008 claims registry: one claims.ts registry derived from ood-explorer-data.ts (value, required qualifiers, evidence link, retired flag; computed deltas like +6.5 pp), a formatClaim(id, lang) helper replacing typed-in figures in all five locales, a verify:export check that scans source, llms*.txt, OG images and the static export and fails on unknown figures or missing qualifiers (folding in the deny-list in tools/verify-export.mjs), fixing current drift (e.g. de/fr 0,8673 and +6.5 pp typed in), and later the published Genie prompt/knowledge file built from the registry. Success: the build fails on a planted wrong figure in any locale."

**Related**: constitution principle I (Evidence-First Claims) and "Claim Integrity Standards";
`specs/001-claim-integrity-alignment` (adjudicated source-of-truth table);
`specs/002-cv-claim-reconciliation` (`ground-truth.md`, `claims-matrix.md`);
`tests/genie/claims.test.ts` (today's Genie-only check). Spec 007 (Worker hardening) is
a separate, later feature; this spec does not depend on it except for User Story 4.

## Background

The site's result figures (for example the thesis headline 99.03% ± 0.07% AUROC, the
92.52% ± 11.07% baseline, the +6.5 pp gain, and the inkjet 0.8673 ± 0.0230 AUROC) are
backed by one data file of thesis results. But most pages do not read them from that
file. They are typed-in copies: about 250 occurrences across about 30 files, in five
languages (English, German, French, Spanish, Arabic), in page copy, structured data, the
LLM manifests (`llms.txt`, `llms-full.txt`), the social-preview (OG) image generator, the
blog, the README and Genie.

No mismatch is known today. The risk is drift. When a figure is corrected or retired,
every copy must change by hand, in every language, with its qualifier ("3-seed mean",
"5-fold CV", "seed 42"). The only automatic guard is:

- a Genie-only test, which checks prepared replies and Genie's knowledge;
- three retired strings in the export check (`80.25%`, `+18.8pp`, "18.8 percentage").

Nothing stops a wrong figure on a page, in a translation, in `llms.txt` or in an OG
image. Rule I of the constitution says "mismatched claims destroy more credibility than
missing claims".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A wrong or unqualified figure fails the build (Priority: P1)

The owner, or an agent, edits page copy and introduces a figure that does not match the
thesis data:
- a mistyped value (99.30% instead of 99.03%);
- a mean without its spread;
- a headline mean without its qualifier;
- a retired figure (80.25%).

This can happen in any of the five languages or in any published text surface. The check
fails before the change can be deployed, and names the file, the language, the figure
and the rule it broke.

**Why this priority**: this is the protection the feature exists for. It is valuable on
its own, even if no copy is ever migrated to the registry: it turns the constitution's
claim rule from a review habit into a gate.

**Independent Test**: plant one wrong figure in each surface and language listed in
FR-006. Run the check: it fails once per planted figure, with a message naming it.
Remove the plants: it passes on the current site.

**Acceptance Scenarios**:

1. **Given** the current site, **When** the check runs, **Then** it passes. Every figure
   it finds is one of:
   - a registered claim in an allowed form;
   - a reviewed non-result;
   - a finding already on the site when the check lands. These are recorded in a reviewed
     baseline that can only shrink, and the baseline is empty once User Story 3 is done
     (see plan research R0 and R9).
2. **Given** a German translation where "99,03 %" is changed to "99,30 %", **When** the
   check runs, **Then** it fails and names the file, the language (de), the figure and
   "not a registered value".
3. **Given** an English page where "99.03% ± 0.07%" is shortened to "99.03%", **When** the
   check runs, **Then** it fails with "mean without its spread".
4. **Given** `llms.txt` stating "0.8673 ± 0.0230 AUROC" with no mention of 5-fold
   cross-validation nearby, **When** the check runs, **Then** it fails with "missing
   qualifier: 5-fold CV".
5. **Given** any surface containing a retired figure (80.25%, +18.8 pp), **When** the
   check runs, **Then** it fails with "retired figure", as the export check does today.
6. **Given** a number that is not a result (a version, a year, a table reference such as
   "Table 6.1", a λ value, a parameter count), **When** it is on the reviewed non-result
   list, **Then** the check ignores it. **When** it is not on the list and looks like a
   result, **Then** the check fails and says how to register it.

---

### User Story 2 - One place to change a figure (Priority: P2)

The owner needs to correct or retire a figure. They change it in one place, the
registry, which reads its values from the thesis data file. The headline surfaces
(FR-010) then show the new value in all five languages, with the right decimal mark and
qualifier. The check (User Story 1) then flags every remaining typed-in copy.

**Why this priority**: it removes the manual five-language edit that causes drift. It
builds on User Story 1, which catches what migration misses.

**Independent Test**: change one registered value in a scratch branch. Every headline
surface in FR-010 shows the new value in all five languages. The check flags each typed-in
copy left elsewhere.

**Acceptance Scenarios**:

1. **Given** the registry, **When** the +6.5 pp gain is shown anywhere, **Then** it is
   computed from the optimal and baseline means in the data file, not typed in.
2. **Given** the German or French site, **When** a registered figure is shown, **Then** it
   uses a decimal comma and the language's spacing ("99,03 % ± 0,07 %", "0,8673"). On the
   English, Spanish and Arabic sites it uses a decimal point. Today's copy is mixed: German
   pages show both `99.03%` and `99,03%`, and one Spanish line uses a comma. The migration
   makes these uniform and lists each change (FR-011).
3. **Given** a registered claim with a required qualifier, **When** the formatted form is
   requested, **Then** the qualifier is part of the output in that language. For example,
   "3-seed mean" becomes "Mittelwert über drei Läufe".
4. **Given** a claim marked retired, **When** any surface asks for it, **Then** the
   request fails at build time rather than rendering it.

---

### User Story 3 - Existing drift is cleaned up (Priority: P2)

Typed-in copies on the headline surfaces are replaced with registry output. Copies that
remain typed in pass the check. After
this story, the site says the same thing everywhere, and the check passes with no
exceptions beyond the reviewed non-result list.

**Why this priority**: it delivers the "same story everywhere" outcome to visitors. It
depends on User Stories 1 and 2.

**Independent Test**: count typed-in copies of registered figures on the FR-010
surfaces before and after: after is zero. Run the check: it passes.

**Acceptance Scenarios**:

1. **Given** the hero, evidence, research, experience and case-study copy, structured
   data, the OG image generator and Genie, **When** they are searched for typed-in
   registered figures, **Then** none remain. All come from the registry.
2. **Given** the German and French copy that types "0,8673" and "+6,5 pp" today, **When**
   this story is done, **Then** those come from the registry.

---

### User Story 4 - Genie's published knowledge comes from the registry (Priority: P3)

Genie's model prompt and knowledge, and the public LLM manifests where practical, state
figures that come from the registry. This applies once the prompt is published as a
site file under spec 007.

**Why this priority**: it is valuable but blocked. Spec 007 has not decided who owns
the prompt or how it is published. User Stories 1–3 must not wait for it. Until then,
Genie's knowledge is covered by the check in User Story 1.

**Independent Test**: after spec 007 lands, change a registered value. The published
prompt file shows the new value without a hand edit.

**Acceptance Scenarios**:

1. **Given** spec 007 publishes the prompt as a site file, **When** the site is built,
   **Then** every figure in that file comes from the registry and passes the check.

---

### Edge Cases

- **Rounded or alternative forms.** "99%", "0.87", "6.5 percentage points", "6,5
  Prozentpunkte", Arabic-Indic digits. Rounded forms are not allowed (decided
  2026-11-27). Every result is stated at its registered precision, with its spread where
  it has one. A rounded copy found on the site today is fixed during migration, and the
  fix is listed in the PR (FR-011). Spelled-out units are matched as the same claim as
  their short form.
- **How a spread is written**: as "± 0.07%", as "+/- 0.07%" (blog posts), or stated
  apart from its mean ("standard deviation from 11.07 to 0.07 percentage points"). All
  three count as the spread being present, as long as it is in the same unit as the mean.
- **Numbers that are not results**: years, dates, versions, λ values, p-values, sample
  counts (1,000 / 9,000), table and section numbers, durations, parameter counts.
  These come off a reviewed non-result list, each with a reason, as the Genie test's
  `NOT_RESULTS` does today. The default is that a decimal next to a metric word (AUROC,
  accuracy, FPR, pp, %) is a result.
- **Thousands separators vs decimal commas**: "9,000" is a count in English, while
  "0,8673" is a decimal in German and French. The check reads each text with its own
  language's decimal mark.
- **Retired figures inside the check itself**: the registry has to store retired values
  in order to reject them. It stores them so a repository-wide text search for the
  literal does not match the registry file (the export check already does this by
  joining string pieces).
- **Mixed-direction text**: in Arabic copy, figures sit inside right-to-left text with
  bidi isolation marks. The check ignores direction marks when reading a figure.
- **Prose that names a figure in order to reject it**, such as spec files or a "this
  claim was retired" note. Spec, test and documentation folders are not published and
  are not scanned (FR-006).
- **OG images are committed pictures.** Their generator is run by hand, and pixels cannot
  be scanned. The check scans the generator's text and flags an image whose card text changed
  since the image was generated.

## Requirements *(mandatory)*

### Functional Requirements

**Registry**

- **FR-001**: The project MUST have one registry of published result claims. Each claim
  has:
  - a stable id;
  - its value(s), with spread where one exists, read from the thesis data file or
    computed from it;
  - its unit;
  - its required qualifier(s);
  - its evidence reference (thesis table or page, or the public artifact);
  - a status: current, or retired with a reason.
- **FR-002**: Derived figures MUST be computed from the data file, never stored as
  separate literals. This covers the +6.5 pp gain and the external-benchmark mean, for
  example.
- **FR-003**: The registry MUST cover every result figure the site publishes today:
  - the thesis headline and baseline;
  - the gain;
  - the seed-42 within-CIFAR run;
  - the external benchmark range and mean;
  - the K-ablation and λ-sweep figures that pages quote;
  - the inkjet baseline.

  It MUST also cover the figures already retired: 80.25%, +18.8 pp and "18.8 percentage".
  The production 98.4% figure is also retired: it has no public artifact, and it is
  absent from the site today (decided 2026-11-27).
- **FR-004**: The registry MUST provide each claim's display form in each of the five
  languages. The form uses that language's decimal mark and spacing and includes the
  required qualifier text. Today's on-site wording is the reference.
- **FR-005**: Asking for a retired claim's display form MUST fail the build.

**Check**

- **FR-006**: A figure check MUST run as part of the existing export verification and
  as a unit test. It scans:
  - the translation maps and page copy under `src/`, in all five languages;
  - structured data;
  - `public/llms.txt` and `public/llms-full.txt`;
  - the OG image generator's text;
  - Genie's prepared replies, knowledge and system prompt;
  - `README.md` and the README hero images under `.github/readme/`;
  - the built HTML and JavaScript in the static export.

  It does not scan specs, tests, documentation drafts, manuscripts or PDFs.
- **FR-007**: The check MUST fail when a scanned text contains any of the following, and
  report the file, language, figure and rule:
  - a figure that looks like a result and is neither a registered value nor on the
    non-result list;
  - a registered mean without its spread;
  - a registered claim without its required qualifier nearby (same sentence, table row
    or card);
  - a retired figure.
- **FR-008**: The three retired-metric entries of today's export deny-list MUST move into
  the registry as retired claims, with the same failure. The deny-list's token and
  analytics entries MUST stay where they are.
- **FR-009**: The existing Genie claims test MUST read its backed values, spreads and
  qualifiers from the registry instead of its own copy of the rules. It MUST keep
  passing with the same coverage: five languages, prepared replies, knowledge and system
  prompt.

**Migration**

- **FR-010**: These headline surfaces MUST render registered figures from the registry
  instead of typing them in:
  - hero;
  - evidence;
  - research;
  - experience;
  - the two OOD case studies;
  - project cards;
  - structured data;
  - the OG image generator;
  - Genie's prepared replies and knowledge.

  Long-form prose, meaning blog posts and their metadata (about 100 occurrences), stays
  as typed text. The check (FR-006/FR-007) verifies it, and it does not move to registry
  output (decided 2026-11-27).
- **FR-011**: The migration MUST NOT change any visible wording, figure, qualifier or
  layout. A before/after text comparison of the five-language pages shows no difference
  except deliberate fixes, and each such fix is listed in the PR.
- **FR-012**: OG images whose generator text changes MUST be regenerated in the same
  change, and the check MUST flag an image whose card text changed since it was generated.

**Later (blocked)**

- **FR-013**: Once spec 007 publishes Genie's prompt as a site file, that file's figures
  MUST be generated from the registry. Until then this requirement is out of scope for
  delivery, and FR-006 covers Genie.

### Key Entities

- **Claim**: one published result. It has:
  - an id;
  - value(s) and spread;
  - a unit (%, AUROC on a 0–1 scale, pp);
  - its source in the data file, or how it is computed from that file;
  - required qualifiers;
  - an evidence reference;
  - a status (current or retired, with a reason).
- **Display form**: how a claim reads in one language: decimal mark, spacing, qualifier
  wording, and optional short and long variants.
- **Non-result entry**: a number that looks like a figure but is not a result, plus its
  reason and where it appears. The list is reviewed in PRs.
- **Finding**: one check failure: file, language, figure, rule broken, and a suggested
  fix.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: One wrong figure is planted in each of the five languages and in each
  scanned surface. The check catches 100% of them and names the file and language for
  each.
- **SC-002**: On the current site after migration, the check passes. No result figure
  is excused other than through the reviewed non-result list, and that list is no
  longer than 25 entries, each with a reason. The baseline of findings recorded when the
  check landed is empty.
- **SC-003**: Changing one registered value updates 100% of the headline surfaces in all
  five languages, with no other source edit.
- **SC-004**: Typed-in copies of registered figures on the FR-010 surfaces fall from
  today's count (measured at the start of implementation) to zero.
- **SC-005**: The migration shows no visible change. The five-language text comparison
  in FR-011 shows zero unintended differences.
- **SC-006**: The check adds no more than 5 seconds to the existing build-and-verify
  run.
- **SC-007**: The Genie claims test keeps 100% of its current cases passing after it
  switches to the registry.

## Assumptions

- The thesis data file (`src/lib/ood-explorer-data.ts`) stays the single source of
  thesis results. The registry reads from it and does not replace it.
- Specs 001 and 002 and the constitution's Claim Integrity Standards are the adjudicated
  values and qualifiers. This spec adds no new figures.
- The static export contains only the default (English) language as HTML. The other four
  languages exist in source translation maps and JavaScript bundles. So the five-language
  guarantee is met by scanning the source maps, and the export scan is a second net.
- The CV PDF and the thesis PDF are out of scope. They are maintained by hand under spec
  002, and PDFs are not text-scanned.
- `README.md` and the README hero images are in scope. They are public on GitHub and
  repeat the headline figures.
- Qualifier phrasings per language are the ones the Genie test accepts today (for
  example "drei Läufe" or "3-Seed" in German). New phrasings are added to the registry,
  not to the check.
- A figure counts as "near" its qualifier if both sit in the same sentence, list item,
  table row or card.
- Regenerating OG images stays a manual step. The check makes stale images visible; it
  does not regenerate them.
- Work is delivered as separate PRs into `main`: User Story 1 first, then Stories 2–3.
  User Story 4 waits for spec 007.
- Retiring 98.4% makes the constitution's Claim Integrity Standards line about it
  out of date. The User Story 1 PR amends that line to "retired", following the
  constitution's amendment rule.

## Clarifications

### Session 2026-11-27

- Q: Do blog posts stay as typed text that the check verifies, or also move to registry
  output? → A: Check only. Blog text stays as written and the check verifies it.
- Q: What is the status of the production 98.4% figure? → A: Retired. The check fails if
  it reappears.
- Q: May short copy use a rounded form of a result? → A: No. Full precision as
  registered, with spread where one exists.
- Q: Titles that state the headline result as a bare mean (research R11)? → A: Option (a).
  Titles carry the spread and a short 3-seed qualifier, for example
  "… 99.03% ± 0.07% AUROC (3-seed mean) …", in all five languages. Applies to the blog
  post title and description, the diffusion case-study `title`, description, OpenGraph
  and Twitter fields, and the titles quoted in `llms*.txt`, the README and Genie
  knowledge (T040).
