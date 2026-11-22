<a href="https://ahmed-3m.github.io/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/readme/hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/readme/hero-light.svg">
    <img alt="Ahmed Mohammed — AI/ML engineer in Linz. Computer vision, diffusion and OOD research, production AI systems. 99.03% ± 0.07% AUROC (binary CIFAR-10 airplane-vs-rest, 3-seed mean), +6.5 pp over baseline." src=".github/readme/hero-dark.svg" width="100%">
  </picture>
</a>

<p align="center">
  <a href="https://ahmed-3m.github.io/"><img src="https://img.shields.io/badge/Portfolio-ahmed--3m.github.io-00d4ff?style=flat-square&labelColor=08090d&logo=googlechrome&logoColor=00d4ff" alt="Portfolio"></a>
  <a href="https://ahmed-3m.github.io/cv.pdf"><img src="https://img.shields.io/badge/CV-PDF-00d4ff?style=flat-square&labelColor=08090d&logo=readdotcv&logoColor=00d4ff" alt="CV (PDF)"></a>
  <a href="https://www.linkedin.com/in/ahmed-3m/"><img src="https://img.shields.io/badge/LinkedIn-ahmed--3m-00d4ff?style=flat-square&labelColor=08090d&logo=linkedin&logoColor=00d4ff" alt="LinkedIn"></a>
  <a href="https://huggingface.co/ahmed-3m"><img src="https://img.shields.io/badge/Hugging_Face-ahmed--3m-00d4ff?style=flat-square&labelColor=08090d&logo=huggingface&logoColor=00d4ff" alt="Hugging Face"></a>
  <a href="mailto:ahmed.mo.0595@gmail.com"><img src="https://img.shields.io/badge/Email-ahmed.mo.0595%40gmail.com-00d4ff?style=flat-square&labelColor=08090d&logo=gmail&logoColor=00d4ff" alt="Email"></a>
  <a href="https://github.com/ahmed-3m/ahmed-3m.github.io/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/ahmed-3m/ahmed-3m.github.io/deploy.yml?branch=main&style=flat-square&labelColor=08090d&color=00ff88&label=deploy" alt="Deploy status"></a>
</p>

<sub><code>// About</code></sub>

## AI/ML engineer — research that ships.

I'm an AI/ML engineer in **Linz, Austria**. I build systems that inspect images, support daily routines, and check AI-written code, and I combine carefully evaluated research with hands-on product work.

- **M.Sc. in Artificial Intelligence, JKU Linz** — graduated September 2026 (Defensio 25 Sep 2026). Thesis on conditional diffusion models for out-of-distribution (OOD) detection, supervised by **Prof. Sepp Hochreiter**, **graded 1** (top mark).
- **Background:** mechatronics and electronics before AI, so I bring a hardware and systems view to computer vision and production ML.
- **Open to:** AI/ML engineering roles and research collaborations. Available full time now (eligible for Austria's Rot-Weiß-Rot Karte für Studienabsolventen). Full background on <a href="https://ahmed-3m.github.io/about/">About</a>.

<sub><code>// Experience</code></sub>

## Experience & independent work.

| When | Role | Where |
| :--- | :--- | :--- |
| May 2026 – now | **Solo developer & project lead**: Sihem, a habits and daily-routine assistant (Telegram bot + web app), invitation-only beta | tech2b incubator, Linz |
| Apr 2024 – Jul 2026 | **M.Sc. thesis researcher, machine vision**: diffusion-based OOD detection and industrial inkjet defect inspection | JKU Institute for Machine Learning with PROFACTOR GmbH |
| Aug – Oct 2023 | **AI research intern**: RNN/CNN models for EEG motor-imagery classification | Karunya Institute of Technology and Sciences, India |
| Sep 2018 – Oct 2020 | **Electronics technician**: PCB assembly, circuit build-up, fault finding and test | Ledzone, Istanbul |

<sub><code>// Projects</code></sub>

## Research that ships.

<table>
  <tr>
    <td width="50%" valign="top">
      <sub><code>MASTER'S THESIS · JKU LINZ · GRADED 1</code></sub>
      <h3>DiffusionOOD</h3>
      Trains an image model to flag pictures from outside a familiar category. A class-conditional separation loss made results stable across random seeds.<br><br>
      <b>99.03% ± 0.07% AUROC</b><br>
      <sub>CIFAR-10 airplane vs. the other 9 classes (binary) · 3-seed mean · +6.5 pp over 92.52% ± 11.07%</sub><br><br>
      <a href="https://ahmed-3m.github.io/case-studies/diffusion-ood/">Case study</a> ·
      <a href="https://github.com/ahmed-3m/DiffusionOOD">Code</a> ·
      <a href="https://huggingface.co/ahmed-3m/DiffusionOOD">Weights</a> ·
      <a href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf">Thesis PDF</a>
    </td>
    <td width="50%" valign="top">
      <sub><code>THESIS TRACK 2 · INDUSTRIAL CV · PROFACTOR</code></sub>
      <h3>InkjetOOD</h3>
      A two-stage system for defects in industrial inkjet printing: YOLOv8m localizes 8 print feature types into 6,408 128×128 crops across 573 source-image groups, then a multi-head conditional diffusion model scores each crop.<br><br>
      <b>0.8673 ± 0.0230 AUROC</b><br>
      <sub>Public FTI_Zer0P dataset · 5-fold cross-validation · λ = 0 baseline; the separation loss did not transfer here (documented in the thesis)</sub><br><br>
      <a href="https://ahmed-3m.github.io/case-studies/inkjet-ood/">Case study</a> ·
      <a href="https://github.com/ahmed-3m/InkjetOOD">Code</a> ·
      <a href="https://huggingface.co/ahmed-3m/InkjetOOD">Weights</a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <sub><code>LLM PRODUCT · TECH2B INCUBATOR · INVITATION-ONLY BETA</code></sub>
      <h3>Sihem</h3>
      A personal assistant for weekly planning and daily routines through Telegram and a web app: scheduling, long-term memory, morning briefings, evening reviews and adaptive check-ins.<br><br>
      <a href="https://ahmed-3m.github.io/case-studies/sihem/">Case study</a> ·
      <a href="https://t.me/sihem_ai_bot">Telegram (invite only)</a> ·
      <a href="https://sihem-pwa.pages.dev/">Web app (invite only)</a>
    </td>
    <td width="50%" valign="top">
      <sub><code>DEVELOPER TOOL · OPEN SOURCE</code></sub>
      <h3>mergeproof</h3>
      A deterministic merge gate for AI-agent pull requests. It checks CI, diff scope, review threads and secrets in plain code, with no LLM calls, and returns MERGE, RETRY or HUMAN.<br><br>
      <a href="https://github.com/ahmed-3m/mergeproof">Code</a> ·
      <a href="https://www.npmjs.com/package/@ahmed-3m/mergeproof">npm</a>
    </td>
  </tr>
</table>

<sub>Also: <a href="https://github.com/ahmed-3m/Motor-Imagery-classification">EEG motor-imagery classification</a> · <a href="https://github.com/ahmed-3m/brainstorm2idea">brainstorm2idea</a> · <a href="https://github.com/ahmed-3m/idea2prototype">idea2prototype</a> · <a href="https://github.com/ahmed-3m/Elbostan-Pazar-bot">Elbostan Pazar bot</a></sub>

<sub><code>// Research</code></sub>

## The thesis in one table.

The model scores an image by how well a class-conditional diffusion model reconstructs it under competing class hypotheses. Training adds a separation term, $`\mathcal{L} = \mathcal{L}_{\text{diffusion}} + \lambda \cdot \mathcal{L}_{\text{sep}}`$, and at $`\lambda = 0.02`$ the spread across seeds drops from ±11.07 to ±0.07 points.

<div align="center">

| Test set | AUROC | Setting |
| :--- | ---: | :--- |
| **CIFAR-10 airplane vs. rest** | **99.03% ± 0.07%** | 3-seed mean, λ = 0.02 (headline) |
| CIFAR-10 airplane vs. rest | 92.52% ± 11.07% | 3-seed mean, λ = 0 baseline |
| CIFAR-100 | 96.97% | seed 42, K = 100 (thesis Table 6.1) |
| Places365 | 96.50% | seed 42, K = 100 (thesis Table 6.1) |
| FashionMNIST | 94.03% | seed 42, K = 100 (thesis Table 6.1) |
| Textures | 92.84% | seed 42, K = 100 (thesis Table 6.1) |
| SVHN | 90.50% | seed 42, K = 100 (thesis Table 6.1) |

</div>

<sub>The task is binary with a single in-distribution class, so these numbers are not comparable to multi-class CIFAR-10 OOD leaderboards. All figures come from the thesis and are mirrored in <a href="src/lib/ood-explorer-data.ts"><code>src/lib/ood-explorer-data.ts</code></a>. See the <a href="https://ahmed-3m.github.io/research/">research overview</a> or drag the threshold yourself in the <a href="https://ahmed-3m.github.io/case-studies/diffusion-ood/">interactive explorer</a>.</sub>

<sub><code>// Stack</code></sub>

## What I work with.

| | |
| :--- | :--- |
| **ML & vision** | PyTorch, PyTorch Lightning, diffusion models (DDPM, UNet), YOLOv8, anomaly / OOD detection, Hugging Face |
| **Evaluation** | AUROC, FPR95, cross-validation, seed sweeps, Hydra, Weights & Biases, CUDA |
| **Product** | TypeScript, React, Next.js, PostgreSQL / Supabase, Deno, Cloudflare Workers, Telegram bots |
| **Ops** | Docker, Linux, GitHub Actions CI/CD |

<sub><code>// This repo</code></sub>

## How this site is built.

<table>
  <tr>
    <td valign="top" width="50%">
      <b>Stack</b><br>
      Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4, statically exported and deployed to GitHub Pages by <a href=".github/workflows/deploy.yml">GitHub Actions</a>.
    </td>
    <td valign="top" width="50%">
      <b>Design</b><br>
      One token set (<code>--cd-*</code> in <a href="src/app/globals.css"><code>globals.css</code></a>) drives a dark theme and a warm light theme. Space Grotesk, Inter and JetBrains Mono.
    </td>
  </tr>
  <tr>
    <td valign="top">
      <b>Languages</b><br>
      English, German, French, Spanish and Arabic, including a full right-to-left layout for Arabic.
    </td>
    <td valign="top">
      <b>Live pieces</b><br>
      Dedicated <a href="https://ahmed-3m.github.io/about/">About</a>, <a href="https://ahmed-3m.github.io/research/">Research</a>, <a href="https://ahmed-3m.github.io/blog/">Blog</a> and <a href="https://ahmed-3m.github.io/news/">News</a> routes, an interactive thesis explorer from recorded scores, a multilingual chat assistant with deterministic fallback (plus an optional Cloudflare Worker proxy in <a href="worker/chat-proxy.js"><code>worker/</code></a>), and a daily AI-news feed added by an agent through reviewed PRs.
    </td>
  </tr>
</table>

<sub>Contributor and agent rules, including the claim-integrity rules for every number on the site, live in <a href="AGENTS.md"><code>AGENTS.md</code></a>.</sub>

---

<p align="center">
  <b>Let's talk.</b> <a href="mailto:ahmed.mo.0595@gmail.com">ahmed.mo.0595@gmail.com</a> · <a href="https://www.linkedin.com/in/ahmed-3m/">LinkedIn</a> · <a href="https://github.com/ahmed-3m">GitHub</a> · <a href="https://orcid.org/0009-0004-8934-1270">ORCID</a> · <a href="https://ahmed-3m.github.io/#contact">Book a call</a>
</p>
