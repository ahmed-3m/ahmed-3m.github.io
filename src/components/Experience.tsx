'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 04 - Experience', de: '// 04 - Erfahrung', fr: '// 04 - Expérience', es: '// 04 - Experiencia', ar: '// 04 - الخبرة' },
  title: { en: "Where I've worked.", de: 'Wo ich gearbeitet habe.', fr: "Où j'ai travaillé.", es: 'Donde he trabajado.', ar: 'أماكن عملي.' },
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
    date: 'May 2026\nPresent',
    role: { en: 'Solo Developer & Project Lead', de: 'Solo-Entwickler & Projektleiter', fr: 'Développeur solo & chef de projet', es: 'Desarrollador en solitario y líder de proyecto', ar: 'مطور منفرد وقائد مشروع' },
    company: 'Sihem (side project) · tech2b incubator, Linz',
    desc: {
      en: 'Design and run the full cloud stack behind a habits and daily-routine assistant, delivered as a Telegram bot and an installable web app: managed PostgreSQL with row-level security, Deno/TypeScript serverless functions, scheduled jobs, pgvector memory, and GitHub Actions deploys. LLM calls route across several providers with escalation and failover.',
      de: 'Entwerfe und betreibe den gesamten Cloud-Stack eines Assistenten für Gewohnheiten und Tagesroutinen, ausgeliefert als Telegram-Bot und installierbare Web-App: verwaltetes PostgreSQL mit Row-Level Security, Serverless-Funktionen in Deno/TypeScript, geplante Jobs, pgvector-Gedächtnis und Deployments über GitHub Actions. LLM-Aufrufe laufen über mehrere Anbieter mit Eskalation und Failover.',
      fr: "Conception et exploitation de toute la stack cloud d'un assistant pour les habitudes et routines quotidiennes, livré en bot Telegram et en application web installable : PostgreSQL managé avec row-level security, fonctions serverless Deno/TypeScript, tâches planifiées, mémoire pgvector et déploiements GitHub Actions. Les appels LLM passent par plusieurs fournisseurs avec escalade et failover.",
      es: 'Diseño y opero todo el stack en la nube de un asistente de hábitos y rutinas diarias, entregado como bot de Telegram y aplicación web instalable: PostgreSQL gestionado con row-level security, funciones serverless en Deno/TypeScript, tareas programadas, memoria pgvector y despliegues con GitHub Actions. Las llamadas LLM se enrutan entre varios proveedores con escalado y failover.',
      ar: 'أصمم وأشغّل كامل البنية السحابية لمساعد للعادات والروتين اليومي، يُقدَّم كبوت على تيليجرام وتطبيق ويب قابل للتثبيت: PostgreSQL مُدار مع أمان على مستوى الصفوف، ودوال serverless بلغة Deno/TypeScript، ومهام مجدولة، وذاكرة pgvector، ونشر عبر GitHub Actions. تُوجَّه استدعاءات LLM عبر عدة مزودين مع تصعيد وتبديل تلقائي.',
    },
    badge: { en: 'Live beta - @sihem_ai_bot', de: 'Live-Beta - @sihem_ai_bot', fr: 'Bêta en ligne - @sihem_ai_bot', es: 'Beta en vivo - @sihem_ai_bot', ar: 'نسخة تجريبية - @sihem_ai_bot' },
    active: true,
  },
  {
    date: 'Apr 2024\nJul 2026',
    role: { en: 'M.Sc. Thesis Researcher, Machine Vision', de: 'Masterarbeits-Forscher, Machine Vision', fr: 'Chercheur de mémoire M.Sc., vision industrielle', es: 'Investigador de tesis de máster, visión artificial', ar: 'باحث رسالة ماجستير، رؤية آلية' },
    company: 'JKU Institute for Machine Learning with PROFACTOR GmbH · Linz / Steyr',
    desc: {
      en: 'Conditional diffusion models as generative classifiers for OOD detection under Prof. Sepp Hochreiter. A class-conditional separation loss cut seed-to-seed std from 11.07 to 0.07 points while raising CIFAR-10 AUROC from 92.52% to 99.03%. Applied in project Zer0P (zero-defect inkjet printing on building components) as a two-stage YOLOv8 + conditional-diffusion pipeline, with an eight-method 5-fold comparison.',
      de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren für OOD-Erkennung bei Prof. Sepp Hochreiter. Ein klassenkonditionaler Separation Loss senkte die Seed-Standardabweichung von 11,07 auf 0,07 Punkte und hob die CIFAR-10-AUROC von 92,52% auf 99,03%. Angewandt im Projekt Zer0P (Zero-Defect-Inkjetdruck auf Bauteilen) als zweistufige YOLOv8- + Diffusionspipeline mit einem 5-fachen Vergleich von acht Methoden.',
      fr: "Modèles de diffusion conditionnels comme classificateurs génératifs pour la détection OOD, sous la direction du Prof. Sepp Hochreiter. Une separation loss conditionnelle a réduit l'écart-type entre seeds de 11,07 à 0,07 points et porté l'AUROC CIFAR-10 de 92,52% à 99,03%. Appliqué au projet Zer0P (impression inkjet zéro défaut sur composants de construction) via un pipeline YOLOv8 + diffusion en deux étapes, avec une comparaison de huit méthodes en 5-fold.",
      es: 'Modelos de difusión condicional como clasificadores generativos para detección OOD, bajo la supervisión del Prof. Sepp Hochreiter. Una separation loss condicional redujo la desviación estándar entre seeds de 11,07 a 0,07 puntos y elevó el AUROC en CIFAR-10 de 92,52% a 99,03%. Aplicado en el proyecto Zer0P (impresión inkjet sin defectos en componentes de construcción) como pipeline YOLOv8 + difusión en dos etapas, con una comparación 5-fold de ocho métodos.',
      ar: 'نماذج انتشار شرطية كمصنفات توليدية لكشف الخارج عن التوزيع بإشراف البروفيسور سيب هوخرايتر. خفّضت خسارة الفصل الشرطية الانحراف المعياري بين البذور من 11.07 إلى 0.07 نقطة ورفعت AUROC على CIFAR-10 من 92.52% إلى 99.03%. طُبّقت في مشروع Zer0P (طباعة inkjet بلا عيوب على مكونات البناء) عبر خط YOLOv8 + انتشار شرطي من مرحلتين، مع مقارنة ثماني طرق بتحقق خماسي.',
    },
    badge: { en: 'Thesis graded 1 (top mark)', de: 'Masterarbeit mit 1 (Sehr gut) bewertet', fr: 'Mémoire noté 1 (meilleure note)', es: 'Tesis calificada con 1 (nota máxima)', ar: 'الرسالة بتقدير 1 (أعلى درجة)' },
    active: false,
  },
  {
    date: 'Aug 2023\nOct 2023',
    role: { en: 'AI Research Intern', de: 'KI-Forschungspraktikant', fr: 'Stagiaire recherche IA', es: 'Practicante de investigación IA', ar: 'متدرب بحث ذكاء اصطناعي' },
    company: 'Karunya University · Coimbatore, India',
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
    date: '2018\nOct 2020',
    role: { en: 'Technical Staff, Electronics', de: 'Techniker, Elektronik', fr: 'Technicien, électronique', es: 'Técnico de electrónica', ar: 'فني إلكترونيات' },
    company: 'Ledzone · Karaköy, Istanbul, Turkey',
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
