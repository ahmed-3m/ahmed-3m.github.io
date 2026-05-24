'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 02 - Projects', de: '// 02 - Projekte', fr: '// 02 - Projets', es: '// 02 - Proyectos', ar: '// 02 - المشاريع' },
  title: { en: 'Research that ships.', de: 'Forschung, die produktiv wird.', fr: 'La recherche qui devient produit.', es: 'Investigacion que llega a produccion.', ar: 'بحث يتحول إلى منتج.' },
  live: { en: 'Live SaaS - Founder', de: 'Live SaaS - Grunder', fr: 'SaaS en ligne - Fondateur', es: 'SaaS activo - Fundador', ar: 'منصة SaaS مباشرة - المؤسس' },
  faultrix: {
    en: 'AI-powered construction quality control SaaS. Analyzes building photos and generates ONORM-compliant reports in under 1 minute - SHA-256 evidence chain, DSGVO compliant, AES-256 encryption. Built solo from zero to production.',
    de: 'KI-gestutztes SaaS fur Bauqualitatskontrolle. Analysiert Baustellenfotos und erstellt ONORM-konforme Berichte in unter 1 Minute - SHA-256 Beweiskette, DSGVO-konform, AES-256 Verschlusselung. Solo von null bis Produktion gebaut.',
    fr: 'SaaS de controle qualite construction par IA. Analyse les photos de chantier et genere des rapports conformes ONORM en moins d une minute - chaine de preuve SHA-256, conforme DSGVO, chiffrement AES-256.',
    es: 'SaaS de control de calidad en construccion con IA. Analiza fotos de obra y genera informes compatibles con ONORM en menos de 1 minuto - cadena SHA-256, cumplimiento DSGVO, cifrado AES-256.',
    ar: 'منصة SaaS لمراقبة جودة البناء بالذكاء الاصطناعي. تحلل صور المواقع وتنشئ تقارير متوافقة مع ONORM خلال أقل من دقيقة مع سلسلة أدلة SHA-256 وتشفير AES-256.',
  },
  reportMetric: { en: 'min per report', de: 'Min. pro Bericht', fr: 'min par rapport', es: 'min por informe', ar: 'دقيقة لكل تقرير' },
  thesis: { en: "Master's Thesis - JKU Linz", de: 'Masterarbeit - JKU Linz', fr: 'Memoire de master - JKU Linz', es: 'Tesis de master - JKU Linz', ar: 'رسالة ماجستير - JKU Linz' },
  oodTitle: { en: 'OOD Detection Framework', de: 'OOD-Erkennungsframework', fr: 'Framework de detection OOD', es: 'Framework de deteccion OOD', ar: 'إطار كشف الخارج عن التوزيع' },
  oodDesc: {
    en: 'Conditional diffusion models as generative classifiers achieving 99.03% +/- 0.07% average AUROC on CIFAR-10 OOD detection. Introduced class-conditional separation loss improving average performance by 6.5 percentage points with high seed stability.',
    de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren mit 99.03% +/- 0.07% durchschnittlichem AUROC fur CIFAR-10 OOD-Erkennung. Die Separation Loss verbessert die Leistung stabil um 6.5 Prozentpunkte.',
    fr: 'Modeles de diffusion conditionnels utilises comme classificateurs generatifs, avec 99.03% +/- 0.07% AUROC moyen sur CIFAR-10 OOD. La separation loss ameliore la stabilite et ajoute 6.5 points.',
    es: 'Modelos de difusion condicional como clasificadores generativos con 99.03% +/- 0.07% AUROC medio en CIFAR-10 OOD. La separation loss mejora la estabilidad y suma 6.5 puntos.',
    ar: 'نماذج انتشار شرطية كمصنفات توليدية حققت 99.03% +/- 0.07% AUROC في كشف OOD على CIFAR-10، مع خسارة فصل حسنت الثبات والأداء بمقدار 6.5 نقطة.',
  },
  inkjetTitle: { en: 'InkjetOOD Defect Detection', de: 'InkjetOOD Defekterkennung', fr: 'Detection de defauts InkjetOOD', es: 'Deteccion de defectos InkjetOOD', ar: 'كشف العيوب InkjetOOD' },
  inkjetDesc: {
    en: 'YOLO+CDM quality classification pipeline evaluated on the public FTI_Zer0P benchmark under strict 5-fold cross-validation.',
    de: 'YOLO+CDM Pipeline fur Qualitatsklassifikation, evaluiert auf dem offentlichen FTI_Zer0P Benchmark mit strenger 5-facher Kreuzvalidierung.',
    fr: 'Pipeline YOLO+CDM pour la qualite, evalue sur le benchmark public FTI_Zer0P avec validation croisee stricte en 5 plis.',
    es: 'Pipeline YOLO+CDM para clasificacion de calidad, evaluado en el benchmark publico FTI_Zer0P con validacion cruzada estricta de 5 folds.',
    ar: 'خط معالجة YOLO+CDM لتصنيف الجودة، تم تقييمه على معيار FTI_Zer0P العام بتحقق تقاطعي صارم من 5 طيات.',
  },
  eegTitle: { en: 'EEG Signal Classification', de: 'EEG-Signalklassifikation', fr: 'Classification de signaux EEG', es: 'Clasificacion de señales EEG', ar: 'تصنيف إشارات EEG' },
  eegDesc: {
    en: 'LSTM, Bi-LSTM, and GRU architectures for motor imagery classification in brain-computer interface applications.',
    de: 'LSTM-, Bi-LSTM- und GRU-Architekturen fur Motor-Imagery-Klassifikation in Brain-Computer-Interfaces.',
    fr: 'Architectures LSTM, Bi-LSTM et GRU pour la classification d imagerie motrice dans les interfaces cerveau-ordinateur.',
    es: 'Arquitecturas LSTM, Bi-LSTM y GRU para clasificacion de imaginacion motora en interfaces cerebro-computadora.',
    ar: 'معماريات LSTM وBi-LSTM وGRU لتصنيف التخيل الحركي في تطبيقات واجهة الدماغ والحاسوب.',
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
          <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" className="cd-project-featured reveal">
            <div>
              <div className="cd-proj-eyebrow">{t(copy.live)}</div>
              <div className="cd-proj-title">Faultrix</div>
              <div className="cd-proj-desc">{t(copy.faultrix)}</div>
              <div className="cd-proj-tags">
                {['Next.js', 'Convex', 'OpenAI', 'Clerk', 'Cloudflare R2', 'Stripe'].map(tag => (
                  <span key={tag} className="cd-proj-tag">{tag}</span>
                ))}
              </div>
              <span className="cd-proj-link">faultrix.com &rarr;</span>
            </div>
            <div className="cd-proj-metric-big">
              <div className="num">&lt;1</div>
              <div className="unit">{t(copy.reportMetric)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)', marginTop: 8 }}>
                ONORM · DSGVO compliant
              </div>
            </div>
          </a>

          <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.thesis)}</div>
            <div className="cd-pc-title">{t(copy.oodTitle)}</div>
            <div className="cd-pc-desc">{t(copy.oodDesc)}</div>
            <div className="cd-pc-metric">99.03%<span> +/- 0.07% Avg AUROC</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="cd-proj-link" style={{ fontSize: 12 }}>DiffusionOOD &rarr;</span>
              <span className="cd-proj-link" style={{ fontSize: 12, opacity: 0.65 }}>+ InkjetOOD · HF Weights</span>
            </div>
          </a>

          <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">Master&apos;s Thesis Track 2</div>
            <div className="cd-pc-title">{t(copy.inkjetTitle)}</div>
            <div className="cd-pc-desc">{t(copy.inkjetDesc)}</div>
            <div className="cd-pc-metric">0.8673<span> AUROC (5-Fold CV)</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="cd-proj-link" style={{ fontSize: 12 }}>InkjetOOD &rarr;</span>
              <span className="cd-proj-link" style={{ fontSize: 12, opacity: 0.65 }}>+ HF Weights · Report PDF</span>
            </div>
          </a>

          <a href="https://github.com/ahmed-3m/Motor-Imagery-classification" target="_blank" rel="noopener noreferrer" className="cd-project-card cd-project-card--full reveal">
            <div className="cd-pc-eyebrow">Karunya University · BCI Research</div>
            <div className="cd-pc-title">{t(copy.eegTitle)}</div>
            <div className="cd-pc-desc">{t(copy.eegDesc)}</div>
          </a>
        </div>
      </div>
    </section>
  )
}
