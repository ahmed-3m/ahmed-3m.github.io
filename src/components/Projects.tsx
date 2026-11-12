'use client'
import Link from 'next/link'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 02 - Projects', de: '// 02 - Projekte', fr: '// 02 - Projets', es: '// 02 - Proyectos', ar: '// 02 - المشاريع' },
  title: { en: 'Research that ships.', de: 'Forschung, die produktiv wird.', fr: 'La recherche qui devient produit.', es: 'Investigación que llega a producción.', ar: 'بحث يتحول إلى منتج.' },
  supporting: { en: 'Supporting proof · Live beta (tech2b)', de: 'Weiterer Nachweis · Live-Beta (tech2b)', fr: 'Preuve complémentaire · Bêta (tech2b)', es: 'Prueba adicional · Beta en vivo (tech2b)', ar: 'دليل إضافي · نسخة تجريبية (tech2b)' },
  caseStudy: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  caseStudyLink: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  thesisPdf: { en: 'Thesis PDF', de: 'Thesis PDF', fr: 'PDF mémoire', es: 'PDF tesis', ar: 'PDF الرسالة' },
  code: { en: 'Code', de: 'Code', fr: 'Code', es: 'Código', ar: 'الكود' },
  thesis: { en: "Master's Thesis · JKU Linz · Graded 1", de: 'Masterarbeit · JKU Linz · Note 1', fr: 'Mémoire M.Sc. · JKU Linz · Note 1', es: 'Tesis M.Sc. · JKU Linz · Nota 1', ar: 'رسالة الماجستير · JKU لينز · تقدير 1' },
  track2Eyebrow: { en: "Master's Thesis Track 2 · Industrial CV", de: 'Masterarbeit Track 2 · Industrial CV', fr: 'Mémoire Track 2 · Vision industrielle', es: 'Tesis Track 2 · Visión industrial', ar: 'المسار 2 للرسالة · رؤية صناعية' },
  oodTitle: { en: 'DiffusionOOD — OOD Detection Framework', de: 'DiffusionOOD — OOD-Erkennungsframework', fr: 'DiffusionOOD — Détection OOD', es: 'DiffusionOOD — Detección OOD', ar: 'DiffusionOOD — إطار كشف الخارج عن التوزيع' },
  oodDesc: {
    en: 'Conditional diffusion models as generative classifiers achieving 99.03% ± 0.07% average AUROC (3-seed mean) on a within-CIFAR airplane-vs-rest binary split (single ID class; not comparable to multi-class CIFAR-10 OOD benchmarks). Class-conditional separation loss added +6.5pp over the 92.52% ± 11.07% baseline while cutting cross-seed standard deviation.',
    de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren mit 99,03% ± 0,07% durchschnittlichem AUROC (3-Seed-Mittel) auf einem Within-CIFAR Airplane-vs-Rest Binary-Split (einzelne ID-Klasse). Die Separation Loss liefert +6,5 Prozentpunkte über der 92,52% ± 11,07% Baseline und senkt die Seed-Standardabweichung drastisch.',
    fr: "Modèles de diffusion conditionnels comme classificateurs génératifs atteignant 99,03% ± 0,07% d'AUROC moyen (moyenne 3 seeds) sur un split binaire airplane-vs-rest within-CIFAR (classe ID unique). La separation loss ajoute +6,5 points sur la baseline 92,52% ± 11,07% et réduit fortement l'écart-type.",
    es: 'Modelos de difusión condicional como clasificadores generativos con 99,03% ± 0,07% de AUROC medio (media de 3 seeds) en un split binario airplane-vs-rest within-CIFAR (clase ID única). La separation loss suma +6,5 pp sobre la base 92,52% ± 11,07% y reduce drásticamente la desviación estándar.',
    ar: 'نماذج انتشار شرطية كمصنفات توليدية حققت 99.03% ± 0.07% متوسط AUROC (عبر 3 بذور) على تقسيم ثنائي airplane-vs-rest ضمن CIFAR-10 (فئة ID واحدة). خفّضت خسارة الفصل الشرطية الانحراف المعياري بشكل حاد وأضافت +6.5 نقطة فوق الأساس 92.52% ± 11.07%.',
  },
  inkjetTitle: { en: 'InkjetOOD Defect Detection', de: 'InkjetOOD Defekterkennung', fr: 'Détection de défauts InkjetOOD', es: 'Detección de defectos InkjetOOD', ar: 'كشف العيوب InkjetOOD' },
  inkjetDesc: {
    en: 'YOLOv8 + conditional diffusion quality classification pipeline evaluated on the public FTI_Zer0P benchmark under strict 5-fold cross-validation.',
    de: 'YOLOv8 + konditionale Diffusions-Pipeline für Qualitätsklassifikation, evaluiert auf dem öffentlichen FTI_Zer0P Benchmark mit strenger 5-facher Kreuzvalidierung.',
    fr: 'Pipeline YOLOv8 + diffusion conditionnelle pour la qualité industrielle, évaluée sur le benchmark public FTI_Zer0P avec validation croisée stricte en 5 plis.',
    es: 'Pipeline YOLOv8 + difusión condicional para clasificación de calidad, evaluado en el benchmark público FTI_Zer0P con validación cruzada estricta de 5 folds.',
    ar: 'خط معالجة YOLOv8 + انتشار شرطي لتصنيف الجودة الصناعية، تم تقييمه على معيار FTI_Zer0P العام بتحقق تقاطعي صارم من 5 طيات.',
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
    en: 'Proactive personal-mentor assistant (Telegram @sihem_ai_bot & installable PWA). Built on Supabase Edge Functions (Deno/TS), deterministic generators→arbiter→composer nudging, pgvector RAG memory, and multi-provider LLM routing (GLM/Gemini/Groq) with failover.',
    de: 'Proaktiver persönlicher Mentor-Assistent (Telegram @sihem_ai_bot & PWA). Gebaut auf Supabase Edge Functions (Deno/TS) mit deterministischer Generatoren→Arbiter→Komponist-Engine, pgvector-RAG-Gedächtnis und Multi-Provider-LLM-Routing (GLM/Gemini/Groq) mit Failover.',
    fr: 'Assistant mentor personnel proactif (Telegram @sihem_ai_bot & PWA). Construit sur Supabase Edge Functions (Deno/TS) avec moteur déterministe générateurs→arbitre→compositeur, mémoire RAG pgvector et routage LLM multi-fournisseurs avec failover.',
    es: 'Asistente mentor personal proactivo (Telegram @sihem_ai_bot y PWA). Construido sobre Supabase Edge Functions (Deno/TS) con motor determinista generadores→árbitro→compositor, memoria RAG pgvector y enrutamiento LLM multiproveedor con failover.',
    ar: 'مساعد موجه شخصي استباقي (تيليجرام @sihem_ai_bot وتطبيق PWA). مبني على Supabase Edge Functions (Deno/TS) مع محرك قرار حتمي، وذاكرة RAG بـ pgvector، وتوجيه LLM متعدد المزودين مع تبديل تلقائي.',
  },
  mergeproofEyebrow: {
    en: 'Open source · Agent tooling',
    de: 'Open Source · Agent-Tooling',
    fr: 'Open source · Outillage agents',
    es: 'Open source · Herramientas para agentes',
    ar: 'مصدر مفتوح · أدوات الوكلاء',
  },
  mergeproofDesc: {
    en: 'Decides whether a pull request written by an AI agent is safe to merge. Plain deterministic code that never calls an LLM, so the agent being judged cannot talk its way past it.',
    de: 'Entscheidet, ob ein von einem KI-Agenten geschriebener Pull Request sicher gemergt werden kann. Reiner deterministischer Code, der niemals ein LLM aufruft — der beurteilte Agent kann sich nicht mit Worten daran vorbeimogeln.',
    fr: "Décide si une pull request écrite par un agent IA est sûre à fusionner. Du code déterministe pur qui n'appelle jamais de LLM — l'agent évalué ne peut pas convaincre le verdict par la parole.",
    es: 'Decide si un pull request escrito por un agente de IA es seguro para fusionar. Código determinista puro que nunca llama a un LLM — el agente evaluado no puede convencer al veredicto con palabras.',
    ar: 'يقرر ما إذا كان طلب الدمج المكتوب بواسطة وكيل ذكاء اصطناعي آمنًا للدمج. شيفرة حتمية خالصة لا تستدعي أي نموذج لغة — فلا يمكن للوكيل المُقيَّم الإفلات من الحكم بالكلام.',
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
                {['PyTorch', 'DDPM / UNet', 'Separation Loss', 'Hydra', 'W&B'].map(tag => (
                  <span key={tag} className="cd-proj-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="cd-proj-metric-big">
              <div className="cd-pc-metric" style={{ marginTop: 0 }}>99.03%<span> ± 0.07% Avg AUROC (3 seeds)</span></div>
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
            <div className="cd-pc-metric">0.8673<span> ± 0.0230 AUROC (5-Fold CV)</span></div>
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
              {['Deno / TS', 'Supabase', 'pgvector RAG', 'LLM Routing'].map(tag => (
                <span key={tag} className="cd-proj-tag">{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href="/case-studies/sihem/" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.caseStudyLink)} &rarr;</Link>
              <a href="https://t.me/sihem_ai_bot" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>Telegram &rarr;</a>
              <a href="https://sihem-pwa.pages.dev/" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>PWA &rarr;</a>
            </div>
          </article>

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
      </div>
    </section>
  )
}
