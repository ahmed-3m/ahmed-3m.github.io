import { type TranslationMap } from '@/lib/i18n-config'

export type CaseStudy = {
  slug: 'diffusion-ood' | 'inkjet-ood' | 'faultrix'
  title: TranslationMap
  summary: TranslationMap
  problem: TranslationMap
  role: TranslationMap
  approach: string[]
  results: string[]
  lessons: string[]
  artifacts: Array<{ label: string; href: string }>
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'diffusion-ood',
    title: {
      en: 'DiffusionOOD',
      de: 'DiffusionOOD',
      fr: 'DiffusionOOD',
      es: 'DiffusionOOD',
      ar: 'DiffusionOOD',
    },
    summary: {
      en: 'Conditional diffusion models used as generative classifiers for OOD detection, with separation loss reaching 99.03% +/- 0.07% AUROC.',
      de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren fuer OOD-Erkennung mit Separation Loss und 99.03% +/- 0.07% AUROC.',
      fr: 'Modeles de diffusion conditionnels utilises comme classificateurs generatifs pour la detection OOD avec 99.03% +/- 0.07% AUROC.',
      es: 'Modelos de difusion condicional usados como clasificadores generativos para deteccion OOD con 99.03% +/- 0.07% AUROC.',
      ar: 'نماذج انتشار شرطية استُخدمت كمصنفات توليدية لكشف OOD مع 99.03% +/- 0.07% AUROC.',
    },
    problem: {
      en: 'Build a more stable OOD detector that does not rely on classifier confidence alone.',
      de: 'Einen stabileren OOD-Detektor bauen, der nicht nur auf Klassifikator-Confidence basiert.',
      fr: 'Construire un detecteur OOD plus stable qui ne depenne pas seulement de la confiance du classificateur.',
      es: 'Construir un detector OOD mas estable que no dependa solo de la confianza del clasificador.',
      ar: 'بناء كاشف OOD أكثر ثباتاً لا يعتمد فقط على ثقة المصنف.',
    },
    role: {
      en: 'Master thesis author, modeling, experiments, evaluation, and analysis.',
      de: 'Autor der Masterarbeit, Modellierung, Experimente, Evaluation und Analyse.',
      fr: 'Auteur du memoire, modelisation, experiences, evaluation et analyse.',
      es: 'Autor de la tesis, modelado, experimentos, evaluacion y analisis.',
      ar: 'صاحب رسالة الماجستير: النمذجة والتجارب والتقييم والتحليل.',
    },
    approach: [
      'Train a binary conditional diffusion model and score reconstruction error under competing class conditions.',
      'Add class-conditional separation loss to push conditional noise predictions apart.',
      'Evaluate with multiple seeds and external zero-shot benchmarks instead of relying on one lucky run.',
    ],
    results: [
      '99.03% +/- 0.07% AUROC averaged over three seeds on CIFAR-10.',
      '+6.5 percentage points over the non-separated baseline.',
      'Seed-42 generalized zero-shot to CIFAR-100, Places365, FashionMNIST, Textures, and SVHN.',
    ],
    lessons: [
      'Stability matters almost as much as peak score.',
      'A result becomes more useful when variance is reported honestly.',
      'Cross-domain transfer should be tested, not assumed.',
    ],
    artifacts: [
      { label: 'Thesis PDF', href: '/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf' },
      { label: 'DiffusionOOD repository', href: 'https://github.com/ahmed-3m/DiffusionOOD' },
    ],
  },
  {
    slug: 'inkjet-ood',
    title: {
      en: 'InkjetOOD',
      de: 'InkjetOOD',
      fr: 'InkjetOOD',
      es: 'InkjetOOD',
      ar: 'InkjetOOD',
    },
    summary: {
      en: 'A public YOLO + conditional diffusion pipeline for industrial print-quality control evaluated on FTI_Zer0P.',
      de: 'Eine oeffentliche YOLO + Conditional-Diffusion-Pipeline fuer industrielle Druckqualitaetskontrolle auf FTI_Zer0P.',
      fr: 'Une pipeline publique YOLO + diffusion conditionnelle pour le controle qualite industriel sur FTI_Zer0P.',
      es: 'Una pipeline publica YOLO + difusion condicional para control de calidad industrial sobre FTI_Zer0P.',
      ar: 'خط عام يجمع بين YOLO ونموذج انتشار شرطي لمراقبة جودة الطباعة الصناعية على FTI_Zer0P.',
    },
    problem: {
      en: 'Transfer the generative-classification idea into a constrained industrial setting with limited data and multiple feature types.',
      de: 'Die generative Klassifikationsidee in ein eingeschraenktes industrielles Setting mit wenig Daten uebertragen.',
      fr: 'Transferer l idee de classification generative vers un contexte industriel contraint avec peu de donnees.',
      es: 'Transferir la idea de clasificacion generativa a un entorno industrial restringido con pocos datos.',
      ar: 'نقل فكرة التصنيف التوليدي إلى بيئة صناعية محدودة البيانات ومتعددة أنواع الميزات.',
    },
    role: {
      en: 'Machine vision researcher, evaluation owner, and public benchmark analyst.',
      de: 'Machine-Vision-Forscher, verantwortlich fuer Evaluation und Benchmark-Analyse.',
      fr: 'Chercheur en vision industrielle, responsable de l evaluation et de l analyse du benchmark.',
      es: 'Investigador de vision artificial, responsable de evaluacion y analisis del benchmark.',
      ar: 'باحث رؤية حاسوبية ومسؤول عن التقييم وتحليل الـ benchmark العام.',
    },
    approach: [
      'Use YOLOv8 features as structured visual input.',
      'Train a conditional diffusion model with feature-aware conditioning.',
      'Run strict 5-fold cross-validation and compare separation-loss settings under statistical correction.',
    ],
    results: [
      '0.8673 +/- 0.0230 AUROC baseline on the public FTI_Zer0P benchmark.',
      'Separation loss did not significantly improve this industrial dataset.',
      'The public result clarified the boundary conditions of the thesis method.',
    ],
    lessons: [
      'Industrial transfer needs more than code reuse.',
      'Feature-type heterogeneity changes model behavior.',
      'A null result can still be a strong research contribution.',
    ],
    artifacts: [
      { label: 'Industrial report PDF', href: '/Diffusion-Based Multi-class Defect Detection.pdf' },
      { label: 'InkjetOOD repository', href: 'https://github.com/ahmed-3m/InkjetOOD' },
      { label: 'Model weights', href: 'https://huggingface.co/ahmed-3m/InkjetOOD' },
    ],
  },
  {
    slug: 'faultrix',
    title: {
      en: 'Faultrix',
      de: 'Faultrix',
      fr: 'Faultrix',
      es: 'Faultrix',
      ar: 'Faultrix',
    },
    summary: {
      en: 'An AI-powered construction quality-control SaaS built solo from zero to production.',
      de: 'Ein KI-gestuetztes SaaS fuer Bauqualitaetskontrolle, solo von null bis Produktion gebaut.',
      fr: 'Un SaaS de controle qualite construction par IA construit en solo de zero a la production.',
      es: 'Un SaaS de control de calidad en construccion con IA construido en solitario de cero a produccion.',
      ar: 'منصة SaaS لمراقبة جودة البناء بالذكاء الاصطناعي بُنيت بشكل فردي من الصفر إلى الإنتاج.',
    },
    problem: {
      en: 'Turn research habits into a practical product that saves inspectors time and produces credible reports.',
      de: 'Forschungsgewohnheiten in ein praktisches Produkt verwandeln, das Inspektoren Zeit spart.',
      fr: 'Transformer une logique de recherche en produit pratique qui fait gagner du temps aux inspecteurs.',
      es: 'Convertir habitos de investigacion en un producto practico que ahorre tiempo a los inspectores.',
      ar: 'تحويل عقلية البحث إلى منتج عملي يوفر الوقت للمفتشين ويولد تقارير موثوقة.',
    },
    role: {
      en: 'Founder and full-stack builder across product, UX, AI workflow, and deployment.',
      de: 'Gruender und Full-Stack-Builder ueber Produkt, UX, AI-Workflow und Deployment hinweg.',
      fr: 'Fondateur et constructeur full-stack sur le produit, l UX, le workflow IA et le deploiement.',
      es: 'Fundador y constructor full-stack en producto, UX, flujo de IA y despliegue.',
      ar: 'المؤسس والباني الكامل للمنتج وUX وسير عمل الذكاء الاصطناعي والنشر.',
    },
    approach: [
      'Design a tight upload-to-report workflow around real construction use cases.',
      'Use OpenAI-powered analysis with structured outputs and evidence handling.',
      'Build the platform with Next.js, Convex, Clerk, Cloudflare R2, Stripe, Docker, and Python-heavy AI services.',
    ],
    results: [
      'Report generation in under 1 minute.',
      'A solo-built AI SaaS moved from idea to production in five months.',
      'The product became a concrete bridge between research discipline and commercial execution.',
    ],
    lessons: [
      'UX can matter more than model sophistication.',
      'Compliance and evidence handling shape trust.',
      'Shipping product means optimizing the path to value, not just the model output.',
    ],
    artifacts: [
      { label: 'Live product', href: 'https://faultrix.com' },
      { label: 'Blog post', href: '/blog/5-month-llm-adventure' },
    ],
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug)
}
