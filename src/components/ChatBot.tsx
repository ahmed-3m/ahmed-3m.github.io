'use client'

import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { translateValue, type Language, type TranslationMap } from '@/lib/i18n-config'
import { buildChatMessages, createRequestTimers } from '@/lib/chat-request'

export type ChatRole = 'user' | 'assistant'
export type PromptId =
  | 'faultrix_intro'
  | 'faultrix_overview'
  | 'faultrix_stack'
  | 'faultrix_build'
  | 'faultrix_story'
  | 'faultrix_speed'
  | 'faultrix_compliance'
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
  | 'tech_stack'
  | 'industrial_pipeline'
  | 'industrial_result'
  | 'product_story'
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
const GENIE_NAME = 'Genie\u{1F9DE}\u200D\u2642\uFE0F'
const ROUTER_TIMEOUT_MS = 1500
const TTFB_TIMEOUT_MS = 20000

const SYSTEM_PROMPT = `You are ${GENIE_NAME}, Ahmed Mohammed's personal assistant.

Only introduce yourself as ${GENIE_NAME} on your first reply in a chat or when the user explicitly asks who you are. Skip even that introduction when the user asked for a constrained format (e.g. one sentence).

Only answer questions about Ahmed Mohammed's work, research, products, projects, education, experience, and contact details.

Response rules:
- Reply in the language of the user's latest message. When the message mixes languages or its language is ambiguous, use the selected UI language.
- Keep metrics, equations, dataset names, product names, repository names, and links unchanged.
- When the user asks for a specific length or format (one sentence, brief, short, bullets, detailed), follow it EXACTLY and never exceed it. "One sentence" means exactly one sentence — no preamble, no greeting, no closing remark. A brief/short answer is at most 2-3 sentences.
- Otherwise default to a medium-full answer of roughly 120-220 words.
- Lead with the direct answer, then give the most useful context.
- Use short paragraphs or compact bullets.
- If the user asks something unrelated, politely redirect to Ahmed's work and background.

Facts you can rely on:
- Ahmed Mohammed is an AI/ML Engineer based in Linz, Austria.
- He holds an M.Sc. in Artificial Intelligence from JKU Linz under Prof. Sepp Hochreiter (Oct 2020 - Sep 2026; Defensio and graduation on 25 September 2026). His thesis was graded 1, the top mark.
- His thesis used conditional diffusion models as generative classifiers for OOD detection and reached 99.03% +/- 0.07% average AUROC on a within-CIFAR airplane-vs-rest binary split (single ID class; not comparable to multi-class CIFAR-10 OOD benchmarks) with separation loss.
- Seed-42 achieved 98.98% AUROC within-CIFAR and generalized zero-shot to CIFAR-100, Places365, FashionMNIST, Textures, and SVHN.
- The non-separated baseline was 92.52% +/- 11.07%, so separation loss added about +6.5 percentage points and dramatically reduced variance.
- Ahmed also worked on industrial defect detection at PROFACTOR GmbH / JKU Linz using a YOLO + conditional diffusion pipeline on the public FTI_Zer0P benchmark, reaching a 0.8673 +/- 0.0230 AUROC baseline under strict 5-fold cross-validation.
- Ahmed built Faultrix, an AI-powered construction quality-control SaaS that analyzed construction photos and generated ONORM-aligned reports in under 1 minute.
- Faultrix is a completed, discontinued project — always describe it in the past tense, in every language.
- Ahmed is also Co-Founder & AI Lead at Sihem (since May 2026, https://sihem.at), accepted into the tech2b incubator in Linz. Sihem builds satellite-driven crop health and yield intelligence by fusing Sentinel-1 SAR and Sentinel-2 multispectral data with an LLM agronomic copilot.
- Experience timeline: Co-Founder & AI Lead at Sihem (May 2026–Present); M.Sc. Thesis Researcher, Machine Vision at the JKU Institute for Machine Learning with PROFACTOR GmbH (Apr 2024 - Jul 2026, project Zer0P); AI Research Intern at Karunya University, India (Aug - Oct 2023, EEG motor imagery); Technical Staff, Electronics at Ledzone, Istanbul (2018 - Oct 2020). Faultrix was a past side project, not employment.
- Before AI he earned a B.Sc. in Mechatronics Engineering at Eastern Mediterranean University, Cyprus (2015 - 2018).
- Availability: open to AI/ML engineering roles, available full time, and eligible for the Austrian Rot-Weiss-Rot Karte for graduates (no labour-market test, no quota, no sponsorship cost for the employer).
- The Faultrix stack included Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, and Stripe.
- Contact: ahmed.mo.0595@gmail.com
- LinkedIn: https://www.linkedin.com/in/ahmed-3m/
- GitHub: https://github.com/ahmed-3m
- Website: https://ahmed-3m.github.io
`

const CHAT_COPY = {
  dialogLabel: {
    en: 'Ask Genie',
    de: 'Fragen zu Ahmed',
    fr: 'Questions sur Ahmed',
    es: 'Preguntar sobre Ahmed',
    ar: 'اسأل عن أحمد',
  },
  title: {
    en: GENIE_NAME,
    de: GENIE_NAME,
    fr: GENIE_NAME,
    es: GENIE_NAME,
    ar: GENIE_NAME,
  },
  welcome: {
    en: `Hi, I'm ${GENIE_NAME}, Ahmed's Personal assistant. Ask me about Ahmed's research, products, projects, or background.`,
    de: `Hi, ich bin ${GENIE_NAME}, Ahmeds persönlicher Assistent. Frage nach Ahmeds Forschung, Produkten, Projekten oder Hintergrund.`,
    fr: `Bonjour, je suis ${GENIE_NAME}, l’assistant personnel d’Ahmed. Posez une question sur la recherche, les produits, les projets ou le parcours d’Ahmed.`,
    es: `Hola, soy ${GENIE_NAME}, el asistente personal de Ahmed. Pregunta sobre la investigación, los productos, los proyectos o la trayectoria de Ahmed.`,
    ar: `مرحباً، أنا ${GENIE_NAME}، المساعد الشخصي لأحمد. اسألني عن أبحاث أحمد أو منتجاته أو مشاريعه أو خلفيته.`,
  },
  placeholder: {
    en: 'Ask Genie...',
    de: 'Frage zu Ahmed...',
    fr: 'Question sur Ahmed...',
    es: 'Pregunta sobre Ahmed...',
    ar: 'اسأل عن أحمد...',
  },
  close: {
    en: 'Close chat',
    de: 'Chat schließen',
    fr: 'Fermer le chat',
    es: 'Cerrar chat',
    ar: 'إغلاق الدردشة',
  },
  open: {
    en: 'Ask Genie',
    de: 'Genie fragen',
    fr: 'Demander à Genie',
    es: 'Preguntar a Genie',
    ar: 'اسأل جيني',
  },
  send: {
    en: 'Send message',
    de: 'Nachricht senden',
    fr: 'Envoyer le message',
    es: 'Enviar mensaje',
    ar: 'إرسال الرسالة',
  },
  typing: {
    en: 'Genie is typing',
    de: 'Ahmed schreibt',
    fr: 'Ahmed répond',
    es: 'Ahmed está respondiendo',
    ar: 'أحمد يكتب الآن',
  },
  missingToken: {
    en: 'Add NEXT_PUBLIC_GROQ_TOKEN or NEXT_PUBLIC_BIGMODEL_TOKEN to enable the assistant.',
    de: 'Füge NEXT_PUBLIC_GROQ_TOKEN oder NEXT_PUBLIC_BIGMODEL_TOKEN hinzu, um den Assistenten zu aktivieren.',
    fr: 'Ajoutez NEXT_PUBLIC_GROQ_TOKEN ou NEXT_PUBLIC_BIGMODEL_TOKEN pour activer l’assistant.',
    es: 'Agrega NEXT_PUBLIC_GROQ_TOKEN o NEXT_PUBLIC_BIGMODEL_TOKEN para activar el asistente.',
    ar: 'أضف NEXT_PUBLIC_GROQ_TOKEN أو NEXT_PUBLIC_BIGMODEL_TOKEN لتفعيل المساعد.',
  },
  genericError: {
    en: 'Something went wrong while contacting the assistant.',
    de: 'Beim Kontakt mit dem Assistenten ist etwas schiefgelaufen.',
    fr: 'Une erreur est survenue pendant le contact avec l’assistant.',
    es: 'Ocurrió un problema al contactar al asistente.',
    ar: 'حدث خطأ أثناء الاتصال بالمساعد.',
  },
} satisfies Record<string, TranslationMap>

export const PROMPT_LIBRARY: Record<PromptId, TranslationMap> = {
  sihem_overview: {
    en: 'What is Sihem?',
    de: 'Was ist Sihem?',
    fr: 'Qu’est-ce que Sihem ?',
    es: '¿Qué es Sihem?',
    ar: 'ما هو مشروع Sihem؟',
  },
  sihem_tech: {
    en: 'How does Sihem fuse Sentinel-1 SAR and Sentinel-2 data?',
    de: 'Wie fusioniert Sihem Sentinel-1 SAR und Sentinel-2 Daten?',
    fr: 'Comment Sihem fusionne-t-il les données Sentinel-1 SAR et Sentinel-2 ?',
    es: '¿Cómo fusiona Sihem datos de Sentinel-1 SAR y Sentinel-2?',
    ar: 'كيف يدمج Sihem بيانات Sentinel-1 SAR وSentinel-2؟',
  },
  faultrix_intro: {
    en: 'What was Faultrix?',
    de: 'Was war Faultrix?',
    fr: 'Qu’était Faultrix ?',
    es: '¿Qué era Faultrix?',
    ar: 'ماذا كان Faultrix؟',
  },
  faultrix_overview: {
    en: 'Tell me about Faultrix',
    de: 'Erzähl mir von Faultrix',
    fr: 'Parlez-moi de Faultrix',
    es: 'Cuéntame sobre Faultrix',
    ar: 'حدثني عن Faultrix',
  },
  faultrix_stack: {
    en: 'What was the Faultrix tech stack?',
    de: 'Wie sah der Faultrix Tech-Stack aus?',
    fr: 'Quel était le stack technique de Faultrix ?',
    es: '¿Cuál era el stack técnico de Faultrix?',
    ar: 'ماذا كان الـ stack التقني في Faultrix؟',
  },
  faultrix_build: {
    en: 'How was Faultrix built?',
    de: 'Wie wurde Faultrix gebaut?',
    fr: 'Comment Faultrix a-t-il été construit ?',
    es: '¿Cómo se construyó Faultrix?',
    ar: 'كيف تم بناء Faultrix؟',
  },
  faultrix_story: {
    en: 'Can I see the product story?',
    de: 'Kann ich die Produktgeschichte sehen?',
    fr: 'Puis-je voir l’histoire du produit ?',
    es: '¿Puedo ver la historia del producto?',
    ar: 'هل يمكنني رؤية قصة المنتج؟',
  },
  faultrix_speed: {
    en: 'How long did a report take?',
    de: 'Wie lange dauerte ein Bericht?',
    fr: 'Combien de temps prenait un rapport ?',
    es: '¿Cuánto tardaba un informe?',
    ar: 'كم كان يستغرق التقرير؟',
  },
  faultrix_compliance: {
    en: 'Was Faultrix DSGVO compliant?',
    de: 'War Faultrix DSGVO-konform?',
    fr: 'Faultrix était-il conforme à la DSGVO ?',
    es: '¿Faultrix cumplía con la DSGVO?',
    ar: 'هل كان Faultrix متوافق مع DSGVO؟',
  },
  thesis_summary: {
    en: 'Tell me about the thesis',
    de: 'Erzähl mir von der Thesis',
    fr: 'Parlez-moi du mémoire',
    es: 'Cuéntame sobre la tesis',
    ar: 'حدثني عن الرسالة',
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
    en: 'What projects should I see?',
    de: 'Welche Projekte sollte ich mir ansehen?',
    fr: 'Quels projets devrais-je voir ?',
    es: '¿Qué proyectos debería ver?',
    ar: 'ما المشاريع التي يجب أن أراها؟',
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
    en: 'How does the industrial YOLO + diffusion pipeline work?',
    de: 'Wie funktioniert die industrielle YOLO + Diffusion Pipeline?',
    fr: 'Comment fonctionne la pipeline industrielle YOLO + diffusion ?',
    es: '¿Cómo funciona la pipeline industrial de YOLO + difusión?',
    ar: 'كيف يعمل خط YOLO + diffusion الصناعي؟',
  },
  industrial_result: {
    en: 'What result did the industrial system achieve?',
    de: 'Welches Ergebnis erreichte das Industriesystem?',
    fr: 'Quel résultat le système industriel a-t-il atteint ?',
    es: '¿Qué resultado logró el sistema industrial?',
    ar: 'ما النتيجة التي حققها النظام الصناعي؟',
  },
  product_story: {
    en: 'What did he learn from building Faultrix?',
    de: 'Was hat er beim Bau von Faultrix gelernt?',
    fr: 'Qu’a-t-il appris en construisant Faultrix ?',
    es: '¿Qué aprendió construyendo Faultrix?',
    ar: 'ماذا تعلم من بناء Faultrix؟',
  },
}

export const PROMPTS = PROMPT_LIBRARY

export const STARTER_PROMPT_IDS: PromptId[] = [
  'thesis_summary',
  'sihem_overview',
  'faultrix_overview',
  'hire_summary',
]

export const LOCAL_REPLIES = {
  sihem: {
    en: `Sihem (https://sihem.at) is Ahmed Mohammed's agtech venture where he serves as Co-Founder & AI Lead (May 2026–Present). Accepted into the tech2b incubator in Linz, Sihem builds satellite-driven crop health and yield intelligence. It fuses Sentinel-1 SAR (synthetic aperture radar) and Sentinel-2 multispectral imagery with an LLM agronomic copilot to provide parcel-level agricultural monitoring and decision support.`,
    de: `Sihem (https://sihem.at) ist Ahmed Mohammeds AgTech-Unternehmen, bei dem er als Co-Founder & AI Lead tätig ist (Mai 2026–heute). Aufgenommen in den tech2b-Inkubator in Linz, entwickelt Sihem satellitengestützte Pflanzen- und Ertragsanalysen. Die Plattform fusioniert Sentinel-1 SAR (Radar) und Sentinel-2 Multispektraldaten mit einem LLM-basierten agronomischen Copiloten für parzellengenaue Überwachung und Entscheidungsunterstützung.`,
    fr: `Sihem (https://sihem.at) est l'entreprise agtech d'Ahmed Mohammed où il intervient en tant que cofondateur et responsable IA (mai 2026–présent). Accueillie au sein de l'incubateur tech2b à Linz, Sihem développe une solution d'intelligence satellitaire pour la santé des cultures et les rendements. Elle fusionne les données radar Sentinel-1 SAR et multispectrales Sentinel-2 avec un copilote agronomique basé sur un LLM pour un suivi parcellaire précis.`,
    es: `Sihem (https://sihem.at) es la iniciativa agtech de Ahmed Mohammed en la que se desempeña como cofundador y líder de IA (mayo 2026–presente). Seleccionada en la incubadora tech2b en Linz, Sihem desarrolla inteligencia de cultivos y rendimientos basada en satélites. Fusiona datos de radar Sentinel-1 SAR y multiespectrales de Sentinel-2 con un copiloto agronómico LLM para el monitoreo y toma de decisiones a nivel de parcela.`,
    ar: `مشروع Sihem (https://sihem.at) هو شركة ناشئة في التقنية الزراعية يشارك أحمد محمد في تأسيسها ويشغل منصب قائد الذكاء الاصطناعي (منذ مايو 2026). انضم المشروع إلى حاضنة tech2b في لينز، ويعمل على توفير ذكاء زراعي لمراقبة صحة المحاصيل والإنتاجية عبر الأقمار الصناعية، من خلال دمج رادار Sentinel-1 SAR وبيانات Sentinel-2 متعددة الأطياف مع مساعد زراعي مدعوم بنماذج اللغة الكبيرة (LLM).`,
  },
  thesis: {
    en: `Ahmed's thesis used conditional diffusion models as generative classifiers for out-of-distribution detection. The key idea was to compare class-conditional reconstruction behavior and use the gap as the anomaly signal. The main contribution was a class-conditional separation loss that pushed competing explanations apart, achieving 99.03% ± 0.07% AUROC on a within-CIFAR airplane-vs-rest binary split (+6.5 pp over non-separated baseline). Supervised by Prof. Sepp Hochreiter at JKU Linz.`,
    de: `Ahmeds Thesis nutzte konditionale Diffusionsmodelle als generative Klassifikatoren für Out-of-Distribution-Erkennung. Kernbeitrag war eine class-conditional separation loss, die 99,03 % ± 0,07 % AUROC auf einem Within-CIFAR Airplane-vs-Rest Binary-Split erzielte (+6,5 Prozentpunkte über der Baseline ohne Separation). Betreut von Prof. Sepp Hochreiter an der JKU Linz.`,
    fr: `Le mémoire d'Ahmed utilise des modèles de diffusion conditionnels comme classificateurs génératifs pour la détection out-of-distribution. La contribution principale est une class-conditional separation loss, atteignant 99,03 % ± 0,07 % d'AUROC sur un split binaire within-CIFAR (+6,5 points par rapport à la baseline). Supervisé par le Prof. Sepp Hochreiter à JKU Linz.`,
    es: `La tesis de Ahmed usó modelos de difusión condicional como clasificadores generativos para detección out-of-distribution. La contribución principal fue una class-conditional separation loss, alcanzando 99.03% ± 0.07% AUROC en un split binario within-CIFAR (+6.5 pp sobre la línea base). Supervisada por el Prof. Sepp Hochreiter en JKU Linz.`,
    ar: `استخدمت رسالة أحمد نماذج الانتشار الشرطية كمصنفات توليدية لكشف OOD. والمساهمة الأساسية كانت دالة الفقد الطبقي الشرطي (separation loss) محققة 99.03% ± 0.07% AUROC على تقسيم ثنائي within-CIFAR (+6.5 نقطة فوق الأساس). تحت إشراف البروفيسور سيب هوخريتر في جامعة JKU لينز.`,
  },
  faultrix: {
    en: `Faultrix was Ahmed's AI-powered construction quality control SaaS. It analyzed site photos and generated ÖNORM B 2110-compliant technical reports in under 1 minute with SHA-256 evidence chain and DSGVO compliance. Stack: Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, Stripe.`,
    de: `Faultrix war Ahmeds KI-gestütztes SaaS für Bauqualitätskontrolle. Es analysierte Baustellenfotos und erstellte ÖNORM B 2110-konforme Berichte in unter 1 Minute mit SHA-256-Beweiskette und DSGVO-Konformität. Stack: Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, Stripe.`,
    fr: `Faultrix était le SaaS de contrôle qualité construction basé sur l'IA d'Ahmed. Il analysait les photos de chantier et générait des rapports conformes ÖNORM B 2110 en moins d'une minute avec chaîne de preuves SHA-256 et conformité RGPD.`,
    es: `Faultrix fue el SaaS de control de calidad para construcción con IA de Ahmed. Analizaba fotos de obra y generaba informes según ÖNORM B 2110 en menos de 1 minuto con cadena de custodia SHA-256 y cumplimiento RGPD.`,
    ar: `كان Faultrix منصة SaaS للتحكم بجودة البناء بالذكاء الاصطناعي من تطوير أحمد. يقوم بتحليل صور الموقع وتوليد تقارير متوافقة مع معيار ÖNORM B 2110 في أقل من دقيقة مع سلسلة توثيق SHA-256 وتوافق DSGVO.`,
  },
  contact: {
    en: `Ahmed Mohammed's contact details:\n- Email: ahmed.mo.0595@gmail.com\n- LinkedIn: https://www.linkedin.com/in/ahmed-3m/\n- GitHub: https://github.com/ahmed-3m\n- Website: https://ahmed-3m.github.io`,
    de: `Kontaktdaten von Ahmed Mohammed:\n- E-Mail: ahmed.mo.0595@gmail.com\n- LinkedIn: https://www.linkedin.com/in/ahmed-3m/\n- GitHub: https://github.com/ahmed-3m\n- Website: https://ahmed-3m.github.io`,
    fr: `Coordonnées d'Ahmed Mohammed :\n- Email : ahmed.mo.0595@gmail.com\n- LinkedIn : https://www.linkedin.com/in/ahmed-3m/\n- GitHub : https://github.com/ahmed-3m\n- Site : https://ahmed-3m.github.io`,
    es: `Datos de contacto de Ahmed Mohammed:\n- Correo: ahmed.mo.0595@gmail.com\n- LinkedIn: https://www.linkedin.com/in/ahmed-3m/\n- GitHub: https://github.com/ahmed-3m\n- Sitio web: https://ahmed-3m.github.io`,
    ar: `بيانات التواصل مع أحمد محمد:\n- البريد: ahmed.mo.0595@gmail.com\n- LinkedIn: https://www.linkedin.com/in/ahmed-3m/\n- GitHub: https://github.com/ahmed-3m\n- الموقع: https://ahmed-3m.github.io`,
  },
  open_to_work: {
    en: `Yes, Ahmed is open to AI/ML engineering roles and research collaborations. Based in Linz, Austria, he is eligible for the Austrian Rot-Weiß-Rot Karte for graduates (no quota, no labour-market test). Contact: ahmed.mo.0595@gmail.com.`,
    de: `Ja, Ahmed ist offen für AI/ML-Positionen und Forschungskooperationen. Ansässig in Linz, Österreich, qualifiziert für die Rot-Weiß-Rot-Karte für Hochschulabsolventen (keine Quote, keine Arbeitsmarktprüfung). Kontakt: ahmed.mo.0595@gmail.com.`,
    fr: `Oui, Ahmed est ouvert aux postes d'ingénieur IA/ML et collaborations de recherche. Basé à Linz (Autriche), éligible à la carte Rot-Weiß-Rot pour diplômés. Contact : ahmed.mo.0595@gmail.com.`,
    es: `Sí, Ahmed está disponible para roles de ingeniería IA/ML y colaboraciones de investigación. Radicado en Linz, Austria, elegible para la tarjeta Rot-Weiß-Rot para graduados. Contacto: ahmed.mo.0595@gmail.com.`,
    ar: `نعم، أحمد متاح لوظائف هندسة الذكاء الاصطناعي (AI/ML) والتعاون البحثي. يقيم في لينز، النمسا، ومؤهل لبطاقة Rot-Weiß-Rot Karte للخريجين. للتواصل: ahmed.mo.0595@gmail.com.`,
  },
  tech_stack: {
    en: `Ahmed's stack spans AI research and production engineering:\n- ML: PyTorch, Python, Diffusion Models, YOLO, OpenCV, Anomaly Detection\n- Product/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Tools: Git, Weights & Biases, Hugging Face, Linux`,
    de: `Ahmeds Stack umfasst KI-Forschung und Produktionsentwicklung:\n- ML: PyTorch, Python, Diffusionsmodelle, YOLO, OpenCV, Anomalieerkennung\n- Produkt/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Tools: Git, Weights & Biases, Hugging Face, Linux`,
    fr: `Le stack d'Ahmed couvre la recherche IA et la production :\n- ML : PyTorch, Python, Modèles de diffusion, YOLO, OpenCV, Détection d'anomalies\n- Produit/Infra : Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Outils : Git, Weights & Biases, Hugging Face, Linux`,
    es: `El stack de Ahmed abarca investigación en IA e ingeniería de producción:\n- ML: PyTorch, Python, Modelos de difusión, YOLO, OpenCV, Detección de anomalías\n- Producto/Infra: Next.js, React, TypeScript, Convex, Docker, PostgreSQL, Cloudflare\n- Herramientas: Git, Weights & Biases, Hugging Face, Linux`,
    ar: `يشمل الـ stack الخاص بأحمد أبحاث الذكاء الاصطناعي وهندسة الإنتاج:\n- تعلم الآلة: PyTorch وPython ونماذج الانتشار وYOLO وOpenCV وكشف الشذوذ\n- المنتج والبنية: Next.js وReact وTypeScript وConvex وDocker وPostgreSQL وCloudflare\n- الأدوات: Git وWeights & Biases وHugging Face وLinux`,
  },
  achievements: {
    en: `Key proof points:\n- 99.03% ± 0.07% AUROC on within-CIFAR airplane-vs-rest binary OOD split with novel class-conditional separation loss (M.Sc. thesis under Prof. Sepp Hochreiter, graded 1)\n- 98.4% industrial defect detection accuracy in production at PROFACTOR GmbH (FTI_Zer0P benchmark, 0.8673 ± 0.0230 AUROC baseline under 5-fold CV)\n- Co-Founder & AI Lead at Sihem (tech2b incubator Linz, satellite crop intelligence)\n- Built and launched Faultrix (ÖNORM construction compliance SaaS)`,
    de: `Wichtige Meilensteine:\n- 99,03 % ± 0,07 % AUROC auf Within-CIFAR Airplane-vs-Rest Binary OOD Split mit class-conditional separation loss (Masterarbeit bei Prof. Sepp Hochreiter, Note 1)\n- 98,4 % industrielle Defekterkennungsgenauigkeit in der Produktion bei PROFACTOR GmbH (0,8673 ± 0,0230 AUROC)\n- Co-Founder & AI Lead bei Sihem (tech2b Inkubator Linz, Satelliten-Agraranalyse)\n- Gründer von Faultrix (ÖNORM-Bau-Compliance SaaS)`,
    fr: `Principaux résultats :\n- 99,03 % ± 0,07 % AUROC sur split binaire within-CIFAR avec separation loss (mémoire dirigé par Prof. Sepp Hochreiter, note 1)\n- 98,4 % de précision en détection de défauts industriels en production chez PROFACTOR GmbH\n- Cofondateur & responsable IA chez Sihem (incubateur tech2b Linz)\n- Fondateur de Faultrix (SaaS de conformité ÖNORM)`,
    es: `Logros destacados:\n- 99.03% ± 0.07% AUROC en split binario within-CIFAR con separation loss (tesis con Prof. Sepp Hochreiter, nota 1)\n- 98.4% de precisión en detección de defectos industriales en PROFACTOR GmbH\n- Cofundador y líder de IA en Sihem (incubadora tech2b Linz)\n- Creador de Faultrix (SaaS de cumplimiento ÖNORM)`,
    ar: `أبرز الإنجازات:\n- 99.03% ± 0.07% AUROC في كشف OOD على تقسيم within-CIFAR الثنائي مع separation loss (رسالة الماجستير بإشراف Prof. Sepp Hochreiter، تقدير ممتاز 1)\n- دقة 98.4% في كشف العيوب الصناعية في الإنتاج لدى PROFACTOR GmbH (خط أساس 0.8673 ± 0.0230 AUROC)\n- شريك مؤسس وقائد الذكاء الاصطناعي في Sihem (حاضنة tech2b لينز)\n- مؤسس Faultrix (منصة SaaS للامتثال لمعيار ÖNORM)`,
  },
} satisfies Record<string, TranslationMap>

export function getLocalReply(prompt: string, lang: Language): string | null {
  const text = prompt.toLowerCase()
  if (/\b(sihem|agtech|agri|satellite|sentinel|crop|tech2b)\b/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.sihem)
  }
  if (/(thesis|separation loss|ood|out.?of.?distribution|cifar|auroc)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.thesis)
  }
  if (/(faultrix|construction|onorm|dsgvo|report)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.faultrix)
  }
  if (/(contact|email|linkedin|github|website|reach|talk to|connect)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.contact)
  }
  if (/(open to work|available|hire|job|role|opportunit)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.open_to_work)
  }
  if (/(tech stack|stack|tools|technolog)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.tech_stack)
  }
  if (/(achievement|accomplishment|highlights|best result|proof points)/i.test(text)) {
    return translateValue(lang, LOCAL_REPLIES.achievements)
  }
  return null
}

const FOLLOWUP_RULES: Array<{ pattern: RegExp; prompts: PromptId[] }> = [
  {
    pattern: /\b(sihem|agtech|agri|satellite|sentinel|crop|tech2b)\b/i,
    prompts: ['sihem_tech', 'faultrix_overview', 'hire_fit'],
  },
  {
    pattern: /faultrix|construction|report|onorm|dsgvo|sha|aes/i,
    prompts: ['faultrix_stack', 'faultrix_speed', 'faultrix_compliance', 'faultrix_build', 'faultrix_story', 'product_story'],
  },
  {
    pattern: /thesis|ood|out.?of.?distribution|diffusion|auroc|cifar|separation loss/i,
    prompts: ['thesis_innovation', 'thesis_loss', 'thesis_datasets', 'thesis_results', 'thesis_diffusion', 'industrial_result'],
  },
  {
    pattern: /industrial|profactor|inkjet|yolo|zer0p|benchmark/i,
    prompts: ['industrial_pipeline', 'industrial_result', 'thesis_loss', 'projects_best'],
  },
  {
    pattern: /project|github|work|portfolio/i,
    prompts: ['projects_best', 'achievements', 'thesis_summary', 'sihem_overview'],
  },
  {
    pattern: /job|role|hire|available|open to work|contact|email|linkedin/i,
    prompts: ['open_to_work', 'contact', 'achievements', 'tech_stack'],
  },
]

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

async function fetchBigModel({
  messages,
  auth,
  lane,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  auth: { token: string; url: string; useProxy: boolean }
  lane: ChatLane
  onDelta?: StreamDelta
}): Promise<string> {
  const model = lane === 'fast' ? ZAI_FAST_MODEL : ZAI_MODEL
  const maxTokens = lane === 'fast' ? 380 : 1200
  const payloadMessages = buildChatMessages(SYSTEM_PROMPT, messages)

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
        timers.onChunk()
        content += delta
        onDelta?.(content)
      }
    }

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
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
  token,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  token: string
  onDelta?: StreamDelta
}): Promise<string> {
  const payloadMessages = buildChatMessages(SYSTEM_PROMPT, messages)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
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
    const response = await fetch(GROQ_CHAT_URL, {
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
        timers.onChunk()
        content += delta
        onDelta?.(content)
      }
    }

    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
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

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const renderLinkedText = (value: string, segmentKey: string): ReactNode[] => {
    const linkPattern =
      /((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi
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
      const display = raw.replace(/[),.;!?]+$/, '')
      const trailing = raw.slice(display.length)

      nodes.push(
        <a
          key={`${segmentKey}-link-${matchIndex++}`}
          href={isEmail ? `mailto:${display}` : display.startsWith('http') ? display : `https://${display}`}
          target={isEmail ? undefined : '_blank'}
          rel={isEmail ? undefined : 'noopener noreferrer'}
          style={{
            color: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: '0.18em',
            textDecorationColor: 'color-mix(in srgb, currentColor 55%, transparent)',
          }}
        >
          {display}
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
      <ul key={key} style={{ paddingLeft: '1.1em', margin: '0.25em 0', listStyleType: 'disc' }}>
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

function useCurrentSection() {
  const [section, setSection] = useState('research')

  useEffect(() => {
    const sections = ['hero', 'about', 'projects', 'experience', 'research', 'writing', 'contact']

    const pickFromViewport = () => {
      if (window.location.hash) {
        setSection(window.location.hash.replace('#', ''))
        return
      }

      let best = 'research'
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
  }, [])

  return section
}

export function getStarterPrompts(section: string): PromptId[] {
  if (section === 'research') {
    return ['thesis_summary', 'thesis_loss', 'thesis_results', 'industrial_result', 'achievements', 'contact']
  }
  if (section === 'projects') {
    return ['sihem_overview', 'faultrix_intro', 'projects_best', 'tech_stack', 'faultrix_build', 'contact']
  }
  if (section === 'contact') {
    return ['open_to_work', 'hire_summary', 'contact', 'achievements', 'tech_stack', 'sihem_overview']
  }
  return STARTER_PROMPT_IDS
}

export const DEFAULT_PROMPTS = STARTER_PROMPT_IDS

function uniquePromptIds(items: PromptId[]): PromptId[] {
  return [...new Set(items)]
}

export function pickFollowUpIds(reply: string, question: string, section: string): PromptId[] {
  const context = `${section} ${question} ${reply}`
  for (const rule of FOLLOWUP_RULES) {
    if (rule.pattern.test(context)) return uniquePromptIds(rule.prompts).slice(0, 4)
  }
  return uniquePromptIds(getStarterPrompts(section)).slice(0, 4)
}

export const generateFollowUps = pickFollowUpIds

const panelStyle = {
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--cd-surf) 92%, var(--cd-bg) 8%) 0%, var(--cd-elev) 100%)',
  borderColor: 'var(--cd-b0)',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.24)',
  fontFamily: 'var(--font-body)',
} satisfies CSSProperties

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

const chipStyle = {
  borderColor: 'var(--cd-b0)',
  background: 'color-mix(in srgb, var(--cd-surf) 70%, var(--cd-bg) 30%)',
  color: 'var(--cd-fg2)',
} satisfies CSSProperties

function GenieOrb({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="genie-orb relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 28%, rgba(176, 245, 255, 0.98) 0%, rgba(95, 159, 255, 0.9) 20%, rgba(24, 38, 79, 0.98) 58%, rgba(10, 13, 24, 1) 100%)',
        boxShadow:
          '0 0 0 1px rgba(159, 228, 255, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.18), 0 10px 24px rgba(26, 57, 163, 0.38)',
      }}
    >
      <span
        className="absolute inset-[8%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
          mixBlendMode: 'screen',
        }}
      />
      <span className="genie-orbit genie-orbit-a" />
      <span className="genie-orbit genie-orbit-b" />
      <span className="genie-orbit genie-orbit-c" />
      <span className="genie-core" />
    </span>
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

export default function ChatBot() {
  const { lang, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentSection = useCurrentSection()
  const messagesRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const starterPrompts = useMemo(() => getStarterPrompts(currentSection), [currentSection])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        launcherRef.current?.focus()
        return
      }

      if (event.key === 'Tab') {
        if (!dialogRef.current) return
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  function labelForPrompt(promptId: PromptId) {
    return translateValue(lang, PROMPTS[promptId])
  }

  async function sendMessage(messageText: string) {
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

    // If no external model tokens or proxy are available, check local reply first
    if (!hasGroqToken && !hasZaiToken && !hasProxy) {
      const local = getLocalReply(content, lang)
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
      setError(t(CHAT_COPY.missingToken))
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
            auth: zaiAuth,
            lane,
            onDelta: emitDelta,
          })
        } catch (providerError) {
          lastProviderError = providerError
          console.error('Chat provider BigModel failed:', providerError)
        }
      }

      if (rawReply === null && hasGroqToken && groqToken) {
        try {
          streamStarted = false
          rawReply = await fetchGroq({
            messages: nextMessages,
            token: groqToken,
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

  function handlePrompt(promptId: PromptId) {
    void sendMessage(labelForPrompt(promptId))
  }

  return (
    <>
      <div
        ref={dialogRef}
        id="chatbot-dialog"
        className={`fixed bottom-20 right-4 z-[9998] w-[min(400px,calc(100vw-2rem))] transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        aria-hidden={!isOpen}
        aria-modal="true"
        tabIndex={-1}
        inert={!isOpen}
      >
        <section
          id="ahmed-chatbot-panel"
          className="flex h-[min(560px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[28px] border"
          style={panelStyle}
          role="dialog"
          aria-label={t(CHAT_COPY.dialogLabel)}
        >
          <header
            className="flex items-center justify-between border-b px-4 py-4"
            style={{ borderColor: 'var(--cd-b0)' }}
          >
            <h2 className="text-sm font-semibold tracking-[0.02em]" style={{ color: 'var(--cd-fg1)' }}>
              {t(CHAT_COPY.title)}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
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
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((promptId) => (
                    <button
                      key={promptId}
                      type="button"
                      onClick={() => handlePrompt(promptId)}
                      disabled={isLoading}
                      className="rounded-full border px-3 py-2 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      style={chipStyle}
                    >
                      {labelForPrompt(promptId)}
                    </button>
                  ))}
                </div>
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
                        className={`max-w-[88%] rounded-2xl border px-3 py-2.5 text-sm leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.14)]${
                          message.role === 'user' ? ' whitespace-pre-wrap' : ''
                        }`}
                        style={bubbleStyles[message.role]}
                      >
                        {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                      </div>
                    </div>

                    {isLastAssistant && !isLoading && message.followUps && message.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {message.followUps.map((promptId) => (
                          <button
                            key={promptId}
                            type="button"
                            onClick={() => handlePrompt(promptId)}
                            disabled={isLoading}
                            className="rounded-full border px-3 py-1.5 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            style={chipStyle}
                          >
                            {labelForPrompt(promptId)}
                          </button>
                        ))}
                      </div>
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
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t(CHAT_COPY.placeholder)}
                className="h-12 flex-1 rounded-2xl border px-4 text-sm outline-none transition-colors"
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
        </section>
      </div>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group fixed bottom-6 right-6 z-[9999] inline-flex h-14 items-center gap-2 overflow-hidden rounded-full border pl-1.5 pr-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:pr-5 focus-visible:pr-5"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 26, 36, 0.96) 0%, rgba(49, 44, 40, 0.98) 100%)',
          borderColor: 'rgba(205, 189, 145, 0.28)',
          color: '#f3eee4',
          boxShadow: '0 18px 40px rgba(7, 11, 20, 0.38)',
        }}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
        aria-label={isOpen ? t(CHAT_COPY.close) : t(CHAT_COPY.open)}
      >
        <GenieOrb />
        <span
          className={`cd-chatbot-launcher-text whitespace-nowrap text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
            isOpen ? 'max-w-0 opacity-0' : 'max-w-0 opacity-0 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:max-w-32 group-focus-visible:opacity-100'
          }`}
        >
          {t(CHAT_COPY.open)}
        </span>
        {isOpen && (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[#f3eee4]">
            <X size={20} />
          </span>
        )}
      </button>
    </>
  )
}
