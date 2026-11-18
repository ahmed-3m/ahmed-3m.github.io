# RFC 215 implementation coverage

Date: 2026-11-18
Base: ebd8765cd5a2dd34c83c8b9d91dd96adc6e2c163 (current main when branch created).

## Reconciliation
The starting workspace was 42 commits behind main. This change preserves the newer main implementation, including removal of the Faultrix case-study route and public project card. It does not restore that retired project. The RFC's provisional Faultrix presentation is superseded by that existing removal. No unrelated news catalog/homepage changes or dependency changes are included.

## Phase 0: baseline and reproduction
- Read installed Next.js static-export documentation and project guidance.
- Inspected current main and compared all intervening file changes.
- Navigation visibility concern dismissed: installed Tailwind preflight uses display:none !important for hidden elements.
- Browser checked local homepage at desktop and requested 375px viewport (browser reported 360px content width), English/Arabic, dark/light; focused mobile menu open/close and Escape, language selection and focus restoration.
- Visually checked narrow education cards and Sihem case-study layout. No console errors captured in sampled checks.
- A full historical performance baseline was not captured before edits. A performance-regression comparison cannot honestly be marked complete.

## Phase 1: positioning and claims
- Added plain-language introduction in all five locales while preserving upstream CV/research emphasis.
- Replaced ambiguous 4+ years with MSc credential.
- Kept location, availability, CV and contact paths.
- Preserved upstream explicit research/side-project/employment distinctions; renamed experience heading in all locales.
- Preserved upstream uncertainty/scope and reconciled baseline 92.52 ± 11.07 and result 99.03 ± 0.07 against ood-explorer-data.
- Changed live-data label to recorded results in all locales.
- Scoped mergeproof project, chatbot prompt and schema claims to configured deterministic checks.
- Preserved upstream removal of unsupported Faultrix claims rather than restoring stale local metadata or routes.
- Removed section numbering instead of retaining out-of-order labels.

## Phase 2: information hierarchy
- Projects precede the longer background/skills section.
- Three selected projects: DiffusionOOD, InkjetOOD, Sihem. Preserve upstream research-first selection.
- Additional projects grouped in a native expandable details section.
- Shortened Sihem explanation and disclosed invitation-only beta.
- Retained evidence actions and mechatronics-to-AI background.
- Actual recruiter/nontechnical user walkthroughs are not performed; audience interpretation remains an assessment.

## Phase 3: case-study evidence
- Added multilingual design-choice/limitation sections for all three featured projects.
- Explain conditional reconstruction versus classifier confidence, repeated-score compute tradeoff, five-fold evaluation versus one split, industrial transfer limits, deterministic scheduling versus delegating every decision to an LLM, and provider-routing complexity.
- These compare alternatives; they do not fabricate a history of rejected alternatives.
- Corrected Sihem claim that deterministic scheduling prevents hallucinations; generated text still needs validation.
- Existing thesis, reports, repositories and research figures remain inspectable evidence.
- No invented product outcomes, user counts, latency measurements or traction.
- Full external-link validation and a publication-ready product walkthrough remain open.

## Phase 4: accessibility and usability
- Essential reveal content visible by default without hydration/observer success.
- Language selector uses normal pressed buttons and tab order rather than incomplete menu semantics; Escape/selection returns focus.
- Translated selector accessible name and theme tooltip.
- Logical list indentation on case studies.
- Mobile metric cards stack; scientific numbers explicitly LTR in Arabic.
- Education-date wrapping retained.
- Analytics consent defaults initialized synchronously in head before measurement configuration, using Google's documented consent-default command.
- Full automated contrast audit, reduced-motion/no-JS browser matrix, and exhaustive focus/touch-target coverage remain open.

## Phase 5: checks and release
- **Pre-merge review follow-up (2026-11-18):**
  - Reconciled Sihem invitation-only beta disclosure across `Evidence.tsx`, `Projects.tsx`, `Experience.tsx`, `src/lib/case-studies.ts`, `ChatBotPanel.tsx` (`SYSTEM_PROMPT` and all 5-locale `LOCAL_REPLIES`), `JsonLd.tsx`, and `public/llms.txt` / `public/llms-full.txt` (preserving `main`'s Faultrix removal and Karunya/Ledzone/0.8673 entries).
  - Updated `JsonLd.tsx` and `llms*.txt` `mergeproof` descriptions to reflect scoped deterministic checks.
  - Replaced physical `border-right` in stacked mobile stats with logical `border-inline-end: 0` (widened stacking threshold from 480px to 600px with `minmax(0, 1fr)`), removed duplicate mobile `.cd-edu-*` rules, added RTL back-arrow flip on `CaseStudyPage.tsx`, and fixed Arabic RTL bidi isolation/arrow orientation in `Hero.tsx`, `Evidence.tsx`, and `OodDemo.tsx`.
  - Fixed header link ordering (`Projects` before `About` matching homepage order), added outside-click menu dismissal in `Header.tsx`, moved inline mobile-panel styles into `globals.css`, collapsed desktop nav cleanly at `<= 960px` to prevent tablet crowding, and added bottom clearance on `.cd-footer` above the floating `Ask Genie` button.
- **Verification after final edits:**
  - `npm run typecheck`: passed.
  - `npm run build` (`npx npm@11.19.1 ci` lockfile install): passed static export of all 15 routes (`out/`); transient generated `src/lib/news-homepage.json` discarded cleanly.
  - `node .github/news/news-selftest.mjs` (200 items) and `node worker/chat-proxy.selftest.mjs`: passed.
  - `npm run lint` on unmodified branch currently fails on GitHub `main`'s `typescript@^7` (`7.0.2`) dependency (`Error: typescript-eslint does not support TS 7.0.`); resolved in separate PR #221 (`fix/typescript-eslint-compat`, pinning `typescript@^6.0.3`). Running this branch's `eslint src` against `typescript@6.0.3` produces 0 errors and the 9 pre-existing `@next/next/no-img-element` warnings.
  - Browser check (`http://localhost:3000/` at the fixed `862x790` host webview viewport, plus `/case-studies/sihem/` and `/case-studies/diffusion-ood/`): 0 HUD console errors across English & Arabic (`dir="rtl"`), dark & light themes; verified hamburger menu Escape/outside-click close, `<details>` toggle, RTL arrows/bidi fixes, and footer FAB clearance. Viewport resize (`375px` mobile and `> 960px` desktop) timed out on the host webview runner and could not be interactively resized in that session.
- **Pending release gates:**
  - Merge PR #221 (`fix/typescript-eslint-compat`) into `main` (and rebase/re-run PR #218 CI) so GitHub `quality` + `build` lanes pass cleanly without polluting PR #218 with dependency changes.
  - Owner merge and post-merge deployment verification remain pending.

## Completion rule
This report does not mark RFC 215 fully complete. Keep the RFC open until remaining evidence, exhaustive browser/performance checks, successful CI and owner-reviewed deployment verification are recorded.
