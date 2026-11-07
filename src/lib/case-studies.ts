import { type TranslationMap } from '@/lib/i18n-config'

export type CaseStudy = {
  slug: 'diffusion-ood' | 'inkjet-ood' | 'faultrix' | 'sihem'
  title: TranslationMap
  summary: TranslationMap
  problem: TranslationMap
  role: TranslationMap
  stack?: string[]
  pipelineStages?: Array<{ title: TranslationMap; desc: TranslationMap }>
  approach: TranslationMap[]
  results: TranslationMap[]
  lessons: TranslationMap[]
  artifacts: Array<{ label: TranslationMap; href: string; external?: boolean }>
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'diffusion-ood',
    title: {
      en: 'DiffusionOOD: Class-Conditional Separation Loss for Out-of-Distribution Detection',
      de: 'DiffusionOOD: Klassenkonditionale Separation Loss für OOD-Erkennung',
      fr: 'DiffusionOOD : Separation Loss conditionnelle pour la détection OOD',
      es: 'DiffusionOOD: Separation Loss condicional para detección OOD',
      ar: 'DiffusionOOD: خسارة الفصل الشرطية لكشف الخارج عن التوزيع',
    },
    summary: {
      en: 'Conditional diffusion models used as generative classifiers for OOD detection, with separation loss reaching 99.03% ± 0.07% AUROC on a within-CIFAR airplane-vs-rest binary split (single ID class).',
      de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren für OOD-Erkennung mit Separation Loss und 99.03% ± 0.07% AUROC auf einem Within-CIFAR Airplane-vs-Rest-Binary-Split (einzelne ID-Klasse).',
      fr: 'Modèles de diffusion conditionnels utilisés comme classificateurs génératifs pour la détection OOD avec 99.03% ± 0.07% AUROC sur un split binaire airplane-vs-rest within-CIFAR (classe ID unique).',
      es: 'Modelos de difusión condicional usados como clasificadores generativos para detección OOD con 99.03% ± 0.07% AUROC en un split binario airplane-vs-rest within-CIFAR (clase ID única).',
      ar: 'نماذج انتشار شرطية استُخدمت كمصنفات توليدية لكشف OOD مع 99.03% ± 0.07% AUROC على تقسيم ثنائي airplane-vs-rest ضمن CIFAR-10 (فئة ID واحدة).',
    },
    problem: {
      en: 'Standard neural classifiers exhibit dangerous overconfidence on out-of-distribution samples. Generative classifiers offer principled reconstruction error scoring, but suffer from catastrophic variance across random seeds and ambiguous boundary decisions.',
      de: 'Klassische neuronale Klassifikatoren neigen zu gefährlicher Überkonfidenz bei OOD-Daten. Generative Klassifikatoren bieten prinzipielle Rekonstruktionsfehler, leiden aber unter starker Varianz über Seeds und uneindeutigen Entscheidungsgrenzen.',
      fr: "Les classificateurs neuronaux standards affichent une surconfiance dangereuse sur les échantillons hors distribution. Les classificateurs génératifs offrent une erreur de reconstruction principielle mais souffrent d'une forte variance entre seeds.",
      es: 'Los clasificadores neuronales estándar muestran un exceso de confianza peligroso en muestras OOD. Los clasificadores generativos ofrecen una señal de error de reconstrucción pero sufren de alta varianza entre semillas.',
      ar: 'تظهر المصنفات العصبية التقليدية ثقة مفرطة وخطيرة في العينات الخارجة عن التوزيع. تقدم المصنفات التوليدية تقييماً منهجياً عبر أخطاء إعادة البناء، لكنها تعاني من تشتت هائل عبر البذور العشوائية وحدود قرار ملتبسة.',
    },
    role: {
      en: 'Master thesis author: novel separation loss objective formulation, PyTorch Lightning & Hydra infrastructure, multi-seed statistical evaluation, and benchmark analysis.',
      de: 'Autor der Masterarbeit: Formulierung der neuen Separation-Loss-Zielfunktion, PyTorch Lightning & Hydra Infrastruktur, statistische Multi-Seed-Evaluation und Benchmark-Analyse.',
      fr: 'Auteur du mémoire : formulation de la novel separation loss, infrastructure PyTorch Lightning & Hydra, évaluation statistique multi-seeds et analyse des benchmarks.',
      es: 'Autor de la tesis: formulación de la nueva función objetivo de separation loss, infraestructura en PyTorch Lightning e Hydra, evaluación estadística con múltiples semillas y análisis.',
      ar: 'صاحب رسالة الماجستير: صياغة دالة خسارة الفصل المبتكرة، وبناء بنية التجارب بـ PyTorch Lightning وHydra، والتقييم الإحصائي عبر بذور متعددة، وتحليل المعايير.',
    },
    stack: ['PyTorch', 'PyTorch Lightning', 'Hydra', 'DDPM / UNet', 'W&B', 'CIFAR-10'],
    pipelineStages: [
      {
        title: { en: '1. Class-Conditional Denoising', de: '1. Klassenkonditionales Entrauschen', fr: '1. Débruitage conditionnel', es: '1. Denoising condicional', ar: '1. إزالة الضوضاء الشرطية للفئة' },
        desc: { en: 'Reconstruct inputs under competing in-distribution hypothesis conditions across forward diffusion timesteps.', de: 'Eingaben unter konkurrierenden In-Distribution-Hypothesen über Diffusionszeitschritte hinweg rekonstruieren.', fr: 'Reconstruire les entrées sous des hypothèses concurrentes le long des pas de diffusion.', es: 'Reconstruir entradas bajo hipótesis rivales a lo largo de los pasos de difusión.', ar: 'إعادة بناء المدخلات تحت فرضيات الفئات المتنافسة عبر خطوات الانتشار الأمامية.' },
      },
      {
        title: { en: '2. Separation Objective', de: '2. Separation-Loss Zielfunktion', fr: '2. Objectif de séparation', es: '2. Objetivo de separación', ar: '2. هدف خسارة الفصل' },
        desc: { en: 'Explicitly penalize similarity between competing noise predictions with calibrated weight lambda=0.02.', de: 'Ähnlichkeit zwischen konkurrierenden Rauschvorhersagen mit kalibriertem Gewicht lambda=0.02 bestrafen.', fr: 'Pénaliser explicitement la similarité entre prédictions de bruit concurrentes avec un poids lambda=0.02.', es: 'Penalizar la similitud entre predicciones de ruido rivales con peso calibrado lambda=0.02.', ar: 'معاقبة التشابه صراحة بين توقعات الضوضاء المتنافسة بوزن معاير lambda=0.02.' },
      },
      {
        title: { en: '3. Statistical Anomaly Scoring', de: '3. Statistische Anomaliebewertung', fr: '3. Score statistique d anomalie', es: '3. Puntuación estadística de anomalía', ar: '3. قياس الشذوذ الإحصائي' },
        desc: { en: 'Compute difference-of-reconstruction error as a calibrated OOD score tested over 3 random seeds.', de: 'Differenz-Rekonstruktionsfehler als kalibrierten OOD-Score über 3 Zufalls-Seeds berechnen.', fr: "Calculer la différence d'erreur de reconstruction comme score OOD calibré testé sur 3 seeds.", es: 'Calcular la diferencia de error de reconstrucción como puntuación OOD evaluada en 3 semillas.', ar: 'حساب فرق خطأ إعادة البناء كدرجة شذوذ معايرة تم اختبارها على 3 بذور عشوائية.' },
      },
    ],
    approach: [
      {
        en: 'Train a binary conditional diffusion model and score reconstruction error under competing class conditions.',
        de: 'Ein binäres konditionales Diffusionsmodell trainieren und den Rekonstruktionsfehler unter konkurrierenden Klassenbedingungen bewerten.',
        fr: "Entraîner un modèle de diffusion conditionnel binaire et évaluer l'erreur de reconstruction sous des conditions de classe concurrentes.",
        es: 'Entrenar un modelo de difusión condicional binario y puntuar el error de reconstrucción bajo condiciones de clase rivales.',
        ar: 'تدريب نموذج انتشار شرطي ثنائي وتقييم خطأ إعادة البناء تحت شروط الفئات المتنافسة.',
      },
      {
        en: 'Add class-conditional separation loss to push conditional noise predictions apart and remove model ambiguity.',
        de: 'Klassenkonditionale Separation Loss hinzufügen, um konditionale Rauschvorhersagen auseinanderzudrücken und Mehrdeutigkeiten zu beseitigen.',
        fr: "Ajouter une separation loss conditionnelle à la classe pour éloigner les prédictions de bruit et lever l'ambiguïté.",
        es: 'Añadir separation loss condicional a la clase para distanciar las predicciones de ruido y eliminar la ambigüedad.',
        ar: 'إضافة خسارة فصل شرطية للفئة لدفع توقعات الضوضاء الشرطية للابتعاد عن بعضها وإزالة غموض النموذج.',
      },
      {
        en: 'Evaluate with multiple random seeds and external zero-shot benchmarks instead of relying on one lucky run.',
        de: 'Mit mehreren Zufalls-Seeds und externen Zero-Shot-Benchmarks evaluieren, statt sich auf einen einzelnen Glückslauf zu verlassen.',
        fr: "Évaluer sur plusieurs seeds aléatoires et des benchmarks zero-shot externes plutôt que sur un seul run chanceux.",
        es: 'Evaluar con múltiples semillas aleatorias y benchmarks zero-shot externos en lugar de confiar en una sola ejecución afortunada.',
        ar: 'التقييم عبر بذور عشوائية متعددة ومعايير zero-shot خارجية بدلاً من الاعتماد على تشغيل وحيد محظوظ.',
      },
    ],
    results: [
      {
        en: '99.03% ± 0.07% AUROC averaged over three seeds on a within-CIFAR airplane-vs-rest binary split (single ID class; not comparable to multi-class CIFAR-10 OOD benchmarks).',
        de: '99.03% ± 0.07% AUROC gemittelt über drei Seeds auf einem Within-CIFAR Airplane-vs-Rest-Binary-Split (einzelne ID-Klasse; nicht vergleichbar mit Mehrklassen-CIFAR-10-OOD-Benchmarks).',
        fr: '99.03% ± 0.07% AUROC en moyenne sur trois seeds sur un split binaire within-CIFAR airplane-vs-rest (classe ID unique ; non comparable aux benchmarks OOD multi-classes CIFAR-10).',
        es: '99.03% ± 0.07% AUROC promedio sobre tres semillas en un split binario within-CIFAR airplane-vs-rest (clase ID única; no comparable con benchmarks OOD multiclase de CIFAR-10).',
        ar: '99.03% ± 0.07% AUROC كمتوسط عبر 3 بذور عشوائية على تقسيم ثنائي airplane-vs-rest ضمن CIFAR-10 (فئة ID واحدة؛ غير قابل للمقارنة بمعايير OOD متعددة الفئات لـ CIFAR-10).',
      },
      {
        en: '+6.5 percentage points gain over the non-separated baseline (which achieved 92.52% ± 11.07% AUROC at lambda=0).',
        de: '+6.5 Prozentpunkte Gewinn gegenüber der Basis ohne Separation (die bei lambda=0 92.52% ± 11.07% AUROC erreichte).',
        fr: '+6.5 points de pourcentage de gain face à la baseline sans séparation (qui atteignait 92.52% ± 11.07% AUROC à lambda=0).',
        es: '+6.5 puntos porcentuales de mejora sobre la base sin separación (que alcanzó 92.52% ± 11.07% AUROC con lambda=0).',
        ar: '+6.5 نقطة مئوية تحسن على خط الأساس بدون فصل (الذي حقق 92.52% ± 11.07% AUROC عند lambda=0).',
      },
      {
        en: 'Seed-42 generalized zero-shot to CIFAR-100 (96.97%), Places365 (96.50%), FashionMNIST (94.03%), Textures (92.84%), and SVHN (90.50%).',
        de: 'Seed-42 generalisierte Zero-Shot auf CIFAR-100 (96.97%), Places365 (96.50%), FashionMNIST (94.03%), Textures (92.84%) und SVHN (90.50%).',
        fr: 'Seed-42 a généralisé en zero-shot sur CIFAR-100 (96.97%), Places365 (96.50%), FashionMNIST (94.03%), Textures (92.84%) et SVHN (90.50%).',
        es: 'Seed-42 generalizó zero-shot a CIFAR-100 (96.97%), Places365 (96.50%), FashionMNIST (94.03%), Textures (92.84%) y SVHN (90.50%).',
        ar: 'عممت البذرة 42 بنمط zero-shot على CIFAR-100 (96.97%)، وPlaces365 (96.50%)، وFashionMNIST (94.03%)، وTextures (92.84%)، وSVHN (90.50%).',
      },
    ],
    lessons: [
      {
        en: 'Stability across random seeds matters almost as much as peak score in safety-critical deployments.',
        de: 'Stabilität über Zufalls-Seeds hinweg zählt in sicherheitskritischen Anwendungen fast so viel wie der Spitzenwert.',
        fr: 'La stabilité entre seeds aléatoires compte presque autant que le score maximal dans les déploiements critiques.',
        es: 'La estabilidad entre semillas aleatorias importa casi tanto como la puntuación máxima en despliegues críticos.',
        ar: 'الثبات عبر البذور العشوائية يوازي في أهميته النتيجة القصوى في التطبيقات الحرجة.',
      },
      {
        en: 'A scientific finding becomes significantly more useful when variance and error bars are reported honestly.',
        de: 'Eine wissenschaftliche Erkenntnis wird deutlich verlässlicher, wenn Varianz und Fehlerbalken ehrlich berichtet werden.',
        fr: "Une conclusion scientifique devient bien plus utile lorsque la variance et les barres d'erreur sont rapportées honnêtement.",
        es: 'Un hallazgo científico es mucho más útil cuando la varianza y las barras de error se comunican con honestidad.',
        ar: 'تصبح النتيجة العلمية أكثر موثوقية وفائدة عندما يُذكر التباين وأشرطة الخطأ بأمانة وشفافية.',
      },
      {
        en: 'Cross-domain transfer should be tested empirically, not assumed from synthetic benchmarks.',
        de: 'Cross-Domain-Transfer muss empirisch getestet werden, statt aus synthetischen Benchmarks vorausgesetzt zu werden.',
        fr: 'Le transfert cross-domain doit être testé empiriquement plutôt que supposé à partir de benchmarks synthétiques.',
        es: 'La transferencia entre dominios debe probarse empíricamente, no asumirse desde benchmarks sintéticos.',
        ar: 'الانتقال بين المجالات يجب أن يُختبر تجريبياً، لا أن يُفترض مسبقاً من معايير اصطناعية.',
      },
    ],
    artifacts: [
      { label: { en: 'Thesis PDF', de: 'Thesis PDF', fr: 'PDF du mémoire', es: 'PDF de la tesis', ar: 'PDF الرسالة' }, href: '/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf' },
      { label: { en: 'DiffusionOOD repository', de: 'DiffusionOOD Repository', fr: 'Dépôt DiffusionOOD', es: 'Repositorio DiffusionOOD', ar: 'مستودع DiffusionOOD' }, href: 'https://github.com/ahmed-3m/DiffusionOOD', external: true },
    ],
  },
  {
    slug: 'inkjet-ood',
    title: {
      en: 'InkjetOOD: Transferring Generative OOD Detection to Industrial Print Quality Control',
      de: 'InkjetOOD: Transfer generativer OOD-Erkennung auf industrielle Druckqualitätskontrolle',
      fr: 'InkjetOOD : Transfert de la détection OOD générative au contrôle qualité industriel',
      es: 'InkjetOOD: Transferencia de detección OOD generativa al control de calidad de impresión industrial',
      ar: 'InkjetOOD: نقل كشف الخارج عن التوزيع التوليدي إلى مراقبة جودة الطباعة الصناعية',
    },
    summary: {
      en: 'A public YOLO + conditional diffusion pipeline for industrial print-quality control evaluated on FTI_Zer0P.',
      de: 'Eine öffentliche YOLO + Conditional-Diffusion-Pipeline für industrielle Druckqualitätskontrolle auf FTI_Zer0P.',
      fr: 'Une pipeline publique YOLO + diffusion conditionnelle pour le contrôle qualité industriel sur FTI_Zer0P.',
      es: 'Una pipeline pública YOLO + difusión condicional para control de calidad industrial sobre FTI_Zer0P.',
      ar: 'خط عام يجمع بين YOLO ونموذج انتشار شرطي لمراقبة جودة الطباعة الصناعية على FTI_Zer0P.',
    },
    problem: {
      en: 'Industrial quality control in inkjet printing on composite building components deals with micro-scale defects, severe class imbalance, and strict latency requirements, requiring rigorous cross-validation.',
      de: 'Industrielle Qualitätskontrolle beim Inkjet-Druck auf Bauelementen steht vor mikroskopischen Fehlern, starkem Klassenungleichgewicht und strengen Latenzanforderungen mit harter Kreuzvalidierung.',
      fr: "Le contrôle qualité industriel en impression inkjet sur composants de construction fait face à des micro-défauts, un déséquilibre sévère des classes et des contraintes de latence strictes.",
      es: 'El control de calidad industrial en impresión inkjet sobre componentes de construcción enfrenta microdefectos, desbalance severo de clases y estrictas restricciones de latencia.',
      ar: 'تواجه مراقبة الجودة الصناعية في الطباعة النافثة على مكونات البناء عيوباً مجهرية دقيقة، وعدم توازن حاد في الفئات، ومتطلبات استجابة زمنية صارمة تتطلب تحققاً تقاطعياً دقيقاً.',
    },
    role: {
      en: 'Machine vision researcher: dataset annotation in Roboflow, YOLOv8 feature integration, conditional diffusion modeling, and 5-fold cross-validation benchmarking.',
      de: 'Machine-Vision-Forscher: Datensatz-Annotation in Roboflow, YOLOv8-Feature-Integration, konditionale Diffusionsmodellierung und 5-faches Kreuzvalidierungs-Benchmarking.',
      fr: 'Chercheur en vision industrielle : annotation du jeu de données dans Roboflow, intégration YOLOv8, modélisation par diffusion conditionnelle et benchmarking en validation croisée 5 plis.',
      es: 'Investigador de visión artificial: anotación del conjunto de datos en Roboflow, integración de características YOLOv8, modelos de difusión condicional y benchmarking con 5-fold CV.',
      ar: 'باحث رؤية حاسوبية: توصيف البيانات في Roboflow، دمج ميزات YOLOv8، نمذجة الانتشار الشرطي، وتقييم المعايير بتحقق تقاطعي خماسي.',
    },
    stack: ['YOLOv8', 'PyTorch', 'Roboflow', 'OpenCV', 'Hydra', 'FTI_Zer0P'],
    pipelineStages: [
      {
        title: { en: '1. Industrial Surface Imaging', de: '1. Industrielle Oberflächenerfassung', fr: '1. Imagerie de surface industrielle', es: '1. Captura de superficies industriales', ar: '1. تصوير الأسطح الصناعية' },
        desc: { en: 'High-resolution thermographic and optical frame capture of composite building components.', de: 'Hochauflösende thermografische und optische Einzelbilder von Verbundbauelementen erfassen.', fr: 'Capture d images thermographiques et optiques haute résolution de panneaux de construction.', es: 'Captura de imágenes termográficas y ópticas de alta resolución de paneles compuestos.', ar: 'التقاط صور حرارية وبصرية عالية الدقة لمكونات البناء المركبة.' },
      },
      {
        title: { en: '2. YOLOv8 Feature Extraction', de: '2. YOLOv8 Merkmalsextraktion', fr: '2. Extraction de caractéristiques YOLOv8', es: '2. Extracción de características con YOLOv8', ar: '2. استخراج الميزات بواسطة YOLOv8' },
        desc: { en: 'Localizing regions of interest and extracting structured defect feature representations.', de: 'Interessante Regionen lokalisieren und strukturierte Fehler-Merkmale extrahieren.', fr: 'Localisation des régions d intérêt et extraction de représentations structurées de défauts.', es: 'Localización de regiones de interés y extracción de representaciones estructuradas de defectos.', ar: 'تحديد مناطق الاهتمام واستخراج تمثيلات منظمة لميزات العيوب.' },
      },
      {
        title: { en: '3. 5-Fold Cross-Validation', de: '3. 5-fache Kreuzvalidierung', fr: '3. Validation croisée en 5 plis', es: '3. Validación cruzada de 5 folds', ar: '3. تحقق تقاطعي خماسي صارم' },
        desc: { en: 'Strict 5-fold CV protocol on FTI_Zer0P establishing an auditable 0.8673 ± 0.0230 baseline.', de: 'Striktes 5-faches CV-Protokoll auf FTI_Zer0P zur Etablierung einer auditierbaren 0.8673 ± 0.0230 Baseline.', fr: 'Protocole strict de validation croisée 5 plis sur FTI_Zer0P établissant une référence vérifiable de 0.8673 ± 0.0230.', es: 'Protocolo estricto de 5-fold CV en FTI_Zer0P estableciendo una línea base auditable de 0.8673 ± 0.0230.', ar: 'بروتوكول تحقق تقاطعي خماسي صارم على FTI_Zer0P يثبت خط أساس موثوقاً عند 0.8673 ± 0.0230.' },
      },
    ],
    approach: [
      {
        en: 'Extract structured visual features from industrial prints using YOLOv8 backbone representations.',
        de: 'Strukturierte visuelle Merkmale aus industriellen Drucken mittels YOLOv8-Backbone extrahieren.',
        fr: 'Extraire des caractéristiques visuelles structurées à partir des impressions avec le backbone YOLOv8.',
        es: 'Extraer características visuales estructuradas de impresiones industriales con la arquitectura YOLOv8.',
        ar: 'استخراج ميزات بصرية منظمة من المطبوعات الصناعية باستخدام العمود الفقري لـ YOLOv8.',
      },
      {
        en: 'Condition a diffusion model on print metadata and feature embeddings for quality verification.',
        de: 'Ein Diffusionsmodell auf Druckmetadaten und Feature-Embeddings zur Qualitätsprüfung konditionieren.',
        fr: 'Conditionner un modèle de diffusion sur les métadonnées et embeddings pour vérifier la qualité.',
        es: 'Condicionar un modelo de difusión en metadatos y embeddings para verificar la calidad.',
        ar: 'تكييف نموذج انتشار على بيانات المطبوعات والتضمينات للتحقق من الجودة.',
      },
      {
        en: 'Run strict 5-fold cross-validation on FTI_Zer0P and compare separation loss settings under statistical correction.',
        de: 'Strenge 5-fache Kreuzvalidierung auf FTI_Zer0P durchführen und Separation-Loss-Einstellungen statistisch vergleichen.',
        fr: 'Exécuter une validation croisée stricte en 5 plis sur FTI_Zer0P et comparer la separation loss avec correction statistique.',
        es: 'Ejecutar validación cruzada estricta de 5 folds en FTI_Zer0P y comparar ajustes de separation loss.',
        ar: 'إجراء تحقق تقاطعي صارم من 5 طيات على FTI_Zer0P ومقارنة إعدادات خسارة الفصل مع تصحيح إحصائي.',
      },
    ],
    results: [
      {
        en: '0.8673 ± 0.0230 AUROC baseline achieved on the public FTI_Zer0P benchmark under strict 5-fold cross-validation.',
        de: '0.8673 ± 0.0230 AUROC Baseline auf dem öffentlichen FTI_Zer0P Benchmark unter strenger 5-facher Kreuzvalidierung erreicht.',
        fr: '0.8673 ± 0.0230 AUROC de référence obtenu sur le benchmark public FTI_Zer0P sous validation croisée stricte en 5 plis.',
        es: '0.8673 ± 0.0230 AUROC de referencia alcanzado en el benchmark público FTI_Zer0P bajo validación cruzada estricta de 5 folds.',
        ar: 'تحقيق خط أساس 0.8673 ± 0.0230 AUROC على معيار FTI_Zer0P العام بتحقق تقاطعي خماسي صارم.',
      },
      {
        en: 'Separation loss showed null effect on small industrial textures, confirming that natural-image gains do not automatically transfer to manufacturing surfaces.',
        de: 'Separation Loss zeigte keinen signifikanten Gewinn bei feinen Industriestrukturen — Naturbild-Gewinne übertragen sich nicht automatisch auf Fertigungsoberflächen.',
        fr: "La separation loss n'a pas montré d'effet significatif sur les micro-textures industrielles, prouvant que les gains d'images naturelles ne se transfèrent pas automatiquement aux surfaces de fabrication.",
        es: 'La separation loss no mostró mejora significativa en microtexturas industriales, demostrando que las ganancias en imágenes naturales no se transfieren automáticamente.',
        ar: 'أظهرت خسارة الفصل تأثيراً محايداً على الأنسجة الصناعية الدقيقة، مما يؤكد أن مكاسب الصور الطبيعية لا تنتقل تلقائياً إلى أسطح التصنيع.',
      },
      {
        en: 'Clarified domain boundary conditions and documented negative results openly to save future engineering and research cycles.',
        de: 'Grenzbedingungen des Transfers geklärt und Negativergebnisse offen dokumentiert, um künftige Engineering- und Forschungsaufwände zu sparen.',
        fr: 'Clarifié les limites de transfert et documenté les résultats négatifs pour guider les recherches futures et éviter des efforts inutiles.',
        es: 'Aclaró los límites de transferencia y documentó resultados negativos para ahorrar ciclos de ingeniería e investigación futuros.',
        ar: 'توضيح حدود انتقال النماذج وتوثيق النتائج السلبية بشفافية لتوفير جهود الهندسة والبحث المستقبلية.',
      },
    ],
    lessons: [
      {
        en: 'Industrial transfer requires re-evaluating core assumptions, not just reapplying code.',
        de: 'Industrietransfer erfordert das Hinterfragen von Grundannahmen, nicht nur Wiederverwendung von Code.',
        fr: 'Le transfert industriel exige de réévaluer les hypothèses fondamentales, pas simplement de réutiliser le code.',
        es: 'La transferencia industrial requiere reevaluar supuestos fundamentales, no solo reutilizar código.',
        ar: 'يتطلب النقل الصناعي إعادة تقييم الفرضيات الجوهرية، وليس مجرد إعادة استخدام الكود.',
      },
      {
        en: 'Feature heterogeneity and texture scale profoundly change generative classifier dynamics.',
        de: 'Merkmal-Heterogenität und Texturskalen verändern das Verhalten generativer Klassifikatoren grundlegend.',
        fr: "L'hétérogénéité des caractéristiques et l'échelle des textures modifient la dynamique des classificateurs génératifs.",
        es: 'La heterogeneidad de características y la escala de texturas modifican la dinámica del clasificador generativo.',
        ar: 'يغير تباين الميزات ومقاييس الأنسجة ديناميكيات المصنف التوليدي بشكل جذري.',
      },
      {
        en: 'A rigorously documented null result is a valuable scientific contribution that prevents wasted engineering time.',
        de: 'Ein sorgfältig dokumentiertes Null-Ergebnis ist ein wertvoller wissenschaftlicher Beitrag, der Fehlaufwand verhindert.',
        fr: 'Un résultat nul documenté avec rigueur est une contribution scientifique précieuse évitant le gaspillage de temps d ingénierie.',
        es: 'Un resultado nulo documentado con rigor es una contribución científica valiosa que evita pérdida de tiempo.',
        ar: 'تعتبر النتيجة المحايدة الموثقة بدقة مساهمة علمية قيّمة تمنع إهدار أوقات التطوير الهندسي.',
      },
    ],
    artifacts: [
      { label: { en: 'Thesis PDF (0.8673 source)', de: 'Thesis PDF (0.8673 Quelle)', fr: 'PDF du mémoire (source 0.8673)', es: 'PDF de la tesis (fuente 0.8673)', ar: 'PDF الرسالة (مصدر 0.8673)' }, href: '/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf' },
      { label: { en: 'Early technical report (2024)', de: 'Frühzeitiger Technischer Bericht (2024)', fr: 'Rapport technique précoce (2024)', es: 'Informe técnico temprano (2024)', ar: 'تقرير تقني مبكر (2024)' }, href: '/Diffusion-Based Multi-class Defect Detection.pdf' },
      { label: { en: 'InkjetOOD repository', de: 'InkjetOOD Repository', fr: 'Dépôt InkjetOOD', es: 'Repositorio InkjetOOD', ar: 'مستودع InkjetOOD' }, href: 'https://github.com/ahmed-3m/InkjetOOD', external: true },
      { label: { en: 'Model weights', de: 'Modellgewichte', fr: 'Poids du modèle', es: 'Pesos del modelo', ar: 'أوزان النموذج' }, href: 'https://huggingface.co/ahmed-3m/InkjetOOD', external: true },
    ],
  },
  {
    slug: 'faultrix',
    title: {
      en: 'Faultrix: AI-Powered Construction Quality Control & Automated Report Generation',
      de: 'Faultrix: KI-gestützte Bauqualitätskontrolle & automatisierte Berichterstellung',
      fr: 'Faultrix : Contrôle qualité construction par IA & génération automatisée de rapports',
      es: 'Faultrix: Control de calidad en construcción con IA y generación automatizada de informes',
      ar: 'Faultrix: مراقبة جودة البناء بالذكاء الاصطناعي وتوليد التقارير المؤتمتة',
    },
    summary: {
      en: 'An AI-powered construction quality-control SaaS built solo from zero to production.',
      de: 'Ein KI-gestütztes SaaS für Bauqualitätskontrolle, solo von null bis Produktion gebaut.',
      fr: 'Un SaaS de contrôle qualité construction par IA construit en solo de zéro à la production.',
      es: 'Un SaaS de control de calidad en construcción con IA construido en solitario de cero a producción.',
      ar: 'منصة SaaS لمراقبة جودة البناء بالذكاء الاصطناعي بُنيت بشكل فردي من الصفر إلى الإنتاج.',
    },
    problem: {
      en: 'Site inspectors in Austria and Germany spend up to 4 hours daily compiling construction defect reports under ÖNORM B 2110 standards, facing slow turnaround, missing evidence trails, and disputed liability.',
      de: 'Bauleiter in Österreich und Deutschland verbringen bis zu 4 Stunden täglich mit der Erstellung von Mängelberichten nach ÖNORM B 2110 — mit langsamen Durchlaufzeiten und strittigen Beweisketten.',
      fr: 'Les inspecteurs de chantier en Autriche et en Allemagne passent jusqu à 4 heures par jour à rédiger des rapports selon la norme ÖNORM B 2110, avec des délais lents et des chaînes de preuve fragiles.',
      es: 'Los inspectores de obra en Austria y Alemania pasan hasta 4 horas al día elaborando informes según la norma ÖNORM B 2110, con procesos lentos y cadenas de evidencia discutidas.',
      ar: 'يقضي مفتشو المواقع في النمسا وألمانيا ما يصل إلى 4 ساعات يومياً في إعداد تقارير عيوب البناء وفق معايير ÖNORM B 2110، مع بطء في الإنجاز وسلاسل أدلة معرضة للنزاع.',
    },
    role: {
      en: 'Sole engineer and product builder: complete architecture, Next.js frontend, Convex backend, vision pipeline, Stripe billing, and DSGVO / ÖNORM compliance.',
      de: 'Alleiniger Entwickler & Produktbauer: Gesamte Architektur, Next.js-Frontend, Convex-Backend, Vision-Pipeline, Stripe-Billing und DSGVO / ÖNORM Compliance.',
      fr: 'Développeur et créateur unique : architecture globale, frontend Next.js, backend Convex, pipeline de vision, facturation Stripe et conformité DSGVO / ÖNORM.',
      es: 'Desarrollador y creador único: arquitectura completa, frontend en Next.js, backend en Convex, pipeline de visión, pagos con Stripe y cumplimiento DSGVO / ÖNORM.',
      ar: 'المطور المنفرد للمنتج: المعمارية الكاملة، واجهة Next.js، خادم Convex، خط معالجة الرؤية الحاسوبية، مدفوعات Stripe، والامتثال لمعايير DSGVO وÖNORM.',
    },
    stack: ['Next.js', 'Convex', 'OpenAI', 'Clerk', 'Cloudflare R2', 'Stripe', 'Docker', 'Python'],
    pipelineStages: [
      {
        title: { en: '1. Photo Capture & Upload', de: '1. Fotoerfassung & Upload', fr: '1. Capture photo & téléversement', es: '1. Captura de fotos y subida', ar: '1. التقاط الصور والرفع' },
        desc: { en: 'Inspectors upload site photos with EXIF timestamps, GPS metadata, and inspection notes.', de: 'Inspektoren laden Baustellenfotos mit EXIF-Zeitstempeln, GPS-Metadaten und Inspektionsnotizen hoch.', fr: 'Les inspecteurs téléversent les photos de chantier avec horodatages EXIF, métadonnées GPS et notes.', es: 'Los inspectores suben fotos de obra con marcas de tiempo EXIF, metadatos GPS y notas de inspección.', ar: 'يقوم المفتشون برفع صور الموقع مع الطوابع الزمنية وبيانات GPS وملاحظات الفحص.' },
      },
      {
        title: { en: '2. Multi-Modal Defect Analysis', de: '2. Multimodale Defektanalyse', fr: '2. Analyse multimodale des défauts', es: '2. Análisis multimodal de defectos', ar: '2. تحليل العيوب متعدد الوسائط' },
        desc: { en: 'OpenAI vision models analyze visual anomalies against construction defect taxonomies and ÖNORM standards.', de: 'OpenAI-Vision-Modelle analysieren visuelle Anomalien anhand von Baufehler-Taxonomien und ÖNORM-Standards.', fr: 'Les modèles de vision OpenAI analysent les anomalies visuelles selon les taxonomies de défauts et les normes ÖNORM.', es: 'Los modelos de visión de OpenAI analizan anomalías visuales según taxonomías de defectos de construcción y normas ÖNORM.', ar: 'تحلل نماذج الرؤية من OpenAI العيوب البصرية وفق تصنيفات عيوب البناء ومعايير ÖNORM.' },
      },
      {
        title: { en: '3. Evidence Chain & Report Assembly', de: '3. Beweiskette & Berichterstellung', fr: '3. Chaîne de preuve & assemblage du rapport', es: '3. Cadena de evidencia y ensamblaje de informes', ar: '3. سلسلة الأدلة وإنشاء التقرير' },
        desc: { en: 'Generates ÖNORM B 2110-compliant audit reports in under 1 minute with SHA-256 evidence verification.', de: 'Erstellt ÖNORM B 2110-konforme Auditberichte in unter 1 Minute mit SHA-256 Beweisverifizierung.', fr: "Génère des rapports d'audit conformes à l'ÖNORM B 2110 en moins d'une minute avec vérification SHA-256.", es: 'Genera informes de auditoría compatibles con ÖNORM B 2110 en menos de 1 minuto con verificación SHA-256.', ar: 'إنشاء تقارير تدقيق متوافقة مع ÖNORM B 2110 في أقل من دقيقة مع التحقق من الأدلة عبر SHA-256.' },
      },
    ],
    approach: [
      {
        en: 'Design a tight upload-to-report workflow around real construction site documentation workflows.',
        de: 'Einen schlanken Upload-zu-Bericht-Workflow für reale Baustellendokumentationen entwickeln.',
        fr: 'Concevoir un flux rapide du téléversement au rapport adapté aux chantiers réels.',
        es: 'Diseñar un flujo ágil de subida a informe adaptado a casos de obra reales.',
        ar: 'تصميم سير عمل سريع من رفع الصور إلى التقرير يلائم بيئة العمل الميداني في مواقع البناء.',
      },
      {
        en: 'Use OpenAI vision models with strict schema enforcement, structured output extraction, and cryptographic evidence hashes.',
        de: 'OpenAI-Vision-Modelle mit strikter Schemavalidierung, strukturierter Ausgabe und kryptografischen Beweis-Hashes einsetzen.',
        fr: 'Utiliser les modèles de vision OpenAI avec validation stricte de schéma et hachage cryptographique des preuves.',
        es: 'Usar modelos de visión de OpenAI con esquemas estrictos y hashes criptográficos de evidencia.',
        ar: 'استخدام نماذج الرؤية من OpenAI مع فرض صارم للمخطط، واستخراج مخرجات منظمة، وتشفير أدلة الإثبات.',
      },
      {
        en: 'Architect a serverless, compliant stack: Next.js, Convex, Clerk, Cloudflare R2, Stripe, Docker, and Python services.',
        de: 'Einen serverlosen, DSGVO-konformen Stack aufbauen: Next.js, Convex, Clerk, Cloudflare R2, Stripe, Docker und Python-Services.',
        fr: 'Bâtir une stack serverless et conforme : Next.js, Convex, Clerk, Cloudflare R2, Stripe, Docker et services Python.',
        es: 'Crear un stack serverless y conforme: Next.js, Convex, Clerk, Cloudflare R2, Stripe, Docker y servicios Python.',
        ar: 'بناء منظومة سحابية بدون خوادم ومتوافقة قانونياً: Next.js وConvex وClerk وCloudflare R2 وStripe وDocker وخدمات بايثون.',
      },
    ],
    results: [
      {
        en: 'Generated ÖNORM B 2110-compliant audit reports in under 1 minute from photo uploads.',
        de: 'Erstellte ÖNORM B 2110-konforme Auditberichte in unter 1 Minute aus hochgeladenen Fotos.',
        fr: "Rapports d'audit conformes ÖNORM B 2110 générés en moins d'une minute à partir des photos.",
        es: 'Generación de informes conformes con ÖNORM B 2110 en menos de 1 minuto tras subir fotos.',
        ar: 'توليد تقارير تدقيق متوافقة مع ÖNORM B 2110 في أقل من دقيقة من رفع الصور.',
      },
      {
        en: 'Achieved 98.4% industrial defect detection accuracy (threshold-dependent internal operational metric).',
        de: 'Erreichte 98.4% Genauigkeit bei industrieller Fehlererkennung (schwellenwertabhängige interne Betriebsmetrik).',
        fr: '98.4% de précision en détection de défauts industriels (métrique opérationnelle interne dépendante du seuil).',
        es: '98.4% de precisión en detección de defectos industriales (métrica operativa interna según umbral).',
        ar: 'تحقيق دقة 98.4% في كشف العيوب الصناعية (مقياس تشغيلي داخلي يعتمد على حد العتبة).',
      },
      {
        en: 'Took an AI SaaS solo from concept to paying customer production with SHA-256 tamper-evident integrity.',
        de: 'Ein KI-SaaS solo vom Konzept bis zur zahlenden Kundenproduktion mit manipulationssicherer SHA-256-Integrität geführt.',
        fr: "SaaS IA mené seul du concept à la production client avec intégrité SHA-256 infalsifiable.",
        es: 'Llevó un SaaS de IA en solitario del concepto a producción con integridad SHA-256.',
        ar: 'نقل منصة SaaS بالذكاء الاصطناعي بمفردي من الفكرة إلى الإنتاج لعملاء فعليين مع سلسلة سلامة أدلة غير قابلة للتلاعب عبر SHA-256.',
      },
    ],
    lessons: [
      {
        en: 'User experience and workflow speed matter more to field inspectors than model size.',
        de: 'Nutzererlebnis und Workflow-Geschwindigkeit zählen für Bauinspektoren mehr als Modellgröße.',
        fr: "L'expérience utilisateur et la vitesse comptent plus pour les inspecteurs que la taille du modèle.",
        es: 'La experiencia de usuario y la velocidad importan más a los inspectores que el tamaño del modelo.',
        ar: 'تجربة المستخدم وسرعة سير العمل تهم مفتشي الموقع أكثر من حجم النموذج.',
      },
      {
        en: 'Regulatory compliance (ÖNORM, DSGVO) and cryptographic evidence chains shape institutional trust.',
        de: 'Rechtskonformität (ÖNORM, DSGVO) und kryptografische Beweisketten schaffen institutionelles Vertrauen.',
        fr: 'La conformité réglementaire (ÖNORM, DSGVO) et les chaînes de preuve fondent la confiance.',
        es: 'El cumplimiento normativo (ÖNORM, DSGVO) y las cadenas de evidencia generan confianza.',
        ar: 'الامتثال التنظيمي (ÖNORM وDSGVO) وسلاسل الأدلة المشفرة تبني الثقة المؤسسية.',
      },
      {
        en: 'Shipping reliable AI requires rigorous fallback pathways for API rate limits and hallucinated outputs.',
        de: 'Zuverlässige KI in Produktion erfordert robuste Fallbacks für Rate-Limits und Halluzinationen.',
        fr: "Livrer une IA fiable nécessite des solutions de secours pour les limites d'API et les hallucinations.",
        es: 'Publicar IA fiable exige alternativas ante límites de API y alucinaciones de salida.',
        ar: 'إطلاق ذكاء اصطناعي موثوق يتطلب مسارات بديلة صارمة لمواجهة حدود الطلبات والهلوسة.',
      },
    ],
    artifacts: [
      { label: { en: 'Product site', de: 'Produkt-Website', fr: 'Site du produit', es: 'Sitio del producto', ar: 'موقع المنتج' }, href: 'https://faultrix.com', external: true },
      { label: { en: 'Blog post: 5-month journey', de: 'Blogbeitrag: 5-Monate-Erfahrung', fr: 'Article de blog : retour 5 mois', es: 'Artículo de blog: aventura de 5 meses', ar: 'مقال المدونة: تجربة 5 أشهر' }, href: '/blog/5-month-llm-adventure/' },
    ],
  },
  {
    slug: 'sihem',
    title: {
      en: 'Sihem: Satellite-Driven Crop Health & Yield Intelligence',
      de: 'Sihem: Satellitengestützte Pflanzengesundheit & Ertragsprognose',
      fr: 'Sihem : Intelligence agricole & santé des cultures par satellite',
      es: 'Sihem: Inteligencia de cultivos y rendimiento guiada por satélite',
      ar: 'Sihem: استخبارات صحة المحاصيل والإنتاجية عبر الأقمار الصناعية',
    },
    summary: {
      en: 'Sentinel-1 SAR and Sentinel-2 multispectral fusion paired with an agronomic LLM copilot, accepted into the tech2b startup incubator Linz.',
      de: 'Sentinel-1 SAR und Sentinel-2 Multispektralfusion kombiniert mit einem agronomischen LLM-Copiloten, aufgenommen in den tech2b-Inkubator Linz.',
      fr: 'Fusion de Sentinel-1 SAR et Sentinel-2 multispectral avec un copilote agronomique LLM, incubé chez tech2b à Linz.',
      es: 'Fusión de Sentinel-1 SAR y Sentinel-2 multiespectral con un copiloto agronómico LLM, aceptado en la incubadora tech2b de Linz.',
      ar: 'دمج بيانات Sentinel-1 SAR وSentinel-2 متعددة الأطياف مع مساعد زراعي مدعوم بنماذج اللغة، ومقبول في حاضنة الأعمال tech2b في لينز.',
    },
    problem: {
      en: 'Optical satellite monitoring in Central Europe suffers from frequent cloud cover and delayed agronomic scouting, leaving field-parcel crop stress undetected during critical growth stages.',
      de: 'Optische Satellitenüberwachung in Mitteleuropa leidet unter häufiger Bewölkung und verzögerter Bonitur, sodass Stress in Feldparzellen in kritischen Wachstumsphasen unentdeckt bleibt.',
      fr: 'La surveillance optique par satellite en Europe centrale souffre d une couverture nuageuse fréquente et d expertises tardives, laissant le stress des cultures indétecté lors des phases critiques.',
      es: 'La monitorización satelital óptica en Europa Central sufre por nubosidad frecuente e inspecciones agronómicas tardías, dejando el estrés de los cultivos sin detectar.',
      ar: 'تعاني المراقبة الساتلية البصرية في أوروبا الوسطى من الغطاء السحابي المتكرر وتأخر المعاينة الميدانية، مما يجعل إجهاد المحاصيل في الحقول الزراعية غير مكتشف في مراحل النمو الحرجة.',
    },
    role: {
      en: 'Co-Founder & AI Lead: satellite data pipeline, radar-optical fusion, LLM copilot architecture, and product engineering.',
      de: 'Co-Founder & AI Lead: Satellitendaten-Pipeline, Radar-Optik-Fusion, LLM-Copilot-Architektur und Produktentwicklung.',
      fr: 'Co-fondateur & AI Lead : pipeline satellite, fusion radar-optique, architecture copilote LLM et ingénierie produit.',
      es: 'Cofundador y líder de IA: pipeline de satélites, fusión radar-óptica, arquitectura de copiloto LLM e ingeniería de producto.',
      ar: 'شريك مؤسس وقائد الذكاء الاصطناعي: خط معالجة البيانات الساتلية، دمج الرادار والبصري، معمارية المساعد الذكي، وهندسة المنتج.',
    },
    stack: ['Sentinel-1 SAR', 'Sentinel-2 MSI', 'PyTorch', 'Supabase Edge Functions', 'Deno/TS', 'pgvector RAG', 'MeloTTS', 'PWA'],
    pipelineStages: [
      {
        title: { en: '1. Multi-Temporal Ingestion', de: '1. Multitemporale Aufnahme', fr: '1. Ingestion multitemporelle', es: '1. Ingesta multitemporal', ar: '1. استقبال البيانات متعددة الأوقات' },
        desc: { en: 'Automated retrieval of Copernicus Sentinel-1 (C-band SAR) and Sentinel-2 (13-band optical) passes.', de: 'Automatische Abfrage von Copernicus Sentinel-1 (C-Band SAR) und Sentinel-2 (13-Kanal optisch).', fr: 'Récupération automatisée des passages Copernicus Sentinel-1 (SAR bande C) et Sentinel-2 (optique 13 bandes).', es: 'Recuperación automatizada de pasos de Copernicus Sentinel-1 (SAR banda C) y Sentinel-2 (óptico de 13 bandas).', ar: 'استرجاع مؤتمت لبيانات كوبرنيكوس Sentinel-1 (رادار C-band) وSentinel-2 (بصري 13 نطاقاً).' },
      },
      {
        title: { en: '2. Radar-Optical Fusion', de: '2. Radar-Optik-Fusion', fr: '2. Fusion radar-optique', es: '2. Fusión radar-óptico', ar: '2. دمج الرادار والبصري' },
        desc: { en: 'Fusing cloud-penetrating radar backscatter with vegetation indices (NDVI/NDRE) for sub-parcel stress detection.', de: 'Fusion von wolken-durchdringendem Radar-Backscatter mit Vegetationsindizes (NDVI/NDRE) zur Stresserkennung.', fr: 'Fusion de la rétrodiffusion radar tous temps avec les indices de végétation (NDVI/NDRE) pour détecter le stress à l échelle de la parcelle.', es: 'Fusión de retrodispersión de radar con penetración de nubes e índices de vegetación (NDVI/NDRE) para detectar estrés por parcela.', ar: 'دمج ارتداد الرادار المخترق للسحب مع مؤشرات الغطاء النباتي (NDVI/NDRE) لكشف إجهاد المحاصيل على مستوى القطعة الزراعية.' },
      },
      {
        title: { en: '3. LLM Agronomic Copilot', de: '3. LLM-Agronomie-Copilot', fr: '3. Copilote agronomique LLM', es: '3. Copiloto agronómico LLM', ar: '3. مساعد زراعي بنماذج اللغة' },
        desc: { en: 'Delivers actionable agronomic insights and parcel advisories via bilingual mobile-first PWA (sihem.at).', de: 'Liefert umsetzbare agronomische Empfehlungen über eine zweisprachige mobile PWA (sihem.at).', fr: 'Fournit des recommandations agronomiques exploitables via une PWA mobile bilingue (sihem.at).', es: 'Ofrece recomendaciones agronómicas procesables a través de una PWA móvil bilingüe (sihem.at).', ar: 'تقديم استشارات زراعية عملية وتنبيهات عبر تطبيق PWA ثنائي اللغة (sihem.at).' },
      },
    ],
    approach: [
      {
        en: 'Sentinel-1 SAR + Sentinel-2 multispectral time-series fusion, parcel-level vegetation/moisture anomaly indexing, and an LLM agronomic copilot delivered as a bilingual mobile-first PWA (sihem.at, incubated at tech2b Linz).',
        de: 'Sentinel-1 SAR + Sentinel-2 Multispektral-Zeitreihenfusion, parzellengenaue Vegetations-/Feuchtigkeitsanomalie-Indizes und ein agronomischer LLM-Copilot als zweisprachige Mobile-First-PWA (sihem.at, im tech2b-Inkubator Linz).',
        fr: 'Fusion de séries temporelles Sentinel-1 SAR + Sentinel-2 multispectral, indexation des anomalies de végétation et d humidité au niveau parcellaire, et copilote agronomique LLM livré via une PWA mobile-first bilingue (sihem.at, incubé à tech2b Linz).',
        es: 'Fusión de series temporales Sentinel-1 SAR + Sentinel-2 multiespectral, indexación de anomalías de vegetación y humedad a nivel de parcela, y copiloto agronómico LLM entregado como PWA bilingüe (sihem.at, incubado en tech2b Linz).',
        ar: 'دمج السلاسل الزمنية لـ Sentinel-1 SAR وSentinel-2 متعدد الأطياف، وفهرسة شذوذ الغطاء النباتي والرطوبة على مستوى الحقل، ومساعد زراعي مدعوم بنماذج اللغة عبر تطبيق PWA ثنائي اللغة (sihem.at، ومحتضن في tech2b في لينز).',
      },
      {
        en: 'Combines all-weather C-band synthetic aperture radar backscatter (VH/VV polarizations) with 13-band optical surface reflectance to monitor crop canopies continuously through cloud cover.',
        de: 'Kombiniert wetterunabhängigen C-Band-SAR-Backscatter (VH/VV-Polarisation) mit 13-Kanal optischer Oberflächenreflexion für lückenlose Bestandsüberwachung auch bei dichter Bewölkung.',
        fr: 'Combine la rétrodiffusion radar à synthèse d ouverture en bande C tous temps (polarisations VH/VV) avec la réflectance optique de surface à 13 bandes pour surveiller les cultures même sous couverture nuageuse.',
        es: 'Combina retrodispersión de radar de apertura sintética en banda C todo clima (polarizaciones VH/VV) con reflectancia óptica de 13 bandas para monitorear cultivos bajo nubes.',
        ar: 'يجمع بين ارتداد الرادار ذي الفتحة الاصطناعية C-band لجميع الأحوال الجوية (استقطابات VH/VV) وانعكاس السطح البصري بـ 13 نطاقاً لمراقبة المحاصيل باستمرار عبر الغيوم.',
      },
      {
        en: 'Integrates local meteorological data and soil moisture proxies into a retrieval-augmented agronomic knowledge base, generating targeted irrigation and fertilisation guidance.',
        de: 'Integriert lokale Wetterdaten und Bodenfeuchte-Proxys in eine RAG-gestützte agronomische Wissensbasis für gezielte Bewässerungs- und Düngeempfehlungen.',
        fr: 'Intègre les données météo locales et les proxys d humidité du sol dans une base de connaissances agronomique RAG pour guider l irrigation et la fertilisation.',
        es: 'Integra datos meteorológicos locales e indicadores de humedad del suelo en una base agronómica con RAG para guiar riego y fertilización.',
        ar: 'يدمج بيانات الطقس المحلية ومؤشرات رطوبة التربة في قاعدة معارف زراعية مدعومة بـ RAG لتقديم إرشادات دقيقة للري والتسميد.',
      },
    ],
    results: [
      {
        en: 'Live interactive product preview and parcel monitoring running at sihem.at.',
        de: 'Interaktive Live-Produktvorschau und Parzellenüberwachung live unter sihem.at verfügbar.',
        fr: 'Aperçu produit interactif en direct et surveillance parcellaire disponibles sur sihem.at.',
        es: 'Demostración interactiva en vivo y monitorización de parcelas activa en sihem.at.',
        ar: 'معاينة تفاعلية للمنتج ومراقبة الحقول الزراعية تعمل مباشرة عبر sihem.at.',
      },
      {
        en: 'Sub-parcel stress mapping across multi-temporal Sentinel passes, maintaining continuous vegetation tracking through prolonged cloud cover.',
        de: 'Teilflächengenaue Stresskartierung über multitemporale Sentinel-Überflüge, die lückenlose Vegetationsüberwachung auch bei anhaltender Bewölkung sichert.',
        fr: 'Cartographie du stress intra-parcellaire sur les passages Sentinel, maintenant un suivi continu de la végétation même lors de longues périodes nuageuses.',
        es: 'Mapeo de estrés a nivel subparcelario en pasos de Sentinel, manteniendo seguimiento continuo de la vegetación en semanas nubladas.',
        ar: 'رسم خرائط إجهاد دقيقة داخل القطع الزراعية عبر ممرات الأقمار الصناعية المتتابعة، مما يضمن متابعة مستمرة للغطاء النباتي حتى في فترات الغيوم الممتدة.',
      },
      {
        en: 'Accepted into the tech2b Upper Austrian startup incubator (May 2026 – Present), partnering with regional growers and agronomy advisors.',
        de: 'Aufgenommen in den oberösterreichischen Startup-Inkubator tech2b (Mai 2026 – heute) zur Zusammenarbeit mit Landwirten und Agrarberatern.',
        fr: 'Accepté dans l incubateur de startups tech2b en Haute-Autriche (mai 2026 – présent), en partenariat avec des producteurs régionaux et conseillers.',
        es: 'Aceptado en la incubadora tech2b de Alta Austria (mayo 2026 – presente), colaborando con productores y asesores agrícolas.',
        ar: 'تم القبول في حاضنة الأعمال tech2b في النمسا العليا (مايو 2026 – حتى الآن)، للتعاون مع مزارعين ومستشارين زراعيين إقليميين.',
      },
    ],
    lessons: [
      {
        en: 'Why radar-optical alignment and strict spatial-temporal validation splits matter more than single-frame spectral indices.',
        de: 'Warum Radar-Optik-Ausrichtung und strikte räumlich-zeitliche Validierungs-Splits entscheidender sind als Einzelbild-Spektralindizes.',
        fr: 'Pourquoi l alignement radar-optique et des splits spatio-temporels stricts comptent plus que les indices spectraux sur une seule image.',
        es: 'Por qué el alineamiento radar-óptico y las divisiones espacio-temporales estrictas importan más que los índices espectrales de una sola imagen.',
        ar: 'لماذا تعد محاذاة الرادار مع البصري والتقسيم الصارم للمصادقة المكانية والزمانية أهم بكثير من مؤشرات الطيف لإطار زمني وحيد.',
      },
      {
        en: 'Agronomic trust requires explaining underlying SAR polarizations and NDVI trends rather than serving opaque recommendations.',
        de: 'Agronomisches Vertrauen erfordert die transparente Erklärung von SAR-Polarisationen und NDVI-Trends statt undurchsichtiger Empfehlungen.',
        fr: 'La confiance agronomique exige d expliquer les polarisations SAR et les tendances NDVI plutôt que de délivrer des recommandations opaques.',
        es: 'La confianza agronómica requiere explicar las polarizaciones SAR y las tendencias de NDVI en lugar de ofrecer recomendaciones opacas.',
        ar: 'تتطلب ثقة المزارعين والمختصين توضيح استقطابات الرادار واتجاهات مؤشرات الغطاء النباتي بدلاً من تقديم توصيات مبهمة.',
      },
      {
        en: 'Mobile PWA offline resilience is essential for farmers operating in rural fields with intermittent cellular connectivity.',
        de: 'Offline-Fähigkeit der mobilen PWA ist unverzichtbar für Landwirte, die auf Feldern mit lückenhafter Mobilfunkabdeckung arbeiten.',
        fr: 'La résilience hors ligne de la PWA mobile est essentielle pour les agriculteurs travaillant dans des zones rurales à connectivité intermittente.',
        es: 'La resiliencia offline de la PWA móvil es fundamental para agricultores que operan en zonas rurales con conectividad intermitente.',
        ar: 'تعد قدرة تطبيق PWA على العمل دون اتصال أمراً أساسياً للمزارعين الذين يعملون في حقول ريفية ذات اتصال متقطع بالإنترنت.',
      },
    ],
    artifacts: [
      { label: { en: 'Live Product (sihem.at)', de: 'Live-Produkt (sihem.at)', fr: 'Produit en ligne (sihem.at)', es: 'Producto en vivo (sihem.at)', ar: 'المنتج المباشر (sihem.at)' }, href: 'https://sihem.at', external: true },
      { label: { en: 'Back to All Projects', de: 'Zurück zu allen Projekten', fr: 'Retour à tous les projets', es: 'Volver a todos los proyectos', ar: 'العودة إلى جميع المشاريع' }, href: '/#projects' },
    ],
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug)
}
