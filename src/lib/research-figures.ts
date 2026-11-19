import type { ResearchFigureData } from '@/components/ResearchFigure'

export const cifarCharts: ResearchFigureData[] = [
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

export const industrialCharts: ResearchFigureData[] = [
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

export const formulaVisuals: ResearchFigureData[] = [
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
      en: 'Empirical score distributions and threshold decision rule s_OOD(x) = e_0(x) - e_1(x) >= tau showing ID/OOD overlap and positive or negative calibrated thresholds tau',
      de: 'Empirische Score-Verteilungen und Schwellenregel s_OOD(x) = e_0(x) - e_1(x) >= tau mit Überlappung sowie positiven oder negativen Schwellenwerten tau',
      fr: 'Distributions empiriques et règle de décision s_OOD(x) = e_0(x) - e_1(x) >= tau montrant le chevauchement ID/OOD et des seuils tau positifs ou négatifs',
      es: 'Distribuciones empíricas y regla de decisión s_OOD(x) = e_0(x) - e_1(x) >= tau con solapamiento y umbrales tau positivos o negativos',
      ar: 'توزيعات الدرجات التجريبية وقاعدة القرار s_OOD(x) = e_0(x) - e_1(x) >= tau مع توضيح التداخل وإمكانية كون العتبة tau موجبة أو سالبة',
    },
    caption: {
      en: 'Step 3: score s_OOD(x) = e_0(x) - e_1(x) flags OOD when >= calibrated threshold tau (may be + or -)',
      de: 'Schritt 3: s_OOD(x) = e_0(x) - e_1(x) erkennt OOD ab kalibrierter Schwelle tau (+ oder - möglich)',
      fr: 'Étape 3 : s_OOD(x) = e_0(x) - e_1(x) signale OOD si >= seuil calibré tau (+ ou - possible)',
      es: 'Paso 3: s_OOD(x) = e_0(x) - e_1(x) detecta OOD si >= umbral calibrado tau (+ o -)',
      ar: 'الخطوة 3: تصنّف s_OOD(x) = e_0(x) - e_1(x) العينة كـ OOD عند >= العتبة المعايرة tau (موجبة أو سالبة)',
    },
  },
]
