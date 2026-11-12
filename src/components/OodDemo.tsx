'use client'

import React, { useState, useMemo, useId } from 'react'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import {
  BENCHMARK_DATASETS,
  LAMBDA0_SEED42_HISTOGRAM,
  LAMBDA0_SEED42_META,
  PER_TIMESTEP_ERRORS,
  SCORING_METHODS,
  TIMESTEP_STRATEGIES,
  K_ABLATION_TABLE,
  CIFAR_LAMBDA_SWEEP,
  INKJET_OVERALL_SWEEP,
  INKJET_PER_FEATURE,
  type OodDatasetKey,
  type ScoringRuleKey,
  type InkjetLambdaKey,
} from '@/lib/ood-explorer-data'

type LabTab = 'calibration' | 'timesteps' | 'ablations'

const DATASET_LABELS: Record<OodDatasetKey, TranslationMap> = {
  within_cifar: {
    en: 'Within-CIFAR-10 (Airplane vs 9 Rest)',
    de: 'Within-CIFAR-10 (Flugzeug vs. 9 Rest)',
    fr: 'Within-CIFAR-10 (Avion vs 9 autres)',
    es: 'Within-CIFAR-10 (Avión vs 9 restantes)',
    ar: 'ضمن CIFAR-10 (طائرة مقابل 9 فئات)',
  },
  cifar100: {
    en: 'CIFAR-100 (Near-OOD · 100 classes)',
    de: 'CIFAR-100 (Near-OOD · 100 Klassen)',
    fr: 'CIFAR-100 (Near-OOD · 100 classes)',
    es: 'CIFAR-100 (Near-OOD · 100 clases)',
    ar: 'CIFAR-100 (شذوذ قريب · 100 فئة)',
  },
  places365: {
    en: 'Places365 (Far-OOD · Scenes)',
    de: 'Places365 (Far-OOD · Szenen)',
    fr: 'Places365 (Far-OOD · Scènes)',
    es: 'Places365 (Far-OOD · Escenas)',
    ar: 'Places365 (شذوذ بعيد · مشاهد)',
  },
  fashionmnist: {
    en: 'FashionMNIST (Far-OOD · Greyscale)',
    de: 'FashionMNIST (Far-OOD · Graustufen)',
    fr: 'FashionMNIST (Far-OOD · Niveaux de gris)',
    es: 'FashionMNIST (Far-OOD · Escala de grises)',
    ar: 'FashionMNIST (شذوذ بعيد · رمادي)',
  },
  textures: {
    en: 'Textures / DTD (Far-OOD · 47 classes)',
    de: 'Textures / DTD (Far-OOD · 47 Klassen)',
    fr: 'Textures / DTD (Far-OOD · 47 classes)',
    es: 'Textures / DTD (Far-OOD · 47 clases)',
    ar: 'Textures / DTD (شذوذ بعيد · 47 فئة)',
  },
  svhn: {
    en: 'SVHN (Far-OOD · House Numbers)',
    de: 'SVHN (Far-OOD · Hausnummern)',
    fr: 'SVHN (Far-OOD · Numéros de rue)',
    es: 'SVHN (Far-OOD · Números de calle)',
    ar: 'SVHN (شذوذ بعيد · أرقام المباني)',
  },
}

const copy = {
  eyebrow: {
    en: '// INTERACTIVE THESIS LAB · JKU LINZ (GRADE 1.0)',
    de: '// INTERAKTIVES THESIS-LABOR · JKU LINZ (NOTE 1,0)',
    fr: '// LABORATOIRE INTERACTIF DE THÈSE · JKU LINZ (NOTE 1,0)',
    es: '// LABORATORIO INTERACTIVO DE TESIS · JKU LINZ (NOTA 1.0)',
    ar: '// مختبر الأطروحة التفاعلي · جامعة JKU لينتس (الدرجة 1.0)',
  },
  title: {
    en: 'Conditional Diffusion as a Generative Classifier: Interactive Evidence Explorer',
    de: 'Konditionale Diffusion als generativer Klassifikator: Interaktiver Evidenz-Explorer',
    fr: 'Diffusion conditionnelle comme classificateur génératif : Explorateur interactif',
    es: 'Difusión condicional como clasificador generativo: Explorador interactivo de evidencia',
    ar: 'الانتشار الشرطي كمصنّف توليدي: مستكشف الأدلة التفاعلي',
  },
  subtitle: {
    en: 'Built directly from the raw PyTorch score tensors (seed42_*.pt) and ablation JSON artefacts on Hugging Face (ahmed-3m/DiffusionOOD). Explore how the class-conditional separation loss (Eq. 3.23), contrastive noise-error scoring (Eq. 3.3), Monte Carlo trial budget K, and industrial transfer behave.',
    de: 'Direkt aus den realen PyTorch-Score-Tensoren (seed42_*.pt) und Ablations-Artefakten auf Hugging Face (ahmed-3m/DiffusionOOD) erstellt. Erkunden Sie Separation Loss (Gl. 3.23), kontrastives Scoring (Gl. 3.3), Monte-Carlo-Budget K und den Industrietransfer.',
    fr: 'Construit directement à partir des tenseurs PyTorch réels (seed42_*.pt) et des artefacts JSON sur Hugging Face (ahmed-3m/DiffusionOOD). Explorez la perte de séparation (Éq. 3.23), le score contrastif (Éq. 3.3), le budget Monte Carlo K et le transfert industriel.',
    es: 'Construido directamente desde los tensores reales de PyTorch (seed42_*.pt) y artefactos JSON en Hugging Face (ahmed-3m/DiffusionOOD). Explore la pérdida de separación (Ec. 3.23), el puntaje contrastivo (Ec. 3.3), el presupuesto Monte Carlo K y la transferencia industrial.',
    ar: 'مبني مباشرة من موتورات النتائج الحقيقية (seed42_*.pt) وملفات التقييم على Hugging Face (ahmed-3m/DiffusionOOD). استكشف دالة الفصل الشرطية (معادلة 3.23)، التقييم التبايني (معادلة 3.3)، ميزانية مونت كارلو K، والنقل الصناعي.',
  },
  tabCalibration: {
    en: '1. Score Distributions & Threshold (τ)',
    de: '1. Score-Verteilungen & Schwelle (τ)',
    fr: '1. Distributions des scores & Seuil (τ)',
    es: '1. Distribuciones de score y Umbral (τ)',
    ar: '1. توزيعات الدرجات وعتبة القرار (τ)',
  },
  tabTimesteps: {
    en: '2. Per-Timestep Denoising (t) & Scoring Rules',
    de: '2. Pro-Zeitschritt-Denoising (t) & Scoring',
    fr: '2. Débruitage par pas (t) & Règles de score',
    es: '2. Denoising por paso (t) y Reglas de score',
    ar: '2. إزالة الضوضاء عبر الزمن (t) وطرق التقييم',
  },
  tabsAria: {
    en: 'Interactive Thesis Explorer Tabs',
    de: 'Interaktive Thesis-Explorer-Tabs',
    fr: "Onglets de l'explorateur interactif de la thèse",
    es: 'Pestañas del explorador interactivo de la tesis',
    ar: 'تبويبات مستكشف الأطروحة التفاعلي',
  },
  tabAblations: {
    en: '3. Separation Loss (λ), MC Trials (K) & Inkjet QC',
    de: '3. Separation Loss (λ), MC-Trials (K) & Inkjet QC',
    fr: '3. Perte de séparation (λ), Essais MC (K) & Inkjet QC',
    es: '3. Pérdida de separación (λ), Ensayos MC (K) e Inkjet QC',
    ar: '3. خسارة الفصل (λ)، تجارب مونت كارلو (K) وجودة الطباعة',
  },
  regimeHeading: {
    en: 'Training Objective Regime (Eq. 3.24: L = L_diffusion + λ · L_sep)',
    de: 'Trainingsziel-Regime (Gl. 3.24: L = L_diffusion + λ · L_sep)',
    fr: "Régime d'objectif d'entraînement (Éq. 3.24 : L = L_diffusion + λ · L_sep)",
    es: 'Régimen del objetivo de entrenamiento (Ec. 3.24: L = L_diffusion + λ · L_sep)',
    ar: 'نظام هدف التدريب (معادلة 3.24: L = L_diffusion + λ · L_sep)',
  },
  regimeSep: {
    en: 'λ = 0.02 · With Separation Loss (99.03% ± 0.07% 3-seed · 98.98% seed-42)',
    de: 'λ = 0.02 · Mit Separation Loss (99,03% ± 0,07% 3-Seeds · 98,98% Seed-42)',
    fr: 'λ = 0.02 · Avec Separation Loss (99,03% ± 0,07% 3 graines · 98,98% seed-42)',
    es: 'λ = 0.02 · Con Separation Loss (99.03% ± 0.07% 3 semillas · 98.98% seed-42)',
    ar: 'λ = 0.02 · مع خسارة الفصل (99.03% ± 0.07% لـ 3 بذور · 98.98% لبذرة 42)',
  },
  regimeBase: {
    en: 'λ = 0.00 · Baseline No Sep. Loss (92.52% ± 11.07% 3-seed · 79.73% seed-42)',
    de: 'λ = 0.00 · Baseline ohne Sep. Loss (92,52% ± 11,07% 3-Seeds · 79,73% Seed-42)',
    fr: 'λ = 0.00 · Baseline sans Sep. Loss (92,52% ± 11,07% 3 graines · 79,73% seed-42)',
    es: 'λ = 0.00 · Baseline sin Sep. Loss (92.52% ± 11.07% 3 semillas · 79.73% seed-42)',
    ar: 'λ = 0.00 · خط الأساس بدون فصل (92.52% ± 11.07% لـ 3 بذور · 79.73% لبذرة 42)',
  },
  datasetHeading: {
    en: 'Evaluation Benchmark (Table 6.1 · Seed 42 Raw Score Tensors, K = 100)',
    de: 'Evaluations-Benchmark (Tabelle 6.1 · Seed-42 Raw-Score-Tensoren, K = 100)',
    fr: "Benchmark d'évaluation (Tableau 6.1 · Tenseurs bruts Seed 42, K = 100)",
    es: 'Benchmark de evaluación (Tabla 6.1 · Tensores crudos Seed 42, K = 100)',
    ar: 'معيار التقييم (جدول 6.1 · موتورات النتائج الخام للبذرة 42، K = 100)',
  },
  thresholdHeading: {
    en: 'Decision Threshold τ on s_OOD(x) = ê₀(x) − ê₁(x)',
    de: 'Entscheidungsschwelle τ auf s_OOD(x) = ê₀(x) − ê₁(x)',
    fr: 'Seuil de décision τ sur s_OOD(x) = ê₀(x) − ê₁(x)',
    es: 'Umbral de decisión τ sobre s_OOD(x) = ê₀(x) − ê₁(x)',
    ar: 'عتبة القرار τ على الدرجة s_OOD(x) = ê₀(x) − ê₁(x)',
  },
  presetTpr95: {
    en: 'Calibrate @ TPR = 95% (Fig. 6.8)',
    de: 'Kalibrieren @ TPR = 95% (Abb. 6.8)',
    fr: 'Calibrer @ TPR = 95% (Fig. 6.8)',
    es: 'Calibrar @ TPR = 95% (Fig. 6.8)',
    ar: 'معايرة عند TPR = 95% (شكل 6.8)',
  },
  presetYouden: {
    en: "Max Youden's J (Eq. 3.10)",
    de: 'Max. Youden-J (Gl. 3.10)',
    fr: 'Max J de Youden (Éq. 3.10)',
    es: 'Máx. J de Youden (Ec. 3.10)',
    ar: 'أقصى معامل Youden J (معادلة 3.10)',
  },
  presetZero: {
    en: 'Zero Boundary (τ = 0 · ê₀ = ê₁)',
    de: 'Nullgrenze (τ = 0 · ê₀ = ê₁)',
    fr: 'Frontière zéro (τ = 0 · ê₀ = ê₁)',
    es: 'Frontera cero (τ = 0 · ê₀ = ê₁)',
    ar: 'الحد الصفري (τ = 0 · ê₀ = ê₁)',
  },
  histTitle: {
    en: 'Empirical Score Distribution s_OOD(x) = ê₀(x) − ê₁(x) (48 bins from .pt tensors)',
    de: 'Empirische Score-Verteilung s_OOD(x) = ê₀(x) − ê₁(x) (48 Bins aus .pt-Tensoren)',
    fr: 'Distribution empirique s_OOD(x) = ê₀(x) − ê₁(x) (48 classes depuis tenseurs .pt)',
    es: 'Distribución empírica s_OOD(x) = ê₀(x) − ê₁(x) (48 bins de tensores .pt)',
    ar: 'التوزيع التجريبي للدرجات s_OOD(x) = ê₀(x) − ê₁(x) (من ملفات .pt الحقيقية)',
  },
  rocTitle: {
    en: 'Empirical ROC Curve & Live Operating Point (FPR(τ), TPR(τ))',
    de: 'Empirische ROC-Kurve & Live-Arbeitspunkt (FPR(τ), TPR(τ))',
    fr: 'Courbe ROC empirique & Point de fonctionnement (FPR(τ), TPR(τ))',
    es: 'Curva ROC empírica y Punto de operación en vivo (FPR(τ), TPR(τ))',
    ar: 'منحنى ROC التجريبي ونقطة التشغيل الحية (FPR(τ), TPR(τ))',
  },
  timestepHeading: {
    en: 'Diffusion Timestep Explorer t ∈ [50, 950] (Thesis Fig. 6.7 · per_timestep JSON)',
    de: 'Diffusions-Zeitschritt-Explorer t ∈ [50, 950] (Abb. 6.7 · per_timestep JSON)',
    fr: 'Explorateur de pas de diffusion t ∈ [50, 950] (Fig. 6.7 · JSON per_timestep)',
    es: 'Explorador de paso de difusión t ∈ [50, 950] (Fig. 6.7 · JSON per_timestep)',
    ar: 'مستكشف خطوات زمن الانتشار t ∈ [50, 950] (شكل 6.7 · بيانات per_timestep)',
  },
  scoringHeading: {
    en: 'Why Contrastive Scoring Is Essential (Table 6.5 & D.3 · Seed 42, λ = 0.01, K = 50)',
    de: 'Warum kontrastives Scoring essenziell ist (Tabelle 6.5 & D.3 · Seed 42, λ = 0.01, K = 50)',
    fr: 'Pourquoi le score contrastif est essentiel (Tableau 6.5 & D.3 · Seed 42, λ = 0.01, K = 50)',
    es: 'Por qué el puntaje contrastivo es esencial (Tabla 6.5 y D.3 · Seed 42, λ = 0.01, K = 50)',
    ar: 'لماذا يعد التقييم التبايني ضرورياً (جدول 6.5 و D.3 · بذرة 42، λ = 0.01، K = 50)',
  },
  lambdaSweepHeading: {
    en: 'Separation Loss Weight Sweep λ ∈ {0.0 … 0.1} (Table 6.6 & Fig. 6.6)',
    de: 'Separation-Loss-Gewichts-Sweep λ ∈ {0.0 … 0.1} (Tabelle 6.6 & Abb. 6.6)',
    fr: 'Balayage du poids λ ∈ {0.0 … 0.1} (Tableau 6.6 & Fig. 6.6)',
    es: 'Barrido del peso λ ∈ {0.0 … 0.1} (Tabla 6.6 y Fig. 6.6)',
    ar: 'مسح معامل خسارة الفصل λ ∈ {0.0 … 0.1} (جدول 6.6 وشكل 6.6)',
  },
  kSweepHeading: {
    en: 'Monte Carlo Timestep Trials K ∈ {1 … 100} Frontier (Table 6.3 & Fig. 6.3)',
    de: 'Monte-Carlo-Zeitschritt-Budget K ∈ {1 … 100} (Tabelle 6.3 & Abb. 6.3)',
    fr: "Frontière d'essais Monte Carlo K ∈ {1 … 100} (Tableau 6.3 & Fig. 6.3)",
    es: 'Frontera de ensayos Monte Carlo K ∈ {1 … 100} (Tabla 6.3 y Fig. 6.3)',
    ar: 'منحنى تجارب مونت كارلو K ∈ {1 … 100} (جدول 6.3 وشكل 6.3)',
  },
  inkjetHeading: {
    en: 'Cross-Domain Boundary Condition: Inkjet Print QC (Tables 6.7–6.9 · 5-Fold Stratified CV)',
    de: 'Cross-Domain-Randbedingung: Inkjet-Qualitätskontrolle (Tab. 6.7–6.9 · 5-Fold-CV)',
    fr: 'Condition aux limites inter-domaines : Contrôle qualité Inkjet (Tab. 6.7–6.9 · CV 5 plis)',
    es: 'Condición de frontera entre dominios: Control de calidad Inkjet (Tab. 6.7–6.9 · CV 5-fold)',
    ar: 'شروط الحدود عبر المجالات: فحص جودة الطباعة النفاثة (جداول 6.7–6.9 · تحقق من 5 طيات)',
  },
} satisfies Record<string, TranslationMap>

/**
 * Interactive 3-tab thesis explorer backed by empirical raw PyTorch score histograms
 * (seed42_*.pt) and ablation JSON artefacts from ahmed-3m/DiffusionOOD.
 */
export default function OodDemo() {
  const { t, lang } = useI18n()
  const sliderId = useId()
  const timestepSliderId = useId()

  const [activeTab, setActiveTab] = useState<LabTab>('calibration')
  const [regime, setRegime] = useState<'sep' | 'base'>('sep')
  const [datasetKey, setDatasetKey] = useState<OodDatasetKey>('within_cifar')
  const [threshold, setThreshold] = useState<number>(BENCHMARK_DATASETS.within_cifar.tauTpr95)

  // Tab 2 states
  const [timestepIdx, setTimestepIdx] = useState<number>(5) // t = 300 default
  const [scoringKey, setScoringKey] = useState<ScoringRuleKey>('difference')

  // Tab 3 states
  const [selectedLambdaIdx, setSelectedLambdaIdx] = useState<number>(3) // lambda = 0.02
  const [selectedKIdx, setSelectedKIdx] = useState<number>(2) // K = 10 recommended
  const [inkjetLambda, setInkjetLambda] = useState<InkjetLambdaKey>('0.0')

  const activeMeta = BENCHMARK_DATASETS[datasetKey]
  const activeHist = regime === 'base' ? LAMBDA0_SEED42_HISTOGRAM : activeMeta.histogram

  /** Switches between the separation-loss (lambda=0.02) and baseline (lambda=0.0) regimes. */
  const handleRegimeChange = (next: 'sep' | 'base') => {
    setRegime(next)
    if (next === 'base') {
      setDatasetKey('within_cifar')
      setThreshold(LAMBDA0_SEED42_META.tauTpr95)
    } else {
      setThreshold(BENCHMARK_DATASETS[datasetKey].tauTpr95)
    }
  }

  /** Selects an evaluation benchmark from Table 6.1 and resets tau to its TPR=95% operating point. */
  const handleDatasetChange = (next: OodDatasetKey) => {
    setRegime('sep')
    setDatasetKey(next)
    setThreshold(BENCHMARK_DATASETS[next].tauTpr95)
  }

  // Compute exact empirical TPR, FPR, Youden's J, and image counts from the 48-bin .pt histogram
  const liveDiagnostics = useMemo(() => {
    const { lo, hi, bins, id_pct, ood_pct, n_id, n_ood } = activeHist
    const step = (hi - lo) / bins
    let fpPct = 0
    let tpPct = 0

    for (let i = 0; i < bins; i++) {
      const binStart = lo + i * step
      const binEnd = binStart + step
      if (binStart >= threshold) {
        fpPct += id_pct[i]
        tpPct += ood_pct[i]
      } else if (binEnd > threshold) {
        const frac = (binEnd - threshold) / step
        fpPct += id_pct[i] * frac
        tpPct += ood_pct[i] * frac
      }
    }

    const tpr = Math.min(100, Math.max(0, tpPct))
    const fpr = Math.min(100, Math.max(0, fpPct))
    const tnr = 100 - fpr
    const fnr = 100 - tpr
    const youdenJ = tpr - fpr
    const balAcc = 0.5 * (tpr + tnr)
    const tpCount = Math.round((tpr / 100) * n_ood)
    const fnCount = n_ood - tpCount
    const fpCount = Math.round((fpr / 100) * n_id)
    const tnCount = n_id - fpCount

    return {
      tpr,
      fpr,
      tnr,
      fnr,
      youdenJ,
      balAcc,
      tpCount,
      fnCount,
      fpCount,
      tnCount,
      nId: n_id,
      nOod: n_ood,
    }
  }, [activeHist, threshold])

  const maxHistDensity = useMemo(() => {
    return Math.max(...activeHist.id_pct, ...activeHist.ood_pct, 1)
  }, [activeHist])

  const activeTimestep = PER_TIMESTEP_ERRORS[timestepIdx] ?? PER_TIMESTEP_ERRORS[5]
  const activeScoring = SCORING_METHODS[scoringKey]
  const activeLambda = CIFAR_LAMBDA_SWEEP[selectedLambdaIdx] ?? CIFAR_LAMBDA_SWEEP[3]
  const activeK = K_ABLATION_TABLE[selectedKIdx] ?? K_ABLATION_TABLE[2]
  const activeInkjetOverall = INKJET_OVERALL_SWEEP[inkjetLambda]

  return (
    <section
      id="ood-explorer"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        marginTop: 28,
        marginBottom: 28,
        padding: '28px 24px',
        borderRadius: 16,
        border: '1px solid var(--cd-border)',
        background: 'var(--cd-surface)',
        boxShadow: '0 16px 40px -20px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div style={{ maxWidth: 780 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--cd-accent)',
              marginBottom: 6,
            }}
          >
            {t(copy.eyebrow)}
          </div>
          <h3 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', fontWeight: 700, color: 'var(--cd-fg)', margin: '0 0 8px 0' }}>
            {t(copy.title)}
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--cd-fg2)', margin: 0 }}>
            {t(copy.subtitle)}
          </p>
        </div>

        {/* Core Thesis Equations Pill Box */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid var(--cd-border)',
            background: 'var(--cd-bg)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            lineHeight: 1.7,
            color: 'var(--cd-fg2)',
            alignSelf: 'flex-start',
          }}
        >
          <div>
            <strong style={{ color: 'var(--cd-accent)' }}>Eq. 3.23 (Sep. Loss):</strong>{' '}
            L_sep = −‖ε_θ(x_t, t, c=0) − ε_θ(x_t, t, c=1)‖²
          </div>
          <div>
            <strong style={{ color: 'var(--cd-success)' }}>Eq. 3.3 (OOD Score):</strong>{' '}
            s_OOD(x) = ê₀(x) − ê₁(x) &gt; τ ⇒ OOD
          </div>
        </div>
      </div>

      {/* 3-Tab Navigation */}
      <div
        role="tablist"
        aria-label={t(copy.tabsAria)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {(
          [
            { id: 'calibration', label: copy.tabCalibration },
            { id: 'timesteps', label: copy.tabTimesteps },
            { id: 'ablations', label: copy.tabAblations },
          ] as const
        ).map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '11px 14px',
                borderRadius: 10,
                border: isSelected ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                background: isSelected ? 'rgba(0, 212, 255, 0.12)' : 'var(--cd-bg)',
                color: isSelected ? 'var(--cd-fg)' : 'var(--cd-fg2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              {t(tab.label)}
            </button>
          )
        })}
      </div>

      {/* =====================================================================
          TAB 1: SCORE DISTRIBUTIONS & THRESHOLD CALIBRATION (Table 6.1 & Fig 6.8)
         ===================================================================== */}
      {activeTab === 'calibration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Regime + Dataset Controls */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--cd-border)',
              background: 'var(--cd-bg)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)', marginBottom: 8 }}>
                {t(copy.regimeHeading)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleRegimeChange('sep')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: regime === 'sep' ? '1px solid var(--cd-success)' : '1px solid var(--cd-border)',
                    background: regime === 'sep' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: 'var(--cd-fg)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  ● {t(copy.regimeSep)}
                </button>
                <button
                  type="button"
                  onClick={() => handleRegimeChange('base')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: regime === 'base' ? '1px solid var(--cd-warn)' : '1px solid var(--cd-border)',
                    background: regime === 'base' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    color: 'var(--cd-fg)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  ○ {t(copy.regimeBase)}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)', marginBottom: 8 }}>
                {t(copy.datasetHeading)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 6 }}>
                {(Object.keys(BENCHMARK_DATASETS) as OodDatasetKey[]).map((key) => {
                  const meta = BENCHMARK_DATASETS[key]
                  const selected = regime === 'sep' && datasetKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDatasetChange(key)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: selected ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                        background: selected ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                        color: 'var(--cd-fg)',
                        fontSize: 11.5,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t(DATASET_LABELS[key]).split(' (')[0]}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cd-accent)' }}>
                        {meta.auroc.toFixed(2)}%
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Threshold Slider & Presets */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid var(--cd-border)',
              background: 'var(--cd-bg)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <label
                htmlFor={sliderId}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--cd-fg)' }}
              >
                {t(copy.thresholdHeading)}:{' '}
                <span style={{ color: '#f97316', fontWeight: 700 }}>
                  τ = {threshold >= 0 ? `+${threshold.toFixed(5)}` : threshold.toFixed(5)}
                </span>
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setThreshold(regime === 'base' ? LAMBDA0_SEED42_META.tauTpr95 : activeMeta.tauTpr95)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--cd-border)',
                    background: 'var(--cd-surface)',
                    color: 'var(--cd-fg)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {t(copy.presetTpr95)}
                </button>
                <button
                  type="button"
                  onClick={() => setThreshold(regime === 'base' ? LAMBDA0_SEED42_META.tauYouden : activeMeta.tauYouden)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--cd-border)',
                    background: 'var(--cd-surface)',
                    color: 'var(--cd-fg)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {t(copy.presetYouden)}
                </button>
                <button
                  type="button"
                  onClick={() => setThreshold(0)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--cd-border)',
                    background: 'var(--cd-surface)',
                    color: 'var(--cd-fg)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {t(copy.presetZero)}
                </button>
              </div>
            </div>

            <input
              id={sliderId}
              type="range"
              min={activeHist.lo}
              max={activeHist.hi}
              step={(activeHist.hi - activeHist.lo) / 300}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
            />

            {/* Live KPI Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10,
                marginTop: 14,
              }}
            >
              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>AUROC (Seed 42 · K=100)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--cd-accent)' }}>
                  {`${(regime === 'base' ? LAMBDA0_SEED42_META.auroc : activeMeta.auroc).toFixed(2)}%`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-fg3)' }}>
                  {regime === 'base' ? '3-seed: 92.52% ± 11.07%' : datasetKey === 'within_cifar' ? '3-seed: 99.03% ± 0.07%' : `AUPRC: ${activeMeta.auprc.toFixed(2)}%`}
                </div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>Live TPR(τ) · Sensitivity</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--cd-success)' }}>
                  {liveDiagnostics.tpr.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-fg3)' }}>
                  TP: {liveDiagnostics.tpCount.toLocaleString()} / {liveDiagnostics.nOod.toLocaleString()} OOD
                </div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>Live FPR(τ) · False Alarms</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: liveDiagnostics.fpr <= 15 ? 'var(--cd-accent)' : 'var(--cd-danger)' }}>
                  {liveDiagnostics.fpr.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-fg3)' }}>
                  FP: {liveDiagnostics.fpCount.toLocaleString()} / {liveDiagnostics.nId.toLocaleString()} Airplanes
                </div>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>Youden&apos;s J(τ) = TPR − FPR</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--cd-fg)' }}>
                  {liveDiagnostics.youdenJ.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-fg3)' }}>
                  Balanced Acc: {liveDiagnostics.balAcc.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Empirical Histogram SVG & ROC Curve SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
            {/* 48-Bin Empirical Histogram */}
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                {t(copy.histTitle)}
              </div>
              <svg viewBox="0 0 520 230" style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Empirical OOD Score Histogram">
                {/* Axes */}
                <line x1="40" y1="195" x2="500" y2="195" stroke="var(--cd-border)" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="195" stroke="var(--cd-border)" strokeWidth="1" />

                {/* Histogram Bars */}
                {activeHist.id_pct.map((idVal, idx) => {
                  const oodVal = activeHist.ood_pct[idx] ?? 0
                  const barW = 460 / activeHist.bins
                  const x = 40 + idx * barW
                  const idH = (idVal / maxHistDensity) * 165
                  const oodH = (oodVal / maxHistDensity) * 165
                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={195 - idH}
                        width={Math.max(1.5, barW - 1)}
                        height={idH}
                        fill="rgba(56, 189, 248, 0.55)"
                      />
                      <rect
                        x={x}
                        y={195 - oodH}
                        width={Math.max(1.5, barW - 1)}
                        height={oodH}
                        fill="rgba(239, 68, 68, 0.50)"
                      />
                    </g>
                  )
                })}

                {/* Threshold vertical line */}
                {(() => {
                  const ratio = Math.min(1, Math.max(0, (threshold - activeHist.lo) / (activeHist.hi - activeHist.lo)))
                  const tx = 40 + ratio * 460
                  return (
                    <g>
                      <line x1={tx} y1="16" x2={tx} y2="195" stroke="#f97316" strokeWidth="2.5" strokeDasharray="5 4" />
                      <rect x={Math.min(415, Math.max(42, tx - 44))} y="12" width="88" height="18" rx="4" fill="#f97316" />
                      <text x={Math.min(459, Math.max(86, tx))} y="24" textAnchor="middle" fill="#000" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        τ = {threshold.toFixed(4)}
                      </text>
                    </g>
                  )
                })()}

                {/* X-axis labels */}
                <text x="40" y="212" fill="var(--cd-fg3)" fontSize="10" fontFamily="monospace">
                  {activeHist.lo.toFixed(4)}
                </text>
                <text x="270" y="212" textAnchor="middle" fill="var(--cd-fg2)" fontSize="10" fontFamily="monospace">
                  s_OOD(x) = ê₀(x) − ê₁(x)
                </text>
                <text x="500" y="212" textAnchor="end" fill="var(--cd-fg3)" fontSize="10" fontFamily="monospace">
                  +{activeHist.hi.toFixed(4)}
                </text>
              </svg>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cd-fg2)', marginTop: 6 }}>
                <span><strong style={{ color: 'var(--cd-accent)' }}>■</strong> ID: CIFAR-10 Airplane (N={activeHist.n_id.toLocaleString()})</span>
                <span><strong style={{ color: 'var(--cd-danger)' }}>■</strong> OOD Cohort (N={activeHist.n_ood.toLocaleString()})</span>
                <span><strong style={{ color: '#f97316' }}>┆</strong> Threshold τ</span>
              </div>
            </div>

            {/* Empirical ROC Curve */}
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                {t(copy.rocTitle)}
              </div>
              <svg viewBox="0 0 320 230" style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Empirical ROC Curve">
                <line x1="45" y1="195" x2="295" y2="195" stroke="var(--cd-border)" strokeWidth="1" />
                <line x1="45" y1="20" x2="45" y2="195" stroke="var(--cd-border)" strokeWidth="1" />
                {/* Diagonal chance line */}
                <line x1="45" y1="195" x2="295" y2="20" stroke="var(--cd-border)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Empirical ROC Polyline */}
                <polyline
                  fill="none"
                  stroke="var(--cd-accent)"
                  strokeWidth="2.5"
                  points={activeHist.roc
                    .map(([fpr, tpr]) => `${(45 + fpr * 250).toFixed(1)},${(195 - tpr * 175).toFixed(1)}`)
                    .join(' ')}
                />

                {/* Active operating point */}
                {(() => {
                  const cx = 45 + (liveDiagnostics.fpr / 100) * 250
                  const cy = 195 - (liveDiagnostics.tpr / 100) * 175
                  return (
                    <g>
                      <line x1={cx} y1={cy} x2={cx} y2="195" stroke="#f97316" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="45" y1={cy} x2={cx} y2={cy} stroke="#f97316" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx={cx} cy={cy} r="5.5" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
                    </g>
                  )
                })()}

                <text x="170" y="214" textAnchor="middle" fill="var(--cd-fg2)" fontSize="10" fontFamily="monospace">
                  False Positive Rate (FPR)
                </text>
                <text x="16" y="110" textAnchor="middle" fill="var(--cd-fg2)" fontSize="10" fontFamily="monospace" transform="rotate(-90 16 110)">
                  True Positive Rate (TPR)
                </text>
              </svg>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--cd-fg2)', marginTop: 6 }}>
                Operating Point: <strong>FPR = {liveDiagnostics.fpr.toFixed(1)}%</strong>, <strong>TPR = {liveDiagnostics.tpr.toFixed(1)}%</strong> (Benchmark FPR@95%TPR = {`${regime === 'base' ? LAMBDA0_SEED42_META.fpr95 : activeMeta.fpr95}%`})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PER-TIMESTEP ERROR (Fig. 6.7) & CONTRASTIVE SCORING (Table 6.5)
         ===================================================================== */}
      {activeTab === 'timesteps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <label htmlFor={timestepSliderId} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--cd-fg)' }}>
                {t(copy.timestepHeading)}:{' '}
                <span style={{ color: 'var(--cd-accent)' }}>
                  t = {activeTimestep.t} / 1000 (Signal ᾱ_t = {activeTimestep.alphaBar.toFixed(4)})
                </span>
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)' }}>
                Eq. 3.25 Cosine Schedule · s = 0.008
              </span>
            </div>

            <input
              id={timestepSliderId}
              type="range"
              min={0}
              max={PER_TIMESTEP_ERRORS.length - 1}
              step={1}
              value={timestepIdx}
              onChange={(e) => setTimestepIdx(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--cd-accent)', cursor: 'pointer', marginBottom: 14 }}
            />

            {/* Per-Timestep SVG Curve (Thesis Figure 6.7) */}
            <svg viewBox="0 0 600 220" style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Per-timestep reconstruction error curves">
              <line x1="45" y1="190" x2="575" y2="190" stroke="var(--cd-border)" strokeWidth="1" />
              <line x1="45" y1="15" x2="45" y2="190" stroke="var(--cd-border)" strokeWidth="1" />

              {/* OOD c=0 curve (red) */}
              <polyline
                fill="none"
                stroke="var(--cd-danger)"
                strokeWidth="2.2"
                points={PER_TIMESTEP_ERRORS.map((pt, i) => {
                  const x = 45 + (i / (PER_TIMESTEP_ERRORS.length - 1)) * 530
                  const y = 190 - (pt.oodC0Mean / 0.25) * 170
                  return `${x.toFixed(1)},${y.toFixed(1)}`
                }).join(' ')}
              />
              {/* OOD c=1 curve (orange dashed) */}
              <polyline
                fill="none"
                stroke="#fb923c"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                points={PER_TIMESTEP_ERRORS.map((pt, i) => {
                  const x = 45 + (i / (PER_TIMESTEP_ERRORS.length - 1)) * 530
                  const y = 190 - (pt.oodC1Mean / 0.25) * 170
                  return `${x.toFixed(1)},${y.toFixed(1)}`
                }).join(' ')}
              />
              {/* ID c=0 curve (blue) */}
              <polyline
                fill="none"
                stroke="var(--cd-accent)"
                strokeWidth="2.2"
                points={PER_TIMESTEP_ERRORS.map((pt, i) => {
                  const x = 45 + (i / (PER_TIMESTEP_ERRORS.length - 1)) * 530
                  const y = 190 - (pt.idC0Mean / 0.25) * 170
                  return `${x.toFixed(1)},${y.toFixed(1)}`
                }).join(' ')}
              />
              {/* ID c=1 curve (cyan dashed) */}
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                points={PER_TIMESTEP_ERRORS.map((pt, i) => {
                  const x = 45 + (i / (PER_TIMESTEP_ERRORS.length - 1)) * 530
                  const y = 190 - (pt.idC1Mean / 0.25) * 170
                  return `${x.toFixed(1)},${y.toFixed(1)}`
                }).join(' ')}
              />

              {/* Active timestep marker */}
              {(() => {
                const cx = 45 + (timestepIdx / (PER_TIMESTEP_ERRORS.length - 1)) * 530
                return <line x1={cx} y1="15" x2={cx} y2="190" stroke="var(--cd-accent)" strokeWidth="2" strokeDasharray="4 3" />
              })()}

              <text x="45" y="208" fill="var(--cd-fg3)" fontSize="10" fontFamily="monospace">t = 50 (Low noise)</text>
              <text x="310" y="208" textAnchor="middle" fill="var(--cd-fg2)" fontSize="10" fontFamily="monospace">t = 500 (Mid noise · Peak OOD signal)</text>
              <text x="575" y="208" textAnchor="end" fill="var(--cd-fg3)" fontSize="10" fontFamily="monospace">t = 950 (Near-pure Gaussian)</text>
            </svg>

            {/* Live Timestep Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
              <div style={{ padding: 10, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-accent)' }}>ID (Airplane) MSE @ t={activeTimestep.t}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cd-fg)', marginTop: 4 }}>
                  c=0: <strong>{activeTimestep.idC0Mean.toFixed(4)}</strong> · c=1: <strong>{activeTimestep.idC1Mean.toFixed(4)}</strong>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-success)', marginTop: 2 }}>
                  ê₀ − ê₁ = {(activeTimestep.idC0Mean - activeTimestep.idC1Mean).toFixed(5)} (ID &lt; 0)
                </div>
              </div>

              <div style={{ padding: 10, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-danger)' }}>OOD Cohort MSE @ t={activeTimestep.t}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cd-fg)', marginTop: 4 }}>
                  c=0: <strong>{activeTimestep.oodC0Mean.toFixed(4)}</strong> · c=1: <strong>{activeTimestep.oodC1Mean.toFixed(4)}</strong>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f97316', marginTop: 2 }}>
                  ê₀ − ê₁ = +{(activeTimestep.oodC0Mean - activeTimestep.oodC1Mean).toFixed(5)} (OOD &gt; 0)
                </div>
              </div>

              <div style={{ padding: 10, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>Manifold Mismatch Δ_OOD(t) (Eq. 3.15)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--cd-accent)', marginTop: 4 }}>
                  +{(activeTimestep.oodC0Mean - activeTimestep.idC0Mean).toFixed(4)} MSE
                </div>
                <div style={{ fontSize: 11, color: 'var(--cd-fg3)' }}>
                  Uniform t ~ U[1,1000] achieves 98.9% CIFAR / 95.4% SVHN
                </div>
              </div>
            </div>
          </div>

          {/* Contrastive Scoring Comparison (Table 6.5 & D.3) + Timestep Strategy (Table 6.4) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                {t(copy.scoringHeading)}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {(
                  [
                    { key: 'difference', label: 'Difference: ê₀ − ê₁ (Default)' },
                    { key: 'ratio', label: 'Ratio: ê₀ / ê₁' },
                    { key: 'id_error', label: 'ID-Only: ê₀ (No Contrast)' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setScoringKey(item.key)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: scoringKey === item.key ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                      background: scoringKey === item.key ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                      color: 'var(--cd-fg)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>Within-CIFAR AUROC</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: activeScoring.cifarAuroc > 90 ? 'var(--cd-success)' : 'var(--cd-warn)' }}>
                    {activeScoring.cifarAuroc.toFixed(2)}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)' }}>
                    FPR95: {activeScoring.cifarFpr95.toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--cd-fg3)' }}>External SVHN AUROC</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: activeScoring.svhnAuroc > 90 ? 'var(--cd-success)' : 'var(--cd-danger)' }}>
                    {activeScoring.svhnAuroc.toFixed(2)}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)' }}>
                    FPR95: {activeScoring.svhnFpr95.toFixed(1)}%
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--cd-fg2)', margin: '10px 0 0 0', lineHeight: 1.55 }}>
                {scoringKey === 'id_error'
                  ? 'Collapse alert (Table D.3): Using ID reconstruction error ê₀(x) alone collapses to 20.23% AUROC on SVHN (worse than random) because smooth SVHN digits have lower raw reconstruction error than textured airplanes.'
                  : 'Contrastive scoring (comparing c=0 vs c=1 on the same noisy sample x_t) cancels raw image-complexity bias and isolates class-manifold fit.'}
              </p>
            </div>

            {/* Table 6.4 Timestep Sampling Strategies */}
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                Timestep Sampling Strategy Ablation (Table 6.4 · K = 50, λ = 0.01)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TIMESTEP_STRATEGIES.map((strat) => (
                  <div
                    key={strat.key}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--cd-border)',
                      background: 'var(--cd-surface)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--cd-fg)', textTransform: 'capitalize' }}>{strat.key.replace('_', '-')}</strong>
                      <div style={{ fontSize: 10.5, color: 'var(--cd-fg3)' }}>{strat.distribution}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--cd-accent)', fontWeight: 700 }}>CIFAR: {strat.cifarAuroc.toFixed(1)}%</div>
                      <div style={{ color: 'var(--cd-fg2)', fontSize: 11 }}>SVHN: {strat.svhnAuroc.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SEPARATION LOSS (λ), MONTE CARLO (K) & INKJET QC (Tables 6.3, 6.6–6.9)
         ===================================================================== */}
      {activeTab === 'ablations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Separation Loss Lambda Sweep (Table 6.6) */}
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                {t(copy.lambdaSweepHeading)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CIFAR_LAMBDA_SWEEP.map((row, idx) => (
                  <button
                    key={row.lambda}
                    type="button"
                    onClick={() => setSelectedLambdaIdx(idx)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: selectedLambdaIdx === idx ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                      background: selectedLambdaIdx === idx ? 'rgba(0, 212, 255, 0.14)' : 'var(--cd-surface)',
                      color: 'var(--cd-fg)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      fontWeight: row.isOptimal ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    λ={row.lambda}{row.isOptimal ? ' ★' : ''}
                  </button>
                ))}
              </div>

              <div style={{ padding: 12, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  <span>Within-CIFAR AUROC:</span>
                  <strong style={{ color: 'var(--cd-success)' }}>
                    {activeLambda.withinCifarMean.toFixed(2)}%
                    {activeLambda.withinCifarStd !== null ? ` ± ${activeLambda.withinCifarStd.toFixed(2)}%` : ' (seed 42)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>Seed runs (42 / 123 / 456):</span>
                  <span>{activeLambda.seeds.map((s) => `${s.toFixed(2)}%`).join(' · ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>Best Convergence Epoch (seed 42):</span>
                  <span>Epoch {activeLambda.bestEpochSeed42}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>SVHN External AUROC (seed 42):</span>
                  <span>
                    {activeLambda.svhnAuroc.toFixed(1)}%{activeLambda.svhnArtefact ? '† (artefact)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Monte Carlo Trials K Sweep (Table 6.3 & D.2) */}
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)', marginBottom: 10 }}>
                {t(copy.kSweepHeading)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {K_ABLATION_TABLE.map((row, idx) => (
                  <button
                    key={row.k}
                    type="button"
                    onClick={() => setSelectedKIdx(idx)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: selectedKIdx === idx ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                      background: selectedKIdx === idx ? 'rgba(0, 212, 255, 0.14)' : 'var(--cd-surface)',
                      color: 'var(--cd-fg)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      fontWeight: row.recommended ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    K={row.k}{row.recommended ? ' ★' : ''}
                  </button>
                ))}
              </div>

              <div style={{ padding: 12, borderRadius: 8, border: '1px solid var(--cd-border)', background: 'var(--cd-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  <span>Within-CIFAR AUROC (λ=0.01, seed 42):</span>
                  <strong style={{ color: 'var(--cd-accent)' }}>{activeK.auroc.toFixed(2)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>FPR@95%TPR:</span>
                  <span>{activeK.fpr95.toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>RTX 2080 Ti Time (per 10K images):</span>
                  <span>{activeK.timeSeconds10k.toFixed(1)} s ({activeK.msPerSample.toFixed(1)} ms / img)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5, marginTop: 6, color: 'var(--cd-fg2)' }}>
                  <span>Cost vs. ResNet-18 Forward Pass:</span>
                  <span>{activeK.resnetMultiple}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inkjet Print QC Per-Feature & Lambda Explorer (Tables 6.7, 6.8, 6.9) */}
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cd-border)', background: 'var(--cd-bg)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--cd-fg)' }}>
                  {t(copy.inkjetHeading)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--cd-fg2)', marginTop: 2 }}>
                  Public FTI_Zer0P Dataset · 573 Source-Image Groups · 6,408 YOLO Crops (128×128) · Multi-Head AdaGN CDM
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {(['0.0', '0.01', '0.02', '0.05'] as const).map((lKey) => (
                  <button
                    key={lKey}
                    type="button"
                    onClick={() => setInkjetLambda(lKey)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: inkjetLambda === lKey ? '1px solid var(--cd-accent)' : '1px solid var(--cd-border)',
                      background: inkjetLambda === lKey ? 'rgba(0, 212, 255, 0.14)' : 'var(--cd-surface)',
                      color: 'var(--cd-fg)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Inkjet λ={lKey}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cd-fg2)' }}>
              <span>
                5-Fold CV Mean AUROC: <strong style={{ color: 'var(--cd-accent)' }}>{activeInkjetOverall.aurocMean.toFixed(4)} ± {activeInkjetOverall.aurocStd.toFixed(4)}</strong>
              </span>
              <span>
                Accuracy: <strong>{(activeInkjetOverall.accMean * 100).toFixed(2)}% ± {(activeInkjetOverall.accStd * 100).toFixed(2)}%</strong>
              </span>
              <span>
                Holm-Adjusted p vs λ=0:{' '}
                <strong>{activeInkjetOverall.holmPValue === null ? 'Baseline' : `p = ${activeInkjetOverall.holmPValue.toFixed(3)} (not significant)`}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
              {INKJET_PER_FEATURE.map((feat) => {
                const stats = feat.byLambda[inkjetLambda]
                const pct = stats.mean * 100
                return (
                  <div
                    key={feat.feature}
                    style={{
                      padding: '9px 11px',
                      borderRadius: 8,
                      border: '1px solid var(--cd-border)',
                      background: 'var(--cd-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                      <strong style={{ color: 'var(--cd-fg)' }}>{feat.feature}</strong>
                      <span style={{ color: pct >= 90 ? 'var(--cd-success)' : pct >= 80 ? 'var(--cd-accent)' : 'var(--cd-warn)', fontWeight: 700 }}>
                        {stats.mean.toFixed(4)} ± {stats.std.toFixed(4)}
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--cd-bg)', marginTop: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, (stats.mean - 0.5) * 200))}%`,
                          height: '100%',
                          background: pct >= 90 ? 'var(--cd-success)' : pct >= 80 ? 'var(--cd-accent)' : 'var(--cd-warn)',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--cd-fg3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      GOOD:BAD = {feat.goodBadRatio}{feat.unreliableNote ? ' (<5 BAD/fold)' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
