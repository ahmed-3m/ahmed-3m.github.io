import type { TranslationMap } from '@/lib/i18n-config'

export const diffusionExplorerHref = '/case-studies/diffusion-ood/#ood-explorer'

export const portfolioCopy = {
  role: { en: 'AI/ML Engineer', de: 'KI- und ML-Ingenieur', fr: 'Ingénieur IA et ML', es: 'Ingeniero de IA y ML', ar: 'مهندس ذكاء اصطناعي وتعلّم آلي' },
  lede: {
    en: 'I build reliable vision and agentic AI systems pairing probabilistic models with deterministic guardrails across print inspection, diffusion OOD detection, and LLM/agent tooling.',
    de: 'Ich entwickle zuverlässige Bildverarbeitungs- und agentische KI-Systeme, die probabilistische Modelle mit deterministischen Guardrails verbinden – von Druckprüfung und Diffusions-OOD-Erkennung bis zu LLM- und Agent-Tooling.',
    fr: 'Je conçois des systèmes fiables de vision et d’IA agentique alliant modèles probabilistes et garde-fous déterministes, de l’inspection d’impression à la détection OOD par diffusion et à l’outillage LLM/agents.',
    es: 'Desarrollo sistemas fiables de visión e IA agéntica que combinan modelos probabilísticos con controles deterministas, desde inspección de impresión y detección OOD por difusión hasta herramientas para LLM y agentes.',
    ar: 'أبني أنظمة موثوقة للرؤية والذكاء الاصطناعي الوكيلي تجمع بين النماذج الاحتمالية والضوابط الحتمية، من فحص الطباعة وكشف \u2066OOD\u2069 بالانتشار إلى أدوات \u2066LLM\u2069 والوكلاء.',
  },
  location: { en: 'Linz, Austria', de: 'Linz, Österreich', fr: 'Linz, Autriche', es: 'Linz, Austria', ar: 'لينتس، النمسا' },
  availability: { en: 'Open to AI/ML roles', de: 'Offen für KI- und ML-Stellen', fr: 'Ouvert aux postes en IA et ML', es: 'Abierto a puestos de IA y ML', ar: 'منفتح على وظائف الذكاء الاصطناعي والتعلّم الآلي' },
  cv: { en: 'View CV (PDF)', de: 'Lebenslauf ansehen (PDF)', fr: 'Voir le CV (PDF)', es: 'Ver CV (PDF)', ar: 'عرض السيرة الذاتية (PDF)' },
  contact: { en: 'Get in touch', de: 'Kontakt', fr: 'Me contacter', es: 'Contactar', ar: 'تواصل معي' },
  fullPortfolio: { en: 'Full portfolio', de: 'Vollständiges Portfolio', fr: 'Portfolio complet', es: 'Portfolio completo', ar: 'البورتفوليو الكامل' },
  conciseView: { en: 'Concise overview', de: 'Kurzübersicht', fr: 'Vue résumée', es: 'Vista resumida', ar: 'العرض المختصر' },
  work: { en: 'Selected work', de: 'Ausgewählte Projekte', fr: 'Projets sélectionnés', es: 'Proyectos seleccionados', ar: 'مشاريع مختارة' },
  about: { en: 'About me', de: 'Über mich', fr: 'À propos', es: 'Sobre mí', ar: 'نبذة عني' },
  background: {
    en: 'I started in mechatronics, building and troubleshooting physical systems. That experience took me into industrial computer vision at PROFACTOR and research on how models handle unfamiliar images at JKU Linz.',
    de: 'Mein Weg begann in der Mechatronik, wo ich physische Systeme gebaut und Fehler gesucht habe. Das führte mich zur industriellen Bildverarbeitung bei PROFACTOR und zur Forschung an der JKU Linz über den Umgang von Modellen mit unbekannten Bildern.',
    fr: 'J’ai commencé en mécatronique, à construire et dépanner des systèmes physiques. Ce parcours m’a mené à la vision industrielle chez PROFACTOR, puis à la recherche à la JKU Linz sur la façon dont les modèles traitent les images inhabituelles.',
    es: 'Empecé en mecatrónica, construyendo sistemas físicos y resolviendo sus fallos. Eso me llevó a la visión industrial en PROFACTOR y a investigar en la JKU Linz cómo responden los modelos a imágenes desconocidas.',
    ar: 'بدأت في هندسة الميكاترونيات، حيث بنيت أنظمة مادية وشخّصت أعطالها. قادتني هذه الخبرة إلى الرؤية الحاسوبية الصناعية في PROFACTOR، ثم إلى البحث في جامعة يوهانس كيبلر في لينتس حول تعامل النماذج مع الصور غير المألوفة.',
  },
  moreAbout: { en: 'More about my background', de: 'Mehr über meinen Werdegang', fr: 'En savoir plus sur mon parcours', es: 'Más sobre mi trayectoria', ar: 'المزيد عن مسيرتي' },
  experience: { en: 'Experience timeline', de: 'Beruflicher Werdegang', fr: 'Parcours professionnel', es: 'Trayectoria profesional', ar: 'المسار المهني' },
  explore: { en: 'Explore further', de: 'Mehr entdecken', fr: 'Pour aller plus loin', es: 'Para saber más', ar: 'استكشف المزيد' },
  research: { en: 'Full research', de: 'Forschung im Detail', fr: 'Travaux de recherche', es: 'Investigación completa', ar: 'الأبحاث بالتفصيل' },
  evidence: { en: 'Research artifacts', de: 'Forschungsmaterialien', fr: 'Documents de recherche', es: 'Materiales de investigación', ar: 'مواد البحث' },
  explorer: { en: 'Interactive thesis explorer', de: 'Interaktive Analyse zur Masterarbeit', fr: 'Explorateur interactif du mémoire', es: 'Explorador interactivo de la tesis', ar: 'مستكشف الرسالة التفاعلي' },
  writing: { en: 'Writing', de: 'Artikel', fr: 'Articles', es: 'Artículos', ar: 'المقالات' },
  news: { en: 'News', de: 'Neuigkeiten', fr: 'Actualités', es: 'Noticias', ar: 'الأخبار' },
  inkjetCaption: { en: 'Print samples from the thesis dataset', de: 'Druckproben aus dem Datensatz der Masterarbeit', fr: 'Échantillons imprimés du jeu de données du mémoire', es: 'Muestras de impresión del conjunto de datos de la tesis', ar: 'عينات طباعة من مجموعة بيانات الرسالة' },
  inkjetAlt: { en: 'Images of printed test patterns with detection boxes around individual features', de: 'Bilder von gedruckten Testmustern mit Erkennungsrahmen um einzelne Elemente', fr: 'Images de motifs de test imprimés avec des cadres autour des éléments détectés', es: 'Imágenes de patrones de prueba impresos con recuadros que señalan los elementos detectados', ar: 'صور لأنماط طباعة اختبارية مع مربعات حول العناصر المكتشفة' },
  discipline1: { en: 'Industrial CV', de: 'Industrielle Bildverarbeitung', fr: 'Vision industrielle', es: 'Visión industrial', ar: 'الرؤية الصناعية' },
  discipline2: { en: 'Diffusion OOD', de: 'Diffusion OOD', fr: 'Diffusion OOD', es: 'Difusión OOD', ar: 'كشف OOD بالانتشار' },
  discipline3: { en: 'Production AI', de: 'Produktive KI', fr: 'IA en production', es: 'IA en producción', ar: 'ذكاء اصطناعي إنتاجي' },
  locationMeta: {
    en: 'Linz, Austria · M.Sc. AI, JKU',
    de: 'Linz, Österreich · M.Sc. AI, JKU',
    fr: 'Linz, Autriche · M.Sc. IA, JKU',
    es: 'Linz, Austria · M.Sc. IA, JKU',
    ar: 'لينتس، النمسا · ماجستير ذكاء اصطناعي، JKU',
  },
  snapshotLabel: { en: 'Focus areas', de: 'Schwerpunkte', fr: 'Domaines clés', es: 'Áreas clave', ar: 'مجالات التركيز' },
  snapshotCaption: {
    en: 'CIFAR-10 · seed 42, λ = 0.02, K = 100 · 1,000 ID vs 9,000 OOD',
    de: 'CIFAR-10 · Seed 42, λ = 0.02, K = 100 · 1.000 ID vs. 9.000 OOD',
    fr: 'CIFAR-10 · seed 42, λ = 0.02, K = 100 · 1 000 ID vs 9 000 OOD',
    es: 'CIFAR-10 · seed 42, λ = 0.02, K = 100 · 1.000 ID vs 9.000 OOD',
    ar: '\u2066CIFAR-10 · seed 42, λ = 0.02, K = 100 · 1,000 ID\u2069 مقابل \u20669,000 OOD\u2069',
  },
  diffusionDiagramAlt: {
    en: 'Diagram showing conditional separation loss pushing normal and other noise explanations apart',
    de: 'Diagramm, das zeigt, wie die konditionale Separation Loss die Rauscherklärungen für „normal“ und „andere“ auseinanderdrückt',
    fr: 'Schéma montrant comment la separation loss conditionnelle éloigne les explications de bruit « normal » et « autre »',
    es: 'Diagrama que muestra cómo la separation loss condicional separa las explicaciones de ruido «normal» y «otras»',
    ar: 'مخطط يوضح كيف تدفع خسارة الفصل الشرطية تفسيرات الضوضاء للفئتين «طبيعي» و«أخرى» إلى الابتعاد عن بعضهما',
  },
  histogramChartLabel: {
    en: 'Histogram of CIFAR-10 seed-42 diffusion anomaly scores: in-distribution airplane images cluster at low scores and out-of-distribution images at higher scores, with AUROC 98.98% and FPR at 95% TPR of 4.7%.',
    de: 'Histogramm der Diffusions-Anomaliescores auf CIFAR-10 (Seed 42): In-Distribution-Flugzeugbilder liegen bei niedrigen Scores und Out-of-Distribution-Bilder bei höheren Scores, mit einer AUROC von 98.98% und einer FPR bei 95% TPR von 4.7%.',
    fr: 'Histogramme des scores d’anomalie par diffusion sur CIFAR-10 (seed 42) : les images d’avions in-distribution se regroupent aux scores bas et les images hors distribution aux scores plus élevés, avec une AUROC de 98.98% et un FPR à 95% de TPR de 4.7%.',
    es: 'Histograma de puntuaciones de anomalía por difusión en CIFAR-10 (seed 42): las imágenes de aviones en distribución se agrupan en puntuaciones bajas y las fuera de distribución en puntuaciones más altas, con AUROC de 98.98% y FPR al 95% de TPR de 4.7%.',
    ar: 'مدرج تكراري لدرجات الشذوذ بالانتشار على \u2066CIFAR-10 (seed 42)\u2069: تتجمع صور الطائرات داخل التوزيع عند الدرجات المنخفضة والصور خارج التوزيع عند الدرجات الأعلى، مع \u2066AUROC\u2069 يبلغ \u206698.98%\u2069 ومعدل \u2066FPR\u2069 عند \u206695% TPR\u2069 يبلغ \u20664.7%\u2069.',
  },
  histogramId: { en: 'ID · airplane', de: 'ID · Flugzeug', fr: 'ID · avion', es: 'ID · avión', ar: 'ID · طائرة' },
  histogramOod: { en: 'OOD · 9 other classes', de: 'OOD · 9 andere Klassen', fr: 'OOD · 9 autres classes', es: 'OOD · otras 9 clases', ar: 'OOD · 9 فئات أخرى' },
  histogramTau: { en: 'τ @ TPR 95', de: 'τ @ TPR 95', fr: 'τ @ TPR 95', es: 'τ @ TPR 95', ar: 'τ @ TPR 95' },
  sihemStep1Label: { en: 'Signals', de: 'Signale', fr: 'Signaux', es: 'Señales', ar: 'الإشارات' },
  sihemStep1Desc: {
    en: 'Calendar, routines, energy',
    de: 'Kalender, Routinen, Energie',
    fr: 'Calendrier, routines, énergie',
    es: 'Calendario, rutinas, energía',
    ar: 'التقويم، الروتين، الطاقة',
  },
  sihemStep2Label: { en: 'Arbiter', de: 'Arbiter', fr: 'Arbitre', es: 'Árbitro', ar: 'المحكّم' },
  sihemStep2Desc: {
    en: 'Deterministic gate + pgvector',
    de: 'Deterministisches Gate + pgvector',
    fr: 'Porte déterministe + pgvector',
    es: 'Compuerta determinista + pgvector',
    ar: 'بوابة حتمية + pgvector',
  },
  sihemStep3Label: { en: 'Check-in', de: 'Check-in', fr: 'Suivi', es: 'Seguimiento', ar: 'المتابعة' },
  sihemStep3Desc: {
    en: 'Telegram + PWA nudge',
    de: 'Telegram- & PWA-Impuls',
    fr: 'Rappel Telegram + PWA',
    es: 'Aviso por Telegram + PWA',
    ar: 'إشعار تيليجرام + PWA',
  },
  sihemLoopAria: {
    en: 'Sihem three-stage loop: Signals feed into a deterministic Arbiter with pgvector memory, triggering a Telegram and PWA check-in.',
    de: 'Dreistufiger Ablauf von Sihem: Signale fließen in einen deterministischen Arbiter mit pgvector-Gedächtnis und lösen einen Check-in über Telegram und PWA aus.',
    fr: 'Boucle en trois étapes de Sihem : les signaux alimentent un arbitre déterministe doté d’une mémoire pgvector, déclenchant un suivi sur Telegram et PWA.',
    es: 'Ciclo de tres etapas de Sihem: las señales pasan a un árbitro determinista con memoria pgvector que activa un seguimiento por Telegram y PWA.',
    ar: 'حلقة Sihem ذات المراحل الثلاث: تغذّي الإشارات محكّماً حتمياً بذاكرة pgvector، ما يطلق رسالة متابعة عبر تيليجرام وتطبيق الويب التقدمي (PWA).',
  },
  headshotAlt: {
    en: 'Portrait of Ahmed Mohammed',
    de: 'Porträt von Ahmed Mohammed',
    fr: 'Portrait d’Ahmed Mohammed',
    es: 'Retrato de Ahmed Mohammed',
    ar: 'صورة شخصية لأحمد محمد',
  },
  exploreResearchDesc: {
    en: 'Thesis, separation loss, benchmarks',
    de: 'Masterarbeit, Separation Loss, Benchmarks',
    fr: 'Mémoire, separation loss, benchmarks',
    es: 'Tesis, separation loss, benchmarks',
    ar: 'الرسالة، خسارة الفصل، المعايير',
  },
  exploreExplorerDesc: {
    en: 'Interactive CIFAR-10 & Inkjet charts',
    de: 'Interaktive CIFAR-10- & Inkjet-Diagramme',
    fr: 'Graphiques interactifs CIFAR-10 et Inkjet',
    es: 'Gráficos interactivos de CIFAR-10 e Inkjet',
    ar: 'رسوم تفاعلية لـ CIFAR-10 وجودة الطباعة',
  },
  exploreWritingDesc: {
    en: 'Notes on ML systems & evaluation',
    de: 'Notizen zu ML-Systemen & Evaluation',
    fr: 'Notes sur les systèmes ML et l’évaluation',
    es: 'Notas sobre sistemas de ML y evaluación',
    ar: 'مقالات عن أنظمة التعلّم الآلي والتقييم',
  },
  exploreNewsDesc: {
    en: 'Curated AI & agentic engineering feed',
    de: 'Kuratierter Feed zu KI & Agentic Engineering',
    fr: 'Veille sélectionnée sur l’IA et l’ingénierie agentique',
    es: 'Selección sobre IA e ingeniería agéntica',
    ar: 'متابعة منتقاة للذكاء الاصطناعي والهندسة الوكيلية',
  },
  ossBadge: {
    en: '0 LLM calls',
    de: '0 LLM-Aufrufe',
    fr: '0 appel LLM',
    es: '0 llamadas LLM',
    ar: '0 استدعاءات LLM',
  },
  ossSummary: {
    en: 'Deterministic PR checks for AI-written code — 0 LLM calls. Passing checks does not guarantee defect-free code.',
    de: 'Deterministische PR-Prüfungen für KI-generierten Code — 0 LLM-Aufrufe. Bestandene Prüfungen garantieren keinen fehlerfreien Code.',
    fr: 'Vérifications déterministes de PR pour du code généré par IA — 0 appel LLM. La réussite des contrôles ne garantit pas un code sans défaut.',
    es: 'Comprobaciones deterministas de PR para código escrito por IA — 0 llamadas LLM. Superar las comprobaciones no garantiza un código sin errores.',
    ar: 'فحوصات حتمية لطلبات الدمج المكتوبة بالذكاء الاصطناعي — 0 استدعاءات LLM. اجتياز الفحوص لا يضمن خلو الشيفرة من الأخطاء.',
  },
  ossLink: {
    en: 'View on GitHub',
    de: 'Auf GitHub ansehen',
    fr: 'Voir sur GitHub',
    es: 'Ver en GitHub',
    ar: 'عرض على GitHub',
  },
  degreeBadge: {
    en: 'M.Sc. AI, JKU · Thesis grade 1',
    de: 'M.Sc. AI, JKU · Masterarbeit (Note 1)',
    fr: 'M.Sc. IA, JKU · Mémoire (note 1)',
    es: 'M.Sc. IA, JKU · Tesis (nota 1)',
    ar: 'ماجستير ذكاء اصطناعي، JKU · الرسالة (تقدير 1)',
  },
  stageTablistAria: {
    en: 'Selected work showcase channels',
    de: 'Präsentationskanäle ausgewählter Projekte',
    fr: 'Canaux de présentation des projets sélectionnés',
    es: 'Canales de presentación de proyectos seleccionados',
    ar: 'قنوات عرض المشاريع المختارة',
  },
  stageVisualModeAria: {
    en: 'Diffusion OOD visual mode',
    de: 'Darstellungsmodus für Diffusion OOD',
    fr: 'Mode visuel Diffusion OOD',
    es: 'Modo visual de Difusión OOD',
    ar: 'وضع العرض المرئي لكشف OOD بالانتشار',
  },
  stageVisualHistogram: {
    en: 'Score histogram',
    de: 'Score-Histogramm',
    fr: 'Histogramme des scores',
    es: 'Histograma de puntuaciones',
    ar: 'المدرج التكراري للدرجات',
  },
  stageVisualDiagram: {
    en: 'Separation diagram',
    de: 'Trennungsdiagramm',
    fr: 'Schéma de séparation',
    es: 'Diagrama de separación',
    ar: 'مخطط الفصل',
  },
  telemetrySeed42: {
    en: 'Seed 42 · λ = 0.02',
    de: 'Seed 42 · λ = 0.02',
    fr: 'Seed 42 · λ = 0.02',
    es: 'Seed 42 · λ = 0.02',
    ar: '\u2066seed 42 · λ = 0.02\u2069',
  },
  telemetryAccuracy: { en: 'Accuracy', de: 'Genauigkeit', fr: 'Exactitude', es: 'Exactitud', ar: 'الدقة' },
  telemetryProtocol: { en: 'Protocol', de: 'Protokoll', fr: 'Protocole', es: 'Protocolo', ar: 'البروتوكول' },
  telemetryInkjetProtocolVal: {
    en: '5-fold CV · λ = 0',
    de: '5-fach CV · λ = 0',
    fr: 'CV 5 plis · λ = 0',
    es: 'CV 5 pliegues · λ = 0',
    ar: 'تحقق 5 طيات · \u2066λ = 0\u2069',
  },
  telemetryChannels: { en: 'Channels', de: 'Kanäle', fr: 'Canaux', es: 'Canales', ar: 'القنوات' },
  telemetryMemory: { en: 'Memory', de: 'Speicher', fr: 'Mémoire', es: 'Memoria', ar: 'الذاكرة' },
  telemetryStage: { en: 'Stage', de: 'Phase', fr: 'Phase', es: 'Fase', ar: 'المرحلة' },
  telemetryBeta: {
    en: 'tech2b · Private beta',
    de: 'tech2b · Private Beta',
    fr: 'tech2b · Bêta privée',
    es: 'tech2b · Beta privada',
    ar: '\u2066tech2b\u2069 · نسخة خاصة',
  },
} satisfies Record<string, TranslationMap>

export const selectedWork = [
  {
    slug: 'inkjet-ood',
    href: '/case-studies/inkjet-ood/#evaluation',
    visual: true,
    context: { en: 'PROFACTOR · Industrial computer vision', de: 'PROFACTOR · Industrielle Bildverarbeitung', fr: 'PROFACTOR · Vision industrielle', es: 'PROFACTOR · Visión industrial', ar: 'PROFACTOR · الرؤية الحاسوبية الصناعية' },
    title: { en: 'Finding defects in inkjet printing', de: 'Fehler im Tintenstrahldruck erkennen', fr: 'Détecter les défauts d’impression jet d’encre', es: 'Detectar defectos en la impresión por inyección de tinta', ar: 'اكتشاف عيوب الطباعة بنفث الحبر' },
    summary: {
      en: 'During a 2024 research contract with PROFACTOR, I built a vision pipeline to locate printed features and flag unusual patterns. I continued the work in my master’s thesis at JKU Linz.',
      de: 'Während eines Forschungsvertrags mit PROFACTOR im Jahr 2024 entwickelte ich eine Bildverarbeitung, die gedruckte Elemente lokalisiert und auffällige Muster markiert. Die Arbeit führte ich in meiner Masterarbeit an der JKU Linz fort.',
      fr: 'Lors d’un contrat de recherche avec PROFACTOR en 2024, j’ai développé un système de vision qui localise les éléments imprimés et signale les motifs inhabituels. J’ai poursuivi ce travail dans mon mémoire de master à la JKU Linz.',
      es: 'Durante un contrato de investigación con PROFACTOR en 2024, desarrollé un sistema de visión que localiza los elementos impresos y señala patrones inusuales. Continué el trabajo en mi tesis de máster en la JKU Linz.',
      ar: 'خلال عقد بحثي مع PROFACTOR عام 2024، طوّرت نظام رؤية يحدّد مواقع العناصر المطبوعة ويشير إلى الأنماط غير المألوفة. واصلت هذا العمل في رسالة الماجستير بجامعة يوهانس كيبلر في لينتس.',
    },
    link: { en: 'See the industrial evaluation', de: 'Industrielle Evaluation ansehen', fr: 'Voir l’évaluation industrielle', es: 'Ver la evaluación industrial', ar: 'اطّلع على التقييم الصناعي' },
    metricValue: '0.8673 ± 0.0230',
    metricLabel: {
      en: 'AUROC · FTI_Zer0P 5-fold CV baseline',
      de: 'AUROC · FTI_Zer0P 5-fach-CV-Baseline',
      fr: 'AUROC · baseline CV 5 plis FTI_Zer0P',
      es: 'AUROC · baseline CV 5 pliegues FTI_Zer0P',
      ar: '\u2066AUROC · FTI_Zer0P\u2069 خط أساس تحقق \u20665\u2069 طيات',
    },
    tags: ['YOLOv8', 'DDPM', { en: '5-fold CV', de: '5-fach CV', fr: 'CV 5 plis', es: 'CV 5 pliegues', ar: 'تحقق 5 طيات' }],
  },
  {
    slug: 'diffusion-ood',
    href: '/case-studies/diffusion-ood/#evaluation',
    context: { en: 'JKU Linz · Master’s research', de: 'JKU Linz · Masterarbeit', fr: 'JKU Linz · Recherche de master', es: 'JKU Linz · Investigación de máster', ar: 'جامعة يوهانس كيبلر في لينتس · بحث الماجستير' },
    title: { en: 'Recognizing unfamiliar images', de: 'Unbekannte Bilder erkennen', fr: 'Reconnaître les images inhabituelles', es: 'Reconocer imágenes desconocidas', ar: 'التعرّف على الصور غير المألوفة' },
    summary: {
      en: 'A model trained on familiar images can still be confident about a new kind of image. At JKU Linz, I tested whether the way a model reconstructs an image can reveal that it falls outside what the model knows.',
      de: 'Ein Modell kann sich auch bei einem unbekannten Bildtyp sicher sein. An der JKU Linz untersuchte ich, ob sich an der Rekonstruktion eines Bildes erkennen lässt, dass es außerhalb der vertrauten Beispiele liegt.',
      fr: 'Un modèle peut être sûr de lui face à un type d’image qu’il n’a jamais vu. À la JKU Linz, j’ai testé si sa manière de reconstruire une image pouvait révéler qu’elle sort de ce qu’il connaît.',
      es: 'Un modelo puede mostrar confianza ante un tipo de imagen que nunca ha visto. En la JKU Linz comprobé si la forma en que reconstruye una imagen permite detectar que queda fuera de lo que conoce.',
      ar: 'قد يجيب النموذج بثقة حتى عندما يرى نوعًا جديدًا من الصور. في جامعة يوهانس كيبلر في لينتس اختبرت ما إذا كانت طريقة إعادة بناء الصورة تكشف أنها خارج نطاق ما يعرفه النموذج.',
    },
    link: { en: 'Read the thesis case study', de: 'Fallstudie zur Masterarbeit lesen', fr: 'Lire l’étude de cas du mémoire', es: 'Leer el estudio de caso de la tesis', ar: 'اقرأ دراسة حالة الرسالة' },
    metricValue: '99.03% ± 0.07%',
    metricLabel: {
      en: 'AUROC · CIFAR-10 airplane-vs-rest (3 seeds, +6.5pp)',
      de: 'AUROC · CIFAR-10 Flugzeug-vs-Rest (3 Seeds, +6.5pp)',
      fr: 'AUROC · CIFAR-10 avion-vs-reste (3 seeds, +6.5pp)',
      es: 'AUROC · CIFAR-10 avión-vs-resto (3 seeds, +6.5pp)',
      ar: '\u2066AUROC · CIFAR-10\u2069 طائرة مقابل الباقي (\u20663\u2069 بذور، \u2066+6.5pp\u2069)',
    },
    tags: ['PyTorch', { en: 'Separation loss', de: 'Separation Loss', fr: 'Separation loss', es: 'Separation loss', ar: 'خسارة الفصل' }, 'CIFAR-10'],
  },
  {
    slug: 'sihem',
    href: '/case-studies/sihem/',
    context: { en: 'Independent project · Private beta', de: 'Eigenprojekt · Private Beta', fr: 'Projet indépendant · Bêta privée', es: 'Proyecto independiente · Beta privada', ar: 'مشروع مستقل · نسخة تجريبية خاصة' },
    title: { en: 'Sihem, a planning assistant', de: 'Sihem, ein Planungsassistent', fr: 'Sihem, un assistant de planification', es: 'Sihem, un asistente de planificación', ar: 'Sihem، مساعد للتخطيط' },
    summary: {
      en: 'When plans change, it can be hard to decide what to do next. I built a Telegram and web assistant that helps neurodivergent people adjust routines and pick a manageable next step.',
      de: 'Wenn sich Pläne ändern, ist der nächste Schritt oft unklar. Ich habe einen Telegram- und Web-Assistenten gebaut, der neurodivergenten Menschen hilft, Routinen anzupassen und einen machbaren nächsten Schritt zu finden.',
      fr: 'Quand les plans changent, il est parfois difficile de savoir quoi faire ensuite. J’ai créé un assistant web et Telegram qui aide les personnes neurodivergentes à adapter leurs routines et à choisir une prochaine étape à leur portée.',
      es: 'Cuando cambian los planes, puede costar decidir qué hacer después. Creé un asistente web y de Telegram que ayuda a personas neurodivergentes a adaptar sus rutinas y elegir un siguiente paso manejable.',
      ar: 'عندما تتغير الخطط، قد يصعب تحديد ما يجب فعله بعد ذلك. بنيت مساعدًا عبر تيليجرام والويب يساعد الأشخاص ذوي التنوع العصبي على تعديل روتينهم واختيار خطوة تالية قابلة للتنفيذ.',
    },
    link: { en: 'Read the Sihem case study', de: 'Sihem-Fallstudie lesen', fr: 'Lire l’étude de cas Sihem', es: 'Leer el caso de Sihem', ar: 'اقرأ دراسة حالة Sihem' },
    metricValue: 'tech2b',
    metricLabel: {
      en: 'Incubator · Invitation-only beta',
      de: 'Inkubator · Beta mit Einladung',
      fr: 'Incubateur · Bêta sur invitation',
      es: 'Incubadora · Beta por invitación',
      ar: 'حاضنة أعمال · نسخة تجريبية بدعوة',
    },
    tags: ['Deno / TS', 'Supabase', 'pgvector'],
  },
] satisfies Array<{
  slug: 'inkjet-ood' | 'diffusion-ood' | 'sihem'
  href: string
  visual?: boolean
  context: TranslationMap
  title: TranslationMap
  summary: TranslationMap
  link: TranslationMap
  metricValue: string
  metricLabel: TranslationMap
  tags: ReadonlyArray<string | TranslationMap>
}>

export interface FocusPillar {
  id: 'diffusion-ood' | 'inkjet-ood' | 'sihem'
  tabLabel: TranslationMap
  title: TranslationMap
  metricValue: string
  metricSub: TranslationMap
  ctaLabel: TranslationMap
  href: string
}

export const focusPillars: readonly FocusPillar[] = [
  {
    id: 'diffusion-ood',
    tabLabel: { en: 'Diffusion OOD', de: 'Diffusion OOD', fr: 'Diffusion OOD', es: 'Difusión OOD', ar: 'كشف OOD بالانتشار' },
    title: {
      en: 'Conditional diffusion OOD detection',
      de: 'Konditionale Diffusions-OOD-Erkennung',
      fr: 'Détection OOD par diffusion conditionnelle',
      es: 'Detección OOD por difusión condicional',
      ar: 'كشف OOD بنماذج الانتشار الشرطية',
    },
    metricValue: '99.03% ± 0.07%',
    metricSub: {
      en: 'AUROC · CIFAR-10 airplane-vs-rest · 3-seed mean (+6.5pp vs 92.52% ± 11.07%) · plot: seed 42 (98.98%, FPR@95 4.7%)',
      de: 'AUROC · CIFAR-10 Flugzeug-vs-Rest · 3-Seed-Mittel (+6.5pp vs. 92.52% ± 11.07%) · Plot: Seed 42 (98.98%, FPR@95 4.7%)',
      fr: 'AUROC · CIFAR-10 avion-vs-reste · moyenne 3 seeds (+6.5pp vs 92.52% ± 11.07%) · graphe : seed 42 (98.98%, FPR@95 4.7%)',
      es: 'AUROC · CIFAR-10 avión-vs-resto · media 3 seeds (+6.5pp vs 92.52% ± 11.07%) · gráfico: seed 42 (98.98%, FPR@95 4.7%)',
      ar: '\u2066AUROC · CIFAR-10\u2069 طائرة مقابل الباقي · متوسط \u20663\u2069 بذور (\u2066+6.5pp\u2069 مقابل \u206692.52% ± 11.07%\u2069) · الرسم: \u2066seed 42 (98.98%, FPR@95 4.7%)\u2069',
    },
    ctaLabel: {
      en: 'Open interactive OOD explorer',
      de: 'Interaktiven OOD-Explorer öffnen',
      fr: 'Ouvrir l’explorateur OOD interactif',
      es: 'Abrir el explorador OOD interactivo',
      ar: 'افتح مستكشف OOD التفاعلي',
    },
    href: diffusionExplorerHref,
  },
  {
    id: 'inkjet-ood',
    tabLabel: { en: 'Inkjet QC', de: 'Inkjet QC', fr: 'Inkjet QC', es: 'Inkjet QC', ar: 'جودة Inkjet' },
    title: {
      en: 'Two-stage industrial defect inspection',
      de: 'Zweistufige industrielle Fehlerprüfung',
      fr: 'Inspection industrielle des défauts en deux étapes',
      es: 'Inspección industrial de defectos en dos etapas',
      ar: 'فحص صناعي للعيوب على مرحلتين',
    },
    metricValue: '0.8673 ± 0.0230',
    metricSub: {
      en: 'AUROC · FTI_Zer0P 5-fold CV baseline (separation loss non-significant after Holm correction)',
      de: 'AUROC · FTI_Zer0P 5-fach-CV-Baseline (Separation Loss nach Holm-Korrektur nicht signifikant)',
      fr: 'AUROC · baseline CV 5 plis FTI_Zer0P (separation loss non significative après correction de Holm)',
      es: 'AUROC · baseline CV 5 pliegues FTI_Zer0P (separation loss no significativa tras corrección de Holm)',
      ar: '\u2066AUROC · FTI_Zer0P\u2069 خط أساس تحقق \u20665\u2069 طيات (خسارة الفصل غير دالة إحصائياً بعد تصحيح \u2066Holm\u2069)',
    },
    ctaLabel: {
      en: 'See industrial evaluation',
      de: 'Industrielle Evaluation ansehen',
      fr: 'Voir l’évaluation industrielle',
      es: 'Ver la evaluación industrial',
      ar: 'اطّلع على التقييم الصناعي',
    },
    href: '/case-studies/inkjet-ood/#evaluation',
  },
  {
    id: 'sihem',
    tabLabel: { en: 'Sihem', de: 'Sihem', fr: 'Sihem', es: 'Sihem', ar: 'Sihem' },
    title: {
      en: 'Proactive personal-mentor assistant',
      de: 'Proaktiver persönlicher Mentor-Assistent',
      fr: 'Assistant mentor personnel proactif',
      es: 'Asistente mentor personal proactivo',
      ar: 'مساعد ومرشد شخصي استباقي',
    },
    metricValue: 'Telegram + PWA',
    metricSub: {
      en: 'Deterministic arbiter · pgvector RAG memory · tech2b invitation-only beta',
      de: 'Deterministischer Arbiter · pgvector-RAG-Gedächtnis · tech2b-Beta mit Einladung',
      fr: 'Arbitre déterministe · mémoire RAG pgvector · bêta tech2b sur invitation',
      es: 'Árbitro determinista · memoria RAG pgvector · beta de tech2b por invitación',
      ar: 'محكّم حتمي · ذاكرة \u2066RAG\u2069 بـ \u2066pgvector\u2069 · نسخة \u2066tech2b\u2069 التجريبية بدعوة',
    },
    ctaLabel: {
      en: 'Read the Sihem case study',
      de: 'Sihem-Fallstudie lesen',
      fr: 'Lire l’étude de cas Sihem',
      es: 'Leer el caso de Sihem',
      ar: 'اقرأ دراسة حالة Sihem',
    },
    href: '/case-studies/sihem/',
  },
]
