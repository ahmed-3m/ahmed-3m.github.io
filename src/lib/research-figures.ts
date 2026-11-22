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

export const separationIllustrations = [
  {
    src: '/research/separation-two-predictions.webp',
    width: 960,
    height: 640,
    alt: {
      en: 'A noisy airplane image branches into two noise predictions, one on a solid line and one on a dashed line.',
      de: 'Ein verrauschtes Flugzeugbild führt zu zwei Rauschvorhersagen, eine über eine durchgezogene und eine über eine gestrichelte Linie.',
      fr: 'Une image d’avion bruitée mène à deux prédictions de bruit par un trait plein et un trait pointillé.',
      es: 'Una imagen ruidosa de un avión se bifurca en dos predicciones de ruido, una con línea continua y otra discontinua.',
      ar: 'تتفرع صورة طائرة مشوشة إلى تنبؤين بالضوضاء، أحدهما بخط متصل والآخر بخط متقطّع.',
    },
    caption: {
      en: 'Both predictions use the same noisy image. The solid line is the familiar condition and the dashed line is the other condition.',
      de: 'Beide Vorhersagen nutzen dasselbe verrauschte Bild. Die durchgezogene Linie zeigt die vertraute Bedingung, die gestrichelte die andere.',
      fr: 'Les deux prédictions utilisent la même image bruitée. Le trait plein indique la condition familière et le trait pointillé l’autre condition.',
      es: 'Ambas predicciones usan la misma imagen ruidosa. La línea continua indica la condición familiar y la discontinua, la otra.',
      ar: 'يستخدم التنبؤان الصورة المشوشة نفسها. يشير الخط المتصل إلى الشرط المألوف والخط المتقطّع إلى الشرط الآخر.',
    },
  },
  {
    src: '/research/separation-prediction-gap.webp',
    width: 960,
    height: 640,
    alt: {
      en: 'A double-headed arrow marks a widening gap between the two noise predictions for the same airplane image.',
      de: 'Ein Doppelpfeil zeigt den größer werdenden Abstand zwischen den beiden Rauschvorhersagen für dasselbe Flugzeugbild.',
      fr: 'Une flèche à deux pointes montre l’écart croissant entre les deux prédictions de bruit pour la même image d’avion.',
      es: 'Una flecha de doble punta muestra la distancia creciente entre las dos predicciones de ruido para la misma imagen del avión.',
      ar: 'يشير سهم برأسين إلى اتساع المسافة بين تنبؤي الضوضاء للصورة نفسها.',
    },
    caption: {
      en: 'During training, separation loss increases the difference between the two noise predictions.',
      de: 'Beim Training vergrößert die Separation Loss den Unterschied zwischen den beiden Rauschvorhersagen.',
      fr: 'Pendant l’entraînement, la perte de séparation augmente l’écart entre les deux prédictions de bruit.',
      es: 'Durante el entrenamiento, la pérdida de separación aumenta la diferencia entre las dos predicciones de ruido.',
      ar: 'تزيد خسارة الفصل أثناء التدريب الفرق بين تنبؤَي الضوضاء.',
    },
  },
] satisfies ResearchFigureData[]
