'use client'

import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageCircle, X } from 'lucide-react'
import { useI18n, type Language, type TranslationMap } from '@/lib/i18n'

type ChatRole = 'user' | 'assistant'
type ApiRole = ChatRole | 'system'

type ChatMessage = {
  role: ChatRole
  content: string
  followUps?: string[]
}

type ApiMessage = {
  role: ApiRole
  content: string
}

type ApiErrorDetail = { message?: string; type?: string; code?: string }

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
}

type ProviderConfig = {
  name: 'Groq' | 'Z.ai'
  token: string
  url: string
  body: Record<string, unknown>
}

type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: ProviderConfig['name']
}

const GROQ_MODEL = 'llama-3.1-8b-instant'
const ZAI_MODEL = 'glm-4.5-airx'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const ZAI_CHAT_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

const SYSTEM_PROMPT = `You are Ahmed Mohammed's portfolio assistant. Answer questions about Ahmed in a short, friendly, professional way, as if you are his representative. Stay on topic — only answer questions related to Ahmed's work, skills, projects, and background. If asked something unrelated, politely redirect.

RESPONSE STYLE:
- Keep every answer under 60 words unless the user explicitly asks for detail.
- Prefer 1-3 short sentences or 2-3 compact bullets.
- Lead with the direct answer, then stop.
- Avoid repeating background facts unless they are needed.
- End naturally; the UI will provide follow-up questions separately.

---

NAME: Ahmed Mohammed
ROLE: AI/ML Engineer & Entrepreneur
LOCATION: Linz, Austria
EMAIL: ahmed.mo.0595@gmail.com
LINKEDIN: https://www.linkedin.com/in/ahmed-3m/
GITHUB: https://github.com/ahmed-3m
WEBSITE: https://ahmed-3m.github.io
OPEN TO: Senior AI/ML roles and research collaborations.

---

EDUCATION:
- M.Sc. in Artificial Intelligence, Johannes Kepler University Linz (Oct 2024 – Mar 2026). Thesis: "Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control" — 99.03% ± 0.07% average AUROC with Separation Loss, supervised by Prof. Sepp Hochreiter (inventor of LSTM).
- B.Sc. in Mechatronics Engineering, Eastern Mediterranean University, Cyprus (Feb 2015 – Jan 2018). Thesis: SCARA robotic system for dynamic object tracking with real-time control and sensor integration.

---

EXPERIENCE:
- Founder & Full-Stack Developer at Faultrix (Jul 2025 – Present): Built AI construction analysis SaaS platform solo from zero to production. Stack: Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, Stripe. Generates ÖNORM-compliant reports with SHA-256 evidence chain and AES-256 encryption in under 1 minute. DSGVO compliant.
- ML Researcher at JKU Machine Learning Institute (Dec 2024 – Mar 2026): Master's thesis research under Prof. Sepp Hochreiter.
- Machine Vision Researcher at PROFACTOR GmbH / JKU Linz (Apr 2024 – Nov 2024): YOLO + diffusion model pipeline for industrial defect detection (Track 2 of M.Sc. thesis). Evaluated on the public FTI_Zer0P dataset under strict 5-fold CV, achieving a baseline of 0.8673 ± 0.0230 AUROC.
- AI Research Intern at Karunya University, India — Remote (Aug 2023 – Oct 2023): RNN/CNN for EEG motor imagery classification. LSTM, Bi-LSTM, GRU hyperparameter optimization.
- AI & Programming Tutor, Freelance (Jan 2021 – Present): Python, ML, Deep Learning mentoring.

---

SKILLS:
- Deep Learning: PyTorch, PyTorch Lightning, Diffusion Models (DDPM/UNet), CNNs, Transformers, RNNs, LLMs
- Computer Vision: OOD Detection, Object Detection (YOLOv8), Defect Detection, Image Classification
- Research: Hydra, Experiment Design, Ablation Studies, AUROC/FPR95, Monte Carlo, Cross-Validation
- ML Engineering: End-to-End Pipelines, LLM Inference, Prompt Engineering, OpenAI API
- Infrastructure: Docker, Git, Linux, REST APIs, TypeScript, Next.js, Convex, CUDA, Python, OpenCV
- Languages: Arabic (Native), English (B2 Professional), German (B1 CEFR)

---

GITHUB PROJECTS:

1. DiffusionOOD (github.com/ahmed-3m/DiffusionOOD) — Master's Thesis core implementation.
   - Implements a binary conditional diffusion model (UNet) for OOD detection on CIFAR-10.
   - Key innovation: Separation Loss — adds training signal L_sep = -MSE(pred_c0, pred_c1) that pushes the two class conditions apart, improving discrimination. L_total = L_MSE + λ·L_sep.
   - At λ=0.02: 99.03% ± 0.07% AUROC (3 seeds), vs 92.52% ± 11.07% without separation loss.
   - Auditable seed-42 artifact: 98.98% AUROC, FPR@95 of 4.7%.
   - Generalizes zero-shot to 5 external OOD datasets: CIFAR-100 (96.97%), Places365 (96.50%), FashionMNIST (94.03%), Textures (92.84%), SVHN (90.50%).
   - Outperforms all one-class baselines: OC-SVM (63%), Deep SVDD (61.7%), DROCC (81.7%), CSI (89.8%), PANDA (95.4%), Mean-Shifted CL (97.5%).
   - Inference: sample K random timesteps, denoise under both conditions, score = mean[MSE(c=0) - MSE(c=1)]. No test-time fine-tuning needed.
   - Stack: Python, PyTorch, PyTorch Lightning, Hydra, W&B.

2. InkjetOOD (github.com/ahmed-3m/InkjetOOD) — Industrial transfer of the thesis method.
   - Applies the same conditional diffusion architecture to inkjet print quality control (FTI_Zer0P dataset from PROFACTOR/Zenodo).
   - YOLOv8 detects 8 print features (dots, distances, angle, edge regions), CDM scores each crop.
   - Best result: λ=0 baseline, 0.8673 ± 0.0230 AUROC (5-fold cross-validation).
   - Key finding: separation loss helps strongly on CIFAR-10 (+6.5pp) but not on this small industrial dataset (≈0pp) — shows the method's boundary conditions.
   - Pretrained weights on Hugging Face: ahmed-3m/InkjetOOD (YOLOv8: 0.950 mAP@50, CDM: 34.2M params).
   - Stack: Python, PyTorch, YOLOv8/Ultralytics, HuggingFace.

3. Occluded-Object-Detection-With-Tracking (github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking)
   - Detects and tracks occluded people in video using YOLOv3 + centroid-based tracker.
   - Outputs video with bounding boxes and tracked trajectories.
   - Stack: Python, OpenCV, YOLOv3.

4. Motor-Imagery-Classification (github.com/ahmed-3m/Motor-Imagery-classification)
   - EEG-based motor imagery classification for brain-computer interfaces using PhysioNet database.
   - Compared LSTM, Bi-LSTM, GRU, CNN+GRU, Bi-LSTM-CNN architectures.
   - Best accuracy with LSTM and Bi-LSTM models.
   - Done during AI research internship at Karunya University.
   - Stack: Python, Jupyter, TensorFlow/Keras.

5. OOD-diffusion-detector (github.com/ahmed-3m/OOD-diffusion-detector)
   - Binary diffusion-based classifier for OOD detection on CIFAR-10 airplanes.
   - Earlier iteration of the thesis work. Stack: PyTorch, Python.

6. ood-diffusion (github.com/ahmed-3m/ood-diffusion)
   - Diffusion models for OOD detection with training and evaluation scripts.
   - Stack: PyTorch Lightning, Python.

7. conditional_diffusion (github.com/ahmed-3m/conditional_diffusion)
   - Early prototype: conditional diffusion model for CIFAR-10 binary classification (airplane vs rest).
   - UNet2DConditionModel with cross-attention, class embeddings, DDPMScheduler.
   - Multi-GPU training support, W&B integration, classification via noise prediction error.
   - This is the direct precursor to the DiffusionOOD thesis repo.
   - Stack: Python, PyTorch, Lightning, diffusers, W&B.

8. DRL- (github.com/ahmed-3m/DRL-)
   - Deep Reinforcement Learning university assignments.
   - Implemented DQN training loop for Pong (Atari) and MlpMinigridPolicy.
   - DQNNetwork_atari: 2 conv layers (4→16 with 8×8 kernel/stride 4, then 16→32 with 4×4/stride 2) + linear layers.
   - Achieved highest reward of 20.64 on the Pong agent.
   - Stack: Python, PyTorch.

9. deploy-adk-agent-engine (github.com/ahmed-3m/deploy-adk-agent-engine)
   - Exploration of Google Agent Development Kit (ADK) with Vertex AI deployment.
   - Implements a message-shortening agent deployed to Google Cloud.
   - Shows familiarity with agentic AI frameworks and cloud deployment (GCP, Vertex AI).
   - Stack: Python, Google ADK, Vertex AI, Poetry.

10. thesis-diffusion-ood-latex (github.com/ahmed-3m/thesis-diffusion-ood-latex)
    - Full LaTeX source for the Master's thesis document.
    - Thesis title: "Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control."
    - Public artefacts: DiffusionOOD (CIFAR-10 code), InkjetOOD (industrial code), FTI_Zer0P dataset on Zenodo.

11. Image-extrapolation-challenge-2021 (github.com/ahmed-3m/Image-extrapolation-challenge-2021)
    - CNN-based image extrapolation: predicts masked/missing pixel regions in images.
    - Configurable architecture: n_hidden_layers, n_kernels, kernel_size as hyperparameters.
    - Input: 2-channel tensor (image + mask). Output: predicted missing pixels.
    - University challenge project from 2021. Stack: Python, PyTorch.

12. zer0p_notebooks (github.com/ahmed-3m/zer0p_notebooks)
    - Research experiment notebooks from the PROFACTOR Zer0P project (zero-defect inkjet printing).
    - Contains 4 experiment notebooks including feature classifier experiments (Experiment_0_3, Experiment_7_10, Experiment_14_10, Experiment_15_10).
    - These are the raw R&D notebooks behind the InkjetOOD paper work done at PROFACTOR GmbH.
    - Stack: Python, Jupyter.

13. PPO-for-Beginners (github.com/ahmed-3m/PPO-for-Beginners)
    - Forked reference repo: a clean PyTorch PPO implementation by Eric Yu used as a study resource.
    - Implements Proximal Policy Optimization from scratch with continuous action/observation spaces.
    - Ahmed used this while studying deep reinforcement learning (alongside the DRL- assignments repo).
    - Stack: Python, PyTorch, Gym.

HUGGING FACE: huggingface.co/ahmed-3m — hosts pretrained InkjetOOD model weights (cdm_v3_baseline.pt, yolo_best.pt, per-feature checkpoints).

---

KEY NUMBERS:
- 99.03% ± 0.07% average AUROC — OOD detection on CIFAR-10 (thesis, DiffusionOOD)
- +6.5pp improvement over non-separated baseline (from 92.52% ± 11.07% to 99.03% ± 0.07% average AUROC) with separation loss
- 98.98% AUROC (seed 42) — within-CIFAR airplane-vs-rest split
- 0.8673 ± 0.0230 AUROC — inkjet print quality control public FTI_Zer0P benchmark (5-fold CV)
- <1 min report generation — Faultrix
- 4+ years in AI/ML`

const MAX_REPLY_CHARS = 650

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
}

const CHAT_COPY = {
  dialogLabel: { en: 'Ask about Ahmed', de: 'Frage zu Ahmed', fr: 'Questions sur Ahmed', es: 'Pregunta sobre Ahmed', ar: 'اسأل عن أحمد' },
  title: { en: 'Ask about Ahmed', de: 'Frage zu Ahmed', fr: 'Questions sur Ahmed', es: 'Pregunta sobre Ahmed', ar: 'اسأل عن أحمد' },
  welcome: {
    en: "Ask anything about Ahmed's work, research, projects, or background.",
    de: 'Frag alles uber Ahmeds Arbeit, Forschung, Projekte oder Hintergrund.',
    fr: 'Posez une question sur le travail, la recherche, les projets ou le parcours d Ahmed.',
    es: 'Pregunta sobre el trabajo, la investigacion, los proyectos o la trayectoria de Ahmed.',
    ar: 'اسأل عن عمل أحمد أو أبحاثه أو مشاريعه أو خلفيته.',
  },
  placeholder: { en: 'Ask about Ahmed...', de: 'Frage zu Ahmed...', fr: 'Question sur Ahmed...', es: 'Pregunta sobre Ahmed...', ar: 'اسأل عن أحمد...' },
  close: { en: 'Close chat', de: 'Chat schliessen', fr: 'Fermer le chat', es: 'Cerrar chat', ar: 'إغلاق الدردشة' },
  open: { en: 'Open chat', de: 'Chat offnen', fr: 'Ouvrir le chat', es: 'Abrir chat', ar: 'فتح الدردشة' },
  send: { en: 'Send message', de: 'Nachricht senden', fr: 'Envoyer le message', es: 'Enviar mensaje', ar: 'إرسال الرسالة' },
  missingToken: {
    en: 'Add NEXT_PUBLIC_GROQ_TOKEN or NEXT_PUBLIC_ZAI_TOKEN to enable the assistant.',
    de: 'Fuge NEXT_PUBLIC_GROQ_TOKEN oder NEXT_PUBLIC_ZAI_TOKEN hinzu, um den Assistenten zu aktivieren.',
    fr: 'Ajoutez NEXT_PUBLIC_GROQ_TOKEN ou NEXT_PUBLIC_ZAI_TOKEN pour activer l assistant.',
    es: 'Agrega NEXT_PUBLIC_GROQ_TOKEN o NEXT_PUBLIC_ZAI_TOKEN para activar el asistente.',
    ar: 'أضف NEXT_PUBLIC_GROQ_TOKEN أو NEXT_PUBLIC_ZAI_TOKEN لتفعيل المساعد.',
  },
  genericError: {
    en: 'Something went wrong while contacting the assistant.',
    de: 'Beim Kontaktieren des Assistenten ist etwas schiefgelaufen.',
    fr: 'Une erreur est survenue en contactant l assistant.',
    es: 'Algo salio mal al contactar al asistente.',
    ar: 'حدث خطأ أثناء الاتصال بالمساعد.',
  },
} satisfies Record<string, TranslationMap>

// ── Follow-up chip generation ─────────────────────────────────────────────

const FOLLOWUP_MAP: Array<{ pattern: RegExp; chips: readonly string[] }> = [
  {
    pattern: /faultrix|saas|construction|report|önorm|dsgvo|sha.?256|aes.?256/i,
    chips: [
      'What tech stack powers Faultrix?',
      'How long does a report take?',
      'Is Faultrix DSGVO compliant?',
      'How was Faultrix built?',
      'What makes Faultrix different?',
      'Can I see the product story?',
    ],
  },
  {
    pattern: /thesis|ood|out.of.distribution|diffusion|auroc|cifar|separation loss|generative classifier/i,
    chips: [
      "What's the key innovation in the thesis?",
      'How does the separation loss work?',
      'What datasets were tested on?',
      'How does it compare to other OOD methods?',
      'What was the best AUROC?',
      'Why use diffusion for OOD?',
    ],
  },
  {
    pattern: /profactor|inkjet|defect|yolo|zer0p|industrial/i,
    chips: [
      'What accuracy did the system achieve?',
      'What is the Zer0P project?',
      'How does the YOLO + diffusion pipeline work?',
      'What was Ahmed responsible for?',
      'Where was this work done?',
    ],
  },
  {
    pattern: /tech|stack|framework|pytorch|next\.?js|python|docker|convex/i,
    chips: [
      'What AI frameworks does he use?',
      "What's his web dev stack?",
      'Any cloud or infra experience?',
      'What tools does he use for research?',
      'What is his strongest stack?',
    ],
  },
  {
    pattern: /hire|open to work|available|role|position|job|looking|recruit/i,
    chips: [
      'What kind of roles interest him?',
      "What's his email?",
      'Can I see his LinkedIn?',
      'What are his strongest selling points?',
      'Where is Ahmed based?',
    ],
  },
  {
    pattern: /eeg|bci|brain|motor imagery/i,
    chips: [
      'What architectures were compared?',
      'Where was the BCI research done?',
      'What dataset did he use?',
      'Was it deep learning based?',
    ],
  },
  {
    pattern: /reinforcement|dqn|ppo|rl\b|atari|pong/i,
    chips: [
      'What RL algorithms were implemented?',
      'What environments were used?',
      'What score did the Pong agent reach?',
      'Was PPO from scratch?',
    ],
  },
  {
    pattern: /education|degree|university|jku|master|m\.sc/i,
    chips: [
      'Who supervised his thesis?',
      'What was his undergraduate degree in?',
      'What is JKU known for in AI?',
      'When did he study AI?',
      'Where did he study before JKU?',
    ],
  },
]

const DEFAULT_FOLLOWUPS = [
  "What's Ahmed's strongest skill?",
  'Tell me about Faultrix',
  'Summarize his thesis',
  'What projects should I see?',
  'Is he open to work?',
  'How can I contact him?',
] as const

const CHIP_TRANSLATIONS: Record<string, TranslationMap> = {
  'What is Faultrix?': { en: 'What is Faultrix?', de: 'Was ist Faultrix?', fr: 'Qu est-ce que Faultrix ?', es: 'Que es Faultrix?', ar: 'ما هو Faultrix؟' },
  'Tell me about the thesis': { en: 'Tell me about the thesis', de: 'Erzahl mir von der Thesis', fr: 'Parlez-moi du memoire', es: 'Cuéntame sobre la tesis', ar: 'حدثني عن الرسالة' },
  "What's his tech stack?": { en: "What's his tech stack?", de: 'Was ist sein Tech-Stack?', fr: 'Quel est son stack technique ?', es: 'Cual es su stack tecnico?', ar: 'ما هي تقنياته؟' },
  'Is he open to work?': { en: 'Is he open to work?', de: 'Ist er offen fur Arbeit?', fr: 'Est-il ouvert aux opportunites ?', es: 'Esta abierto a trabajo?', ar: 'هل هو متاح للعمل؟' },
  'Show key achievements': { en: 'Show key achievements', de: 'Zeig wichtige Erfolge', fr: 'Voir les principales reussites', es: 'Mostrar logros clave', ar: 'اعرض أهم الإنجازات' },
  'How can I contact him?': { en: 'How can I contact him?', de: 'Wie kann ich ihn kontaktieren?', fr: 'Comment le contacter ?', es: 'Como puedo contactarlo?', ar: 'كيف يمكنني التواصل معه؟' },
  "What's Ahmed's strongest skill?": { en: "What's Ahmed's strongest skill?", de: 'Was ist Ahmeds starkste Fahigkeit?', fr: 'Quelle est la competence la plus forte d Ahmed ?', es: 'Cual es la habilidad mas fuerte de Ahmed?', ar: 'ما أقوى مهارة لدى أحمد؟' },
  'Tell me about Faultrix': { en: 'Tell me about Faultrix', de: 'Erzahl mir von Faultrix', fr: 'Parlez-moi de Faultrix', es: 'Cuéntame sobre Faultrix', ar: 'حدثني عن Faultrix' },
  'Summarize his thesis': { en: 'Summarize his thesis', de: 'Fasse seine Thesis zusammen', fr: 'Resumez son memoire', es: 'Resume su tesis', ar: 'لخص رسالته' },
  'What projects should I see?': { en: 'What projects should I see?', de: 'Welche Projekte soll ich ansehen?', fr: 'Quels projets devrais-je voir ?', es: 'Que proyectos deberia ver?', ar: 'أي مشاريع يجب أن أرى؟' },
  'What tech stack powers Faultrix?': { en: 'What tech stack powers Faultrix?', de: 'Welcher Tech-Stack treibt Faultrix an?', fr: 'Quel stack alimente Faultrix ?', es: 'Que stack impulsa Faultrix?', ar: 'ما التقنيات التي تشغل Faultrix؟' },
  'How long does a report take?': { en: 'How long does a report take?', de: 'Wie lange dauert ein Bericht?', fr: 'Combien de temps prend un rapport ?', es: 'Cuanto tarda un informe?', ar: 'كم يستغرق التقرير؟' },
  'Is Faultrix DSGVO compliant?': { en: 'Is Faultrix DSGVO compliant?', de: 'Ist Faultrix DSGVO-konform?', fr: 'Faultrix est-il conforme DSGVO ?', es: 'Faultrix cumple DSGVO?', ar: 'هل Faultrix متوافق مع DSGVO؟' },
  'How was Faultrix built?': { en: 'How was Faultrix built?', de: 'Wie wurde Faultrix gebaut?', fr: 'Comment Faultrix a ete construit ?', es: 'Como se construyo Faultrix?', ar: 'كيف تم بناء Faultrix؟' },
  "What's the key innovation in the thesis?": { en: "What's the key innovation in the thesis?", de: 'Was ist die Kerninnovation der Thesis?', fr: 'Quelle est l innovation cle du memoire ?', es: 'Cual es la innovacion clave de la tesis?', ar: 'ما الابتكار الأساسي في الرسالة؟' },
  'How does the separation loss work?': { en: 'How does the separation loss work?', de: 'Wie funktioniert die Separation Loss?', fr: 'Comment fonctionne la separation loss ?', es: 'Como funciona la separation loss?', ar: 'كيف تعمل خسارة الفصل؟' },
  'What datasets were tested on?': { en: 'What datasets were tested on?', de: 'Welche Datensatze wurden getestet?', fr: 'Quels jeux de donnees ont ete testes ?', es: 'Que datasets se probaron?', ar: 'ما مجموعات البيانات التي تم اختبارها؟' },
  'What was the best AUROC?': { en: 'What was the best AUROC?', de: 'Was war der beste AUROC?', fr: 'Quel etait le meilleur AUROC ?', es: 'Cual fue el mejor AUROC?', ar: 'ما أفضل AUROC؟' },
  'What accuracy did the system achieve?': { en: 'What accuracy did the system achieve?', de: 'Welche Genauigkeit erreichte das System?', fr: 'Quelle precision le systeme a-t-il atteinte ?', es: 'Que precision logro el sistema?', ar: 'ما الدقة التي حققها النظام؟' },
  'What AI frameworks does he use?': { en: 'What AI frameworks does he use?', de: 'Welche KI-Frameworks nutzt er?', fr: 'Quels frameworks IA utilise-t-il ?', es: 'Que frameworks de IA usa?', ar: 'ما أطر الذكاء الاصطناعي التي يستخدمها؟' },
  "What's his email?": { en: "What's his email?", de: 'Wie lautet seine E-Mail?', fr: 'Quel est son email ?', es: 'Cual es su email?', ar: 'ما بريده الإلكتروني؟' },
  'Where is Ahmed based?': { en: 'Where is Ahmed based?', de: 'Wo ist Ahmed ansassig?', fr: 'Ou est base Ahmed ?', es: 'Donde esta Ahmed?', ar: 'أين يقيم أحمد؟' },
}

function translateChip(chip: string, t: (copy: TranslationMap | string, de?: string) => string): string {
  return CHIP_TRANSLATIONS[chip] ? t(CHIP_TRANSLATIONS[chip]) : chip
}

function shuffle<T>(items: readonly T[]): T[] {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

function generateFollowUps(reply: string, question = ''): string[] {
  const context = `${question} ${reply}`
  for (const { pattern, chips } of FOLLOWUP_MAP) {
    if (pattern.test(context)) {
      return shuffle(chips).slice(0, 4)
    }
  }
  return shuffle(DEFAULT_FOLLOWUPS).slice(0, 4)
}

function shortenReply(reply: string): string {
  if (reply.length <= MAX_REPLY_CHARS) return reply

  const compact = reply.replace(/\n{3,}/g, '\n\n').trim()
  const boundary = compact.lastIndexOf('.', MAX_REPLY_CHARS)
  const end = boundary > 220 ? boundary + 1 : MAX_REPLY_CHARS
  return `${compact.slice(0, end).trim()}...`
}

function isConfiguredToken(token: string | undefined): token is string {
  return Boolean(token && token !== 'your_groq_token_here' && token !== 'your_zai_token_here')
}

function createChatError(
  message: string,
  provider: ProviderConfig['name'],
  status?: number,
  code?: string
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  return error
}

function isGroqLimitError(error: unknown): error is ChatCompletionError {
  if (!(error instanceof Error)) return false

  const err = error as ChatCompletionError
  const message = err.message.toLowerCase()
  return (
    err.provider === 'Groq' &&
    (err.status === 429 ||
      err.code === 'rate_limit_exceeded' ||
      err.code === 'quota_exceeded' ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('limit reached'))
  )
}

async function requestChatCompletion(provider: ProviderConfig): Promise<string> {
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(provider.body),
  })

  const data = (await response.json()) as ChatCompletionResponse

  if (!response.ok) {
    const errorDetail = typeof data.error === 'string' ? undefined : data.error
    const errMsg =
      typeof data.error === 'string'
        ? data.error
        : errorDetail?.message ?? `${provider.name} could not respond right now.`

    if (provider.name === 'Groq' && response.status === 503) {
      throw createChatError('Model is warming up, try again in a moment.', provider.name, response.status)
    }

    throw createChatError(errMsg, provider.name, response.status, errorDetail?.code)
  }

  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw createChatError(`${provider.name} returned an empty response.`, provider.name)

  return reply
}

// ── Markdown renderer ─────────────────────────────────────────────────────

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-b${i}`}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={`${keyPrefix}-i${i}`}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const result: React.ReactNode[] = []
  const pending: string[] = []
  let k = 0

  const flushList = () => {
    if (pending.length === 0) return
    const key = `ul-${k++}`
    result.push(
      <ul key={key} style={{ paddingLeft: '1.1em', margin: '0.25em 0', listStyleType: 'disc' }}>
        {pending.map((item, i) => (
          <li key={i} style={{ margin: '0.1em 0' }}>
            {renderInline(item, `${key}-li${i}`)}
          </li>
        ))}
      </ul>
    )
    pending.length = 0
  }

  for (const [i, line] of lines.entries()) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    const bullet = line.match(/^[-*]\s+(.+)/)

    if (heading) {
      flushList()
      result.push(
        <span key={`h-${i}`} style={{ display: 'block', fontWeight: 600, marginTop: '0.5em', marginBottom: '0.1em' }}>
          {renderInline(heading[2], `h-${i}`)}
        </span>
      )
    } else if (bullet) {
      pending.push(bullet[1])
    } else {
      flushList()
      if (line.trim() === '') {
        if (result.length > 0) result.push(<div key={`sp-${i}`} style={{ height: '0.4em' }} />)
      } else {
        result.push(
          <span key={`l-${i}`} style={{ display: 'block' }}>
            {renderInline(line, `l-${i}`)}
          </span>
        )
      }
    }
  }
  flushList()

  return <>{result}</>
}

// ── GA4 event tracking (fires only if Analytics is configured) ────────────

function trackChatEvent(question: string) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-expect-error gtag is injected by Google Analytics
    window.gtag('event', 'chat_message', {
      event_category: 'chatbot',
      event_label: question.slice(0, 100),
    })
  }
}

// ── Styles ────────────────────────────────────────────────────────────────

const STARTER_PROMPTS = [
  'What is Faultrix?',
  'Tell me about the thesis',
  "What's his tech stack?",
  'Is he open to work?',
  'Show key achievements',
  'How can I contact him?',
] as const

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(19, 23, 31, 0.99) 0%, rgba(8, 9, 13, 0.99) 100%)',
  borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255,255,255,0.02)',
  fontFamily: 'var(--font-body)',
} satisfies CSSProperties

const bubbleStyles = {
  assistant: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
    color: 'var(--cd-fg1)',
  },
  user: {
    background: 'linear-gradient(135deg, var(--cd-accent, #7c3aed) 0%, rgba(0, 212, 255, 0.82) 100%)',
    borderColor: 'rgba(0,212,255,0.22)',
    color: '#031018',
  },
} satisfies Record<ChatRole, CSSProperties>

const chipStyle = {
  borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--cd-fg2)',
} satisfies CSSProperties

// ── Sub-components ────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
      style={bubbleStyles.assistant}
      aria-label="Ahmed is typing"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--cd-accent, #7c3aed)',
            animation: `pulse-dot 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function ChatBot() {
  const { lang, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage(messageText: string) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const groqToken = process.env.NEXT_PUBLIC_GROQ_TOKEN
    const zaiToken = process.env.NEXT_PUBLIC_ZAI_TOKEN ?? process.env.NEXT_PUBLIC_ZAI_API_KEY
    const hasGroqToken = isConfiguredToken(groqToken)
    const hasZaiToken = isConfiguredToken(zaiToken)

    if (!hasGroqToken && !hasZaiToken) {
      setError(t(CHAT_COPY.missingToken))
      return
    }

    const nextUserMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, nextUserMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)
    trackChatEvent(content)

    try {
      const payloadMessages: ApiMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content: `Answer in ${LANGUAGE_NAMES[lang]}. Keep names, product names, repository names, and technical metrics unchanged.`,
        },
        ...nextMessages.map(({ role, content }) => ({ role, content })),
      ]

      const groqProvider: ProviderConfig | null = hasGroqToken
        ? {
            name: 'Groq',
            token: groqToken,
            url: GROQ_CHAT_URL,
            body: {
              model: GROQ_MODEL,
              messages: payloadMessages,
              max_tokens: 140,
              temperature: 0.55,
            },
          }
        : null

      const zaiProvider: ProviderConfig | null = hasZaiToken
        ? {
            name: 'Z.ai',
            token: zaiToken,
            url: ZAI_CHAT_URL,
            body: {
              model: ZAI_MODEL,
              messages: payloadMessages,
              max_tokens: 140,
              temperature: 0.55,
              stream: false,
              thinking: { type: 'disabled' },
            },
          }
        : null

      let rawReply: string
      try {
        rawReply = groqProvider
          ? await requestChatCompletion(groqProvider)
          : await requestChatCompletion(zaiProvider!)
      } catch (providerError) {
        if (!isGroqLimitError(providerError) || !zaiProvider) throw providerError
        rawReply = await requestChatCompletion(zaiProvider)
      }

      const reply = shortenReply(rawReply)

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, followUps: generateFollowUps(reply, content) },
      ])
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t(CHAT_COPY.genericError)
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handleChip(prompt: string) {
    void sendMessage(prompt)
  }

  return (
    <>
      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-20 right-4 z-[9998] w-[min(380px,calc(100vw-2rem))] transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <section
          id="ahmed-chatbot-panel"
          className="flex h-[min(480px,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-3xl border"
          style={panelStyle}
          role="dialog"
          aria-label={t(CHAT_COPY.dialogLabel)}
        >
          {/* Header */}
          <header
            className="flex items-center justify-between border-b px-4 py-4"
            style={{ borderColor: 'var(--cd-border, rgba(255,255,255,0.08))' }}
          >
            <h2
              className="text-sm font-semibold tracking-[0.02em]"
              style={{ color: 'var(--cd-fg1)' }}
            >
              {t(CHAT_COPY.title)}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--cd-fg2)',
              }}
              aria-label={t(CHAT_COPY.close)}
            >
              <X size={16} />
            </button>
          </header>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div
                  className="max-w-[85%] rounded-2xl border px-3 py-2.5 text-sm leading-6"
                  style={bubbleStyles.assistant}
                >
                  {t(CHAT_COPY.welcome)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleChip(translateChip(prompt, t))}
                      disabled={isLoading}
                      className="rounded-full border px-3 py-2 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      style={chipStyle}
                    >
                      {translateChip(prompt, t)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  !messages.slice(index + 1).some((m) => m.role === 'assistant')

                return (
                  <div key={`${message.role}-${index}`} className="space-y-2">
                    {/* Bubble */}
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl border px-3 py-2.5 text-sm leading-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]${
                          message.role === 'user' ? ' whitespace-pre-wrap' : ''
                        }`}
                        style={bubbleStyles[message.role]}
                      >
                        {message.role === 'assistant'
                          ? renderMarkdown(message.content)
                          : message.content}
                      </div>
                    </div>

                    {/* Follow-up chips — only under the last assistant reply */}
                    {isLastAssistant &&
                      !isLoading &&
                      message.followUps &&
                      message.followUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {message.followUps.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handleChip(translateChip(chip, t))}
                              disabled={isLoading}
                              className="rounded-full border px-3 py-1.5 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                              style={chipStyle}
                            >
                              {translateChip(chip, t)}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                )
              })
            )}

            {isLoading && (
              <div className="flex justify-start">
                <LoadingDots />
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="border-t px-4 pb-4 pt-3"
            style={{ borderColor: 'var(--cd-border, rgba(255,255,255,0.08))' }}
          >
            {error && (
              <p className="mb-3 text-xs leading-5" style={{ color: '#f59e0b' }}>
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(CHAT_COPY.placeholder)}
                className="h-11 flex-1 rounded-2xl border px-4 text-sm outline-none transition-colors"
                style={{
                  borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--cd-fg1)',
                }}
                aria-label={t(CHAT_COPY.dialogLabel)}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'var(--cd-accent, #7c3aed)',
                  color: 'var(--cd-bg)',
                  boxShadow: '0 12px 30px rgba(0, 212, 255, 0.22)',
                }}
                aria-label={t(CHAT_COPY.send)}
              >
                <ArrowUp size={17} />
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* ── Toggle button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-[9999] inline-flex h-14 w-14 items-center justify-center rounded-full border transition-transform duration-300 ease-out hover:-translate-y-0.5"
        style={{
          background: 'var(--cd-accent, #7c3aed)',
          borderColor: 'rgba(255,255,255,0.12)',
          color: 'var(--cd-bg)',
          boxShadow: '0 18px 40px rgba(0, 212, 255, 0.24)',
        }}
        aria-expanded={isOpen}
        aria-controls="ahmed-chatbot-panel"
        aria-label={isOpen ? t(CHAT_COPY.close) : t(CHAT_COPY.open)}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
