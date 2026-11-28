# RFC 215 implementation coverage

Update 2026-11-26: PR #286 removed Google Analytics and added GoatCounter behind the repository variable `NEXT_PUBLIC_GOATCOUNTER_CODE`; the three Google Analytics lines below describe the state before that change.

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
- Analytics consent defaults initialized synchronously in head before measurement configuration, using Google's documented consent-default command. (superseded, see the note at the top)
- Full automated contrast audit, reduced-motion/no-JS browser matrix, and exhaustive focus/touch-target coverage remain open.

## Phase 5: checks and release
- **Pre-merge review follow-up (2026-11-18):**
  - Reconciled Sihem invitation-only beta disclosure across `Evidence.tsx`, `Projects.tsx`, `Experience.tsx`, `src/lib/case-studies.ts`, `ChatBotPanel.tsx` (`SYSTEM_PROMPT` and all 5-locale `LOCAL_REPLIES`), `JsonLd.tsx`, and `public/llms.txt` / `public/llms-full.txt` (preserving `main`'s Faultrix removal and Karunya/Ledzone/0.8673 entries).
  - Updated `JsonLd.tsx` and `llms*.txt` `mergeproof` descriptions to reflect scoped deterministic checks.
  - Replaced physical `border-right` in stacked mobile stats with logical `border-inline-end: 0` (widened stacking threshold from 480px to 600px with `minmax(0, 1fr)`), removed duplicate mobile `.cd-edu-*` rules, added RTL back-arrow flip on `CaseStudyPage.tsx`, and fixed Arabic RTL bidi isolation/arrow orientation in `Hero.tsx`, `Evidence.tsx`, and `OodDemo.tsx`.
  - Fixed header link ordering (`Projects` before `About` matching homepage order), added outside-click menu dismissal in `Header.tsx`, moved inline mobile-panel styles into `globals.css`, collapsed desktop nav cleanly at `<= 960px` to prevent tablet crowding, and added bottom clearance on `.cd-footer` above the floating `Ask Genie` button.
  - Cross-mobile-browser pass: added `-webkit-text-size-adjust: 100%` / `overflow-x: clip` / `touch-action: manipulation` / `-webkit-backdrop-filter` / `100dvh` scrollable mobile menu & compact `<= 480px` rules in `globals.css`; prevented iOS Safari focus zoom on `ChatBotPanel.tsx` (`16px` input up to `md`) and converted `ChatBot.tsx` drawer/FAB to `100dvh`, `env(safe-area-inset-bottom)`, logical `end-*`, touch-safe circular collapsed orb, and hover gating; clamped responsive `minmax(min(100%, Npx), 1fr)` grids and button wrapping in `OodDemo.tsx`, `Research.tsx`, `TrustStrip.tsx`, and `CaseStudyPage.tsx`; added logical `ps-6` list indent and RTL arrow flips in `BlogPostClient.tsx`, `BlogPageClient.tsx`, `NewsPageClient.tsx`, and `News.tsx`.
- **Verification after final edits:**
  - `npm run typecheck`: passed.
  - `npm run build` (`npx npm@11.19.1 ci` lockfile install): passed static export of all 15 routes (`out/`); transient generated `src/lib/news-homepage.json` discarded cleanly.
  - `node .github/news/news-selftest.mjs` (200 items) and `node worker/chat-proxy.selftest.mjs`: passed.
  - `npm run lint` on unmodified branch currently fails on GitHub `main`'s `typescript@^7` (`7.0.2`) dependency (`Error: typescript-eslint does not support TS 7.0.`); resolved in separate PR #221 (`fix/typescript-eslint-compat`, pinning `typescript@^6.0.3`). Running this branch's `eslint src` against `typescript@6.0.3` produces 0 errors and the 9 pre-existing `@next/next/no-img-element` warnings.
  - Browser & multi-viewport mobile checks:
    - Host webview (`862x790`, `next dev`): 0 HUD console errors across `/`, `/case-studies/sihem/`, `/case-studies/diffusion-ood/` in English & Arabic RTL, dark & light themes.
    - Playwright audit against the exported static `out/` across 10 profiles (`320x568` iOS Safari UA, `360x780` Samsung Browser UA, `375x812` iOS & Firefox Mobile UAs, `390x844` Edge iOS UA, `412x915` Chrome Pixel 7 UA, `667x375` mobile landscape, `768x1024` tablet, `960x790`, `1280x800`) on Chromium, Edge, and Chrome across English/Arabic and dark/light themes (covering `/`, case studies, `/news/`, `/blog/`, `/blog/ood-diffusion-thesis/`): 0 horizontal overflows (`scrollWidth <= clientWidth`), 0 bounding-rect clipping offenders, 0 nav collisions, `inputFontSize >= 16px` across `< 768px` including landscape, scrollable landscape menu, Escape/outside-tap close, `<details>` toggle, and OodDemo 3-tab layout checks. (Note: downloading separate Playwright WebKit/Firefox binaries timed out on `cdn.playwright.dev`, so native Safari WebKit and Gecko engines remain untested directly; Next.js 16.4.3's known static-export RSC prefetch `.txt` 404 pattern is tracked separately by Dependabot PR #219.)
- **Pending release gates:**
  - Merge PR #221 (`fix/typescript-eslint-compat`) into `main` (and rebase/re-run PR #218 CI) so GitHub `quality` + `build` lanes pass cleanly without polluting PR #218 with dependency changes.
  - Owner merge and post-merge deployment verification remain pending.

## Completion rule
This report does not mark RFC 215 (not in this repository) fully complete. Keep the RFC open until remaining evidence, exhaustive browser/performance checks, successful CI and owner-reviewed deployment verification are recorded.

## Follow-up to the deployed review

The implementation PR and TypeScript compatibility fix merged, and the latest
Pages run on f3f3fe3 passed quality, build and deployment. The live homepage,
public CV, three featured case studies and checked research PDFs responded.
The follow-up branch fixes the outstanding navigation, Arabic URL, translated
mergeproof caveat, case-study dates and Sihem evidence-link findings.

The next PR revision aligns the three-run mean across all five locales, adds
benchmark scope beside the scores, shortens the skills list and localizes
education dates and chart tooltips. The language menu now dismisses when focus
leaves it. The homepage explorer link targets a static anchor so it works
before hydration. The Sihem case study includes an illustrative workflow based
on the documented beta, which visitors can read without signing in.

Local validation passed: lint (nine existing image warnings), typecheck, static
export (15 routes), and the news and chat-proxy self-tests. The exported homepage
and three case studies passed 63 internal link and anchor checks. Of 17 external
targets checked, 16 returned HTTP 200. LinkedIn returned HTTP 999 to the audit
client, so its destination remains unverified. The live homepage source had no
Google Analytics consent or tag markup in this check. (superseded, see the note at the top)

Against the f3f3fe3 production export, the revised homepage references the
same 13 initial JS/CSS assets by count. Gzipping each file locally gives
516,383 → 516,687 bytes for those assets and 20,910 → 20,875 bytes for HTML.
The combined increase is 269 bytes (about 0.05%). This excludes fonts, images,
and dynamically loaded chunks.

Remaining acceptance work:

- [ ] Measure pre/post page performance under matching browser, viewport,
  cache and throttling conditions. Static build sizes do not measure loading speed.
- [ ] Run a browser check of the revised build across English and Arabic, mobile
  and desktop, and both themes. Include keyboard focus, contrast, touch targets,
  reduced motion and JavaScript disabled, and native WebKit and Firefox where
  available. Local Chromium could not start because the sandbox blocks its socket.
- [ ] Verify the LinkedIn link in an ordinary browser. Verify consent behavior if
  Google Analytics is enabled in another deployment. (superseded, see the note at the top)
- [ ] Run walkthroughs with actual recruiters and nontechnical visitors.
- [ ] Add a screenshot or recorded beta walkthrough when a publishable capture is
  available. The existing public example is illustrative.
- [ ] Verify the final deployed build and key flows after the follow-up merges.

Faultrix remains retired per PR #205. This is a deviation from the original RFC
proposal to feature it under additional work.
