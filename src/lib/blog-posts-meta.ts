import { type Language } from '@/lib/i18n-config'

export interface BlogFaqItem {
  question: string
  answer: string
}

export interface BlogCitation {
  title: string
  date: string
  pdfUrl: string
}

export interface BlogPostMetaTranslation {
  title: string
  excerpt: string
  tags: string[]
  readingTime: string
  faq: BlogFaqItem[]
}

export interface BlogPostMeta {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
  citation?: BlogCitation
  translations: Partial<Record<Language, BlogPostMetaTranslation>> & { en: BlogPostMetaTranslation }
}

export interface LocalizedBlogPostMeta extends BlogPostMetaTranslation {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
  citation?: BlogCitation
}

export const blogPostsMeta: BlogPostMeta[] = [
  {
    "slug": "deterministic-guardrails-for-llm-and-agent-systems",
    "date": "2026-11-25",
    "ogImage": "/og-deterministic-guardrails.png",
    "lastModified": "2026-11-25",
    "translations": {
      "en": {
        "title": "Deterministic Guardrails for LLM and Agent Systems: Sihem's Arbiter and mergeproof",
        "excerpt": "Why probabilistic language models need deterministic boundaries around scheduling, state, and verification—illustrated through Sihem's generators-arbiter-composer pipeline and mergeproof's zero-LLM pull-request gate.",
        "tags": [
          "Agentic AI",
          "LLM Systems",
          "Deterministic Guardrails",
          "Sihem",
          "mergeproof",
          "Supabase"
        ],
        "readingTime": "9 min read",
        "faq": [
          {
            "question": "How does Sihem separate deterministic decisions from LLM generation?",
            "answer": "Sihem splits execution into generators, a deterministic arbiter, and a composer. Deterministic scheduling and trigger rules evaluate calendar shifts and routines before an LLM composes the Telegram or PWA check-in."
          },
          {
            "question": "What stage is Sihem currently in?",
            "answer": "Sihem is in invitation-only beta on Telegram (@sihem_ai_bot) and an installable PWA (sihem-pwa.pages.dev) within the tech2b incubator in Linz, alongside a native Android client (Kotlin/Jetpack Compose) in private testing."
          },
          {
            "question": "What does mergeproof check, and what are its limits?",
            "answer": "mergeproof (@ahmed-3m/mergeproof, zero dependencies, MIT) checks AI-written pull requests against configured deterministic merge requirements—such as flagging modified existing tests for human review—with 0 LLM calls. Passing deterministic checks does not guarantee defect-free code."
          }
        ]
      },
      "de": {
        "title": "Deterministische Guardrails für LLM- und Agentensysteme: Sihems Arbiter und mergeproof",
        "excerpt": "Warum probabilistische Sprachmodelle deterministische Grenzen bei Zeitplanung, Zustand und Verifikation brauchen – gezeigt an Sihems Generators-Arbiter-Composer-Pipeline und dem LLM-freien PR-Gate mergeproof.",
        "tags": [
          "Agentic AI",
          "LLM-Systeme",
          "Deterministische Guardrails",
          "Sihem",
          "mergeproof",
          "Supabase"
        ],
        "readingTime": "9 Min. Lesezeit",
        "faq": [
          {
            "question": "Wie trennt Sihem deterministische Entscheidungen von der LLM-Generierung?",
            "answer": "Sihem teilt die Ausführung in Generatoren, einen deterministischen Arbiter und einen Komponisten. Deterministische Planungs- und Trigger-Regeln prüfen Kalenderänderungen und Routinen, bevor ein LLM die Telegram- oder PWA-Nachricht formuliert."
          },
          {
            "question": "In welcher Phase befindet sich Sihem aktuell?",
            "answer": "Sihem läuft als Beta mit Einladung auf Telegram (@sihem_ai_bot) und als installierbare PWA (sihem-pwa.pages.dev) im tech2b-Inkubator in Linz; ein nativer Android-Client (Kotlin/Jetpack Compose) befindet sich im privaten Test."
          },
          {
            "question": "Was prüft mergeproof, und wo liegen die Grenzen?",
            "answer": "mergeproof (@ahmed-3m/mergeproof, ohne Abhängigkeiten, MIT) prüft KI-generierte Pull Requests gegen konfigurierte deterministische Merge-Anforderungen – etwa das Markieren geänderter bestehender Tests zur menschlichen Prüfung – mit 0 LLM-Aufrufen. Bestandene Prüfungen garantieren keinen fehlerfreien Code."
          }
        ]
      },
      "fr": {
        "title": "Garde-fous déterministes pour systèmes LLM et agents : l'arbitre de Sihem et mergeproof",
        "excerpt": "Pourquoi les modèles de langage probabilistes ont besoin de frontières déterministes pour la planification, l'état et la vérification — illustré par l'architecture générateurs-arbitre-compositeur de Sihem et le contrôle de PR sans LLM mergeproof.",
        "tags": [
          "IA agentique",
          "Systèmes LLM",
          "Garde-fous déterministes",
          "Sihem",
          "mergeproof",
          "Supabase"
        ],
        "readingTime": "9 min de lecture",
        "faq": [
          {
            "question": "Comment Sihem sépare-t-il les décisions déterministes de la génération LLM ?",
            "answer": "Sihem sépare l'exécution en générateurs, un arbitre déterministe et un compositeur. Des règles déterministes évaluent les changements d'agenda et les habitudes avant qu'un LLM ne rédige le message Telegram ou PWA."
          },
          {
            "question": "À quel stade se trouve Sihem actuellement ?",
            "answer": "Sihem est en bêta sur invitation sur Telegram (@sihem_ai_bot) et en PWA installable (sihem-pwa.pages.dev) au sein de l'incubateur tech2b à Linz, avec un client Android natif (Kotlin/Jetpack Compose) en test privé."
          },
          {
            "question": "Que vérifie mergeproof et quelles sont ses limites ?",
            "answer": "mergeproof (@ahmed-3m/mergeproof, zéro dépendance, licence MIT) vérifie les pull requests écrites par IA selon des critères de fusion déterministes — par exemple signaler les tests existants modifiés pour revue humaine — avec 0 appel LLM. Réussir ces vérifications ne garantit pas un code sans défaut."
          }
        ]
      },
      "es": {
        "title": "Controles deterministas para sistemas LLM y agentes: el árbitro de Sihem y mergeproof",
        "excerpt": "Por qué los modelos de lenguaje probabilísticos necesitan límites deterministas en planificación, estado y verificación, ilustrado con la arquitectura generadores-árbitro-compositor de Sihem y la puerta de PR sin LLM mergeproof.",
        "tags": [
          "IA agéntica",
          "Sistemas LLM",
          "Controles deterministas",
          "Sihem",
          "mergeproof",
          "Supabase"
        ],
        "readingTime": "9 min de lectura",
        "faq": [
          {
            "question": "¿Cómo separa Sihem las decisiones deterministas de la generación con LLM?",
            "answer": "Sihem divide la ejecución en generadores, un árbitro determinista y un compositor. Reglas deterministas evalúan los cambios de calendario y las rutinas antes de que un LLM redacte el aviso por Telegram o PWA."
          },
          {
            "question": "¿En qué fase se encuentra Sihem actualmente?",
            "answer": "Sihem está en beta por invitación en Telegram (@sihem_ai_bot) y como PWA instalable (sihem-pwa.pages.dev) dentro de la incubadora tech2b en Linz, junto con un cliente nativo de Android (Kotlin/Jetpack Compose) en pruebas privadas."
          },
          {
            "question": "¿Qué comprueba mergeproof y cuáles son sus límites?",
            "answer": "mergeproof (@ahmed-3m/mergeproof, cero dependencias, licencia MIT) valida pull requests escritos por IA frente a requisitos de fusión deterministas configurados —por ejemplo, marcar pruebas existentes modificadas para revisión humana— con 0 llamadas LLM. Superar estas comprobaciones no garantiza código sin errores."
          }
        ]
      },
      "ar": {
        "title": "الضوابط الحتمية لأنظمة LLM والوكلاء: محكّم Sihem وأداة mergeproof",
        "excerpt": "لماذا تحتاج نماذج اللغة الاحتمالية إلى حدود حتمية حول الجدولة والحالة والتحقق — كما يتضح في بنية المولدات والمحكّم والمؤلف في Sihem وبوابة فحص طلبات الدمج mergeproof الخالية من LLM.",
        "tags": [
          "الذكاء الوكيلي",
          "أنظمة LLM",
          "الضوابط الحتمية",
          "Sihem",
          "mergeproof",
          "Supabase"
        ],
        "readingTime": "9 دقائق قراءة",
        "faq": [
          {
            "question": "كيف يفصل Sihem القرارات الحتمية عن التوليد اللغوي؟",
            "answer": "يقسّم Sihem التنفيذ إلى مولدات ثم محكّم حتمي ثم مؤلف. تقيّم قواعد الجدولة والتنبيه الحتمية تغيرات التقويم والروتين قبل أن يصيغ النموذج اللغوي رسالة المتابعة على تيليجرام أو PWA."
          },
          {
            "question": "ما المرحلة الحالية لمشروع Sihem؟",
            "answer": "يعمل Sihem في نسخة تجريبية بدعوة على تيليجرام (@sihem_ai_bot) وتطبيق ويب قابل للتثبيت (sihem-pwa.pages.dev) ضمن حاضنة tech2b في لينتس، إلى جانب تطبيق أندرويد أصلي (Kotlin/Jetpack Compose) قيد الاختبار الخاص."
          },
          {
            "question": "ما الذي تفحصه أداة mergeproof وما حدودها؟",
            "answer": "تفحص mergeproof (@ahmed-3m/mergeproof، بدون تبعيات، ترخيص MIT) طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات دمج حتمية محددة — مثل تنبيه المراجع البشري عند تعديل اختبارات قائمة — بـ 0 استدعاءات LLM. اجتياز هذه الفحوص لا يضمن خلو الشيفرة من الأخطاء."
          }
        ]
      }
    }
  },
  {
    "slug": "ood-diffusion-thesis",
    "date": "2026-07-12",
    "ogImage": "/og-ood-diffusion-thesis.png",
    "lastModified": "2026-11-13",
    "citation": {
      "title": "Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control",
      "date": "2026-07-12",
      "pdfUrl": "https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf"
    },
    "translations": {
      "en": {
        "title": "How I Reached 99.03% AUROC on OOD Detection with Conditional Diffusion Models",
        "excerpt": "My master's thesis at JKU Linz introduced class-conditional separation loss into conditional diffusion models used as generative classifiers, reaching 99.03% +/- 0.07% AUROC on CIFAR-10 and adding a stable +6.5pp over the non-separated baseline.",
        "tags": [
          "Diffusion Models",
          "OOD Detection",
          "Deep Learning",
          "PyTorch",
          "CIFAR-10",
          "Generative Models"
        ],
        "readingTime": "14 min read",
        "faq": [
          {
            "question": "What result did the thesis achieve on CIFAR-10?",
            "answer": "The best averaged result was 99.03% +/- 0.07% AUROC across three seeds. Seed-42 reached 98.98% within-CIFAR and generalized zero-shot to five external OOD benchmarks."
          },
          {
            "question": "What is the separation loss?",
            "answer": "It is an extra training term that pushes the two class-conditional noise predictions apart, making the reconstruction-error gap more discriminative and much more stable across seeds."
          },
          {
            "question": "Why does this matter?",
            "answer": "It turns a seed-sensitive generative OOD detector into a much more reliable one, which matters if the method is meant to become a real safety layer instead of a one-off experiment."
          }
        ]
      },
      "de": {
        "title": "Wie ich mit konditionalen Diffusionsmodellen 99.03% AUROC für OOD-Erkennung erreicht habe",
        "excerpt": "Meine Masterarbeit an der JKU Linz führte eine class-conditional separation loss in konditionale Diffusionsmodelle als generative Klassifikatoren ein und erreichte 99.03% +/- 0.07% AUROC auf CIFAR-10 sowie einen stabilen Gewinn von +6.5 Prozentpunkten gegenüber der Basis ohne Separation.",
        "tags": [
          "Diffusionsmodelle",
          "OOD-Erkennung",
          "Deep Learning",
          "PyTorch",
          "CIFAR-10",
          "Generative Modelle"
        ],
        "readingTime": "14 Min. Lesezeit",
        "faq": [
          {
            "question": "Welches Ergebnis wurde auf CIFAR-10 erreicht?",
            "answer": "Der beste Mittelwert über drei Seeds lag bei 99.03% +/- 0.07% AUROC. Seed-42 erreichte 98.98% innerhalb von CIFAR und generalisierte zero-shot auf fünf externe OOD-Benchmarks."
          },
          {
            "question": "Was ist die Separation Loss?",
            "answer": "Das ist ein zusätzlicher Trainingsterm, der die beiden class-conditional noise predictions auseinanderzieht und damit die Rekonstruktionsfehler-Differenz klarer und stabiler macht."
          },
          {
            "question": "Warum ist das wichtig?",
            "answer": "Weil aus einem seed-sensitiven OOD-Detektor ein deutlich verlässlicherer wird. Genau diese Stabilität entscheidet, ob eine Methode später produktionsnah nutzbar ist."
          }
        ]
      },
      "fr": {
        "title": "Comment j'ai atteint 99.03% AUROC pour la détection OOD avec des modèles de diffusion conditionnels",
        "excerpt": "Mon mémoire de master à JKU Linz a introduit une class-conditional separation loss dans des modèles de diffusion conditionnels utilisés comme classificateurs génératifs, atteignant 99.03% +/- 0.07% AUROC sur CIFAR-10 avec un gain stable de +6.5 points face à la baseline sans séparation.",
        "tags": [
          "Modèles de diffusion",
          "Détection OOD",
          "Deep Learning",
          "PyTorch",
          "CIFAR-10",
          "Modèles génératifs"
        ],
        "readingTime": "14 min de lecture",
        "faq": [
          {
            "question": "Quel résultat a été obtenu sur CIFAR-10 ?",
            "answer": "Le meilleur résultat moyen sur trois seeds est de 99.03% +/- 0.07% AUROC. Le seed-42 a atteint 98.98% dans le split CIFAR et a généralisé zero-shot à cinq benchmarks externes."
          },
          {
            "question": "Qu'est-ce que la separation loss ?",
            "answer": "C'est un terme d'entraînement supplémentaire qui éloigne les deux prédictions conditionnelles de bruit pour rendre le score basé sur l'erreur de reconstruction plus discriminant et plus stable."
          },
          {
            "question": "Pourquoi ce résultat compte-t-il ?",
            "answer": "Parce qu'il transforme une méthode très sensible au seed en détecteur beaucoup plus fiable, ce qui est crucial si l'on veut utiliser la méthode comme vraie couche de sécurité."
          }
        ]
      },
      "es": {
        "title": "Cómo alcancé 99.03% AUROC en detección OOD con modelos de difusión condicional",
        "excerpt": "Mi tesis de máster en JKU Linz introdujo una class-conditional separation loss en modelos de difusión condicional usados como clasificadores generativos, alcanzando 99.03% +/- 0.07% AUROC en CIFAR-10 y una mejora estable de +6.5 puntos sobre la base sin separación.",
        "tags": [
          "Modelos de difusión",
          "Detección OOD",
          "Deep Learning",
          "PyTorch",
          "CIFAR-10",
          "Modelos generativos"
        ],
        "readingTime": "14 min de lectura",
        "faq": [
          {
            "question": "¿Qué resultado se logró en CIFAR-10?",
            "answer": "El mejor promedio sobre tres semillas fue 99.03% +/- 0.07% AUROC. La seed-42 logró 98.98% dentro de CIFAR y generalizó zero-shot a cinco benchmarks externos."
          },
          {
            "question": "¿Qué es la separation loss?",
            "answer": "Es un término extra de entrenamiento que separa las dos predicciones condicionales de ruido para que la diferencia de error de reconstrucción sea más clara y estable."
          },
          {
            "question": "¿Por qué importa este resultado?",
            "answer": "Porque convierte un detector generativo muy sensible a la semilla en uno mucho más confiable, algo clave si se quiere usar como capa real de seguridad."
          }
        ]
      },
      "ar": {
        "title": "كيف وصلت إلى 99.03% AUROC في كشف OOD باستخدام نماذج الانتشار الشرطية",
        "excerpt": "قدمت رسالتي في JKU Linz خسارة فصل شرطية داخل نماذج الانتشار الشرطية المستخدمة كمصنفات توليدية، وحققت 99.03% +/- 0.07% AUROC على CIFAR-10 مع تحسن ثابت قدره +6.5 نقطة مقارنة بالخط الأساسي من دون الفصل.",
        "tags": [
          "نماذج الانتشار",
          "كشف OOD",
          "التعلم العميق",
          "PyTorch",
          "CIFAR-10",
          "نماذج توليدية"
        ],
        "readingTime": "14 دقيقة قراءة",
        "faq": [
          {
            "question": "ما النتيجة التي حققتها الرسالة على CIFAR-10؟",
            "answer": "أفضل متوسط عبر ثلاث بذور كان 99.03% +/- 0.07% AUROC. أما seed-42 فحقق 98.98% داخل CIFAR وعمم zero-shot على خمسة benchmarks خارجية."
          },
          {
            "question": "ما هي separation loss؟",
            "answer": "هي حد إضافي في التدريب يدفع تنبؤي الضوضاء الشرطيين بعيداً عن بعضهما، بحيث تصبح فجوة خطأ إعادة البناء أوضح وأكثر ثباتاً."
          },
          {
            "question": "لماذا هذه النتيجة مهمة؟",
            "answer": "لأنها تحول كاشفاً حساساً جداً للبذرة إلى كاشف أكثر موثوقية، وهذا مهم إذا أردنا استخدامه كطبقة أمان حقيقية."
          }
        ]
      }
    }
  },
  {
    "slug": "diffusion-models-anomaly-detection",
    "date": "2024-11-20",
    "ogImage": "/og-diffusion-models-anomaly-detection.png",
    "lastModified": "2026-11-22",
    "translations": {
      "en": {
        "title": "Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH",
        "excerpt": "How I evaluated a two-stage YOLOv8m detector and conditional diffusion pipeline on the FTI_Zer0P benchmark under strict 5-fold image-level cross-validation, reaching a 0.8673 ± 0.0230 AUROC baseline and mapping where separation loss does not transfer.",
        "tags": [
          "Diffusion Models",
          "Anomaly Detection",
          "Industrial AI",
          "YOLOv8",
          "Quality Control"
        ],
        "readingTime": "11 min read",
        "faq": [
          {
            "question": "What result did the industrial system achieve?",
            "answer": "On the public FTI_Zer0P benchmark under strict 5-fold image-level CV across 573 source-image groups (6,408 128×128 crops), the λ = 0.0 baseline reached 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 accuracy, K=100)."
          },
          {
            "question": "What was the architecture?",
            "answer": "A two-stage pipeline: Stage 1 runs a YOLOv8m detector (25.86M params in yolo_best.pt; thesis PDF erratum prints YOLOv8n) to localize 8 print feature types into 128×128 crops, and Stage 2 runs a multi-head conditional diffusion U-Net (AdaGN) as the generative classifier."
          },
          {
            "question": "Did separation loss help here too?",
            "answer": "Not significantly. Across λ ∈ {0.01, 0.02, 0.05}, scores stayed within the cross-fold standard deviation and failed Holm-corrected significance testing — showing where natural-image gains stop transferring."
          }
        ]
      },
      "de": {
        "title": "Diffusionsmodelle für industrielle Defekterkennung bei PROFACTOR GmbH",
        "excerpt": "Wie ich eine zweistufige Pipeline aus YOLOv8m-Detektor und konditionalem Diffusionsmodell auf FTI_Zer0P unter strenger 5-facher bildbasierter Kreuzvalidierung evaluiert habe (0.8673 ± 0.0230 AUROC Baseline).",
        "tags": [
          "Diffusionsmodelle",
          "Anomalieerkennung",
          "Industrielle KI",
          "YOLOv8",
          "Qualitätskontrolle"
        ],
        "readingTime": "11 Min. Lesezeit",
        "faq": [
          {
            "question": "Welches Ergebnis erreichte das industrielle System?",
            "answer": "Auf dem öffentlichen FTI_Zer0P Benchmark unter strenger 5-facher bildbasierter Kreuzvalidierung über 573 Quellbild-Gruppen (6.408 128×128-Ausschnitte) erreichte die λ = 0.0 Baseline 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 Genauigkeit, K=100)."
          },
          {
            "question": "Wie sah die Architektur aus?",
            "answer": "Eine zweistufige Pipeline: Stufe 1 nutzt einen YOLOv8m-Detektor (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n), der 8 Druckmerkmalstypen in 128×128-Crops lokalisiert; Stufe 2 klassifiziert per Multi-Head-Konditional-Diffusion (AdaGN)."
          },
          {
            "question": "Half die Separation Loss auch hier?",
            "answer": "Nicht signifikant. Bei λ ∈ {0.01, 0.02, 0.05} blieben die Werte innerhalb der Fold-Streuung und zeigten nach Holm-Korrektur keinen signifikanten Vorteil."
          }
        ]
      },
      "fr": {
        "title": "Modèles de diffusion pour la détection de défauts industriels chez PROFACTOR GmbH",
        "excerpt": "Comment j'ai évalué une pipeline en deux étapes (détecteur YOLOv8m + diffusion conditionnelle) sur FTI_Zer0P avec validation croisée stricte par image source à 5 plis, obtenant une baseline de 0.8673 ± 0.0230 AUROC.",
        "tags": [
          "Modèles de diffusion",
          "Détection d'anomalie",
          "IA industrielle",
          "YOLOv8",
          "Contrôle qualité"
        ],
        "readingTime": "11 min de lecture",
        "faq": [
          {
            "question": "Quel résultat le système industriel a-t-il obtenu ?",
            "answer": "Sur le benchmark public FTI_Zer0P en validation croisée stricte par image source à 5 plis (573 groupes d’images, 6 408 crops 128×128), la baseline λ = 0.0 a atteint 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 d’exactitude, K=100)."
          },
          {
            "question": "Quelle était l'architecture ?",
            "answer": "Une pipeline en deux étapes : la phase 1 utilise un détecteur YOLOv8m (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) pour localiser 8 types de motifs en crops 128×128, et la phase 2 un U-Net de diffusion conditionnel multi-têtes (AdaGN)."
          },
          {
            "question": "La separation loss a-t-elle aidé ici aussi ?",
            "answer": "Pas de façon significative. Pour λ ∈ {0.01, 0.02, 0.05}, les scores restaient dans l'écart-type des plis après correction de Holm — montrant les limites du transfert inter-domaines."
          }
        ]
      },
      "es": {
        "title": "Modelos de difusión para detección de defectos industriales en PROFACTOR GmbH",
        "excerpt": "Cómo evalué una pipeline de dos etapas (detector YOLOv8m + difusión condicional) en el benchmark FTI_Zer0P bajo validación cruzada estricta de 5 folds a nivel de imagen, logrando una base de 0.8673 ± 0.0230 AUROC.",
        "tags": [
          "Modelos de difusión",
          "Detección de anomalías",
          "IA industrial",
          "YOLOv8",
          "Control de calidad"
        ],
        "readingTime": "11 min de lectura",
        "faq": [
          {
            "question": "¿Qué resultado logró el sistema industrial?",
            "answer": "En el benchmark público FTI_Zer0P bajo validación cruzada estricta de 5 folds a nivel de imagen (573 grupos fuente, 6.408 recortes 128×128), la base con λ = 0.0 alcanzó 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 de exactitud, K=100)."
          },
          {
            "question": "¿Cuál era la arquitectura?",
            "answer": "Una pipeline de dos etapas: la etapa 1 usa un detector YOLOv8m (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) para localizar 8 tipos de rasgos en recortes de 128×128, y la etapa 2 un U-Net de difusión condicional multi-cabeza (AdaGN)."
          },
          {
            "question": "¿La separation loss también ayudó aquí?",
            "answer": "No de forma significativa. Para λ ∈ {0.01, 0.02, 0.05}, los resultados quedaron dentro de la dispersión entre folds tras la corrección de Holm, delimitando el alcance de transferencia."
          }
        ]
      },
      "ar": {
        "title": "نماذج الانتشار لكشف العيوب الصناعية في PROFACTOR GmbH",
        "excerpt": "كيف قيّمت خطاً من مرحلتين يجمع بين كاشف YOLOv8m ونموذج انتشار شرطي على معيار FTI_Zer0P بتحقق تقاطعي صارم من 5 طيات على مستوى الصورة الأصلية، محقّقاً خط أساس 0.8673 ± 0.0230 AUROC.",
        "tags": [
          "نماذج الانتشار",
          "كشف الشذوذ",
          "الذكاء الاصطناعي الصناعي",
          "YOLOv8",
          "ضبط الجودة"
        ],
        "readingTime": "11 دقيقة قراءة",
        "faq": [
          {
            "question": "ما النتيجة التي حققها النظام الصناعي؟",
            "answer": "على معيار FTI_Zer0P العام مع تحقق تقاطعي صارم من 5 طيات على مستوى الصورة الأصلية عبر 573 مجموعة صور (6,408 قصاصات 128×128)، حقق خط الأساس عند λ = 0.0 مقياس 0.8673 ± 0.0230 AUROC (ودقة 0.8094 ± 0.0151، عند K=100)."
          },
          {
            "question": "ما هي البنية المستخدمة؟",
            "answer": "نظام من مرحلتين: المرحلة الأولى تستخدم كاشف YOLOv8m (بـ 25.86 مليون معامل في yolo_best.pt؛ ورد سهواً YOLOv8n في نص PDF الرسالة) لتحديد 8 أنواع من الميزات واقتصاصها بأبعاد 128×128، والمرحلة الثانية شبكة U-Net انتشارية شرطية متعددة الرؤوس (AdaGN)."
          },
          {
            "question": "هل ساعدت separation loss هنا أيضاً؟",
            "answer": "ليس بشكل ذي دلالة إحصائية. عند λ ∈ {0.01, 0.02, 0.05} بقيت النتائج ضمن تباين الطيات بعد تصحيح هولم، مما يوضح حدود انتقال المكاسب بين المجالات."
          }
        ]
      }
    }
  },
  {
    "slug": "computer-vision-yolo-mastery",
    "date": "2024-10-20",
    "ogImage": "/og-computer-vision-yolo-mastery.png",
    "lastModified": "2026-11-22",
    "translations": {
      "en": {
        "title": "YOLOv8m for Industrial Quality Control: Stage-1 Detection & Leakage-Free Splits",
        "excerpt": "Engineering notes on using YOLOv8m as a Stage-1 feature detector and 128×128 cropper across 573 source-image groups on FTI_Zer0P, plus why image-level 5-fold CV mattered more than model tweaks.",
        "tags": [
          "Computer Vision",
          "YOLOv8",
          "Industrial AI",
          "PyTorch",
          "Production ML"
        ],
        "readingTime": "10 min read",
        "faq": [
          {
            "question": "Why use YOLOv8m as a Stage-1 feature detector and cropper?",
            "answer": "Industrial inkjet frames (1920×1080) contain 8 localized feature types (dots, distances, edges, angle). Stage-1 YOLOv8m (25.86M params in yolo_best.pt; thesis PDF erratum prints YOLOv8n) detects and crops 6,408 normalized 128×128 patches across 573 source images so Stage 2 can score local anomalies cleanly."
          },
          {
            "question": "What did the strict 5-fold evaluation show on FTI_Zer0P?",
            "answer": "Under 5-fold stratified image-level cross-validation across the 573 source-image groups, the YOLO+CDM baseline reached 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 accuracy, K=100), with Dots at 0.9557 ± 0.0353 and Distance 6 at 0.9362 ± 0.0666."
          },
          {
            "question": "What mattered most?",
            "answer": "Source-image fold grouping to avoid crop leakage, per-feature evaluation, and reproducible Hydra + PyTorch Lightning runs mattered far more than architecture tuning."
          }
        ]
      },
      "de": {
        "title": "YOLOv8m für industrielle Qualitätskontrolle: Stufe-1-Detektion & saubere Splits",
        "excerpt": "Engineering-Notizen zum Einsatz von YOLOv8m als Stufe-1-Detektor für 6.408 128×128-Crops über 573 Quellbild-Gruppen auf FTI_Zer0P — und warum bildbasierte 5-fach-CV mehr zählte als Architektur-Tuning.",
        "tags": [
          "Computer Vision",
          "YOLOv8",
          "Industrielle KI",
          "PyTorch",
          "Production ML"
        ],
        "readingTime": "10 Min. Lesezeit",
        "faq": [
          {
            "question": "Warum YOLOv8m als Stufe-1-Merkmalsdetektor und Cropper einsetzen?",
            "answer": "Industrielle Inkjet-Aufnahmen (1920×1080) enthalten 8 lokale Merkmalstypen (Punkte, Abstände, Kanten, Winkel). Stufe 1 mit YOLOv8m (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n) erkennt und schneidet 6.408 normierte 128×128-Crops aus 573 Quellbildern für die nachgelagerte Anomaliebewertung."
          },
          {
            "question": "Was zeigte die strenge 5-fache Kreuzvalidierung auf FTI_Zer0P?",
            "answer": "Unter 5-facher stratifizierter bildbasierter CV über 573 Quellbild-Gruppen erreichte die YOLO+CDM-Baseline 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 Genauigkeit, K=100), mit Dots bei 0.9557 ± 0.0353 und Distance 6 bei 0.9362 ± 0.0666."
          },
          {
            "question": "Was war am wichtigsten?",
            "answer": "Gruppierung der Folds auf Quellbildebene zur Vermeidung von Data Leakage, Auswertung pro Merkmalstyp und reproduzierbare Hydra-/PyTorch-Lightning-Läufe waren wichtiger als Modell-Tuning."
          }
        ]
      },
      "fr": {
        "title": "YOLOv8m pour le contrôle qualité industriel : détection phase 1 et splits sans fuite",
        "excerpt": "Notes d'ingénierie sur l'utilisation de YOLOv8m comme détecteur de phase 1 (6 408 crops 128×128 sur 573 groupes d'images FTI_Zer0P) et pourquoi la validation croisée par image source a compté plus que le tuning.",
        "tags": [
          "Vision par ordinateur",
          "YOLOv8",
          "IA industrielle",
          "PyTorch",
          "Production ML"
        ],
        "readingTime": "10 min de lecture",
        "faq": [
          {
            "question": "Pourquoi utiliser YOLOv8m comme détecteur et recadreur en phase 1 ?",
            "answer": "Les images industrielles (1920×1080) contiennent 8 types de motifs locaux (points, distances, bords, angle). En phase 1, YOLOv8m (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) détecte et recadre 6 408 patchs 128×128 sur 573 images sources pour la phase 2 générative."
          },
          {
            "question": "Qu’a montré la validation croisée en 5 plis sur FTI_Zer0P ?",
            "answer": "En validation croisée stratifiée par image source sur 573 groupes, la baseline YOLO+CDM a atteint 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 d’exactitude, K=100), avec Dots à 0.9557 ± 0.0353 et Distance 6 à 0.9362 ± 0.0666."
          },
          {
            "question": "Qu'est-ce qui a le plus compté ?",
            "answer": "Le regroupement des plis par image source pour éviter les fuites, l’analyse par type de motif et des runs Hydra + PyTorch Lightning reproductibles ont compté plus que les ajustements d’architecture."
          }
        ]
      },
      "es": {
        "title": "YOLOv8m para control de calidad industrial: detección en etapa 1 y splits sin fugas",
        "excerpt": "Notas de ingeniería sobre YOLOv8m como detector de etapa 1 (6.408 recortes 128×128 en 573 grupos de FTI_Zer0P) y por qué la validación cruzada a nivel de imagen importó más que ajustar la arquitectura.",
        "tags": [
          "Visión por computador",
          "YOLOv8",
          "IA industrial",
          "PyTorch",
          "Production ML"
        ],
        "readingTime": "10 min de lectura",
        "faq": [
          {
            "question": "¿Por qué usar YOLOv8m como detector y recortador en la etapa 1?",
            "answer": "Los fotogramas industriales (1920×1080) contienen 8 tipos de rasgos locales (puntos, distancias, bordes, ángulo). En la etapa 1, YOLOv8m (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) detecta y recorta 6.408 parches de 128×128 desde 573 imágenes fuente para la etapa 2 generativa."
          },
          {
            "question": "¿Qué mostró la evaluación de 5 folds en FTI_Zer0P?",
            "answer": "Bajo validación cruzada estratificada de 5 folds a nivel de imagen (573 grupos), la base YOLO+CDM alcanzó 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 de exactitud, K=100), con Dots en 0.9557 ± 0.0353 y Distance 6 en 0.9362 ± 0.0666."
          },
          {
            "question": "¿Qué fue lo más importante?",
            "answer": "Agrupar los folds por imagen fuente para evitar fugas, analizar cada rasgo por separado y mantener ejecuciones reproducibles con Hydra y PyTorch Lightning."
          }
        ]
      },
      "ar": {
        "title": "YOLOv8m لمراقبة الجودة الصناعية: كشف المرحلة الأولى وتقسيم البيانات بلا تسرب",
        "excerpt": "ملاحظات هندسية حول استخدام YOLOv8m ككاشف للمرحلة الأولى (6,408 قصاصة 128×128 عبر 573 مجموعة صور في FTI_Zer0P)، ولماذا كان التحقق التقاطعي على مستوى الصورة أهم من تعديل البنية.",
        "tags": [
          "الرؤية الحاسوبية",
          "YOLOv8",
          "الذكاء الاصطناعي الصناعي",
          "PyTorch",
          "Production ML"
        ],
        "readingTime": "10 دقائق قراءة",
        "faq": [
          {
            "question": "لماذا استُخدم YOLOv8m ككاشف ومقتطع في المرحلة الأولى؟",
            "answer": "تحوي إطارات الطباعة الصناعية (1920×1080) 8 أنواع ميزات محلية (نقاط، مسافات، حواف، زاوية). يكتشف YOLOv8m في المرحلة الأولى (25.86 مليون معامل في yolo_best.pt؛ ورد سهواً YOLOv8n في نص PDF الرسالة) هذه المناطق ويقتطع 6,408 قصاصات 128×128 عبر 573 صورة أصلية للمرحلة الثانية."
          },
          {
            "question": "ماذا أظهر التقييم الخماسي الصارم على FTI_Zer0P؟",
            "answer": "بتحقق تقاطعي طبقي من 5 طيات على مستوى الصورة عبر 573 مجموعة، حقق خط الأساس YOLO+CDM مقياس 0.8673 ± 0.0230 AUROC (ودقة 0.8094 ± 0.0151، عند K=100)، مع 0.9557 ± 0.0353 لـ Dots و0.9362 ± 0.0666 لـ Distance 6."
          },
          {
            "question": "ما العامل الأهم فعلاً؟",
            "answer": "تجميع الطيات حسب الصورة الأصلية لمنع التسرب، وتقييم كل نوع ميزة على حدة، وتشغيلات Hydra وPyTorch Lightning القابلة لإعادة الإنتاج."
          }
        ]
      }
    }
  }
]

function localizePostMeta(post: BlogPostMeta, lang: Language = 'en'): LocalizedBlogPostMeta {
  const translation = post.translations[lang] ?? post.translations.en
  return {
    slug: post.slug,
    date: post.date,
    ogImage: post.ogImage,
    lastModified: post.lastModified,
    citation: post.citation,
    title: translation.title,
    excerpt: translation.excerpt,
    tags: translation.tags,
    readingTime: translation.readingTime,
    faq: translation.faq,
  }
}

export function getRawBlogPostsMeta(): BlogPostMeta[] {
  return [...blogPostsMeta].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPostMeta(slug: string, lang: Language = 'en'): LocalizedBlogPostMeta | undefined {
  const post = blogPostsMeta.find((p) => p.slug === slug)
  return post ? localizePostMeta(post, lang) : undefined
}

export function getAllBlogPostsMeta(lang: Language = 'en'): LocalizedBlogPostMeta[] {
  return getRawBlogPostsMeta().map((post) => localizePostMeta(post, lang))
}
