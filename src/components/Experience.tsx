'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 04 - Experience', de: '// 04 - Erfahrung', fr: '// 04 - Experience', es: '// 04 - Experiencia', ar: '// 04 - الخبرة' },
  title: { en: "Where I've worked.", de: 'Wo ich gearbeitet habe.', fr: 'Où j ai travaillé.', es: 'Donde he trabajado.', ar: 'أماكن عملي.' },
} satisfies Record<string, TranslationMap>

const experiences: Array<{
  date: string
  role: TranslationMap
  company: string
  desc: TranslationMap
  badge?: TranslationMap
  active: boolean
  last?: boolean
}> = [
  {
    date: 'Jul 2026\nPresent',
    role: { en: 'AI/ML Engineer', de: 'AI/ML-Engineer', fr: 'Ingénieur IA/ML', es: 'Ingeniero de IA/ML', ar: 'مهندس ذكاء اصطناعي وتعلم آلي' },
    company: 'Sihem · Linz, Austria',
    desc: {
      en: 'Building an LLM personal-mentor assistant on Supabase edge functions (Deno/TS) with pgvector RAG memory, multi-provider LLM routing with failover, and a deterministic decision engine for adaptive nudging.',
      de: 'Baue einen LLM-gestützten persönlichen Mentor-Assistenten auf Supabase Edge Functions (Deno/TS) mit pgvector-RAG-Gedächtnis, Multi-Provider-LLM-Routing mit Failover und einer deterministischen Entscheidungsmaschine für adaptives Nudging.',
      fr: "Construction d'un assistant-mentor personnel fondé sur les LLM, sur Supabase edge functions (Deno/TS), avec mémoire RAG pgvector, routage LLM multi-fournisseurs avec failover et un moteur de décision déterministe pour le nudging adaptatif.",
      es: 'Desarrollo de un asistente-mentor personal basado en LLM sobre Supabase edge functions (Deno/TS), con memoria RAG pgvector, enrutamiento LLM multiproveedor con failover y un motor de decisión determinista para nudging adaptativo.',
      ar: 'أبني مساعداً ومرشداً شخصياً قائماً على نماذج اللغة عبر Supabase edge functions (Deno/TS)، مع ذاكرة pgvector للاسترجاع المعزز، وتوجيه LLM متعدد المزودين مع تبديل تلقائي، ومحرك قرار حتمي للتنبيه التكيّفي.',
    },
    badge: { en: 'Live beta - @sihem_ai_bot', de: 'Live-Beta - @sihem_ai_bot', fr: 'Bêta en ligne - @sihem_ai_bot', es: 'Beta en vivo - @sihem_ai_bot', ar: 'نسخة تجريبية - @sihem_ai_bot' },
    active: true,
  },
  {
    date: 'Jul 2025\nJul 2026',
    role: { en: 'AI/ML & Full-Stack Engineer', de: 'AI/ML- & Full-Stack-Engineer', fr: 'Ingénieur IA/ML & full-stack', es: 'Ingeniero de IA/ML y full-stack', ar: 'مهندس ذكاء اصطناعي وتطوير متكامل' },
    company: 'Faultrix · Linz, Austria',
    desc: {
      en: 'Built an AI construction analysis platform solo from zero to production with Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, and Stripe.',
      de: 'Baute allein eine KI-Plattform für Bauanalyse von null bis Produktion mit Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 und Stripe.',
      fr: 'Création solo d une plateforme IA d analyse construction, de zéro à la production, avec Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 et Stripe.',
      es: 'Construyo solo una plataforma de análisis de construcción con IA, de cero a producción, usando Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 y Stripe.',
      ar: 'بنيت منفرداً منصة ذكاء اصطناعي لتحليل البناء من الصفر إلى الإنتاج باستخدام Python وNext.js وConvex وOpenAI API وDocker وStripe.',
    },
    badge: { en: 'Shipped - faultrix.com', de: 'Ausgeliefert - faultrix.com', fr: 'Livré - faultrix.com', es: 'Entregado - faultrix.com', ar: 'تم إطلاقه - faultrix.com' },
    active: false,
  },
  {
    date: 'Dec 2024\nJul 2026',
    role: { en: 'ML Researcher', de: 'ML-Forscher', fr: 'Chercheur ML', es: 'Investigador ML', ar: 'باحث تعلم آلي' },
    company: 'JKU Machine Learning Institute · Linz',
    desc: {
      en: 'Master thesis on conditional diffusion models as generative classifiers for out-of-distribution detection under Prof. Sepp Hochreiter.',
      de: 'Masterarbeit über konditionale Diffusionsmodelle als generative Klassifikatoren für OOD-Erkennung unter Prof. Sepp Hochreiter.',
      fr: 'Mémoire sur les modèles de diffusion conditionnels comme classificateurs génératifs pour la détection OOD sous Prof. Sepp Hochreiter.',
      es: 'Tesis sobre modelos de difusión condicional como clasificadores generativos para detección OOD bajo Prof. Sepp Hochreiter.',
      ar: 'رسالة ماجستير عن نماذج الانتشار الشرطية كمصنفات توليدية لكشف الخارج عن التوزيع بإشراف البروفيسور سيب هوخرايتر.',
    },
    active: true,
  },
  {
    date: 'Apr 2024\nNov 2024',
    role: { en: 'Machine Vision Researcher', de: 'Machine-Vision-Forscher', fr: 'Chercheur en vision industrielle', es: 'Investigador de visión artificial', ar: 'باحث رؤية حاسوبية' },
    company: 'PROFACTOR GmbH · Steyr, Austria',
    desc: {
      en: 'YOLO + diffusion pipeline for industrial defect detection in zero-defect inkjet printing on building components.',
      de: 'YOLO + Diffusionspipeline für industrielle Defekterkennung im Zero-Defect-Inkjetdruck auf Bauteilen.',
      fr: "Pipeline YOLO + diffusion pour détection de défauts industriels dans l'impression inkjet zero-défaut.",
      es: 'Pipeline YOLO + difusión para detección industrial de defectos en impresión inkjet de cero defectos.',
      ar: 'خط معالجة YOLO مع الانتشار لكشف العيوب الصناعية في طباعة inkjet بدون عيوب على مكونات البناء.',
    },
    badge: { en: '98.4% (threshold-dep., production)', de: '98.4% (threshold-abh., Produktion)', fr: '98.4% (seuil, production)', es: '98.4% (umbral, producción)', ar: '98.4% (عتبة تشغيل، إنتاج)' },
    active: false,
  },
  {
    date: 'Aug 2023\nOct 2023',
    role: { en: 'AI Research Intern', de: 'KI-Forschungspraktikant', fr: 'Stagiaire recherche IA', es: 'Practicante de investigación IA', ar: 'متدرب بحث ذكاء اصطناعي' },
    company: 'Karunya University · India (Remote)',
    desc: {
      en: 'RNN/CNN architectures for EEG motor imagery classification with hyperparameter optimization.',
      de: 'RNN/CNN-Architekturen für EEG-Motor-Imagery-Klassifikation mit Hyperparameteroptimierung.',
      fr: 'Architectures RNN/CNN pour classification EEG d imagerie motrice avec optimisation des hyperparamètres.',
      es: 'Arquitecturas RNN/CNN para clasificación EEG de imaginación motora con optimización de hiperparámetros.',
      ar: 'معماريات RNN/CNN لتصنيف EEG للتخيل الحركي مع تحسين المعاملات.',
    },
    active: false,
  },
  {
    date: 'Jan 2021\nPresent',
    role: { en: 'AI & Programming Tutor', de: 'KI- & Programmier-Tutor', fr: 'Tuteur IA & programmation', es: 'Tutor de IA y programación', ar: 'مدرب ذكاء اصطناعي وبرمجة' },
    company: 'Freelance',
    desc: {
      en: 'Tailored training in Python, ML, and deep learning, plus mentoring on portfolio projects and GitHub practice.',
      de: 'Individuelles Training in Python, ML und Deep Learning sowie Mentoring für Portfolio-Projekte und GitHub-Praxis.',
      fr: 'Formation personnalisée en Python, ML et deep learning, avec mentorat projets portfolio et GitHub.',
      es: 'Formación personalizada en Python, ML y deep learning, con mentorías de proyectos y GitHub.',
      ar: 'تدريب مخصص في Python والتعلم الآلي والعميق، مع إرشاد لمشاريع البورتفوليو وممارسات GitHub.',
    },
    active: true,
    last: true,
  },
]

export default function Experience() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="experience" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 48 }}>{t(copy.title)}</h2>

        <div className="cd-timeline">
          {experiences.map((exp, i) => (
            <div key={i} className="cd-tl-item reveal">
              <div className="cd-tl-date" style={{ whiteSpace: 'pre-line' }}>{exp.date}</div>
              <div className="cd-tl-spine">
                <div className={`cd-tl-dot${exp.active ? '' : ' dim'}`} />
                {!exp.last && <div className="cd-tl-line" />}
              </div>
              <div className="cd-tl-content">
                <div className="cd-tl-role">{t(exp.role)}</div>
                <div className="cd-tl-company">{exp.company}</div>
                <div className="cd-tl-desc">{t(exp.desc)}</div>
                {exp.badge && <div className="cd-tl-badge">{t(exp.badge)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
