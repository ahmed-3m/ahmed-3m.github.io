'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  eyebrow: { en: '// Experience', de: '// Erfahrung', fr: '// Expérience', es: '// Experiencia', ar: '// الخبرة' },
  title: { en: "Experience & independent work.", de: 'Erfahrung und eigene Projekte.', fr: "Expérience et projets personnels.", es: 'Experiencia y proyectos propios.', ar: 'الخبرة والمشاريع المستقلة.' },
  may2026ToPresent: { en: 'May 2026\nPresent', de: 'Mai 2026\nHeute', fr: 'Mai 2026\nAujourd’hui', es: 'May. 2026\nActualidad', ar: 'مايو 2026\nحتى الآن' },
} satisfies Record<string, TranslationMap>

const experiences: Array<{
  date: TranslationMap
  role: TranslationMap
  company: string | TranslationMap
  desc: TranslationMap
  badge?: TranslationMap
  active: boolean
  last?: boolean
}> = [
  {
    date: copy.may2026ToPresent,
    role: { en: 'Solo Developer & Project Lead', de: 'Solo-Entwickler & Projektleiter', fr: 'Développeur solo & chef de projet', es: 'Desarrollador en solitario y líder de proyecto', ar: 'مطور منفرد وقائد مشروع' },
    company: {
      en: 'Sihem (side project) · tech2b incubator, Linz',
      de: 'Sihem (Nebenprojekt) · tech2b-Inkubator, Linz',
      fr: 'Sihem (projet personnel) · incubateur tech2b, Linz',
      es: 'Sihem (proyecto propio) · incubadora tech2b, Linz',
      ar: 'Sihem (مشروع جانبي) · حاضنة tech2b، لينتس',
    },
    desc: {
      en: 'Design and run the full cloud stack behind a habits and daily-routine assistant, delivered as a Telegram bot and an installable web app: managed PostgreSQL with row-level security, Deno/TypeScript serverless functions, scheduled jobs, pgvector memory, and GitHub Actions deploys. LLM calls route across several providers with escalation and failover.',
      de: 'Entwerfe und betreibe den gesamten Cloud-Stack eines Assistenten für Gewohnheiten und Tagesroutinen, ausgeliefert als Telegram-Bot und installierbare Web-App: verwaltetes PostgreSQL mit Row-Level Security, Serverless-Funktionen in Deno/TypeScript, geplante Jobs, pgvector-Gedächtnis und Deployments über GitHub Actions. LLM-Aufrufe laufen über mehrere Anbieter mit Eskalation und Failover.',
      fr: "Conception et exploitation de toute la stack cloud d'un assistant pour les habitudes et routines quotidiennes, livré en bot Telegram et en application web installable : PostgreSQL managé avec row-level security, fonctions serverless Deno/TypeScript, tâches planifiées, mémoire pgvector et déploiements GitHub Actions. Les appels LLM passent par plusieurs fournisseurs avec escalade et failover.",
      es: 'Diseño y opero todo el stack en la nube de un asistente de hábitos y rutinas diarias, entregado como bot de Telegram y aplicación web instalable: PostgreSQL gestionado con row-level security, funciones serverless en Deno/TypeScript, tareas programadas, memoria pgvector y despliegues con GitHub Actions. Las llamadas LLM se enrutan entre varios proveedores con escalado y failover.',
      ar: 'أصمم وأشغّل كامل البنية السحابية لمساعد للعادات والروتين اليومي، يُقدَّم كبوت على تيليجرام وتطبيق ويب قابل للتثبيت: PostgreSQL مُدار مع أمان على مستوى الصفوف، ودوال serverless بلغة Deno/TypeScript، ومهام مجدولة، وذاكرة pgvector، ونشر عبر GitHub Actions. تُوجَّه استدعاءات LLM عبر عدة مزودين مع تصعيد وتبديل تلقائي.',
    },
    badge: { en: 'Invitation-only beta - @sihem_ai_bot', de: 'Beta mit Einladung - @sihem_ai_bot', fr: 'Bêta sur invitation - @sihem_ai_bot', es: 'Beta por invitación - @sihem_ai_bot', ar: 'نسخة تجريبية بدعوة - @sihem_ai_bot' },
    active: true,
  },
  {
    date: copy.may2026ToPresent,
    role: { en: 'AI Consultant, LLMs & AI Agents', de: 'KI-Berater für LLMs und KI-Agenten', fr: 'Consultant IA, LLM et agents IA', es: 'Consultor de IA, LLM y agentes de IA', ar: 'استشاري ذكاء اصطناعي، نماذج لغوية كبيرة ووكلاء ذكاء اصطناعي' },
    company: { en: 'Freelance · Remote', de: 'Freiberuflich · Remote', fr: 'Indépendant · À distance', es: 'Autónomo · En remoto', ar: 'عمل حر · عن بُعد' },
    desc: {
      en: 'Advise small and medium-sized businesses on AI integration, workflow automation, and applications built with large language models.',
      de: 'Berate kleine und mittlere Unternehmen bei der KI-Integration, der Automatisierung von Arbeitsabläufen und Anwendungen mit großen Sprachmodellen.',
      fr: 'Je conseille les petites et moyennes entreprises sur l’intégration de l’IA, l’automatisation des processus et les applications fondées sur de grands modèles de langage.',
      es: 'Asesoro a pequeñas y medianas empresas sobre integración de IA, automatización de flujos de trabajo y aplicaciones basadas en grandes modelos de lenguaje.',
      ar: 'أقدّم المشورة للشركات الصغيرة والمتوسطة بشأن دمج الذكاء الاصطناعي وأتمتة سير العمل وتطبيقات النماذج اللغوية الكبيرة.',
    },
    active: true,
  },
  {
    date: { en: 'Jul 2026', de: 'Juli 2026', fr: 'Juil. 2026', es: 'Jul. 2026', ar: 'يوليو 2026' },
    role: { en: 'M.Sc. Thesis Research, Machine Vision', de: 'Masterarbeit in maschineller Bildverarbeitung', fr: 'Mémoire de master en vision par ordinateur', es: 'Tesis de máster en visión artificial', ar: 'بحث رسالة ماجستير في الرؤية الحاسوبية' },
    company: {
      en: 'Johannes Kepler University Linz',
      de: 'Johannes Kepler Universität Linz',
      fr: 'Université Johannes Kepler de Linz',
      es: 'Universidad Johannes Kepler de Linz',
      ar: 'جامعة يوهانس كيبلر لينتس',
    },
    desc: {
      en: 'Continued the PROFACTOR research at JKU under Prof. Sepp Hochreiter and submitted the thesis in July 2026. On CIFAR-10 airplane-vs-rest, a class-conditional separation loss raised mean AUROC from 92.52% to 99.03% across three runs and reduced the standard deviation from 11.07 to 0.07 percentage points.',
      de: 'Führte die bei PROFACTOR begonnene Forschung an der JKU unter Prof. Sepp Hochreiter fort und reichte die Masterarbeit im Juli 2026 ein. Bei CIFAR-10 (Flugzeuge gegen alle übrigen Klassen) erhöhte ein klassenkonditionaler Separation Loss die mittlere AUROC über drei Läufe von 92,52 % auf 99,03 % und senkte die Standardabweichung von 11,07 auf 0,07 Prozentpunkte.',
      fr: 'J’ai poursuivi à la JKU les recherches commencées chez PROFACTOR, sous la direction du professeur Sepp Hochreiter, et remis mon mémoire en juillet 2026. Sur CIFAR-10 (avions contre toutes les autres classes), une perte de séparation conditionnée par la classe a fait passer l’AUROC moyenne de 92,52 % à 99,03 % sur trois essais et réduit l’écart-type de 11,07 à 0,07 point de pourcentage.',
      es: 'Continué en la JKU la investigación iniciada en PROFACTOR, bajo la supervisión del profesor Sepp Hochreiter, y entregué la tesis en julio de 2026. En CIFAR-10 (aviones frente al resto), una pérdida de separación condicionada por clase elevó el AUROC medio de 92,52 % a 99,03 % en tres ejecuciones y redujo la desviación estándar de 11,07 a 0,07 puntos porcentuales.',
      ar: 'واصلت في جامعة يوهانس كيبلر البحث الذي بدأته في PROFACTOR بإشراف البروفيسور سيب هوخرايتر، وقدّمت الرسالة في يوليو 2026. وفي اختبار CIFAR-10 للطائرات مقابل بقية الفئات، رفعت خسارة الفصل المشروطة بالفئة متوسط AUROC عبر ثلاث تجارب من 92.52% إلى 99.03% وخفّضت الانحراف المعياري من 11.07 إلى 0.07 نقطة مئوية.',
    },
    badge: { en: 'Thesis graded 1 (top mark)', de: 'Masterarbeit mit 1 (Sehr gut) bewertet', fr: 'Mémoire noté 1 (meilleure note)', es: 'Tesis calificada con 1 (nota máxima)', ar: 'الرسالة بتقدير 1 (أعلى درجة)' },
    active: false,
  },
  {
    date: { en: 'Apr 2024\nNov 2024', de: 'Apr. 2024\nNov. 2024', fr: 'Avr. 2024\nNov. 2024', es: 'Abr. 2024\nNov. 2024', ar: 'أبريل 2024\nنوفمبر 2024' },
    role: { en: 'Master’s Thesis Researcher (AI/ML)', de: 'Masterand für KI und ML', fr: 'Chercheur en IA et ML dans le cadre du master', es: 'Investigador de tesis de máster en IA y ML', ar: 'باحث رسالة ماجستير في الذكاء الاصطناعي والتعلّم الآلي' },
    company: { en: 'PROFACTOR GmbH · Steyr, Austria (remote)', de: 'PROFACTOR GmbH · Steyr, Österreich (Homeoffice)', fr: 'PROFACTOR GmbH · Steyr, Autriche (à distance)', es: 'PROFACTOR GmbH · Steyr, Austria (en remoto)', ar: 'PROFACTOR GmbH · شتاير، النمسا (عن بُعد)' },
    desc: {
      en: 'Built a two-stage pipeline for inspecting experimental inkjet prints during a research contract on the Zer0P project. YOLOv8 locates printed features and a conditional diffusion model flags anomalies.',
      de: 'Entwickelte während eines Forschungsvertrags im Projekt Zer0P eine zweistufige Pipeline zur Prüfung experimenteller Inkjet-Drucke. YOLOv8 lokalisiert die Druckmerkmale, ein konditionales Diffusionsmodell markiert Anomalien.',
      fr: 'J’ai développé une chaîne en deux étapes pour inspecter des impressions jet d’encre expérimentales dans le cadre d’un contrat de recherche sur le projet Zer0P. YOLOv8 localise les éléments imprimés et un modèle de diffusion conditionnel signale les anomalies.',
      es: 'Durante un contrato de investigación en el proyecto Zer0P, desarrollé un sistema de dos etapas para inspeccionar impresiones experimentales de inyección de tinta. YOLOv8 localiza los elementos impresos y un modelo de difusión condicional detecta anomalías.',
      ar: 'طوّرت خلال عقد بحثي ضمن مشروع Zer0P نظامًا من مرحلتين لفحص مطبوعات تجريبية بنفث الحبر. يحدّد YOLOv8 مواقع العناصر المطبوعة، ويكشف نموذج انتشار شرطي الأنماط الشاذة.',
    },
    active: false,
  },
  {
    date: { en: 'Aug 2023\nOct 2023', de: 'Aug. 2023\nOkt. 2023', fr: 'Août 2023\nOct. 2023', es: 'Ago. 2023\nOct. 2023', ar: 'أغسطس 2023\nأكتوبر 2023' },
    role: { en: 'AI Research Intern', de: 'KI-Forschungspraktikant', fr: 'Stagiaire recherche IA', es: 'Practicante de investigación IA', ar: 'متدرب بحث ذكاء اصطناعي' },
    company: {
      en: 'Karunya Institute of Technology and Sciences · Coimbatore, India',
      de: 'Karunya Institute of Technology and Sciences · Coimbatore, Indien',
      fr: 'Karunya Institute of Technology and Sciences · Coimbatore, Inde',
      es: 'Karunya Institute of Technology and Sciences · Coimbatore, India',
      ar: 'معهد كارونيا للتكنولوجيا والعلوم · كويمباتور، الهند',
    },
    desc: {
      en: 'RNN/CNN architectures for EEG motor imagery classification with hyperparameter optimization.',
      de: 'RNN/CNN-Architekturen für EEG-Motor-Imagery-Klassifikation mit Hyperparameteroptimierung.',
      fr: 'Architectures RNN/CNN pour classification EEG d’imagerie motrice avec optimisation des hyperparamètres.',
      es: 'Arquitecturas RNN/CNN para clasificación EEG de imaginación motora con optimización de hiperparámetros.',
      ar: 'معماريات RNN/CNN لتصنيف EEG للتخيل الحركي مع تحسين المعاملات.',
    },
    active: false,
  },
  {
    date: { en: 'Sep 2018\nOct 2020', de: 'Sept. 2018\nOkt. 2020', fr: 'Sept. 2018\nOct. 2020', es: 'Sep. 2018\nOct. 2020', ar: 'سبتمبر 2018\nأكتوبر 2020' },
    role: { en: 'Electronics Technician', de: 'Elektroniker', fr: 'Technicien en électronique', es: 'Técnico de electrónica', ar: 'فني إلكترونيات' },
    company: {
      en: 'Ledzone · Karaköy, Istanbul, Turkey',
      de: 'Ledzone · Karaköy, Istanbul, Türkei',
      fr: 'Ledzone · Karaköy, Istanbul, Turquie',
      es: 'Ledzone · Karaköy, Estambul, Turquía',
      ar: 'Ledzone · كاراكوي، إسطنبول، تركيا',
    },
    desc: {
      en: 'PCB assembly and soldering, LED and motor-driver circuit build-up, reading schematics and layouts, and functional test, fault finding and final inspection with multimeter, oscilloscope and function generator.',
      de: 'Leiterplattenbestückung und Löten, Aufbau von LED- und Motortreiberschaltungen, Lesen von Schaltplänen und Layouts sowie Funktionstest, Fehlersuche und Endprüfung mit Multimeter, Oszilloskop und Funktionsgenerator.',
      fr: "Assemblage et soudure de PCB, montage de circuits LED et de pilotes moteur, lecture de schémas et de layouts, tests fonctionnels, recherche de pannes et contrôle final au multimètre, à l'oscilloscope et au générateur de fonctions.",
      es: 'Montaje y soldadura de PCB, construcción de circuitos LED y de control de motores, lectura de esquemas y layouts, y pruebas funcionales, diagnóstico de fallos e inspección final con multímetro, osciloscopio y generador de funciones.',
      ar: 'تجميع ولحام الدوائر المطبوعة، وبناء دوائر LED ومشغلات المحركات، وقراءة المخططات والتصاميم، والاختبار الوظيفي وتحديد الأعطال والفحص النهائي بالملتيميتر والأوسيلوسكوب ومولد الإشارات.',
    },
    active: false,
    last: true,
  },
]

export default function Experience() {
  const { t } = useI18n()

  return (
    <section id="experience" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 48 }}>{t(copy.title)}</h2>

        <div className="cd-timeline">
          {experiences.map((exp, i) => (
            <div key={i} className="cd-tl-item">
              <div className="cd-tl-date" style={{ whiteSpace: 'pre-line' }}>{t(exp.date)}</div>
              <div className="cd-tl-spine">
                <div className={`cd-tl-dot${exp.active ? '' : ' dim'}`} />
                {!exp.last && <div className="cd-tl-line" />}
              </div>
              <div className="cd-tl-content">
                <div className="cd-tl-role">{t(exp.role)}</div>
                <div className="cd-tl-company">{typeof exp.company === 'string' ? exp.company : t(exp.company)}</div>
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
