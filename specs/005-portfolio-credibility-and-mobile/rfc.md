# RFC 005 — Portfolio credibility, recruiter clarity, and mobile usability

**Status:** Proposed; implementation has not started.  
**Date:** 2026-11-12  
**Owner:** Ahmed Mohammed  
**Implementation handoff:** Antigravity app; the owner selects the model. No external model session is running on behalf of this RFC.  
**Review:** Codex reviews the final diff and validation evidence before owner merge.  
**Starting point:** `main` at `00d71807f6025764f70cb00ed6392c129372a51d`. Recheck current files before implementing.

## Problem and outcome

Recruiters encounter repeated benchmark claims, unclear work-location wording, mobile overflow risks, expensive explanatory images, and contact actions hidden until a JavaScript reveal. A project the owner intends to stop promoting remains on visible and machine-readable surfaces.

Make the portfolio easier to understand and use while keeping its evidence accurate. Lead with computer vision, industrial ML, and diffusion research; retain shipped LLM products and agent tooling as complementary strengths. Preserve the current visual identity, static export, five languages, and research artifacts.

This RFC captures a source review and the supplied Grok review. It is a proposal, not an implementation or a performance-test report.

## Evidence and uncertainty

| Finding | Evidence at review | Required response |
| --- | --- | --- |
| Faultrix remains promoted | Layout metadata/noscript, About, Projects, Evidence, case-study/blog content, footer, chatbot, JSON-LD, and `public/llms*.txt` | Remove from active public portfolio surfaces; audit generated outputs too |
| PROFACTOR location is ambiguous | `src/components/Experience.tsx` contains “Linz / Steyr” | State remote/home office explicitly; preserve the accurate affiliation and role |
| Education date cannot shrink or wrap | `.cd-edu-date` has `white-space: nowrap` and `flex-shrink: 0` | Fix at the component/container level and measure document overflow |
| Three explanation PNGs are expensive | `separation-denoise-clean.png`: 1,622,462 B; `separation-apart-clean.png`: 1,236,879 B; `separation-gap-clean.png`: 1,356,712 B; total 4,216,053 B | Supply lightweight previews and defer original/full-resolution loading |
| Research images are eager | `Research.tsx` image markup lacks native lazy loading | Add appropriate loading/decoding and stable image dimensions |
| Contact depends on reveal | Contact heading, links, CV, and email use `.reveal`, whose default opacity is zero | Essential actions must be visible without waiting for JavaScript or scrolling |
| A CV button already exists | `Contact.tsx` renders `RequestCvButton` | Preserve the existing download and make it clearly visible |
| Contrast needs correction | CSS pairs: light primary button approximately 3.17:1; dark muted text on base background approximately 2.64:1 | Verify actual rendered backgrounds and correct both themes |
| Statistics label is wrong | Research calls ±0.07 “variance”; `CIFAR_LAMBDA_SWEEP` defines standard deviation | Correct terminology in every affected locale |
| Notebook link is broken | `https://github.com/ahmed-3m/zer0p_notebooks` returned 404 | Remove it or replace it with a verified public artifact |
| Operational accuracy needs consistent qualification | 98.4% appears in chatbot fallbacks, blog FAQs, JSON-LD, and AI-recall files | Reconcile against existing claim policy; do not equate accuracy and AUROC |

The supplied 16-second responsiveness claim, 92/97 Lighthouse scores, 5.4 MB page total, actual share-image dimensions/cropping, and caption overflow were **not independently reproduced**. Treat them as investigation items. Do not publish them as measurements from this RFC.

## Scope and implementation order

### 1. Content and claim integrity

- Remove Faultrix promotion from active components, metadata/keywords, noscript content, blog content and metadata, case-study routes/catalogs, footer, evidence links, structured data/FAQs, chatbot system facts, suggestions, keyword routing, local replies, feeds, sitemaps, and served `llms*.txt`. Preserve unrelated projects and the preferred Gmail contact address.
- Search case-insensitively for the project name and domain. Historical specs, this RFC, and Git history are allowed to retain them. Do not purge history or delete useful agent documentation.
- Remove the retired project routes from generated navigation/feed/sitemap discovery. Default to a deliberate 404 for removed routes on GitHub Pages; verify no stale exported HTML remains after a clean build. Do not require a server-side redirect.
- Change the PROFACTOR location display to explicitly include remote/home office. Do not infer employment duration or rewrite the role title from location alone.
- Reconcile 98.4% using `specs/002-cv-claim-reconciliation/` and the constitution. It is not verified in the thesis, but existing policy permits an explicitly labeled internal, threshold-dependent operational metric. Retain only with a clear separate evaluation scope and appropriate support; otherwise omit it from active claims. Do not invent a source or silently replace it with an unrelated metric.
- Correct “variance” to standard deviation where that is what the data reports.

### 2. Mobile layout, contact, and accessibility

- Fix education header/date wrapping and grid/flex minimum-size constraints. Check the whole document; do not hide the defect using global horizontal clipping.
- Keep contact heading, email, CV download, and meeting link visible by default. Reveal effects may enhance nonessential content. Preserve keyboard operation, visible focus, reduced-motion support, and functional links without JavaScript.
- Fix research caption wrapping/card sizing where reproduced. Scope any intentional chart/table scrolling to its own container.
- Correct text/button contrast in dark and light themes, including hover/focus states. Target at least 4.5:1 for normal text and 3:1 for large text. Use existing theme tokens and check affected consumers.
- Use logical CSS properties and check Arabic RTL, especially the menu, dates, chart labels, and contact controls.

### 3. Research image delivery and explanation

- Add native lazy loading and asynchronous decoding to below-the-fold images where appropriate; reserve intrinsic dimensions/aspect ratios.
- Replace the three multi-megabyte previews with appropriately sized WebP/AVIF or precise SVG diagrams. Proposed combined preview budget: **250 KB or less**. This is an acceptance budget, not an observed result.
- Load full-resolution images only when the lightbox opens. Keep useful original research artifacts available without requesting them during the initial page load.
- Explain the signed reconstruction-error score using the actual implementation/artifacts: identify both error terms, subtraction order, class conditions, threshold direction, and meaning of a higher score. Distinguish prediction-separation training loss from the inference score.
- Do not invert a graphic based only on “large gap = outlier.” If the sign convention cannot be verified, use a neutral diagram that makes no directional claim and record the unresolved question.
- Rebuild precise scientific diagrams from verified data or vector primitives. Do not fabricate curves, values, or model outputs.

### 4. Recruiter messaging and share cards

- Put computer vision, industrial ML, diffusion/OOD research, and the thesis graded 1 near the top. Keep Sihem and agent tooling as supporting proof.
- Reduce repeated metrics without stripping qualifications from the occurrences that remain. Projects explain what was built; evidence links to artifacts; research explains contribution, limitations, and transfer results.
- Inspect actual PNG dimensions and current metadata before changing assets. Make the homepage and retained blog share cards genuinely 1200 × 630, with matching descriptors, safe text margins, and clear professional typography. Match the existing Sihem/Inkjet card system and verify route-specific Open Graph and Twitter references.
- Audit which image each retained post uses; do not assume every post has a distinct preview or recreate a card for the removed project.
- Work authorization is an owner-confirmation item. Do not assert approved status, unrestricted work rights, or employer conditions from the pasted review. Once the owner confirms exact wording, synchronize visible content and chatbot facts. This does not block the independent fixes above.

## Research invariants and exclusions

Use `src/lib/ood-explorer-data.ts` as the numerical source of truth and read the current Next.js guides under `node_modules/next/dist/docs/` before code changes.

| Claim | Scope that must remain clear |
| --- | --- |
| 99.03% ± 0.07% AUROC | Three-seed mean, λ=0.02, within-CIFAR airplane-vs-rest binary split; ± is standard deviation |
| 92.52% ± 11.07%; +6.5 percentage points | Non-separated three-seed baseline and corresponding mean gain |
| 98.98% AUROC | Separate seed-42 raw-score run; not the three-seed mean |
| 0.8673 ± 0.0230 AUROC | Public FTI_Zer0P five-fold baseline; not production accuracy |
| Industrial separation-loss transfer | No statistically significant improvement after Holm correction |

Do not modify/rebuild `public/cv.pdf`, change thesis PDFs/checkpoints, fabricate metrics, add server-only image optimization to the static export, alter the news pipeline, rotate credentials, delete `CLAUDE.md`/`.specify/` merely because they are public, or perform a blanket inline-style rewrite. Refactor repeated styles only where directly useful to this work.

## Validation and acceptance

Antigravity must report actual results, commands, screenshots, and limitations. An unchecked item is not a pass.

- [ ] All five locales (en/de/fr/es/ar) have complete, natural translations for changed strings.
- [ ] Removed-project references are absent from active served source and generated HTML, metadata, JSON-LD, feeds, sitemaps, chatbot/local replies, and AI-recall files, with documented historical exceptions.
- [ ] Research values, aggregation labels, dates, and scope remain consistent; ±0.07 is labeled standard deviation.
- [ ] Remote/home-office wording is explicit; permit approval is not invented.
- [ ] At 375 px and desktop (for example 1440 px), English and Arabic pass in both themes. Record `scrollWidth` versus `clientWidth`; no unintended document overflow, clipped menu button, or overflowing captions.
- [ ] Email/CV/contact actions are visible and functional before reveal code; check with JavaScript disabled and with reduced motion.
- [ ] Contrast passes on actual rendered backgrounds; keyboard navigation and any lightbox focus/close behavior remain usable.
- [ ] The combined three explanation previews meet the proposed 250 KB budget; originals load only after opening the lightbox.
- [ ] Actual share-image dimensions are 1200 × 630; metadata and retained route references match; preview crops are inspected where tooling permits.
- [ ] Dead notebook link is removed/replaced with a verified public URL.
- [ ] Console has no new errors. Run `npm run lint`, `npm run typecheck`, `npm run build`, `node .github/news/news-selftest.mjs`, and `node worker/chat-proxy.selftest.mjs`.
- [ ] Run comparable before/after mobile Lighthouse checks (same route, settings, throttling; report run variation) and separate loading measurements from interaction responsiveness. Do not claim an improvement from asset-byte reduction alone.
- [ ] Document network/font/download blockers honestly. Required CI quality/build checks must pass before merge.

For this documentation-only RFC, implementation checks above are pending. Attaching a proposed checklist does not certify implementation readiness.

RFC authoring check: `npm run build` was attempted in the existing local checkout on 2026-11-12. It failed because the environment could not reach Google Fonts for Inter, JetBrains Mono, and Space Grotesk. No application-code change is part of this RFC commit; branch CI results must be reported separately.

## Antigravity handoff

1. Read `AGENTS.md`, the constitution, this RFC, and current claim-reconciliation documents. Recheck the target branch and current main; preserve owner changes.
2. Fetch and check out `rfc/005-portfolio-credibility-and-mobile` in an isolated worktree. Continue this draft PR with reviewable commits; do not commit to main or merge the RFC alone as a substitute for implementing it.
3. Implement the confirmed fixes in the order above. Record unresolved evidence/owner decisions without blocking unrelated work or inventing answers.
4. Validate and add a concise implementation report with changed files, claim decisions, asset dimensions/bytes, test results, screenshots, and remaining limitations. Update this PR title/body around the completed scope.
5. Leave the PR open and unmerged for Codex review and owner approval. Address review findings in further commits. Never merge, enable auto-merge, force-push shared history, or deploy manually.

The owner will hand this PR to Antigravity manually. This document does not indicate that a CLI delegation or model run has succeeded.
