# Ahmed Mohammed

> AI/ML engineer in Linz, Austria, building computer-vision systems that move from research notebooks to production workflows.

[![Portfolio](https://img.shields.io/badge/Portfolio-ahmed--3m.github.io-00d4ff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ahmed-3m.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ahmed--3m-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmed-3m/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-ahmed--3m-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/ahmed-3m)
[![Faultrix](https://img.shields.io/badge/Faultrix-Live_AI_SaaS-00ff88?style=for-the-badge)](https://faultrix.com)

This repository powers my portfolio: a compact but evidence-heavy record of the systems, research, and products I am building around diffusion models, out-of-distribution detection, industrial quality control, and AI-assisted construction workflows.

## Signal

| Track | What changed | Result |
| --- | --- | --- |
| Master's thesis, JKU Linz | Conditional diffusion models used as generative classifiers, with a class-conditional separation loss | **99.03% +/- 0.07% AUROC** across 3 seeds on CIFAR-10 airplane-vs-rest |
| External OOD checks | Seed-42 model tested zero-shot on CIFAR-100, Places365, FashionMNIST, Textures, and SVHN | **90.50%-96.97% AUROC**, 94.17% external-set mean |
| Industrial transfer | Public YOLO + CDM pipeline for inkjet print quality control | **86.73% +/- 2.30% AUROC** under 5-fold CV; separation loss did not transfer automatically |
| Production AI | Faultrix construction quality-control SaaS | Photo-to-report workflow with evidence chain, DSGVO-minded storage, and OpenAI-powered analysis |

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
| DiffusionOOD | Thesis implementation for CIFAR-10 OOD detection | [Code](https://github.com/ahmed-3m/DiffusionOOD) / [Weights](https://huggingface.co/ahmed-3m/DiffusionOOD) / [Thesis PDF](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf) |
| InkjetOOD | Industrial quality-control transfer study | [Code](https://github.com/ahmed-3m/InkjetOOD) / [Weights](https://huggingface.co/ahmed-3m/InkjetOOD) |
| Faultrix | Founder and full-stack builder | [Live SaaS](https://faultrix.com) |
| Portfolio | Research, writing, projects, and contact surface | [Site](https://ahmed-3m.github.io) / [Blog](https://ahmed-3m.github.io/blog) |

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
Deep learning       PyTorch, PyTorch Lightning, DDPMs, UNet, CNNs, Transformers
Computer vision     OOD detection, YOLOv8, defect detection, image classification
Experimentation     Hydra, Weights & Biases, AUROC, FPR95, cross-validation
Product systems     Next.js, React, TypeScript, Convex, OpenAI API, Docker
Deployment habits   GitHub, Linux, CUDA, REST APIs, reproducible public artefacts
```

## Writing

- [How I Hit 99.03% AUROC on OOD Detection Using Conditional Diffusion Models](https://ahmed-3m.github.io/blog/ood-diffusion-thesis)
- [Diffusion Models for Industrial Defect Detection: 98.4% at PROFACTOR GmbH](https://ahmed-3m.github.io/blog/diffusion-models-anomaly-detection)
- [Shipping Faultrix: Research-to-Product in 5 Months](https://ahmed-3m.github.io/blog/5-month-llm-adventure)

## This Site

The portfolio is built with Next.js, React, TypeScript, and a custom research-console visual system with dark and cream themes, multilingual UI, localized blog content, and a theme-aware portfolio chatbot. It is intentionally compact: fast to scan, easy to verify, and anchored to public artifacts.

```bash
npm ci
npm run dev
npm run build
```

## Contact

- Portfolio: [ahmed-3m.github.io](https://ahmed-3m.github.io)
- LinkedIn: [linkedin.com/in/ahmed-3m](https://www.linkedin.com/in/ahmed-3m/)
- Email: [ahmed.mo.0595@gmail.com](mailto:ahmed.mo.0595@gmail.com)
- ResearchGate: [Ahmed Mohammed](https://www.researchgate.net/profile/Ahmed-Mohammed-114)

Open to senior AI/ML roles, research collaborations, and serious industrial AI problems where model quality has to survive contact with real data.
