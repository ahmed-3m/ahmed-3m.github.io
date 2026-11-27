import { formatClaim } from '@/lib/claims'
import { type TranslationMap } from '@/lib/i18n-config'

export type CaseStudy = {
  slug: 'diffusion-ood' | 'inkjet-ood' | 'sihem'
  // Update this stored date whenever this case study changes.
  lastModified: string
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
    lastModified: '2026-11-26',
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
      { label: { en: 'Model weights & raw scores (Hugging Face)', de: 'Modellgewichte & Rohwerte (Hugging Face)', fr: 'Poids et scores bruts (Hugging Face)', es: 'Pesos y puntuaciones (Hugging Face)', ar: 'أوزان النموذج والنتائج الخام (Hugging Face)' }, href: 'https://huggingface.co/ahmed-3m/DiffusionOOD', external: true },
    ],
  },
  {
    slug: 'inkjet-ood',
    lastModified: '2026-11-26',
    stack: ['YOLOv8m', 'PyTorch', 'Roboflow', 'OpenCV', 'Hydra', 'FTI_Zer0P'],
    pipelineStages: [
      {
        title: { en: '1. Industrial Surface Imaging', de: '1. Industrielle Oberflächenerfassung', fr: '1. Imagerie de surface industrielle', es: '1. Captura de superficies industriales', ar: '1. تصوير الأسطح الصناعية' },
        desc: { en: '1920×1080 frames of inkjet-printed building components grouped across 573 source images.', de: '1920×1080-Einzelbilder inkjet-bedruckter Bauteile aus 573 Quellbild-Gruppen.', fr: 'Images 1920×1080 de composants imprimés par jet d’encre regroupées sur 573 images sources.', es: 'Imágenes de 1920×1080 de componentes impresos por inyección agrupadas en 573 imágenes fuente.', ar: 'إطارات بدقة 1920×1080 لمكونات مطبوعة بنفث الحبر مجمعة عبر 573 مجموعة صور أصلية.' },
      },
      {
        title: { en: '2. YOLOv8m Feature Detection & Cropping', de: '2. YOLOv8m-Merkmalsdetektion & Zuschnitt', fr: '2. Détection et recadrage YOLOv8m', es: '2. Detección y recorte con YOLOv8m', ar: '2. كشف العناصر واقتصاصها عبر YOLOv8m' },
        desc: { en: 'Stage-1 YOLOv8m detector (25.86M params in yolo_best.pt; thesis PDF erratum prints YOLOv8n) localizes 8 feature types into 6,408 128×128 crops.', de: 'Stufe-1-YOLOv8m-Detektor (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n) lokalisiert 8 Merkmalstypen in 6.408 128×128-Ausschnitte.', fr: 'Un détecteur YOLOv8m de phase 1 (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) localise 8 types de motifs en 6 408 crops 128×128.', es: 'Un detector YOLOv8m en etapa 1 (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) localiza 8 tipos de rasgos en 6.408 recortes de 128×128.', ar: 'يكشف مصنف المرحلة الأولى YOLOv8m (25.86 مليون معامل في yolo_best.pt؛ ورد سهواً YOLOv8n في نص PDF الرسالة) 8 أنواع من الميزات ليقتطع 6,408 قصاصة بأبعاد 128×128.' },
      },
      {
        title: { en: '3. 5-Fold Cross-Validation', de: '3. 5-fache Kreuzvalidierung', fr: '3. Validation croisée en 5 plis', es: '3. Validación cruzada de 5 folds', ar: '3. تحقق تقاطعي خماسي صارم' },
        desc: { en: `Image-level 5-fold stratified CV across the 573 source-image groups establishing an auditable ${formatClaim('inkjet.baseline', 'en', 'metric')} baseline.`, de: `Bildbasierte 5-fache stratifizierte Kreuzvalidierung über 573 Quellbild-Gruppen ergibt eine prüfbare Baseline von ${formatClaim('inkjet.baseline', 'de', 'metric')}.`, fr: `Validation croisée stratifiée par image source (573 groupes, 5 plis) établissant une référence vérifiable de ${formatClaim('inkjet.baseline', 'fr', 'metric')}.`, es: `Validación cruzada estratificada a nivel de imagen (573 grupos, 5 folds) estableciendo una referencia auditable de ${formatClaim('inkjet.baseline', 'es', 'metric')}.`, ar: `تحقق تقاطعي خماسي طبقي على مستوى الصورة الأصلية عبر 573 مجموعة يثبت خط أساس موثوقاً عند ${formatClaim('inkjet.baseline', 'ar', 'metric')}.` },
      },
    ],
    approach: [
      {
        en: 'Run Stage-1 YOLOv8m detection (25.86M params in yolo_best.pt; thesis PDF erratum writes YOLOv8n) to localize 8 print feature types and extract 6,408 128×128 RGB crops across 573 source-image groups on FTI_Zer0P.',
        de: 'Stufe-1-YOLOv8m-Detektor (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n) zur Lokalisierung von 8 Druckmerkmalstypen und Extraktion von 6.408 128×128-RGB-Crops über 573 Quellbild-Gruppen auf FTI_Zer0P.',
        fr: 'Exécuter la détection YOLOv8m de phase 1 (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) pour localiser 8 types de motifs et extraire 6 408 crops RGB 128×128 sur 573 groupes d’images FTI_Zer0P.',
        es: 'Ejecutar detección YOLOv8m en etapa 1 (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) para localizar 8 tipos de rasgos y extraer 6.408 recortes RGB 128×128 en 573 grupos de FTI_Zer0P.',
        ar: 'تشغيل كاشف YOLOv8m في المرحلة الأولى (25.86 مليون معامل في yolo_best.pt؛ ذُكر سهواً YOLOv8n في نص PDF الرسالة) لتحديد 8 أنواع من ميزات الطباعة واستخراج 6,408 قصاصة RGB بأبعاد 128×128 عبر 573 مجموعة صور في FTI_Zer0P.',
      },
      {
        en: 'Train a multi-head conditional diffusion U-Net (AdaGN conditioning across the 8 feature types) on 128×128 crops to classify GOOD vs. BAD via differential reconstruction error.',
        de: 'Ein Multi-Head-Konditional-Diffusions-U-Net (AdaGN-Konditionierung über 8 Merkmalstypen) auf 128×128-Crops trainieren, um GOOD vs. BAD per Rekonstruktionsfehlerdifferenz zu klassifizieren.',
        fr: 'Entraîner un U-Net de diffusion conditionnel multi-têtes (conditionnement AdaGN sur 8 types de motifs) sur les crops 128×128 pour distinguer GOOD et BAD par écart de reconstruction.',
        es: 'Entrenar una red U-Net de difusión condicional multi-cabeza (condicionamiento AdaGN para 8 tipos de rasgos) sobre recortes 128×128 para clasificar GOOD frente a BAD por error de reconstrucción.',
        ar: 'تدريب شبكة U-Net انتشارية شرطية متعددة الرؤوس (تكييف AdaGN عبر 8 أنواع ميزات) على القصاصات 128×128 لتصنيف العينات السليمة والمعيبة عبر فرق خطأ إعادة البناء.',
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
      { label: { en: 'Thesis PDF (source of the inkjet baseline)', de: 'Thesis PDF (Quelle der Inkjet-Baseline)', fr: 'PDF du mémoire (source de la référence inkjet)', es: 'PDF de la tesis (fuente de la referencia inkjet)', ar: 'PDF الرسالة (مصدر خط أساس الطباعة النافثة)' }, href: '/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf' },
      { label: { en: 'Early technical report (2024)', de: 'Frühzeitiger Technischer Bericht (2024)', fr: 'Rapport technique précoce (2024)', es: 'Informe técnico temprano (2024)', ar: 'تقرير تقني مبكر (2024)' }, href: '/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf' },
      { label: { en: 'InkjetOOD repository', de: 'InkjetOOD Repository', fr: 'Dépôt InkjetOOD', es: 'Repositorio InkjetOOD', ar: 'مستودع InkjetOOD' }, href: 'https://github.com/ahmed-3m/InkjetOOD', external: true },
      { label: { en: 'Model weights', de: 'Modellgewichte', fr: 'Poids du modèle', es: 'Pesos del modelo', ar: 'أوزان النموذج' }, href: 'https://huggingface.co/ahmed-3m/InkjetOOD', external: true },
    ],
  },
  {
    slug: 'sihem',
    lastModified: '2026-11-26',
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
        en: 'Invitation-only proactive beta running on Telegram (@sihem_ai_bot) and installable PWA (sihem-pwa.pages.dev) with automated morning briefings and evening reviews.',
        de: 'Proaktive Beta mit Einladung auf Telegram (@sihem_ai_bot) und als installierbare PWA (sihem-pwa.pages.dev) mit automatischen Morgenbriefings und Abendreviews.',
        fr: 'Bêta proactive sur invitation sur Telegram (@sihem_ai_bot) et PWA installable (sihem-pwa.pages.dev) avec briefings matinaux et bilans du soir automatisés.',
        es: 'Beta proactiva por invitación en Telegram (@sihem_ai_bot) y PWA instalable (sihem-pwa.pages.dev) con resúmenes matutinos y revisiones nocturnas automatizadas.',
        ar: 'نسخة تجريبية استباقية بدعوة تعمل على تيليجرام (@sihem_ai_bot) وتطبيق ويب قابل للتثبيت (sihem-pwa.pages.dev) مع موجزات صباحية ومراجعات مسائية مؤتمتة.',
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
        ar: 'القبول في حاضنة الأعمال tech2b في النمسا العليا (مايو 2026 – حتى الآن) لمصادقة المنتج واختبار مجموعات المستخدمين في لينتس.',
      },
    ],
    lessons: [
      {
        en: "Scheduling decisions use deterministic rules; generated text still requires validation and may contain errors.",
        de: "Zeitplanentscheidungen nutzen deterministische Regeln; generierter Text muss validiert werden und kann Fehler enthalten.",
        fr: "La planification utilise des règles déterministes ; le texte généré reste à valider et peut contenir des erreurs.",
        es: "La planificación utiliza reglas deterministas; el texto generado requiere validación y puede contener errores.",
        ar: "تستخدم قرارات الجدولة قواعد حتمية؛ يظل النص المولد بحاجة إلى التحقق وقد يحتوي على أخطاء.",
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
          en: 'Telegram Bot (@sihem_ai_bot, invitation-only)',
          de: 'Telegram Bot (@sihem_ai_bot, mit Einladung)',
          fr: 'Bot Telegram (@sihem_ai_bot, sur invitation)',
          es: 'Bot de Telegram (@sihem_ai_bot, por invitación)',
          ar: 'بوت تيليجرام (@sihem_ai_bot، بدعوة)',
        },
        href: 'https://t.me/sihem_ai_bot',
        external: true,
      },
      {
        label: {
          en: 'Web App (PWA, invitation-only)',
          de: 'Web-App (PWA, mit Einladung)',
          fr: 'Application Web (PWA, sur invitation)',
          es: 'Aplicación Web (PWA, por invitación)',
          ar: 'تطبيق الويب (PWA، بدعوة)',
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
