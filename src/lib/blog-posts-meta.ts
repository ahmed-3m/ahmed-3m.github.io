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
    "slug": "ood-diffusion-thesis",
    "date": "2026-07-12",
    "ogImage": "/og-diffusion-ood.png",
    "lastModified": "2026-04-25",
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
    "lastModified": "2026-04-25",
    "translations": {
      "en": {
        "title": "Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH",
        "excerpt": "How I evaluated a public YOLO + conditional diffusion pipeline on the FTI_Zer0P benchmark under strict 5-fold cross-validation, reaching a 0.8673 +/- 0.0230 AUROC baseline and learning where the method transfers and where it does not.",
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
            "answer": "On the public FTI_Zer0P benchmark, the strict 5-fold CV baseline reached 0.8673 +/- 0.0230 AUROC. Separately, an internal production deployment tracked 98.4% threshold-dependent binary classification accuracy (operational deployment metric, not comparable to public AUROC)."
          },
          {
            "question": "What was the architecture?",
            "answer": "YOLOv8 was used as a feature backbone, and a conditional diffusion model acted as the generative classifier. Multi-head conditioning handled the different inkjet feature types."
          },
          {
            "question": "Did separation loss help here too?",
            "answer": "Not significantly. That became one of the most honest findings of the work: the method transferred well across code and workflow, but not all gains transferred to this small industrial dataset."
          }
        ]
      },
      "de": {
        "title": "Diffusionsmodelle für industrielle Defekterkennung bei PROFACTOR GmbH",
        "excerpt": "Wie ich eine öffentliche YOLO + Conditional-Diffusion-Pipeline auf dem FTI_Zer0P Benchmark unter strenger 5-facher Kreuzvalidierung bewertet habe und eine Baseline von 0.8673 +/- 0.0230 AUROC erreicht wurde.",
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
            "answer": "Auf dem öffentlichen FTI_Zer0P Benchmark lag die strenge 5-fold-CV Baseline bei 0.8673 +/- 0.0230 AUROC. Davon getrennt erreichte das interne Produktions-Setup schwellenwertabhängig 98.4% binäre Defektklassifikationsgenauigkeit (keine öffentliche AUROC-Metrik)."
          },
          {
            "question": "Wie sah die Architektur aus?",
            "answer": "YOLOv8 wurde als Feature-Backbone genutzt und ein konditionales Diffusionsmodell übernahm die generative Klassifikation. Multi-Head Conditioning modellierte die verschiedenen Merkmalstypen."
          },
          {
            "question": "Half die Separation Loss auch hier?",
            "answer": "Nicht signifikant. Genau das war eine wichtige, ehrliche Erkenntnis: Workflow und Methodik übertrugen sich, aber nicht jeder Gewinn übertrug sich auf diesen kleinen industriellen Datensatz."
          }
        ]
      },
      "fr": {
        "title": "Modèles de diffusion pour la détection de défauts industriels chez PROFACTOR GmbH",
        "excerpt": "Comment j'ai évalué une pipeline publique YOLO + diffusion conditionnelle sur le benchmark FTI_Zer0P avec validation croisée stricte à 5 plis, obtenant une baseline de 0.8673 +/- 0.0230 AUROC.",
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
            "answer": "Sur le benchmark public FTI_Zer0P, la baseline en validation croisée stricte à 5 plis a atteint 0.8673 +/- 0.0230 AUROC. Séparément, le déploiement interne a mesuré 98.4% de précision binaire dépendante du seuil (métrique opérationnelle, non comparable à l'AUROC public)."
          },
          {
            "question": "Quelle était l'architecture ?",
            "answer": "YOLOv8 servait de backbone de features et un modèle de diffusion conditionnel jouait le rôle de classificateur génératif. Le multi-head conditioning gérait les différents types de motifs inkjet."
          },
          {
            "question": "La separation loss a-t-elle aidé ici aussi ?",
            "answer": "Pas de façon significative. C'est justement une conclusion utile et honnête : la méthode se transfère, mais pas tous les gains."
          }
        ]
      },
      "es": {
        "title": "Modelos de difusión para detección de defectos industriales en PROFACTOR GmbH",
        "excerpt": "Cómo evalué una pipeline pública YOLO + difusión condicional en el benchmark FTI_Zer0P con validación cruzada estricta de 5 folds, logrando una base de 0.8673 +/- 0.0230 AUROC.",
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
            "answer": "En el benchmark público FTI_Zer0P, la base con validación cruzada estricta de 5 folds alcanzó 0.8673 +/- 0.0230 AUROC. Por separado, en producción interna se registró 98.4% de precisión binaria dependiente del umbral (métrica operativa, no comparable al AUROC público)."
          },
          {
            "question": "¿Cuál era la arquitectura?",
            "answer": "YOLOv8 se usó como backbone de features y un modelo de difusión condicional actuó como clasificador generativo. Multi-head conditioning manejó los distintos tipos de features de inkjet."
          },
          {
            "question": "¿La separation loss también ayudó aquí?",
            "answer": "No de forma significativa. Esa fue una conclusión muy útil: el método se transfirió, pero no todos los beneficios pasaron a este pequeño dataset industrial."
          }
        ]
      },
      "ar": {
        "title": "نماذج الانتشار لكشف العيوب الصناعية في PROFACTOR GmbH",
        "excerpt": "كيف قمت بتقييم خط عام يجمع بين YOLO ونموذج انتشار شرطي على benchmark FTI_Zer0P مع تحقق تقاطعي صارم من 5 طيات، وحققت baseline قدرها 0.8673 +/- 0.0230 AUROC.",
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
            "answer": "على معيار FTI_Zer0P العام وصلت baseline مع تحقق تقاطعي صارم من 5 طيات إلى 0.8673 +/- 0.0230 AUROC. وبشكل منفصل، سجّل التشغيل الداخلي دقة تصنيف ثنائية 98.4% تعتمد على العتبة (مقياس تشغيلي داخلي غير قابل للمقارنة مع AUROC العام)."
          },
          {
            "question": "ما هي البنية المستخدمة؟",
            "answer": "استُخدم YOLOv8 كبنية لاستخراج الميزات، بينما عمل نموذج الانتشار الشرطي كمصنف توليدي. كما استُخدم multi-head conditioning للتعامل مع أنواع الميزات المختلفة."
          },
          {
            "question": "هل ساعدت separation loss هنا أيضاً؟",
            "answer": "ليس بشكل ذي دلالة. وكانت هذه من أكثر النتائج صدقاً في العمل: المنهجية انتقلت، لكن ليس كل المكاسب انتقلت إلى هذا dataset الصناعي الصغير."
          }
        ]
      }
    }
  },
  {
    "slug": "computer-vision-yolo-mastery",
    "date": "2024-10-20",
    "ogImage": "/og-computer-vision-yolo-mastery.png",
    "lastModified": "2026-04-25",
    "translations": {
      "en": {
        "title": "YOLOv8 for Industrial Quality Control: Decisions That Actually Moved the Needle",
        "excerpt": "A practical post-mortem on the architecture, data strategy, and deployment decisions that mattered in industrial inkjet quality control, instead of another generic YOLO tutorial.",
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
            "question": "Why use YOLO as a feature extractor and not as a detector?",
            "answer": "Because the task was not natural object detection. The feature types behaved more like structured visual signatures than bounding-box objects, so the backbone features were more useful than the detector head."
          },
          {
            "question": "What latency did the deployed system reach?",
            "answer": "Around 35 ms per component in the final production-friendly configuration, which stayed within the edge constraint."
          },
          {
            "question": "What mattered most?",
            "answer": "Data discipline, fold design, and choosing a stable deployment path mattered more than chasing the fanciest architecture variant."
          }
        ]
      },
      "de": {
        "title": "YOLOv8 für industrielle Qualitätskontrolle: Entscheidungen, die wirklich etwas verändert haben",
        "excerpt": "Ein praxisnahes Post-Mortem über Architektur, Datenstrategie und Deployment-Entscheidungen in industrieller Inkjet-Qualitätskontrolle statt eines weiteren allgemeinen YOLO-Tutorials.",
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
            "question": "Warum YOLO als Feature-Extractor und nicht als Detektor?",
            "answer": "Weil die Aufgabe keine klassische Objekterkennung war. Die Merkmalstypen verhielten sich eher wie strukturierte visuelle Signaturen als wie Bounding-Box-Objekte."
          },
          {
            "question": "Welche Latenz erreichte das System?",
            "answer": "Etwa 35 ms pro Komponente in der finalen produktionsnahen Konfiguration, also innerhalb der Edge-Vorgabe."
          },
          {
            "question": "Was war am wichtigsten?",
            "answer": "Datendisziplin, Fold-Design und ein stabiles Deployment waren wichtiger als die schickste Architekturvariante."
          }
        ]
      },
      "fr": {
        "title": "YOLOv8 pour le contrôle qualité industriel : les décisions qui ont vraiment compté",
        "excerpt": "Un retour pratique sur les choix d'architecture, de données et de déploiement qui ont compté en contrôle qualité inkjet industriel, au lieu d'un tutoriel YOLO générique.",
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
            "question": "Pourquoi utiliser YOLO comme extracteur de features et non comme détecteur ?",
            "answer": "Parce que la tâche n'était pas une détection d'objets classique. Les types de feature ressemblaient davantage à des signatures visuelles structurées qu'à des objets en bounding box."
          },
          {
            "question": "Quelle latence a été atteinte ?",
            "answer": "Environ 35 ms par composant dans la configuration finale compatible production edge."
          },
          {
            "question": "Qu'est-ce qui a le plus compté ?",
            "answer": "La discipline sur les données, le design des folds et un chemin de déploiement stable ont compté plus qu'une architecture à la mode."
          }
        ]
      },
      "es": {
        "title": "YOLOv8 para control de calidad industrial: decisiones que realmente movieron la aguja",
        "excerpt": "Un post-mortem práctico sobre las decisiones de arquitectura, datos y despliegue que importaron en control de calidad inkjet industrial, en lugar de otro tutorial genérico de YOLO.",
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
            "question": "¿Por qué usar YOLO como extractor de features y no como detector?",
            "answer": "Porque la tarea no era detección clásica de objetos. Los tipos de feature se comportaban más como firmas visuales estructuradas que como objetos en bounding boxes."
          },
          {
            "question": "¿Qué latencia alcanzó el sistema?",
            "answer": "Alrededor de 35 ms por componente en la configuración final apta para producción edge."
          },
          {
            "question": "¿Qué fue lo más importante?",
            "answer": "La disciplina de datos, el diseño de folds y un camino de despliegue estable importaron más que perseguir la arquitectura más llamativa."
          }
        ]
      },
      "ar": {
        "title": "YOLOv8 لمراقبة الجودة الصناعية: القرارات التي أحدثت الفرق فعلاً",
        "excerpt": "مراجعة عملية لقرارات البنية والبيانات والنشر التي أثرت فعلاً في جودة الطباعة الصناعية، بدلاً من تكرار شرح YOLO العام.",
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
            "question": "لماذا استخدمت YOLO كمستخرج ميزات وليس ككاشف فقط؟",
            "answer": "لأن المهمة لم تكن كشف أجسام تقليدي. أنواع الميزات كانت أقرب إلى إشارات بصرية منظمة منها إلى أجسام ضمن bounding boxes."
          },
          {
            "question": "ما زمن الاستدلال الذي وصل إليه النظام؟",
            "answer": "حوالي 35 مللي ثانية لكل مكوّن في الإعداد النهائي المناسب للتشغيل على edge."
          },
          {
            "question": "ما العامل الأهم فعلاً؟",
            "answer": "الانضباط في البيانات، وتصميم الطيات، ومسار نشر ثابت كان أهم من مطاردة أكثر نسخة معمارية لامعة."
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
