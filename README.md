# Ahmed Mohammed — AI/ML Engineer & Entrepreneur

[![Portfolio](https://img.shields.io/badge/Portfolio-ahmed--3m.github.io-2563eb?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ahmed-3m.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ahmed--3m-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ahmed-3m/)
[![Faultrix](https://img.shields.io/badge/Faultrix-Live_SaaS-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxMCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==&logoColor=white)](https://faultrix.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-ahmed--3m-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/ahmed-3m)

## 👋 About

AI/ML Engineer based in **Linz, Austria** specializing in computer vision, anomaly detection, and diffusion models. M.Sc. Artificial Intelligence from [Johannes Kepler University Linz](https://www.jku.at).

**Founder of [Faultrix](https://faultrix.com)** — AI-powered construction quality control SaaS generating ÖNORM-compliant reports from building photos in under 1 minute.

## 🔬 Research

- **Master's Thesis**: *Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection* (JKU Linz)
- **98.4% accuracy** in industrial defect detection using optimized YOLO at [PROFACTOR GmbH](https://www.profactor.at)
- Published research on EEG signal classification, GANs, and diffusion-based defect detection

## 🚀 Featured Projects

| Project | Description | Links |
|---------|-------------|-------|
| **Faultrix** | AI construction quality control SaaS — ÖNORM B 2110, SHA-256, DSGVO | [Live](https://faultrix.com) |
| **Industrial Anomaly Detection** | YOLO + diffusion models for quality control | [Code](https://github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking) |
| **OOD Detection Framework** | Conditional diffusion models as generative classifiers | [Code](https://github.com/ahmed-3m/OOD-diffusion-detector) |
| **EEG Signal Classification** | Deep RNN for brain-computer interfaces | [Code](https://github.com/ahmed-3m/Motor-Imagery-classification) |

## 🛠️ Tech Stack

**ML/DL**: PyTorch · TensorFlow · YOLO · Diffusion Models · CNNs · LSTMs · GANs · OpenCV

**Full-Stack**: TypeScript · React · Next.js · Convex · Tailwind CSS · Node.js · Vercel

**Infrastructure**: Docker · MLflow · GitHub Actions · CI/CD · MLOps · Linux

## 📊 Portfolio Site

This repository hosts my portfolio built with:

- **Framework**: Next.js 16 (Static Export)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **SEO**: 7 JSON-LD schemas, Open Graph, Twitter Cards, sitemap, robots.txt
- **Deploy**: GitHub Pages via GitHub Actions

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Liquid Glass system usage

Core utilities are defined in `src/app/globals.css`.

```html
<!-- Base surface + variant -->
<div class="glass-surface glass-subtle">...</div>
<div class="glass-surface glass-medium">...</div>
<div class="glass-surface glass-strong">...</div>

<!-- Add subtle texture when needed -->
<div class="glass-surface glass-medium glass-noise">...</div>

<!-- Card behavior: subtle by default, medium on hover -->
<article class="glass-surface glass-subtle glass-card glass-noise">...</article>
```

Available token groups:

- `--glass-bg`, `--glass-border`, `--glass-shadow`, `--glass-highlight`
- `--glass-blur`, `--glass-sat`, `--radius`, `--elevation`
- Light and dark token values are both included; dark values live under `[data-theme="dark"]`.

Preferences and fallbacks:

- `Reduce Transparency` toggle is available in the header and persists via `localStorage`.
- If `backdrop-filter` is unsupported, all glass surfaces automatically fall back to premium opaque backgrounds.
- Reduced-motion users get shortened/disabled transitions and animation-heavy effects are suppressed.

Before/after checklist:

- Readability: glass surfaces keep high-contrast text/icon colors.
- Fallback behavior: no-blur environments render opaque premium surfaces.
- Reduced motion: `prefers-reduced-motion` and motion reduction logic are applied.
- Reduced transparency: user toggle and system preference fallback are both respected.

## 📫 Contact

- **Email**: [ahmed.mo.0595@gmail.com](mailto:ahmed.mo.0595@gmail.com)
- **LinkedIn**: [linkedin.com/in/ahmed-3m](https://www.linkedin.com/in/ahmed-3m/)
- **Portfolio**: [ahmed-3m.github.io](https://ahmed-3m.github.io)

---

<p align="center">
  <i>Open to AI/ML consulting, research collaborations, and full-stack development projects.</i>
</p>
