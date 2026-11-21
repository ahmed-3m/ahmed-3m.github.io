'use client'

import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { languageName, translateValue, type Language, type TranslationMap } from '@/lib/i18n-config'
import { buildChatMessages, createRequestTimers } from '@/lib/chat-request'
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

type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: 'Groq' | 'BigModel'
}

const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b'
const ZAI_MODEL = process.env.NEXT_PUBLIC_BIGMODEL_MODEL || 'glm-5.3'
const ZAI_FAST_MODEL = process.env.NEXT_PUBLIC_ZAI_FAST_MODEL || 'glm-5-turbo'
const ZAI_ROUTER_MODEL = process.env.NEXT_PUBLIC_ZAI_ROUTER_MODEL || 'glm-5.3-flash'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const ZAI_CHAT_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions'
const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL
const MAX_REPLY_CHARS = 1600
const ROUTER_TIMEOUT_MS = 1500
const TTFB_TIMEOUT_MS = 20000

const PORTFOLIO = 'https://ahmed-3m.github.io'
const CV_URL = `${PORTFOLIO}/cv.pdf`
const CONTACT_URL = `${PORTFOLIO}/#contact`
const BACKGROUND_URL = `${PORTFOLIO}/about/`
const RESEARCH_URL = `${PORTFOLIO}/research/`
const INDUSTRIAL_URL = `${PORTFOLIO}/case-studies/inkjet-ood/`
const DIFFUSION_URL = `${PORTFOLIO}/case-studies/diffusion-ood/`
const SIHEM_URL = `${PORTFOLIO}/case-studies/sihem/`
const THESIS_URL = `${PORTFOLIO}/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`

function systemPrompt(lang: Language) {
  return `You are ${GENIE_NAME}, a guide to Ahmed Mohammed’s public portfolio. Speak about Ahmed in the third person. Answer only about his public work, background, and professional contact options. If a detail is unavailable, say so and point to a relevant public page. Never guess personal information, hiring commitments, dates, results, or legal eligibility. Do not claim to have opened links, sent messages, or performed actions.

Answer in the language of the latest question. If unclear, use ${languageName[lang]}, the portfolio language. Start with the answer in everyday language. Default to 2–4 short sentences and give one relevant public link when useful. Offer technical detail when asked. Follow explicit format and length constraints. Do not add a greeting unless the visitor asks who you are. Use the public facts and links below as evidence, and keep technical names and numbers accurate.

Profile: AI/ML engineer in Linz, Austria, open to full-time AI/ML roles. Ahmed has worked as a freelance AI consultant since May 2026. He worked on industrial vision at PROFACTOR from April to November 2024, then continued the research at JKU Linz. He earned an M.Sc. in Artificial Intelligence in September 2026. His thesis, supervised by Prof. Sepp Hochreiter, was submitted in July 2026 and graded 1. B.Sc. in Mechatronics Engineering at Eastern Mediterranean University, with an Excellent grade on the SCARA robot capstone for tracking moving objects. Other experience includes an EEG motor imagery research internship at Karunya Institute and electronics technician work at Ledzone. Describe work authorization as something to confirm directly with Ahmed.

Featured work:
- Industrial inkjet inspection: a two-stage YOLO and conditional diffusion pipeline for locating print features and scoring anomalies. The diffusion baseline reached 0.8673 ± 0.0230 AUROC under five-fold cross-validation on the public FTI_Zer0P benchmark. Adding separation loss did not significantly improve the industrial result after Holm correction. This is a benchmark result, not production accuracy. Case study: ${INDUSTRIAL_URL}
- Diffusion research: the thesis compared conditional reconstruction errors to flag unfamiliar images. With separation loss, the three-seed mean was 99.03% ± 0.07% AUROC on the within-CIFAR-10 binary airplane-vs-rest split, against 92.52% ± 11.07% without it. This is not general CIFAR-10 accuracy or a multi-class benchmark. If asked about the single seed-42 run, its within-CIFAR AUROC was 98.98%. Case study: ${DIFFUSION_URL} Thesis PDF: ${THESIS_URL}
- Sihem: Ahmed leads and builds this personal planning and routines assistant. The Telegram bot and installable web app are in an invitation-only beta with scheduled check-ins, retrieval-based memory, and model routing. The native Android client uses Kotlin and Jetpack Compose and is in private testing. Case study: ${SIHEM_URL}
- mergeproof checks AI-written pull requests against configured deterministic merge requirements without calling a language model. Passing its checks does not guarantee defect-free code. Repository: https://github.com/ahmed-3m/mergeproof

Public links: CV ${CV_URL} · About ${BACKGROUND_URL} · Research reports and evidence ${RESEARCH_URL} · Explorer ${DIFFUSION_URL}#ood-explorer · Contact ${CONTACT_URL} · GitHub https://github.com/ahmed-3m · LinkedIn https://www.linkedin.com/in/ahmed-3m/
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
    ar: `أحمد مهندس ذكاء اصطناعي وتعلّم آلي في لينز، حاصل على ماجستير في الذكاء الاصطناعي من JKU وبكالوريوس في الميكاترونكس. انتقل من الإلكترونيات والروبوتات إلى الرؤية الحاسوبية الصناعية وأبحاث الذكاء الاصطناعي. حصل مشروعه SCARA على تقدير ممتاز. [التعليم والخبرة](${BACKGROUND_URL})`,
  },
  cv: {
    en: `[Download Ahmed’s public CV (PDF)](${CV_URL})`,
    de: `[Ahmeds öffentlichen Lebenslauf herunterladen (PDF)](${CV_URL})`,
    fr: `[Télécharger le CV public d’Ahmed (PDF)](${CV_URL})`,
    es: `[Descargar el CV público de Ahmed (PDF)](${CV_URL})`,
    ar: `[تنزيل السيرة الذاتية العامة لأحمد (PDF)](${CV_URL})`,
  },
  industrial: {
    en: `Ahmed evaluated the system using five-fold cross-validation on the public FTI_Zer0P dataset. The baseline reached 0.8673 ± 0.0230 AUROC. Adding separation loss did not significantly improve this result after Holm correction. [Read the industrial evaluation](${INDUSTRIAL_URL}).`,
    de: `Ahmed prüfte das System mit fünffacher Kreuzvalidierung auf dem öffentlichen FTI_Zer0P-Datensatz. Die Baseline erreichte 0.8673 ± 0.0230 AUROC. Nach Holm-Korrektur brachte die Separation Loss keine signifikante Verbesserung. [Zur industriellen Auswertung](${INDUSTRIAL_URL}).`,
    fr: `Ahmed a évalué le système par validation croisée à cinq plis sur le jeu public FTI_Zer0P. La référence a atteint 0.8673 ± 0.0230 AUROC. La perte de séparation n’a apporté aucun gain significatif après correction de Holm. [Lire l’évaluation industrielle](${INDUSTRIAL_URL}).`,
    es: `Ahmed evaluó el sistema mediante validación cruzada de cinco pliegues con el conjunto público FTI_Zer0P. La referencia alcanzó 0.8673 ± 0.0230 AUROC. La pérdida de separación no aportó una mejora significativa tras la corrección de Holm. [Leer la evaluación industrial](${INDUSTRIAL_URL}).`,
    ar: `قيّم أحمد النظام بالتحقق المتقاطع عبر خمسة أجزاء على مجموعة FTI_Zer0P العامة. سجّل النموذج المرجعي 0.8673 ± 0.0230 AUROC، ولم تحقق خسارة الفصل تحسنًا ذا دلالة إحصائية بعد تصحيح Holm. [اقرأ التقييم الصناعي](${INDUSTRIAL_URL}).`,
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
    ar: `مشروع Sihem (تيليجرام @sihem_ai_bot، وتطبيق الويب: https://sihem-pwa.pages.dev/، نسخة تجريبية بدعوة) هو مساعد شخصي موجه واستباقي للعادات والروتين اليومي من تطوير أحمد، ومقبول في حاضنة الأعمال tech2b في لينز (مايو 2026 – الآن). مبني على Supabase Edge Functions (Deno/TypeScript) وPostgreSQL مع RLS، ويتميز بمحرك قرار حتمي (مولدات←محكم←مؤلف) لجدولة التنبيهات، وذاكرة pgvector طويلة المدى مع RAG، وتوجيه LLM متعدد المزودين (GLM/Gemini/Groq) مع تبديل تلقائي، وتذكيرات صوتية بـ Cloudflare MeloTTS، ومزامنة Google Calendar. [اقرأ دراسة الحالة العامة](${SIHEM_URL}).`,
  },
  thesis: {
    en: `Ahmed’s thesis tested whether a diffusion model could recognize unfamiliar images. Separation loss improved mean AUROC from 92.52% ± 11.07% to 99.03% ± 0.07% across three seeds on a binary CIFAR-10 airplane-vs-rest split. [See the findings and limits](${DIFFUSION_URL}).`,
    de: `Ahmed untersuchte, ob ein Diffusionsmodell unbekannte Bilder erkennt. Mit Separation Loss stieg die mittlere AUROC von 92.52% ± 11.07% auf 99.03% ± 0.07% über drei Läufe im binären CIFAR-10-Vergleich Flugzeuge gegen alle anderen Klassen. [Ergebnisse und Grenzen](${DIFFUSION_URL}).`,
    fr: `Ahmed a étudié la reconnaissance d’images inconnues par un modèle de diffusion. Sur trois essais du test binaire CIFAR-10 avions contre toutes les autres classes, la perte de séparation a fait passer l’AUROC moyenne de 92.52% ± 11.07% à 99.03% ± 0.07%. [Résultats et limites](${DIFFUSION_URL}).`,
    es: `Ahmed estudió si un modelo de difusión podía reconocer imágenes desconocidas. En tres ejecuciones de la prueba binaria CIFAR-10 aviones contra el resto, la pérdida de separación elevó la AUROC media de 92.52% ± 11.07% a 99.03% ± 0.07%. [Resultados y límites](${DIFFUSION_URL}).`,
    ar: `درس أحمد قدرة نموذج انتشار على التعرّف على الصور غير المألوفة. رفعت خسارة الفصل متوسط AUROC من 92.52% ± 11.07% إلى 99.03% ± 0.07% عبر ثلاث تجارب في اختبار CIFAR-10 الثنائي للطائرات مقابل بقية الفئات. [النتائج وحدودها](${DIFFUSION_URL}).`,
  },
  contact: {
    en: `You can email Ahmed at ahmed.mo.0595@gmail.com or find his professional profiles on the [contact page](${CONTACT_URL}).`,
    de: `Sie erreichen Ahmed per E-Mail unter ahmed.mo.0595@gmail.com. Seine beruflichen Profile finden Sie im [Kontaktbereich](${CONTACT_URL}).`,
    fr: `Vous pouvez écrire à Ahmed à ahmed.mo.0595@gmail.com ou consulter ses profils professionnels dans la [rubrique contact](${CONTACT_URL}).`,
    es: `Puedes escribir a Ahmed a ahmed.mo.0595@gmail.com o consultar sus perfiles profesionales en la [sección de contacto](${CONTACT_URL}).`,
    ar: `يمكنك مراسلة أحمد على ahmed.mo.0595@gmail.com أو الاطّلاع على ملفاته المهنية في [قسم التواصل](${CONTACT_URL}).`,
  },
  open_to_work: {
    en: `Ahmed is based in Linz and open to full-time AI/ML roles, especially computer vision and applied ML. [Contact Ahmed](${CONTACT_URL}) to discuss a role or confirm current availability.`,
    de: `Ahmed lebt in Linz und sucht Vollzeitstellen in AI/ML, insbesondere in der Bildverarbeitung und im angewandten ML. [Kontaktieren Sie Ahmed](${CONTACT_URL}), um eine Stelle und seine aktuelle Verfügbarkeit zu besprechen.`,
    fr: `Ahmed est basé à Linz et ouvert aux postes à temps plein en IA/ML, notamment en vision par ordinateur et en ML appliqué. [Contactez Ahmed](${CONTACT_URL}) pour parler d’un poste ou confirmer ses disponibilités.`,
    es: `Ahmed vive en Linz y busca puestos a tiempo completo en IA/ML, especialmente en visión por computador y ML aplicado. [Contacta con Ahmed](${CONTACT_URL}) para hablar de un puesto o confirmar su disponibilidad.`,
    ar: `يقيم أحمد في لينز وهو متاح لوظائف بدوام كامل في الذكاء الاصطناعي وتعلّم الآلة، خاصة في الرؤية الحاسوبية وتعلّم الآلة التطبيقي. [تواصل مع أحمد](${CONTACT_URL}) لمناقشة فرصة عمل أو تأكيد توافره الحالي.`,
  },
  tech_stack: {
    en: `Ahmed's stack spans AI research and production engineering:\n- ML: PyTorch, Python, Diffusion Models, YOLO, OpenCV, Anomaly Detection\n- Product/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Tools: Git, Weights & Biases, Hugging Face, Linux\n[Skills and background](${BACKGROUND_URL}) · [Inkjet inspection](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    de: `Ahmeds Stack umfasst KI-Forschung und Produktionsentwicklung:\n- ML: PyTorch, Python, Diffusionsmodelle, YOLO, OpenCV, Anomalieerkennung\n- Produkt/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Tools: Git, Weights & Biases, Hugging Face, Linux\n[Skills und Hintergrund](${BACKGROUND_URL}) · [Inkjet-Prüfung](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    fr: `Le stack d'Ahmed couvre la recherche IA et la production :\n- ML : PyTorch, Python, Modèles de diffusion, YOLO, OpenCV, Détection d'anomalies\n- Produit/Infra : Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Outils : Git, Weights & Biases, Hugging Face, Linux\n[Compétences et parcours](${BACKGROUND_URL}) · [Inspection jet d’encre](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    es: `El stack de Ahmed abarca investigación en IA e ingeniería de producción:\n- ML: PyTorch, Python, Modelos de difusión, YOLO, OpenCV, Detección de anomalías\n- Producto/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Herramientas: Git, Weights & Biases, Hugging Face, Linux\n[Habilidades y trayectoria](${BACKGROUND_URL}) · [Inspección inkjet](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    ar: `يشمل الـ stack الخاص بأحمد أبحاث الذكاء الاصطناعي وهندسة الإنتاج:\n- تعلم الآلة: PyTorch وPython ونماذج الانتشار وYOLO وOpenCV وكشف الشذوذ\n- المنتج والبنية: Next.js وReact وTypeScript وConvex وDocker وPostgreSQL وCloudflare\n- الأدوات: Git وWeights & Biases وHugging Face وLinux\n[المهارات والخلفية](${BACKGROUND_URL}) · [فحص الطباعة](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
  },
  achievements: {
    en: `Key proof points:\n- [DiffusionOOD](${DIFFUSION_URL}): 99.03% ± 0.07% AUROC (3-seed mean) on within-CIFAR airplane-vs-rest binary OOD split with novel class-conditional separation loss (+6.5pp over 92.52% ± 11.07% baseline; M.Sc. thesis under Prof. Sepp Hochreiter, graded 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): 0.8673 ± 0.0230 AUROC baseline under strict 5-fold CV on the public FTI_Zer0P industrial dataset at PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo Developer & Project Lead (tech2b incubator Linz, invitation-only beta personal-mentor assistant)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): checks AI-written pull requests against configured deterministic merge requirements without calling an LLM (passing those checks does not guarantee defect-free code)`,
    de: `Wichtige Meilensteine:\n- [DiffusionOOD](${DIFFUSION_URL}): 99,03 % ± 0,07 % AUROC (3-Seed-Mittel) auf dem binären Within-CIFAR-Split Flugzeuge gegen den Rest mit neuartiger class-conditional separation loss (+6,5 Prozentpunkte gegenüber 92,52 % ± 11,07 % Baseline; Masterarbeit bei Prof. Sepp Hochreiter, Note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): 0,8673 ± 0,0230 AUROC-Baseline auf dem öffentlichen Datensatz FTI_Zer0P unter strenger 5-facher Kreuzvalidierung bei PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo-Entwickler & Projektleiter (tech2b Inkubator Linz, KI-Mentor-Assistent in Beta mit Einladung)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): prüft KI-generierte PRs anhand konfigurierter deterministischer Merge-Anforderungen ohne LLM-Aufruf (bestandene Prüfungen garantieren keine Fehlerfreiheit)`,
    fr: `Principaux résultats :\n- [DiffusionOOD](${DIFFUSION_URL}) : 99,03 % ± 0,07 % AUROC (moyenne sur 3 seeds) sur le split binaire within-CIFAR avions contre le reste avec separation loss conditionnelle (+6,5 points par rapport à la référence de 92,52 % ± 11,07 % ; mémoire dirigé par Prof. Sepp Hochreiter, note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}) : référence à 0,8673 ± 0,0230 AUROC sur le jeu public FTI_Zer0P en validation croisée 5 plis chez PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}) : Développeur solo & chef de projet (incubateur tech2b Linz, assistant mentor IA en bêta sur invitation)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof) : vérifie les PR générées par IA selon des exigences déterministes configurées sans appel LLM (la réussite des contrôles ne garantit pas un code sans défaut)`,
    es: `Logros destacados:\n- [DiffusionOOD](${DIFFUSION_URL}): 99.03% ± 0.07% AUROC (media de 3 seeds) en el split binario within-CIFAR aviones contra el resto con separation loss condicional (+6.5 puntos porcentuales frente al 92.52% ± 11.07% de referencia; tesis con Prof. Sepp Hochreiter, nota 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): referencia de 0.8673 ± 0.0230 AUROC en el dataset público FTI_Zer0P con validación cruzada 5-fold en PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Desarrollador en solitario y líder de proyecto (incubadora tech2b Linz, asistente mentor IA en beta por invitación)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): verifica PRs generadas por IA según requisitos deterministas configurados sin llamadas a un LLM (superar las comprobaciones no garantiza que el código esté libre de errores)`,
    ar: `أبرز الإنجازات:\n- [DiffusionOOD](${DIFFUSION_URL}): 99.03% ± 0.07% AUROC (متوسط 3 بذور) على تقسيم within-CIFAR الثنائي للطائرات مقابل البقية مع separation loss الشرطية (+6.5 نقطة مئوية مقارنةً بالأساس 92.52% ± 11.07%؛ رسالة الماجستير بإشراف Prof. Sepp Hochreiter، تقدير 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): خط أساس 0.8673 ± 0.0230 AUROC على مجموعة FTI_Zer0P العامة بتحقق تقاطعي 5-fold لدى PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): مطور منفرد وقائد مشروع (حاضنة tech2b لينز، مساعد موجه بالذكاء الاصطناعي في نسخة تجريبية بدعوة)\n- [mergeproof](https://github.com/ahmed-3m/mergeproof): يتحقق من طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات حتمية محددة دون استدعاء نموذج لغوي (اجتياز الفحوص لا يضمن خلو الشيفرة من الأخطاء)`,
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
  thesis_innovation: 'thesis',
  thesis_loss: 'thesis',
  thesis_results: 'thesis',
  thesis_datasets: 'thesis',
  thesis_diffusion: 'thesis',
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

function inferReplyId(text: string): ReplyId | undefined {
  if (/industrial|industriell|industriel|inkjet|profactor|fti[_-]?zer0p|الصناعي/i.test(text)) return 'industrial'
  if (/\b(sihem|mentor|habit|routine|telegram|tech2b|pgvector)\b/i.test(text)) return 'sihem'
  if (/\b(thesis|separation loss|ood|out.?of.?distribution|cifar|auroc)\b|masterarbeit|mémoire|tesis|رسالة/i.test(text)) return 'thesis'
  if (/^\s*(?:his|the|a)?\s*(?:cv|r[eé]sum[eé])(?:\s+please)?\s*[?!. ]*$|\b(?:download|get|find|see|show|share|send|read|open|view|access|check|need|want|have|where(?:'s|\s+is)|link(?:\s+to)?|copy\s+of|his|public|pdf|son|télécharger|descargar|su|ver|obtener)\b[^.?!]{0,35}\b(?:cv|r[eé]sum[eé])\b|\b(?:cv|r[eé]sum[eé])\b[^.?!]{0,20}\b(?:link|pdf|file|download|url|please|available)\b|curr[ií]culum|lebenslauf|سير(?:ة|ته)\s*الذاتية/i.test(text)) return 'cv'
  if (/(contact|email|linkedin|reach|talk to|connect|تواصل)/i.test(text)) return 'contact'
  if (/(open to work|available|hire|job|role|opportunit|وظائف)/i.test(text)) return 'open_to_work'
  if (/(tech stack|stack|tools|technolog)/i.test(text)) return 'tech_stack'
  if (/(achievement|accomplishment|highlights|best result|proof points)/i.test(text)) return 'achievements'
  if (/(background|education|mechatronics|ausbildung|parcours|trayectoria|خلفية)/i.test(text)) return 'background'
  if (/(projects|projekte|projets|proyectos|مشاريع|portfolio|github)/i.test(text)) return 'projects'
}

export function getLocalReply(question: string, lang: Language): string | null {
  const id = findPromptId(question)
  const topic = id ? REPLY_FOR_PROMPT[id] : inferReplyId(question)
  return topic ? translateValue(lang, LOCAL_REPLIES[topic]) : null
}

const FOLLOWUP_PROMPTS: Partial<Record<ReplyId, PromptId[]>> = {
  projects: ['industrial_result', 'thesis_summary', 'sihem_overview'],
  inspection: ['industrial_result', 'thesis_summary', 'projects_best'],
  industrial: ['industrial_pipeline', 'thesis_summary', 'projects_best'],
  thesis: ['industrial_result', 'background', 'cv'],
  sihem_intro: ['sihem_tech', 'projects_best', 'contact'],
  sihem: ['sihem_overview', 'projects_best', 'contact'],
  cv: ['background', 'open_to_work', 'contact'],
  background: ['projects_best', 'cv', 'contact'],
  open_to_work: ['cv', 'contact', 'projects_best'],
  contact: ['cv', 'projects_best', 'background'],
}

function isConfiguredToken(token: string | undefined): token is string {
  return Boolean(token && token !== 'your_groq_token_here' && token !== 'your_zai_token_here')
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
  code?: string
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  return error
}

type StreamDelta = (fullContent: string) => void

type StreamChunk = ChatCompletionResponse & {
  choices?: Array<{
    delta?: { content?: string }
    message?: { content?: string }
  }>
}

type ChatLane = 'fast' | 'deep'

const SOCIAL_PATTERN = /^(hi|hey|hello|yo|good (morning|afternoon|evening)|thanks|thank you|thx|ok|okay|great|nice|cool|bye|goodbye)[\s!.?]*$/i
const DEEP_PATTERN = /\b(explain|compare|why|how (does|do|did|would|to think)|walk me|deep dive|detailed|difference between|pros and cons|evaluate|critique)\b/i

function routeLocally(message: string): ChatLane | null {
  if (SOCIAL_PATTERN.test(message.trim())) return 'fast'
  if (DEEP_PATTERN.test(message)) return 'deep'
  return null
}

async function routeWithClassifier(
  message: string,
  auth: { token: string; url: string; useProxy: boolean }
): Promise<ChatLane> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth.token && !auth.useProxy) headers.Authorization = `Bearer ${auth.token}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ROUTER_TIMEOUT_MS)
    try {
      const response = await fetch(auth.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: ZAI_ROUTER_MODEL,
          messages: [
            {
              role: 'user',
              content: `You classify chat messages sent to a personal-assistant chatbot about its owner. FAST = greetings, thanks, simple factual lookups, short definitions, yes/no questions, single-fact asks (contact info, links, "what is X"). DEEP = explanations, comparisons, multi-part questions, nuanced or open-ended asks. Respond with exactly one word: FAST or DEEP.\n\nMessage: ${message}`,
            },
          ],
          max_tokens: 4,
          temperature: 0,
          stream: false,
        }),
        signal: controller.signal,
      })
      if (!response.ok) return 'deep'
      const data = (await response.json()) as ChatCompletionResponse
      const verdict = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? ''
      return verdict.includes('fast') ? 'fast' : 'deep'
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    return 'deep'
  }
}

type ProviderAuth = { token: string; url: string; useProxy: boolean }

async function fetchBigModel({
  messages,
  lang,
  auth,
  lane,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  lang: Language
  auth: ProviderAuth
  lane: ChatLane
  onDelta?: StreamDelta
}): Promise<string> {
  const model = lane === 'fast' ? ZAI_FAST_MODEL : ZAI_MODEL
  const maxTokens = lane === 'fast' ? 380 : 1200
  const payloadMessages = buildChatMessages(systemPrompt(lang), messages)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth.token && !auth.useProxy) {
    headers.Authorization = `Bearer ${auth.token}`
  }

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
    const response = await fetch(auth.url, {
      method: 'POST',
      headers,
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
      const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse
      const errorDetail = typeof data.error === 'string' ? undefined : data.error
      const message =
        typeof data.error === 'string'
          ? data.error
          : errorDetail?.message ?? 'BigModel could not respond right now.'
      throw createChatError(message, 'BigModel', response.status, errorDetail?.code)
    }

    if (!streaming || !response.body) {
      timers.onFirstByte()
      const data = (await response.json()) as ChatCompletionResponse
      const reply = data.choices?.[0]?.message?.content?.trim()
      if (!reply) throw createChatError('BigModel returned an empty response.', 'BigModel')
      return reply
    }

    timers.onFirstByte()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let content = ''

    const consumeLine = (line: string) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) return
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') return
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
            : chunk.error.message ?? 'BigModel stream failed.'
        throw createChatError(message, 'BigModel')
      }
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) {
        content += delta
        onDelta?.(content)
      }
    }

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        timers.onChunk()
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) consumeLine(line)
      }
      if (buffer) consumeLine(buffer)
    } catch (streamError) {
      if (content.trim()) {
        console.warn('Chat stream from BigModel ended early — keeping partial reply.', streamError)
        return content.trim()
      }
      throw streamError
    }

    if (!content.trim()) {
      throw createChatError('BigModel returned an empty response.', 'BigModel')
    }
    return content.trim()
  } finally {
    timers.clear()
  }
}

async function fetchGroq({
  messages,
  lang,
  auth,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  lang: Language
  auth: ProviderAuth
  onDelta?: StreamDelta
}): Promise<string> {
  const payloadMessages = buildChatMessages(systemPrompt(lang), messages)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (!auth.useProxy && auth.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }

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
    const response = await fetch(auth.url, {
      method: 'POST',
      headers,
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
      const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse
      const errorDetail = typeof data.error === 'string' ? undefined : data.error
      const message =
        typeof data.error === 'string'
          ? data.error
          : errorDetail?.message ?? 'Groq could not respond right now.'
      if (response.status === 503) {
        throw createChatError('Model is warming up, try again in a moment.', 'Groq', response.status)
      }
      throw createChatError(message, 'Groq', response.status, errorDetail?.code)
    }

    if (!streaming || !response.body) {
      timers.onFirstByte()
      const data = (await response.json()) as ChatCompletionResponse
      const reply = data.choices?.[0]?.message?.content?.trim()
      if (!reply) throw createChatError('Groq returned an empty response.', 'Groq')
      return reply
    }

    timers.onFirstByte()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let content = ''

    const consumeLine = (line: string) => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) return
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') return
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
            : chunk.error.message ?? 'Groq stream failed.'
        throw createChatError(message, 'Groq')
      }
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) {
        content += delta
        onDelta?.(content)
      }
    }

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        timers.onChunk()
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) consumeLine(line)
      }
      if (buffer) consumeLine(buffer)
    } catch (streamError) {
      if (content.trim()) {
        console.warn('Chat stream from Groq ended early — keeping partial reply.', streamError)
        return content.trim()
      }
      throw streamError
    }

    if (!content.trim()) {
      throw createChatError('Groq returned an empty response.', 'Groq')
    }
    return content.trim()
  } finally {
    timers.clear()
  }
}

/**
 * Normalizes same-site portfolio links to relative paths and marks only external
 * URLs and PDF downloads to open in a new tab.
 */
function resolveLinkProps(rawHref: string, isEmail: boolean): { href: string; external: boolean } {
  if (isEmail) return { href: rawHref, external: false }
  if (rawHref.startsWith('/')) {
    const pathname = rawHref.split(/[?#]/, 1)[0]
    return { href: rawHref, external: pathname.toLowerCase().endsWith('.pdf') }
  }
  try {
    const parsed = new URL(rawHref)
    if (parsed.origin === PORTFOLIO) {
      const isPdf = parsed.pathname.toLowerCase().endsWith('.pdf')
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        external: isPdf,
      }
    }
  } catch {
    // Fall through to treating unparseable URLs as external links.
  }
  return { href: rawHref, external: true }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const renderLinkedText = (value: string, segmentKey: string): ReactNode[] => {
    const linkPattern =
      /\[([^\]\n]+)\]\(((?:https?:\/\/|\/(?!\/))[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi
    const nodes: ReactNode[] = []
    let lastIndex = 0
    let matchIndex = 0

    for (const match of value.matchAll(linkPattern)) {
      const raw = match[0]
      const start = match.index ?? 0
      const end = start + raw.length

      if (start > lastIndex) {
        nodes.push(value.slice(lastIndex, start))
      }

      const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(raw)
      const display = raw.replace(/[),.;!?،؛؟]+$/, '')
      const [, label, namedUrl] = match
      const trailing = namedUrl ? '' : raw.slice(display.length)
      const rawHref = namedUrl ?? (isEmail ? `mailto:${display}` : /^https?:\/\//i.test(display) ? display : `https://${display}`)
      const { href, external } = resolveLinkProps(rawHref, isEmail)

      nodes.push(
        <a
          key={`${segmentKey}-link-${matchIndex++}`}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
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

function renderMarkdown(text: string): ReactNode {
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
            {renderInline(item, `${key}-${index}`)}
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
          {renderInline(heading[2], `h-${index}`)}
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
            {renderInline(line, `l-${index}`)}
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
    return ['thesis_summary', 'industrial_result', 'industrial_pipeline', 'projects_best']
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
  onSelect: (id: PromptId, keyboard: boolean) => void
}) {
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p aria-hidden="true" className="text-xs font-semibold text-[var(--cd-fg2)]">{label}</p>
      <ul className="grid list-none gap-2 p-0">
        {prompts.map(id => (
          <li key={id}>
            <button
              type="button"
              onClick={event => onSelect(id, event.detail === 0)}
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

  async function sendMessage(messageText: string, promptId?: PromptId) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const groqToken = process.env.NEXT_PUBLIC_GROQ_TOKEN
    const zaiToken = process.env.NEXT_PUBLIC_BIGMODEL_TOKEN
    const hasGroqToken = isConfiguredToken(groqToken)
    const hasZaiToken = isConfiguredToken(zaiToken)
    const hasProxy = Boolean(CHAT_PROXY_URL)

    const nextUserMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, nextUserMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    trackChatEvent()

    // Suggested questions point to public facts and can answer immediately.
    const curatedReply = promptId ? translateValue(lang, LOCAL_REPLIES[REPLY_FOR_PROMPT[promptId]]) : null
    if (curatedReply || (!hasGroqToken && !hasZaiToken && !hasProxy)) {
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

    try {
      const zaiAuth = (hasZaiToken || hasProxy)
        ? {
            token: zaiToken ?? '',
            url: CHAT_PROXY_URL || ZAI_CHAT_URL,
            useProxy: Boolean(CHAT_PROXY_URL),
          }
        : null

      let lane: ChatLane = 'deep'
      if (zaiAuth) {
        lane = routeLocally(content) ?? (await routeWithClassifier(content, zaiAuth))
      }

      let streamStarted = false
      const emitDelta = (fullContent: string) => {
        if (!streamStarted) {
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

      let rawReply: string | null = null
      let lastProviderError: unknown = null

      if (zaiAuth) {
        try {
          streamStarted = false
          rawReply = await fetchBigModel({
            messages: nextMessages,
            lang,
            auth: zaiAuth,
            lane,
            onDelta: emitDelta,
          })
        } catch (providerError) {
          lastProviderError = providerError
          console.error('Chat provider BigModel failed:', providerError)
        }
      }

      const groqAuth: ProviderAuth | null =
        hasGroqToken || hasProxy
          ? {
              token: groqToken ?? '',
              url: CHAT_PROXY_URL || GROQ_CHAT_URL,
              useProxy: Boolean(CHAT_PROXY_URL),
            }
          : null

      if (rawReply === null && groqAuth) {
        try {
          streamStarted = false
          rawReply = await fetchGroq({
            messages: nextMessages,
            lang,
            auth: groqAuth,
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
          rawReply = local
        } else {
          throw lastProviderError ?? new Error('No chat provider succeeded.')
        }
      }

      const reply = shortenReply(rawReply)

      setMessages((prev) => {
        const lastIndex = prev.length - 1
        if (lastIndex >= 0 && prev[lastIndex].role === 'assistant') {
          return prev.map((message, index) =>
            index === lastIndex
              ? {
                  ...message,
                  content: reply,
                  followUps: pickFollowUpIds(reply, content, currentSection),
                }
              : message
          )
        }
        return [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            followUps: pickFollowUpIds(reply, content, currentSection),
          },
        ]
      })
    } catch (caughtError) {
      console.error('Chat failed across all configured providers:', caughtError)
      setError(t(CHAT_COPY.genericError))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handlePrompt(promptId: PromptId, keyboard: boolean) {
    if (keyboard) inputRef.current?.focus({ preventScroll: true })
    void sendMessage(labelForPrompt(promptId), promptId)
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

      <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
                    {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                  </div>
                </div>

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
          <p className="mb-3 text-xs leading-5" style={{ color: 'var(--cd-warn)' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t(CHAT_COPY.placeholder)}
            className="h-12 min-w-0 flex-1 rounded-2xl border px-4 text-base outline-none transition-colors md:text-sm"
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
