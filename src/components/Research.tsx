'use client'
import { useEffect, useState } from 'react'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const cifarCharts = [
  { src: '/fig_lambda_sweep.png', alt: 'Separation Loss Weight Sweep', caption: 'Separation weight sweep: best stability at lambda=0.02' },
  { src: '/fig_calibration.png', alt: 'Operating Threshold Calibration', caption: 'Score distributions at calibrated operating threshold' },
  { src: '/fig_per_timestep_error.png', alt: 'Per-Timestep Reconstruction Error', caption: 'Reconstruction error gap peaks at intermediate noise' },
]

const industrialCharts = [
  { src: '/fig_cross_domain_comparison.png', alt: 'Cross-Domain Impact of Separation Loss', caption: 'Cross-domain impact: CIFAR-10 gain vs. Inkjet QC variance' },
  { src: '/fig_inkjet_lambda.png', alt: 'Per-Feature AUROC Sweep', caption: 'Per-feature AUROC across separation weights' },
]

const formulaVisuals = [
  { src: '/research/separation-denoise-clean.png', alt: 'Noisy image becoming clean through denoising', caption: 'Step 1: reconstruct images under each class condition' },
  { src: '/research/separation-apart-clean.png', alt: 'Two model explanations being pushed apart', caption: 'Step 2: push the conditional explanations apart' },
  { src: '/research/separation-gap-clean.png', alt: 'Difference between reconstruction errors becoming an OOD signal', caption: 'Step 3: score the reconstruction gap as the OOD signal' },
]

const copy = {
  eyebrow: { en: '// 05 - Research', de: '// 05 - Forschung', fr: '// 05 - Recherche', es: '// 05 - Investigacion', ar: '// 05 - الأبحاث' },
  title: { en: 'Reports & Thesis', de: 'Berichte & Thesis', fr: 'Rapports & memoire', es: 'Informes y tesis', ar: 'التقارير والرسالة' },
  summaryProblemLabel: { en: 'Problem', de: 'Problem', fr: 'Probleme', es: 'Problema', ar: 'المشكلة' },
  summaryProblemText: {
    en: 'How can a model recognize when an image does not belong, instead of acting overconfident?',
    de: 'Wie kann ein Modell erkennen, dass ein Bild nicht zur Verteilung gehoert, statt uebertrieben sicher zu reagieren?',
    fr: 'Comment un modele peut-il reconnaitre qu une image ne lui appartient pas au lieu de repondre avec trop de confiance ?',
    es: 'Como puede un modelo reconocer que una imagen no pertenece a su distribucion en vez de responder con exceso de confianza?',
    ar: 'كيف يمكن للنموذج أن يدرك أن الصورة لا تنتمي إلى بياناته بدلاً من أن يجيب بثقة زائدة؟',
  },
  summaryContributionLabel: { en: 'Contribution', de: 'Beitrag', fr: 'Contribution', es: 'Contribucion', ar: 'المساهمة' },
  summaryContributionText: {
    en: 'A separation loss that forces the model s competing class explanations to move apart.',
    de: 'Eine Separation Loss, die konkurrierende Klassenerklaerungen des Modells auseinanderdrueckt.',
    fr: 'Une separation loss qui force les explications de classe concurrentes a s eloigner.',
    es: 'Una separation loss que obliga a separar las explicaciones de clase rivales del modelo.',
    ar: 'خسارة فصل تدفع تفسيرات الفئات المتنافسة داخل النموذج إلى الابتعاد عن بعضها.',
  },
  summaryResultLabel: { en: 'Result', de: 'Ergebnis', fr: 'Resultat', es: 'Resultado', ar: 'النتيجة' },
  summaryResultText: {
    en: '99.03% +/- 0.07% AUROC on CIFAR-10, with a +6.5pp gain over the non-separated baseline.',
    de: '99.03% +/- 0.07% AUROC auf CIFAR-10 mit +6.5 Prozentpunkten gegenueber der Basis ohne Separation.',
    fr: '99.03% +/- 0.07% AUROC sur CIFAR-10 avec un gain de +6.5 points face a la baseline sans separation.',
    es: '99.03% +/- 0.07% AUROC en CIFAR-10 con una mejora de +6.5 puntos sobre la base sin separacion.',
    ar: '99.03% +/- 0.07% AUROC على CIFAR-10 مع تحسن قدره +6.5 نقطة على الخط الأساسي بدون فصل.',
  },
  summaryImpactLabel: { en: 'Why it matters', de: 'Warum es zaehlt', fr: 'Pourquoi cela compte', es: 'Por que importa', ar: 'لماذا يهم ذلك' },
  summaryImpactText: {
    en: 'The score became not only higher, but dramatically more stable across seeds and easier to trust.',
    de: 'Der Score wurde nicht nur hoeher, sondern auch deutlich stabiler ueber verschiedene Seeds hinweg.',
    fr: 'Le score est devenu non seulement plus eleve, mais aussi beaucoup plus stable entre les seeds.',
    es: 'La puntuacion no solo subio, sino que tambien se volvio mucho mas estable entre semillas.',
    ar: 'لم ترتفع النتيجة فقط، بل أصبحت أكثر ثباتاً بكثير عبر البذور وأسهل في الثقة.',
  },
  track1: { en: "Master's Thesis (Track 1) - JKU Linz - 2026", de: 'Masterarbeit (Track 1) - JKU Linz - 2026', fr: 'Memoire de master (Track 1) - JKU Linz - 2026', es: 'Tesis de master (Track 1) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 1) - JKU Linz - 2026' },
  thesisTitle: { en: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection', de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren fur OOD-Erkennung', fr: 'Modeles de diffusion conditionnels comme classificateurs generatifs pour detection OOD', es: 'Modelos de difusion condicional como clasificadores generativos para deteccion OOD', ar: 'نماذج الانتشار الشرطية كمصنفات توليدية لكشف الخارج عن التوزيع' },
  thesisDesc: { en: 'A diffusion model compares how well different class explanations reconstruct an image. The new separation loss pushes those explanations apart, making the anomaly score clearer and more stable.', de: 'Ein Diffusionsmodell vergleicht, wie gut verschiedene Klassenerklarungen ein Bild rekonstruieren. Die neue Separation Loss trennt diese Erklarungen und macht den Anomalie-Score klarer und stabiler.', fr: 'Un modele de diffusion compare la reconstruction selon differentes explications de classe. La separation loss les eloigne et rend le score anomalie plus clair et stable.', es: 'Un modelo de difusion compara reconstrucciones bajo distintas explicaciones de clase. La separation loss las separa y hace el score de anomalia mas claro y estable.', ar: 'يقارن نموذج الانتشار مدى قدرة تفسيرات الفئات المختلفة على إعادة بناء الصورة. خسارة الفصل تبعد هذه التفسيرات وتجعل درجة الشذوذ أوضح وأكثر ثباتاً.' },
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  assistant: { en: 'Assistant', de: 'Assistent', fr: 'Assistant', es: 'Asistente', ar: 'المساعد' },
  metricLabel: { en: 'AUROC - CIFAR-10 Average', de: 'AUROC - CIFAR-10 Durchschnitt', fr: 'AUROC - moyenne CIFAR-10', es: 'AUROC - promedio CIFAR-10', ar: 'AUROC - متوسط CIFAR-10' },
  variance: { en: '+/-0.07% variance (3 seeds)', de: '+/-0.07% Varianz (3 Seeds)', fr: '+/-0.07% variance (3 seeds)', es: '+/-0.07% varianza (3 semillas)', ar: '+/-0.07% تباين (3 بذور)' },
  formulaLabel: { en: 'Novel contribution - separation loss', de: 'Neuer Beitrag - Separation Loss', fr: 'Contribution nouvelle - separation loss', es: 'Contribucion nueva - separation loss', ar: 'المساهمة الجديدة - خسارة الفصل' },
  plainIdea: { en: 'Plain idea: train the model to make its two explanations visibly different. The gap becomes the anomaly signal.', de: 'Einfache Idee: Das Modell soll zwei Erklarungen sichtbar unterscheiden. Der Abstand wird zum Anomalie-Signal.', fr: 'Idee simple : le modele apprend a rendre deux explications clairement differentes. L ecart devient le signal anomalie.', es: 'Idea simple: el modelo aprende a hacer distintas sus dos explicaciones. La brecha se vuelve la señal de anomalia.', ar: 'الفكرة ببساطة: ندرب النموذج كي يجعل تفسيرين مختلفين بوضوح. الفجوة بينهما تصبح إشارة الشذوذ.' },
  step1: { en: 'Learn to denoise', de: 'Entrauschen lernen', fr: 'Apprendre a denoiser', es: 'Aprender a limpiar ruido', ar: 'تعلم إزالة الضوضاء' },
  step1Text: { en: 'Reconstruct images under each class condition.', de: 'Bilder unter jeder Klassenbedingung rekonstruieren.', fr: 'Reconstruire les images sous chaque condition de classe.', es: 'Reconstruir imagenes bajo cada condicion de clase.', ar: 'إعادة بناء الصور تحت كل شرط فئة.' },
  step2: { en: 'Push explanations apart', de: 'Erklarungen trennen', fr: 'Eloigner les explications', es: 'Separar explicaciones', ar: 'إبعاد التفسيرات' },
  step2Text: { en: 'Increase the distance between conditional predictions.', de: 'Den Abstand zwischen konditionalen Vorhersagen erhohen.', fr: 'Augmenter la distance entre predictions conditionnelles.', es: 'Aumentar la distancia entre predicciones condicionales.', ar: 'زيادة المسافة بين التنبؤات الشرطية.' },
  step3: { en: 'Score the gap', de: 'Abstand bewerten', fr: 'Mesurer l ecart', es: 'Medir la brecha', ar: 'قياس الفجوة' },
  step3Text: { en: 'Use the reconstruction-error difference as the OOD signal.', de: 'Die Rekonstruktionsfehler-Differenz als OOD-Signal nutzen.', fr: 'Utiliser la difference d erreur de reconstruction comme signal OOD.', es: 'Usar la diferencia del error de reconstruccion como señal OOD.', ar: 'استخدام فرق خطأ إعادة البناء كإشارة OOD.' },
  totalLoss: { en: 'Total loss', de: 'Gesamtverlust', fr: 'Perte totale', es: 'Perdida total', ar: 'الخسارة الكلية' },
  denoiseLoss: { en: 'denoising loss', de: 'Entrauschungsverlust', fr: 'perte de denoising', es: 'perdida de limpieza', ar: 'خسارة إزالة الضوضاء' },
  sepLoss: { en: 'lambda * separation loss', de: 'lambda * Separation Loss', fr: 'lambda * separation loss', es: 'lambda * separation loss', ar: 'لامبدا * خسارة الفصل' },
  latest: { en: 'Latest thesis result: lambda = 0.02 reached 99.03% +/- 0.07% AUROC, a +6.5pp gain over no separation loss.', de: 'Aktuelles Thesis-Ergebnis: lambda = 0.02 erreicht 99.03% +/- 0.07% AUROC, +6.5pp gegenuber ohne Separation Loss.', fr: 'Resultat thesis recent : lambda = 0.02 atteint 99.03% +/- 0.07% AUROC, +6.5pp vs sans separation loss.', es: 'Resultado reciente: lambda = 0.02 alcanzo 99.03% +/- 0.07% AUROC, +6.5pp frente a sin separation loss.', ar: 'آخر نتيجة في الرسالة: lambda = 0.02 حققت 99.03% +/- 0.07% AUROC، بزيادة +6.5pp مقارنة بدون خسارة الفصل.' },
  thesisPdf: { en: 'View Full Thesis (PDF) ->', de: 'Vollstandige Thesis ansehen (PDF) ->', fr: 'Voir le memoire complet (PDF) ->', es: 'Ver tesis completa (PDF) ->', ar: 'عرض الرسالة كاملة (PDF) ->' },
  track2: { en: "Master's Thesis (Track 2) - JKU Linz - 2026", de: 'Masterarbeit (Track 2) - JKU Linz - 2026', fr: 'Memoire de master (Track 2) - JKU Linz - 2026', es: 'Tesis de master (Track 2) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 2) - JKU Linz - 2026' },
  track2Title: { en: 'Rigorous Cross-Domain Transfer & FTI_Zer0P Benchmark', de: 'Strenger Cross-Domain Transfer & FTI_Zer0P Benchmark', fr: 'Transfert cross-domain rigoureux & benchmark FTI_Zer0P', es: 'Transferencia cross-domain rigurosa y benchmark FTI_Zer0P', ar: 'انتقال صارم بين المجالات ومعيار FTI_Zer0P' },
  track2Desc: { en: 'The public YOLO+CDM print-quality pipeline was evaluated on FTI_Zer0P with strict 5-fold cross-validation, showing where separation loss transfers and where small manufacturing textures behave differently.', de: 'Die offentliche YOLO+CDM Pipeline wurde auf FTI_Zer0P mit strenger 5-facher Kreuzvalidierung evaluiert und zeigt die Grenzen der Ubertragbarkeit.', fr: 'La pipeline publique YOLO+CDM a ete evaluee sur FTI_Zer0P avec validation croisee stricte en 5 plis, montrant les limites du transfert.', es: 'La pipeline publica YOLO+CDM se evaluo en FTI_Zer0P con validacion cruzada estricta de 5 folds, mostrando los limites de transferencia.', ar: 'تم تقييم خط YOLO+CDM العام على FTI_Zer0P بتحقق تقاطعي صارم من 5 طيات، مع توضيح حدود انتقال خسارة الفصل.' },
  publicEval: { en: 'Rigorous Public Evaluation', de: 'Strenge offentliche Evaluierung', fr: 'Evaluation publique rigoureuse', es: 'Evaluacion publica rigurosa', ar: 'تقييم عام صارم' },
  industrialReport: { en: 'View Industrial Report ->', de: 'Industriebericht ansehen ->', fr: 'Voir le rapport industriel ->', es: 'Ver informe industrial ->', ar: 'عرض التقرير الصناعي ->' },
} satisfies Record<string, TranslationMap>

const publications = [
  { title: 'Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation', venue: 'Karunya University - 2023', href: 'https://ahmed-3m.github.io/Motor%20Imagery%20classification%20Based%20Brain%20Computer.pdf' },
  { title: 'Reading Thoughts Using GANs', venue: 'Project Report - JKU Linz - 2023', href: 'https://ahmed-3m.github.io/Reading%20Thoughts%20Using%20GANs.pdf' },
]

export default function Research() {
  useReveal()
  const { t } = useI18n()
  const [lightbox, setLightbox] = useState<{ type: 'cifar' | 'industrial' | 'formula', index: number } | null>(null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <section id="research" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 32 }}>{t(copy.title)}</h2>

        <div
          className="reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            [t(copy.summaryProblemLabel), t(copy.summaryProblemText)],
            [t(copy.summaryContributionLabel), t(copy.summaryContributionText)],
            [t(copy.summaryResultLabel), t(copy.summaryResultText)],
            [t(copy.summaryImpactLabel), t(copy.summaryImpactText)],
          ].map(([label, text]) => (
            <div
              className="cd-summary-card glass-surface glass-subtle"
              key={label}
            >
              <div className="cd-band-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
              <div style={{ color: 'var(--cd-fg2)', fontSize: 14, lineHeight: 1.65 }}>{text}</div>
            </div>
          ))}
        </div>

        <div className="cd-research-featured reveal" itemScope itemType="https://schema.org/Thesis">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">{t(copy.track1)}</div>
              <div className="cd-rf-title" itemProp="name">{t(copy.thesisTitle)}</div>
              <div className="cd-rf-desc" itemProp="description">
                {t(copy.thesisDesc)} <strong>99.03% +/- 0.07% AUROC</strong>, <strong>+6.5pp gain</strong>, baseline 92.52% +/- 11.07%, external OOD 90.50%-96.97%.
              </div>
              <div className="cd-rf-meta">
                {t(copy.supervisor)}: Prof. Sepp Hochreiter (LSTM Inventor) - {t(copy.assistant)}: Claus Hofmann, MSc - JKU Linz - 2026
              </div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">99.03<span className="cd-rf-metric-unit">%</span></div>
              <div className="cd-rf-metric-label">{t(copy.metricLabel)}</div>
              <div className="cd-rf-metric-delta">{t(copy.variance)}</div>
            </div>
          </div>

          <div className="cd-rf-charts">
            {cifarCharts.map(({ src, alt, caption }, index) => (
              <div key={src} className="cd-rf-chart cd-rf-chart--zoom" onClick={() => setLightbox({ type: 'cifar', index })} title="Click to expand">
                <img src={src} alt={alt} style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }} />
                <div className="cd-rf-chart-caption">{caption}</div>
              </div>
            ))}
          </div>

          <div className="cd-rf-formula-box">
            <div className="cd-rfc-simple-label">{t(copy.formulaLabel)}</div>
            <div className="cd-rfc-summary">{t(copy.plainIdea)}</div>
            <div className="cd-rfc-flow" aria-label="Separation loss workflow">
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={() => setLightbox({ type: 'formula', index: 0 })} title="Click to expand">
                  <img src={formulaVisuals[0].src} alt={formulaVisuals[0].alt} className="cd-rfc-visual cd-rf-chart--zoom" />
                </button>
                <span className="cd-rfc-step">1</span>
                <strong>{t(copy.step1)}</strong>
                <span>{t(copy.step1Text)}</span>
              </div>
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={() => setLightbox({ type: 'formula', index: 1 })} title="Click to expand">
                  <img src={formulaVisuals[1].src} alt={formulaVisuals[1].alt} className="cd-rfc-visual cd-rf-chart--zoom" />
                </button>
                <span className="cd-rfc-step">2</span>
                <strong>{t(copy.step2)}</strong>
                <span>{t(copy.step2Text)}</span>
              </div>
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={() => setLightbox({ type: 'formula', index: 2 })} title="Click to expand">
                  <img src={formulaVisuals[2].src} alt={formulaVisuals[2].alt} className="cd-rfc-visual cd-rf-chart--zoom" />
                </button>
                <span className="cd-rfc-step">3</span>
                <strong>{t(copy.step3)}</strong>
                <span>{t(copy.step3Text)}</span>
              </div>
            </div>
            <div className="cd-rfc-compact-formula">
              <span>{t(copy.totalLoss)}</span><strong>=</strong><span>{t(copy.denoiseLoss)}</span><strong>+</strong><span>{t(copy.sepLoss)}</span>
            </div>
            <div className="cd-rfc-result">{t(copy.latest)}</div>
          </div>

          <div className="cd-rf-footer">
            <a href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.thesisPdf)}
            </a>
          </div>
        </div>

        <div className="cd-research-featured reveal">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">{t(copy.track2)}</div>
              <div className="cd-rf-title">{t(copy.track2Title)}</div>
              <div className="cd-rf-desc">{t(copy.track2Desc)} <strong>0.8673 +/- 0.0230 AUROC</strong>.</div>
              <div className="cd-rf-meta">Public Benchmark - InkjetOOD Codebase - FTI_Zer0P Public Dataset</div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">0.8673</div>
              <div className="cd-rf-metric-label">AUROC - 5-Fold CV Baseline</div>
              <div className="cd-rf-metric-delta">{t(copy.publicEval)}</div>
            </div>
          </div>

          <div className="cd-rf-charts" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {industrialCharts.map(({ src, alt, caption }, index) => (
              <div key={src} className="cd-rf-chart cd-rf-chart--zoom" onClick={() => setLightbox({ type: 'industrial', index })} title="Click to expand">
                <img src={src} alt={alt} style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }} />
                <div className="cd-rf-chart-caption">{caption}</div>
              </div>
            ))}
          </div>

          <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">{t(copy.industrialReport)}</a>
            <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>Code: InkjetOOD -&gt;</a>
            <a href="https://huggingface.co/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>HF: Model Weights -&gt;</a>
            <a href="https://github.com/ahmed-3m/zer0p_notebooks" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.7 }}>R&amp;D Notebooks -&gt;</a>
          </div>
        </div>

        <div className="cd-pub-list">
          {publications.map(pub => (
            <a key={pub.href} href={pub.href} target="_blank" rel="noopener noreferrer" className="cd-pub-item reveal">
              <div>
                <div className="cd-pub-title">{pub.title}</div>
                <div className="cd-pub-venue">{pub.venue}</div>
              </div>
              <div className="cd-pub-arrow">-&gt;</div>
            </a>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="cd-lightbox" onClick={() => setLightbox(null)}>
          <div className="cd-lightbox-inner" onClick={event => event.stopPropagation()}>
            <button className="cd-lightbox-close" onClick={() => setLightbox(null)}>x</button>
            {lightbox.type === 'industrial' ? (
              <>
                <img src={industrialCharts[lightbox.index].src} alt={industrialCharts[lightbox.index].alt} />
                <div className="cd-lightbox-caption">{industrialCharts[lightbox.index].caption}</div>
              </>
            ) : lightbox.type === 'formula' ? (
              <>
                <img src={formulaVisuals[lightbox.index].src} alt={formulaVisuals[lightbox.index].alt} />
                <div className="cd-lightbox-caption">{formulaVisuals[lightbox.index].caption}</div>
              </>
            ) : (
              <>
                <img src={cifarCharts[lightbox.index].src} alt={cifarCharts[lightbox.index].alt} />
                <div className="cd-lightbox-caption">{cifarCharts[lightbox.index].caption}</div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
