import { type TranslationMap } from '@/lib/i18n-config'

export type CaseStudy = {
  slug: 'diffusion-ood' | 'inkjet-ood' | 'sihem'
  // Update this stored date whenever this case study changes.
  lastModified: string
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
    lastModified: '2026-11-07',
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
      en: 'Standard neural classifiers exhibit dangerous overconfidence on out-of-distribution samples. Generative classifiers offer principled reconstruction error scoring, but suffer from high standard deviation across random seeds and ambiguous boundary decisions.',
      de: 'Klassische neuronale Klassifikatoren neigen zu gefährlicher Überkonfidenz bei OOD-Daten. Generative Klassifikatoren bieten prinzipielle Rekonstruktionsfehler, leiden aber unter hoher Standardabweichung über Seeds und uneindeutigen Entscheidungsgrenzen.',
      fr: "Les classificateurs neuronaux standards affichent une surconfiance dangereuse sur les échantillons hors distribution. Les classificateurs génératifs offrent une erreur de reconstruction principielle mais souffrent d'un écart-type élevé entre seeds.",
      es: 'Los clasificadores neuronales estándar muestran un exceso de confianza peligroso en muestras OOD. Los clasificadores generativos ofrecen una señal de error de reconstrucción pero sufren una alta desviación estándar entre semillas.',
      ar: 'تظهر المصنفات العصبية التقليدية ثقة مفرطة وخطيرة في العينات الخارجة عن التوزيع. تقدم المصنفات التوليدية تقييماً منهجياً عبر أخطاء إعادة البناء، لكنها تعاني من انحراف معياري مرتفع عبر البذور العشوائية وحدود قرار ملتبسة.',
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
        title: { en: '3. Statistical Anomaly Scoring', de: '3. Statistische Anomaliebewertung', fr: "3. Score statistique d'anomalie", es: '3. Puntuación estadística de anomalía', ar: '3. قياس الشذوذ الإحصائي' },
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
        en: 'A scientific finding becomes significantly more useful when standard deviation and error bars are reported honestly.',
        de: 'Eine wissenschaftliche Erkenntnis wird deutlich verlässlicher, wenn Standardabweichung und Fehlerbalken ehrlich berichtet werden.',
        fr: "Une conclusion scientifique devient bien plus utile lorsque l'écart-type et les barres d'erreur sont rapportés honnêtement.",
        es: 'Un hallazgo científico es mucho más útil cuando la desviación estándar y las barras de error se comunican con honestidad.',
        ar: 'تصبح النتيجة العلمية أكثر موثوقية وفائدة عندما يُذكر الانحراف المعياري وأشرطة الخطأ بأمانة وشفافية.',
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
    lastModified: '2026-11-07',
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
        desc: { en: 'High-resolution thermographic and optical frame capture of composite building components.', de: 'Hochauflösende thermografische und optische Einzelbilder von Verbundbauelementen erfassen.', fr: "Capture d'images thermographiques et optiques haute résolution de panneaux de construction.", es: 'Captura de imágenes termográficas y ópticas de alta resolución de paneles compuestos.', ar: 'التقاط صور حرارية وبصرية عالية الدقة لمكونات البناء المركبة.' },
      },
      {
        title: { en: '2. YOLOv8 Feature Extraction', de: '2. YOLOv8 Merkmalsextraktion', fr: '2. Extraction de caractéristiques YOLOv8', es: '2. Extracción de características con YOLOv8', ar: '2. استخراج الميزات بواسطة YOLOv8' },
        desc: { en: 'Localizing regions of interest and extracting structured defect feature representations.', de: 'Interessante Regionen lokalisieren und strukturierte Fehler-Merkmale extrahieren.', fr: "Localisation des régions d'intérêt et extraction de représentations structurées de défauts.", es: 'Localización de regiones de interés y extracción de representaciones estructuradas de defectos.', ar: 'تحديد مناطق الاهتمام واستخراج تمثيلات منظمة لميزات العيوب.' },
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
        fr: "Un résultat nul documenté avec rigueur est une contribution scientifique précieuse évitant le gaspillage de temps d'ingénierie.",
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
    slug: 'sihem',
    lastModified: '2026-11-07',
    title: {
      en: 'Sihem: Proactive AI Personal-Mentor & Routine Assistant',
      de: 'Sihem: Proaktiver KI-Mentor & Routine-Assistent',
      fr: 'Sihem : Assistant mentor personnel & routines proactif par IA',
      es: 'Sihem: Asistente mentor personal y de rutinas proactivo con IA',
      ar: 'Sihem: مساعد موجه شخصي وروتين يومي استباقي بالذكاء الاصطناعي',
    },
    summary: {
      en: 'Proactive personal-mentor assistant on Telegram (@sihem_ai_bot) and installable PWA (sihem-pwa.pages.dev), accepted into the tech2b incubator in Linz.',
      de: 'Proaktiver persönlicher Mentor-Assistent auf Telegram (@sihem_ai_bot) und installierbare PWA (sihem-pwa.pages.dev), aufgenommen in den tech2b-Inkubator in Linz.',
      fr: 'Assistant mentor personnel proactif sur Telegram (@sihem_ai_bot) et PWA installable (sihem-pwa.pages.dev), incubé chez tech2b à Linz.',
      es: 'Asistente mentor personal proactivo en Telegram (@sihem_ai_bot) y PWA instalable (sihem-pwa.pages.dev), aceptado en la incubadora tech2b de Linz.',
      ar: 'مساعد موجه شخصي استباقي على تيليجرام (@sihem_ai_bot) وتطبيق ويب قابل للتثبيت (sihem-pwa.pages.dev)، ومقبول في حاضنة tech2b في لينز.',
    },
    problem: {
      en: "Most habit trackers and todo apps are passive — they wait for manual input and break down as soon as a user's schedule shifts, while raw LLM chats lack persistent structured state, proactive scheduling, and cost-controlled multi-provider reliability.",
      de: 'Die meisten Gewohnheits- und Todo-Apps sind rein passiv: Sie warten auf manuelle Eingaben und versagen bei Terminverschiebungen, während reine LLM-Chats keinen persistenten Zustand, keine proaktive Planung und kein kostenoptimiertes Multi-Provider-Routing bieten.',
      fr: "La plupart des gestionnaires d'habitudes sont passifs : ils attendent une saisie manuelle et échouent dès que l'emploi du temps change, tandis que les chats LLM bruts manquent d'état persistant, de planification proactive et de fiabilité multi-fournisseurs.",
      es: 'La mayoría de rastreadores de hábitos son pasivos: esperan entradas manuales y fallan ante imprevistos, mientras que los chats LLM carecen de estado estructurado persistente, programación proactiva y fiabilidad multiproveedor con control de costes.',
      ar: 'معظم تطبيقات تتبع العادات وقوائم المهام سلبية وتنتظر إدخالاً يدوياً وتنهار عند أي تغيير في جدول المستخدم، بينما تفتقر محادثات LLM المباشرة إلى حالة منظمة مستمرة، وجدولة استباقية، وموثوقية متعددة المزودين بتكلفة مضبوطة.',
    },
    role: {
      en: 'Solo Developer & Project Lead: full cloud architecture, deterministic nudging engine, pgvector RAG memory, multi-provider LLM routing, Telegram bot, and installable PWA.',
      de: 'Solo-Entwickler & Projektleiter: komplette Cloud-Architektur, deterministische Nudging-Engine, pgvector-RAG-Gedächtnis, Multi-Provider-LLM-Routing, Telegram-Bot und installierbare PWA.',
      fr: 'Développeur solo & chef de projet : architecture cloud complète, moteur de nudging déterministe, mémoire RAG pgvector, routage LLM multi-fournisseurs, bot Telegram et PWA installable.',
      es: 'Desarrollador en solitario y líder de proyecto: arquitectura en la nube completa, motor de nudging determinista, memoria RAG pgvector, enrutamiento LLM multiproveedor, bot de Telegram y PWA instalable.',
      ar: 'مطور منفرد وقائد مشروع: البنية السحابية الكاملة، محرك تنبيه حتمي، ذاكرة RAG بـ pgvector، توجيه LLM متعدد المزودين، بوت تيليجرام، وتطبيق ويب قابل للتثبيت.',
    },
    stack: [
      'Deno / TypeScript',
      'Supabase Edge Functions',
      'PostgreSQL + RLS',
      'pgvector RAG',
      'LLM Routing (GLM/Gemini/Groq)',
      'pg_cron',
      'Cloudflare MeloTTS',
      'Telegram Bot + PWA',
    ],
    pipelineStages: [
      {
        title: {
          en: '1. Activity & Schedule Ingestion',
          de: '1. Aktivitäts- & Planungsaufnahme',
          fr: '1. Ingestion d’activités et planning',
          es: '1. Ingesta de actividades y horarios',
          ar: '1. استقبال الأنشطة والجداول',
        },
        desc: {
          en: 'Workouts, medication, study sessions, custom habits, Google Calendar sync, and multimodal meal-photo vision without schema changes.',
          de: 'Workouts, Medikation, Lerneinheiten, individuelle Gewohnheiten, Google-Kalender-Sync und multimodale Mahlzeitenfoto-Erkennung ohne Schema-Änderungen.',
          fr: 'Entraînements, médication, sessions d’étude, habitudes personnalisées, synchro Google Calendar et analyse photo de repas sans altération de schéma.',
          es: 'Entrenamientos, medicación, sesiones de estudio, hábitos personalizados, sincronización con Google Calendar y visión multimodal de comidas sin cambios de esquema.',
          ar: 'التمارين، الأدوية، جلسات الدراسة، العادات المخصصة، مزامنة Google Calendar، ورؤية الصور للوجبات بدون تعديل المخطط.',
        },
      },
      {
        title: {
          en: '2. Generators → Arbiter → Composer',
          de: '2. Generatoren → Arbiter → Komponist',
          fr: '2. Générateurs → Arbitre → Compositeur',
          es: '2. Generadores → Árbitro → Compositor',
          ar: '2. المولدات ← المحكم ← المؤلف',
        },
        desc: {
          en: 'Deterministic decision pipeline paired with pgvector long-term RAG memory to trigger adaptive, context-aware, non-spammy check-ins.',
          de: 'Deterministische Entscheidungspipeline gekoppelt mit pgvector-Langzeit-RAG-Gedächtnis für adaptive, kontextsensitive und nicht störende Check-Ins.',
          fr: 'Pipeline décisionnel déterministe couplé à la mémoire RAG pgvector long terme pour des check-ins adaptatifs, contextuels et non intrusifs.',
          es: 'Pipeline de decisión determinista combinado con memoria RAG pgvector para activar check-ins adaptativos, contextuales y no intrusivos.',
          ar: 'خط قرار حتمي مقترن بذاكرة RAG طويلة المدى بـ pgvector لإطلاق تنبيهات ذكية وتكيفية تراعي السياق دون إزعاج.',
        },
      },
      {
        title: {
          en: '3. Multi-Provider LLM & Voice Delivery',
          de: '3. Multi-Provider LLM & Sprachausgabe',
          fr: '3. Routage LLM multi-fournisseurs & voix',
          es: '3. LLM multiproveedor y entrega por voz',
          ar: '3. توجيه LLM متعدد المزودين والتوصيل الصوتي',
        },
        desc: {
          en: 'GLM, Gemini, and Groq routing with automated failover, Cloudflare MeloTTS voice notes, and delivery via Telegram, PWA, or Alexa Echo.',
          de: 'GLM-, Gemini- und Groq-Routing mit automatischem Failover, Cloudflare MeloTTS-Sprachnotizen und Auslieferung per Telegram, PWA oder Alexa Echo.',
          fr: 'Routage GLM, Gemini et Groq avec basculement automatique, mémos vocaux Cloudflare MeloTTS et diffusion via Telegram, PWA ou Alexa Echo.',
          es: 'Enrutamiento GLM, Gemini y Groq con failover automático, audios Cloudflare MeloTTS y entrega mediante Telegram, PWA o Alexa Echo.',
          ar: 'توجيه عبر GLM وGemini وGroq مع تبديل تلقائي، وملاحظات صوتية بـ Cloudflare MeloTTS، وتوصيل عبر تيليجرام أو PWA أو Alexa Echo.',
        },
      },
    ],
    approach: [
      {
        en: 'Engineered a serverless architecture on Supabase Edge Functions (Deno/TypeScript) and PostgreSQL with strict Row-Level Security, scheduled via pg_cron.',
        de: 'Serverless-Architektur auf Supabase Edge Functions (Deno/TypeScript) und PostgreSQL mit strikter Row-Level Security aufgebaut, automatisiert über pg_cron.',
        fr: 'Architecture serverless sur Supabase Edge Functions (Deno/TypeScript) et PostgreSQL avec Row-Level Security stricte, orchestrée par pg_cron.',
        es: 'Arquitectura serverless en Supabase Edge Functions (Deno/TypeScript) y PostgreSQL con Row-Level Security estricta, programada con pg_cron.',
        ar: 'هندسة معمارية serverless على Supabase Edge Functions (Deno/TypeScript) وPostgreSQL مع أمان صارم على مستوى الصفوف (RLS) ومجدولة بـ pg_cron.',
      },
      {
        en: 'Implemented a deterministic generators→arbiter→composer decision engine that evaluates calendar shifts and user habits before synthesizing check-ins.',
        de: 'Deterministische Generatoren→Arbiter→Komponist-Entscheidungsmaschine implementiert, die Kalenderänderungen und Gewohnheiten prüft, bevor Check-Ins generiert werden.',
        fr: 'Moteur de décision déterministe générateurs→arbitre→compositeur évaluant les décalages de planning et les habitudes avant de composer les rappels.',
        es: 'Motor de decisión determinista generadores→árbitro→compositor que evalúa variaciones de calendario y hábitos antes de componer los check-ins.',
        ar: 'تطبيق محرك قرار حتمي (مولدات←محكم←مؤلف) يقيّم تغيرات الجدول وعادات المستخدم قبل توليد رسائل المتابعة.',
      },
      {
        en: 'Combined pgvector semantic embeddings for long-term user recall with multi-provider LLM routing (GLM/Gemini/Groq) and Cloudflare MeloTTS voice generation.',
        de: 'Semantische pgvector-Embeddings für langfristigen Kontext mit Multi-Provider-LLM-Routing (GLM/Gemini/Groq) und Cloudflare MeloTTS-Sprachsynthese kombiniert.',
        fr: 'Combinaison d’embeddings sémantiques pgvector pour la mémoire à long terme avec un routage LLM multi-fournisseurs (GLM/Gemini/Groq) et synthèse vocale Cloudflare MeloTTS.',
        es: 'Integración de embeddings semánticos en pgvector para memoria a largo plazo con enrutamiento LLM multiproveedor (GLM/Gemini/Groq) y voz con Cloudflare MeloTTS.',
        ar: 'الجمع بين تضمينات pgvector الدلالية للاستدعاء طويل المدى وتوجيه LLM متعدد المزودين (GLM/Gemini/Groq) وتوليد الصوت عبر Cloudflare MeloTTS.',
      },
    ],
    results: [
      {
        en: 'Live proactive beta running on Telegram (@sihem_ai_bot) and installable PWA (sihem-pwa.pages.dev) with automated morning briefings and evening reviews.',
        de: 'Aktive proaktive Beta auf Telegram (@sihem_ai_bot) und als installierbare PWA (sihem-pwa.pages.dev) mit automatischen Morgenbriefings und Abendreviews.',
        fr: 'Bêta proactive en direct sur Telegram (@sihem_ai_bot) et PWA installable (sihem-pwa.pages.dev) avec briefings matinaux et bilans du soir automatisés.',
        es: 'Beta proactiva en vivo en Telegram (@sihem_ai_bot) y PWA instalable (sihem-pwa.pages.dev) con resúmenes matutinos y revisiones nocturnas automatizadas.',
        ar: 'نسخة تجريبية استباقية تعمل على تيليجرام (@sihem_ai_bot) وتطبيق ويب قابل للتثبيت (sihem-pwa.pages.dev) مع موجزات صباحية ومراجعات مسائية مؤتمتة.',
      },
      {
        en: 'Multi-provider routing with automatic failover across GLM, Gemini, and Groq, coupled with granular token cost tracking per user interaction.',
        de: 'Multi-Provider-Routing mit automatischem Failover über GLM, Gemini und Groq samt granularer Erfassung der Token-Kosten pro Nutzerinteraktion.',
        fr: 'Routage multi-fournisseurs avec basculement automatique entre GLM, Gemini et Groq, associé à un suivi granulaire des coûts de tokens par interaction.',
        es: 'Enrutamiento multiproveedor con failover automático entre GLM, Gemini y Groq, junto con seguimiento granular de costes de tokens por interacción.',
        ar: 'توجيه متعدد المزودين مع تبديل تلقائي بين GLM وGemini وGroq، مقترن بتتبع تفصيلي لتكاليف التوكن لكل تفاعل مستخدم.',
      },
      {
        en: 'Accepted into the tech2b Upper Austrian incubator (May 2026 – Present) for product validation and user cohort testing in Linz.',
        de: 'Aufgenommen in den oberösterreichischen tech2b-Inkubator (Mai 2026 – heute) zur Produktvalidierung und für Nutzertests in Linz.',
        fr: 'Accepté au sein de l’incubateur tech2b en Haute-Autriche (mai 2026 – présent) pour la validation produit et les tests utilisateurs à Linz.',
        es: 'Aceptado en la incubadora tech2b de Alta Austria (mayo 2026 – presente) para validación de producto y pruebas de usuarios en Linz.',
        ar: 'القبول في حاضنة الأعمال tech2b في النمسا العليا (مايو 2026 – حتى الآن) لمصادقة المنتج واختبار مجموعات المستخدمين في لينز.',
      },
    ],
    lessons: [
      {
        en: 'Deterministic generators and arbiters prevent LLM hallucination and notification fatigue far better than open-ended prompt loops.',
        de: 'Deterministische Generatoren und Arbiter verhindern Halluzinationen und Benachrichtigungsmüdigkeit weitaus effektiver als offene Prompt-Schleifen.',
        fr: 'Des générateurs et arbitres déterministes évitent les hallucinations et la fatigue des notifications bien plus sûrement que des boucles de prompts ouvertes.',
        es: 'Los generadores y árbitros deterministas evitan alucinaciones y fatiga de notificaciones mucho mejor que bucles de prompts abiertos.',
        ar: 'المولدات والمحكمات الحتمية تمنع هلوسة النماذج وإرهاق الإشعارات بكفاءة أعلى بكثير من حلقات التوجيه المفتوحة.',
      },
      {
        en: 'A unified, generic activity schema eliminates database migrations when introducing new habits, routines, or tracking types.',
        de: 'Ein einheitliches, generisches Aktivitätsschema erübrigt Datenbankmigrationen bei der Einführung neuer Gewohnheiten oder Tracking-Typen.',
        fr: 'Un schéma d’activité générique unifié évite toute migration de base de données lors de l’ajout de nouvelles habitudes ou types de suivi.',
        es: 'Un esquema de actividad genérico y unificado elimina migraciones de base de datos al añadir nuevos hábitos o categorías de seguimiento.',
        ar: 'مخطط الأنشطة الموحد والعام يغني تماماً عن ترحيل قواعد البيانات عند إضافة عادات جديدة أو روتينات أو أنواع تتبع مختلفة.',
      },
      {
        en: 'Multi-provider failover is mandatory for personal assistants: outages from single LLM APIs immediately erode habit consistency.',
        de: 'Multi-Provider-Failover ist für persönliche Assistenten unerlässlich: Ausfälle einzelner LLM-APIs unterbrechen sofort die Kontinuität der Gewohnheiten.',
        fr: 'Le basculement multi-fournisseurs est obligatoire pour un assistant personnel : l’indisponibilité d’une seule API LLM brise la régularité des habitudes.',
        es: 'El failover multiproveedor es esencial para asistentes personales: las caídas de una única API LLM rompen de inmediato la constancia del usuario.',
        ar: 'التبديل التلقائي متعدد المزودين إلزامي للمساعدين الشخصيين: انقطاع واجهة برمجة تطبيقات وحيدة يدمر فوراً استمرارية عادات المستخدم.',
      },
    ],
    artifacts: [
      {
        label: {
          en: 'Telegram Bot (@sihem_ai_bot)',
          de: 'Telegram Bot (@sihem_ai_bot)',
          fr: 'Bot Telegram (@sihem_ai_bot)',
          es: 'Bot de Telegram (@sihem_ai_bot)',
          ar: 'بوت تيليجرام (@sihem_ai_bot)',
        },
        href: 'https://t.me/sihem_ai_bot',
        external: true,
      },
      {
        label: {
          en: 'Web App (PWA)',
          de: 'Web-App (PWA)',
          fr: 'Application Web (PWA)',
          es: 'Aplicación Web (PWA)',
          ar: 'تطبيق الويب (PWA)',
        },
        href: 'https://sihem-pwa.pages.dev/',
        external: true,
      },
      {
        label: {
          en: 'Back to All Projects',
          de: 'Zurück zu allen Projekten',
          fr: 'Retour à tous les projets',
          es: 'Volver a todos los proyectos',
          ar: 'العودة إلى جميع المشاريع',
        },
        href: '/#projects',
      },
    ],
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug)
}
