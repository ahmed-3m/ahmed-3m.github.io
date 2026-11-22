'use client'
import Link from 'next/link'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { portfolioCopy } from '@/lib/portfolio-copy'
import { useReveal } from '@/lib/useReveal'

const copy = {
  title: { en: 'Other projects and open source', de: 'Weitere Projekte und Open Source', fr: 'Autres projets et open source', es: 'Otros proyectos y código abierto', ar: 'مشاريع أخرى ومصادر مفتوحة' },
  sihemContext: { en: 'Independent project · tech2b incubator', de: 'Eigenes Projekt · tech2b-Inkubator', fr: 'Projet indépendant · incubateur tech2b', es: 'Proyecto independiente · incubadora tech2b', ar: 'مشروع مستقل · حاضنة tech2b' },
  caseStudy: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  caseStudyLink: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  thesisPdf: { en: 'Thesis PDF', de: 'Thesis PDF', fr: 'PDF mémoire', es: 'PDF tesis', ar: 'PDF الرسالة' },
  code: { en: 'Code', de: 'Code', fr: 'Code', es: 'Código', ar: 'الكود' },
  mergeproofExample: { en: 'See example', de: 'Beispiel ansehen', fr: 'Voir un exemple', es: 'Ver ejemplo', ar: 'عرض مثال' },
  oodMetric: {
    en: 'AUROC · CIFAR-10 airplanes vs. other classes · 3-run mean ± SD',
    de: 'AUROC · CIFAR-10: Flugzeuge gegen andere Klassen · Mittelwert ± Standardabweichung (3 Läufe)',
    fr: 'AUROC · CIFAR-10 : avions contre les autres classes · moyenne ± écart-type (3 essais)',
    es: 'AUROC · CIFAR-10: aviones frente a otras clases · media ± desviación estándar (3 pruebas)',
    ar: 'AUROC · CIFAR-10: الطائرات مقابل الفئات الأخرى · المتوسط ± الانحراف المعياري (3 تجارب)',
  },
  inkjetMetric: {
    en: 'Baseline AUROC · FTI_Zer0P · 5-fold cross-validation',
    de: 'Baseline-AUROC · FTI_Zer0P · 5-fache Kreuzvalidierung',
    fr: 'AUROC de référence · FTI_Zer0P · validation croisée en 5 plis',
    es: 'AUROC de referencia · FTI_Zer0P · validación cruzada de 5 particiones',
    ar: 'AUROC لخط الأساس · FTI_Zer0P · تحقق تقاطعي من 5 طيات',
  },
  diffusionTag: { en: 'Diffusion models', de: 'Diffusionsmodelle', fr: 'Modèles de diffusion', es: 'Modelos de difusión', ar: 'نماذج الانتشار' },
  thesis: { en: "Master's Thesis · JKU Linz · Graded 1", de: 'Masterarbeit · JKU Linz · Note 1', fr: 'Mémoire M.Sc. · JKU Linz · Note 1', es: 'Tesis M.Sc. · JKU Linz · Nota 1', ar: 'رسالة الماجستير · JKU لينتس · تقدير 1' },
  track2Eyebrow: { en: "Master's Thesis Track 2 · Industrial CV", de: 'Masterarbeit Track 2 · Industrial CV', fr: 'Mémoire Track 2 · Vision industrielle', es: 'Tesis Track 2 · Visión industrial', ar: 'المسار 2 للرسالة · رؤية صناعية' },
  oodTitle: { en: 'DiffusionOOD — OOD Detection Framework', de: 'DiffusionOOD — OOD-Erkennungsframework', fr: 'DiffusionOOD — Détection OOD', es: 'DiffusionOOD — Detección OOD', ar: 'DiffusionOOD — إطار كشف الخارج عن التوزيع' },
  oodDesc: {
    en: 'I added a class-conditional separation loss to a diffusion model to distinguish airplane images from the other CIFAR-10 classes. Across three runs, it raised the mean AUROC and reduced the variation between runs.',
    de: 'Ich ergänzte ein Diffusionsmodell um eine klassenbedingte Separationsverlustfunktion, um Flugzeugbilder von den übrigen CIFAR-10-Klassen zu unterscheiden. Über drei Läufe hinweg stieg die mittlere AUROC, und die Streuung zwischen den Läufen sank.',
    fr: 'J’ai ajouté à un modèle de diffusion une perte de séparation conditionnée par la classe pour distinguer les images d’avions des autres classes de CIFAR-10. Sur trois essais, l’AUROC moyenne a augmenté et la variabilité entre les essais a diminué.',
    es: 'Añadí a un modelo de difusión una pérdida de separación condicionada por clase para distinguir las imágenes de aviones del resto de CIFAR-10. En tres pruebas, aumentó el AUROC medio y disminuyó la variación entre pruebas.',
    ar: 'أضفت خسارة فصل مشروطة بالفئة إلى نموذج انتشار لتمييز صور الطائرات عن بقية فئات CIFAR-10. ارتفع متوسط AUROC وانخفض التفاوت بين التجارب الثلاث.',
  },
  inkjetTitle: { en: 'InkjetOOD Defect Detection', de: 'InkjetOOD Defekterkennung', fr: 'Détection de défauts InkjetOOD', es: 'Detección de defectos InkjetOOD', ar: 'كشف العيوب InkjetOOD' },
  inkjetDesc: {
    en: 'I built a two-stage inspection pipeline during a PROFACTOR research contract and evaluated it in my JKU thesis. YOLOv8 locates printed features, then a diffusion model scores anomalies. Across five held-out folds of FTI_Zer0P, the training change that helped on CIFAR-10 showed no reliable gain on the print samples.',
    de: 'Ich entwickelte während eines Forschungsvertrags bei PROFACTOR eine zweistufige Prüfpipeline und evaluierte sie in meiner JKU-Masterarbeit. YOLOv8 lokalisiert gedruckte Merkmale, danach bewertet ein Diffusionsmodell Anomalien. In fünf Test-Folds von FTI_Zer0P brachte die auf CIFAR-10 erfolgreiche Trainingsänderung bei den Druckproben keinen verlässlichen Vorteil.',
    fr: 'J’ai développé un système d’inspection en deux étapes lors d’un contrat de recherche chez PROFACTOR, puis je l’ai évalué dans mon mémoire à la JKU. YOLOv8 repère les éléments imprimés, puis un modèle de diffusion évalue les anomalies. Sur cinq plis de test de FTI_Zer0P, la modification utile sur CIFAR-10 n’a pas donné de gain fiable sur les impressions.',
    es: 'Desarrollé un sistema de inspección de dos etapas durante un contrato de investigación con PROFACTOR y lo evalué en mi tesis en la JKU. YOLOv8 localiza los elementos impresos y un modelo de difusión puntúa las anomalías. En cinco particiones de prueba de FTI_Zer0P, el cambio que funcionó en CIFAR-10 no produjo una mejora fiable en las muestras impresas.',
    ar: 'طوّرت نظام فحص من مرحلتين خلال عقد بحثي مع PROFACTOR وقيّمته في رسالتي في JKU. يحدّد YOLOv8 مواضع العناصر المطبوعة ثم يقيّم نموذج انتشار الحالات الشاذة. في خمسة أقسام اختبار من FTI_Zer0P، لم يحقّق تعديل التدريب الذي أفاد في CIFAR-10 تحسّنًا موثوقًا على العينات المطبوعة.',
  },
  sihemTitle: { en: 'Sihem, a planning assistant', de: 'Sihem, ein Planungsassistent', fr: 'Sihem, un assistant de planification', es: 'Sihem, un asistente de planificación', ar: 'Sihem، مساعد للتخطيط' },
  sihemDesc: {
    en: 'I built Sihem’s scheduling, memory, and failover across AI providers. When a calendar event moves, its rules can trigger a Telegram check-in. The Telegram bot and web app are in an invitation-only beta, and the native Android app is in private testing.',
    de: 'Ich entwickelte Sihems Terminplanung, Gedächtnis und automatischen Wechsel zwischen KI-Anbietern bei Ausfällen. Wird ein Termin verschoben, können die Regeln eine Nachfrage per Telegram auslösen. Der Telegram-Bot und die Web-App befinden sich in einer Beta mit Einladung, die native Android-App im privaten Test.',
    fr: 'J’ai développé la planification, la mémoire et le basculement entre fournisseurs IA de Sihem. Lorsqu’un événement est déplacé, ses règles peuvent déclencher un suivi sur Telegram. Le bot Telegram et l’application web sont en bêta sur invitation. L’application Android native est en test privé.',
    es: 'Desarrollé la planificación, la memoria y el cambio a proveedores de IA de respaldo de Sihem. Si cambia la hora de un evento, sus reglas pueden activar un seguimiento por Telegram. El bot de Telegram y la aplicación web están en beta por invitación. La aplicación nativa para Android está en pruebas privadas.',
    ar: 'طوّرت الجدولة والذاكرة في Sihem وإمكان التبديل بين مزوّدي الذكاء الاصطناعي عند التعطّل. إذا تغيّر موعد في التقويم، قد تُطلق القواعد رسالة متابعة على تيليجرام. بوت تيليجرام وتطبيق الويب في نسخة تجريبية بالدعوة، وتطبيق Android الأصلي في اختبار خاص.',
  },
  mergeproofEyebrow: {
    en: 'Open source · Agent tooling',
    de: 'Open Source · Agent-Tooling',
    fr: 'Open source · Outillage agents',
    es: 'Open source · Herramientas para agentes',
    ar: 'مفتوح المصدر · أدوات الوكلاء',
  },
  mergeproofDesc: {
    en: 'I built mergeproof to check AI-written pull requests against deterministic rules without calling a language model. For example, it flags a pull request for human review if it edits an existing test.',
    de: 'Ich entwickelte mergeproof, um KI-generierte Pull Requests mit deterministischen Regeln und ohne Sprachmodell zu prüfen. Wird ein bestehender Test geändert, markiert mergeproof den Pull Request zur manuellen Prüfung.',
    fr: 'J’ai créé mergeproof pour vérifier les pull requests écrites par IA à l’aide de règles déterministes, sans faire appel à un modèle de langage. Par exemple, si un test existant est modifié, mergeproof signale la pull request pour une revue humaine.',
    es: 'Creé mergeproof para comprobar los pull requests escritos por IA con reglas deterministas y sin consultar un modelo de lenguaje. Por ejemplo, si se modifica una prueba existente, marca el pull request para revisión humana.',
    ar: 'طوّرت mergeproof للتحقق من طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق قواعد حتمية ودون استدعاء نموذج لغوي. إذا عدّل الطلب اختبارًا موجودًا، مثلًا، تشير الأداة إلى ضرورة مراجعته بشريًا.',
  },
  mergeproofMetric: {
    en: 'LLM calls',
    de: 'LLM-Aufrufe',
    fr: 'appels LLM',
    es: 'llamadas LLM',
    ar: 'استدعاءات LLM',
  },
  tagZeroDeps: {
    en: 'Zero dependencies',
    de: 'Keine Abhängigkeiten',
    fr: 'Zéro dépendance',
    es: 'Cero dependencias',
    ar: 'بدون تبعيات',
  },
  tagLlmFree: {
    en: 'LLM-free gate',
    de: 'LLM-freies Gate',
    fr: 'Porte sans LLM',
    es: 'Compuerta sin LLM',
    ar: 'بوابة خالية من LLM',
  },
  bciEyebrow: {
    en: 'Karunya Institute of Technology and Sciences · BCI Research',
    de: 'Karunya Institute of Technology and Sciences · BCI-Forschung',
    fr: 'Karunya Institute of Technology and Sciences · Recherche BCI',
    es: 'Karunya Institute of Technology and Sciences · Investigación BCI',
    ar: 'معهد كارونيا للتكنولوجيا والعلوم · أبحاث واجهة الدماغ والحاسوب',
  },
  eegTitle: { en: 'EEG Signal Classification', de: 'EEG-Signalklassifikation', fr: 'Classification de signaux EEG', es: 'Clasificación de señales EEG', ar: 'تصنيف إشارات EEG' },
  eegDesc: {
    en: 'LSTM, Bi-LSTM, and GRU architectures for motor imagery classification in brain-computer interface applications.',
    de: 'LSTM-, Bi-LSTM- und GRU-Architekturen für Motor-Imagery-Klassifikation in Brain-Computer-Interfaces.',
    fr: "Architectures LSTM, Bi-LSTM et GRU pour la classification d'imagerie motrice dans les interfaces cerveau-ordinateur.",
    es: 'Arquitecturas LSTM, Bi-LSTM y GRU para clasificación de imaginación motora en interfaces cerebro-computadora.',
    ar: 'معماريات LSTM وBi-LSTM وGRU لتصنيف التخيل الحركي في تطبيقات واجهة الدماغ والحاسوب.',
  },
  moreOssEyebrow: {
    en: 'More open source',
    de: 'Weiteres Open Source',
    fr: 'Autres projets open source',
    es: 'Más proyectos open source',
    ar: 'مشاريع أخرى مفتوحة المصدر',
  },
  moreOss1: {
    en: "a Messenger bot that answers a real shop's customers about prices, hours and delivery",
    de: 'ein Messenger-Bot, der Kunden eines echten Ladens Fragen zu Preisen, Öffnungszeiten und Lieferung beantwortet',
    fr: "un bot Messenger qui répond aux clients d'une vraie boutique sur les prix, horaires et livraisons",
    es: 'un bot de Messenger que responde a los clientes de una tienda real sobre precios, horarios y entregas',
    ar: 'بوت ماسنجر يجيب عملاء متجر حقيقي عن الأسعار وساعات العمل والتوصيل',
  },
  moreOss2: {
    en: 'zero-dependency tools that take a fuzzy idea to a linted brief, then to a tested prototype, with any coding agent.',
    de: 'Zero-Dependency-Tools, die eine vage Idee mit jedem Coding-Agenten erst in ein geprüftes Briefing und dann in einen getesteten Prototyp überführen.',
    fr: "des outils sans dépendances qui transforment une idée floue en brief validé puis en prototype testé, avec n'importe quel agent de code.",
    es: 'herramientas sin dependencias que llevan una idea difusa a un brief validado y luego a un prototipo probado con cualquier agente de código.',
    ar: 'أدوات بدون تبعيات تحول الفكرة الأولية إلى ملخص مدقق ثم إلى نموذج أولي مختبر مع أي وكيل برمجة.',
  },
} satisfies Record<string, TranslationMap>

function RtlArrow() {
  return <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
}

function AdditionalProjectCards() {
  const { t } = useI18n()

  return (
    <>
      <article className="cd-project-card reveal">
        <div className="cd-pc-eyebrow">{t(copy.mergeproofEyebrow)}</div>
        <h3 className="cd-pc-title">mergeproof</h3>
        <div className="cd-pc-desc">{t(copy.mergeproofDesc)}</div>
        <div className="cd-pc-metric">0<span> {t(copy.mergeproofMetric)}</span></div>
        <div className="cd-proj-tags" style={{ marginTop: 12 }}>
          {['JavaScript', t(copy.tagZeroDeps), t(copy.tagLlmFree), 'npm'].map(tag => (
            <span key={tag} className="cd-proj-tag">{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <a href="https://github.com/ahmed-3m/mergeproof" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} <RtlArrow /></a>
          <a href="https://github.com/ahmed-3m/mergeproof#quick-start" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.mergeproofExample)} <RtlArrow /></a>
        </div>
      </article>

      <article className="cd-project-card reveal">
        <div className="cd-pc-eyebrow">{t(copy.bciEyebrow)}</div>
        <h3 className="cd-pc-title">{t(copy.eegTitle)}</h3>
        <div className="cd-pc-desc">{t(copy.eegDesc)}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <a href="https://github.com/ahmed-3m/Motor-Imagery-classification" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} <RtlArrow /></a>
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
    </>
  )
}

export function FullProjects() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="projects" className="cd-section">
      <div className="cd-container">
        <h2 className="cd-section-title">{t(portfolioCopy.work)}</h2>

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
                <Link href="/case-studies/diffusion-ood/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudyLink)} <RtlArrow /></Link>
                <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} <RtlArrow /></a>
                <a href="/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.thesisPdf)} <RtlArrow /></a>
              </div>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.track2Eyebrow)}</div>
            <div className="cd-pc-title">{t(copy.inkjetTitle)}</div>
            <div className="cd-pc-desc">{t(copy.inkjetDesc)}</div>
            <div className="cd-pc-metric"><bdi dir="ltr">0.8673 <span>± 0.0230</span></bdi><br /><span>{t(copy.inkjetMetric)}</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} <RtlArrow /></a>
              <Link href="/case-studies/inkjet-ood/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudy)} <RtlArrow /></Link>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.sihemContext)}</div>
            <div className="cd-pc-title">{t(copy.sihemTitle)}</div>
            <div className="cd-pc-desc">{t(copy.sihemDesc)}</div>
            <div className="cd-proj-tags" style={{ marginTop: 12 }}>
              {['Deno / TypeScript', 'Supabase', 'Kotlin / Jetpack Compose'].map(tag => (
                <span key={tag} className="cd-proj-tag">{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href="/case-studies/sihem/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudyLink)} <RtlArrow /></Link>
              <a href="https://t.me/sihem_ai_bot" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>Telegram <RtlArrow /></a>
              <a href="https://sihem-pwa.pages.dev/" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>PWA <RtlArrow /></a>
            </div>
          </article>

          <details className="cd-additional-projects">
            <summary>{t({ en: 'More projects and open source', de: 'Weitere Projekte und Open Source', fr: 'Autres projets et open source', es: 'Más proyectos y código abierto', ar: 'مشاريع أخرى ومصادر مفتوحة' })}</summary>
            <div className="cd-projects-grid" style={{ marginTop: 20 }}>
              <AdditionalProjectCards />
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}

export default function AdditionalProjects() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="other-projects" className="cd-section">
      <div className="cd-container">
        <h2 className="cd-section-title">{t(copy.title)}</h2>
        <div className="cd-projects-grid">
          <AdditionalProjectCards />
        </div>
      </div>
    </section>
  )
}
