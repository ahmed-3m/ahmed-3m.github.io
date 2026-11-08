'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 01 - About', de: '// 01 - Profil', fr: '// 01 - Profil', es: '// 01 - Perfil', ar: '// 01 - نبذة' },
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
    en: 'I also build and ship — most recently Sihem, an LLM personal-mentor side project accepted into the tech2b incubator, and before that Faultrix, an AI quality-control platform I took from zero to production on my own. Both taught me that production reliability is its own kind of rigor.',
    de: 'Ich baue und liefere auch aus — zuletzt Sihem, ein LLM-gestütztes Mentor-Nebenprojekt, das in den tech2b-Inkubator aufgenommen wurde, davor Faultrix, eine KI-Plattform für Qualitätskontrolle, die ich allein von null bis in die Produktion gebracht habe. Beides hat mich gelehrt, dass Zuverlässigkeit im Betrieb eine eigene Form von Sorgfalt ist.',
    fr: "Je construis et je livre aussi — récemment Sihem, un projet personnel d'assistant-mentor fondé sur les LLM, accepté dans l'incubateur tech2b, et avant cela Faultrix, une plateforme IA de contrôle qualité que j'ai menée seul de zéro à la production. Les deux m'ont appris que la fiabilité en production est une rigueur à part entière.",
    es: 'También construyo y publico: hace poco Sihem, un proyecto personal de asistente-mentor basado en LLM aceptado en la incubadora tech2b, y antes Faultrix, una plataforma de control de calidad con IA que llevé yo solo de cero a producción. Ambos me enseñaron que la fiabilidad en producción es su propio tipo de rigor.',
    ar: 'أبني وأُطلق أيضًا — مؤخرًا Sihem، مشروع جانبي لمساعد ومرشد شخصي قائم على نماذج اللغة قُبل في حاضنة tech2b، وقبله Faultrix، منصة ذكاء اصطناعي لضبط الجودة نقلتها بمفردي من الصفر إلى الإنتاج. علّمني كلاهما أن الموثوقية في الإنتاج نوع خاص من الدقة.',
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
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  current: { en: 'Current work', de: 'Aktuell', fr: 'Travail actuel', es: 'Trabajo actual', ar: 'العمل الحالي' },
  openTo: { en: 'Open to', de: 'Offen für', fr: 'Ouvert à', es: 'Abierto a', ar: 'متاح لـ' },
  roles: { en: 'AI/ML Roles - Research Collaborations', de: 'AI/ML-Rollen - Forschungskooperationen', fr: 'Rôles IA/ML - collaborations recherche', es: 'Roles IA/ML - colaboraciones de investigación', ar: 'أدوار الذكاء الاصطناعي - تعاونات بحثية' },
  currentWork: { en: 'Sihem — LLM side project (tech2b incubator)', de: 'Sihem — LLM-Nebenprojekt (tech2b-Inkubator)', fr: 'Sihem — projet LLM personnel (incubateur tech2b)', es: 'Sihem — proyecto LLM personal (incubadora tech2b)', ar: 'Sihem — مشروع LLM جانبي (حاضنة tech2b)' },
  degree1: { en: 'M.Sc. in Artificial Intelligence', de: 'M.Sc. Artificial Intelligence', fr: 'M.Sc. en intelligence artificielle', es: 'M.Sc. en Inteligencia Artificial', ar: 'ماجستير في الذكاء الاصطناعي' },
  degree2: { en: 'B.Sc. in Mechatronics Engineering', de: 'B.Sc. Mechatronik', fr: 'B.Sc. en génie mécatronique', es: 'B.Sc. en Ingeniería Mecatrónica', ar: 'بكالوريوس في هندسة الميكاترونكس' },
  desc1: { en: 'Thesis (graded 1): conditional diffusion models for OOD detection - 99.03% +/- 0.07% average AUROC (binary airplane-vs-rest, 3-seed mean).', de: 'Masterarbeit (Note 1): konditionale Diffusionsmodelle für OOD-Erkennung – 99.03% +/- 0.07% AUROC (binär airplane-vs-rest, 3-Seed-Mittel).', fr: 'Mémoire (note 1) : modèles de diffusion conditionnels pour détection OOD – 99.03% +/- 0.07% AUROC (binaire airplane-vs-rest, moyenne 3 seeds).', es: 'Tesis (nota 1): modelos de difusión condicional para detección OOD – 99.03% +/- 0.07% AUROC (binaria airplane-vs-rest, media de 3 seeds).', ar: 'الرسالة (تقدير 1): نماذج انتشار شرطية لكشف OOD - 99.03% +/- 0.07% AUROC (ثنائي airplane-vs-rest، متوسط 3 بذور).' },
  desc2: { en: 'Thesis: SCARA robotic system for dynamic object tracking.', de: 'Thesis: SCARA-Robotersystem für dynamische Objektverfolgung.', fr: 'Mémoire : système robotique SCARA pour suivi dynamique d\'objets.', es: 'Tesis: sistema robótico SCARA para seguimiento dinámico de objetos.', ar: 'المشروع: نظام روبوت SCARA لتتبع الأجسام المتحركة.' },
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
    skills: ['PyTorch', 'PyTorch Lightning', { en: "Diffusion Models (DDPM, UNet)", de: "Diffusionsmodelle (DDPM, UNet)", fr: "Modèles de diffusion (DDPM, UNet)", es: "Modelos de difusión (DDPM, UNet)", ar: "نماذج الانتشار (DDPM, UNet)" }, 'CNNs', 'Transformers', { en: "OOD Detection", de: "OOD-Erkennung", fr: "Détection OOD", es: "Detección OOD", ar: "كشف OOD" }, 'YOLOv8', { en: "Defect Inspection", de: "Fehlerprüfung", fr: "Inspection des défauts", es: "Inspección de defectos", ar: "فحص العيوب" }],
  },
  {
    title: {
      en: 'GenAI & Agentic AI',
      de: 'Generative & Agentische KI',
      fr: 'IA générative & agentique',
      es: 'IA generativa y agéntica',
      ar: 'الذكاء الاصطناعي التوليدي والوكيلي',
    },
    skills: [{ en: "LLM API Integration", de: "LLM-API-Integration", fr: "Intégration d’API LLM", es: "Integración de API LLM", ar: "تكامل واجهات LLM" }, { en: "Multi-Provider Routing & Failover", de: "Routing und Ausfallsicherung über mehrere Anbieter", fr: "Routage et basculement entre fournisseurs", es: "Enrutamiento y conmutación entre proveedores", ar: "التوجيه بين مزودين متعددين وتجاوز الأعطال" }, { en: "Prompt Engineering", de: "Prompt-Entwicklung", fr: "Ingénierie des prompts", es: "Ingeniería de instrucciones", ar: "هندسة التعليمات" }, { en: "Structured Output Validation", de: "Validierung strukturierter Ausgaben", fr: "Validation des sorties structurées", es: "Validación de salidas estructuradas", ar: "التحقق من المخرجات المنظمة" }, { en: "pgvector Retrieval", de: "Abruf mit pgvector", fr: "Recherche avec pgvector", es: "Recuperación con pgvector", ar: "الاسترجاع باستخدام pgvector" }],
  },
  {
    title: {
      en: 'ML & Data Science',
      de: 'ML & Data Science',
      fr: 'ML & Science des données',
      es: 'ML y Ciencia de Datos',
      ar: 'تعلم الآلة وعلوم البيانات',
    },
    skills: ['Hydra', { en: "Ablation Studies", de: "Ablationsstudien", fr: "Études d’ablation", es: "Estudios de ablación", ar: "دراسات الاستئصال" }, 'AUROC/FPR95', { en: "Cross-Validation", de: "Kreuzvalidierung", fr: "Validation croisée", es: "Validación cruzada", ar: "التحقق المتقاطع" }, { en: "Multi-Seed Runs", de: "Läufe mit mehreren Zufallsseeds", fr: "Exécutions avec plusieurs graines aléatoires", es: "Ejecuciones con múltiples semillas", ar: "تجارب ببذور عشوائية متعددة" }, 'Roboflow'],
  },
  {
    title: {
      en: 'Deployment & MLOps',
      de: 'Deployment & MLOps',
      fr: 'Déploiement & MLOps',
      es: 'Despliegue y MLOps',
      ar: 'النشر وعمليات تعلم الآلة (MLOps)',
    },
    skills: ['Python', 'Git', 'Linux', 'Docker', { en: "REST APIs", de: "REST-APIs", fr: "API REST", es: "API REST", ar: "واجهات REST" }, { en: "GitHub Actions CI/CD", de: "CI/CD mit GitHub Actions", fr: "CI/CD avec GitHub Actions", es: "CI/CD con GitHub Actions", ar: "التكامل والتسليم المستمران باستخدام GitHub Actions" }, 'Supabase', 'TypeScript', 'React'],
  },
  {
    title: {
      en: 'Agent Tooling',
      de: 'Agent-Tooling',
      fr: 'Outillage pour agents',
      es: 'Herramientas para agentes',
      ar: 'أدوات الوكلاء',
    },
    skills: ['mergeproof', 'Claude Code', 'GitHub Copilot', { en: "Deterministic checks", de: "Deterministische Prüfungen", fr: "Vérifications déterministes", es: "Comprobaciones deterministas", ar: "فحوصات حتمية" }],
  },

]

export default function About() {
  useReveal()
  const { t } = useI18n()

  const education = [
    { degree: t(copy.degree1), school: 'Johannes Kepler University Linz', date: 'Oct 2020 – Sep 2026 (graduated 25 Sep 2026)', desc: t(copy.desc1) },
    { degree: t(copy.degree2), school: 'Eastern Mediterranean University, Famagusta, Cyprus', date: 'Feb 2015 - Jan 2018', desc: t(copy.desc2) },
  ]

  const infoRows = [
    { label: t(copy.location), value: 'Linz, Austria', accent: false },
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
      level: t({ en: 'B2 - Professional', de: 'B2 - Professionell', fr: 'B2 - professionnel', es: 'B2 - profesional', ar: 'B2 - مهني' }),
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
        <div className="cd-about-bio-row reveal">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <img
                src="/headshot.jpg"
                alt="Ahmed Mohammed"
                width={120}
                height={120}
                loading="lazy"
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
              <p>{t(copy.p2)} <strong>99.03% +/- 0.07% AUROC</strong> (binary airplane-vs-rest, 3-seed mean) · <strong>0.8673 AUROC</strong> (FTI_Zer0P 5-fold).</p>
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

        <div className="cd-about-band reveal">
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

        <div className="cd-about-band reveal">
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

        <div className="cd-about-band reveal">
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
