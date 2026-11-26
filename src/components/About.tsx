'use client'
import Image from 'next/image'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  eyebrow: { en: '// About', de: '// Profil', fr: '// Profil', es: '// Perfil', ar: '// نبذة' },
  title: {
    en: 'AI/ML Engineer - research that ships.',
    de: 'AI/ML Engineer - Forschung, die produktiv wird.',
    fr: 'Ingénieur IA/ML - recherche qui devient produit.',
    es: 'Ingeniero IA/ML - investigación que llega a producción.',
    ar: 'مهندس ذكاء اصطناعي - بحث يتحول إلى منتج.',
  },
  p1: {
    en: 'I am an AI/ML engineer who holds an M.Sc. in Artificial Intelligence from JKU Linz (graduated September 2026; Defensio 25 Sep 2026), supervised by Prof. Sepp Hochreiter. My thesis was graded 1, the top mark.',
    de: 'Ich bin AI/ML Engineer und habe mein M.Sc.-Studium in Artificial Intelligence an der JKU Linz abgeschlossen (Abschluss September 2026; Defensio am 25. September 2026), betreut von Prof. Sepp Hochreiter. Meine Masterarbeit wurde mit 1 (Sehr gut) bewertet.',
    fr: "Je suis ingénieur IA/ML et j'ai obtenu un M.Sc. en intelligence artificielle à JKU Linz (diplômé en septembre 2026; Defensio le 25 septembre 2026), sous la supervision du Prof. Sepp Hochreiter. Mon mémoire a obtenu la note 1, la meilleure note.",
    es: 'Soy ingeniero de IA/ML y completé un M.Sc. en Inteligencia Artificial en JKU Linz (graduado en septiembre de 2026; Defensio el 25 de septiembre de 2026), bajo la supervisión del Prof. Sepp Hochreiter. Mi tesis obtuvo un 1, la nota máxima.',
    ar: 'أنا مهندس ذكاء اصطناعي وتعلم آلي، وحاصل على درجة الماجستير في الذكاء الاصطناعي من JKU Linz (تخرجت في 25 سبتمبر 2026) تحت إشراف البروفيسور سيب هوخرايتر، وحصلت رسالتي على تقدير 1، وهو أعلى درجة.',
  },
  p2: {
    en: 'My work spans the full stack: from class-conditional separation loss for diffusion-based OOD detection to industrial computer vision pipelines evaluated under rigorous cross-validation. I also ship LLM products and the deterministic tooling that keeps AI coding agents honest.',
    de: 'Meine Arbeit umfasst den gesamten Stack: von class-conditional separation loss für diffusionsbasierte OOD-Erkennung bis zu industriellen Computer-Vision-Pipelines mit strenger Kreuzvalidierung. Daneben liefere ich LLM-Produkte und deterministisches Tooling, das KI-Coding-Agenten ehrlich hält.',
    fr: "Mon travail couvre toute la chaîne : de la separation loss conditionnelle pour la détection OOD par diffusion aux pipelines de vision industrielle validés rigoureusement. Je livre aussi des produits LLM et un outillage déterministe qui garde les agents de code honnêtes.",
    es: 'Mi trabajo cubre todo el stack: desde separation loss condicional para detección OOD con difusión hasta pipelines industriales de visión por computador evaluados rigurosamente. También lanzo productos LLM y herramientas deterministas que mantienen honestos a los agentes de código.',
    ar: 'يمتد عملي عبر كامل السلسلة: من خسارة الفصل الشرطية لكشف الخارج عن التوزيع بنماذج الانتشار إلى خطوط رؤية حاسوبية صناعية بتقييم صارم. كما أُطلق منتجات نماذج لغة وأدوات حتمية تُبقي وكلاء البرمجة على المسار الصحيح.',
  },
  p3: {
    en: 'Outside research, I build and ship reliable software — including Sihem, a proactive LLM personal-mentor side project accepted into the tech2b incubator, alongside deterministic tooling such as mergeproof. Supporting work in production taught me that operational reliability is its own kind of rigor.',
    de: 'Abseits der Forschung entwickle und betreibe ich zuverlässige Software — darunter Sihem, ein proaktives LLM-Mentor-Nebenprojekt im tech2b-Inkubator, sowie deterministisches Tooling wie mergeproof. Produktive Systeme haben mir gezeigt, dass Betriebszuverlässigkeit eine eigene Form von Sorgfalt ist.',
    fr: "En parallèle de la recherche, je conçois et déploie des systèmes fiables — notamment Sihem, un projet personnel de mentor IA proactif accepté dans l'incubateur tech2b, ainsi que des outils déterministes comme mergeproof. Porter un système en production demande une rigueur complémentaire à celle du laboratoire.",
    es: 'Además de la investigación, construyo y pongo en producción software fiable, incluido Sihem, un proyecto personal de mentor proactivo basado en LLM aceptado en la incubadora tech2b, junto con herramientas deterministas como mergeproof. Llevar sistemas a producción exige su propio tipo de rigor.',
    ar: 'وإلى جانب البحث، أبني وأُطلق برمجيات موثوقة — بما في ذلك Sihem، وهو مشروع جانبي لمساعد ومرشد شخصي استباقي قائم على نماذج اللغة قُبل في حاضنة tech2b، إلى جانب أدوات حتمية مثل mergeproof. وقد علمني تشغيل الأنظمة في الإنتاج أن الموثوقية التشغيلية نوع مستقل من الدقة.',
  },
  path: {
    en: 'Transitioned from mechatronics engineering to AI/ML - bringing a hardware and systems perspective to computer vision and production ML.',
    de: 'Übergang von Mechatronik zu AI/ML - mit Hardware- und Systemperspektive auf Computer Vision und produktionstaugliches ML.',
    fr: "Transition de l'ingénierie mécatronique vers l'AI/ML - apportant une perspective hardware et systèmes à la vision par ordinateur et au ML en production.",
    es: 'Transición de la ingeniería mecatrónica a la IA/ML - aportando una perspectiva de hardware y sistemas a la visión por computadora y al ML en producción.',
    ar: 'انتقلت من هندسة الميكاترونكس إلى الذكاء الاصطناعي وتعلم الآلة — جالبًا معي منظور الأنظمة والأجهزة إلى الرؤية الحاسوبية وتعلم الآلة في الإنتاج.',
  },
  education: { en: 'Education', de: 'Ausbildung', fr: 'Formation', es: 'Educación', ar: 'التعليم' },
  skills: { en: 'Skills & Stack', de: 'Skills & Stack', fr: 'Compétences & stack', es: 'Habilidades y stack', ar: 'المهارات والتقنيات' },
  languages: { en: 'Languages', de: 'Sprachen', fr: 'Langues', es: 'Idiomas', ar: 'اللغات' },
  location: { en: 'Location', de: 'Standort', fr: 'Lieu', es: 'Ubicación', ar: 'الموقع' },
  locationValue: { en: 'Linz, Austria', de: 'Linz, Österreich', fr: 'Linz, Autriche', es: 'Linz, Austria', ar: 'لينتس، النمسا' },
  workAuth: { en: 'Work permit', de: 'Arbeitserlaubnis', fr: 'Permis de travail', es: 'Permiso de trabajo', ar: 'تصريح العمل' },
  workAuthValue: {
    en: 'Eligible for Rot-Weiß-Rot Karte für Studienabsolventen (Austria — no labour-market test)',
    de: 'Berechtigt für Rot-Weiß-Rot-Karte für Studienabsolventen (Österreich – ohne Arbeitsmarktprüfung)',
    fr: 'Éligible à la Rot-Weiß-Rot Karte für Studienabsolventen (Autriche — sans test du marché du travail)',
    es: 'Elegible para la Rot-Weiß-Rot Karte für Studienabsolventen (Austria — sin prueba del mercado laboral)',
    ar: 'مؤهل لبطاقة Rot-Weiß-Rot Karte für Studienabsolventen (النمسا — دون اختبار سوق العمل)',
  },
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  current: { en: 'Current work', de: 'Aktuell', fr: 'Travail actuel', es: 'Trabajo actual', ar: 'العمل الحالي' },
  openTo: { en: 'Open to', de: 'Offen für', fr: 'Ouvert à', es: 'Abierto a', ar: 'متاح لـ' },
  roles: { en: 'AI/ML Roles - Research Collaborations', de: 'AI/ML-Rollen - Forschungskooperationen', fr: 'Rôles IA/ML - collaborations recherche', es: 'Roles IA/ML - colaboraciones de investigación', ar: 'أدوار الذكاء الاصطناعي - تعاونات بحثية' },
  currentWork: { en: 'Sihem — LLM side project (tech2b incubator)', de: 'Sihem — LLM-Nebenprojekt (tech2b-Inkubator)', fr: 'Sihem — projet LLM personnel (incubateur tech2b)', es: 'Sihem — proyecto LLM personal (incubadora tech2b)', ar: 'Sihem — مشروع LLM جانبي (حاضنة tech2b)' },
  degree1: { en: 'M.Sc. in Artificial Intelligence', de: 'M.Sc. Artificial Intelligence', fr: 'M.Sc. en intelligence artificielle', es: 'M.Sc. en Inteligencia Artificial', ar: 'ماجستير في الذكاء الاصطناعي' },
  school1: { en: 'Johannes Kepler University Linz', de: 'Johannes Kepler Universität Linz', fr: 'Université Johannes Kepler de Linz', es: 'Universidad Johannes Kepler de Linz', ar: 'جامعة يوهانس كيبلر لينتس' },
  degree2: { en: 'B.Sc. in Mechatronics Engineering', de: 'B.Sc. Mechatronik', fr: 'B.Sc. en génie mécatronique', es: 'B.Sc. en Ingeniería Mecatrónica', ar: 'بكالوريوس في هندسة الميكاترونكس' },
  school2: {
    en: 'Eastern Mediterranean University, Famagusta, Cyprus',
    de: 'Eastern Mediterranean University, Famagusta, Zypern',
    fr: 'Eastern Mediterranean University, Famagouste, Chypre',
    es: 'Eastern Mediterranean University, Famagusta, Chipre',
    ar: 'جامعة شرق البحر المتوسط، فاماغوستا، قبرص',
  },
  desc1: { en: 'Thesis (grade 1): using diffusion models to detect unfamiliar images.', de: 'Masterarbeit (Note 1): Erkennung unbekannter Bilder mit Diffusionsmodellen.', fr: 'Mémoire (note 1) : détecter les images inconnues à l’aide de modèles de diffusion.', es: 'Tesis (nota 1): detección de imágenes desconocidas con modelos de difusión.', ar: 'الرسالة (تقدير 1): كشف الصور غير المألوفة باستخدام نماذج الانتشار.' },
  mastersDates: { en: 'Oct 2020 to Sep 2026', de: 'Okt. 2020 bis Sept. 2026', fr: 'Oct. 2020 à sept. 2026', es: 'Oct. 2020 a sept. 2026', ar: 'أكتوبر 2020 إلى سبتمبر 2026' },
  bachelorsDates: { en: 'Feb 2015 to Jan 2018', de: 'Feb. 2015 bis Jan. 2018', fr: 'Févr. 2015 à janv. 2018', es: 'Feb. 2015 a ene. 2018', ar: 'فبراير 2015 إلى يناير 2018' },
  desc2: {
    en: 'Capstone project (grade: Excellent): SCARA robot for tracking moving objects.',
    de: 'Abschlussprojekt (Note: Excellent): SCARA-Roboter zur Verfolgung bewegter Objekte.',
    fr: 'Projet de fin d’études (note : Excellent) : robot SCARA pour le suivi d’objets en mouvement.',
    es: 'Proyecto de fin de grado (calificación: Excelente): robot SCARA para el seguimiento de objetos en movimiento.',
    ar: 'مشروع التخرج (التقدير: ممتاز): روبوت SCARA لتتبّع الأجسام المتحركة.',
  },
} satisfies Record<string, TranslationMap>

const skillCategories: { title: TranslationMap; skills: (string | TranslationMap)[] }[] = [
  {
    title: {
      en: 'Deep Learning & CV',
      de: 'Deep Learning & Computer Vision',
      fr: 'Deep Learning & Vision par ordinateur',
      es: 'Deep Learning y Visión por Computador',
      ar: 'التعلم العميق والرؤية الحاسوبية',
    },
    skills: ['Python', 'PyTorch', { en: "Diffusion Models (DDPM, UNet)", de: "Diffusionsmodelle (DDPM, UNet)", fr: "Modèles de diffusion (DDPM, UNet)", es: "Modelos de difusión (DDPM, UNet)", ar: "نماذج الانتشار (DDPM, UNet)" }, { en: "OOD Detection", de: "OOD-Erkennung", fr: "Détection OOD", es: "Detección OOD", ar: "كشف OOD" }, 'YOLOv8', { en: "Defect Inspection", de: "Fehlerprüfung", fr: "Inspection des défauts", es: "Inspección de defectos", ar: "فحص العيوب" }],
  },
  {
    title: {
      en: 'GenAI & Agentic AI',
      de: 'Generative & Agentische KI',
      fr: 'IA générative & agentique',
      es: 'IA generativa y agéntica',
      ar: 'الذكاء الاصطناعي التوليدي والوكيلي',
    },
    skills: [{ en: "LLM API Integration", de: "LLM-API-Integration", fr: "Intégration d’API LLM", es: "Integración de API LLM", ar: "تكامل واجهات LLM" }, { en: "Multi-Provider Routing & Failover", de: "Routing und Ausfallsicherung über mehrere Anbieter", fr: "Routage et basculement entre fournisseurs", es: "Enrutamiento y conmutación entre proveedores", ar: "التوجيه بين مزودين متعددين وتجاوز الأعطال" }, { en: "pgvector Retrieval", de: "Abruf mit pgvector", fr: "Recherche avec pgvector", es: "Recuperación con pgvector", ar: "الاسترجاع باستخدام pgvector" }],
  },
  {
    title: {
      en: 'ML & Data Science',
      de: 'ML & Data Science',
      fr: 'ML & Science des données',
      es: 'ML y Ciencia de Datos',
      ar: 'تعلم الآلة وعلوم البيانات',
    },
    skills: [{ en: "Ablation Studies", de: "Ablationsstudien", fr: "Études d’ablation", es: "Estudios de ablación", ar: "دراسات الاستئصال" }, { en: "Cross-Validation", de: "Kreuzvalidierung", fr: "Validation croisée", es: "Validación cruzada", ar: "التحقق المتقاطع" }],
  },
  {
    title: {
      en: 'Deployment & MLOps',
      de: 'Deployment & MLOps',
      fr: 'Déploiement & MLOps',
      es: 'Despliegue y MLOps',
      ar: 'النشر وعمليات تعلم الآلة (MLOps)',
    },
    skills: ['Docker', { en: "GitHub Actions CI/CD", de: "CI/CD mit GitHub Actions", fr: "CI/CD avec GitHub Actions", es: "CI/CD con GitHub Actions", ar: "التكامل والتسليم المستمران باستخدام GitHub Actions" }, 'Supabase', 'TypeScript', 'React'],
  },
  {
    title: {
      en: 'Agent Tooling',
      de: 'Agent-Tooling',
      fr: 'Outillage pour agents',
      es: 'Herramientas para agentes',
      ar: 'أدوات الوكلاء',
    },
    skills: ['mergeproof', { en: "Deterministic checks", de: "Deterministische Prüfungen", fr: "Vérifications déterministes", es: "Comprobaciones deterministas", ar: "فحوصات حتمية" }],
  },

]

export default function About() {
  const { t } = useI18n()

  const education = [
    { degree: t(copy.degree1), school: t(copy.school1), date: t(copy.mastersDates), desc: t(copy.desc1) },
    { degree: t(copy.degree2), school: t(copy.school2), date: t(copy.bachelorsDates), desc: t(copy.desc2) },
  ]

  const infoRows = [
    { label: t(copy.location), value: t(copy.locationValue), accent: false },
    { label: t(copy.workAuth), value: t(copy.workAuthValue), accent: false },
    { label: t(copy.supervisor), value: 'Prof. Sepp Hochreiter', accent: false },
    { label: t(copy.current), value: t(copy.currentWork), accent: true },
    { label: t(copy.openTo), value: t(copy.roles), accent: false },
  ]

  const languages: { name: TranslationMap; level: string }[] = [
    {
      name: { en: 'Arabic', de: 'Arabisch', fr: 'Arabe', es: 'Árabe', ar: 'العربية' },
      level: t({ en: 'Native', de: 'Muttersprache', fr: 'Natif', es: 'Nativo', ar: 'اللغة الأم' }),
    },
    {
      name: { en: 'English', de: 'Englisch', fr: 'Anglais', es: 'Inglés', ar: 'الإنجليزية' },
      level: t({ en: 'Professional working proficiency', de: 'Verhandlungssicher im Beruf', fr: 'Maîtrise professionnelle', es: 'Competencia profesional', ar: 'إتقان مهني' }),
    },
    {
      name: { en: 'German', de: 'Deutsch', fr: 'Allemand', es: 'Alemán', ar: 'الألمانية' },
      level: t({ en: 'B1 CEFR - preparing for B2', de: 'B1 CEFR - Vorbereitung auf B2', fr: 'B1 CEFR - préparation au B2', es: 'B1 CEFR - preparando el B2', ar: 'B1 CEFR - أستعد لمستوى B2' }),
    },
  ]

  return (
    <section id="about" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <div className="cd-about-bio-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
              <Image
                src="/headshot.jpg"
                alt="Ahmed Mohammed"
                width={120}
                height={120}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid var(--cd-b1)`,
                  boxShadow: '0 0 24px var(--cd-accent-dim)',
                  flexShrink: 0,
                }}
              />
              <h2 className="cd-section-title" style={{ marginBottom: 0 }}>{t(copy.title)}</h2>
            </div>
            <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 20 }}>{t(copy.path)}</p>
            <div className="cd-about-text" data-speakable>
              <p>{t(copy.p1)}</p>
              <p>{t(copy.p2)}</p>
              <p>{t(copy.p3)}</p>
            </div>
          </div>

          <div className="cd-about-side">
            {infoRows.map(row => (
              <div key={row.label} className="cd-info-row">
                <div className="cd-info-label">{row.label}</div>
                <div className={`cd-info-val${row.accent ? ' accent' : ''}`}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band">
          <div className="cd-band-eyebrow">{t(copy.education)}</div>
          <div className="cd-education-grid">
            {education.map(edu => (
              <div key={edu.degree} className="cd-education-card">
                <div className="cd-edu-header">
                  <div className="cd-edu-degree">{edu.degree}</div>
                  <div className="cd-edu-date">{edu.date}</div>
                </div>
                <div className="cd-edu-institution">{edu.school}</div>
                <div className="cd-edu-description">{edu.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band">
          <div className="cd-band-eyebrow">{t(copy.skills)}</div>
          <div className="cd-skills-grid">
            {skillCategories.map((cat, i) => (
              <div key={cat.title.en} className="cd-skill-category" style={i === skillCategories.length - 1 ? { gridColumn: '1 / -1' } : undefined}>
                <div className="cd-skill-cat-name">{t(cat.title)}</div>
                <div className="cd-chips" style={{ marginTop: 0 }}>
                  {cat.skills.map(skill => <span key={typeof skill === 'string' ? skill : skill.en} className="cd-chip">{typeof skill === 'string' ? skill : t(skill)}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band">
          <div className="cd-band-eyebrow">{t(copy.languages)}</div>
          <div className="cd-lang-row">
            {languages.map(lang => (
              <div key={lang.name.en} className="cd-lang-card">
                <div className="cd-lang-name">{t(lang.name)}</div>
                <div className="cd-lang-level">{lang.level}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
