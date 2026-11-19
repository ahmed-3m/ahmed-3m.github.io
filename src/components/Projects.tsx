'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  title: { en: 'Other projects and open source', de: 'Weitere Projekte und Open Source', fr: 'Autres projets et open source', es: 'Otros proyectos y código abierto', ar: 'مشاريع أخرى ومصادر مفتوحة' },
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
  code: { en: 'Code', de: 'Code', fr: 'Code', es: 'Código', ar: 'الكود' },
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

export default function AdditionalProjects() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="other-projects" className="cd-section">
      <div className="cd-container">
        <h2 className="cd-section-title">{t(copy.title)}</h2>
        <div className="cd-projects-grid">
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
              <a href="https://github.com/ahmed-3m/mergeproof" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">Karunya Institute of Technology and Sciences · BCI Research</div>
            <h3 className="cd-pc-title">{t(copy.eegTitle)}</h3>
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
