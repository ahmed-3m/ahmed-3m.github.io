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

export const separationNoiseTraining = {
  src: '/research/separation-noise-training.webp',
  lightSrc: '/research/separation-noise-training-light.webp',
  width: 960,
  height: 640,
  alt: {
    en: 'An arrow leads from a clean airplane photo to the same photo with fine noise added.',
    de: 'Ein Pfeil führt von einem unverrauschten Flugzeugfoto zum selben Foto mit hinzugefügtem Rauschen.',
    fr: 'Une flèche relie une photo d’avion nette à la même photo avec du bruit ajouté.',
    es: 'Una flecha conecta una foto nítida de un avión con la misma foto tras añadirle ruido.',
    ar: 'يشير سهم من صورة طائرة واضحة إلى الصورة نفسها بعد إضافة الضوضاء إليها.',
  },
  caption: {
    en: 'Add known noise to a training image. Under its true class condition, the model learns to predict the noise that was added.',
    de: 'Füge einem Trainingsbild bekanntes Rauschen hinzu. Das Modell lernt, dieses Rauschen unter der tatsächlichen Klassenbedingung vorherzusagen.',
    fr: 'Ajouter un bruit connu à une image d’entraînement. Avec la classe réelle de l’image, le modèle apprend à prédire le bruit ajouté.',
    es: 'Añade ruido conocido a una imagen de entrenamiento. Con la clase real de la imagen, el modelo aprende a predecir el ruido añadido.',
    ar: 'أضف ضوضاء معروفة إلى صورة تدريبية. يتعلّم النموذج التنبؤ بالضوضاء المضافة عند تزويده بالفئة الفعلية للصورة.',
  },
} satisfies ResearchFigureData & { lightSrc: string }
