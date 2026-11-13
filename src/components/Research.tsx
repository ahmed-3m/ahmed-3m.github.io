'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const OodDemo = dynamic(() => import('@/components/OodDemo'))

const cifarCharts: Array<{ src: string; width: number; height: number; alt: TranslationMap; caption: TranslationMap }> = [
  {
    src: '/fig_lambda_sweep.png',
    width: 2499,
    height: 1024,
    alt: {
      en: 'Separation Loss Weight Sweep',
      de: 'Separation Loss Gewichtungs-Sweep',
      fr: 'Balayage du poids de la separation loss',
      es: 'Barrido del peso de la separation loss',
      ar: 'مسح وزن خسارة الفصل',
    },
    caption: {
      en: 'Separation weight sweep: best stability at lambda=0.02',
      de: 'Separation-Weight-Sweep: beste Stabilität bei lambda=0.02',
      fr: 'Balayage du poids de séparation : meilleure stabilité à lambda=0.02',
      es: 'Barrido de peso de separación: mejor estabilidad en lambda=0.02',
      ar: 'مسح وزن الفصل: أفضل ثبات عند lambda=0.02',
    },
  },
  {
    src: '/fig_calibration.png',
    width: 1824,
    height: 1072,
    alt: {
      en: 'Operating Threshold Calibration',
      de: 'Kalibrierung des Betriebsschwellenwerts',
      fr: 'Calibration du seuil opérationnel',
      es: 'Calibración del umbral operativo',
      ar: 'معايرة عتبة التشغيل',
    },
    caption: {
      en: 'Score distributions at calibrated operating threshold',
      de: 'Score-Verteilungen am kalibrierten Betriebsschwellenwert',
      fr: 'Distributions des scores au seuil opérationnel calibré',
      es: 'Distribuciones de puntuaciones en el umbral calibrado',
      ar: 'توزيعات الدرجات عند عتبة التشغيل المعايرة',
    },
  },
  {
    src: '/fig_per_timestep_error.png',
    width: 2176,
    height: 1292,
    alt: {
      en: 'Per-Timestep Reconstruction Error',
      de: 'Rekonstruktionsfehler pro Zeitschritt',
      fr: 'Erreur de reconstruction par pas de temps',
      es: 'Error de reconstrucción por paso de tiempo',
      ar: 'خطأ إعادة البناء لكل خطوة زمنية',
    },
    caption: {
      en: 'Reconstruction error gap peaks at intermediate noise',
      de: 'Rekonstruktionsfehler-Lücke hat ihren Peak bei mittlerem Rauschen',
      fr: "L'écart d'erreur de reconstruction culmine au bruit intermédiaire",
      es: 'La brecha de error de reconstrucción tiene su pico en ruido intermedio',
      ar: 'فجوة خطأ إعادة البناء تبلغ ذروتها عند الضوضاء المتوسطة',
    },
  },
]

const industrialCharts: Array<{ src: string; width: number; height: number; alt: TranslationMap; caption: TranslationMap }> = [
  {
    src: '/fig_cross_domain_comparison.png',
    width: 1905,
    height: 1027,
    alt: {
      en: 'Cross-Domain Impact of Separation Loss',
      de: 'Domänenübergreifender Einfluss der Separation Loss',
      fr: 'Impact cross-domain de la separation loss',
      es: 'Impacto entre dominios de la separation loss',
      ar: 'تأثير خسارة الفصل عبر المجالات',
    },
    caption: {
      en: 'Cross-domain impact: CIFAR-10 gain vs. Inkjet QC fold spread',
      de: 'Cross-Domain-Einfluss: CIFAR-10-Gewinn vs. Inkjet-QC-Streuung',
      fr: 'Impact cross-domain : gain CIFAR-10 vs dispersion Inkjet QC',
      es: 'Impacto entre dominios: ganancia en CIFAR-10 frente a dispersión en Inkjet QC',
      ar: 'التأثير عبر المجالات: تحسن CIFAR-10 مقابل تشتت مراقبة جودة الطباعة',
    },
  },
  {
    src: '/fig_inkjet_lambda.png',
    width: 2577,
    height: 978,
    alt: {
      en: 'Per-Feature AUROC Sweep',
      de: 'AUROC-Sweep pro Merkmal',
      fr: 'Balayage AUROC par caractéristique',
      es: 'Barrido de AUROC por característica',
      ar: 'مسح مقياس AUROC لكل ميزة',
    },
    caption: {
      en: 'Per-feature AUROC across separation weights',
      de: 'AUROC pro Merkmal über verschiedene Separation-Gewichte',
      fr: 'AUROC par caractéristique selon les poids de séparation',
      es: 'AUROC por característica a través de los pesos de separación',
      ar: 'مقياس AUROC لكل ميزة عبر مختلف أوزان الفصل',
    },
  },
]

const formulaVisuals: Array<{ previewSrc: string; src: string; width: number; height: number; alt: TranslationMap; caption: TranslationMap }> = [
  {
    previewSrc: '/research/separation-denoise-preview.webp',
    src: '/research/separation-denoise-clean.png',
    width: 800,
    height: 450,
    alt: {
      en: 'Noisy image becoming clean through denoising under c=0 and c=1',
      de: 'Verrauschtes Bild wird durch Entrauschen unter c=0 und c=1 klar',
      fr: 'Image bruitée devenant nette par débruitage sous c=0 et c=1',
      es: 'Imagen ruidosa volviéndose limpia mediante reducción de ruido bajo c=0 y c=1',
      ar: 'صورة مشوشة تصبح نقية عبر إزالة الضوضاء تحت الشرطين c=0 وc=1',
    },
    caption: {
      en: 'Step 1: denoise the image under both class conditions (c=0 normal vs. c=1 other)',
      de: 'Schritt 1: Bild unter beiden Klassenbedingungen entrauschen (c=0 normal vs. c=1 andere)',
      fr: "Étape 1 : débruiter l'image sous les deux conditions (c=0 normal vs c=1 autre)",
      es: 'Paso 1: reducir ruido bajo ambas condiciones de clase (c=0 normal vs. c=1 otras)',
      ar: 'الخطوة 1: إزالة الضوضاء تحت كلا الشرطين (c=0 طبيعي مقابل c=1 آخر)',
    },
  },
  {
    previewSrc: '/research/separation-apart-preview.webp',
    src: '/research/separation-apart-clean.png',
    width: 800,
    height: 450,
    alt: {
      en: 'Training loss L_sep pushing c=0 and c=1 noise predictions apart',
      de: 'Trainingsverlust L_sep drückt Rauschvorhersagen c=0 und c=1 auseinander',
      fr: "La perte d'entraînement L_sep éloigne les prédictions de bruit c=0 et c=1",
      es: 'La pérdida de entrenamiento L_sep separa las predicciones de ruido c=0 y c=1',
      ar: 'دالة خسارة التدريب L_sep تبعد تنبؤات الضوضاء بين c=0 وc=1',
    },
    caption: {
      en: 'Step 2: training loss L_sep pushes conditional noise predictions apart',
      de: 'Schritt 2: L_sep drückt konditionale Rauschvorhersagen im Training auseinander',
      fr: "Étape 2 : L_sep éloigne les prédictions conditionnelles pendant l'entraînement",
      es: 'Paso 2: L_sep separa las predicciones condicionales durante el entrenamiento',
      ar: 'الخطوة 2: خسارة التدريب L_sep تبعد التنبؤات الشرطية عن بعضها',
    },
  },
  {
    previewSrc: '/research/separation-gap-preview.webp',
    src: '/research/separation-gap-score.png',
    width: 800,
    height: 450,
    alt: {
      en: 'Inference score diagram s_OOD(x) = e_0(x) - e_1(x) comparing c=0 and c=1 reconstruction error',
      de: 'Inferenz-Score-Diagramm s_OOD(x) = e_0(x) - e_1(x) aus dem Rekonstruktionsfehler-Vergleich',
      fr: "Diagramme du score d'inférence s_OOD(x) = e_0(x) - e_1(x) comparant les erreurs c=0 et c=1",
      es: 'Diagrama de puntuación s_OOD(x) = e_0(x) - e_1(x) comparando errores de reconstrucción',
      ar: 'مخطط درجة الاستدلال s_OOD(x) = e_0(x) - e_1(x) لمقارنة أخطاء إعادة البناء',
    },
    caption: {
      en: 'Step 3: inference score s_OOD(x) = e_0(x) - e_1(x) flags OOD when >= threshold tau',
      de: 'Schritt 3: Inferenz-Score s_OOD(x) = e_0(x) - e_1(x) erkennt OOD ab Schwelle tau',
      fr: 'Étape 3 : le score s_OOD(x) = e_0(x) - e_1(x) signale OOD lorsque >= seuil tau',
      es: 'Paso 3: la puntuación s_OOD(x) = e_0(x) - e_1(x) detecta OOD si >= umbral tau',
      ar: 'الخطوة 3: درجة الاستدلال s_OOD(x) = e_0(x) - e_1(x) تكشف OOD عند تجاوز العتبة tau',
    },
  },
]

const copy = {
  eyebrow: { en: '// 05 - Research', de: '// 05 - Forschung', fr: '// 05 - Recherche', es: '// 05 - Investigación', ar: '// 05 - الأبحاث' },
  title: { en: 'Reports & Thesis', de: 'Berichte & Thesis', fr: 'Rapports & mémoire', es: 'Informes y tesis', ar: 'التقارير والرسالة' },
  summaryProblemLabel: { en: 'Problem', de: 'Problem', fr: 'Problème', es: 'Problema', ar: 'المشكلة' },
  summaryProblemText: {
    en: 'How can a model recognize when an image does not belong, instead of acting overconfident?',
    de: 'Wie kann ein Modell erkennen, dass ein Bild nicht zur Verteilung gehört, statt übertrieben sicher zu reagieren?',
    fr: "Comment un modèle peut-il reconnaître qu'une image ne lui appartient pas au lieu de répondre avec trop de confiance ?",
    es: '¿Cómo puede un modelo reconocer que una imagen no pertenece a su distribución en vez de responder con exceso de confianza?',
    ar: 'كيف يمكن للنموذج أن يدرك أن الصورة لا تنتمي إلى بياناته بدلاً من أن يجيب بثقة زائدة؟',
  },
  summaryContributionLabel: { en: 'Contribution', de: 'Beitrag', fr: 'Contribution', es: 'Contribución', ar: 'المساهمة' },
  summaryContributionText: {
    en: 'A separation loss that forces the model s competing class explanations to move apart.',
    de: 'Eine Separation Loss, die konkurrierende Klassenerklärungen des Modells auseinanderdrückt.',
    fr: "Une separation loss qui force les explications de classe concurrentes à s'éloigner.",
    es: 'Una separation loss que obliga a separar las explicaciones de clase rivales del modelo.',
    ar: 'خسارة فصل تدفع تفسيرات الفئات المتنافسة داخل النموذج إلى الابتعاد عن بعضها.',
  },
  summaryResultLabel: { en: 'Result', de: 'Ergebnis', fr: 'Resultat', es: 'Resultado', ar: 'النتيجة' },
  summaryResultText: {
    en: '99.03% +/- 0.07% AUROC on CIFAR-10 airplane-vs-rest (binary, single ID class, 3-seed mean), with a +6.5pp gain over the non-separated baseline.',
    de: '99.03% +/- 0.07% AUROC auf CIFAR-10 airplane-vs-rest (binär, Einzelklasse, 3-Seed-Mittel) mit +6.5 Prozentpunkten gegenüber der Basis ohne Separation.',
    fr: '99.03% +/- 0.07% AUROC sur CIFAR-10 airplane-vs-rest (binaire, classe unique, moyenne 3 seeds) avec un gain de +6.5 points face à la baseline sans séparation.',
    es: '99.03% +/- 0.07% AUROC en CIFAR-10 airplane-vs-rest (binaria, clase única, media 3 seeds) con una mejora de +6.5 puntos sobre la base sin separación.',
    ar: '99.03% +/- 0.07% AUROC على CIFAR-10 airplane-vs-rest (ثنائي، فئة واحدة، متوسط 3 بذور) مع تحسن قدره +6.5 نقطة على الخط الأساسي بدون فصل.',
  },
  summaryImpactLabel: { en: 'Why it matters', de: 'Warum es zählt', fr: 'Pourquoi cela compte', es: 'Por qué importa', ar: 'لماذا يهم ذلك' },
  summaryImpactText: {
    en: 'The score became not only higher, but dramatically more stable across seeds and easier to trust.',
    de: 'Der Score wurde nicht nur höher, sondern auch deutlich stabiler über verschiedene Seeds hinweg.',
    fr: 'Le score est devenu non seulement plus élevé, mais aussi beaucoup plus stable entre les seeds.',
    es: 'La puntuación no solo subió, sino que también se volvió mucho más estable entre semillas.',
    ar: 'لم ترتفع النتيجة فقط، بل أصبحت أكثر ثباتاً بكثير عبر البذور وأسهل في الثقة.',
  },
  track1: { en: "Master's Thesis (Track 1) - JKU Linz - 2026", de: 'Masterarbeit (Track 1) - JKU Linz - 2026', fr: 'Mémoire de master (Track 1) - JKU Linz - 2026', es: 'Tesis de master (Track 1) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 1) - JKU Linz - 2026' },
  thesisTitle: { en: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control', de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren für OOD-Erkennung in der Inkjet-Druckqualitätskontrolle', fr: 'Modèles de diffusion conditionnels comme classificateurs génératifs pour détection OOD dans le contrôle qualité impression inkjet', es: 'Modelos de difusión condicional como clasificadores generativos para detección OOD en control de calidad de impresión inkjet', ar: 'نماذج الانتشار الشرطية كمصنفات توليدية لكشف الخارج عن التوزيع في مراقبة جودة الطباعة النافثة' },
  thesisDesc: { en: 'A diffusion model compares how well different class explanations reconstruct an image. The new separation loss pushes those explanations apart, making the anomaly score clearer and more stable.', de: 'Ein Diffusionsmodell vergleicht, wie gut verschiedene Klassenerklärungen ein Bild rekonstruieren. Die neue Separation Loss trennt diese Erklärungen und macht den Anomalie-Score klarer und stabiler.', fr: "Un modèle de diffusion compare la reconstruction selon différentes explications de classe. La separation loss les éloigne et rend le score d'anomalie plus clair et stable.", es: 'Un modelo de difusión compara reconstrucciones bajo distintas explicaciones de clase. La separation loss las separa y hace el score de anomalía más claro y estable.', ar: 'يقارن نموذج الانتشار مدى قدرة تفسيرات الفئات المختلفة على إعادة بناء الصورة. خسارة الفصل تبعد هذه التفسيرات وتجعل درجة الشذوذ أوضح وأكثر ثباتاً.' },
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  assistant: { en: 'Assistant', de: 'Assistent', fr: 'Assistant', es: 'Asistente', ar: 'المساعد' },
  metricLabel: { en: 'AUROC - CIFAR-10 Average', de: 'AUROC - CIFAR-10 Durchschnitt', fr: 'AUROC - moyenne CIFAR-10', es: 'AUROC - promedio CIFAR-10', ar: 'AUROC - متوسط CIFAR-10' },
  variance: { en: '+/-0.07% std dev (3 seeds)', de: '+/-0.07% Std.-Abw. (3 Seeds)', fr: '+/-0.07% écart-type (3 seeds)', es: '+/-0.07% desv. est. (3 semillas)', ar: '+/-0.07% انحراف معياري (3 بذور)' },
  chartHeading: {
    en: 'Separation-weight sweep · Threshold calibration · Reconstruction error',
    de: 'Variation des Separationsgewichts · Schwellenwertkalibrierung · Rekonstruktionsfehler',
    fr: 'Balayage du poids de séparation · Calibration du seuil · Erreur de reconstruction',
    es: 'Barrido del peso de separación · Calibración del umbral · Error de reconstrucción',
    ar: 'مسح وزن الفصل · معايرة العتبة · خطأ إعادة البناء',
  },
  openChart: {
    en: 'Open {chart} chart in viewer.',
    de: 'Diagramm {chart} im Betrachter öffnen.',
    fr: 'Ouvrir le graphique {chart} dans la visionneuse.',
    es: 'Abrir el gráfico {chart} en el visor.',
    ar: 'فتح الرسم البياني {chart} في العارض.',
  },
  formulaLabel: { en: 'Novel contribution - separation loss', de: 'Neuer Beitrag - Separation Loss', fr: 'Contribution nouvelle - separation loss', es: 'Contribución nueva - separation loss', ar: 'المساهمة الجديدة - خسارة الفصل' },
  plainIdea: {
    en: 'Plain idea: train with L_sep so c=0 ("normal") and c=1 ("other") disagree, then score s_OOD(x) = e_0(x) - e_1(x). ID inputs reconstruct better under c=0 (negative score); OOD inputs have higher e_0 than e_1 (score >= tau).',
    de: 'Grundidee: Training mit L_sep trennt c=0 („normal“) und c=1 („andere“); bei Inferenz misst s_OOD(x) = e_0(x) - e_1(x) die Differenz. ID liefert e_0 < e_1 (negativ); OOD liefert e_0 > e_1 (>= tau).',
    fr: "Idée clé : L_sep sépare c=0 (« normal ») et c=1 (« autre ») à l'entraînement ; à l'inférence, s_OOD(x) = e_0(x) - e_1(x) compare les erreurs. ID donne e_0 < e_1 (négatif) ; OOD donne e_0 > e_1 (>= tau).",
    es: 'Idea clave: L_sep separa c=0 («normal») y c=1 («otras») al entrenar; en inferencia s_OOD(x) = e_0(x) - e_1(x) compara los errores. En ID resulta negativo; en OOD e_0 > e_1 (>= tau).',
    ar: 'الفكرة باختصار: تفصل خسارة التدريب L_sep بين c=0 (طبيعي) وc=1 (غيره)، وعند الاستدلال تقيس s_OOD(x) = e_0(x) - e_1(x) الفرق. للبيانات الطبيعية e_0 < e_1 (سالب)، وللشاذة e_0 > e_1 (>= tau).',
  },
  step1: { en: 'Learn to denoise', de: 'Entrauschen lernen', fr: 'Apprendre à dénoiser', es: 'Aprender a limpiar ruido', ar: 'تعلم إزالة الضوضاء' },
  step1Text: { en: 'Denoise x under c=0 (normal) and c=1 (other).', de: 'Entrausche x unter c=0 (normal) und c=1 (andere).', fr: 'Débruiter x sous c=0 (normal) et c=1 (autre).', es: 'Limpiar ruido de x bajo c=0 (normal) y c=1 (otras).', ar: 'إزالة الضوضاء تحت الشرطين c=0 وc=1.' },
  step2: { en: 'Push explanations apart', de: 'Erklärungen trennen', fr: 'Éloigner les explications', es: 'Separar explicaciones', ar: 'إبعاد التفسيرات' },
  step2Text: { en: 'Maximize distance between c=0 and c=1 noise predictions during training (L_sep).', de: 'Maximiere im Training den Abstand zwischen den Vorhersagen c=0 und c=1 (L_sep).', fr: "Maximiser l'écart entre les prédictions c=0 et c=1 à l'entraînement (L_sep).", es: 'Maximizar la distancia entre predicciones c=0 y c=1 al entrenar (L_sep).', ar: 'زيادة المسافة بين تنبؤات الضوضاء لـ c=0 وc=1 أثناء التدريب (L_sep).' },
  step3: { en: 'Score s_OOD(x) = e_0 - e_1', de: 'Score s_OOD(x) = e_0 - e_1', fr: 'Score s_OOD(x) = e_0 - e_1', es: 'Score s_OOD(x) = e_0 - e_1', ar: 'الدرجة s_OOD(x) = e_0 - e_1' },
  step3Text: { en: 'Flag OOD when e_0(x) exceeds e_1(x): s_OOD(x) = e_0(x) - e_1(x) >= tau.', de: 'Erkenne OOD wenn e_0(x) größer als e_1(x) ist: s_OOD(x) = e_0(x) - e_1(x) >= tau.', fr: 'Signaler OOD quand e_0(x) dépasse e_1(x) : s_OOD(x) = e_0(x) - e_1(x) >= tau.', es: 'Detectar OOD cuando e_0(x) supera a e_1(x): s_OOD(x) = e_0(x) - e_1(x) >= tau.', ar: 'كشف OOD عندما يتجاوز e_0(x) قيمة e_1(x): s_OOD(x) = e_0(x) - e_1(x) >= tau.' },
  totalLoss: { en: 'Training loss L_total', de: 'Trainingsverlust L_total', fr: "Perte d'entraînement L_total", es: 'Pérdida de entrenamiento L_total', ar: 'خسارة التدريب L_total' },
  denoiseLoss: { en: 'L_denoise (MSE)', de: 'L_denoise (MSE)', fr: 'L_denoise (MSE)', es: 'L_denoise (MSE)', ar: 'L_denoise (MSE)' },
  sepLoss: { en: 'lambda * L_sep  |  Inference: s_OOD(x) = e_0(x) - e_1(x)', de: 'lambda * L_sep  |  Inferenz: s_OOD(x) = e_0(x) - e_1(x)', fr: 'lambda * L_sep  |  Inférence : s_OOD(x) = e_0(x) - e_1(x)', es: 'lambda * L_sep  |  Inferencia: s_OOD(x) = e_0(x) - e_1(x)', ar: 'lambda * L_sep  |  الاستدلال: s_OOD(x) = e_0(x) - e_1(x)' },
  latest: { en: 'Latest thesis result: lambda = 0.02 reached 99.03% +/- 0.07% AUROC, a +6.5pp gain over no separation loss.', de: 'Aktuelles Thesis-Ergebnis: lambda = 0.02 erreicht 99.03% +/- 0.07% AUROC, +6.5pp gegenüber ohne Separation Loss.', fr: 'Résultat thèse récent : lambda = 0.02 atteint 99.03% +/- 0.07% AUROC, +6.5pp vs sans separation loss.', es: 'Resultado reciente: lambda = 0.02 alcanzó 99.03% +/- 0.07% AUROC, +6.5pp frente a sin separation loss.', ar: 'آخر نتيجة في الرسالة: lambda = 0.02 حققت 99.03% +/- 0.07% AUROC، بزيادة +6.5pp مقارنة بدون خسارة الفصل.' },
  thesisPdf: { en: 'View Full Thesis (PDF) ->', de: 'Vollständige Thesis ansehen (PDF) ->', fr: 'Voir le mémoire complet (PDF) ->', es: 'Ver tesis completa (PDF) ->', ar: 'عرض الرسالة كاملة (PDF) ->' },
  track2: { en: "Master's Thesis (Track 2) - JKU Linz - 2026", de: 'Masterarbeit (Track 2) - JKU Linz - 2026', fr: 'Mémoire de master (Track 2) - JKU Linz - 2026', es: 'Tesis de master (Track 2) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 2) - JKU Linz - 2026' },
  track2Title: { en: 'Rigorous Cross-Domain Transfer & FTI_Zer0P Benchmark', de: 'Strenger Cross-Domain Transfer & FTI_Zer0P Benchmark', fr: 'Transfert cross-domain rigoureux & benchmark FTI_Zer0P', es: 'Transferencia cross-domain rigurosa y benchmark FTI_Zer0P', ar: 'انتقال صارم بين المجالات ومعيار FTI_Zer0P' },
  track2Desc: { en: 'The public YOLO+CDM print-quality pipeline was evaluated on FTI_Zer0P with strict 5-fold cross-validation, showing where separation loss transfers and where small manufacturing textures behave differently.', de: 'Die öffentliche YOLO+CDM Pipeline wurde auf FTI_Zer0P mit strenger 5-facher Kreuzvalidierung evaluiert und zeigt die Grenzen der Übertragbarkeit.', fr: 'La pipeline publique YOLO+CDM a été évaluée sur FTI_Zer0P avec validation croisée stricte en 5 plis, montrant les limites du transfert.', es: 'La pipeline pública YOLO+CDM se evaluó en FTI_Zer0P con validación cruzada estricta de 5 folds, mostrando los límites de transferencia.', ar: 'تم تقييم خط YOLO+CDM العام على FTI_Zer0P بتحقق تقاطعي صارم من 5 طيات، مع توضيح حدود انتقال خسارة الفصل.' },
  track2Meta: {
    en: 'Public Benchmark - InkjetOOD Codebase - FTI_Zer0P Public Dataset',
    de: 'Öffentlicher Benchmark - InkjetOOD Codebasis - Öffentlicher FTI_Zer0P Datensatz',
    fr: 'Benchmark public - base de code InkjetOOD - jeu de données public FTI_Zer0P',
    es: 'Benchmark público - base de código InkjetOOD - conjunto de datos público FTI_Zer0P',
    ar: 'معيار عام - كود InkjetOOD - مجموعة بيانات FTI_Zer0P العامة',
  },
  auroc5FoldCv: {
    en: 'AUROC - 5-Fold CV Baseline',
    de: 'AUROC - 5-fache Kreuzvalidierungs-Baseline',
    fr: 'AUROC - baseline validation croisée 5 plis',
    es: 'AUROC - línea base 5-fold CV',
    ar: 'AUROC - خط أساس التحقق التقاطعي الخماسي',
  },
  publicEval: { en: 'Rigorous Public Evaluation', de: 'Strenge öffentliche Evaluierung', fr: 'Évaluation publique rigoureuse', es: 'Evaluación pública rigurosa', ar: 'تقييم عام صارم' },
  datasetOverview: {
    en: 'Dataset Overview',
    de: 'Datensatz-Übersicht',
    fr: 'Aperçu du jeu de données',
    es: 'Descripción del conjunto de datos',
    ar: 'نظرة عامة على مجموعة البيانات',
  },
  fiveFoldCv: {
    en: '5-Fold Cross-Validation',
    de: '5-fache Kreuzvalidierung',
    fr: 'Validation croisée en 5 plis',
    es: 'Validación cruzada de 5 folds',
    ar: 'تحقق تقاطعي خماسي (5-Fold)',
  },
  zeroDefectSamples: {
    en: 'Zero-defect samples',
    de: 'Fehlerfreie Stichproben',
    fr: 'Échantillons sans défaut',
    es: 'Muestras sin defectos',
    ar: 'عينات خالية من العيوب',
  },
  defectCategories: {
    en: 'Defect categories',
    de: 'Fehlerkategorien',
    fr: 'Catégories de défauts',
    es: 'Categorías de defectos',
    ar: 'فئات العيوب',
  },
  thermographicFrames: {
    en: 'Industrial thermographic frames',
    de: 'Industrielle thermografische Einzelbilder',
    fr: 'Images thermographiques industrielles',
    es: 'Fotogramas termográficos industriales',
    ar: 'إطارات تصوير حراري صناعي',
  },
  industrialReport: { en: 'View Early Technical Report (2024) ->', de: 'Frühzeitigen Technikbericht ansehen (2024) ->', fr: 'Voir le rapport technique précoce (2024) ->', es: 'Ver informe técnico temprano (2024) ->', ar: 'عرض التقرير التقني المبكر (2024) ->' },
  diffusionCaseStudy: {
    en: 'Case Study ->',
    de: 'Fallstudie ->',
    fr: 'Étude de cas ->',
    es: 'Caso de estudio ->',
    ar: 'دراسة الحالة ->',
  },
  diffusionCode: {
    en: 'Code: DiffusionOOD ->',
    de: 'Code: DiffusionOOD ->',
    fr: 'Code : DiffusionOOD ->',
    es: 'Código: DiffusionOOD ->',
    ar: 'الكود: DiffusionOOD ->',
  },
  diffusionHf: {
    en: 'HF: Raw Scores & Weights ->',
    de: 'HF: Rohwerte & Gewichte ->',
    fr: 'HF : Scores bruts & poids ->',
    es: 'HF: Puntuaciones y pesos ->',
    ar: 'HF: النتائج الخام والأوزان ->',
  },
  loadInteractiveLab: {
    en: 'Launch Interactive Thesis Explorer',
    de: 'Interaktives Thesis-Labor starten',
    fr: 'Lancer le laboratoire interactif de thèse',
    es: 'Abrir laboratorio interactivo de tesis',
    ar: 'تشغيل مختبر الأطروحة التفاعلي',
  },
} satisfies Record<string, TranslationMap>

const publications = [
  { title: 'Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation', venue: 'Karunya Institute of Technology and Sciences - 2023', href: 'https://ahmed-3m.github.io/Motor%20Imagery%20classification%20Based%20Brain%20Computer.pdf' },
  { title: 'Reading Thoughts Using GANs', venue: 'Project Report - JKU Linz - 2023', href: 'https://ahmed-3m.github.io/Reading%20Thoughts%20Using%20GANs.pdf' },
]

/**
 * Renders the two-track M.Sc. thesis research section (CIFAR-10 binary CDM OOD detection
 * and FTI_Zer0P inkjet print quality control) with lightbox figures and the on-demand
 * interactive thesis explorer.
 */
export default function Research() {
  useReveal()
  const { t } = useI18n()
  const [lightbox, setLightbox] = useState<{ type: 'cifar' | 'industrial' | 'formula', index: number } | null>(null)
  const [shouldRenderLab, setShouldRenderLab] = useState(false)
  const labContainerRef = useRef<HTMLDivElement>(null)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (shouldRenderLab) return
    const node = labContainerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldRenderLab(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderLab(true)
          observer.disconnect()
        }
      },
      { rootMargin: '350px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldRenderLab])

  useEffect(() => {
    if (lightbox === null) {
      if (lastFocusedRef.current) {
        lastFocusedRef.current.focus()
        lastFocusedRef.current = null
      }
      return
    }
    const timer = window.setTimeout(() => {
      lightboxRef.current?.focus()
    }, 0)
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null)
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onEscape)
    }
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
                {t(copy.supervisor)}: Prof. Sepp Hochreiter - {t(copy.assistant)}: Claus Hofmann, MSc - JKU Linz - 2026
              </div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">99.03<span className="cd-rf-metric-unit">%</span></div>
              <div className="cd-rf-metric-label">{t(copy.metricLabel)}</div>
              <div className="cd-rf-metric-delta">{t(copy.variance)}</div>
            </div>
          </div>

          <div className="cd-band-eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
            {t(copy.chartHeading)}
          </div>

          <div className="cd-rf-charts">
            {cifarCharts.map(({ src, width, height, alt, caption }, index) => (
              <div
                key={src}
                className="cd-rf-chart cd-rf-chart--zoom"
                role="button"
                tabIndex={0}
                aria-label={`${t(copy.openChart).replace('{chart}', t(alt))} ${t(caption)}`}
                title="Click to expand"
                onClick={(event) => {
                  lastFocusedRef.current = event.currentTarget
                  setLightbox({ type: 'cifar', index })
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    lastFocusedRef.current = event.currentTarget
                    setLightbox({ type: 'cifar', index })
                  }
                }}
              >
                <img
                  src={src}
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                  alt={t(alt)}
                  style={{ width: '100%', height: 'auto', maxHeight: '260px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div className="cd-rf-chart-caption">{t(caption)}</div>
              </div>
            ))}
          </div>

          <div className="cd-rf-formula-box">
            <div className="cd-rfc-simple-label">{t(copy.formulaLabel)}</div>
            <div className="cd-rfc-summary">{t(copy.plainIdea)}</div>
            <div className="cd-rfc-flow" aria-label="Separation loss workflow">
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={(event) => { lastFocusedRef.current = event.currentTarget; setLightbox({ type: 'formula', index: 0 }) }} title="Click to expand">
                  <img
                    src={formulaVisuals[0].previewSrc}
                    width={formulaVisuals[0].width}
                    height={formulaVisuals[0].height}
                    loading="lazy"
                    decoding="async"
                    alt={t(formulaVisuals[0].alt)}
                    className="cd-rfc-visual cd-rf-chart--zoom"
                  />
                </button>
                <span className="cd-rfc-step">1</span>
                <strong>{t(copy.step1)}</strong>
                <span>{t(copy.step1Text)}</span>
              </div>
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={(event) => { lastFocusedRef.current = event.currentTarget; setLightbox({ type: 'formula', index: 1 }) }} title="Click to expand">
                  <img
                    src={formulaVisuals[1].previewSrc}
                    width={formulaVisuals[1].width}
                    height={formulaVisuals[1].height}
                    loading="lazy"
                    decoding="async"
                    alt={t(formulaVisuals[1].alt)}
                    className="cd-rfc-visual cd-rf-chart--zoom"
                  />
                </button>
                <span className="cd-rfc-step">2</span>
                <strong>{t(copy.step2)}</strong>
                <span>{t(copy.step2Text)}</span>
              </div>
              <div>
                <button type="button" className="cd-rfc-visual-button" onClick={(event) => { lastFocusedRef.current = event.currentTarget; setLightbox({ type: 'formula', index: 2 }) }} title="Click to expand">
                  <img
                    src={formulaVisuals[2].previewSrc}
                    width={formulaVisuals[2].width}
                    height={formulaVisuals[2].height}
                    loading="lazy"
                    decoding="async"
                    alt={t(formulaVisuals[2].alt)}
                    className="cd-rfc-visual cd-rf-chart--zoom"
                  />
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

          <div ref={labContainerRef} style={{ minHeight: shouldRenderLab ? undefined : 720 }}>
            {shouldRenderLab ? (
              <OodDemo />
            ) : (
              <div style={{ marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShouldRenderLab(true)}
                  className="cd-proj-link"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid var(--cd-b1)',
                    background: 'var(--cd-surf)',
                    cursor: 'pointer',
                  }}
                >
                  {t(copy.loadInteractiveLab)} &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.thesisPdf)}
            </a>
            <Link href="/case-studies/diffusion-ood/" className="cd-proj-link">
              {t(copy.diffusionCaseStudy)}
            </Link>
            <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.diffusionCode)}
            </a>
            <a href="https://huggingface.co/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.diffusionHf)}
            </a>
          </div>
        </div>

        <div className="cd-research-featured reveal">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">{t(copy.track2)}</div>
              <div className="cd-rf-title">{t(copy.track2Title)}</div>
              <div className="cd-rf-desc">{t(copy.track2Desc)} <strong>0.8673 +/- 0.0230 AUROC</strong>.</div>
              <div className="cd-rf-meta">{t(copy.track2Meta)}</div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">0.8673</div>
              <div className="cd-rf-metric-label">{t(copy.auroc5FoldCv)}</div>
              <div className="cd-rf-metric-delta">{t(copy.publicEval)}</div>
            </div>
          </div>

          <div className="cd-band-eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
            {t(copy.datasetOverview)}: {t(copy.thermographicFrames)} · {t(copy.zeroDefectSamples)} · {t(copy.defectCategories)} · {t(copy.fiveFoldCv)}
          </div>

          <div className="cd-rf-charts" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {industrialCharts.map(({ src, width, height, alt, caption }, index) => (
              <div
                key={src}
                className="cd-rf-chart cd-rf-chart--zoom"
                role="button"
                tabIndex={0}
                aria-label={`${t(copy.openChart).replace('{chart}', t(alt))} ${t(caption)}`}
                title="Click to expand"
                onClick={(event) => {
                  lastFocusedRef.current = event.currentTarget
                  setLightbox({ type: 'industrial', index })
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    lastFocusedRef.current = event.currentTarget
                    setLightbox({ type: 'industrial', index })
                  }
                }}
              >
                <img
                  src={src}
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                  alt={t(alt)}
                  style={{ width: '100%', height: 'auto', maxHeight: '260px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div className="cd-rf-chart-caption">{t(caption)}</div>
              </div>
            ))}
          </div>

          <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">{t(copy.industrialReport)}</a>
            <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">Code: InkjetOOD -&gt;</a>
            <a href="https://huggingface.co/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">HF: Model Weights -&gt;</a>
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
        <div
          className="cd-lightbox"
          onClick={() => setLightbox(null)}
        >
          <div
            ref={lightboxRef}
            className="cd-lightbox-inner"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer — press Escape to close"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setLightbox(null)
                return
              }
              if (event.key === 'Tab') {
                const focusable = lightboxRef.current?.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                if (!focusable || focusable.length === 0) return
                const first = focusable[0] as HTMLElement
                const last = focusable[focusable.length - 1] as HTMLElement
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault()
                  last.focus()
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault()
                  first.focus()
                }
              }
            }}
          >
            <button type="button" className="cd-lightbox-close" aria-label="Close image viewer" onClick={() => setLightbox(null)}>x</button>
            {lightbox.type === 'industrial' ? (
              <>
                <img src={industrialCharts[lightbox.index].src} alt={t(industrialCharts[lightbox.index].alt)} />
                <div className="cd-lightbox-caption">{t(industrialCharts[lightbox.index].caption)}</div>
              </>
            ) : lightbox.type === 'formula' ? (
              <>
                <img src={formulaVisuals[lightbox.index].src} alt={t(formulaVisuals[lightbox.index].alt)} />
                <div className="cd-lightbox-caption">{t(formulaVisuals[lightbox.index].caption)}</div>
              </>
            ) : (
              <>
                <img src={cifarCharts[lightbox.index].src} alt={t(cifarCharts[lightbox.index].alt)} />
                <div className="cd-lightbox-caption">{t(cifarCharts[lightbox.index].caption)}</div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
