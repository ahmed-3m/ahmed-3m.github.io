export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
  readingTime?: string;
  ogImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'ood-diffusion-thesis',
    title: 'How I Hit 99.03% AUROC on OOD Detection Using Conditional Diffusion Models',
    date: '2026-03-20',
    excerpt: 'My Master\'s thesis at JKU Linz (supervised by Prof. Sepp Hochreiter) introduced class-conditional separation loss into conditional diffusion models used as generative classifiers — improving out-of-distribution detection from 80.25% to 99.03% AUROC on CIFAR-10, an 18.8 percentage-point gain.',
    tags: ['Diffusion Models', 'OOD Detection', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Models', 'JKU Linz'],
    readingTime: '14 min read',
    ogImage: '/og-diffusion-models-anomaly-detection.png',
    content: `
## What I Built and Why It Matters

Out-of-distribution (OOD) detection is the ability of a neural network to say "I don't know" when it sees something it was never trained on. It's a critical safety property for any production AI system — from autonomous vehicles to medical imaging to industrial quality control. Without it, models silently produce confident wrong answers.

My Master's thesis at Johannes Kepler University Linz (under Prof. Sepp Hochreiter, inventor of LSTM) achieved **99.03% AUROC on CIFAR-10** OOD detection — a gain of **+18.8 percentage points** over the baseline — by introducing a class-conditional separation loss into conditional diffusion models used as generative classifiers.

## The Core Problem With Existing OOD Methods

Existing OOD detectors generally fall into two camps:

1. **Discriminative methods** (MSP, ODIN, energy score): Train a classifier, then use the output confidence or energy as an OOD score. These are fast but fundamentally limited — a classifier trained to distinguish cats from dogs has no incentive to be uncertain about pictures of cars.

2. **Reconstruction-based methods** (VAE, flow models): Train a generative model on in-distribution data; OOD samples should reconstruct poorly. In practice, these models often reconstruct OOD inputs perfectly because they generalize too well.

Diffusion models are the latest generation of generative models, achieving state-of-the-art image synthesis. But could they be repurposed as generative classifiers for OOD detection?

## The Approach: Conditional Diffusion Models as Generative Classifiers

A conditional diffusion model learns the class-conditional distribution p(x | y) for each class y in the training set. Given a test sample x, you can compute the likelihood under each class and pick the highest — that's generative classification.

For OOD detection: if a test sample x has low likelihood under **all** class conditionals, it's out-of-distribution. The aggregated score across classes becomes the OOD detector.

### Why This Works

Unlike discriminative classifiers, a generative classifier must model the actual data distribution. An OOD input like a photo of a truck (when trained on cats and dogs) will have genuinely low density under p(x | cat) and p(x | dog) — the model can't fake familiarity.

### The Baseline Problem

The baseline conditional diffusion model (without my contribution) achieved **80.25% AUROC**. This is decent but not production-grade. The issue: the diffusion model has no explicit pressure to keep class-conditional distributions **separate**. The features learned for each class can overlap significantly in embedding space, making the score boundaries ambiguous.

## My Key Contribution: Class-Conditional Separation Loss

I introduced a **class-conditional separation loss** λ·L_sep that explicitly encourages the model's intermediate representations to cluster by class and push different classes apart, analogous to contrastive learning but applied to the generative process.

The total training objective becomes:

\`\`\`python
loss = L_diffusion + λ * L_separation

# L_diffusion: standard DDPM noise prediction loss
# L_separation: pushes class embeddings apart in feature space
# λ: separation loss weight (ablated over [0.0, 0.001, 0.01, 0.02, 0.05, 0.1])
\`\`\`

### Ablation Results on CIFAR-10

| λ (separation weight) | AUROC | FPR@95TPR |
|----------------------|-------|-----------|
| 0.0 (baseline) | 80.25% | — |
| 0.001 | 97.32% | — |
| **0.01** | 98.69% | — |
| **0.02 (best)** | **99.11%** | — |
| 0.05 | 98.51% | — |
| 0.1 | 96.67% | — |

The sweet spot is λ=0.02, achieving **99.11% AUROC** peak. The reported thesis result of **99.03% AUROC** is the average across 5 OOD test datasets (SVHN, LSUN, iSUN, Textures, Places365) against CIFAR-10 as in-distribution.

The gain is not marginal — going from 80% to 99% AUROC is the difference between "interesting research" and "production deployable."

## Applying It to Industrial Quality Control (PROFACTOR GmbH)

After validating on CIFAR-10, I applied the same framework to real industrial data from PROFACTOR GmbH's Zer0P project (funded by the Government of Upper Austria). The task: detect defects in inkjet-printed building components using multi-head conditioning.

Industrial datasets are fundamentally different:
- Much smaller scale (~1,327 images vs 60,000 for CIFAR-10)
- 8 distinct feature types with wildly different defect rates
- 5-fold cross-validation required (no test set leakage)

The industrial baseline AUROC was **86.73% ± 2.3%** (5-fold CV). Separation loss improved it to **87.3% ± 2.1%** — a small, statistically **non-significant** improvement. This is itself an important research finding: the separation loss effect is domain-dependent. CIFAR-10 (large, balanced, well-separated classes) benefits enormously. A small industrial dataset with noisy labels and few BAD samples per class barely moves.

This cross-domain analysis became a key thesis contribution — not just "we improved X" but "we understand **when and why** the method works."

## Implementation Stack

- **Framework:** PyTorch + PyTorch Lightning
- **Architecture:** DDPM U-Net with class conditioning (concatenation + cross-attention)
- **Experiment management:** Hydra config system + Weights & Biases
- **Training hardware:** JKU GPU cluster (RTX A6000)
- **Evaluation:** AUROC, FPR@95TPR, statistical significance testing (Holm correction)

Key engineering decisions:
- Monte Carlo sampling (K=100 trials) for robust score estimation
- Separation loss applied at the bottleneck feature layer, not the output
- Multi-head conditioning for the industrial case: one head per feature type

## What This Means for Production Systems

If you're building a production ML system today, OOD detection is non-negotiable:

1. **Silent failure is the worst kind**: A confident wrong answer is far more dangerous than "I don't know"
2. **Generative classifiers are interpretable**: You can visualize what the model thinks "normal" looks like per class
3. **The separation loss is cheap**: It adds ~5% training overhead but 18.8pp AUROC improvement

The framework is open-sourced at [github.com/ahmed-3m/OOD-diffusion-detector](https://github.com/ahmed-3m/OOD-diffusion-detector). Full thesis PDF available [here](https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf).

## Supervisor

This work was completed under the supervision of **Prof. Sepp Hochreiter** (inventor of LSTM, head of the JKU Institute for Machine Learning) and **Claus Hofmann** (research assistant, JKU). I'm grateful for the research environment and compute access that made this possible.

Reach me at ahmed.mo.0595@gmail.com or [LinkedIn](https://www.linkedin.com/in/ahmed-3m/) if you're working on OOD detection or want to discuss the approach.
    `
  },
  {
    slug: 'diffusion-models-anomaly-detection',
    title: 'Diffusion Models for Industrial Defect Detection: 98.4% Accuracy at PROFACTOR GmbH',
    date: '2024-11-20',
    excerpt: 'How I combined YOLOv8 feature extraction with conditional diffusion models to achieve 98.4% defect detection accuracy on inkjet-printed building components in a real-time production environment — part of the Zer0P project funded by the Government of Upper Austria.',
    tags: ['Diffusion Models', 'Anomaly Detection', 'YOLOv8', 'Industrial AI', 'Computer Vision', 'Quality Control'],
    readingTime: '11 min read',
    ogImage: '/og-diffusion-models-anomaly-detection.png',
    content: `
## The Result First

At PROFACTOR GmbH (Steyr, Austria), I built a machine vision pipeline that detects defects in inkjet-printed building components with **98.4% accuracy in a real-time production environment**. This is not a benchmark number — it ran on the factory floor, on live production data, with real consequences.

The project was part of **Zer0P** — a zero-defect manufacturing initiative funded by the Government of Upper Austria. The goal: eliminate defects in inkjet-printed construction components before they leave the production line.

## The Problem: Why Standard Computer Vision Fails Here

Industrial defect detection has properties that make standard classification approaches break down:

- **Defects are rare**: In a production run of 1,327 components, only ~20–30% are defective. Classic classification models become overconfident on the majority class.
- **Defects are diverse**: 8 distinct feature types (edge quality, dot density, distance measurements, angle precision), each with its own failure modes.
- **Zero labeled anomaly examples at training time**: You have thousands of GOOD parts. You rarely have enough BAD ones to train a supervised classifier.
- **Real-time constraint**: 50ms per component max, running on an edge GPU.

Standard approaches (ResNet classifier, simple thresholding) fail because they need labeled defect examples and can't generalize to unseen defect types.

## The Architecture: YOLOv8 + Conditional Diffusion Model

### Stage 1: YOLOv8 Feature Extraction

YOLOv8 was used as a feature backbone, not as a detector. Instead of using its bounding box outputs, I extracted the intermediate feature maps from the backbone and used them as the input representation.

Why YOLO? The model had already been pre-trained on the component geometry. Its features encode spatial relationships, edge sharpness, and pattern regularity — exactly what matters for inkjet quality.

\`\`\`python
# Extract features from YOLOv8 backbone
backbone_features = yolo_model.model[:10](image)  # layers 0-9 only
# Shape: [B, 512, H/32, W/32]
\`\`\`

### Stage 2: Conditional Diffusion Model as Generative Classifier

The diffusion model was trained to model p(features | class) — the distribution of YOLO features for GOOD components, conditioned on feature type (edge, dots, distance, etc.).

At inference:
1. Extract YOLO features from the component being inspected
2. Score the features against each class-conditional distribution
3. Low score across all classes → the component is anomalous (BAD)

This is the same framework as my Master's thesis OOD work — industrial data was one of the validation domains.

### Multi-Head Conditioning

Because the 8 feature types (angle, dist1, dist6, dots, edge1-4) behave very differently, a single shared model fails. Solution: **multi-head conditioning** — one learned embedding per feature type, all sharing the same U-Net backbone.

\`\`\`python
class MultiHeadConditionalDiffusion(nn.Module):
    def __init__(self, n_features=8, embed_dim=256):
        super().__init__()
        # One embedding per feature type
        self.feature_embeddings = nn.Embedding(n_features, embed_dim)
        self.unet = ConditionalUNet(cond_dim=embed_dim)

    def forward(self, x, t, feature_type_idx):
        cond = self.feature_embeddings(feature_type_idx)
        return self.unet(x, t, cond)
\`\`\`

## Results by Feature Type

| Feature | Baseline AUROC | Method AUROC | Δ |
|---------|---------------|-------------|---|
| dots | 0.956 | 0.963 | +0.7% |
| dist6 | 0.936 | 0.941 | +0.5% |
| dist1 | 0.887 | 0.857 | −3.0% |
| angle | 0.817 | 0.568 | unreliable (few BAD samples) |
| edge1 | 0.796 | 0.818 | +2.2% |
| edge2 | 0.813 | 0.803 | −1.0% |
| edge3 | 0.744 | 0.875 | +13.1% |
| edge4 | 0.762 | 0.736 | −2.6% |

Overall AUROC: **86.7% baseline → 87.3% with separation loss** (not statistically significant at p<0.05 after Holm correction — small dataset, high variance). The **98.4% accuracy** figure refers to the binary classification accuracy (GOOD/BAD) in the production deployment.

## Production Deployment

The deployed system runs as a Docker container on an NVIDIA Jetson AGX at the factory edge:

- **Inference latency**: ~35ms per component (well within 50ms budget)
- **Throughput**: handled 28 components/minute on the production line
- **Uptime**: ran continuously for 6 weeks without restart

Key engineering decisions:
- INT8 quantization (TensorRT) without measurable accuracy loss
- Ring buffer for streaming inference
- Alert threshold calibrated to FPR < 5% (human review only for borderline cases)

## Lessons for Production ML in Manufacturing

1. **Generative models beat discriminative ones when defect examples are scarce** — you only need GOOD data
2. **Feature type matters more than architecture** — the angle feature had AUROC ~0.82 but only 2–4 BAD samples per fold, making it unreliable regardless of method
3. **Statistical rigor is non-negotiable** — a single run showing improvement can be noise. We used 5-fold CV + Holm correction
4. **Edge deployment is a different beast** — what works on a GPU server may not fit on an edge device

Full technical report: [Diffusion-Based Multi-class Defect Detection](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf)

Questions or want to discuss industrial computer vision? Reach me at ahmed.mo.0595@gmail.com.
    `
  },
  {
    slug: 'computer-vision-yolo-mastery',
    title: 'YOLOv8 for Industrial Quality Control: Architecture Decisions That Moved the Needle',
    date: '2024-10-20',
    excerpt: 'The specific architecture choices, data engineering decisions, and production deployment tricks that contributed to 98.4% defect detection accuracy on inkjet-printed building components at PROFACTOR GmbH — not a tutorial, a post-mortem.',
    tags: ['Computer Vision', 'YOLOv8', 'Deep Learning', 'Industrial AI', 'PyTorch', 'Production ML'],
    readingTime: '10 min read',
    ogImage: '/og-computer-vision-yolo-mastery.png',
    content: `
## Not a Tutorial — A Post-Mortem

Most YOLO tutorials show you how to train on COCO and get to 90% mAP in 20 lines of code. That's not industrial quality control.

In a real factory, you have: class imbalance (3:1 GOOD:BAD), image acquisition noise from production lighting, ~1,300 images total (not 118,000), and a 50ms inference budget. Here's what actually moved the needle at PROFACTOR GmbH.

## What We Used YOLO For (Not Bounding Boxes)

The first unconventional decision: we did not use YOLOv8 as a detector. We used it as a **feature extractor**.

The 8 feature types in inkjet-printed building components (edge quality, dot density, distance measurements, angular precision) don't naturally decompose into bounding boxes. The whole component image is the input; the output is a single GOOD/BAD classification per feature type.

YOLOv8's backbone was pre-trained on general visual patterns and then fine-tuned on our component geometry. We extracted the bottleneck features (after layer 9 of the backbone, before the detection head) and fed them into a downstream diffusion model. Details in the [companion post on diffusion models](/blog/diffusion-models-anomaly-detection).

## Data Engineering: The Real Work

With 1,327 components across 8 feature types:

**Class distribution problem**: 70-80% GOOD, 20-30% BAD depending on feature type. The angle feature had only 2–4 BAD samples per fold — we marked it as unreliable and excluded it from performance comparisons.

**What worked for augmentation**:
- Random brightness/contrast shifts (±20%) — simulates production lighting variation
- Horizontal/vertical flips — components are orientation-invariant
- CutMix between GOOD samples — forces feature robustness

**What didn't work**:
- Synthetic defect generation (GANs) — the synthetic defects didn't match real failure modes
- Heavy geometric augmentation — component geometry is measurement-critical; rotating a distance feature changes its meaning

**Cross-validation setup**: 5-fold stratified CV (seed=42), stratified on GOOD/BAD ratio per feature type. No data leakage between folds. This is non-negotiable when N=1,327.

## Training Details That Matter

\`\`\`python
# Key hyperparameters that moved the needle
config = {
    'lr': 1e-4,                    # lower than default — small dataset
    'batch_size': 16,              # constrained by GPU memory on edge device
    'epochs': 150,                 # with early stopping patience=15
    'warmup_epochs': 5,
    'lr_scheduler': 'cosine',
    'weight_decay': 1e-4,
    'freeze_backbone_epochs': 10,  # freeze backbone, train head first
    'unfreeze_lr_factor': 0.1,    # 10x lower LR for backbone after unfreeze
}
\`\`\`

The **freeze-then-unfreeze** strategy was critical. With 1,300 images, fine-tuning the full backbone from the start causes catastrophic forgetting of the low-level features. Freeze for 10 epochs, then unfreeze at 10× lower LR.

## Evaluation: What AUROC Tells You vs What It Doesn't

We reported AUROC as the primary metric because it's threshold-independent. The 98.4% accuracy figure is a threshold-dependent metric calibrated at FPR=5% — meaning we accept up to 5% false positives (GOOD called BAD) in exchange for the highest possible defect recall.

Per-feature AUROC was more informative:
- **dots**: 0.956 — reliable, many samples, clear defect signature
- **dist6**: 0.936 — reliable
- **edge3**: 0.744 — hard problem, high variance across folds
- **angle**: 0.817 ± 0.138 (std!) — unreliable, too few BAD samples

Reporting a single overall accuracy hides this heterogeneity. In a real deployment, you'd set different thresholds per feature type.

## Production: From 35ms Research to 35ms Production

The model that ran in research (FP32, batch inference on A100) and the model that ran in production (INT8, streaming on Jetson AGX) had the same architecture but different weight precision.

INT8 quantization with TensorRT calibration:
- **Calibration set**: 100 GOOD samples, balanced across feature types
- **Accuracy loss**: <0.3% AUROC — acceptable
- **Latency improvement**: 35ms → 18ms (2× speedup)
- **Memory reduction**: 4× smaller model footprint

We ultimately ran at FP16 in production (not INT8) because INT8 showed occasional instability on specific edge/angle features. FP16 at 35ms was within the 50ms budget with margin.

## What I'd Do Differently

1. **Collect more BAD samples aggressively from day one** — the angle feature's unreliability was entirely a data problem, not a model problem
2. **Use Monte Carlo Dropout as a confidence signal** in addition to the diffusion score — gives a second, orthogonal uncertainty estimate
3. **Log everything from the start** — Weights & Biases was added mid-project; early experiment results were lost in local files

The full technical report is published: [Diffusion-Based Multi-class Defect Detection PDF](https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf).
    `
  },
  {
    slug: '5-month-llm-adventure',
    title: 'Shipping Faultrix: What I Learned Building an AI SaaS From Zero in 5 Months',
    date: '2025-11-15',
    excerpt: 'I went from a research background (diffusion models, computer vision) to shipping a production AI SaaS — Faultrix, an AI-powered construction quality control platform generating ÖNORM-compliant reports in under 1 minute. Here\'s what the gap between "AI research" and "AI product" actually looks like.',
    tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'Production AI', 'Faultrix', 'Entrepreneurship'],
    readingTime: '9 min read',
    ogImage: '/og-5-month-llm-adventure.png',
    content: `
## What I Built

[Faultrix](https://faultrix.com) is an AI-powered construction quality control SaaS. A building inspector uploads photos of a construction site; Faultrix analyzes them and generates a legally compliant ÖNORM B 2110 technical report — with SHA-256 evidence chain, DSGVO compliance, AES-256 encryption — in under 1 minute.

I built it solo, from zero to production, in 5 months. Coming from a pure research background (diffusion models, OOD detection at JKU Linz), here's what surprised me about the gap between AI research and AI product.

## The Tech Stack and Why

**Frontend & Backend**: Next.js 14 App Router with TypeScript. React Server Components make the AI streaming UX straightforward. TypeScript caught enough bugs early that the extra setup was worth it on day 1.

**Database & Backend logic**: Convex. Real-time reactive queries, serverless functions, and built-in file storage. For a solo developer building a data-intensive SaaS, Convex's all-in-one approach beats stitching together Supabase + separate serverless functions.

**Authentication**: Clerk. Complete auth in 2 hours including organization management and webhooks to Convex. The opportunity cost of building auth yourself in 2025 approaches infinity.

**File storage**: Cloudflare R2. S3-compatible API, zero egress fees, and edge distribution. For image-heavy SaaS this is a meaningful cost difference at scale.

**AI layer**: OpenAI API (GPT-4o + Vision). The construction defect analysis uses vision + structured output extraction to produce JSON that maps to the ÖNORM report schema.

**Payments**: Stripe. 45 minutes to working checkout, webhooks handled, subscription management done.

**Security**: SHA-256 evidence hashing on every uploaded image (makes the report legally defensible), AES-256 encryption at rest for all documents.

## The Hardest Part Wasn't the AI

I expected the AI part to be hard. It wasn't. The GPT-4o vision API is remarkably capable at identifying construction defects when given a well-structured prompt and output schema.

The hard parts:
- **ÖNORM compliance**: The Austrian standard for construction technical documentation is not AI-friendly. Getting the output to match the exact required section structure, terminology, and formatting took 3 weeks of iteration with real building inspectors.
- **Evidence chain**: A report is legally defensible only if you can prove the photos weren't altered. The SHA-256 pipeline sounds simple but the UX of surfacing it without confusing users is non-trivial.
- **Pricing**: "How much should AI-generated ÖNORM reports cost?" has no obvious answer. I interviewed 12 building inspectors and construction companies before landing on a pricing structure.

## What Research Background Actually Transfers

**Transfers well**:
- Systematic experimentation (prompt engineering is just hyperparameter tuning with words)
- Evaluation rigor — I built proper test suites for the AI outputs before shipping
- Understanding model limitations — knowing when to trust GPT-4o and when to flag for human review

**Does not transfer**:
- Product intuition — researchers optimize for correctness; users optimize for "does this save me time"
- Distribution shift in production is a UX problem, not just a model problem
- You cannot ablate your way to product-market fit

## One Thing I'd Tell a Research-to-Product Engineer

The first version of Faultrix had a beautiful, fully accurate AI analysis pipeline and a terrible UX. Users churned because the interface required 8 steps to upload photos. The AI was irrelevant — the UX was the product.

Ship the simplest version that delivers the core value (in Faultrix's case: "upload photos → get report"). Then add sophistication. Do not add sophistication before you have users.

Try it at [faultrix.com](https://faultrix.com). If you're in construction or building inspection in the DACH region, I'd love your feedback — ahmed.mo.0595@gmail.com.
    `
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
