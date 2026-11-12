# RFC 005 Implementation Report — Portfolio Credibility, Accuracy & Mobile Usability

- **RFC**: [`specs/005-portfolio-credibility-and-mobile/rfc.md`](./rfc.md)
- **Branch**: `rfc/005-portfolio-credibility-and-mobile`
- **Pull Request**: https://github.com/ahmed-3m/ahmed-3m.github.io/pull/205

## 1. Completed Scope by Priority

### Priority 1 — Faultrix Removal Across Active & Machine-Readable Surfaces
- **Retired routes & assets**:
  - Removed `src/app/case-studies/faultrix/page.tsx`.
  - Removed `public/og-faultrix.png` and `public/og-5-month-llm-adventure.png`.
  - Removed `'faultrix'` from `CaseStudy['slug']` and `caseStudies` in `src/lib/case-studies.ts`.
  - Removed `'5-month-llm-adventure'` from `src/lib/blog-posts-meta.ts` and `src/lib/blog-posts.ts`.
- **UI, Metadata, `<noscript>`, JSON-LD, Feeds, Sitemaps, and `llms*.txt`**:
  - Updated `src/app/layout.tsx`, `src/components/About.tsx`, `src/components/TrustStrip.tsx`, `src/components/Evidence.tsx`, `src/components/Footer.tsx`, `src/components/Hero.tsx`, `src/components/Projects.tsx`, `src/components/JsonLd.tsx`, `public/llms.txt`, `public/llms-full.txt`, and `tools/generate-og-images.mjs` to remove Faultrix references, `faultrix.com`, and construction-SaaS positioning.
  - Static export regenerated `/sitemap.xml`, `/sitemap-pages.xml` (10 URLs), and `/feed.xml` (3 blog posts) without retired Faultrix URLs.
- **Chatbot Prompts, Local Fallbacks & System Prompt**:
  - Removed `faultrix_*` and `product_story` prompt IDs, entries, local fallback replies, follow-up rules, and `SYSTEM_PROMPT` lines in `src/components/ChatBotPanel.tsx`.
- **Preserved history**:
  - Retained historical `specs/001-*`, `specs/002-*`, and git history untouched.

### Priority 2 — PROFACTOR Remote Clarification, Statistics Terminology, Links & `98.4%` Reconciliation
- **PROFACTOR remote/home-office clarification**:
  - Extended `ExperienceItem['company']` in `src/components/Experience.tsx` to support localized strings and added explicit remote/home-office wording across all 5 languages (`en`: `(Remote / Home Office)`, `de`: `(Remote / Homeoffice)`, `fr`: `(Télétravail / À distance)`, `es`: `(Remoto / Teletrabajo)`, `ar`: `(عن بُعد / العمل من المنزل)`), mirrored in `src/components/ChatBotPanel.tsx`, `public/llms.txt`, and `public/llms-full.txt`.
- **Standard deviation vs. variance terminology**:
  - Corrected `"variance"` / `"Varianz"` / `"varianza"` / `"تباين"` to standard deviation / fold spread (`std dev`, `Std.-Abw.`, `ecart-type`, `desv. est.`, `انحراف معياري`) across all 5 locales in `src/components/Research.tsx`, `src/lib/case-studies.ts`, `src/lib/blog-posts.ts`, `src/app/case-studies/diffusion-ood/page.tsx`, `src/components/JsonLd.tsx`, and `src/components/ChatBotPanel.tsx`.
- **Dead link removal**:
  - Removed the 404 link `https://github.com/ahmed-3m/zer0p_notebooks` from `src/components/Research.tsx`.
- **`98.4%` metric qualification**:
  - Reconciled all occurrences in `src/lib/blog-posts.ts`, `src/lib/blog-posts-meta.ts`, `src/components/JsonLd.tsx`, `src/components/ChatBotPanel.tsx`, `public/llms.txt`, and `public/llms-full.txt` so `98.4%` is explicitly scoped as an internal, threshold-dependent operational deployment metric and never equated with the public `0.8673 ± 0.0230` 5-fold CV AUROC on `FTI_Zer0P`.

### Priority 3 — Mobile 375px Layout, Contact Visibility, Contrast, RTL & Keyboard Accessibility
- **375px overflow & wrapping (`src/app/globals.css`)**:
  - Added `min-width: 0` on `.cd-education-card` and `.cd-edu-degree`; allowed `.cd-edu-header` (`flex-wrap: wrap`) and `.cd-edu-date` (`max-width: 100%; overflow-wrap: anywhere`) to wrap cleanly instead of overflowing at `375px`.
  - Removed `overflow-x: hidden` from `body` so horizontal layout integrity is enforced genuinely rather than masked.
  - Wrapped `.cd-hero-title span` on viewports `<= 768px`, added `min-width: 0` and logical alignment to `.cd-proj-actions`, and added `overflow-wrap: anywhere` on `.cd-rf-chart-caption`, `.cd-lightbox-caption`, and `.cd-contact-email`.
- **Contact visibility without JavaScript/scroll**:
  - Removed `.reveal` classes from Contact heading, subtitle, links, and email in `src/components/Contact.tsx`.
  - Added `<style>.reveal { opacity: 1 !important; transform: none !important; animation: none !important; }</style>` and direct `/cv.pdf` fallback inside `<noscript>` in `src/app/layout.tsx`.
  - Confirmed `prefers-reduced-motion: reduce` keeps all `.reveal` elements visible (`opacity: 1`).
- **Dark & Light theme contrast**:
  - Updated dark tokens (`--cd-fg2: #a8b2c4`, `--cd-fg3: #94a3b8`, `--cd-danger: #f87171`) and light tokens (`--cd-accent: #006680`, `--cd-accent-h: #004f63`, `--cd-fg2: #475365`, `--cd-fg3: #645546`, `--cd-success: #006b45`, `--cd-warn: #8c4d00`, `--cd-danger: #b91c1c`) in `src/app/globals.css`.
  - Set `#fff8ee` foreground text on `.cd-nav-cta`, `.cd-btn-primary`, `.cd-rfc-step`, and `.cd-bt-new` in `[data-theme="light"]`, removed contrast-degrading `opacity` styles on `.cd-wc-tag`, `NewsPageClient.tsx`, and `Research.tsx` footer links, and replaced hardcoded colors/undefined vars in `src/components/OodDemo.tsx` with theme tokens (`--cd-success`, `--cd-warn`, `--cd-danger`, `--cd-b0`, `--cd-surf`, `--cd-fg1`).
- **Arabic RTL & keyboard focus**:
  - Replaced directional CSS rules (`margin-left`, `padding-left`, `border-left`, `border-right`, `text-align: left/right`, `right`) with CSS logical properties (`margin-inline-*`, `padding-inline-*`, `border-inline-*`, `text-align: start/end`, `inset-inline-end`).
  - Added `direction: ltr; unicode-bidi: isolate` to `.cd-nav-logo` and `.cd-footer-brand` so `Ahmed.` preserves trailing dot placement in Arabic RTL.
  - Restored 2px `:focus-visible` outlines on `.cd-evidence-card` and `.cd-rfc-visual-button`, and added window-level `Escape` key closing with trigger focus restoration in `src/components/Research.tsx`.

### Priority 4 — Research Previews & Verified Score Convention
- **Verified thesis score convention**:
  - Confirmed in `public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf` (Eq. 3.3, pp. 44–45, 57–59) and `src/lib/ood-explorer-data.ts` that `s_OOD(x) = ê₀(x) - ê₁(x)` with `c=0` (`normal`/`airplane`) and `c=1` (`other`/`rest`). ID samples yield lower `ê₀` than `ê₁` (negative score); OOD samples yield higher `ê₀` than `ê₁` (`s_OOD(x) >= τ` predicts OOD, `τ = 0.000612` at 95% TPR on CIFAR-10 seed-42).
- **Accurate Step 3 graphic & lightweight previews**:
  - Generated `public/research/separation-gap-score.png` (`1672×941`, `67,830` bytes) replacing the inaccurate direction in the prior Step 3 asset (`separation-gap-clean.png` retained untouched in `public/research/`).
  - Generated `800×450` WebP inline previews (`separation-denoise-preview.webp` `27,286` B, `separation-apart-preview.webp` `15,368` B, `separation-gap-preview.webp` `28,452` B; `71,106` bytes combined vs. `4.22 MB` original inline PNGs).
  - Updated `src/components/Research.tsx` with `loading="lazy"`, `decoding="async"`, explicit intrinsic `width`/`height`, inline `previewSrc` tiles, full-resolution lightbox `src` loaded only on click, and updated 5-locale copy for `plainIdea`, `step1Text`, `step2Text`, `step3`, `step3Text`, and `sepLoss`.

### Priority 5 — Recruiter Positioning & `1200×630` Share Cards
- **Recruiter positioning**:
  - Updated `Hero.tsx`, `TrustStrip.tsx`, `Projects.tsx`, `About.tsx`, `layout.tsx`, and `JsonLd.tsx` to foreground Computer Vision, Industrial ML, Diffusion OOD Research, and M.Sc. thesis graded 1, while retaining Sihem and `mergeproof` as supporting engineering proof and keeping full scope qualifiers (`99.03% ± 0.07%` 3-seed mean, `98.98%` seed-42, `0.8673 ± 0.0230` 5-fold CV, `92.52% ± 11.07%` baseline).
- **Share card rebuild (`tools/generate-og-images.mjs`)**:
  - Fixed off-canvas right `signalBars` coordinates and added dynamic title scaling/pill clamping so all elements render cleanly within `1200×630`.
  - Generated `1200×630` PNG share cards for all 7 active metadata routes:
    - `public/og-image.png` (`60,227` B)
    - `public/og-diffusion-ood.png` (`64,503` B)
    - `public/og-inkjet-ood.png` (`62,936` B)
    - `public/og-sihem.png` (`58,394` B)
    - `public/og-news.png` (`58,788` B)
    - `public/og-diffusion-models-anomaly-detection.png` (`64,207` B)
    - `public/og-computer-vision-yolo-mastery.png` (`62,792` B)

## 2. Verification & Validation Results

### Repository & Build Gates
- `npm run build` (`prebuild` + Next.js static export + `postbuild`): **PASSED** (15 static pages, `out/sitemap-pages.xml` with 10 URLs).
- `npm run typecheck` (`tsc --noEmit`): **PASSED** (0 errors).
- `npm run lint` (`eslint src`): **PASSED** (0 errors; 9 pre-existing `@next/next/no-img-element` warnings in `About.tsx` and `Research.tsx`).
- `node .github/news/news-selftest.mjs`: **PASSED** (200 news items parsed, all self-tests passed).
- `node worker/chat-proxy.selftest.mjs`: **PASSED** (all worker proxy self-tests passed).
- Static export verification (`out/`): **0 matches** for `faultrix`, `zer0p_notebooks`, or `5-month-llm-adventure` across `.html`, `.xml`, `.txt`, `.json`, and `.js`; `out/case-studies/faultrix` and `out/blog/5-month-llm-adventure` absent.

### Headless Chrome CDP Matrix (`out/` over `127.0.0.1:4174`)
- Viewports & states checked: `1440-en-dark`, `1440-ar-light`, `375-en-dark`, `375-en-light`, `375-ar-dark`, `375-ar-light`:
  - `overflowX: false` (`scrollWidth === clientWidth`) and `overflowCount: 0` across all 6 configurations.
  - Mobile menu button visible without clipping (`375-en-*`: `left: 311, right: 355, width: 44`; `375-ar-*`: `left: 20, right: 64, width: 44`).
- Lazy image & lightbox behavior:
  - Initial load requested only `/headshot.jpg` and `/icon.svg`.
  - Scrolling to `#research` requested only the 3 `.webp` previews (`71,106` B total) and CIFAR charts; **0** full-resolution formula PNGs loaded prior to interaction.
  - Clicking Step 3 opened `.cd-lightbox-inner` and loaded `/research/separation-gap-score.png` (`1672×941`, `67,830` B); pressing `Escape` closed the lightbox and returned focus to `.cd-rfc-visual-button`.
- Reduced motion (`prefers-reduced-motion: reduce`): `hiddenCount: 0` across all 35 `.reveal` elements.
- No-JS (`setScriptExecutionDisabled(true)`): Contact section and all 8 Contact links rendered with `opacity: 1` (`hiddenLinkCount: 0`) and `<noscript>` `.reveal` fallback stylesheet present.
- Console / runtime errors: **0**.
- Visual inspection of screenshots verified crisp dark/light contrast, desktop & 375px hero wrapping, Arabic RTL timeline alignment & `Ahmed.` brand isolation, and the Step 3 lightbox diagram.

### Mobile Lighthouse Comparison (Comparable Runs on `http://127.0.0.1:4173/`)

| Metric / Audit | Before (Baseline) | After RFC 005 |
| --- | --- | --- |
| Performance | 67 | 99 |
| Accessibility | 93 | 100 |
| Best Practices | 96 | 100 |
| SEO | 100 | 100 |
| FCP | 1.4 s | 1.5 s |
| LCP | 10.2 s | 1.5 s |
| CLS | 0 | 0 |
| TBT | 0 ms | 20 ms |
| Total Byte Weight | 5,526,168 B | 1,721,638 B |
| `color-contrast` violations | 139 items (score 0) | 0 items (score 1) |

## 3. Unresolved Items & Owner Decisions Needed
1. **Work authorization phrasing**: The portfolio retains eligibility wording (`Rot-Weiß-Rot Karte` eligible as an Austrian STEM graduate) and does not assert approved permit status without owner confirmation.
2. **Legacy raw Step 3 image (`public/research/separation-gap-clean.png`)**: Replaced in active UI/lightbox with `public/research/separation-gap-score.png` rather than deleting the untouched source PNG in `public/research/`; delete if no longer needed after review.
3. **Production deployment & external link previews**: All checks ran against local static `out/` output; GitHub Pages deployment and social-platform OG cache refreshes will occur only after owner merge of PR #205.
4. **Pre-existing build output `src/lib/news-homepage.json`**: Left uncommitted/unmodified relative to the branch base so PR #205 remains isolated from daily automated news updates (`npm run build` refreshes it locally during `prebuild`).
