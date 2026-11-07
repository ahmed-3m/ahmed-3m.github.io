# Ahmed Mohammed

<p align="center">
  <strong>AI / Machine Learning Engineer &middot; Linz, Austria</strong><br>
  <em>M.Sc. Artificial Intelligence, Johannes Kepler University Linz (Supervised by Prof. Sepp Hochreiter)</em>
</p>

<p align="center">
  <a href="https://ahmed-3m.github.io"><img src="https://img.shields.io/badge/Portfolio-ahmed--3m.github.io-00d4ff?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Portfolio"></a>
  <a href="https://www.linkedin.com/in/ahmed-3m/"><img src="https://img.shields.io/badge/LinkedIn-ahmed--3m-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://huggingface.co/ahmed-3m"><img src="https://img.shields.io/badge/Hugging_Face-ahmed--3m-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face"></a>
  <a href="https://t.me/sihem_ai_bot"><img src="https://img.shields.io/badge/Sihem_AI-Live_Beta-00ff88?style=for-the-badge&logo=telegram&logoColor=black" alt="Sihem Telegram"></a>
  <a href="https://github.com/ahmed-3m/ahmed-3m.github.io/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/ahmed-3m/ahmed-3m.github.io/deploy.yml?branch=main&style=for-the-badge&label=Static%20Export" alt="Build Status"></a>
</p>

---

> I build machine learning systems designed to withstand real data — verified error bars in empirical research, hardened evaluation harnesses and defensive proxies in production.

This repository powers my personal engineering portfolio at [ahmed-3m.github.io](https://ahmed-3m.github.io): an evidence-first record of generative classifiers, diffusion-based out-of-distribution (OOD) detection, industrial surface defect inspection, and LLM-driven mentoring systems.

---

## Empirical Signal at a Glance

Every headline metric in my work is backed by seed sweeps, cross-validation, or open-access model weights.

| Domain | Scope & Methodology | Benchmark Result | Verification Artefact |
| :--- | :--- | :--- | :--- |
| **M.Sc. Thesis**<br>(JKU Linz) | Conditional Diffusion Models with class-conditional separation loss ($\lambda = 0.02$) | **99.03% &plusmn; 0.07% AUROC**<br>*(3-seed mean on within-CIFAR airplane vs. rest; vs. 92.52% &plusmn; 11.07% baseline)* | [Thesis PDF](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf) &bull; [Model Weights](https://huggingface.co/ahmed-3m/DiffusionOOD) |
| **Zero-Shot External OOD** | Seed-42 generative classifier tested across five disparate vision distributions | **90.50% &ndash; 96.97% AUROC**<br>*(94.17% mean across CIFAR-100, Places365, FashionMNIST, Textures, SVHN)* | [Interactive Explorer](https://ahmed-3m.github.io/case-studies/diffusion-ood) &bull; [Raw Tensors](https://huggingface.co/ahmed-3m/DiffusionOOD) |
| **Industrial Inspection**<br>(PROFACTOR GmbH) | Multi-class inkjet defect detection combining YOLOv8 bounding boxes + CDM verification | **86.73% &plusmn; 2.30% AUROC**<br>*(5-fold cross-validation on FTI_Zer0P; negative transfer documented)* | [Industrial Report](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf) &bull; [InkjetOOD Code](https://github.com/ahmed-3m/InkjetOOD) |
| **LLM Mentoring System**<br>(tech2b Incubator) | Multi-turn personalized mentoring agent with persistent long-term memory and proactive check-ins | **Live Beta Stage**<br>*(Active testing via Telegram Bot & Progressive Web App)* | [Sihem Case Study](https://ahmed-3m.github.io/case-studies/sihem) &bull; [Bot Demo](https://t.me/sihem_ai_bot) |
| **Computer Vision SaaS**<br>(Faultrix Solo Build) | Construction defect detection pipeline: on-site capture to automated DSGVO-compliant audit | **Production Shipped**<br>*(12-month lifecycle: mobile capture &rarr; OpenAI vision audit)* | [Faultrix Case Study](https://ahmed-3m.github.io/case-studies/faultrix) |

---

## Core Research: Conditional Diffusion for OOD Detection

Supervised under **Prof. Sepp Hochreiter** and **Claus Hofmann** at Johannes Kepler University Linz (*Graduated Sep 25, 2026; Thesis graded 1*).

### The Mathematical Formulation
Standard discriminative classifiers assign overconfident probabilities to inputs lying completely outside the training distribution. Generative classifiers instead score sample likelihood. We reframe a conditional diffusion model into an exact anomaly detector by evaluating reconstruction error under competing class hypotheses:

```
                      +-----------------------------+
                      | Input Query Sample: x in X  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
     [ Condition c_target ]                      [ Condition c_competing ]
     +---------------------+                     +-----------------------+
     | Diffusion Denoiser  |                     |  Diffusion Denoiser   |
     | eps_theta(x_t, t, c)|                     |  eps_theta(x_t, t, c) |
     +----------+----------+                     +-----------+-----------+
                |                                            |
                v                                            v
         Recon Error E_target                          Recon Error E_competing
                \                                           /
                 \                                         /
                  v                                       v
               +---------------------------------------------------+
               | Anomaly Score: S(x) = E_target(x) - E_competing(x) |
               | Decision: S(x) > Threshold tau => OOD              |
               +---------------------------------------------------+
```

To eliminate seed sensitivity and guarantee separation, we train with a joint objective:
$$\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{diffusion}} + \lambda \cdot \mathcal{L}_{\text{sep}}$$

* **Denoising Loss ($\mathcal{L}_{\text{diffusion}}$)** preserves high-fidelity image distribution reconstruction.
* **Separation Loss ($\mathcal{L}_{\text{sep}}$)** actively penalizes overlap between target-class and competing-class predictions.
* **Result**: Setting $\lambda = 0.02$ causes the standard deviation across random seeds to collapse from $\pm 11.07\%$ to $\pm 0.07\%$ AUROC.

---

## Live In-Browser Thesis Explorer

The portfolio mounts an authentic interactive laboratory built directly from precomputed PyTorch score tensors and ablation runs from Hugging Face [`ahmed-3m/DiffusionOOD`](https://huggingface.co/ahmed-3m/DiffusionOOD). There is zero synthetic data and zero client-side inference lag.

You can interact with it directly in the [Research section of the Homepage](https://ahmed-3m.github.io/#research) or on the [DiffusionOOD Case Study](https://ahmed-3m.github.io/case-studies/diffusion-ood):

```
+-----------------------------------------------------------------------------------------+
| [ Tab 1: Distributions & Threshold ]  [ Tab 2: Timesteps & Rules ]  [ Tab 3: Ablations ]|
+-----------------------------------------------------------------------------------------+
|  Histogram & ROC Curve                   Reconstruction Dynamics      Ablation Analysis |
|  ---------------------                   -----------------------      ----------------- |
|  * 6 benchmark distributions             * Sweep t = 50..950          * Lambda sweep    |
|  * Lambda = 0.02 vs 0 ablation           * Difference vs Ratio vs ID  * Budget K sweep  |
|  * Live draggable threshold tau          * Failure mode: ID-only      * Inkjet transfer |
|  * Real-time TPR, FPR, Youden's J          drops to 20.23% on SVHN      defect breakdown|
+-----------------------------------------------------------------------------------------+
```

1. **Empirical Score Distributions & Interactive Thresholding**: Examine real ID vs. OOD histograms across six benchmark datasets (CIFAR-100, Places365, FashionMNIST, Textures, SVHN). Drag the decision threshold to calculate empirical True Positive Rate (TPR), False Positive Rate (FPR), and Youden's J statistic in real time.
2. **Diffusion Timestep Dynamics & Scoring Rules**: Inspect reconstruction error trajectories across timesteps $t \in [50, 950]$. Compare the difference score against ratio and ID-only baselines (revealing why ID-only reconstruction fails catastrophically on SVHN at 20.23% AUROC).
3. **Hyperparameter Ablations & Negative Industrial Transfer**: Explore the exact sensitivity curves for the separation weight $\lambda$, the Monte Carlo sample budget $K$, and five-fold cross-validation defect breakdowns on industrial inkjet print surfaces.

---

## Featured Systems & Engineering Portfolio

```
========================================================================================
[ Research & Models ]
----------------------------------------------------------------------------------------
* DiffusionOOD       Conditional diffusion generative classifier for out-of-distribution
                     detection. PyTorch Lightning, Hydra, Weights & Biases.
                     [Code](https://github.com/ahmed-3m/DiffusionOOD) | [Weights](https://huggingface.co/ahmed-3m/DiffusionOOD) | [Thesis](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf)

* InkjetOOD          Industrial quality control benchmark on print surfaces at PROFACTOR.
                     YOLOv8 + generative verification pipeline under 5-fold CV.
                     [Code](https://github.com/ahmed-3m/InkjetOOD) | [Weights](https://huggingface.co/ahmed-3m/InkjetOOD) | [Report](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf)
----------------------------------------------------------------------------------------
[ Applied Products ]
----------------------------------------------------------------------------------------
* Sihem              Personalized LLM mentoring agent (tech2b incubator, Linz).
                     Built with proactive follow-ups, memory retention, and multilingual UI.
                     [Live Telegram](https://t.me/sihem_ai_bot) | [PWA App](https://sihem-pwa.pages.dev/) | [Case Study](https://ahmed-3m.github.io/case-studies/sihem)

* Faultrix           AI-powered construction defect documentation SaaS (Solo builder).
                     Architected DSGVO-compliant storage, photo analysis, and automated PDF audit.
                     [Case Study](https://ahmed-3m.github.io/case-studies/faultrix) | [Demo Site](https://faultrix.com)
========================================================================================
```

---

## Technical Competencies

```
Machine Learning & AI  ::  PyTorch, PyTorch Lightning, Diffusion Models (DDPM), UNet, YOLOv8,
                           Anomaly Detection, Contrastive & Generative Classifiers, Hugging Face
Evaluation & Tooling   ::  AUROC, FPR95, Youden's J, Cross-Validation, Hydra, Weights & Biases, CUDA
Production Fullstack   ::  Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
                           Cloudflare Workers (Edge Proxies), Supabase, Deno, REST APIs
Systems & Practices    ::  Static Web Export, Docker, Linux, CI/CD Actions, Strict i18n (5 Locales),
                           Machine-Readable Specs (llms.txt, JSON-LD)
```

---

## Portfolio Architecture & Design Philosophy

This site is statically exported to GitHub Pages with high performance, strict accessibility, and deterministic reproduction:

* **Engine**: Next.js 16.4 + React 19 + TypeScript + Tailwind CSS v4.
* **Resilience**: Hardened Cloudflare Worker edge proxy (`worker/chat-proxy.js`) with origin enforcement, payload validation, hourly rate limiting, and instant deterministic local fallbacks.
* **Internationalization**: Native support for 5 languages (`en`, `de`, `fr`, `es`, `ar`) including full bidirectional RTL layout mechanics for Arabic.
* **Machine Accessibility**: `llms.txt` / `llms-full.txt`, JSON-LD schemas, sitemap, and RSS feed.
* **Daily Autonomous News**: Automated agentic pipeline collecting, verifying, and publishing curated AI and agentic breakthroughs daily via GitHub Actions.

### Local Verification & Commands

Dependencies are pinned via the committed lockfile. Validate changes locally before submitting:

```bash
# Clean deterministic install
npm ci

# Start development server
npm run dev

# Code quality & type safety
npm run lint
npm run typecheck

# Full production static export (Must pass before push)
npm run build

# System & security self-tests
node .github/news/news-selftest.mjs     # Validate news schemas & canonical links
node worker/chat-proxy.selftest.mjs     # Test chat proxy resilience & sanitization
```

---

## Direct Contacts & Research Profiles

<p align="left">
  <a href="https://ahmed-3m.github.io"><img src="https://img.shields.io/badge/Web-ahmed--3m.github.io-00d4ff?style=flat-square&logo=google-chrome&logoColor=white" alt="Web"></a>
  <a href="https://www.linkedin.com/in/ahmed-3m/"><img src="https://img.shields.io/badge/LinkedIn-Ahmed%20Mohammed-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:ahmed.mo.0595@gmail.com"><img src="https://img.shields.io/badge/Email-ahmed.mo.0595%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
  <a href="https://www.researchgate.net/profile/Ahmed-Mohammed-114"><img src="https://img.shields.io/badge/ResearchGate-Ahmed%20Mohammed-00CCBB?style=flat-square&logo=researchgate&logoColor=white" alt="ResearchGate"></a>
  <a href="https://t.me/sihem_ai_bot"><img src="https://img.shields.io/badge/Telegram-@sihem__ai__bot-26A5E4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

*Open to senior AI/ML engineering roles, applied research positions, and high-impact industrial machine learning systems where reliability and rigor are non-negotiable.*
