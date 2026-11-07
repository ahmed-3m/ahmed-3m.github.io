# Ahmed Mohammed

> AI/ML engineer in Linz, Austria. I build ML systems I can stand behind — verified error bars in research, eval harnesses in production.

[![Portfolio](https://img.shields.io/badge/Portfolio-ahmed--3m.github.io-00d4ff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ahmed-3m.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ahmed--3m-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmed-3m/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-ahmed--3m-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/ahmed-3m)
[![Sihem](https://img.shields.io/badge/Sihem-Live_beta-00ff88?style=for-the-badge)](https://t.me/sihem_ai_bot)

This repository powers my portfolio: a compact, evidence-heavy record of the research, products, and writing around diffusion models, out-of-distribution detection, industrial quality control, and LLM assistants.

## Signal

| Track | What changed | Result |
| --- | --- | --- |
| Master's thesis, JKU Linz | Conditional diffusion models used as generative classifiers, with a class-conditional separation loss (Defensio & graduation 25 Sep 2026, thesis graded 1) | **99.03% +/- 0.07% AUROC** across 3 seeds on a within-CIFAR airplane-vs-rest binary split |
| External OOD checks | Seed-42 model tested zero-shot on CIFAR-100, Places365, FashionMNIST, Textures, and SVHN | **90.50%-96.97% AUROC**, 94.17% external-set mean |
| Industrial transfer | Public YOLO + CDM pipeline for inkjet print quality control | **86.73% +/- 2.30% AUROC** under 5-fold CV; separation loss did not transfer automatically |
| Current product | Sihem, an LLM personal-mentor assistant (tech2b incubator, Linz) | Live beta on Telegram (`@sihem_ai_bot`), [PWA](https://sihem-pwa.pages.dev/), and [Case study](https://ahmed-3m.github.io/case-studies/sihem) |
| Previous product | Faultrix construction quality-control SaaS (Jul 2025 – Jul 2026) | Photo-to-report workflow with evidence chain, DSGVO-minded storage, and OpenAI-powered analysis |

## Research Thread

My M.Sc. thesis at Johannes Kepler University Linz, supervised by Prof. Sepp Hochreiter and Claus Hofmann, asks a practical question:

> Can a diffusion model be used not only to generate images, but to decide whether an input belongs?

The answer I explored is a generative-classification setup. The model reconstructs an image under competing class conditions, then uses the reconstruction-error gap as the out-of-distribution signal. The key contribution is the separation loss: a small objective term that pushes the conditional predictions apart so the final score becomes more stable.

```text
total loss = denoising loss + lambda * separation loss
```

At `lambda = 0.02`, the three-seed mean improved from a seed-sensitive `92.52% +/- 11.07%` to `99.03% +/- 0.07%` AUROC. The interesting part is not only the higher score; it is the collapse in variance.

### Interactive Thesis Explorer

The portfolio ships an in-browser explorer built from the thesis artefacts (raw score tensors and ablation JSON from [`ahmed-3m/DiffusionOOD`](https://huggingface.co/ahmed-3m/DiffusionOOD)). All numbers are precomputed — there is no client-side inference. It appears in the Research section of the homepage (mounted lazily when scrolled into view) and on the [DiffusionOOD case study](https://ahmed-3m.github.io/case-studies/diffusion-ood).

| Tab | What you can explore |
| --- | --- |
| Score distributions & threshold | Empirical ID-vs-OOD score histograms and ROC curves for six benchmarks (Table 6.1), the `lambda = 0.02` vs `lambda = 0` regimes, and a live decision threshold with TPR / FPR / Youden's J |
| Per-timestep & scoring rules | Reconstruction error across diffusion timesteps `t = 50..950`, plus difference vs. ratio vs. ID-only scoring (ID-only collapses to 20.23% AUROC on SVHN) |
| Ablations & inkjet transfer | The `lambda` sweep, the Monte Carlo trial budget `K` (accuracy vs. runtime), and per-feature 5-fold CV inkjet results showing where the separation loss does not transfer |

Data lives in [`src/lib/ood-explorer-data.ts`](src/lib/ood-explorer-data.ts); the UI is [`src/components/OodDemo.tsx`](src/components/OodDemo.tsx). Numerical qualifiers (airplane-vs-rest binary split, 3 seeds, seed-42 external checks) stay next to every headline figure on purpose.

## Featured Work

| Project | Role | Links |
| --- | --- | --- |
| Sihem | Current — LLM personal-mentor assistant (tech2b incubator, Linz; live beta) | [Case study](https://ahmed-3m.github.io/case-studies/sihem) / [Telegram](https://t.me/sihem_ai_bot) / [PWA](https://sihem-pwa.pages.dev/) |
| DiffusionOOD | Thesis implementation for CIFAR-10 OOD detection | [Code](https://github.com/ahmed-3m/DiffusionOOD) / [Weights](https://huggingface.co/ahmed-3m/DiffusionOOD) / [Thesis PDF](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf) |
| InkjetOOD | Industrial quality-control transfer study | [Code](https://github.com/ahmed-3m/InkjetOOD) / [Weights](https://huggingface.co/ahmed-3m/InkjetOOD) |
| Faultrix | Previous — full-stack builder (built solo) | [Site](https://faultrix.com) / [Case study](https://ahmed-3m.github.io/case-studies/faultrix) |
| Portfolio | Research, writing, news, and contact surface | [Site](https://ahmed-3m.github.io) / [Blog](https://ahmed-3m.github.io/blog) / [News](https://ahmed-3m.github.io/news) |

## Proof Layer

- Thesis PDF: [Conditional Diffusion Models as Generative Classifiers for OOD Detection](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf)
- Industrial report: [Diffusion-Based Multi-class Defect Detection](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf)
- Research poster: [Poster PDF](https://ahmed-3m.github.io/research-poster.pdf)
- Case studies:
  - [DiffusionOOD](https://ahmed-3m.github.io/case-studies/diffusion-ood) — includes the interactive thesis explorer
  - [InkjetOOD](https://ahmed-3m.github.io/case-studies/inkjet-ood)
  - [Faultrix](https://ahmed-3m.github.io/case-studies/faultrix)
  - [Sihem](https://ahmed-3m.github.io/case-studies/sihem)

## Engineering Palette

```text
Deep learning       PyTorch, PyTorch Lightning, DDPMs, UNet, CNNs, Transformers, LLMs
Computer vision     OOD detection, YOLOv8, defect detection, image classification
Experimentation     Hydra, Weights & Biases, AUROC, FPR95, cross-validation
Product systems     Next.js 16.4, React 19, TypeScript, Tailwind v4, Deno, Supabase
Deployment habits   GitHub Pages (static export), Linux, CUDA, REST APIs, public artefacts
```

## Writing

- [How I Reached 99.03% AUROC on OOD Detection with Conditional Diffusion Models](https://ahmed-3m.github.io/blog/ood-diffusion-thesis/)
- [Shipping Faultrix: What I Learned Building an AI SaaS From Zero](https://ahmed-3m.github.io/blog/5-month-llm-adventure/)
- [Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH](https://ahmed-3m.github.io/blog/diffusion-models-anomaly-detection/)
- [YOLOv8 for Industrial Quality Control: Decisions That Actually Moved the Needle](https://ahmed-3m.github.io/blog/computer-vision-yolo-mastery/)

## This Site

A **Next.js 16.4** + **React 19** + TypeScript + Tailwind v4 static export, deployed to GitHub Pages. Compact on purpose: fast to scan, easy to verify, anchored to public artefacts.

**Features**

- Homepage sections: Hero, Trust strip, About, Projects, Evidence, Experience, Research (with the interactive thesis explorer), Writing, News, Contact.
- Four case studies under `/case-studies/` — DiffusionOOD, InkjetOOD, Faultrix, and Sihem.
- Automatic OS dark/light mode via `prefers-color-scheme` (live updates, pre-paint script to avoid flash, manual toggle override) plus reduced-transparency support.
- Five locales (`en` / `de` / `fr` / `es` / `ar`, with RTL for Arabic) across UI copy, case studies, news and blog metadata.
- Accessibility: skip-to-content link, focus management in dialogs and the chatbot, keyboard-operable lightboxes and controls.
- SEO and machine readability: JSON-LD, sitemap, RSS feed (`/feed.xml`), `robots.txt`, and `llms.txt` / `llms-full.txt`.
- Blog with four localized posts, and a `/news` page of AI and agentic-AI items with editorial takes.
- Chatbot (Genie) backed by a hardened Cloudflare Worker proxy ([`worker/`](worker/)) with origin allow-listing, request-size limits and rate limiting, and local fallback answers when providers are unavailable.

**Repository layout**

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes (home, blog, news, case studies, sitemap, robots, feed) |
| `src/components/` | UI components, chatbot, interactive thesis explorer |
| `src/lib/` | i18n, news catalog (`news-items.json`), case-study and blog content, explorer data, SEO helpers |
| `public/` | Static assets, thesis PDF, research figures, `llms.txt` |
| `worker/` | Cloudflare Worker chat proxy and its self-test |
| `.github/` | Workflows and the news-agent task, validators and self-tests |
| `tools/` | Sitemap alias, icon and OG-image generators |

**Development**

```bash
npm ci            # install (lockfile is committed)
npm run dev       # local dev server
npm run lint      # eslint
npm run typecheck # tsc --noEmit
npm run build     # production static export — must pass before pushing
node .github/news/news-selftest.mjs     # news catalog and link-validator checks
node worker/chat-proxy.selftest.mjs     # chat proxy checks
```

The Calendly booking button points to `https://calendly.com/ahmed-3m` by default. To override it, set `NEXT_PUBLIC_CALENDLY_URL` before starting the app.

**Automation and workflow**

- `main` is the only long-lived branch; every change lands through a short-lived branch and a pull request.
- `deploy.yml` builds and publishes to GitHub Pages; `site-health.yml` runs a daily health check.
- `news-update.yml` runs daily: a research agent proposes a JSON delta, a validate job sanitizes it against `main`, and a JSON-only PR lands it once the quality and build checks pass. See [`AGENTS.md`](AGENTS.md) for the full protocol and required secrets.
- `claude.yml` runs Claude on `@claude` mentions, restricted to the repository owner.

## Contact

- Portfolio: [ahmed-3m.github.io](https://ahmed-3m.github.io)
- LinkedIn: [linkedin.com/in/ahmed-3m](https://www.linkedin.com/in/ahmed-3m/)
- Email: [ahmed.mo.0595@gmail.com](mailto:ahmed.mo.0595@gmail.com)
- ResearchGate: [Ahmed Mohammed](https://www.researchgate.net/profile/Ahmed-Mohammed-114)
- Sihem: [@sihem_ai_bot](https://t.me/sihem_ai_bot)

Open to AI/ML roles, research collaborations, and serious industrial AI problems where model quality has to survive contact with real data.
