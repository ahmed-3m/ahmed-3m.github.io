'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'
import { BENCHMARK_DATASETS } from '@/lib/ood-explorer-data'

/**
 * Hero "signal panel": the real seed-42 anomaly-score histogram from the thesis
 * (CIFAR-10 airplane = ID vs. the other nine classes = OOD, lambda = 0.02, K = 100),
 * drawn as two step areas with the TPR@95 operating threshold. Numbers come straight
 * from src/lib/ood-explorer-data.ts — nothing here is invented or smoothed.
 */

const copy = {
  kicker: {
    en: 'Thesis · live data',
    de: 'Thesis · echte Daten',
    fr: 'Thèse · données réelles',
    es: 'Tesis · datos reales',
    ar: 'الرسالة · بيانات حقيقية',
  },
  title: {
    en: 'Diffusion anomaly scores separate ID from OOD',
    de: 'Diffusions-Anomaliescores trennen ID von OOD',
    fr: "Les scores d'anomalie par diffusion séparent ID et OOD",
    es: 'Las puntuaciones de anomalía por difusión separan ID de OOD',
    ar: 'درجات الشذوذ بالانتشار تفصل البيانات الداخلية عن الخارجية',
  },
  id: {
    en: 'In-distribution · airplane',
    de: 'In-Distribution · Flugzeug',
    fr: 'In-distribution · avion',
    es: 'En distribución · avión',
    ar: 'داخل التوزيع · طائرة',
  },
  ood: {
    en: 'Out-of-distribution · 9 other classes',
    de: 'Out-of-Distribution · 9 andere Klassen',
    fr: 'Hors distribution · 9 autres classes',
    es: 'Fuera de distribución · otras 9 clases',
    ar: 'خارج التوزيع · 9 فئات أخرى',
  },
  threshold: { en: 'τ @ TPR 95', de: 'τ @ TPR 95', fr: 'τ @ TPR 95', es: 'τ @ TPR 95', ar: 'τ @ TPR 95' },
  axis: {
    en: 'anomaly score →',
    de: 'Anomaliescore →',
    fr: "score d'anomalie →",
    es: 'puntuación de anomalía →',
    ar: 'درجة الشذوذ →',
  },
  caption: {
    en: 'CIFAR-10, seed 42, λ = 0.02, K = 100 · 1,000 ID vs 9,000 OOD test images',
    de: 'CIFAR-10, Seed 42, λ = 0,02, K = 100 · 1.000 ID- vs. 9.000 OOD-Testbilder',
    fr: 'CIFAR-10, seed 42, λ = 0,02, K = 100 · 1 000 images ID vs 9 000 OOD',
    es: 'CIFAR-10, seed 42, λ = 0,02, K = 100 · 1.000 imágenes ID vs 9.000 OOD',
    ar: 'CIFAR-10، seed 42، λ = 0.02، K = 100 · 1,000 صورة داخلية مقابل 9,000 خارجية',
  },
  explore: {
    en: 'Explore the interactive lab',
    de: 'Interaktives Labor öffnen',
    fr: 'Explorer le labo interactif',
    es: 'Explorar el laboratorio interactivo',
    ar: 'استكشف المختبر التفاعلي',
  },
  chartLabel: {
    en: 'Histogram of diffusion anomaly scores: in-distribution airplane images cluster at low scores, out-of-distribution images at higher scores, with the TPR 95 threshold between them. AUROC 98.98%, FPR at 95% TPR 4.7%.',
    de: 'Histogramm der Diffusions-Anomaliescores: In-Distribution-Flugzeugbilder liegen bei niedrigen Scores, Out-of-Distribution-Bilder bei höheren, dazwischen die TPR-95-Schwelle. AUROC 98,98 %, FPR bei 95 % TPR 4,7 %.',
    fr: "Histogramme des scores d'anomalie par diffusion : les images d'avions in-distribution se regroupent aux scores bas, les images hors distribution aux scores plus élevés, avec le seuil TPR 95 entre les deux. AUROC 98,98 %, FPR à 95 % de TPR 4,7 %.",
    es: 'Histograma de puntuaciones de anomalía por difusión: las imágenes de aviones en distribución se agrupan en puntuaciones bajas y las fuera de distribución en puntuaciones más altas, con el umbral TPR 95 entre ambas. AUROC 98,98 %, FPR al 95 % de TPR 4,7 %.',
    ar: 'مدرج تكراري لدرجات الشذوذ: صور الطائرات داخل التوزيع تتجمع عند درجات منخفضة، والصور خارج التوزيع عند درجات أعلى، مع عتبة TPR 95 بينهما. AUROC 98.98%، وFPR عند 95% TPR يساوي 4.7%.',
  },
} satisfies Record<string, TranslationMap>

const W = 360
const H = 150
const PAD_X = 6
const BASE = H - 4

function stepArea(pct: readonly number[], yMax: number): string {
  const n = pct.length
  const bw = (W - PAD_X * 2) / n
  let d = `M${PAD_X},${BASE}`
  pct.forEach((v, i) => {
    const y = BASE - (v / yMax) * (BASE - 8)
    const x0 = PAD_X + i * bw
    d += ` L${x0.toFixed(2)},${y.toFixed(2)} L${(x0 + bw).toFixed(2)},${y.toFixed(2)}`
  })
  d += ` L${W - PAD_X},${BASE} Z`
  return d
}

export default function HeroSignal() {
  const { t } = useI18n()
  const ds = BENCHMARK_DATASETS.within_cifar
  const h = ds.histogram
  const yMax = Math.max(...h.id_pct, ...h.ood_pct)
  const tauX = PAD_X + ((ds.tauTpr95 - h.lo) / (h.hi - h.lo)) * (W - PAD_X * 2)

  return (
    <figure className="cd-signal" dir="ltr">
      <div className="cd-signal-head">
        <span className="cd-signal-kicker">
          <span className="cd-signal-rec" aria-hidden="true" />
          {t(copy.kicker)}
        </span>
        <span className="cd-signal-meta">seed 42</span>
      </div>
      <p className="cd-signal-title">{t(copy.title)}</p>

      <div className="cd-signal-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(copy.chartLabel)} preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PAD_X} x2={W - PAD_X} y1={BASE - f * (BASE - 8)} y2={BASE - f * (BASE - 8)} className="cd-signal-grid" />
          ))}
          <rect x={tauX} y={0} width={W - PAD_X - tauX} height={BASE} className="cd-signal-flag" />
          <path d={stepArea(h.ood_pct, yMax)} className="cd-signal-ood" />
          <path d={stepArea(h.id_pct, yMax)} className="cd-signal-id" />
          <line x1={PAD_X} x2={W - PAD_X} y1={BASE} y2={BASE} className="cd-signal-axis" />
          <line x1={tauX} x2={tauX} y1={2} y2={BASE} className="cd-signal-tau" />
        </svg>
        <span className="cd-signal-tau-label" style={{ left: `${(tauX / W) * 100}%` }}>{t(copy.threshold)}</span>
      </div>
      <div className="cd-signal-axis-label">{t(copy.axis)}</div>

      <ul className="cd-signal-legend">
        <li><span className="sw sw-id" aria-hidden="true" />{t(copy.id)}</li>
        <li><span className="sw sw-ood" aria-hidden="true" />{t(copy.ood)}</li>
      </ul>

      <dl className="cd-signal-metrics">
        <div><dt>AUROC</dt><dd>{ds.auroc.toFixed(2)}<span>%</span></dd></div>
        <div><dt>FPR@95</dt><dd>{ds.fpr95.toFixed(1)}<span>%</span></dd></div>
        <div><dt>AUPRC</dt><dd>{ds.auprc.toFixed(2)}<span>%</span></dd></div>
      </dl>

      <figcaption className="cd-signal-caption">{t(copy.caption)}</figcaption>
      <a href="#ood-explorer" className="cd-signal-link">{t(copy.explore)} <span aria-hidden="true">&rarr;</span></a>
    </figure>
  )
}
