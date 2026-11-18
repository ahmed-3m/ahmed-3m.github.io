'use client'
import Link from 'next/link'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// Projects', de: '// Projekte', fr: '// Projets', es: '// Proyectos', ar: '// المشاريع' },
  title: { en: 'Research that ships.', de: 'Forschung, die produktiv wird.', fr: 'La recherche qui devient produit.', es: 'Investigación que llega a producción.', ar: 'بحث يتحول إلى منتج.' },
  supporting: { en: 'Supporting proof · Invitation-only beta (tech2b)', de: 'Weiterer Nachweis · Beta mit Einladung (tech2b)', fr: 'Preuve complémentaire · Bêta sur invitation (tech2b)', es: 'Prueba adicional · Beta por invitación (tech2b)', ar: 'دليل إضافي · نسخة تجريبية بدعوة (tech2b)' },
  caseStudy: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  caseStudyLink: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  thesisPdf: { en: 'Thesis PDF', de: 'Thesis PDF', fr: 'PDF mémoire', es: 'PDF tesis', ar: 'PDF الرسالة' },
  code: { en: 'Code', de: 'Code', fr: 'Code', es: 'Código', ar: 'الكود' },
  oodMetric: {
    en: 'AUROC · CIFAR-10 airplanes vs. other classes · 3-run mean ± SD',
    de: 'AUROC · CIFAR-10: Flugzeuge gegen andere Klassen · Mittelwert ± Standardabweichung (3 Läufe)',
    fr: 'AUROC · CIFAR-10 : avions contre les autres classes · moyenne ± écart-type (3 essais)',
    es: 'AUROC · CIFAR-10: aviones frente a otras clases · media ± desviación estándar (3 pruebas)',
    ar: 'AUROC · CIFAR-10: الطائرات مقابل الفئات الأخرى · المتوسط ± الانحراف المعياري (3 تجارب)',
  },
  inkjetMetric: {
    en: 'AUROC (5-fold CV)',
    de: 'AUROC (5-fache Kreuzvalidierung)',
    fr: 'AUROC (validation croisée en 5 plis)',
    es: 'AUROC (validación cruzada de 5 particiones)',
    ar: 'AUROC (تحقق تقاطعي من 5 طيات)',
  },
  diffusionTag: { en: 'Diffusion models', de: 'Diffusionsmodelle', fr: 'Modèles de diffusion', es: 'Modelos de difusión', ar: 'نماذج الانتشار' },
  thesis: { en: "Master's Thesis · JKU Linz · Graded 1", de: 'Masterarbeit · JKU Linz · Note 1', fr: 'Mémoire M.Sc. · JKU Linz · Note 1', es: 'Tesis M.Sc. · JKU Linz · Nota 1', ar: 'رسالة الماجستير · JKU لينز · تقدير 1' },
  track2Eyebrow: { en: "Master's Thesis Track 2 · Industrial CV", de: 'Masterarbeit Track 2 · Industrial CV', fr: 'Mémoire Track 2 · Vision industrielle', es: 'Tesis Track 2 · Visión industrial', ar: 'المسار 2 للرسالة · رؤية صناعية' },
  oodTitle: { en: 'DiffusionOOD — OOD Detection Framework', de: 'DiffusionOOD — OOD-Erkennungsframework', fr: 'DiffusionOOD — Détection OOD', es: 'DiffusionOOD — Detección OOD', ar: 'DiffusionOOD — إطار كشف الخارج عن التوزيع' },
  oodDesc: {
    en: "I trained an image model to flag pictures outside a familiar category. In my thesis experiment, I tested whether a new training method could better separate airplane photos from other images. It improved the average score across three runs. The case study explains the benchmark and its limits.",
    de: "Ich trainierte ein Bildmodell, das Bilder außerhalb einer vertrauten Kategorie erkennt. In meiner Masterarbeit verbesserte eine neue Trainingsmethode den Durchschnittswert für die Trennung von Flugzeugbildern und anderen Bildern über drei Läufe.",
    fr: "J’ai entraîné un modèle à repérer les images hors d’une catégorie connue. Dans mon mémoire, une nouvelle méthode d’entraînement a amélioré le score moyen de séparation entre les images d’avions et les autres images sur trois essais.",
    es: "Entrené un modelo para detectar imágenes fuera de una categoría conocida. En mi tesis, un nuevo método de entrenamiento mejoró la puntuación media al separar fotos de aviones de otras imágenes en tres pruebas.",
    ar: "درّبت نموذجًا لرصد الصور التي لا تنتمي إلى فئة مألوفة. في رسالتي رفعت طريقة تدريب جديدة متوسط نتيجة الفصل بين صور الطائرات والصور الأخرى عبر ثلاث تجارب.",
  },
  inkjetTitle: { en: 'InkjetOOD Defect Detection', de: 'InkjetOOD Defekterkennung', fr: 'Détection de défauts InkjetOOD', es: 'Detección de defectos InkjetOOD', ar: 'كشف العيوب InkjetOOD' },
  inkjetDesc: {
    en: "I built and evaluated a two-stage system to spot defects in industrial inkjet printing. It finds printed features in an image, then checks each feature for unusual patterns. I tested it on the public FTI_Zer0P dataset across five splits.",
    de: "Ich entwickelte und prüfte ein zweistufiges System für Druckfehler. Es findet gedruckte Merkmale im Bild und prüft sie auf Auffälligkeiten. Der öffentliche Datensatz FTI_Zer0P wurde unter fünf Aufteilungen ausgewertet.",
    fr: "J’ai construit et évalué un système qui repère les éléments imprimés puis recherche des défauts. Je l’ai testé sur le jeu public FTI_Zer0P en cinq partitions.",
    es: "Construí y evalué un sistema que localiza elementos impresos y busca defectos. Lo probé con el conjunto público FTI_Zer0P en cinco particiones.",
    ar: "طوّرت وقيّمت نظامًا يحدد العناصر المطبوعة في الصور ثم يبحث فيها عن العيوب. اختبرته على مجموعة FTI_Zer0P العامة باستخدام خمسة تقسيمات.",
  },
  eegTitle: { en: 'EEG Signal Classification', de: 'EEG-Signalklassifikation', fr: 'Classification de signaux EEG', es: 'Clasificación de señales EEG', ar: 'تصنيف إشارات EEG' },
  eegDesc: {
    en: 'LSTM, Bi-LSTM, and GRU architectures for motor imagery classification in brain-computer interface applications.',
    de: 'LSTM-, Bi-LSTM- und GRU-Architekturen für Motor-Imagery-Klassifikation in Brain-Computer-Interfaces.',
    fr: "Architectures LSTM, Bi-LSTM et GRU pour la classification d'imagerie motrice dans les interfaces cerveau-ordinateur.",
    es: 'Arquitecturas LSTM, Bi-LSTM y GRU para clasificación de imaginación motora en interfaces cerebro-computadora.',
    ar: 'معماريات LSTM وBi-LSTM وGRU لتصنيف التخيل الحركي في تطبيقات واجهة الدماغ والحاسوب.',
  },
  mentoTitle: { en: 'Sihem — AI Mentor Assistant', de: 'Sihem — KI-Mentor-Assistent', fr: 'Sihem — Assistant mentor IA', es: 'Sihem — Asistente mentor con IA', ar: 'Sihem — مساعد موجه بالذكاء الاصطناعي' },
  mentoDesc: {
    en: "A personal assistant for weekly planning and daily routines through Telegram and a web app. I built its scheduling, long-term memory, and multi-provider AI integration. Morning briefings, evening reviews, and adaptive check-ins are available in an invitation-only beta.",
    de: "Ein persönlicher Assistent für Wochenplanung und tägliche Routinen per Telegram und Web-App. Ich entwickelte Zeitplanung, Langzeitgedächtnis und die Anbindung mehrerer KI-Anbieter. Morgenbriefings, Abendreviews und adaptive Check-ins sind in einer Beta mit Einladung verfügbar.",
    fr: "Un assistant personnel pour organiser la semaine et les routines via Telegram et une application web. J’ai développé la planification, la mémoire à long terme et l’intégration de plusieurs fournisseurs IA. Briefings matinaux, bilans du soir et suivis adaptatifs sont disponibles en bêta sur invitation.",
    es: "Un asistente para organizar la semana y las rutinas mediante Telegram y una aplicación web. Desarrollé la planificación, la memoria a largo plazo y la integración de varios proveedores de IA. Ofrece resúmenes matutinos, revisiones nocturnas y seguimientos adaptativos en una beta por invitación.",
    ar: "مساعد شخصي لتنظيم الأسبوع والروتين اليومي عبر تيليجرام وتطبيق ويب. طورت الجدولة والذاكرة طويلة المدى والتكامل مع عدة مزودي ذكاء اصطناعي. تتوفر الملخصات الصباحية والمراجعات المسائية والمتابعات التكيفية في نسخة تجريبية تتطلب دعوة.",
  },
  mergeproofEyebrow: {
    en: 'Open source · Agent tooling',
    de: 'Open Source · Agent-Tooling',
    fr: 'Open source · Outillage agents',
    es: 'Open source · Herramientas para agentes',
    ar: 'مصدر مفتوح · أدوات الوكلاء',
  },
  mergeproofDesc: {
    en: "Checks AI-written pull requests against configured deterministic merge requirements without calling an LLM. Passing those checks does not guarantee defect-free code.",
    de: "Prüft KI-generierte Pull Requests anhand konfigurierter deterministischer Merge-Anforderungen ohne LLM-Aufruf. Bestandene Prüfungen garantieren keine Fehlerfreiheit.",
    fr: "Vérifie les pull requests générées par IA selon des exigences déterministes configurées, sans appel LLM. La réussite des contrôles ne garantit pas l’absence de défauts.",
    es: "Verifica pull requests generadas por IA según requisitos deterministas configurados, sin llamadas a un LLM. Superar las comprobaciones no garantiza la ausencia de errores.",
    ar: "يتحقق من طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات حتمية محددة دون استدعاء نموذج لغوي. اجتياز هذه الفحوص لا يضمن خلو الشيفرة من الأخطاء.",
  },
  tagZeroDeps: {
    en: 'Zero dependencies',
    de: 'Keine Abhängigkeiten',
    fr: 'Zéro dépendance',
    es: 'Sin dependencias',
    ar: 'بدون تبعيات',
  },
  tagLlmFree: {
    en: 'LLM-free gate',
    de: 'LLM-freies Gate',
    fr: 'Garde-fou sans LLM',
    es: 'Compuerta sin LLM',
    ar: 'بوابة خالية من LLM',
  },
  mergeproofMetric: {
    en: 'LLM calls',
    de: 'LLM-Aufrufe',
    fr: 'appels LLM',
    es: 'llamadas LLM',
    ar: 'استدعاءات LLM',
  },
  moreOssEyebrow: {
    en: 'More open source',
    de: 'Mehr Open Source',
    fr: "Plus d'open source",
    es: 'Más open source',
    ar: 'المزيد من المصادر المفتوحة',
  },
  moreOss1: {
    en: "a Messenger bot that answers a real shop's customers about prices, hours and delivery.",
    de: 'ein Messenger-Bot, der den Kunden eines echten Ladens zu Preisen, Öffnungszeiten und Lieferung antwortet.',
    fr: "un bot Messenger qui répond aux clients d'une vraie boutique sur les prix, les horaires et la livraison.",
    es: 'un bot de Messenger que responde a los clientes de una tienda real sobre precios, horarios y entrega.',
    ar: 'بوت ماسنجر يجيب عملاء متجر حقيقي حول الأسعار وأوقات العمل والتوصيل.',
  },
  moreOss2: {
    en: 'zero-dependency tools that take a fuzzy idea to a linted brief, then to a tested prototype, with any coding agent.',
    de: 'Zero-Dependency-Werkzeuge, die eine vage Idee in ein gelintetes Briefing und dann in einen getesteten Prototyp überführen — mit jedem Coding-Agent.',
    fr: "des outils sans dépendance qui transforment une idée floue en brief linté, puis en prototype testé, avec n'importe quel agent de code.",
    es: 'herramientas sin dependencias que llevan una idea difusa a un brief lintado y luego a un prototipo probado, con cualquier agente de código.',
    ar: 'أدوات بدون تبعيات تحوّل فكرة غامضة إلى موجز مُدقَّق ثم إلى نموذج أولي مُختبَر، مع أي وكيل برمجي.',
  },
} satisfies Record<string, TranslationMap>

export default function Projects() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="projects" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title">{t(copy.title)}</h2>

        <div className="cd-projects-grid">
          <article className="cd-project-featured reveal">
            <div>
              <div className="cd-proj-eyebrow">{t(copy.thesis)}</div>
              <div className="cd-proj-title">{t(copy.oodTitle)}</div>
              <div className="cd-proj-desc">{t(copy.oodDesc)}</div>
              <div className="cd-proj-tags">
                {['PyTorch', t(copy.diffusionTag)].map(tag => (
                  <span key={tag} className="cd-proj-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="cd-proj-metric-big">
              <div className="cd-pc-metric" style={{ marginTop: 0 }}><bdi dir="ltr">99.03% <span>± 0.07%</span></bdi><br /><span>{t(copy.oodMetric)}</span></div>
              <div className="cd-proj-actions" style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                <Link href="/case-studies/diffusion-ood/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudyLink)} &rarr;</Link>
                <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
                <a href="/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.thesisPdf)} &rarr;</a>
              </div>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.track2Eyebrow)}</div>
            <div className="cd-pc-title">{t(copy.inkjetTitle)}</div>
            <div className="cd-pc-desc">{t(copy.inkjetDesc)}</div>
            <div className="cd-pc-metric"><bdi dir="ltr">0.8673 <span>± 0.0230</span></bdi><br /><span>{t(copy.inkjetMetric)}</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
              <Link href="/case-studies/inkjet-ood/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudy)} &rarr;</Link>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.supporting)}</div>
            <div className="cd-pc-title">{t(copy.mentoTitle)}</div>
            <div className="cd-pc-desc">{t(copy.mentoDesc)}</div>
            <div className="cd-proj-tags" style={{ marginTop: 12 }}>
              {['Deno / TypeScript', 'Supabase'].map(tag => (
                <span key={tag} className="cd-proj-tag">{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href="/case-studies/sihem/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudyLink)} &rarr;</Link>
              <a href="https://t.me/sihem_ai_bot" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>Telegram &rarr;</a>
              <a href="https://sihem-pwa.pages.dev/" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>PWA &rarr;</a>
            </div>
          </article>

          <details className="cd-additional-projects">
            <summary>{t({ en: 'More projects and open source', de: 'Weitere Projekte und Open Source', fr: 'Autres projets et open source', es: 'Más proyectos y código abierto', ar: 'مشاريع أخرى ومصادر مفتوحة' })}</summary>
            <div className="cd-projects-grid" style={{ marginTop: 20 }}>
          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.mergeproofEyebrow)}</div>
            <div className="cd-pc-title">mergeproof</div>
            <div className="cd-pc-desc">{t(copy.mergeproofDesc)}</div>
            <div className="cd-pc-metric">0<span> {t(copy.mergeproofMetric)}</span></div>
            <div className="cd-proj-tags" style={{ marginTop: 12 }}>
              {['JavaScript', t(copy.tagZeroDeps), t(copy.tagLlmFree), 'npm'].map(tag => (
                <span key={tag} className="cd-proj-tag">{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/mergeproof" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">Karunya Institute of Technology and Sciences · BCI Research</div>
            <div className="cd-pc-title">{t(copy.eegTitle)}</div>
            <div className="cd-pc-desc">{t(copy.eegDesc)}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/Motor-Imagery-classification" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card cd-project-card--full reveal">
            <div className="cd-pc-eyebrow">{t(copy.moreOssEyebrow)}</div>
            <div className="cd-pc-desc" style={{ maxWidth: 760 }}>
              <a href="https://github.com/ahmed-3m/Elbostan-Pazar-bot" target="_blank" rel="noopener noreferrer" className="cd-proj-link">Elbostan Pazar bot</a>
              {' — '}
              {t(copy.moreOss1)}
              {' · '}
              <a href="https://github.com/ahmed-3m/brainstorm2idea" target="_blank" rel="noopener noreferrer" className="cd-proj-link">brainstorm2idea</a>
              {' + '}
              <a href="https://github.com/ahmed-3m/idea2prototype" target="_blank" rel="noopener noreferrer" className="cd-proj-link">idea2prototype</a>
              {' — '}
              {t(copy.moreOss2)}
            </div>
          </article>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
