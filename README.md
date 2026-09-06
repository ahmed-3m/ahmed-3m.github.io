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
| Master's thesis, JKU Linz | Conditional diffusion models used as generative classifiers, with a class-conditional separation loss | **99.03% +/- 0.07% AUROC** across 3 seeds on a within-CIFAR airplane-vs-rest binary split |
| External OOD checks | Seed-42 model tested zero-shot on CIFAR-100, Places365, FashionMNIST, Textures, and SVHN | **90.50%-96.97% AUROC**, 94.17% external-set mean |
| Industrial transfer | Public YOLO + CDM pipeline for inkjet print quality control | **86.73% +/- 2.30% AUROC** under 5-fold CV; separation loss did not transfer automatically |
| Current product | Sihem, an LLM personal-mentor assistant | Live beta on Telegram (`@sihem_ai_bot`) and a PWA |
| Previous product | Faultrix construction quality-control SaaS (Jul 2025 – Jul 2026) | Photo-to-report workflow with evidence chain, DSGVO-minded storage, and OpenAI-powered analysis |

## Research Thread

My M.Sc. thesis at Johannes Kepler University Linz, supervised by Prof. Sepp Hochreiter and Claus Hofmann, asks a practical question:

> Can a diffusion model be used not only to generate images, but to decide whether an input belongs?

The answer I explored is a generative-classification setup. The model reconstructs an image under competing class conditions, then uses the reconstruction-error gap as the out-of-distribution signal. The key contribution is the separation loss: a small objective term that pushes the conditional predictions apart so the final score becomes more stable.

```text
total loss = denoising loss + lambda * separation loss
```

At `lambda = 0.02`, the three-seed mean improved from a seed-sensitive `92.52% +/- 11.07%` to `99.03% +/- 0.07%` AUROC. The interesting part is not only the higher score; it is the collapse in variance.

## Featured Work

| Project | Role | Links |
| --- | --- | --- |
| Sihem | Current — LLM personal-mentor assistant (live beta) | [Telegram](https://t.me/sihem_ai_bot) / [PWA](https://sihem-pwa.pages.dev/) |
| DiffusionOOD | Thesis implementation for CIFAR-10 OOD detection | [Code](https://github.com/ahmed-3m/DiffusionOOD) / [Weights](https://huggingface.co/ahmed-3m/DiffusionOOD) / [Thesis PDF](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf) |
| InkjetOOD | Industrial quality-control transfer study | [Code](https://github.com/ahmed-3m/InkjetOOD) / [Weights](https://huggingface.co/ahmed-3m/InkjetOOD) |
| Faultrix | Previous — full-stack builder (built solo) | [Site](https://faultrix.com) / [Case study](https://ahmed-3m.github.io/case-studies/faultrix) |
| Portfolio | Research, writing, news, and contact surface | [Site](https://ahmed-3m.github.io) / [Blog](https://ahmed-3m.github.io/blog) / [News](https://ahmed-3m.github.io/news) |

## Proof Layer

- Thesis PDF: [Conditional Diffusion Models as Generative Classifiers for OOD Detection](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf)
- Industrial report: [Diffusion-Based Multi-class Defect Detection](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf)
- Research poster: [Poster PDF](https://ahmed-3m.github.io/research-poster.pdf)
- Case studies:
  - [DiffusionOOD](https://ahmed-3m.github.io/case-studies/diffusion-ood)
  - [InkjetOOD](https://ahmed-3m.github.io/case-studies/inkjet-ood)
  - [Faultrix](https://ahmed-3m.github.io/case-studies/faultrix)

## Engineering Palette

```text
Deep learning       PyTorch, PyTorch Lightning, DDPMs, UNet, CNNs, Transformers, LLMs
Computer vision     OOD detection, YOLOv8, defect detection, image classification
Experimentation     Hydra, Weights & Biases, AUROC, FPR95, cross-validation
Product systems     Next.js 16.3, React 19, TypeScript, Tailwind v4, Deno, Supabase
Deployment habits   GitHub Pages (static export), Linux, CUDA, REST APIs, public artefacts
```

## Writing

- [How I Reached 99.03% AUROC on OOD Detection with Conditional Diffusion Models](https://ahmed-3m.github.io/blog/ood-diffusion-thesis/)
- [Shipping Faultrix: What I Learned Building an AI SaaS From Zero](https://ahmed-3m.github.io/blog/5-month-llm-adventure/)
- [Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH](https://ahmed-3m.github.io/blog/diffusion-models-anomaly-detection/)
- [YOLOv8 for Industrial Quality Control: Decisions That Actually Moved the Needle](https://ahmed-3m.github.io/blog/computer-vision-yolo-mastery/)

## This Site

The portfolio is a **Next.js 16.3** + **React 19** + TypeScript + Tailwind v4 static export, deployed to GitHub Pages. It has dark and cream themes, multilingual UI (en / de / fr / es / ar), localized blog posts, a curated [`/news`](https://ahmed-3m.github.io/news/) page, and a theme-aware chatbot (Genie). Compact on purpose: fast to scan, easy to verify, anchored to public artifacts.

```bash
npm ci
npm run dev
npm run build
```

The Calendly booking button points to `https://calendly.com/ahmed-3m` by default. To override it, set `NEXT_PUBLIC_CALENDLY_URL` before starting the app.

## Contact

- Portfolio: [ahmed-3m.github.io](https://ahmed-3m.github.io)
- LinkedIn: [linkedin.com/in/ahmed-3m](https://www.linkedin.com/in/ahmed-3m/)
- Email: [ahmed.mo.0595@gmail.com](mailto:ahmed.mo.0595@gmail.com)
- ResearchGate: [Ahmed Mohammed](https://www.researchgate.net/profile/Ahmed-Mohammed-114)
- Sihem: [@sihem_ai_bot](https://t.me/sihem_ai_bot)

Open to AI/ML roles, research collaborations, and serious industrial AI problems where model quality has to survive contact with real data.
