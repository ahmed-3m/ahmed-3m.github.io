import { translateValue, type Language, type TranslationMap } from '@/lib/i18n-config'
import { BENCHMARK_DATASETS, CIFAR_LAMBDA_SWEEP, INKJET_OVERALL_SWEEP, K_ABLATION_TABLE } from '@/lib/ood-explorer-data'
import {
  BACKGROUND_URL,
  BLOG_URL,
  CALENDLY_URL,
  CONTACT_URL,
  CV_URL,
  DIFFUSION_URL,
  EXPLORER_URL,
  GITHUB_URL,
  GUARDRAILS_POST_URL,
  HF_URL,
  INDUSTRIAL_POST_URL,
  INDUSTRIAL_URL,
  JKU_THESIS_RECORD_URL,
  LINKEDIN_URL,
  MERGEPROOF_PLAYGROUND_URL,
  MERGEPROOF_URL,
  METHOD_URL,
  NEWS_URL,
  ORCID_URL,
  SIHEM_APP_URL,
  SIHEM_URL,
  THESIS_POST_URL,
  THESIS_URL,
  WANDB_URL,
  YOLO_POST_URL,
  formatLocaleNumber,
} from './links'

export type PromptId =
  | 'thesis_summary'
  | 'thesis_loss'
  | 'thesis_datasets'
  | 'thesis_results'
  | 'projects_best'
  | 'achievements'
  | 'open_to_work'
  | 'hire_fit'
  | 'contact'
  | 'cv'
  | 'background'
  | 'tech_stack'
  | 'industrial_pipeline'
  | 'industrial_result'
  | 'sihem_overview'
  | 'sihem_tech'
  | 'mergeproof_overview'
  | 'guardrails_post'
  | 'thesis_why_diffusion'
  | 'thesis_speed'
  | 'thesis_limits'
  | 'thesis_read'
  | 'experience'
  | 'profiles'
  | 'frontdesk_demo'
  | 'writing'

export const PROMPT_LIBRARY: Record<PromptId, TranslationMap> = {
  sihem_overview: {
    en: 'What is Sihem?',
    de: 'Was ist Sihem?',
    fr: 'Qu’est-ce que Sihem ?',
    es: '¿Qué es Sihem?',
    ar: 'ما هو مشروع Sihem؟',
  },
  sihem_tech: {
    en: 'How is Sihem built under the hood?',
    de: 'Wie ist Sihem technisch aufgebaut?',
    fr: 'Comment Sihem est-il conçu techniquement ?',
    es: '¿Cómo está construido Sihem por dentro?',
    ar: 'كيف بُني مشروع Sihem تقنيًا من الداخل؟',
  },
  thesis_summary: {
    en: 'What did the thesis find?',
    de: 'Was hat die Masterarbeit gezeigt?',
    fr: 'Quels sont les résultats du mémoire ?',
    es: '¿Qué resultados obtuvo la tesis?',
    ar: 'ما نتائج رسالة الماجستير؟',
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
  projects_best: {
    en: 'What has Ahmed built?',
    de: 'Was hat Ahmed entwickelt?',
    fr: 'Qu’a développé Ahmed ?',
    es: '¿Qué ha desarrollado Ahmed?',
    ar: 'ما المشاريع التي طوّرها أحمد؟',
  },
  mergeproof_overview: {
    en: 'What is mergeproof?',
    de: 'Was ist mergeproof?',
    fr: 'Qu’est-ce que mergeproof ?',
    es: '¿Qué es mergeproof?',
    ar: 'ما هي أداة mergeproof؟',
  },
  guardrails_post: {
    en: 'Why deterministic guardrails for agents?',
    de: 'Warum deterministische Guardrails für Agenten?',
    fr: 'Pourquoi des garde-fous déterministes pour les agents ?',
    es: '¿Por qué controles deterministas para agentes?',
    ar: 'لماذا الضوابط الحتمية لأنظمة الوكلاء؟',
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
  thesis_why_diffusion: {
    en: 'Why use diffusion models for OOD detection?',
    de: 'Warum Diffusionsmodelle für die OOD-Erkennung?',
    fr: 'Pourquoi des modèles de diffusion pour la détection OOD ?',
    es: '¿Por qué usar modelos de difusión para detectar OOD?',
    ar: 'لماذا تُستخدم نماذج الانتشار لكشف OOD؟',
  },
  thesis_speed: {
    en: 'How fast is the OOD detector?',
    de: 'Wie schnell ist der OOD-Detektor?',
    fr: 'Quelle est la vitesse du détecteur OOD ?',
    es: '¿Qué tan rápido es el detector OOD?',
    ar: 'ما سرعة كاشف OOD؟',
  },
  thesis_limits: {
    en: 'What are the limits of the thesis results?',
    de: 'Wo liegen die Grenzen der Ergebnisse?',
    fr: 'Quelles sont les limites des résultats ?',
    es: '¿Cuáles son los límites de los resultados?',
    ar: 'ما حدود نتائج الرسالة؟',
  },
  thesis_read: {
    en: 'Where can I read the full thesis?',
    de: 'Wo kann ich die ganze Masterarbeit lesen?',
    fr: 'Où lire le mémoire complet ?',
    es: '¿Dónde puedo leer la tesis completa?',
    ar: 'أين يمكنني قراءة الرسالة كاملة؟',
  },
  experience: {
    en: 'Where has Ahmed worked?',
    de: 'Wo hat Ahmed bisher gearbeitet?',
    fr: 'Où Ahmed a-t-il travaillé ?',
    es: '¿Dónde ha trabajado Ahmed?',
    ar: 'أين عمل أحمد سابقًا؟',
  },
  profiles: {
    en: 'Where can I find his GitHub and LinkedIn?',
    de: 'Wo finde ich sein GitHub und LinkedIn?',
    fr: 'Où trouver son GitHub et son LinkedIn ?',
    es: '¿Dónde encuentro su GitHub y LinkedIn?',
    ar: 'أين أجد حساباته على GitHub وLinkedIn؟',
  },
  frontdesk_demo: {
    en: 'What is the AI front-desk call?',
    de: 'Was ist der KI-Empfang per Anruf?',
    fr: 'Qu’est-ce que l’accueil IA par appel ?',
    es: '¿Qué es la recepción con IA por llamada?',
    ar: 'ما هي مكالمة موظف الاستقبال الذكي؟',
  },
  writing: {
    en: 'What has Ahmed written?',
    de: 'Was hat Ahmed geschrieben?',
    fr: 'Qu’a écrit Ahmed ?',
    es: '¿Qué ha escrito Ahmed?',
    ar: 'ماذا كتب أحمد؟',
  },
}

export const PROMPTS = PROMPT_LIBRARY

export const STARTER_PROMPT_IDS: PromptId[] = [
  'projects_best',
  'thesis_results',
  'sihem_overview',
  'open_to_work',
]

export const ROUTE_SECTIONS: Partial<Record<string, string>> = {
  '/about': 'about',
  '/research': 'research',
  '/blog': 'writing',
  '/news': 'news',
  '/case-studies/inkjet-ood': 'inkjet',
  '/case-studies/diffusion-ood': 'research',
  '/case-studies/sihem': 'sihem',
}

export function resolveSectionForPathname(pathname: string): string | undefined {
  const normalized = pathname.trim().replace(/\/+$/, '') || '/'
  if (ROUTE_SECTIONS[normalized]) return ROUTE_SECTIONS[normalized]
  if (normalized.startsWith('/blog/')) return 'writing'
  if (normalized.startsWith('/news/')) return 'news'
  return undefined
}

const inkjet = INKJET_OVERALL_SWEEP['0.0']
const inkjetBaseline = `${inkjet.aurocMean.toFixed(4)} ± ${inkjet.aurocStd.toFixed(4)}`
const formatCifarResult = (result: (typeof CIFAR_LAMBDA_SWEEP)[number] | undefined) =>
  result?.withinCifarStd == null
    ? ''
    : `${result.withinCifarMean.toFixed(2)}% ± ${result.withinCifarStd.toFixed(2)}%`
const cifarBaselineRun = CIFAR_LAMBDA_SWEEP.find((result) => result.lambda === '0.0')
const cifarOptimalRun = CIFAR_LAMBDA_SWEEP.find((result) => result.isOptimal)
const cifarBaseline = formatCifarResult(cifarBaselineRun)
const cifarSeparation = formatCifarResult(cifarOptimalRun)
// Percentage-point gain of separation loss over the baseline (3-seed means).
const cifarGain =
  cifarBaselineRun && cifarOptimalRun
    ? (cifarOptimalRun.withinCifarMean - cifarBaselineRun.withinCifarMean).toFixed(1)
    : ''
const seed42Within = `${BENCHMARK_DATASETS.within_cifar.auroc.toFixed(2)}%`

const inkjetBaselineDe = formatLocaleNumber(inkjetBaseline, 'de')
const inkjetBaselineFr = formatLocaleNumber(inkjetBaseline, 'fr')
const cifarBaselineDe = formatLocaleNumber(cifarBaseline, 'de')
const cifarBaselineFr = formatLocaleNumber(cifarBaseline, 'fr')
const cifarSeparationDe = formatLocaleNumber(cifarSeparation, 'de')
const cifarSeparationFr = formatLocaleNumber(cifarSeparation, 'fr')
const seed42WithinDe = formatLocaleNumber(seed42Within, 'de')
const seed42WithinFr = formatLocaleNumber(seed42Within, 'fr')
const cifarGainDe = formatLocaleNumber(cifarGain, 'de')
const cifarGainFr = formatLocaleNumber(cifarGain, 'fr')

// Monte Carlo trials (K) ablation, seed 42: the recommended K against the default K=50.
const kFast = K_ABLATION_TABLE.find((row) => row.recommended)
const kDefault = K_ABLATION_TABLE.find((row) => row.k === 50)
const kFastAuroc = kFast ? `${kFast.auroc.toFixed(2)}%` : ''
const kFastMs = kFast ? kFast.msPerSample.toFixed(1) : ''
const kDefaultAuroc = kDefault ? `${kDefault.auroc.toFixed(2)}%` : ''
const kDefaultMs = kDefault ? kDefault.msPerSample.toFixed(1) : ''
const kSpeedup = kFast && kDefault ? Math.round(kDefault.msPerSample / kFast.msPerSample) : ''
const kFastK = kFast?.k ?? ''
const kDefaultK = kDefault?.k ?? ''
const kLocal = (lang: 'de' | 'fr') => ({
  fastAuroc: formatLocaleNumber(kFastAuroc, lang),
  fastMs: formatLocaleNumber(kFastMs, lang),
  defaultAuroc: formatLocaleNumber(kDefaultAuroc, lang),
  defaultMs: formatLocaleNumber(kDefaultMs, lang),
})
const kDe = kLocal('de')
const kFr = kLocal('fr')

export const LOCAL_REPLIES = {
  projects: {
    en: `Explore [inkjet print inspection](${INDUSTRIAL_URL}), Ahmed’s [diffusion OOD thesis](${DIFFUSION_URL}), [Sihem](${SIHEM_URL}) (an invitation-only planning assistant in tech2b), and [mergeproof](${MERGEPROOF_PLAYGROUND_URL}) (zero-LLM deterministic PR gate with a live interactive playground).`,
    de: `Entdecken Sie die [Inkjet-Druckprüfung](${INDUSTRIAL_URL}), Ahmeds [Diffusions-Masterarbeit](${DIFFUSION_URL}), [Sihem](${SIHEM_URL}) (Planungsassistent im tech2b-Inkubator, Beta mit Einladung) sowie [mergeproof](${MERGEPROOF_PLAYGROUND_URL}) (deterministischer PR-Gate ohne LLM-Aufruf samt interaktivem Playground).`,
    fr: `Découvrez [l’inspection jet d’encre](${INDUSTRIAL_URL}), le [mémoire sur la diffusion OOD](${DIFFUSION_URL}), [Sihem](${SIHEM_URL}) (assistant de planification en bêta sur invitation chez tech2b) et [mergeproof](${MERGEPROOF_PLAYGROUND_URL}) (contrôle déterministe de PR sans appel LLM avec démo interactive).`,
    es: `Explora la [inspección inkjet](${INDUSTRIAL_URL}), su [tesis de difusión OOD](${DIFFUSION_URL}), [Sihem](${SIHEM_URL}) (asistente de planificación en beta por invitación dentro de tech2b) y [mergeproof](${MERGEPROOF_PLAYGROUND_URL}) (puerta determinista de PR sin llamadas LLM con playground interactivo).`,
    ar: `استكشف مشروع [فحص الطباعة النافثة للحبر](${INDUSTRIAL_URL})، و[رسالة الانتشار لكشف OOD](${DIFFUSION_URL})، و[Sihem](${SIHEM_URL}) (مساعد التخطيط في حاضنة tech2b بنسخة تجريبية بدعوة)، وأداة [mergeproof](${MERGEPROOF_PLAYGROUND_URL}) (فحص حتمي لطلبات الدمج دون استدعاء LLM مع ساحة تجربة تفاعلية).`,
  },
  background: {
    en: `Ahmed is an AI/ML engineer in Linz with an M.Sc. in AI from JKU (Sep 2026, thesis graded 1 under Prof. Sepp Hochreiter) and a B.Sc. in Mechatronics Engineering (SCARA capstone graded Excellent). He moved from electronics and robotics into industrial computer vision at PROFACTOR, diffusion research at JKU, and building Sihem in tech2b. [Education and background](${BACKGROUND_URL})`,
    de: `Ahmed ist AI/ML Engineer in Linz mit einem M.Sc. in KI von der JKU (Sep 2026, Masterarbeit Note 1 bei Prof. Sepp Hochreiter) und einem B.Sc. in Mechatronik (SCARA-Abschlussprojekt mit Excellent bewertet). Sein Weg führte von Elektronik und Robotik zur industriellen Bildverarbeitung bei PROFACTOR, zur Diffusionsforschung an der JKU und zu Sihem bei tech2b. [Ausbildung und Hintergrund](${BACKGROUND_URL})`,
    fr: `Ahmed est ingénieur IA/ML à Linz, diplômé d’un master en IA à la JKU (sept. 2026, mémoire noté 1 sous la direction de Prof. Sepp Hochreiter) et d’un bachelor en mécatronique (projet SCARA mention Excellent). Il est passé de l’électronique et de la robotique à la vision industrielle chez PROFACTOR, à la recherche à la JKU et au projet Sihem chez tech2b. [Formation et parcours](${BACKGROUND_URL})`,
    es: `Ahmed es ingeniero de IA/ML en Linz con un máster en IA por la JKU (sep. 2026, tesis calificada con 1 bajo el Prof. Sepp Hochreiter) y un grado en Mecatrónica (proyecto SCARA con calificación Excelente). Pasó de la electrónica y robótica a la visión industrial en PROFACTOR, la investigación en la JKU y Sihem en tech2b. [Formación y trayectoria](${BACKGROUND_URL})`,
    ar: `أحمد مهندس ذكاء اصطناعي وتعلّم آلي في لينتس، حاصل على ماجستير في الذكاء الاصطناعي من JKU (سبتمبر 2026، الرسالة بتقدير 1 بإشراف Prof. Sepp Hochreiter) وبكالوريوس في الميكاترونكس (مشروع SCARA بتقدير ممتاز). انتقل من الإلكترونيات والروبوتات إلى الرؤية الصناعية في PROFACTOR وأبحاث الانتشار في JKU ومشروع Sihem في tech2b. [التعليم والخبرة](${BACKGROUND_URL})`,
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
    de: `Ahmed prüfte das System mit fünffacher Kreuzvalidierung auf dem öffentlichen FTI_Zer0P-Datensatz. Die Baseline erreichte ${inkjetBaselineDe} AUROC. Nach Holm-Korrektur brachte die Separation Loss keine signifikante Verbesserung. [Zur industriellen Auswertung](${INDUSTRIAL_URL}).`,
    fr: `Ahmed a évalué le système par validation croisée à cinq plis sur le jeu public FTI_Zer0P. La référence a atteint ${inkjetBaselineFr} AUROC. La perte de séparation n’a apporté aucun gain significatif après correction de Holm. [Lire l’évaluation industrielle](${INDUSTRIAL_URL}).`,
    es: `Ahmed evaluó el sistema mediante validación cruzada de cinco pliegues con el conjunto público FTI_Zer0P. La referencia alcanzó ${inkjetBaseline} AUROC. La pérdida de separación no aportó una mejora significativa tras la corrección de Holm. [Leer la evaluación industrial](${INDUSTRIAL_URL}).`,
    ar: `قيّم أحمد النظام بالتحقق المتقاطع عبر خمسة أجزاء على مجموعة FTI_Zer0P العامة. سجّل النموذج المرجعي ${inkjetBaseline} AUROC، ولم تحقق خسارة الفصل تحسنًا ذا دلالة إحصائية بعد تصحيح Holm. [اقرأ التقييم الصناعي](${INDUSTRIAL_URL}).`,
  },
  inspection: {
    en: `Stage 1 uses YOLOv8m to locate 8 print feature types and extract 128×128 crops. Stage 2 scores each region with a conditional diffusion model to flag defects. [See the pipeline and evidence](${INDUSTRIAL_URL}).`,
    de: `Stufe 1 nutzt YOLOv8m, um 8 Druckmerkmalstypen zu lokalisieren und 128×128-Ausschnitte zu erzeugen. Stufe 2 bewertet jede Region mit einem konditionalen Diffusionsmodell auf Druckfehler. [Zur Pipeline und Auswertung](${INDUSTRIAL_URL}).`,
    fr: `La phase 1 utilise YOLOv8m pour localiser 8 types de motifs imprimés et extraire des crops 128×128. La phase 2 évalue chaque région via un modèle de diffusion conditionnel pour repérer les défauts. [Voir la méthode et les résultats](${INDUSTRIAL_URL}).`,
    es: `La etapa 1 usa YOLOv8m para localizar 8 tipos de rasgos impresos y extraer recortes 128×128. La etapa 2 puntúa cada región con un modelo de difusión condicional para detectar defectos. [Ver el método y los resultados](${INDUSTRIAL_URL}).`,
    ar: `تستخدم المرحلة الأولى YOLOv8m لتحديد 8 أنواع من ميزات الطباعة واقتصاص مناطق 128×128. وتقيّم المرحلة الثانية كل منطقة بنموذج انتشار شرطي لكشف العيوب. [اطّلع على خطوات النظام ونتائجه](${INDUSTRIAL_URL}).`,
  },
  sihem_intro: {
    en: `Sihem is a proactive personal-mentor and routines assistant accepted into the tech2b incubator in Linz. The Telegram bot and installable web app are in invitation-only beta, with a Kotlin/Jetpack Compose Android client in private testing. [Read the public case study](${SIHEM_URL}).`,
    de: `Sihem ist ein proaktiver Planungs- und Routinenassistent im tech2b-Inkubator in Linz. Der Telegram-Bot und die installierbare Web-App laufen als Beta mit Einladung; ein nativer Android-Client (Kotlin/Jetpack Compose) ist im privaten Test. [Zur öffentlichen Fallstudie](${SIHEM_URL}).`,
    fr: `Sihem est un assistant personnel proactif pour les routines, incubé chez tech2b à Linz. Le bot Telegram et l’application web installable sont en bêta sur invitation, avec un client Android natif (Kotlin/Jetpack Compose) en test privé. [Lire l’étude de cas publique](${SIHEM_URL}).`,
    es: `Sihem es un asistente personal proactivo para rutinas aceptado en la incubadora tech2b de Linz. El bot de Telegram y la app web instalable están en beta por invitación, junto con un cliente nativo de Android (Kotlin/Jetpack Compose) en pruebas privadas. [Leer el caso de estudio público](${SIHEM_URL}).`,
    ar: `Sihem مساعد شخصي استباقي لتنظيم الروتين اليومي، مقبول في حاضنة tech2b في لينتس. يعمل بوت تيليجرام وتطبيق الويب القابل للتثبيت في نسخة تجريبية بدعوة، مع عميل أندرويد أصلي (Kotlin/Jetpack Compose) قيد الاختبار الخاص. [اقرأ دراسة الحالة العامة](${SIHEM_URL}).`,
  },
  sihem: {
    en: `Sihem (Telegram @sihem_ai_bot, PWA: ${SIHEM_APP_URL}, invitation-only beta) runs on Supabase Edge Functions (Deno/TypeScript) and PostgreSQL with RLS. It combines a deterministic generators→arbiter→composer pipeline, pgvector long-term RAG memory, multi-provider LLM routing (GLM/Gemini/Groq) with automated failover, Cloudflare MeloTTS voice reminders, and Google Calendar sync. [Read the public case study](${SIHEM_URL}).`,
    de: `Sihem (Telegram @sihem_ai_bot, PWA: ${SIHEM_APP_URL}, Beta mit Einladung) läuft auf Supabase Edge Functions (Deno/TypeScript) und PostgreSQL mit RLS. Das System verbindet eine deterministische Generatoren→Arbiter→Komponist-Pipeline, pgvector-Langzeit-RAG-Gedächtnis, Multi-Provider-LLM-Routing (GLM/Gemini/Groq) mit automatischem Failover, Cloudflare MeloTTS-Spracherinnerungen und Google-Kalender-Sync. [Zur öffentlichen Fallstudie](${SIHEM_URL}).`,
    fr: `Sihem (Telegram @sihem_ai_bot, PWA : ${SIHEM_APP_URL}, bêta sur invitation) repose sur Supabase Edge Functions (Deno/TypeScript) et PostgreSQL avec RLS. Il associe un pipeline déterministe générateurs→arbitre→compositeur, une mémoire RAG pgvector long terme, un routage LLM multi-fournisseurs (GLM/Gemini/Groq) avec basculement automatique, des rappels vocaux Cloudflare MeloTTS et la synchro Google Calendar. [Lire l’étude de cas publique](${SIHEM_URL}).`,
    es: `Sihem (Telegram @sihem_ai_bot, PWA: ${SIHEM_APP_URL}, beta por invitación) se ejecuta sobre Supabase Edge Functions (Deno/TypeScript) y PostgreSQL con RLS. Combina una pipeline determinista generadores→árbitro→compositor, memoria RAG pgvector a largo plazo, enrutamiento LLM multiproveedor (GLM/Gemini/Groq) con failover automático, avisos de voz Cloudflare MeloTTS y sincronización con Google Calendar. [Leer el caso de estudio público](${SIHEM_URL}).`,
    ar: `يعمل Sihem (تيليجرام @sihem_ai_bot، وتطبيق الويب: ${SIHEM_APP_URL}، نسخة تجريبية بدعوة) على Supabase Edge Functions (Deno/TypeScript) وPostgreSQL مع RLS. يجمع بين مسار حتمي (مولدات←محكم←مؤلف)، وذاكرة RAG طويلة المدى عبر pgvector، وتوجيه LLM متعدد المزودين (GLM/Gemini/Groq) مع تبديل تلقائي، وتنبيهات صوتية بـ Cloudflare MeloTTS ومزامنة Google Calendar. [اقرأ دراسة الحالة العامة](${SIHEM_URL}).`,
  },
  thesis: {
    en: `Ahmed’s thesis tested whether a conditional diffusion model could recognize unfamiliar images. Separation loss improved mean AUROC from ${cifarBaseline} to ${cifarSeparation} across three seeds on a binary CIFAR-10 airplane-vs-rest split (seed 42: ${seed42Within}). [See the findings and limits](${DIFFUSION_URL}).`,
    de: `Ahmed untersuchte, ob ein konditionales Diffusionsmodell unbekannte Bilder erkennt. Mit Separation Loss stieg die mittlere AUROC von ${cifarBaselineDe} auf ${cifarSeparationDe} über drei Läufe im binären CIFAR-10-Vergleich Flugzeuge gegen alle anderen Klassen (Seed 42: ${seed42WithinDe}). [Ergebnisse und Grenzen](${DIFFUSION_URL}).`,
    fr: `Ahmed a étudié la reconnaissance d’images inconnues par un modèle de diffusion conditionnel. Sur trois essais du test binaire CIFAR-10 avions contre toutes les autres classes, la perte de séparation a fait passer l’AUROC moyenne de ${cifarBaselineFr} à ${cifarSeparationFr} (seed 42 : ${seed42WithinFr}). [Résultats et limites](${DIFFUSION_URL}).`,
    es: `Ahmed estudió si un modelo de difusión condicional podía reconocer imágenes desconocidas. En tres ejecuciones de la prueba binaria CIFAR-10 aviones contra el resto, la pérdida de separación elevó la AUROC media de ${cifarBaseline} a ${cifarSeparation} (seed 42: ${seed42Within}). [Resultados y límites](${DIFFUSION_URL}).`,
    ar: `درس أحمد قدرة نموذج انتشار شرطي على التعرّف على الصور غير المألوفة. رفعت خسارة الفصل متوسط AUROC من ${cifarBaseline} إلى ${cifarSeparation} عبر ثلاث تجارب في اختبار CIFAR-10 الثنائي للطائرات مقابل بقية الفئات (البذرة 42: ${seed42Within}). [النتائج وحدودها](${DIFFUSION_URL}).`,
  },
  thesis_results: {
    en: `The headline thesis result is ${cifarSeparation} AUROC with separation loss, versus ${cifarBaseline} without it (3-seed mean on binary CIFAR-10 airplane-vs-rest; seed-42 reached ${seed42Within}). On the industrial FTI_Zer0P benchmark, the diffusion baseline reached ${inkjetBaseline} AUROC under five-fold cross-validation, and separation loss gave no significant gain after Holm correction. These are benchmark results, not production accuracy. [Compare the results in the explorer](${EXPLORER_URL}).`,
    de: `Das zentrale Ergebnis der Masterarbeit ist ${cifarSeparationDe} AUROC mit Separation Loss gegenüber ${cifarBaselineDe} ohne (3-Seed-Mittel im binären CIFAR-10-Split Flugzeuge gegen den Rest; Seed 42 erreichte ${seed42WithinDe}). Auf dem industriellen FTI_Zer0P-Benchmark erreichte die Diffusions-Baseline ${inkjetBaselineDe} AUROC bei fünffacher Kreuzvalidierung; nach Holm-Korrektur brachte Separation Loss dort keinen signifikanten Gewinn. Es sind Benchmark-Ergebnisse, keine Genauigkeit im Produktivbetrieb. [Ergebnisse im Explorer vergleichen](${EXPLORER_URL}).`,
    fr: `Le résultat principal du mémoire est ${cifarSeparationFr} AUROC avec la perte de séparation, contre ${cifarBaselineFr} sans elle (moyenne sur 3 seeds sur le split binaire CIFAR-10 avions contre le reste ; seed 42 a atteint ${seed42WithinFr}). Sur le benchmark industriel FTI_Zer0P, la référence de diffusion a atteint ${inkjetBaselineFr} AUROC en validation croisée à cinq plis, et la perte de séparation n’a apporté aucun gain significatif après correction de Holm. Ce sont des résultats de benchmark, pas une précision en production. [Comparer les résultats dans l’explorateur](${EXPLORER_URL}).`,
    es: `El resultado principal de la tesis es ${cifarSeparation} AUROC con pérdida de separación, frente a ${cifarBaseline} sin ella (media de 3 semillas en la prueba binaria CIFAR-10 aviones contra el resto; seed 42 alcanzó ${seed42Within}). En el benchmark industrial FTI_Zer0P, la referencia de difusión alcanzó ${inkjetBaseline} AUROC con validación cruzada de cinco pliegues, y la pérdida de separación no aportó mejora significativa tras la corrección de Holm. Son resultados de benchmark, no precisión en producción. [Comparar los resultados en el explorador](${EXPLORER_URL}).`,
    ar: `النتيجة الرئيسية في رسالة الماجستير هي ${cifarSeparation} AUROC مع خسارة الفصل، مقابل ${cifarBaseline} بدونها (متوسط 3 بذور في اختبار CIFAR-10 الثنائي للطائرات مقابل البقية؛ وسجّلت البذرة 42 ${seed42Within}). وعلى معيار FTI_Zer0P الصناعي، سجّل نموذج الانتشار المرجعي ${inkjetBaseline} AUROC بالتحقق المتقاطع عبر خمسة أجزاء، ولم تحقق خسارة الفصل تحسنًا ذا دلالة إحصائية بعد تصحيح Holm. هذه نتائج اختبارات معيارية وليست دقة في بيئة الإنتاج. [قارن النتائج في المستكشف](${EXPLORER_URL}).`,
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
    en: `You can email Ahmed at ahmed.mo.0595@gmail.com, schedule a meeting via [Calendly](${CALENDLY_URL}), try the live AI front-desk voice/avatar demo, or find his profiles in the [contact section](${CONTACT_URL}).`,
    de: `Sie erreichen Ahmed per E-Mail unter ahmed.mo.0595@gmail.com und können im [Kontaktbereich](${CONTACT_URL}) ein Meeting über [Calendly](${CALENDLY_URL}) planen, die Live-Demo des KI-Empfangs (Stimme & Avatar) testen oder seine Profile abrufen.`,
    fr: `Vous pouvez écrire à Ahmed à ahmed.mo.0595@gmail.com, planifier un rendez-vous via [Calendly](${CALENDLY_URL}), essayer la démo vocale/avatar de son accueil IA ou consulter ses profils dans la [rubrique contact](${CONTACT_URL}).`,
    es: `Puedes escribir a Ahmed a ahmed.mo.0595@gmail.com, programar una reunión por [Calendly](${CALENDLY_URL}), probar la demo en vivo de voz y avatar de su recepción con IA o ver sus perfiles en la [sección de contacto](${CONTACT_URL}).`,
    ar: `يمكنك مراسلة أحمد على ahmed.mo.0595@gmail.com، أو جدولة اجتماع عبر [Calendly](${CALENDLY_URL})، أو تجربة العرض المباشر لموظف الاستقبال الذكي بالصوت والصورة المتحركة، أو الاطّلاع على ملفاته المهنية في [قسم التواصل](${CONTACT_URL}).`,
  },
  open_to_work: {
    en: `Ahmed is based in Linz, Austria, and open to full-time AI/ML roles across computer vision, applied ML, and LLM/agent systems. He is eligible for Austria's Rot-Weiß-Rot Karte für Studienabsolventen (graduate work-permit track without a labour-market test); [contact Ahmed](${CONTACT_URL}) to discuss a role or confirm hiring details.`,
    de: `Ahmed lebt in Linz, Österreich, und ist offen für Vollzeitstellen im Bereich AI/ML — von Computer Vision und angewandtem ML bis zu LLM- und Agentensystemen. Er ist berechtigt für die österreichische Rot-Weiß-Rot-Karte für Studienabsolventen (ohne Arbeitsmarktprüfung); [kontaktieren Sie Ahmed](${CONTACT_URL}), um eine Stelle oder Einstellungsdetails zu besprechen.`,
    fr: `Ahmed est basé à Linz, en Autriche, et ouvert aux postes à temps plein en IA/ML (vision par ordinateur, ML appliqué et systèmes LLM/agents). Il est éligible à la Rot-Weiß-Rot Karte für Studienabsolventen autrichienne (sans examen du marché du travail) ; [contactez Ahmed](${CONTACT_URL}) pour échanger sur un poste ou confirmer les modalités.`,
    es: `Ahmed reside en Linz, Austria, y está abierto a puestos a tiempo completo en IA/ML (visión por computador, ML aplicado y sistemas LLM/agentes). Es elegible para la Rot-Weiß-Rot Karte für Studienabsolventen de Austria (sin prueba de mercado laboral); [contacta con Ahmed](${CONTACT_URL}) para hablar de un puesto o confirmar los detalles de contratación.`,
    ar: `يقيم أحمد في لينتس بالنمسا، وهو متاح لوظائف بدوام كامل في الذكاء الاصطناعي وتعلّم الآلة عبر الرؤية الحاسوبية وتعلّم الآلة التطبيقي وأنظمة LLM والوكلاء. وهو مؤهل لبطاقة Rot-Weiß-Rot Karte für Studienabsolventen في النمسا (مسار الخريجين دون فحص سوق العمل)؛ [تواصل مع أحمد](${CONTACT_URL}) لمناقشة فرصة عمل أو تأكيد تفاصيل التوظيف.`,
  },
  role_fit: {
    en: `Ahmed fits roles across two areas: computer vision & industrial ML (YOLOv8m, diffusion models, 5-fold CV evaluation) and LLM/agentic systems (deterministic guardrails, pgvector RAG, multi-provider failover in Sihem and mergeproof). He is eligible for Austria's Rot-Weiß-Rot Karte für Studienabsolventen without a labour-market test. [See his background](${BACKGROUND_URL}) or [contact him](${CONTACT_URL}).`,
    de: `Ahmed passt besonders zu Rollen in zwei Bereichen: Computer Vision & industrielles ML (YOLOv8m, Diffusionsmodelle, 5-fach-CV-Evaluation) sowie LLM- & Agentensysteme (deterministische Guardrails, pgvector-RAG, Multi-Provider-Failover in Sihem und mergeproof). Er ist für die österreichische Rot-Weiß-Rot-Karte für Studienabsolventen ohne Arbeitsmarktprüfung berechtigt. [Zum Hintergrund](${BACKGROUND_URL}) oder [Kontakt aufnehmen](${CONTACT_URL}).`,
    fr: `Ahmed correspond à des postes dans deux domaines : vision par ordinateur & ML industriel (YOLOv8m, modèles de diffusion, validation croisée 5 plis) et systèmes LLM/agents (garde-fous déterministes, RAG pgvector, basculement multi-fournisseurs dans Sihem et mergeproof). Il est éligible à la Rot-Weiß-Rot Karte für Studienabsolventen sans examen du marché du travail. [Voir son parcours](${BACKGROUND_URL}) ou [le contacter](${CONTACT_URL}).`,
    es: `Ahmed encaja en dos áreas: visión por computador y ML industrial (YOLOv8m, modelos de difusión, validación cruzada de 5 folds) y sistemas LLM/agénticos (controles deterministas, RAG con pgvector, failover multiproveedor en Sihem y mergeproof). Es elegible para la Rot-Weiß-Rot Karte für Studienabsolventen sin prueba de mercado laboral. [Ver su trayectoria](${BACKGROUND_URL}) o [contactarlo](${CONTACT_URL}).`,
    ar: `يناسب أحمد أدوارًا في مسارين: الرؤية الحاسوبية وتعلّم الآلة الصناعي (YOLOv8m ونماذج الانتشار والتحقق التقاطعي الخماسي) وأنظمة LLM والوكلاء (الضوابط الحتمية وذاكرة pgvector RAG والتبديل التلقائي بين المزودين في Sihem وmergeproof). وهو مؤهل لبطاقة Rot-Weiß-Rot Karte für Studienabsolventen في النمسا دون فحص سوق العمل. [اطّلع على خلفيته](${BACKGROUND_URL}) أو [تواصل معه](${CONTACT_URL}).`,
  },
  mergeproof: {
    en: `[mergeproof](${MERGEPROOF_URL}) checks AI-written pull requests against configured deterministic merge requirements (\`MERGE\`, \`RETRY\`, or \`HUMAN\`) with 0 LLM calls. Try the [interactive PR gate playground](${MERGEPROOF_PLAYGROUND_URL}). Passing its checks does not guarantee defect-free code.`,
    de: `[mergeproof](${MERGEPROOF_URL}) prüft KI-generierte Pull Requests anhand konfigurierter deterministischer Merge-Anforderungen (\`MERGE\`, \`RETRY\` oder \`HUMAN\`) mit 0 LLM-Aufrufen. Testen Sie den [interaktiven PR-Gate-Playground](${MERGEPROOF_PLAYGROUND_URL}). Bestandene Prüfungen garantieren keinen fehlerfreien Code.`,
    fr: `[mergeproof](${MERGEPROOF_URL}) vérifie les pull requests écrites par IA selon des exigences de fusion déterministes configurées (\`MERGE\`, \`RETRY\` ou \`HUMAN\`) avec 0 appel LLM. Essayez le [playground interactif du contrôle PR](${MERGEPROOF_PLAYGROUND_URL}). Réussir ces contrôles ne garantit pas un code sans défaut.`,
    es: `[mergeproof](${MERGEPROOF_URL}) verifica pull requests escritos por IA frente a requisitos de fusión deterministas (\`MERGE\`, \`RETRY\` o \`HUMAN\`) con 0 llamadas LLM. Prueba el [playground interactivo de PR gate](${MERGEPROOF_PLAYGROUND_URL}). Superar estas comprobaciones no garantiza un código sin errores.`,
    ar: `تفحص أداة [mergeproof](${MERGEPROOF_URL}) طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات حتمية محددة (\`MERGE\` أو \`RETRY\` أو \`HUMAN\`) بـ 0 استدعاءات LLM. جرّب [ساحة التجربة التفاعلية](${MERGEPROOF_PLAYGROUND_URL}). اجتياز هذه الفحوص لا يضمن خلو الشيفرة من الأخطاء.`,
  },
  guardrails_post: {
    en: `Probabilistic LLMs should not own scheduling, state transitions, or merge gates. In [Deterministic Guardrails for LLM and Agent Systems](${GUARDRAILS_POST_URL}), Ahmed explains how Sihem’s \`generators → arbiter → composer\` loop and \`mergeproof\`’s zero-LLM PR checks enforce deterministic boundaries.`,
    de: `Probabilistische LLMs sollten weder Zeitplanung noch Zustandsübergänge oder Merge-Gates allein steuern. Im Artikel [Deterministische Guardrails für LLM- und Agentensysteme](${GUARDRAILS_POST_URL}) zeigt Ahmed, wie Sihems \`generators → arbiter → composer\`-Schleife und die LLM-freien PR-Checks von \`mergeproof\` klare Grenzen ziehen.`,
    fr: `Les LLM probabilistes ne doivent pas gérer seuls la planification, les transitions d’état ou les portes de fusion. Dans [Garde-fous déterministes pour systèmes LLM et agents](${GUARDRAILS_POST_URL}), Ahmed explique comment la boucle \`generators → arbiter → composer\` de Sihem et les vérifications sans LLM de \`mergeproof\` imposent des limites déterministes.`,
    es: `Los LLM probabilísticos no deben controlar por sí solos la planificación, las transiciones de estado ni las puertas de fusión. En [Controles deterministas para sistemas LLM y agentes](${GUARDRAILS_POST_URL}), Ahmed explica cómo el ciclo \`generators → arbiter → composer\` de Sihem y las comprobaciones sin LLM de \`mergeproof\` imponen límites deterministas.`,
    ar: `لا ينبغي لنماذج اللغة الاحتمالية أن تدير بمفردها الجدولة أو انتقالات الحالة أو بوابات الدمج. في مقال [الضوابط الحتمية لأنظمة LLM والوكلاء](${GUARDRAILS_POST_URL})، يشرح أحمد كيف تفرض حلقة \`generators → arbiter → composer\` في Sihem وفحوصات \`mergeproof\` الخالية من LLM حدودًا حتمية واضحة.`,
  },
  tech_stack: {
    en: `Ahmed's stack spans AI research and production engineering:\n- ML: PyTorch, Python, Diffusion Models, YOLO, OpenCV, Anomaly Detection\n- Product/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Tools: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Skills and background](${BACKGROUND_URL}) · [Inkjet inspection](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    de: `Ahmeds Stack umfasst KI-Forschung und Produktionsentwicklung:\n- ML: PyTorch, Python, Diffusionsmodelle, YOLO, OpenCV, Anomalieerkennung\n- Produkt/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Tools: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Skills und Hintergrund](${BACKGROUND_URL}) · [Inkjet-Prüfung](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    fr: `Le stack d'Ahmed couvre la recherche IA et la production :\n- ML : PyTorch, Python, Modèles de diffusion, YOLO, OpenCV, Détection d'anomalies\n- Produit/Infra : Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Outils : Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Compétences et parcours](${BACKGROUND_URL}) · [Inspection jet d’encre](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    es: `El stack de Ahmed abarca investigación en IA e ingeniería de producción:\n- ML: PyTorch, Python, Modelos de difusión, YOLO, OpenCV, Detección de anomalías\n- Producto/Infra: Next.js, React, TypeScript, Supabase, Deno, Docker, PostgreSQL, pgvector, Cloudflare\n- Herramientas: Git, mergeproof, Weights & Biases, Hugging Face, Linux\n[Habilidades y trayectoria](${BACKGROUND_URL}) · [Inspección inkjet](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
    ar: `يشمل الـ stack الخاص بأحمد أبحاث الذكاء الاصطناعي وهندسة الإنتاج:\n- تعلم الآلة: PyTorch وPython ونماذج الانتشار وYOLO وOpenCV وكشف الشذوذ\n- المنتج والبنية: Next.js وReact وTypeScript وSupabase وDeno وDocker وPostgreSQL وpgvector وCloudflare\n- الأدوات: Git وmergeproof وWeights & Biases وHugging Face وLinux\n[المهارات والخلفية](${BACKGROUND_URL}) · [فحص الطباعة](${INDUSTRIAL_URL}) · [Sihem](${SIHEM_URL})`,
  },
  achievements: {
    en: `Key proof points:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (3-seed mean) on within-CIFAR airplane-vs-rest binary OOD split with novel class-conditional separation loss (+${cifarGain}pp over ${cifarBaseline} baseline; M.Sc. thesis under Prof. Sepp Hochreiter, graded 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): ${inkjetBaseline} AUROC baseline under strict 5-fold CV on the public FTI_Zer0P industrial dataset at PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo Developer & Project Lead (tech2b incubator Linz, invitation-only beta personal-mentor assistant)\n- [mergeproof](${MERGEPROOF_URL}): checks AI-written pull requests against configured deterministic merge requirements with 0 LLM calls (passing checks does not guarantee defect-free code)`,
    de: `Wichtige Meilensteine:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparationDe} AUROC (3-Seed-Mittel) auf dem binären Within-CIFAR-Split Flugzeuge gegen den Rest mit neuartiger class-conditional separation loss (+${cifarGainDe} Prozentpunkte gegenüber ${cifarBaselineDe} Baseline; Masterarbeit bei Prof. Sepp Hochreiter, Note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): ${inkjetBaselineDe} AUROC-Baseline auf dem öffentlichen Datensatz FTI_Zer0P unter strenger 5-facher Kreuzvalidierung bei PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Solo-Entwickler & Projektleiter (tech2b Inkubator Linz, KI-Mentor-Assistent in Beta mit Einladung)\n- [mergeproof](${MERGEPROOF_URL}): prüft KI-generierte PRs anhand konfigurierter deterministischer Merge-Anforderungen mit 0 LLM-Aufrufen (bestandene Prüfungen garantieren keine Fehlerfreiheit)`,
    fr: `Principaux résultats :\n- [DiffusionOOD](${DIFFUSION_URL}) : ${cifarSeparationFr} AUROC (moyenne sur 3 seeds) sur le split binaire within-CIFAR avions contre le reste avec separation loss conditionnelle (+${cifarGainFr} points par rapport à la référence de ${cifarBaselineFr} ; mémoire dirigé par Prof. Sepp Hochreiter, note 1)\n- [InkjetOOD](${INDUSTRIAL_URL}) : référence à ${inkjetBaselineFr} AUROC sur le jeu public FTI_Zer0P en validation croisée 5 plis chez PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}) : Développeur solo & chef de projet (incubateur tech2b Linz, assistant mentor IA en bêta sur invitation)\n- [mergeproof](${MERGEPROOF_URL}) : vérifie les PR générées par IA selon des exigences déterministes configurées avec 0 appel LLM (la réussite des contrôles ne garantit pas un code sans défaut)`,
    es: `Logros destacados:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (media de 3 seeds) en el split binario within-CIFAR aviones contra el resto con separation loss condicional (+${cifarGain} puntos porcentuales frente al ${cifarBaseline} de referencia; tesis con Prof. Sepp Hochreiter, nota 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): referencia de ${inkjetBaseline} AUROC en el dataset público FTI_Zer0P con validación cruzada 5-fold en PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): Desarrollador en solitario y líder de proyecto (incubadora tech2b Linz, asistente mentor IA en beta por invitación)\n- [mergeproof](${MERGEPROOF_URL}): verifica PRs generadas por IA según requisitos deterministas configurados con 0 llamadas a un LLM (superar las comprobaciones no garantiza que el código esté libre de errores)`,
    ar: `أبرز الإنجازات:\n- [DiffusionOOD](${DIFFUSION_URL}): ${cifarSeparation} AUROC (متوسط 3 بذور) على تقسيم within-CIFAR الثنائي للطائرات مقابل البقية مع separation loss الشرطية (+${cifarGain} نقطة مئوية مقارنةً بالأساس ${cifarBaseline}؛ رسالة الماجستير بإشراف Prof. Sepp Hochreiter، تقدير 1)\n- [InkjetOOD](${INDUSTRIAL_URL}): خط أساس ${inkjetBaseline} AUROC على مجموعة FTI_Zer0P العامة بتحقق تقاطعي 5-fold لدى PROFACTOR GmbH\n- [Sihem](${SIHEM_URL}): مطور منفرد وقائد مشروع (حاضنة tech2b لينتس، مساعد موجه بالذكاء الاصطناعي في نسخة تجريبية بدعوة)\n- [mergeproof](${MERGEPROOF_URL}): يتحقق من طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات حتمية محددة بـ 0 استدعاءات LLM (اجتياز الفحوص لا يضمن خلو الشيفرة من الأخطاء)`,
  },
  thesis_speed: {
    en: `Speed depends on K, the number of denoising trials used to score each image. In the seed-42 ablation, K=${kFastK} reached ${kFastAuroc} AUROC at ${kFastMs} ms per image, about ${kSpeedup}x faster than the default K=${kDefaultK} (${kDefaultAuroc} AUROC, ${kDefaultMs} ms per image), so K=${kFastK} is the recommended setting. [Explore the trade-off](${EXPLORER_URL}).`,
    de: `Die Geschwindigkeit hängt von K ab, der Zahl der Entrauschungsversuche pro Bild. In der Ablation mit Seed 42 erreichte K=${kFastK} ${kDe.fastAuroc} AUROC bei ${kDe.fastMs} ms pro Bild und war damit etwa ${kSpeedup}-mal schneller als der Standardwert K=${kDefaultK} (${kDe.defaultAuroc} AUROC, ${kDe.defaultMs} ms pro Bild). K=${kFastK} ist daher die empfohlene Einstellung. [Den Kompromiss im Explorer ansehen](${EXPLORER_URL}).`,
    fr: `La vitesse dépend de K, le nombre d’essais de débruitage par image. Dans l’ablation avec la seed 42, K=${kFastK} a atteint ${kFr.fastAuroc} AUROC en ${kFr.fastMs} ms par image, soit environ ${kSpeedup} fois plus vite que la valeur par défaut K=${kDefaultK} (${kFr.defaultAuroc} AUROC, ${kFr.defaultMs} ms par image) : K=${kFastK} est donc le réglage recommandé. [Explorer le compromis](${EXPLORER_URL}).`,
    es: `La velocidad depende de K, el número de pruebas de eliminación de ruido por imagen. En la ablación con seed 42, K=${kFastK} alcanzó ${kFastAuroc} AUROC con ${kFastMs} ms por imagen, unas ${kSpeedup} veces más rápido que el valor por defecto K=${kDefaultK} (${kDefaultAuroc} AUROC, ${kDefaultMs} ms por imagen), por lo que K=${kFastK} es el ajuste recomendado. [Explorar el equilibrio](${EXPLORER_URL}).`,
    ar: `تعتمد السرعة على K، أي عدد محاولات إزالة الضوضاء لتقييم كل صورة. في تجربة البذرة 42، حقق K=${kFastK} نسبة ${kFastAuroc} AUROC في ${kFastMs} ms لكل صورة، أي أسرع بنحو ${kSpeedup} مرات من القيمة الافتراضية K=${kDefaultK} (${kDefaultAuroc} AUROC و${kDefaultMs} ms لكل صورة)، لذا فإن K=${kFastK} هو الإعداد الموصى به. [استكشف المفاضلة](${EXPLORER_URL}).`,
  },
  thesis_limits: {
    en: `The thesis results come with four limits:\n- The headline result is from a binary test with one familiar class (CIFAR-10 airplanes against the other nine classes), so it is not comparable to multi-class OOD leaderboards or to accuracy in production.\n- On the industrial FTI_Zer0P data, separation loss gave no significant gain after Holm correction.\n- Without separation loss, results varied much more between seeds.\n- Scoring needs several denoising trials per image, so it is much slower than a standard ResNet-18 classifier.\n[Read the findings and limits](${DIFFUSION_URL})`,
    de: `Die Ergebnisse der Masterarbeit haben vier Grenzen:\n- Das zentrale Ergebnis stammt aus einem binären Test mit einer bekannten Klasse (CIFAR-10-Flugzeuge gegen die anderen neun Klassen). Es ist daher nicht mit Mehrklassen-OOD-Ranglisten oder mit der Genauigkeit im Produktivbetrieb vergleichbar.\n- Auf den industriellen FTI_Zer0P-Daten brachte die Separation Loss nach Holm-Korrektur keinen signifikanten Gewinn.\n- Ohne Separation Loss schwankten die Ergebnisse zwischen den Seeds deutlich stärker.\n- Die Bewertung braucht mehrere Entrauschungsversuche pro Bild und ist daher viel langsamer als ein üblicher ResNet-18-Klassifikator.\n[Ergebnisse und Grenzen](${DIFFUSION_URL})`,
    fr: `Les résultats du mémoire ont quatre limites :\n- Le résultat principal vient d’un test binaire avec une seule classe connue (les avions de CIFAR-10 contre les neuf autres classes) : il n’est donc comparable ni aux classements OOD multiclasses ni à une précision en production.\n- Sur les données industrielles FTI_Zer0P, la perte de séparation n’a apporté aucun gain significatif après correction de Holm.\n- Sans perte de séparation, les résultats variaient beaucoup plus d’une seed à l’autre.\n- Le score demande plusieurs essais de débruitage par image, ce qui le rend bien plus lent qu’un classifieur ResNet-18 standard.\n[Résultats et limites](${DIFFUSION_URL})`,
    es: `Los resultados de la tesis tienen cuatro límites:\n- El resultado principal procede de una prueba binaria con una sola clase conocida (los aviones de CIFAR-10 contra las otras nueve clases), por lo que no es comparable con clasificaciones OOD multiclase ni con la precisión en producción.\n- En los datos industriales FTI_Zer0P, la pérdida de separación no aportó una mejora significativa tras la corrección de Holm.\n- Sin pérdida de separación, los resultados variaban mucho más entre semillas.\n- La puntuación necesita varias pruebas de eliminación de ruido por imagen, así que es mucho más lenta que un clasificador ResNet-18 estándar.\n[Resultados y límites](${DIFFUSION_URL})`,
    ar: `لنتائج الرسالة أربعة حدود:\n- النتيجة الرئيسية مأخوذة من اختبار ثنائي بفئة مألوفة واحدة (طائرات CIFAR-10 مقابل الفئات التسع الأخرى)، لذا لا تُقارن بلوائح ترتيب OOD متعددة الفئات ولا بالدقة في بيئة الإنتاج.\n- على بيانات FTI_Zer0P الصناعية، لم تحقق خسارة الفصل تحسنًا ذا دلالة إحصائية بعد تصحيح Holm.\n- من دون خسارة الفصل، تفاوتت النتائج بين البذور أكثر بكثير.\n- يحتاج التقييم إلى عدة محاولات لإزالة الضوضاء لكل صورة، لذا فهو أبطأ بكثير من مصنِّف ResNet-18 المعتاد.\n[النتائج وحدودها](${DIFFUSION_URL})`,
  },
  thesis_read: {
    en: `The thesis was supervised by Prof. Sepp Hochreiter at JKU Linz and graded 1. You can read the [full thesis (PDF)](${THESIS_URL}) or its [JKU library record](${JKU_THESIS_RECORD_URL}). For a shorter read, see the [case study](${DIFFUSION_URL}) or the [blog post about the thesis](${THESIS_POST_URL}).`,
    de: `Die Masterarbeit wurde an der JKU Linz von Prof. Sepp Hochreiter betreut und mit 1 benotet. Sie können die [vollständige Arbeit (PDF)](${THESIS_URL}) oder den [Eintrag in der JKU-Bibliothek](${JKU_THESIS_RECORD_URL}) lesen. Kürzer geht es mit der [Fallstudie](${DIFFUSION_URL}) oder dem [Blogartikel zur Masterarbeit](${THESIS_POST_URL}).`,
    fr: `Le mémoire a été dirigé par Prof. Sepp Hochreiter à la JKU Linz et noté 1. Vous pouvez lire le [mémoire complet (PDF)](${THESIS_URL}) ou sa [fiche à la bibliothèque de la JKU](${JKU_THESIS_RECORD_URL}). Pour une lecture plus courte, voyez l’[étude de cas](${DIFFUSION_URL}) ou l’[article de blog sur le mémoire](${THESIS_POST_URL}).`,
    es: `La tesis fue dirigida por el Prof. Sepp Hochreiter en la JKU Linz y calificada con 1. Puedes leer la [tesis completa (PDF)](${THESIS_URL}) o su [registro en la biblioteca de la JKU](${JKU_THESIS_RECORD_URL}). Para una lectura más breve, consulta el [caso de estudio](${DIFFUSION_URL}) o el [artículo del blog sobre la tesis](${THESIS_POST_URL}).`,
    ar: `أُنجزت الرسالة في JKU Linz بإشراف Prof. Sepp Hochreiter ونالت تقدير 1. يمكنك قراءة [الرسالة كاملة (PDF)](${THESIS_URL}) أو [سجلها في مكتبة JKU](${JKU_THESIS_RECORD_URL}). وللاطلاع السريع، راجع [دراسة الحالة](${DIFFUSION_URL}) أو [مقال المدونة عن الرسالة](${THESIS_POST_URL}).`,
  },
  experience: {
    en: `Ahmed’s work, newest first:\n- Since May 2026: Solo Developer & Project Lead for [Sihem](${SIHEM_URL}), a side project in the tech2b incubator, Linz, alongside freelance AI consulting (LLMs, integrations, workflow automation)\n- Apr–Nov 2024: Master’s thesis researcher at PROFACTOR GmbH on [industrial print inspection](${INDUSTRIAL_URL}), continued at JKU Linz\n- Aug–Oct 2023: AI research intern at Karunya Institute (EEG motor-imagery models)\n- Sep 2018–Oct 2020: Electronics technician at Ledzone, Istanbul\n[Full background](${BACKGROUND_URL})`,
    de: `Ahmeds Stationen, die neueste zuerst:\n- Seit Mai 2026: Solo-Entwickler & Projektleiter von [Sihem](${SIHEM_URL}), einem Nebenprojekt im tech2b-Inkubator in Linz, dazu freiberufliche KI-Beratung (LLMs, Integrationen, Workflow-Automatisierung)\n- Apr.–Nov. 2024: Masterarbeits-Forscher bei der PROFACTOR GmbH zur [industriellen Druckprüfung](${INDUSTRIAL_URL}), fortgesetzt an der JKU Linz\n- Aug.–Okt. 2023: KI-Forschungspraktikant am Karunya Institute (EEG-Motor-Imagery-Modelle)\n- Sep. 2018–Okt. 2020: Elektroniktechniker bei Ledzone in Istanbul\n[Gesamter Hintergrund](${BACKGROUND_URL})`,
    fr: `Le parcours d’Ahmed, du plus récent au plus ancien :\n- Depuis mai 2026 : développeur solo et chef de projet de [Sihem](${SIHEM_URL}), un projet personnel dans l’incubateur tech2b à Linz, en parallèle de missions de conseil IA en freelance (LLM, intégrations, automatisation de workflows)\n- Avr.–nov. 2024 : chercheur en mémoire de master chez PROFACTOR GmbH sur l’[inspection industrielle des impressions](${INDUSTRIAL_URL}), poursuivi à la JKU Linz\n- Août–oct. 2023 : stagiaire de recherche en IA au Karunya Institute (modèles EEG d’imagerie motrice)\n- Sept. 2018–oct. 2020 : technicien en électronique chez Ledzone à Istanbul\n[Parcours complet](${BACKGROUND_URL})`,
    es: `La experiencia de Ahmed, de la más reciente a la más antigua:\n- Desde mayo de 2026: desarrollador en solitario y líder de proyecto de [Sihem](${SIHEM_URL}), un proyecto propio en la incubadora tech2b de Linz, junto con consultoría de IA freelance (LLM, integraciones, automatización de flujos de trabajo)\n- Abr.–nov. 2024: investigador de tesis de máster en PROFACTOR GmbH sobre [inspección industrial de impresión](${INDUSTRIAL_URL}), continuada en la JKU Linz\n- Ago.–oct. 2023: becario de investigación en IA en el Karunya Institute (modelos EEG de imaginería motora)\n- Sep. 2018–oct. 2020: técnico de electrónica en Ledzone, Estambul\n[Trayectoria completa](${BACKGROUND_URL})`,
    ar: `خبرات أحمد من الأحدث إلى الأقدم:\n- منذ مايو 2026: مطوّر منفرد وقائد مشروع [Sihem](${SIHEM_URL})، وهو مشروع جانبي في حاضنة tech2b في لينتس، إلى جانب استشارات حرة في الذكاء الاصطناعي (LLM والتكاملات وأتمتة سير العمل)\n- أبريل–نوفمبر 2024: باحث رسالة ماجستير في PROFACTOR GmbH حول [فحص جودة الطباعة الصناعي](${INDUSTRIAL_URL})، واستُكمل العمل في JKU Linz\n- أغسطس–أكتوبر 2023: متدرب بحثي في الذكاء الاصطناعي في Karunya Institute (نماذج EEG للتخيل الحركي)\n- سبتمبر 2018–أكتوبر 2020: فني إلكترونيات في Ledzone بإسطنبول\n[الخلفية الكاملة](${BACKGROUND_URL})`,
  },
  profiles: {
    en: `Ahmed’s public profiles: [GitHub](${GITHUB_URL}), [LinkedIn](${LINKEDIN_URL}), [Hugging Face](${HF_URL}), [Weights & Biases](${WANDB_URL}) and [ORCID](${ORCID_URL}). His thesis is also listed in the [JKU library](${JKU_THESIS_RECORD_URL}).`,
    de: `Ahmeds öffentliche Profile: [GitHub](${GITHUB_URL}), [LinkedIn](${LINKEDIN_URL}), [Hugging Face](${HF_URL}), [Weights & Biases](${WANDB_URL}) und [ORCID](${ORCID_URL}). Seine Masterarbeit ist außerdem in der [JKU-Bibliothek](${JKU_THESIS_RECORD_URL}) verzeichnet.`,
    fr: `Les profils publics d’Ahmed : [GitHub](${GITHUB_URL}), [LinkedIn](${LINKEDIN_URL}), [Hugging Face](${HF_URL}), [Weights & Biases](${WANDB_URL}) et [ORCID](${ORCID_URL}). Son mémoire figure aussi dans la [bibliothèque de la JKU](${JKU_THESIS_RECORD_URL}).`,
    es: `Los perfiles públicos de Ahmed: [GitHub](${GITHUB_URL}), [LinkedIn](${LINKEDIN_URL}), [Hugging Face](${HF_URL}), [Weights & Biases](${WANDB_URL}) y [ORCID](${ORCID_URL}). Su tesis también aparece en la [biblioteca de la JKU](${JKU_THESIS_RECORD_URL}).`,
    ar: `حسابات أحمد العامة: [GitHub](${GITHUB_URL}) و[LinkedIn](${LINKEDIN_URL}) و[Hugging Face](${HF_URL}) و[Weights & Biases](${WANDB_URL}) و[ORCID](${ORCID_URL}). ورسالته مُدرجة أيضًا في [مكتبة JKU](${JKU_THESIS_RECORD_URL}).`,
  },
  frontdesk: {
    en: `It is a live demo call with an AI version of Ahmed that speaks in his cloned voice with an animated face. It can tell you about his work and help you book a meeting. Calls last up to 3 minutes, and it can make mistakes or be busy. Start it from the top of the home page or the [contact section](${CONTACT_URL}); your browser will ask for the microphone. The call uses Google Gemini, ElevenLabs and Anam, and Ahmed does not record or store it.`,
    de: `Es ist ein Live-Demo-Anruf mit einer KI-Version von Ahmed, die mit seiner geklonten Stimme und einem animierten Gesicht spricht. Sie erzählt von seiner Arbeit und hilft, einen Termin zu buchen. Anrufe dauern bis zu 3 Minuten; die KI kann Fehler machen oder besetzt sein. Starten Sie ihn oben auf der Startseite oder im [Kontaktbereich](${CONTACT_URL}); Ihr Browser fragt nach dem Mikrofon. Der Anruf nutzt Google Gemini, ElevenLabs und Anam, und Ahmed zeichnet ihn weder auf noch speichert er ihn.`,
    fr: `C’est un appel de démonstration en direct avec une version IA d’Ahmed, qui parle avec sa voix clonée et un visage animé. Elle peut présenter son travail et vous aider à réserver un rendez-vous. Les appels durent jusqu’à 3 minutes, et l’IA peut se tromper ou être occupée. Lancez-le en haut de la page d’accueil ou dans la [rubrique contact](${CONTACT_URL}) ; votre navigateur demandera l’accès au micro. L’appel utilise Google Gemini, ElevenLabs et Anam, et Ahmed ne l’enregistre ni ne le conserve.`,
    es: `Es una llamada de demostración en vivo con una versión de IA de Ahmed que habla con su voz clonada y una cara animada. Puede contarte sobre su trabajo y ayudarte a reservar una reunión. Las llamadas duran hasta 3 minutos, y la IA puede equivocarse o estar ocupada. Iníciala desde la parte superior de la página de inicio o en la [sección de contacto](${CONTACT_URL}); tu navegador pedirá el micrófono. La llamada usa Google Gemini, ElevenLabs y Anam, y Ahmed no la graba ni la guarda.`,
    ar: `هي مكالمة تجريبية مباشرة مع نسخة ذكاء اصطناعي من أحمد تتحدث بصوته المستنسخ وبوجه متحرك. يمكنها أن تحدثك عن عمله وتساعدك على حجز اجتماع. تستمر المكالمة حتى 3 دقائق، وقد تخطئ أو تكون مشغولة. ابدأها من أعلى الصفحة الرئيسية أو من [قسم التواصل](${CONTACT_URL})؛ وسيطلب متصفحك إذن الميكروفون. تستخدم المكالمة Google Gemini وElevenLabs وAnam، ولا يسجّلها أحمد ولا يحتفظ بها.`,
  },
  writing: {
    en: `Ahmed’s [blog](${BLOG_URL}) has four posts:\n- [Deterministic guardrails for LLM and agent systems](${GUARDRAILS_POST_URL})\n- [The diffusion OOD thesis](${THESIS_POST_URL})\n- [Diffusion models for industrial defect detection](${INDUSTRIAL_POST_URL})\n- [YOLOv8m for industrial quality control](${YOLO_POST_URL})\nThe [News page](${NEWS_URL}) adds AI and agentic-engineering news, updated daily by an automated pipeline.`,
    de: `Ahmeds [Blog](${BLOG_URL}) hat vier Artikel:\n- [Deterministische Guardrails für LLM- und Agentensysteme](${GUARDRAILS_POST_URL})\n- [Die Masterarbeit zur Diffusions-OOD-Erkennung](${THESIS_POST_URL})\n- [Diffusionsmodelle zur industriellen Fehlererkennung](${INDUSTRIAL_POST_URL})\n- [YOLOv8m für die industrielle Qualitätskontrolle](${YOLO_POST_URL})\nDie [News-Seite](${NEWS_URL}) bietet zusätzlich KI- und Agentic-Engineering-News, täglich von einer automatisierten Pipeline aktualisiert.`,
    fr: `Le [blog](${BLOG_URL}) d’Ahmed compte quatre articles :\n- [Garde-fous déterministes pour systèmes LLM et agents](${GUARDRAILS_POST_URL})\n- [Le mémoire sur la détection OOD par diffusion](${THESIS_POST_URL})\n- [Modèles de diffusion pour la détection de défauts industriels](${INDUSTRIAL_POST_URL})\n- [YOLOv8m pour le contrôle qualité industriel](${YOLO_POST_URL})\nLa [page Actualités](${NEWS_URL}) propose aussi des nouvelles sur l’IA et l’ingénierie agentique, mises à jour chaque jour par un pipeline automatisé.`,
    es: `El [blog](${BLOG_URL}) de Ahmed tiene cuatro artículos:\n- [Controles deterministas para sistemas LLM y agentes](${GUARDRAILS_POST_URL})\n- [La tesis sobre detección OOD con difusión](${THESIS_POST_URL})\n- [Modelos de difusión para detectar defectos industriales](${INDUSTRIAL_POST_URL})\n- [YOLOv8m para el control de calidad industrial](${YOLO_POST_URL})\nLa [página de Noticias](${NEWS_URL}) añade noticias de IA e ingeniería agéntica, actualizadas a diario por un pipeline automatizado.`,
    ar: `تضم [مدونة](${BLOG_URL}) أحمد أربعة مقالات:\n- [الضوابط الحتمية لأنظمة LLM والوكلاء](${GUARDRAILS_POST_URL})\n- [رسالة الماجستير عن كشف OOD بنماذج الانتشار](${THESIS_POST_URL})\n- [نماذج الانتشار لكشف العيوب الصناعية](${INDUSTRIAL_POST_URL})\n- [YOLOv8m لضبط الجودة الصناعي](${YOLO_POST_URL})\nوتضيف [صفحة الأخبار](${NEWS_URL}) أخبار الذكاء الاصطناعي وهندسة الوكلاء، وتُحدَّث يوميًا عبر مسار آلي.`,
  },
} satisfies Record<string, TranslationMap>

export type ReplyId = keyof typeof LOCAL_REPLIES

export const REPLY_FOR_PROMPT = {
  projects_best: 'projects',
  background: 'background',
  cv: 'cv',
  industrial_pipeline: 'inspection',
  industrial_result: 'industrial',
  thesis_summary: 'thesis',
  thesis_loss: 'thesis_method',
  thesis_results: 'thesis_results',
  thesis_datasets: 'thesis_datasets',
  sihem_overview: 'sihem_intro',
  sihem_tech: 'sihem',
  hire_fit: 'role_fit',
  open_to_work: 'open_to_work',
  contact: 'contact',
  tech_stack: 'tech_stack',
  achievements: 'achievements',
  mergeproof_overview: 'mergeproof',
  guardrails_post: 'guardrails_post',
  thesis_why_diffusion: 'thesis_diffusion',
  thesis_speed: 'thesis_speed',
  thesis_limits: 'thesis_limits',
  thesis_read: 'thesis_read',
  experience: 'experience',
  profiles: 'profiles',
  frontdesk_demo: 'frontdesk',
  writing: 'writing',
} satisfies Record<PromptId, ReplyId>

export function findPromptId(question: string): PromptId | undefined {
  const text = question.trim().toLowerCase()
  return (Object.keys(PROMPT_LIBRARY) as PromptId[]).find((id) =>
    Object.values(PROMPT_LIBRARY[id]).some((label) => label.toLowerCase() === text)
  )
}

/**
 * The language to answer `question` in when the answer is prepared rather than
 * written by the model: the language of a suggested question it matches, Arabic
 * for Arabic script, English for Latin script while the site is in Arabic, and
 * otherwise the site language.
 */
export function questionLanguage(question: string, siteLang: Language): Language {
  const text = question.trim().toLowerCase()
  for (const id of Object.keys(PROMPT_LIBRARY) as PromptId[]) {
    const labels = PROMPT_LIBRARY[id]
    if (labels[siteLang]?.toLowerCase() === text) return siteLang
    for (const lang of Object.keys(labels) as Language[]) {
      if (labels[lang]?.toLowerCase() === text) return lang
    }
  }
  // Count words, not letters, so a Latin product name in an Arabic question
  // ("ما هو mergeproof؟") does not outweigh the Arabic around it.
  const words = text.split(/\s+/)
  const arabic = words.filter((word) => /\p{Script=Arabic}/u.test(word)).length
  const latin = words.filter((word) => /\p{Script=Latin}/u.test(word)).length
  if (arabic > latin) return 'ar'
  if (siteLang === 'ar' && latin > 0 && arabic === 0) return 'en'
  return siteLang
}

export function findCuratedTopic(question: string): ReplyId | undefined {
  const prompt = findPromptId(question)
  if (prompt) return REPLY_FOR_PROMPT[prompt]

  const text = question.trim().toLowerCase().replace(/^[¿¡]|[.!?؟]+$/gu, '').trim()
  if (
    /^(?:(?:download|show me|where can i (?:find|download)) )?(?:(?:ahmed[’']s|his|the) )?(?:cv|r[eé]sum[eé])(?: (?:link|pdf|please))?$|^(?:lebenslauf|curr[ií]culum|سيرة أحمد الذاتية)$/u.test(
      text
    )
  ) {
    return 'cv'
  }
  if (/^(?:how (?:can|do) i (?:contact|reach) (?:ahmed|him)|contact(?: ahmed)?|contacto|kontakt|تواصل مع أحمد)$/u.test(text)) {
    return 'contact'
  }
  if (/^(?:where can i read (?:the )?case stud(?:y|ies)|case studies|project links)$/u.test(text)) {
    return 'projects'
  }
  return undefined
}

export function inferReplyId(text: string): ReplyId | undefined {
  if (/industrial|industriell|industriel|inkjet|profactor|fti[_-]?zer0p|الصناعي/i.test(text)) return 'industrial'
  if (/guardrail|arbiter loop|deterministic guardrails|الضوابط الحتمية/i.test(text)) return 'guardrails_post'
  if (/mergeproof|merge\s*gate|pr\s*check|pr\s*gate/i.test(text)) return 'mergeproof'
  if (/\b(sihem|mentor|habit|routine|telegram|tech2b|pgvector)\b/i.test(text)) return 'sihem'
  if (/(?:why use|warum|pourquoi|por qu[ée]|لماذا).{0,24}(?:diffusion|diffusions|انتشار).{0,16}ood/i.test(text)) {
    return 'thesis_diffusion'
  }
  if (/\bk[- ]?ablation\b|monte carlo trials|inference (?:time|speed)|latency|ms per (?:image|sample)/i.test(text)) {
    return 'thesis_speed'
  }
  if (/\blimitations?\b|\bcaveats?\b|\bweakness(?:es)?\b/i.test(text)) return 'thesis_limits'
  if (/\bfull thesis\b|\bthesis (?:pdf|record)\b|\bread (?:the|his) thesis\b/i.test(text)) return 'thesis_read'
  if (/(?:innovation|separation loss|خسارة الفصل)/i.test(text)) return 'thesis_method'
  if (/\b(thesis|ood|out.?of.?distribution|cifar|auroc)\b|masterarbeit|mémoire|tesis|رسالة/i.test(text)) return 'thesis'
  if (
    /^\s*(?:his|the|a)?\s*(?:cv|r[eé]sum[eé])(?:\s+please)?\s*[?!. ]*$|\b(?:download|get|find|see|show|share|send|read|open|view|access|check|need|want|have|where(?:'s|\s+is)|link(?:\s+to)?|copy\s+of|his|public|pdf|son|télécharger|descargar|su|ver|obtener)\b[^.?!]{0,35}\b(?:cv|r[eé]sum[eé])\b|\b(?:cv|r[eé]sum[eé])\b[^.?!]{0,20}\b(?:link|pdf|file|download|url|please|available)\b|curr[ií]culum|lebenslauf|سير(?:ة|ته)\s*الذاتية/i.test(
      text
    )
  ) {
    return 'cv'
  }
  if (/front[- ]?desk|\bavatar\b|voice (?:call|demo)/i.test(text)) return 'frontdesk'
  if (/(contact|email|linkedin|reach|talk to|connect|تواصل)/i.test(text)) return 'contact'
  if (/work experience|where (?:has|did) (?:he|ahmed) work|worked at|berufserfahrung|exp[ée]riences? professionnelles?|experiencia laboral|الخبرة المهنية/i.test(text)) {
    return 'experience'
  }
  if (/\bblog\b|\barticles?\b|has (?:he|ahmed) written|did (?:he|ahmed) write|artikel|art[ií]culos|مقالات/i.test(text)) return 'writing'
  if (/(what roles|roles fit|welche rollen|quels r[oô]les|qu[eé] puestos|الأدوار الأنسب)/i.test(text)) return 'role_fit'
  if (/(open to work|available|hire|job|role|opportunit|وظائف)/i.test(text)) return 'open_to_work'
  if (/(tech stack|stack|tools|technolog)/i.test(text)) return 'tech_stack'
  if (/(achievement|accomplishment|highlights|best result|proof points)/i.test(text)) return 'achievements'
  if (/(background|education|mechatronics|ausbildung|parcours|trayectoria|خلفية)/i.test(text)) return 'background'
  if (/(projects|projekte|projets|proyectos|مشاريع|portfolio|github)/i.test(text)) return 'projects'
  return undefined
}

export function getLocalReply(question: string, lang: Language): string | null {
  const topic = findCuratedTopic(question) ?? inferReplyId(question)
  return topic ? translateValue(lang, LOCAL_REPLIES[topic]) : null
}

/** Answers after which the chat offers direct ways to reach Ahmed (CV, call, voice demo, email). */
const HANDOFF_TOPICS: ReadonlySet<ReplyId> = new Set<ReplyId>(['contact', 'cv', 'open_to_work', 'role_fit', 'frontdesk'])

/** Whether the answer to `question` gets the hand-off row under it. */
export function showsHandoff(question: string): boolean {
  const topic = findCuratedTopic(question) ?? inferReplyId(question)
  return topic !== undefined && HANDOFF_TOPICS.has(topic)
}

export const FOLLOWUP_PROMPTS: Partial<Record<ReplyId, PromptId[]>> = {
  projects: ['industrial_result', 'thesis_results', 'mergeproof_overview'],
  inspection: ['industrial_result', 'thesis_summary', 'projects_best'],
  industrial: ['industrial_pipeline', 'thesis_results', 'projects_best'],
  thesis: ['thesis_loss', 'thesis_why_diffusion', 'thesis_limits'],
  thesis_results: ['thesis_limits', 'thesis_loss', 'thesis_speed'],
  thesis_method: ['thesis_why_diffusion', 'thesis_results', 'thesis_speed'],
  thesis_datasets: ['thesis_results', 'thesis_limits', 'industrial_result'],
  thesis_diffusion: ['thesis_loss', 'thesis_speed', 'thesis_datasets'],
  thesis_speed: ['thesis_limits', 'thesis_results', 'thesis_read'],
  thesis_limits: ['thesis_read', 'industrial_result', 'thesis_speed'],
  thesis_read: ['thesis_results', 'writing', 'contact'],
  sihem_intro: ['sihem_tech', 'guardrails_post', 'contact'],
  sihem: ['sihem_overview', 'guardrails_post', 'contact'],
  mergeproof: ['guardrails_post', 'projects_best', 'tech_stack'],
  guardrails_post: ['mergeproof_overview', 'sihem_tech', 'writing'],
  writing: ['guardrails_post', 'thesis_read', 'profiles'],
  cv: ['experience', 'open_to_work', 'contact'],
  background: ['experience', 'projects_best', 'cv'],
  experience: ['background', 'hire_fit', 'cv'],
  open_to_work: ['hire_fit', 'cv', 'contact'],
  role_fit: ['experience', 'open_to_work', 'contact'],
  contact: ['frontdesk_demo', 'profiles', 'cv'],
  profiles: ['writing', 'cv', 'contact'],
  frontdesk: ['contact', 'profiles', 'projects_best'],
  tech_stack: ['projects_best', 'sihem_tech', 'profiles'],
  achievements: ['thesis_results', 'industrial_result', 'experience'],
}

export function getStarterPrompts(sectionOrPath: string): PromptId[] {
  const section = resolveSectionForPathname(sectionOrPath) ?? sectionOrPath
  if (section === 'inkjet') {
    return ['industrial_pipeline', 'industrial_result', 'thesis_results', 'projects_best']
  }
  if (section === 'sihem') {
    return ['sihem_overview', 'sihem_tech', 'guardrails_post', 'contact']
  }
  if (section === 'research' || section === 'ood-explorer') {
    return ['thesis_results', 'thesis_loss', 'thesis_datasets', 'industrial_result']
  }
  if (section === 'writing') {
    return ['guardrails_post', 'thesis_loss', 'industrial_pipeline', 'mergeproof_overview']
  }
  if (section === 'news') {
    return ['mergeproof_overview', 'sihem_overview', 'tech_stack', 'open_to_work']
  }
  if (section === 'projects' || section === 'evidence') {
    return ['projects_best', 'mergeproof_overview', 'sihem_overview', 'industrial_pipeline']
  }
  if (section === 'about' || section === 'experience') {
    return ['background', 'tech_stack', 'open_to_work', 'cv']
  }
  if (section === 'contact') {
    return ['contact', 'cv', 'open_to_work', 'hire_fit']
  }
  return STARTER_PROMPT_IDS
}

/** The prepared reply a question maps to, if any. */
function topicOfQuestion(question: string): ReplyId | undefined {
  const prompt = findPromptId(question)
  return prompt ? REPLY_FOR_PROMPT[prompt] : findCuratedTopic(question) ?? inferReplyId(question)
}

/**
 * Up to three suggested questions to show after a reply. Never suggests a question
 * the visitor already asked in this conversation (`earlierQuestions`), or one whose
 * prepared reply they have already been given. Topic follow-ups come first, then the
 * page's starter questions fill any gaps.
 */
export function pickFollowUpIds(
  reply: string,
  question: string,
  section: string,
  earlierQuestions: readonly string[] = []
): PromptId[] {
  const requested = findPromptId(question)
  const topic = requested ? REPLY_FOR_PROMPT[requested] : inferReplyId(question) ?? inferReplyId(reply)

  const asked = new Set<PromptId | undefined>([requested, ...earlierQuestions.map(findPromptId)])
  const answered = new Set<ReplyId | undefined>([topic, ...earlierQuestions.map(topicOfQuestion)])
  const candidates = new Set<PromptId>([
    ...((topic && FOLLOWUP_PROMPTS[topic]) || []),
    ...getStarterPrompts(section),
    ...STARTER_PROMPT_IDS,
  ])
  return [...candidates].filter((id) => !asked.has(id) && !answered.has(REPLY_FOR_PROMPT[id])).slice(0, 3)
}

export type ChatLane = 'fast' | 'deep'

const DEEP_PATTERN =
  /(?:^|[^\p{L}])(?:explain|compare|why|how (?:does|do|did|would)|walk me|deep dive|detailed|difference between|evaluate|critique|trade-?offs?|architecture|design decisions?|pros and cons|under the hood|summariz\p{L}*|break down|warum|wie funktionier\p{L}*|erkl[äa]r\p{L}*|vergleich\p{L}*|architektur|kompromiss\p{L}*|vor- und nachteile|zusammenfass\p{L}*|pourquoi|comment (?:\p{L}+ )?(?:fonctionn|march)\p{L}*|expliqu\p{L}*|compar\p{L}*|compromis|avantages et inconv[ée]nients|r[ée]sum\p{L}*|explic\p{L}*|por qu[ée]|c[oó]mo funciona|arquitectura|ventajas y desventajas|resum\p{L}*|كيف|لماذا|اشرح|قارن|معمارية|مقايضات|مزايا وعيوب|لخّ?ص|ملخص)(?!\p{L})/iu

export function routeLocally(message: string): ChatLane {
  return DEEP_PATTERN.test(message) ? 'deep' : 'fast'
}
