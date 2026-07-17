'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 04 - Experience', de: '// 04 - Erfahrung', fr: '// 04 - Experience', es: '// 04 - Experiencia', ar: '// 04 - الخبرة' },
  title: { en: "Where I've worked.", de: 'Wo ich gearbeitet habe.', fr: 'Ou j ai travaille.', es: 'Donde he trabajado.', ar: 'أماكن عملي.' },
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
    date: 'Jul 2025\nPresent',
    role: { en: 'Founder & Full-Stack Developer', de: 'Grunder & Full-Stack Developer', fr: 'Fondateur & developpeur full-stack', es: 'Fundador y desarrollador full-stack', ar: 'المؤسس ومطور متكامل' },
    company: 'Faultrix · Linz, Austria',
    desc: {
      en: 'Built an AI construction analysis platform solo from zero to production with Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, and Stripe.',
      de: 'Baute allein eine KI-Plattform fur Bauanalyse von null bis Produktion mit Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 und Stripe.',
      fr: 'Creation solo d une plateforme IA d analyse construction, de zero a la production, avec Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 et Stripe.',
      es: 'Construyo solo una plataforma de analisis de construccion con IA, de cero a produccion, usando Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2 y Stripe.',
      ar: 'بنيت منفرداً منصة ذكاء اصطناعي لتحليل البناء من الصفر إلى الإنتاج باستخدام Python وNext.js وConvex وOpenAI API وDocker وStripe.',
    },
    badge: { en: 'Active - faultrix.com', de: 'Aktiv - faultrix.com', fr: 'Actif - faultrix.com', es: 'Activo - faultrix.com', ar: 'نشط - faultrix.com' },
    active: true,
  },
  {
    date: 'Dec 2024\nJul 2026',
    role: { en: 'ML Researcher', de: 'ML-Forscher', fr: 'Chercheur ML', es: 'Investigador ML', ar: 'باحث تعلم آلي' },
    company: 'JKU Machine Learning Institute · Linz',
    desc: {
      en: 'Master thesis on conditional diffusion models as generative classifiers for out-of-distribution detection under Prof. Sepp Hochreiter.',
      de: 'Masterarbeit uber konditionale Diffusionsmodelle als generative Klassifikatoren fur OOD-Erkennung unter Prof. Sepp Hochreiter.',
      fr: 'Memoire sur les modeles de diffusion conditionnels comme classificateurs generatifs pour la detection OOD sous Prof. Sepp Hochreiter.',
      es: 'Tesis sobre modelos de difusion condicional como clasificadores generativos para deteccion OOD bajo Prof. Sepp Hochreiter.',
      ar: 'رسالة ماجستير عن نماذج الانتشار الشرطية كمصنفات توليدية لكشف الخارج عن التوزيع بإشراف البروفيسور سيب هوخرايتر.',
    },
    active: true,
  },
  {
    date: 'Apr 2024\nNov 2024',
    role: { en: 'Machine Vision Researcher', de: 'Machine-Vision-Forscher', fr: 'Chercheur en vision industrielle', es: 'Investigador de vision artificial', ar: 'باحث رؤية حاسوبية' },
    company: 'PROFACTOR GmbH · Steyr, Austria',
    desc: {
      en: 'YOLO + diffusion pipeline for industrial defect detection in zero-defect inkjet printing on building components.',
      de: 'YOLO + Diffusionspipeline fur industrielle Defekterkennung im Zero-Defect-Inkjetdruck auf Bauteilen.',
      fr: 'Pipeline YOLO + diffusion pour detection de defauts industriels dans l impression inkjet zero-defaut.',
      es: 'Pipeline YOLO + difusion para deteccion industrial de defectos en impresion inkjet de cero defectos.',
      ar: 'خط معالجة YOLO مع الانتشار لكشف العيوب الصناعية في طباعة inkjet بدون عيوب على مكونات البناء.',
    },
    badge: { en: '98.4% (threshold-dep., production)', de: '98.4% (threshold-abh., Produktion)', fr: '98.4% (seuil, production)', es: '98.4% (umbral, produccion)', ar: '98.4% (عتبة تشغيل، إنتاج)' },
    active: false,
  },
  {
    date: 'Aug 2023\nOct 2023',
    role: { en: 'AI Research Intern', de: 'KI-Forschungspraktikant', fr: 'Stagiaire recherche IA', es: 'Practicante de investigacion IA', ar: 'متدرب بحث ذكاء اصطناعي' },
    company: 'Karunya University · India (Remote)',
    desc: {
      en: 'RNN/CNN architectures for EEG motor imagery classification with hyperparameter optimization.',
      de: 'RNN/CNN-Architekturen fur EEG-Motor-Imagery-Klassifikation mit Hyperparameteroptimierung.',
      fr: 'Architectures RNN/CNN pour classification EEG d imagerie motrice avec optimisation des hyperparametres.',
      es: 'Arquitecturas RNN/CNN para clasificacion EEG de imaginacion motora con optimizacion de hiperparametros.',
      ar: 'معماريات RNN/CNN لتصنيف EEG للتخيل الحركي مع تحسين المعاملات.',
    },
    active: false,
  },
  {
    date: 'Jan 2021\nPresent',
    role: { en: 'AI & Programming Tutor', de: 'KI- & Programmier-Tutor', fr: 'Tuteur IA & programmation', es: 'Tutor de IA y programacion', ar: 'مدرب ذكاء اصطناعي وبرمجة' },
    company: 'Freelance',
    desc: {
      en: 'Tailored training in Python, ML, and deep learning, plus mentoring on portfolio projects and GitHub practice.',
      de: 'Individuelles Training in Python, ML und Deep Learning sowie Mentoring fur Portfolio-Projekte und GitHub-Praxis.',
      fr: 'Formation personnalisee en Python, ML et deep learning, avec mentorat projets portfolio et GitHub.',
      es: 'Formacion personalizada en Python, ML y deep learning, con mentorias de proyectos y GitHub.',
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
