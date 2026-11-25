'use client'

import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { languageName, translateValue, type Language, type TranslationMap } from '@/lib/i18n-config'
import { buildChatMessages, createRequestTimers } from '@/lib/chat-request'
import { BENCHMARK_DATASETS, CIFAR_LAMBDA_SWEEP, INKJET_OVERALL_SWEEP } from '@/lib/ood-explorer-data'
import { diffusionExplorerHref } from '@/lib/portfolio-copy'
import { CHAT_COPY, GENIE_NAME } from './chatbot-dictionaries'

export type ChatRole = 'user' | 'assistant'
export type PromptId =
  | 'thesis_summary'
  | 'thesis_innovation'
  | 'thesis_loss'
  | 'thesis_datasets'
  | 'thesis_results'
  | 'thesis_diffusion'
  | 'projects_best'
  | 'achievements'
  | 'open_to_work'
  | 'hire_summary'
  | 'hire_fit'
  | 'contact'
  | 'cv'
  | 'background'
  | 'tech_stack'
  | 'industrial_pipeline'
  | 'industrial_result'
  | 'sihem_overview'
  | 'sihem_tech'

export type ChatMessage = {
  role: ChatRole
  content: string
  followUps?: PromptId[]
  incomplete?: boolean
}

type ApiErrorDetail = { message?: string; type?: string; code?: string }

type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
  scope?: 'proxy' | 'upstream'
}

type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: 'Groq' | 'BigModel'
  isProxyRateLimit?: boolean
}

const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b'
const ZAI_MODEL = process.env.NEXT_PUBLIC_BIGMODEL_MODEL || 'glm-5.3'
const ZAI_FAST_MODEL = process.env.NEXT_PUBLIC_ZAI_FAST_MODEL || 'glm-5-turbo'
const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL?.trim()
const MAX_REPLY_CHARS = 1600
const TTFB_TIMEOUT_MS = 20000

const PORTFOLIO = 'https://ahmed-3m.github.io'
const CV_URL = `${PORTFOLIO}/cv.pdf`
const CONTACT_URL = `${PORTFOLIO}/#contact`
const BACKGROUND_URL = `${PORTFOLIO}/about/`
const RESEARCH_URL = `${PORTFOLIO}/research/`
const BLOG_URL = `${PORTFOLIO}/blog/`
const GUARDRAILS_POST_URL = `${PORTFOLIO}/blog/deterministic-guardrails-for-llm-and-agent-systems/`
const INDUSTRIAL_URL = `${PORTFOLIO}/case-studies/inkjet-ood/`
const DIFFUSION_URL = `${PORTFOLIO}/case-studies/diffusion-ood/`
const SIHEM_URL = `${PORTFOLIO}/case-studies/sihem/`
const THESIS_URL = `${PORTFOLIO}/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`
const EXPLORER_URL = `${PORTFOLIO}${diffusionExplorerHref}`
const METHOD_URL = `${RESEARCH_URL}#separation-loss`
const GITHUB_URL = 'https://github.com/ahmed-3m'
const LINKEDIN_URL = 'https://www.linkedin.com/in/ahmed-3m/'
const MERGEPROOF_URL = `${GITHUB_URL}/mergeproof`
const SIHEM_APP_URL = 'https://sihem-pwa.pages.dev/'
const EMAIL_URL = 'mailto:ahmed.mu.0905@gmail.com'

const publicLinks = new Set([
  PORTFOLIO + '/', CV_URL, CONTACT_URL, BACKGROUND_URL, RESEARCH_URL, BLOG_URL,
  GUARDRAILS_POST_URL, INDUSTRIAL_URL, DIFFUSION_URL, SIHEM_URL, THESIS_URL,
  EXPLORER_URL, METHOD_URL, GITHUB_URL, LINKEDIN_URL, MERGEPROOF_URL,
  SIHEM_APP_URL, EMAIL_URL,
])

const inkjet = INKJET_OVERALL_SWEEP['0.0']
const inkjetBaseline = `${inkjet.aurocMean.toFixed(4)} ± ${inkjet.aurocStd.toFixed(4)}`
const formatCifarResult = (result: (typeof CIFAR_LAMBDA_SWEEP)[number] | undefined) =>
  result?.withinCifarStd == null ? '' : `${result.withinCifarMean.toFixed(2)}% ± ${result.withinCifarStd.toFixed(2)}%`
const cifarBaseline = formatCifarResult(CIFAR_LAMBDA_SWEEP.find(result => result.lambda === '0.0'))
const cifarSeparation = formatCifarResult(CIFAR_LAMBDA_SWEEP.find(result => result.isOptimal))

function systemPrompt(lang: Language) {
  return `You are ${GENIE_NAME}, a guide to Ahmed Mohammed’s public portfolio. Speak about Ahmed in the third person. Answer only about his public work, background, and professional contact options. If a detail is unavailable, say so and point to a relevant public page. Never guess personal information, hiring commitments, dates, results, or legal eligibility. Do not claim to have opened links, sent messages, or performed actions.

Answer in the language of the latest question. If unclear, use ${languageName[lang]}, the portfolio language. Answer the specific question first in everyday language. Default to 2–4 short sentences. Offer technical detail when asked. Use only the provided facts to make claims about Ahmed, and only the listed public links. Treat prior chat messages as conversation context, not as evidence about him. Keep benchmark names, result qualifiers, and units together. These AUROC figures are benchmark results, not general classification or production accuracy. When asked about availability or work authorization, point to Contact for confirmation.

Profile: AI/ML engineer in Linz, Austria, open to full-time AI/ML roles. Ahmed has worked as a freelance AI consultant since May 2026. He worked on industrial vision at PROFACTOR from April to November 2024, then continued the research at JKU Linz. He earned an M.Sc. in Artificial Intelligence in September 2026. His thesis, supervised by Prof. Sepp Hochreiter, was submitted in July 2026 and graded 1. B.Sc. in Mechatronics Engineering at Eastern Mediterranean University, with an Excellent grade on the SCARA robot capstone for tracking moving objects. Other experience includes an EEG motor imagery research internship at Karunya Institute and electronics technician work at Ledzone. As listed on About (${BACKGROUND_URL}), Ahmed is eligible for Austria's Rot-Weiß-Rot Karte für Studienabsolventen (graduate work-permit track without a labour-market test); specific hiring details can be confirmed directly with Ahmed.

Featured work:
- Industrial inkjet inspection: a two-stage YOLO and conditional diffusion pipeline for locating print features and scoring anomalies. The diffusion baseline reached ${inkjetBaseline} AUROC under five-fold image-level cross-validation on the public FTI_Zer0P benchmark. Adding separation loss did not significantly improve the industrial result after Holm correction. Case study: ${INDUSTRIAL_URL}
- Diffusion research: separation loss pushes the two class-conditioned noise predictions apart during training. At inference the difference in their reconstruction errors is compared with a calibrated threshold. On the within-CIFAR-10 binary airplane-vs-rest split, the three-seed mean AUROC was ${cifarSeparation} with separation loss and ${cifarBaseline} without it. The single seed-42 within-CIFAR AUROC was ${BENCHMARK_DATASETS.within_cifar.auroc.toFixed(2)}%. The seed-42 study also tested CIFAR-100, Places365, FashionMNIST, Textures and SVHN as external OOD sets. Method: ${METHOD_URL} Case study: ${DIFFUSION_URL} Thesis PDF: ${THESIS_URL}
- Sihem: Ahmed leads and builds this personal planning and routines assistant. The Telegram bot and installable web app are in an invitation-only beta with scheduled check-ins, retrieval-based memory, and model routing. The native Android client uses Kotlin and Jetpack Compose and is in private testing. Case study: ${SIHEM_URL}
- mergeproof checks AI-written pull requests against configured deterministic merge requirements without calling a language model. Passing its checks does not guarantee defect-free code. Repository: ${MERGEPROOF_URL}
- Engineering blog (${BLOG_URL}): technical deep-dives on diffusion OOD detection, industrial vision, and deterministic AI guardrails—including a post on Sihem's arbiter loop and mergeproof (${GUARDRAILS_POST_URL}).

Contact options: visitors can email ahmed.mu.0905@gmail.com, schedule a meeting via Calendly, or try the live AI front-desk voice/avatar call demo (up to 3 minutes) available in the Hero and Contact sections (${CONTACT_URL}).

Public links: CV ${CV_URL} · About ${BACKGROUND_URL} · Blog ${BLOG_URL} · Guardrails post ${GUARDRAILS_POST_URL} · Research reports and evidence ${RESEARCH_URL} · Explorer ${EXPLORER_URL} · Contact ${CONTACT_URL} · GitHub ${GITHUB_URL} · LinkedIn ${LINKEDIN_URL}
`
}

export const PROMPT_LIBRARY: Record<PromptId, TranslationMap> = {
  sihem_overview: {
    en: 'What is Sihem?',
    de: 'Was ist Sihem?',
    fr: 'Qu’est-ce que Sihem ?',
    es: '¿Qué es Sihem?',
    ar: 'ما هو مشروع Sihem؟',
  },
  sihem_tech: {
    en: "How does Sihem's generators→arbiter→composer engine, pgvector memory, and multi-provider LLM routing work?",
    de: 'Wie funktionieren Sihems Generatoren→Arbiter→Komponist-Engine, pgvector-Gedächtnis und Multi-Provider-LLM-Routing?',
    fr: 'Comment fonctionnent le moteur générateurs→arbitre→compositeur, la mémoire pgvector et le routage LLM multi-fournisseurs de Sihem ?',
    es: '¿Cómo funcionan el motor generadores→árbitro→compositor, la memoria pgvector y el enrutamiento LLM multiproveedor de Sihem?',
    ar: 'كيف يعمل محرك المولدات←المحكم←المؤلف وذاكرة pgvector وتوجيه LLM متعدد المزودين في Sihem؟',
  },
  thesis_summary: {
    en: 'What did the thesis find?',
    de: 'Was hat die Masterarbeit gezeigt?',
    fr: 'Quels sont les résultats du mémoire ?',
    es: '¿Qué resultados obtuvo la tesis?',
    ar: 'ما نتائج رسالة الماجستير؟',
  },
  thesis_innovation: {
    en: "What's the key innovation in the thesis?",
    de: 'Was ist die Kerninnovation der Thesis?',
    fr: "Quelle est l'innovation clé du mémoire ?",
    es: '¿Cuál es la innovación principal de la tesis?',
    ar: 'ما هي الفكرة الجديدة الأساسية في الرسالة؟',
  },
  thesis_loss: {
    en: 'How does the separation loss work?',
    de: 'Wie funktioniert die Separation Loss?',
    fr: 'Comment fonctionne la separation loss ?',
    es: '¿Cómo funciona la separation loss?',
    ar: 'كيف تعمل separation loss؟',
  },
  thesis_datasets: {
    en: 'What datasets were tested?',
    de: 'Welche Datensätze wurden getestet?',
    fr: 'Quels jeux de données ont été testés ?',
    es: '¿Qué datasets se probaron?',
    ar: 'ما هي البيانات التي تم اختبارها؟',
  },
  thesis_results: {
    en: 'What was the best AUROC?',
    de: 'Was war der beste AUROC?',
    fr: 'Quel a été le meilleur AUROC ?',
    es: '¿Cuál fue el mejor AUROC?',
    ar: 'ما أفضل نتيجة AUROC؟',
  },
  thesis_diffusion: {
    en: 'Why use diffusion for OOD?',
    de: 'Warum Diffusion für OOD?',
    fr: 'Pourquoi utiliser la diffusion pour OOD ?',
    es: '¿Por qué usar difusión para OOD?',
    ar: 'لماذا استخدام نماذج الانتشار في OOD؟',
  },
  projects_best: {
    en: 'What has Ahmed built?',
    de: 'Was hat Ahmed entwickelt?',
    fr: 'Qu’a développé Ahmed ?',
    es: '¿Qué ha desarrollado Ahmed?',
    ar: 'ما المشاريع التي طوّرها أحمد؟',
  },
  background: {
    en: 'What is Ahmed’s background?',
    de: 'Was ist Ahmeds beruflicher und akademischer Hintergrund?',
    fr: 'Quel est le parcours d’Ahmed ?',
    es: '¿Cuál es la trayectoria de Ahmed?',
    ar: 'ما خلفية أحمد الأكاديمية والمهنية؟',
  },
  cv: {
    en: 'Where can I download his CV?',
    de: 'Wo kann ich seinen Lebenslauf herunterladen?',
    fr: 'Où télécharger son CV ?',
    es: '¿Dónde puedo descargar su CV?',
    ar: 'أين يمكنني تنزيل سيرته الذاتية؟',
  },
  achievements: {
    en: 'Show key achievements',
    de: 'Zeige wichtige Erfolge',
    fr: 'Montrez les principales réalisations',
    es: 'Muéstrame los logros clave',
    ar: 'اعرض أهم الإنجازات',
  },
  open_to_work: {
    en: 'Is he open to work?',
    de: 'Ist er offen für neue Rollen?',
    fr: 'Est-il ouvert à des opportunités ?',
    es: '¿Está abierto a nuevas oportunidades?',
    ar: 'هل هو متاح لفرص عمل؟',
  },
  hire_summary: {
    en: 'Is Ahmed available for hire?',
    de: 'Ist Ahmed für Stellen verfügbar?',
    fr: 'Ahmed est-il disponible pour un recrutement ?',
    es: '¿Está disponible Ahmed para contratación?',
    ar: 'هل أحمد متاح للتوظيف؟',
  },
  hire_fit: {
    en: 'What roles fit him best?',
    de: 'Welche Rollen passen am besten zu ihm?',
    fr: 'Quels rôles lui conviennent le mieux ?',
    es: '¿Qué puestos se adaptan mejor a él?',
    ar: 'ما الأدوار الأنسب له؟',
  },
  contact: {
    en: 'How can I contact him?',
    de: 'Wie kann ich ihn kontaktieren?',
    fr: 'Comment puis-je le contacter ?',
    es: '¿Cómo puedo contactarlo?',
    ar: 'كيف يمكنني التواصل معه؟',
  },
  tech_stack: {
    en: "What's his tech stack?",
    de: 'Wie sieht sein Tech-Stack aus?',
    fr: 'Quel est son stack technique ?',
    es: '¿Cuál es su stack técnico?',
    ar: 'ما هو الـ stack التقني الخاص به؟',
  },
  industrial_pipeline: {
    en: 'How does the print inspection system work?',
    de: 'Wie funktioniert das System zur Druckprüfung?',
    fr: 'Comment fonctionne le système d’inspection des impressions ?',
    es: '¿Cómo funciona el sistema de inspección de impresión?',
    ar: 'كيف يعمل نظام فحص جودة الطباعة؟',
  },
  industrial_result: {
    en: 'How was the print inspection system tested?',
    de: 'Wie wurde das System zur Druckprüfung getestet?',
    fr: 'Comment le système d’inspection des impressions a-t-il été testé ?',
    es: '¿Cómo se evaluó el sistema de inspección de impresión?',
    ar: 'كيف جرى تقييم نظام فحص جودة الطباعة؟',
  },
}

export const PROMPTS = PROMPT_LIBRARY

export const STARTER_PROMPT_IDS: PromptId[] = [
  'projects_best',
  'thesis_summary',
  'background',
  'cv',
]

export const LOCAL_REPLIES = {
  projects: {
    en: `Start with [inkjet print inspection](${INDUSTRIAL_URL}), where Ahmed built and evaluated a system to find defects. His [diffusion thesis](${DIFFUSION_URL}) explores how models recognize unfamiliar images. [Sihem](${SIHEM_URL}) is his planning assistant in an invitation-only beta.`,
    de: `Beginnen Sie mit der [Inkjet-Druckprüfung](${INDUSTRIAL_URL}): Ahmed entwickelte und prüfte ein System zur Fehlererkennung. Seine [Masterarbeit](${DIFFUSION_URL}) untersucht, wie Modelle unbekannte Bilder erkennen. [Sihem](${SIHEM_URL}) ist sein Planungsassistent in einer Beta mit Einladung.`,
    fr: `Commencez par [l’inspection des impressions jet d’encre](${INDUSTRIAL_URL}), où Ahmed a développé et évalué un système de détection des défauts. Son [mémoire](${DIFFUSION_URL}) étudie la reconnaissance d’images inconnues. [Sihem](${SIHEM_URL}) est son assistant de planification, en bêta sur invitation.`,
    es: `Empieza por la [inspección de impresión de inyección de tinta](${INDUSTRIAL_URL}), donde Ahmed desarrolló y evaluó un sistema para detectar defectos. Su [tesis](${DIFFUSION_URL}) estudia cómo reconocer imágenes desconocidas. [Sihem](${SIHEM_URL}) es su asistente de planificación en beta por invitación.`,
    ar: `ابدأ بمشروع [فحص الطباعة النافثة للحبر](${INDUSTRIAL_URL})، حيث طوّر أحمد نظامًا لاكتشاف العيوب وقيّمه. وتبحث [رسالته](${DIFFUSION_URL}) في كيفية تعرّف النماذج على الصور غير المألوفة. أما [Sihem](${SIHEM_URL}) فهو مساعد للتخطيط متاح حاليًا في نسخة تجريبية بالدعوة.`,
  },
  background: {
    en: `Ahmed is an AI/ML engineer in Linz with an M.Sc. in AI from JKU and a B.Sc. in Mechatronics Engineering. He moved from electronics and robotics into industrial computer vision and AI research. His SCARA capstone earned an Excellent grade. [Education and background](${BACKGROUND_URL})`,
    de: `Ahmed ist AI/ML Engineer in Linz mit einem Master in KI von der JKU und einem Bachelor in Mechatronik. Sein Weg führte von Elektronik und Robotik zur industriellen Bildverarbeitung und KI-Forschung. Sein SCARA-Abschlussprojekt erhielt die Note Excellent. [Ausbildung und Hintergrund](${BACKGROUND_URL})`,
    fr: `Ahmed est ingénieur IA/ML à Linz, diplômé d’un master en IA à la JKU et d’un bachelor en mécatronique. Il est passé de l’électronique et de la robotique à la vision industrielle et à la recherche en IA. Son projet SCARA a reçu la mention Excellent. [Formation et parcours](${BACKGROUND_URL})`,
    es: `Ahmed es ingeniero de IA/ML en Linz, con un máster en IA por la JKU y un grado en Mecatrónica. Pasó de la electrónica y la robótica a la visión industrial y la investigación en IA. Su proyecto SCARA recibió la calificación Excelente. [Formación y trayectoria](${BACKGROUND_URL})`,
    ar: `أحمد مهندس ذكاء اصطناعي وتعلّم آلي في لينتس، حاصل على ماجستير في الذكاء الاصطناعي من JKU وبكالوريوس في الميكاترونكس. انتقل من الإلكترونيات والروبوتات إلى الرؤية الحاسوبية الصناعية وأبحاث الذكاء الاصطناعي. حصل مشروعه SCARA على تقدير ممتاز. [التعليم والخبرة](${BACKGROUND_URL})`,
  },
  cv: {
    en: `[Download Ahmed’s public CV (PDF)](${CV_URL})`,
    de: `[Ahmeds öffentlichen Lebenslauf herunterladen (PDF)](${CV_URL})`,
    fr: `[Télécharger le CV public d’Ahmed (PDF)](${CV_URL})`,
    es: `[Descargar el CV público de Ahmed (PDF)](${CV_URL})`,
    ar: `[تنزيل السيرة الذاتية العامة لأحمد (PDF)](${CV_URL})`,
  },
  industrial: {
    en: `Ahmed evaluated the system using five-fold cross-validation on the public FTI_Zer0P dataset. The baseline reached ${inkjetBaseline} AUROC. Adding separation loss did not significantly improve this result after Holm correction. [Read the industrial evaluation](${INDUSTRIAL_URL}).`,
    de: `Ahmed prüfte das System mit fünffacher Kreuzvalidierung auf dem öffentlichen FTI_Zer0P-Datensatz. Die Baseline erreichte ${inkjetBaseline} AUROC. Nach Holm-Korrektur brachte die Separation Loss keine signifikante Verbesserung. [Zur industriellen Auswertung](${INDUSTRIAL_URL}).`,
    fr: `Ahmed a évalué le système par validation croisée à cinq plis sur le jeu public FTI_Zer0P. La référence a atteint ${inkjetBaseline} AUROC. La perte de séparation n’a apporté aucun gain significatif après correction de Holm. [Lire l’évaluation industrielle](${INDUSTRIAL_URL}).`,
    es: `Ahmed evaluó el sistema mediante validación cruzada de cinco pliegues con el conjunto público FTI_Zer0P. La referencia alcanzó ${inkjetBaseline} AUROC. La pérdida de separación no aportó una mejora significativa tras la corrección de Holm. [Leer la evaluación industrial](${INDUSTRIAL_URL}).`,
    ar: `قيّم أحمد النظام بالتحقق المتقاطع عبر خمسة أجزاء على مجموعة FTI_Zer0P العامة. سجّل النموذج المرجعي ${inkjetBaseline} AUROC، ولم تحقق خسارة الفصل تحسنًا ذا دلالة إحصائية بعد تصحيح Holm. [اقرأ التقييم الصناعي](${INDUSTRIAL_URL}).`,
  },
  inspection: {
    en: `YOLO locates printed features in an image. A conditional diffusion model then scores each region for signs of a defect. [See the pipeline and evidence](${INDUSTRIAL_URL}).`,
    de: `YOLO lokalisiert gedruckte Merkmale im Bild. Ein konditionales Diffusionsmodell bewertet anschließend jede Region auf Hinweise auf Druckfehler. [Zur Pipeline und Auswertung](${INDUSTRIAL_URL}).`,
    fr: `YOLO localise les éléments imprimés dans une image. Un modèle de diffusion conditionnel évalue ensuite chaque région pour y repérer des signes de défaut. [Voir la méthode et les résultats](${INDUSTRIAL_URL}).`,
    es: `YOLO localiza los elementos impresos en una imagen. Después, un modelo de difusión condicional evalúa cada región en busca de defectos. [Ver el método y los resultados](${INDUSTRIAL_URL}).`,
    ar: `يحدّد YOLO العناصر المطبوعة في الصورة، ثم يقيّم نموذج انتشار شرطي كل منطقة بحثًا عن مؤشرات على وجود عيوب. [اطّلع على خطوات النظام ونتائجه](${INDUSTRIAL_URL}).`,
  },
  sihem_intro: {
    en: `Sihem is a planning assistant Ahmed built for weekly plans and daily routines. It sends scheduled check-ins through Telegram and has an installable web app. The beta is invitation-only. [Read the public case study](${SIHEM_URL}).`,
    de: `Sihem ist ein Planungsassistent, den Ahmed für Wochenplanung und Alltagsroutinen entwickelt hat. Er sendet geplante Nachrichten über Telegram und bietet eine installierbare Web-App. Die Beta ist nur mit Einladung zugänglich. [Zur öffentlichen Fallstudie](${SIHEM_URL}).`,
    fr: `Sihem est un assistant qu’Ahmed a conçu pour planifier la semaine et les routines quotidiennes. Il envoie des suivis programmés sur Telegram et propose une application web installable. La bêta est sur invitation. [Lire l’étude de cas publique](${SIHEM_URL}).`,
    es: `Sihem es un asistente que Ahmed creó para planificar la semana y las rutinas diarias. Envía seguimientos programados por Telegram y tiene una aplicación web instalable. La beta es por invitación. [Leer el caso de estudio público](${SIHEM_URL}).`,
    ar: `Sihem مساعد طوّره أحمد لتنظيم الأسبوع والروتين اليومي. يرسل متابعات مجدولة عبر تيليجرام ويتيح تطبيق ويب قابلًا للتثبيت. النسخة التجريبية متاحة بالدعوة فقط. [اقرأ دراسة الحالة العامة](${SIHEM_URL}).`,
  },
  sihem: {
    en: `Sihem (Telegram @sihem_ai_bot, PWA: https://sihem-pwa.pages.dev/, invitation-only beta) is Ahmed's proactive AI personal-mentor and habits/daily-routine assistant, accepted into the tech2b incubator in Linz (May 2026–Present). Built on Supabase Edge Functions (Deno/TypeScript) and PostgreSQL with RLS, it features a deterministic generators→arbiter→composer decision engine for scheduling check-ins, pgvector long-term memory with RAG, multi-provider LLM routing (GLM/Gemini/Groq) with automated failover, Cloudflare MeloTTS voice reminders, and Google Calendar sync. [Read the public case study](${SIHEM_URL}).`,
    de: `Sihem (Telegram @sihem_ai_bot, PWA: https://sihem-pwa.pages.dev/, Beta mit Einladung) ist Ahmeds proaktiver KI-Mentor-Assistent für Gewohnheiten und Tagesroutinen, aufgenommen in den tech2b-Inkubator in Linz (Mai 2026–heute). Entwickelt auf Supabase Edge Functions (Deno/TypeScript) und PostgreSQL mit RLS, nutzt das System eine deterministische Generatoren→Arbiter→Komponist-Entscheidungsmaschine für Check-Ins, pgvector-Langzeitgedächtnis mit RAG, Multi-Provider-LLM-Routing (GLM/Gemini/Groq) mit Failover, Cloudflare MeloTTS-Spracherinnerungen und Google-Kalender-Synchronisation. [Zur öffentlichen Fallstudie](${SIHEM_URL}).`,
    fr: `Sihem (Telegram @sihem_ai_bot, PWA : https://sihem-pwa.pages.dev/, bêta sur invitation) est l'assistant personnel mentor proactif d'Ahmed pour les habitudes et routines quotidiennes, incubé chez tech2b à Linz (mai 2026–présent). Développé sur Supabase Edge Functions (Deno/TypeScript) et PostgreSQL avec RLS, il intègre un moteur décisionnel générateurs→arbitre→compositeur pour la planification des rappels, une mémoire long terme pgvector avec RAG, un routage LLM multi-fournisseurs (GLM/Gemini/Groq) avec basculement automatique, des rappels vocaux Cloudflare MeloTTS et la synchronisation Google Calendar. [Lire l’étude de cas publique](${SIHEM_URL}).`,
    es: `Sihem (Telegram @sihem_ai_bot, PWA: https://sihem-pwa.pages.dev/, beta por invitación) es el asistente mentor personal proactivo de Ahmed para hábitos y rutinas diarias, aceptado en la incubadora tech2b de Linz (mayo 2026–presente). Desarrollado con Supabase Edge Functions (Deno/TypeScript) y PostgreSQL con RLS, cuenta con un motor de decisiones generadores→árbitro→compositor para programar recordatorios, memoria a largo plazo pgvector con RAG, enrutamiento LLM multiproveedor (GLM/Gemini/Groq) con failover, avisos de voz Cloudflare MeloTTS y sincronización con Google Calendar. [Leer el caso de estudio público](${SIHEM_URL}).`,
    ar: `مشروع Sihem (تيليجرام @sihem_ai_bot، وتطبيق الويب: https://sihem-pwa.pages.dev/، نسخة تجريبية بدعوة) هو مساعد شخصي موجه واستباقي للعادات والروتين اليومي من تطوير أحمد، ومقبول في حاضنة الأعمال tech2b في لينتس (مايو 2026 – الآن). مبني على Supabase Edge Functions (Deno/TypeScript) وPostgreSQL مع RLS، ويتميز بمحرك قرار حتمي (مولدات←محكم←مؤلف) لجدولة التنبيهات، وذاكرة pgvector طويلة المدى مع RAG، وتوجيه LLM متعدد المزودين (GLM/Gemini/Groq) مع تبديل تلقائي، وتذكيرات صوتية بـ Cloudflare MeloTTS، ومزامنة Google Calendar. [اقرأ دراسة الحالة العامة](${SIHEM_URL}).`,
  },
  thesis: {
    en: `Ahmed’s thesis tested whether a diffusion model could recognize unfamiliar images. Separation loss improved mean AUROC from ${cifarBaseline} to ${cifarSeparation} across three seeds on a binary CIFAR-10 airplane-vs-rest split. [See the findings and limits](${DIFFUSION_URL}).`,
    de: `Ahmed untersuchte, ob ein Diffusionsmodell unbekannte Bilder erkennt. Mit Separation Loss stieg die mittlere AUROC von ${cifarBaseline} auf ${cifarSeparation} über drei Läufe im binären CIFAR-10-Vergleich Flugzeuge gegen alle anderen Klassen. [Ergebnisse und Grenzen](${DIFFUSION_URL}).`,
    fr: `Ahmed a étudié la reconnaissance d’images inconnues par un modèle de diffusion. Sur trois essais du test binaire CIFAR-10 avions contre toutes les autres classes, la perte de séparation a fait passer l’AUROC moyenne de ${cifarBaseline} à ${cifarSeparation}. [Résultats et limites](${DIFFUSION_URL}).`,
    es: `Ahmed estudió si un modelo de difusión podía reconocer imágenes desconocidas. En tres ejecuciones de la prueba binaria CIFAR-10 aviones contra el resto, la pérdida de separación elevó la AUROC media de ${cifarBaseline} a ${cifarSeparation}. [Resultados y límites](${DIFFUSION_URL}).`,
    ar: `درس أحمد قدرة نموذج انتشار على التعرّف على الصور غير المألوفة. رفعت خسارة الفصل متوسط AUROC من ${cifarBaseline} إلى ${cifarSeparation} عبر ثلاث تجارب في اختبار CIFAR-10 الثنائي للطائرات مقابل بقية الفئات. [النتائج وحدودها](${DIFFUSION_URL}).`,
  },
  thesis_method: {
    en: `During training, separation loss pushes apart the noise predictions for the normal and other conditions. At inference, the model subtracts the two reconstruction errors and flags the image as unfamiliar when the difference meets a calibrated threshold. [See the three-step explanation](${METHOD_URL}).`,
    de: `Beim Training trennt die Separation Loss die Rauschvorhersagen für die normale und die andere Bedingung. Bei der Auswertung zieht das Modell die beiden Rekonstruktionsfehler voneinander ab. Erreicht die Differenz den kalibrierten Schwellenwert, gilt das Bild als unbekannt. [Zur Erklärung in drei Schritten](${METHOD_URL}).`,
    fr: `À l’entraînement, la perte de séparation éloigne les prédictions de bruit des conditions normale et autre. Lors de l’inférence, le modèle soustrait les deux erreurs de reconstruction et signale une image inconnue si l’écart atteint le seuil calibré. [Voir les trois étapes](${METHOD_URL}).`,
    es: `Durante el entrenamiento, la pérdida de separación aleja las predicciones de ruido de las condiciones normal y otra. En la inferencia, el modelo resta los dos errores de reconstrucción y marca la imagen como desconocida si la diferencia alcanza el umbral calibrado. [Ver los tres pasos](${METHOD_URL}).`,
    ar: `أثناء التدريب، تُباعد خسارة الفصل بين توقّعي الضوضاء للحالتين العادية والأخرى. عند الاستدلال، يطرح النموذج أحد خطأي إعادة البناء من الآخر ويصنّف الصورة على أنها غير مألوفة إذا بلغ الفرق العتبة المُعايرة. [شاهد الشرح في ثلاث خطوات](${METHOD_URL}).`,
  },
  thesis_datasets: {
    en: `The main test used CIFAR-10 airplanes as the familiar class and the other nine classes as unfamiliar. The seed-42 run also tested CIFAR-100, Places365, FashionMNIST, Textures, and SVHN. The industrial evaluation used the separate FTI_Zer0P dataset. [Explore the datasets](${EXPLORER_URL}).`,
    de: `Im Haupttest waren CIFAR-10-Flugzeuge die bekannte Klasse und die anderen neun Klassen unbekannt. Der Lauf mit Seed 42 prüfte auch CIFAR-100, Places365, FashionMNIST, Textures und SVHN. Die industrielle Auswertung nutzte den separaten Datensatz FTI_Zer0P. [Datensätze erkunden](${EXPLORER_URL}).`,
    fr: `Le test principal utilisait les avions de CIFAR-10 comme classe connue et les neuf autres classes comme inconnues. L’essai avec la graine 42 a aussi testé CIFAR-100, Places365, FashionMNIST, Textures et SVHN. L’évaluation industrielle utilisait le jeu distinct FTI_Zer0P. [Explorer les jeux de données](${EXPLORER_URL}).`,
    es: `La prueba principal usó los aviones de CIFAR-10 como clase conocida y las otras nueve clases como desconocidas. La ejecución con semilla 42 también probó CIFAR-100, Places365, FashionMNIST, Textures y SVHN. La evaluación industrial usó el conjunto independiente FTI_Zer0P. [Explorar los datos](${EXPLORER_URL}).`,
    ar: `استخدم الاختبار الرئيسي صور الطائرات من CIFAR-10 بوصفها الفئة المألوفة، والفئات التسع الأخرى بوصفها غير مألوفة. واختبرت تجربة البذرة 42 أيضًا CIFAR-100 وPlaces365 وFashionMNIST وTextures وSVHN. أما التقييم الصناعي فاستخدم مجموعة FTI_Zer0P المنفصلة. [استكشف مجموعات البيانات](${EXPLORER_URL}).`,
  },
  thesis_diffusion: {
    en: `A conditional diffusion model can denoise the same image under two different assumptions about its class. Comparing the errors gives a score for how well the image fits the familiar class, which can then be calibrated to flag unfamiliar images. [Read the diffusion case study](${DIFFUSION_URL}).`,
    de: `Ein konditionales Diffusionsmodell kann dasselbe Bild unter zwei verschiedenen Klassenannahmen entrauschen. Der Fehlervergleich zeigt, wie gut das Bild zur bekannten Klasse passt. Dieser Wert lässt sich kalibrieren, um unbekannte Bilder zu erkennen. [Zur Diffusions-Fallstudie](${DIFFUSION_URL}).`,
    fr: `Un modèle de diffusion conditionnel peut débruiter une même image selon deux hypothèses de classe. La comparaison des erreurs indique dans quelle mesure l’image correspond à la classe connue. Ce score peut être calibré pour repérer les images inconnues. [Lire l’étude de cas](${DIFFUSION_URL}).`,
    es: `Un modelo de difusión condicional puede eliminar el ruido de la misma imagen bajo dos supuestos de clase. Comparar los errores permite puntuar cuánto encaja la imagen en la clase conocida y calibrar ese valor para detectar imágenes desconocidas. [Leer el caso de estudio](${DIFFUSION_URL}).`,
    ar: `يمكن لنموذج الانتشار الشرطي إزالة الضوضاء من الصورة نفسها وفق افتراضين مختلفين لفئتها. تعطي مقارنة الخطأين درجة تعبّر عن مدى توافق الصورة مع الفئة المألوفة، ويمكن معايرتها لكشف الصور غير المألوفة. [اقرأ دراسة الحالة](${DIFFUSION_URL}).`,
  },
  contact: {
    en: `You can email Ahmed at ahmed.mu.0905@gmail.com, schedule a meeting via Calendly, try the live AI front-desk voice/avatar demo, or find his profiles in the [contact section](${CONTACT_URL}).`,
    de: `Sie erreichen Ahmed per E-Mail unter ahmed.mu.0905@gmail.com und können im [Kontaktbereich](${CONTACT_URL}) ein Meeting über Calendly planen, die Live-Demo des KI-Empfangs (Stimme & Avatar) testen oder seine Profile abrufen.`,
    fr: `Vous pouvez écrire à Ahmed à ahmed.mu.0905@gmail.com, planifier un rendez-vous via Calendly, essayer la démo vocale/avatar de son accueil IA ou consulter ses profils dans la [rubrique contact](${CONTACT_URL}).`,
    es: `Puedes escribir a Ahmed a ahmed.mu.0905@gmail.com, programar una reunión por Calendly, probar la demo en vivo de voz y avatar de su recepción con IA o ver sus perfiles en la [sección de contacto](${CONTACT_URL}).`,
    ar: `يمكنك مراسلة أحمد على ahmed.mu.0905@gmail.com، أو جدولة اجتماع عبر Calendly، أو تجربة العرض المباشر لموظف الاستقبال الذكي بالصوت والصورة المتحركة، أو الاطّلاع على ملفاته المهنية في [قسم التواصل](${CONTACT_URL}).`,
  },
  open_to_work: {
    en: `Ahmed is based in Linz, Austria, and open to full-time AI/ML roles across computer vision, applied ML, and LLM/agent systems. He is eligible for Austria's Rot-Weiß-Rot Karte für Studienabsolventen (graduate work-permit track without a labour-market test); [contact Ahmed](${CONTACT_URL}) to discuss a role or confirm hiring details.`,
    de: `Ahmed lebt in Linz, Österreich, und ist offen für Vollzeitstellen im Bereich AI/ML — von Computer Vision und angewandtem ML bis zu LLM- und Agentensystemen. Er ist berechtigt für die österreichische Rot-Weiß-Rot-Karte für Studienabsolventen (ohne Arbeitsmarktprüfung); [kontaktieren Sie Ahmed](${CONTACT_URL}), um eine Stelle oder Einstellungsdetails zu besprechen.`,
    fr: `Ahmed est basé à Linz, en Autriche, et ouvert aux postes à temps plein en IA/ML (vision par ordinateur, ML appliqué et systèmes LLM/agents). Il est éligible à la Rot-Weiß-Rot Karte für Studienabsolventen autrichienne (sans examen du marché du travail) ; [contactez Ahmed](${CONTACT_URL}) pour échanger sur un poste ou confirmer les modalités.`,
    es: `Ahmed reside en Linz, Austria, y está abierto a puestos a tiempo completo en IA/ML (visión por computador, ML aplicado y sistemas LLM/agentes). Es elegible para la Rot-Weiß-Rot Karte für Studienabsolventen de Austria (sin prueba de mercado laboral); [contacta con Ahmed](${CONTACT_URL}) para hablar de un puesto o confirmar los detalles de contratación.`,
    ar: `يقيم أحمد في لينتس بالنمسا، وهو متاح لوظائف بدوام كامل في الذكاء الاصطناعي وتعلّم الآلة عبر الرؤية الحاسوبية وتعلّم الآلة التطبيقي وأنظمة LLM والوكلاء. وهو مؤهل لبطاقة Rot-Weiß-Rot Karte für Studienabsolventen في النمسا (مسار الخريجين دون فحص سوق العمل)؛ [تواصل مع أحمد](${CONTACT_URL}) لمناقشة فرصة عمل أو تأكيد تفاصيل التوظيف.`,
  },
  mergeproof: {
    en: `[mergeproof](https://github.com/ahmed-3m/mergeproof) checks AI-written pull requests against configured deterministic merge requirements without calling an LLM. Passing its checks does not guarantee defect-free code.`,
    de: `[mergeproof](https://github.com/ahmed-3m/mergeproof) prüft KI-generierte Pull Requests anhand konfigurierter deterministischer Merge-Anforderungen ohne LLM-Aufruf. Bestandene Prüfungen garantieren keinen fehlerfreien Code.`,
    fr: `[mergeproof](https://github.com/ahmed-3m/mergeproof) vérifie les pull requests écrites par IA selon des exigences de fusion déterministes configurées sans appel à un LLM. Réussir ces contrôles ne garantit pas un code sans défaut.`,
    es: `[mergeproof](https://github.com/ahmed-3m/mergeproof) verifica pull requests escritos por IA frente a requisitos de fusión deterministas configurados sin llamar a un LLM. Superar estas comprobaciones no garantiza un código libre de errores.`,
    ar: `أداة [mergeproof](https://github.com/ahmed-3m/mergeproof) تفحص طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات دمج حتمية محددة دون استدعاء نموذج لغوي. اجتياز هذه الفحوص لا يضمن خلو الشيفرة من الأخطاء.`,
  },
  tech_stack: {
    en: `Ahmed's stack spans AI research and production engineering:\n- ML: PyTorch, Python, Diffusion Models, YOLO, OpenCV, Anomaly Detection\n- Product/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Tools: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Skills and background](${BACKGROUND_URL}) · [Inkjet inspection](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    de: `Ahmeds Stack umfasst KI-Forschung und Produktionsentwicklung:\n- ML: PyTorch, Python, Diffusionsmodelle, YOLO, OpenCV, Anomalieerkennung\n- Produkt/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Tools: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Skills und Hintergrund](${BACKGROUND_URL}) · [Inkjet-Prüfung](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    fr: `Le stack d'Ahmed couvre la recherche IA et la production :\n- ML : PyTorch, Python, Modèles de diffusion, YOLO, OpenCV, Détection d'anomalies\n- Produit/Infra : Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Outils : Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Compétences et parcours](${BACKGROUND_URL}) · [Inspection jet d’encre](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    es: `El stack de Ahmed abarca investigación en IA e ingeniería de producción:\n- ML: PyTorch, Python, Modelos de difusión, YOLO, OpenCV, Detección de anomalías\n- Producto/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Herramientas: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Habilidades y trayectoria](${BACKGROUND_URL}) · [Inspección inkjet](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    ar: `يشمل الـ stack الخاص بأحمد أبحاث الذكاء الاصطناعي وهندسة الإنتاج:\n- تعلم الآلة: PyTorch وPython ونماذج الانتشار وYOLO وOpenCV وكشف الشذوذ\n- المنتج والبنية: Next.js وReact وTypeScript وSupabase وDeno وDocker وPostgreSQL وpgvector وCloudflare\n- الأدوات: Git وmergeproof وWeights & Biases وHugging Face وLinux\n[المهارات والخلفية](${BACKGROUND_URL}) · [فحص الطباعة](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
  },
  achievements: {
    en: `Key proof points:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (3-seed mean) on within-CIFAR airplane-vs-rest binary OOD split with novel class-conditional separation loss (+6.5pp over ${cifarBaseline} baseline; M.Sc. thesis under Prof. Sepp Hochreiter, graded 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): ${inkjetBaseline} AUROC baseline under strict 5-fold CV on the public FTI_Zer0P industrial dataset at PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo Developer & Project Lead (tech2b incubator Linz, invitation-only beta personal-mentor assistant)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): checks AI-written pull requests against configured deterministic merge requirements without calling an LLM (passing those checks does not guarantee defect-free code)`,
    de: `Wichtige Meilensteine:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation.replaceAll('.', ',').replaceAll('%', ' %')} AUROC (3-Seed-Mittel) auf dem binären Within-CIFAR-Split Flugzeuge gegen den Rest mit neuartiger class-conditional separation loss (+6,5 Prozentpunkte gegenüber ${cifarBaseline.replaceAll('.', ',').replaceAll('%', ' %')} Baseline; Masterarbeit bei Prof. Sepp Hochreiter, Note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): 0,8673 ± 0,0230 AUROC-Baseline auf dem öffentlichen Datensatz FTI_Zer0P unter strenger 5-facher Kreuzvalidierung bei PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo-Entwickler & Projektleiter (tech2b Inkubator Linz, KI-Mentor-Assistent in Beta mit Einladung)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): prüft KI-generierte PRs anhand konfigurierter deterministischer Merge-Anforderungen ohne LLM-Aufruf (bestandene Prüfungen garantieren keine Fehlerfreiheit)`,
    fr: `Principaux résultats :\n- [DiffusionOOD](${DIFFUSION_URL}) : ${cifarSeparation.replaceAll('.', ',').replaceAll('%', ' %')} AUROC (moyenne sur 3 seeds) sur le split binaire within-CIFAR avions contre le reste avec separation loss conditionnelle (+6,5 points par rapport à la référence de ${cifarBaseline.replaceAll('.', ',').replaceAll('%', ' %')} ; mémoire dirigé par Prof. Sepp Hochreiter, note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}) : référence à 0,8673 ± 0,0230 AUROC sur le jeu public FTI_Zer0P en validation croisée 5 plis chez PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}) : Développeur solo & chef de projet (incubateur tech2b Linz, assistant mentor IA en bêta sur invitation)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof) : vérifie les PR générées par IA selon des exigences déterministes configurées sans appel LLM (la réussite des contrôles ne garantit pas un code sans défaut)`,
    es: `Logros destacados:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (media de 3 seeds) en el split binario within-CIFAR aviones contra el resto con separation loss condicional (+6.5 puntos porcentuales frente al ${cifarBaseline} de referencia; tesis con Prof. Sepp Hochreiter, nota 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): referencia de ${inkjetBaseline} AUROC en el dataset público FTI_Zer0P con validación cruzada 5-fold en PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Desarrollador en solitario y líder de proyecto (incubadora tech2b Linz, asistente mentor IA en beta por invitación)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): verifica PRs generadas por IA según requisitos deterministas configurados sin llamadas a un LLM (superar las comprobaciones no garantiza que el código esté libre de errores)`,
    ar: `أبرز الإنجازات:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (متوسط 3 بذور) على تقسيم within-CIFAR الثنائي للطائرات مقابل البقية مع separation loss الشرطية (+6.5 نقطة مئوية مقارنةً بالأساس ${cifarBaseline}؛ رسالة الماجستير بإشراف Prof. Sepp Hochreiter، تقدير 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): خط أساس ${inkjetBaseline} AUROC على مجموعة FTI_Zer0P العامة بتحقق تقاطعي 5-fold لدى PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): مطور منفرد وقائد مشروع (حاضنة tech2b لينتس، مساعد موجه بالذكاء الاصطناعي في نسخة تجريبية بدعوة)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): يتحقق من طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات حتمية محددة دون استدعاء نموذج لغوي (اجتياز الفحوص لا يضمن خلو الشيفرة من الأخطاء)`,
  },
} satisfies Record<string, TranslationMap>

type ReplyId = keyof typeof LOCAL_REPLIES

const REPLY_FOR_PROMPT = {
  projects_best: 'projects',
  background: 'background',
  cv: 'cv',
  industrial_pipeline: 'inspection',
  industrial_result: 'industrial',
  thesis_summary: 'thesis',
  thesis_innovation: 'thesis_method',
  thesis_loss: 'thesis_method',
  thesis_results: 'thesis',
  thesis_datasets: 'thesis_datasets',
  thesis_diffusion: 'thesis_diffusion',
  sihem_overview: 'sihem_intro',
  sihem_tech: 'sihem',
  hire_summary: 'open_to_work',
  hire_fit: 'open_to_work',
  open_to_work: 'open_to_work',
  contact: 'contact',
  tech_stack: 'tech_stack',
  achievements: 'achievements',
} satisfies Record<PromptId, ReplyId>

function findPromptId(question: string): PromptId | undefined {
  const text = question.trim().toLowerCase()
  return (Object.keys(PROMPT_LIBRARY) as PromptId[]).find(id =>
    Object.values(PROMPT_LIBRARY[id]).some(label => label.toLowerCase() === text),
  )
}

function findCuratedTopic(question: string): ReplyId | undefined {
  const prompt = findPromptId(question)
  if (prompt) return REPLY_FOR_PROMPT[prompt]

  const text = question.trim().toLowerCase().replace(/^[¿¡]|[.!?؟]+$/gu, '').trim()
  if (/^(?:(?:download|show me|where can i (?:find|download)) )?(?:(?:ahmed[’']s|his|the) )?(?:cv|r[eé]sum[eé])(?: (?:link|pdf|please))?$|^(?:lebenslauf|curr[ií]culum|سيرة أحمد الذاتية)$/u.test(text)) return 'cv'
  if (/^(?:how (?:can|do) i (?:contact|reach) (?:ahmed|him)|contact(?: ahmed)?|contacto|kontakt|تواصل مع أحمد)$/u.test(text)) return 'contact'
  if (/^(?:where can i read (?:the )?case stud(?:y|ies)|case studies|project links)$/u.test(text)) return 'projects'
}

function inferReplyId(text: string): ReplyId | undefined {
  if (/industrial|industriell|industriel|inkjet|profactor|fti[_-]?zer0p|الصناعي/i.test(text)) return 'industrial'
  if (/\b(sihem|mentor|habit|routine|telegram|tech2b|pgvector)\b/i.test(text)) return 'sihem'
  if (/\b(thesis|separation loss|ood|out.?of.?distribution|cifar|auroc)\b|masterarbeit|mémoire|tesis|رسالة/i.test(text)) return 'thesis'
  if (/^\s*(?:his|the|a)?\s*(?:cv|r[eé]sum[eé])(?:\s+please)?\s*[?!. ]*$|\b(?:download|get|find|see|show|share|send|read|open|view|access|check|need|want|have|where(?:'s|\s+is)|link(?:\s+to)?|copy\s+of|his|public|pdf|son|télécharger|descargar|su|ver|obtener)\b[^.?!]{0,35}\b(?:cv|r[eé]sum[eé])\b|\b(?:cv|r[eé]sum[eé])\b[^.?!]{0,20}\b(?:link|pdf|file|download|url|please|available)\b|curr[ií]culum|lebenslauf|سير(?:ة|ته)\s*الذاتية/i.test(text)) return 'cv'
  if (/(contact|email|linkedin|reach|talk to|connect|تواصل)/i.test(text)) return 'contact'
  if (/(open to work|available|hire|job|role|opportunit|وظائف)/i.test(text)) return 'open_to_work'
  if (/mergeproof|merge\s*gate|pr\s*check/i.test(text)) return 'mergeproof'
  if (/(tech stack|stack|tools|technolog)/i.test(text)) return 'tech_stack'
  if (/(achievement|accomplishment|highlights|best result|proof points)/i.test(text)) return 'achievements'
  if (/(background|education|mechatronics|ausbildung|parcours|trayectoria|خلفية)/i.test(text)) return 'background'
  if (/(projects|projekte|projets|proyectos|مشاريع|portfolio|github)/i.test(text)) return 'projects'
}

export function getLocalReply(question: string, lang: Language): string | null {
  const topic = findCuratedTopic(question) ?? inferReplyId(question)
  return topic ? translateValue(lang, LOCAL_REPLIES[topic]) : null
}

const FOLLOWUP_PROMPTS: Partial<Record<ReplyId, PromptId[]>> = {
  projects: ['industrial_result', 'thesis_summary', 'sihem_overview'],
  inspection: ['industrial_result', 'thesis_summary', 'projects_best'],
  industrial: ['industrial_pipeline', 'thesis_summary', 'projects_best'],
  thesis: ['thesis_loss', 'thesis_datasets', 'industrial_result'],
  thesis_method: ['thesis_results', 'thesis_datasets', 'industrial_result'],
  thesis_datasets: ['thesis_loss', 'thesis_results', 'industrial_result'],
  thesis_diffusion: ['thesis_loss', 'thesis_datasets', 'thesis_results'],
  sihem_intro: ['sihem_tech', 'projects_best', 'contact'],
  sihem: ['sihem_overview', 'projects_best', 'contact'],
  mergeproof: ['projects_best', 'tech_stack', 'contact'],
  cv: ['background', 'open_to_work', 'contact'],
  background: ['projects_best', 'cv', 'contact'],
  open_to_work: ['cv', 'contact', 'projects_best'],
  contact: ['cv', 'projects_best', 'background'],
}

function shortenReply(reply: string): string {
  if (reply.length <= MAX_REPLY_CHARS) return reply

  const compact = reply.replace(/\n{3,}/g, '\n\n').trim()
  const boundary = Math.max(
    compact.lastIndexOf('\n', MAX_REPLY_CHARS),
    compact.lastIndexOf('.', MAX_REPLY_CHARS),
    compact.lastIndexOf('!', MAX_REPLY_CHARS),
    compact.lastIndexOf('?', MAX_REPLY_CHARS)
  )
  const end = boundary > 900 ? boundary + 1 : MAX_REPLY_CHARS
  return `${compact.slice(0, end).trim()}...`
}

function createChatError(
  message: string,
  provider: 'Groq' | 'BigModel',
  status?: number,
  code?: string,
  isProxyRateLimit = false
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  error.isProxyRateLimit = isProxyRateLimit
  return error
}

function isProxyRateLimitPayload(
  data: ChatCompletionResponse | null,
  status: number
): boolean {
  if (status !== 429 || !data) return false
  if (data.scope !== undefined) return data.scope === 'proxy'
  return data.error === 'Rate limit exceeded. Please try again later.'
}

type StreamDelta = (fullContent: string) => void

type StreamChunk = ChatCompletionResponse & {
  choices?: Array<{
    finish_reason?: string | null
    delta?: { content?: string }
    message?: { content?: string }
  }>
}

type ChatReply = { content: string; incomplete?: boolean }

type ChatLane = 'fast' | 'deep'

const DEEP_PATTERN = /(?:^|[^\p{L}])(?:explain|compare|why|how (?:does|do|did|would)|walk me|deep dive|detailed|difference between|evaluate|critique|warum|erkl[äa]r\p{L}*|vergleich\p{L}*|pourquoi|expliqu\p{L}*|compar\p{L}*|explic\p{L}*|por qu[ée]|c[oó]mo funciona|كيف|لماذا|اشرح|قارن)(?!\p{L})/iu

function routeLocally(message: string): ChatLane {
  return DEEP_PATTERN.test(message) ? 'deep' : 'fast'
}

type ChatProvider = 'Groq' | 'BigModel'

async function throwProviderError(
  response: Response,
  provider: ChatProvider,
  status503Message?: string
): Promise<never> {
  const data = (await response.json().catch(() => null)) as ChatCompletionResponse | null
  const detail = data?.error
  const errorDetail = typeof detail === 'string' ? undefined : detail
  const message =
    typeof detail === 'string'
      ? detail
      : errorDetail?.message ?? `${provider} could not respond right now.`
  const isProxyRateLimit = isProxyRateLimitPayload(data, response.status)
  if (status503Message && response.status === 503) {
    throw createChatError(status503Message, provider, response.status, errorDetail?.code, isProxyRateLimit)
  }
  throw createChatError(message, provider, response.status, errorDetail?.code, isProxyRateLimit)
}

async function readChatResponse({
  response,
  provider,
  streaming,
  timers,
  onDelta,
}: {
  response: Response
  provider: ChatProvider
  streaming: boolean
  timers: ReturnType<typeof createRequestTimers>
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  if (!streaming || !response.body || response.headers.get('Content-Type')?.includes('application/json')) {
    timers.onFirstByte()
    const data = (await response.json()) as ChatCompletionResponse
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) throw createChatError(`${provider} returned an empty response.`, provider)
    const finishReason = data.choices?.[0]?.finish_reason
    return { content: reply, incomplete: Boolean(finishReason && finishReason !== 'stop') }
  }

  timers.onFirstByte()

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''
  let doneEvent = false
  let finishReason: string | undefined

  const consumeLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const payload = trimmed.slice(5).trim()
    if (payload === '[DONE]') {
      doneEvent = true
      return
    }
    if (!payload) return
    let chunk: StreamChunk
    try {
      chunk = JSON.parse(payload) as StreamChunk
    } catch {
      return
    }
    if (chunk.error) {
      const message =
        typeof chunk.error === 'string'
          ? chunk.error
          : chunk.error.message ?? `${provider} stream failed.`
      throw createChatError(message, provider)
    }
    const choice = chunk.choices?.[0]
    if (choice?.finish_reason) finishReason = choice.finish_reason
    const delta = choice?.delta?.content
    if (delta) {
      content += delta
      onDelta?.(content)
    }
  }

  try {
    while (!doneEvent) {
      const { done, value } = await reader.read()
      if (done) break
      timers.onChunk()
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) consumeLine(line)
    }
    if (!doneEvent) consumeLine(buffer + decoder.decode())
  } catch (streamError) {
    if (!content.trim()) throw streamError
  } finally {
    void reader.cancel().catch(() => {})
    reader.releaseLock()
  }

  if (!content.trim()) {
    throw createChatError(`${provider} returned an empty response.`, provider)
  }
  return { content: content.trim(), incomplete: finishReason ? finishReason !== 'stop' : !doneEvent }
}

async function fetchBigModel({
  messages,
  lang,
  proxyUrl,
  lane,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  lang: Language
  proxyUrl: string
  lane: ChatLane
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  const model = lane === 'fast' ? ZAI_FAST_MODEL : ZAI_MODEL
  const maxTokens = lane === 'fast' ? 380 : 1200
  const payloadMessages = buildChatMessages(systemPrompt(lang), messages)

  const controller = new AbortController()
  const timers = createRequestTimers({
    firstByteMs: TTFB_TIMEOUT_MS,
    idleMs: 15_000,
    totalMs: 60_000,
    onTimeout: (reason) => {
      controller.abort(createChatError(`BigModel timed out (${reason})`, 'BigModel'))
    },
  })

  try {
    const streaming = Boolean(onDelta)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: payloadMessages,
        max_tokens: maxTokens,
        temperature: 0.5,
        stream: streaming,
        ...(lane === 'deep' ? { reasoning_effort: 'low' } : {}),
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      await throwProviderError(response, 'BigModel')
    }

    return await readChatResponse({
      response,
      provider: 'BigModel',
      streaming,
      timers,
      onDelta,
    })
  } finally {
    timers.clear()
  }
}

async function fetchGroq({
  messages,
  lang,
  proxyUrl,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  lang: Language
  proxyUrl: string
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  const payloadMessages = buildChatMessages(systemPrompt(lang), messages)

  const controller = new AbortController()
  const timers = createRequestTimers({
    firstByteMs: TTFB_TIMEOUT_MS,
    idleMs: 15_000,
    totalMs: 60_000,
    onTimeout: (reason) => {
      controller.abort(createChatError(`Groq timed out (${reason})`, 'Groq'))
    },
  })

  try {
    const streaming = Boolean(onDelta)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: payloadMessages,
        max_tokens: 380,
        temperature: 0.5,
        stream: streaming,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      await throwProviderError(
        response,
        'Groq',
        'Model is warming up, try again in a moment.'
      )
    }

    return await readChatResponse({
      response,
      provider: 'Groq',
      streaming,
      timers,
      onDelta,
    })
  } finally {
    timers.clear()
  }
}

/**
 * Normalizes same-site portfolio links to relative paths and marks only external
 * URLs and PDF downloads to open in a new tab.
 */
function resolveLinkProps(rawHref: string): { href: string; external: boolean } | null {
  try {
    const parsed = new URL(rawHref, PORTFOLIO)
    if (!publicLinks.has(parsed.href)) return null
    if (parsed.protocol === 'mailto:') return { href: parsed.href, external: false }
    if (parsed.origin === PORTFOLIO) {
      const isPdf = parsed.pathname.toLowerCase().endsWith('.pdf')
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        external: isPdf,
      }
    }
    return { href: parsed.href, external: true }
  } catch {
    return null
  }
}

function renderInline(
  text: string,
  keyPrefix: string,
  onInternalLinkClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void
): ReactNode[] {
  const renderLinkedText = (value: string, segmentKey: string): ReactNode[] => {
    const linkPattern =
      /\[([^\]\n]+)\]\(((?:https?:\/\/|\/(?!\/))[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s]+|(?:ahmed-3m\.github\.io|github\.com|linkedin\.com|huggingface\.co|sihem-pwa\.pages\.dev|t\.me)(?:\/[^\s]*)?|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi
    const nodes: ReactNode[] = []
    let lastIndex = 0
    let matchIndex = 0

    for (const match of value.matchAll(linkPattern)) {
      const raw = match[0]
      const start = match.index ?? 0
      const end = start + raw.length
      const [, label, namedUrl] = match
      const isEmail = !namedUrl && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(raw)

      if (!namedUrl && !isEmail && !/^(?:https?:\/\/|www\.)/i.test(raw)) {
        const prevChar = start > 0 ? value[start - 1] : ''
        if (/[a-z0-9._@-]/i.test(prevChar)) {
          continue
        }
      }

      if (start > lastIndex) {
        nodes.push(value.slice(lastIndex, start))
      }

      const display = raw.replace(/[),.;!?،؛؟]+$/, '')
      const trailing = namedUrl ? '' : raw.slice(display.length)
      const rawHref = namedUrl ?? (isEmail ? `mailto:${display}` : /^https?:\/\//i.test(display) ? display : `https://${display}`)
      const link = resolveLinkProps(rawHref)
      if (!link) {
        nodes.push((label ?? display) + trailing)
        lastIndex = end
        continue
      }
      const { href, external } = link

      nodes.push(
        <a
          key={`${segmentKey}-link-${matchIndex++}`}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          onClick={!external && onInternalLinkClick ? (event) => onInternalLinkClick(href, event) : undefined}
          style={{
            color: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: '0.18em',
            textDecorationColor: 'color-mix(in srgb, currentColor 55%, transparent)',
          }}
        >
          {label ?? display}
        </a>
      )

      if (trailing) nodes.push(trailing)
      lastIndex = end
    }

    if (lastIndex < value.length) {
      nodes.push(value.slice(lastIndex))
    }

    return nodes.length > 0 ? nodes : [value]
  }

  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b${index}`}>
          {renderLinkedText(part.slice(2, -2), `${keyPrefix}-b${index}`)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={`${keyPrefix}-i${index}`}>
          {renderLinkedText(part.slice(1, -1), `${keyPrefix}-i${index}`)}
        </em>
      )
    }
    return <span key={`${keyPrefix}-t${index}`}>{renderLinkedText(part, `${keyPrefix}-t${index}`)}</span>
  })
}

function renderMarkdown(
  text: string,
  onInternalLinkClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void
): ReactNode {
  const lines = text.split('\n')
  const result: ReactNode[] = []
  const pending: string[] = []
  let keyIndex = 0

  const flushList = () => {
    if (pending.length === 0) return
    const key = `ul-${keyIndex++}`
    result.push(
      <ul key={key} style={{ paddingInlineStart: '1.1em', margin: '0.25em 0', listStyleType: 'disc' }}>
        {pending.map((item, index) => (
          <li key={`${key}-${index}`} style={{ margin: '0.1em 0' }}>
            {renderInline(item, `${key}-${index}`, onInternalLinkClick)}
          </li>
        ))}
      </ul>
    )
    pending.length = 0
  }

  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    const bullet = line.match(/^[-*]\s+(.+)/)

    if (heading) {
      flushList()
      result.push(
        <span
          key={`h-${index}`}
          style={{ display: 'block', fontWeight: 600, marginTop: '0.5em', marginBottom: '0.1em' }}
        >
          {renderInline(heading[2], `h-${index}`, onInternalLinkClick)}
        </span>
      )
    } else if (bullet) {
      pending.push(bullet[1])
    } else {
      flushList()
      if (!line.trim()) {
        if (result.length > 0) result.push(<div key={`sp-${index}`} style={{ height: '0.4em' }} />)
      } else {
        result.push(
          <span key={`l-${index}`} style={{ display: 'block' }}>
            {renderInline(line, `l-${index}`, onInternalLinkClick)}
          </span>
        )
      }
    }
  }

  flushList()
  return <>{result}</>
}

function trackChatEvent() {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-expect-error gtag is injected by analytics
    window.gtag('event', 'chat_message', {
      event_category: 'chatbot',
    })
  }
}

const ROUTE_SECTIONS: Partial<Record<string, string>> = {
  '/about': 'about',
  '/research': 'research',
  '/case-studies/inkjet-ood': 'inkjet',
  '/case-studies/diffusion-ood': 'research',
  '/case-studies/sihem': 'sihem',
}

function useCurrentSection() {
  const pathname = usePathname()
  const routeSection = ROUTE_SECTIONS[pathname.replace(/\/$/, '')]
  const [section, setSection] = useState('hero')

  useEffect(() => {
    if (routeSection) return
    const sections = ['hero', 'about', 'projects', 'experience', 'research', 'evidence', 'ood-explorer', 'writing', 'contact']

    const pickFromViewport = () => {
      let best = 'hero'
      let bestDistance = Number.POSITIVE_INFINITY

      for (const id of sections) {
        const element = document.getElementById(id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top - 140)
        if (rect.bottom > 120 && distance < bestDistance) {
          best = id
          bestDistance = distance
        }
      }

      setSection(best)
    }

    pickFromViewport()
    window.addEventListener('hashchange', pickFromViewport)
    window.addEventListener('scroll', pickFromViewport, { passive: true })
    window.addEventListener('resize', pickFromViewport)

    return () => {
      window.removeEventListener('hashchange', pickFromViewport)
      window.removeEventListener('scroll', pickFromViewport)
      window.removeEventListener('resize', pickFromViewport)
    }
  }, [pathname, routeSection])

  return routeSection ?? section
}

export function getStarterPrompts(section: string): PromptId[] {
  if (section === 'inkjet') {
    return ['industrial_pipeline', 'industrial_result', 'thesis_summary', 'projects_best']
  }
  if (section === 'sihem') {
    return ['sihem_overview', 'sihem_tech', 'projects_best', 'contact']
  }
  if (section === 'research' || section === 'ood-explorer') {
    return ['thesis_summary', 'thesis_loss', 'thesis_datasets', 'industrial_result']
  }
  if (section === 'projects' || section === 'evidence') {
    return ['projects_best', 'industrial_pipeline', 'thesis_summary', 'sihem_overview']
  }
  if (section === 'about' || section === 'experience') {
    return ['background', 'projects_best', 'open_to_work', 'cv']
  }
  if (section === 'contact') {
    return ['contact', 'cv', 'open_to_work', 'projects_best']
  }
  return STARTER_PROMPT_IDS
}

export const DEFAULT_PROMPTS = STARTER_PROMPT_IDS

export function pickFollowUpIds(reply: string, question: string, section: string): PromptId[] {
  const requested = findPromptId(question)
  const topic = requested ? REPLY_FOR_PROMPT[requested] : inferReplyId(question) ?? inferReplyId(reply)
  const followUps = (topic && FOLLOWUP_PROMPTS[topic]) || getStarterPrompts(section)
  return followUps.filter(id => id !== requested && REPLY_FOR_PROMPT[id] !== topic).slice(0, 3)
}

export const generateFollowUps = pickFollowUpIds

const bubbleStyles = {
  assistant: {
    background: 'color-mix(in srgb, var(--cd-elev) 78%, var(--cd-bg) 22%)',
    borderColor: 'var(--cd-b0)',
    color: 'var(--cd-fg1)',
  },
  user: {
    background:
      'linear-gradient(135deg, var(--cd-accent) 0%, color-mix(in srgb, var(--cd-accent) 70%, var(--cd-success) 30%) 100%)',
    borderColor: 'var(--cd-b-accent)',
    color: 'var(--cd-bg)',
  },
} satisfies Record<ChatRole, CSSProperties>

function SuggestedQuestions({ label, prompts, labelForPrompt, onSelect }: {
  label: string
  prompts: PromptId[]
  labelForPrompt: (id: PromptId) => string
  onSelect: (id: PromptId) => void
}) {
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p aria-hidden="true" className="text-xs font-semibold text-[var(--cd-fg2)]">{label}</p>
      <ul className="grid list-none gap-2 p-0">
        {prompts.map(id => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-[var(--cd-b1)] bg-[var(--cd-surf)] px-3 py-2 text-start text-sm leading-5 text-[var(--cd-fg1)] hover:border-[var(--cd-accent)]"
            >
              <span className="min-w-0 break-words">{labelForPrompt(id)}</span>
              <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-[var(--cd-fg2)] rtl:rotate-180" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
      style={bubbleStyles.assistant}
      aria-label={label}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--cd-accent)',
            animation: `pulse-dot 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

type ChatBotPanelProps = {
  /** Whether the shell's dialog wrapper is open. */
  isOpen: boolean
  /** Closes the panel in the shell (Escape, close button, overlay). */
  onClose: () => void
}

/**
 * Heavy chatbot internals — dictionaries, streaming client, provider fallbacks and
 * the full panel UI. Loaded lazily by ChatBot.tsx; stays mounted after the first
 * load so the conversation survives closing and reopening the panel.
 */
export default function ChatBotPanel({ isOpen, onClose }: ChatBotPanelProps) {
  const { lang, t } = useI18n()
  const pathname = usePathname()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentSection = useCurrentSection()
  const messagesRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const starterPrompts = useMemo(() => getStarterPrompts(currentSection), [currentSection])

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    closeButtonRef.current?.focus({ preventScroll: true })

    function handleKeyDown(event: KeyboardEvent) {
      // Escape is handled by the shell (ChatBot.tsx) so it works before this
      // lazy chunk arrives; the panel only owns the focus trap.
      if (event.key !== 'Tab') return
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [messages, isLoading])

  function labelForPrompt(promptId: PromptId) {
    return translateValue(lang, PROMPTS[promptId])
  }

  async function sendMessage(messageText: string, promptId?: PromptId, retry = false) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const nextMessages: ChatMessage[] = retry
      ? messages.slice(0, -1)
      : [...messages, { role: 'user', content }]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    trackChatEvent()

    // Suggested questions point to public facts and can answer immediately.
    const curatedTopic = promptId ? REPLY_FOR_PROMPT[promptId] : findCuratedTopic(content)
    const curatedReply = curatedTopic ? translateValue(lang, LOCAL_REPLIES[curatedTopic]) : null
    if (curatedReply || !CHAT_PROXY_URL) {
      const local = curatedReply ?? getLocalReply(content, lang)
      if (local) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: local,
            followUps: pickFollowUpIds(local, content, currentSection),
          },
        ])
        return
      }
      setError(t(CHAT_COPY.limitedAnswers))
      return
    }

    setIsLoading(true)
    setIsStreaming(false)
    const transcript = nextMessages.filter(message => !message.incomplete)

    try {
      let streamStarted = false
      const emitDelta = (fullContent: string) => {
        if (!streamStarted) {
          if (!fullContent.trim()) return
          streamStarted = true
          setIsStreaming(true)
          setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }])
          return
        }
        setMessages((prev) =>
          prev.map((message, index) =>
            index === prev.length - 1 && message.role === 'assistant'
              ? { ...message, content: fullContent }
              : message
          )
        )
      }

      let rawReply: ChatReply | null = null
      let lastProviderError: unknown = null

      try {
        rawReply = await fetchBigModel({
          messages: transcript,
          lang,
          proxyUrl: CHAT_PROXY_URL,
          lane: routeLocally(content),
          onDelta: emitDelta,
        })
      } catch (providerError) {
        lastProviderError = providerError
        console.error('Chat provider BigModel failed:', providerError)
      }

      const proxyRateLimited = Boolean(
        (lastProviderError as ChatCompletionError | undefined)?.isProxyRateLimit
      )

      if (rawReply === null && !proxyRateLimited) {
        try {
          streamStarted = false
          rawReply = await fetchGroq({
            messages: transcript,
            lang,
            proxyUrl: CHAT_PROXY_URL,
            onDelta: emitDelta,
          })
        } catch (providerError) {
          lastProviderError = providerError
          console.error('Chat provider Groq failed:', providerError)
        }
      }

      if (rawReply === null) {
        const local = getLocalReply(content, lang)
        if (local) {
          rawReply = { content: local }
        } else {
          throw lastProviderError ?? new Error('No chat provider succeeded.')
        }
      }

      const reply = streamStarted ? rawReply.content : shortenReply(rawReply.content)
      const finalMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        incomplete: rawReply.incomplete,
        followUps: rawReply.incomplete ? undefined : pickFollowUpIds(reply, content, currentSection),
      }
      setMessages(prev => [...(streamStarted ? prev.slice(0, -1) : prev), finalMessage])
    } catch (caughtError) {
      if (retry) setMessages(messages)
      console.error('Chat failed across all configured providers:', caughtError)
      const status = (caughtError as ChatCompletionError | undefined)?.status
      setError(t(status === 429 ? CHAT_COPY.rateLimited : CHAT_COPY.genericError))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handlePrompt(promptId: PromptId) {
    void sendMessage(labelForPrompt(promptId), promptId)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  function handleInternalLinkClick(href: string, event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!href.includes('#')) return
    const [linkPath, linkHash] = href.split('#')
    const normCurrent = pathname.replace(/\/$/, '') || '/'
    const normTarget = (linkPath || '/').replace(/\/$/, '') || '/'
    if (normCurrent !== normTarget) return
    event.preventDefault()
    onClose()
    if (linkHash) {
      document.getElementById(linkHash)?.scrollIntoView()
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${linkHash}`
      )
    }
  }

  return (
    <div ref={panelRef} className="flex h-full flex-col">
      <header
        className="flex items-center justify-between border-b px-4 py-4"
        style={{ borderColor: 'var(--cd-b0)' }}
      >
        <h2 className="text-sm font-semibold tracking-[0.02em]" style={{ color: 'var(--cd-fg1)' }}>
          {t(CHAT_COPY.title)}
        </h2>
        <button
          type="button"
          onClick={onClose}
          ref={closeButtonRef}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
          style={{
            borderColor: 'var(--cd-b0)',
            background: 'color-mix(in srgb, var(--cd-surf) 74%, var(--cd-bg) 26%)',
            color: 'var(--cd-fg2)',
          }}
          aria-label={t(CHAT_COPY.close)}
        >
          <X size={17} />
        </button>
      </header>

      <div
        ref={messagesRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div
              className="max-w-[92%] rounded-2xl border px-3 py-3 text-sm leading-6"
              style={bubbleStyles.assistant}
            >
              {t(CHAT_COPY.welcome)}
            </div>
            <SuggestedQuestions
              label={t(CHAT_COPY.suggestions)}
              prompts={starterPrompts}
              labelForPrompt={labelForPrompt}
              onSelect={handlePrompt}
            />
          </div>
        ) : (
          messages.map((message, index) => {
            const isLastAssistant =
              message.role === 'assistant' &&
              !messages.slice(index + 1).some((item) => item.role === 'assistant')

            return (
              <div key={`${message.role}-${index}`} className="space-y-2">
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] min-w-0 break-words rounded-2xl border px-3 py-2.5 text-sm leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.14)]${
                      message.role === 'user' ? ' whitespace-pre-wrap' : ''
                    }`}
                    style={bubbleStyles[message.role]}
                  >
                    {message.role === 'assistant'
                      ? renderMarkdown(message.content, handleInternalLinkClick)
                      : message.content}
                  </div>
                </div>

                {message.incomplete && (
                  <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--cd-warn)' }}>
                    <span>{t(CHAT_COPY.incompleteReply)}</span>
                    {index === messages.length - 1 && !isLoading && (
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 underline"
                        onClick={() => void sendMessage(messages[index - 1].content, undefined, true)}
                      >
                        {t(CHAT_COPY.retryReply)}
                      </button>
                    )}
                  </div>
                )}

                {isLastAssistant && !isLoading && message.followUps && message.followUps.length > 0 && (
                  <SuggestedQuestions
                    label={t(CHAT_COPY.followUps)}
                    prompts={message.followUps}
                    labelForPrompt={labelForPrompt}
                    onSelect={handlePrompt}
                  />
                )}
              </div>
            )
          })
        )}

        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <LoadingDots label={t(CHAT_COPY.typing)} />
          </div>
        )}
      </div>

      <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--cd-b0)' }}>
        {error && (
          <p role="alert" className="mb-3 text-xs leading-5" style={{ color: 'var(--cd-warn)' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t(CHAT_COPY.placeholder)}
            className="h-12 min-w-0 flex-1 rounded-2xl border px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cd-accent)] md:text-sm"
            style={{
              borderColor: 'var(--cd-b0)',
              background: 'color-mix(in srgb, var(--cd-surf) 70%, var(--cd-bg) 30%)',
              color: 'var(--cd-fg1)',
            }}
            aria-label={t(CHAT_COPY.dialogLabel)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'var(--cd-accent)',
              color: 'var(--cd-bg)',
              boxShadow: '0 12px 30px color-mix(in srgb, var(--cd-accent) 28%, transparent)',
            }}
            aria-label={t(CHAT_COPY.send)}
          >
            <ArrowUp size={17} />
          </button>
        </form>
      </div>
    </div>
  )
}
