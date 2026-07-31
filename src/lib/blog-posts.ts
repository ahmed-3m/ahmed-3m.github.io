import { type Language } from '@/lib/i18n-config'

export interface BlogFaqItem {
  question: string
  answer: string
}

export interface BlogPostTranslation {
  title: string
  excerpt: string
  tags: string[]
  content: string
  readingTime: string
  faq: BlogFaqItem[]
}

export interface BlogPost {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
  translations: Partial<Record<Language, BlogPostTranslation>> & { en: BlogPostTranslation }
}

export interface LocalizedBlogPost extends BlogPostTranslation {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
}

const blogPosts: BlogPost[] = [
  {
    slug: 'ood-diffusion-thesis',
    date: '2026-07-12',
    ogImage: '/og-diffusion-models-anomaly-detection.png',
    lastModified: '2026-04-25',
    translations: {
      en: {
        title: 'How I Reached 99.03% AUROC on OOD Detection with Conditional Diffusion Models',
        excerpt:
          "My master's thesis at JKU Linz introduced class-conditional separation loss into conditional diffusion models used as generative classifiers, reaching 99.03% +/- 0.07% AUROC on CIFAR-10 and adding a stable +6.5pp over the non-separated baseline.",
        tags: ['Diffusion Models', 'OOD Detection', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Models'],
        readingTime: '14 min read',
        faq: [
          {
            question: 'What result did the thesis achieve on CIFAR-10?',
            answer:
              'The best averaged result was 99.03% +/- 0.07% AUROC across three seeds. Seed-42 reached 98.98% within-CIFAR and generalized zero-shot to five external OOD benchmarks.',
          },
          {
            question: 'What is the separation loss?',
            answer:
              'It is an extra training term that pushes the two class-conditional noise predictions apart, making the reconstruction-error gap more discriminative and much more stable across seeds.',
          },
          {
            question: 'Why does this matter?',
            answer:
              'It turns a seed-sensitive generative OOD detector into a much more reliable one, which matters if the method is meant to become a real safety layer instead of a one-off experiment.',
          },
        ],
        content: `
## The Problem

Out-of-distribution detection is the part of a system that says, "this input does not belong to what I was trained on." In practice that means catching unusual inputs before a model makes a confident wrong decision. For any safety-relevant AI pipeline, that ability matters as much as raw accuracy.

In my master's thesis at JKU Linz, supervised by Prof. Sepp Hochreiter and Claus Hofmann, I studied whether a **conditional diffusion model** can act as a **generative classifier** for OOD detection instead of just generating images.

## The Core Idea

The model reconstructs an image under two competing class conditions. If the image is truly in-distribution, the matching condition should reconstruct it better. If the image is unusual, both explanations should struggle and the reconstruction gap becomes the anomaly signal.

The baseline already worked, but it had a frustrating weakness: it was highly seed-sensitive. At $lambda = 0.0$, the average AUROC was **92.52% +/- 11.07%**, which means some seeds looked excellent and some collapsed badly.

## My Contribution: Separation Loss

I introduced a **class-conditional separation loss** that pushes the conditional noise predictions apart during training:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

The point is simple: if the two explanations become more distinct, the reconstruction-error difference becomes clearer. That makes the OOD score easier to trust.

## Results

The best setting was **lambda = 0.02**. Averaged across three independent seeds, it reached:

- **99.03% +/- 0.07% AUROC** on CIFAR-10
- **+6.5 percentage points** over the non-separated baseline
- much lower variance than the baseline

For a concrete reproducible run, seed-42 achieved:

- **98.98% AUROC** on the within-CIFAR split
- **90.50%-96.97%** zero-shot generalization across CIFAR-100, Places365, FashionMNIST, Textures, and SVHN

## Why I Care About This Result

The important part is not only that the score went up. The important part is that the variance collapsed. Moving from a fragile 92.52% +/- 11.07% to a stable 99.03% +/- 0.07% is the difference between "interesting research result" and "plausible building block for a real safety system."

## Cross-Domain Reality Check

I also transferred the same idea to industrial print-quality control on the public FTI_Zer0P benchmark. There, the crop-based YOLO + CDM baseline reached **0.8673 +/- 0.0230 AUROC** under strict 5-fold cross-validation, while separation loss did **not** significantly improve performance after Holm correction.

That was a valuable result too. It showed that the mechanism transfers strongly in semantic image space like CIFAR-10, but not automatically to small, texture-heavy manufacturing data. Knowing where a method stops helping is part of doing honest research.

## Stack and Artifacts

- PyTorch + PyTorch Lightning
- DDPM U-Net with class conditioning
- Hydra + Weights & Biases
- JKU GPU infrastructure

Public artifacts:

- Thesis PDF: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code: https://github.com/ahmed-3m/DiffusionOOD
- Industrial transfer: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      de: {
        title: 'Wie ich mit konditionalen Diffusionsmodellen 99.03% AUROC für OOD-Erkennung erreicht habe',
        excerpt:
          'Meine Masterarbeit an der JKU Linz führte eine class-conditional separation loss in konditionale Diffusionsmodelle als generative Klassifikatoren ein und erreichte 99.03% +/- 0.07% AUROC auf CIFAR-10 sowie einen stabilen Gewinn von +6.5 Prozentpunkten gegenüber der Basis ohne Separation.',
        tags: ['Diffusionsmodelle', 'OOD-Erkennung', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Modelle'],
        readingTime: '14 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis wurde auf CIFAR-10 erreicht?',
            answer:
              'Der beste Mittelwert über drei Seeds lag bei 99.03% +/- 0.07% AUROC. Seed-42 erreichte 98.98% innerhalb von CIFAR und generalisierte zero-shot auf fünf externe OOD-Benchmarks.',
          },
          {
            question: 'Was ist die Separation Loss?',
            answer:
              'Das ist ein zusätzlicher Trainingsterm, der die beiden class-conditional noise predictions auseinanderzieht und damit die Rekonstruktionsfehler-Differenz klarer und stabiler macht.',
          },
          {
            question: 'Warum ist das wichtig?',
            answer:
              'Weil aus einem seed-sensitiven OOD-Detektor ein deutlich verlässlicherer wird. Genau diese Stabilität entscheidet, ob eine Methode später produktionsnah nutzbar ist.',
          },
        ],
        content: `
## Das Problem

OOD-Erkennung ist der Teil eines Systems, der sagt: "Dieses Eingabebeispiel gehört nicht zu dem, worauf ich trainiert wurde." In sicherheitskritischen Anwendungen ist das genauso wichtig wie die eigentliche Klassifikationsleistung.

In meiner Masterarbeit an der JKU Linz, betreut von Prof. Sepp Hochreiter und Claus Hofmann, habe ich untersucht, ob ein **konditionales Diffusionsmodell** als **generativer Klassifikator** für OOD-Erkennung eingesetzt werden kann.

## Die Grundidee

Das Modell rekonstruiert ein Bild unter zwei konkurrierenden Klassenbedingungen. Wenn das Bild wirklich zur Verteilung gehört, sollte die passende Bedingung besser rekonstruieren. Ist das Bild ungewöhnlich, werden beide Erklärungen schlechter und die Lücke im Rekonstruktionsfehler wird zum Anomaliesignal.

Die Basisvariante funktionierte bereits, hatte aber ein ernstes Problem: starke Seed-Abhängigkeit. Bei $lambda = 0.0$ lag der Mittelwert nur bei **92.52% +/- 11.07% AUROC**. Einige Seeds sahen sehr gut aus, andere brachen deutlich ein.

## Mein Beitrag: Separation Loss

Ich habe eine **class-conditional separation loss** eingeführt, die die konditionalen Noise-Vorhersagen während des Trainings auseinanderdrückt:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Wenn die beiden Erklärungen klarer getrennt sind, wird auch die Rekonstruktionsfehler-Differenz klarer. Genau dadurch wird der OOD-Score robuster.

## Ergebnisse

Die beste Einstellung war **lambda = 0.02**. Über drei unabhängige Seeds ergab sich:

- **99.03% +/- 0.07% AUROC** auf CIFAR-10
- **+6.5 Prozentpunkte** gegenüber der Basis ohne Separation
- deutlich geringere Varianz

Ein reproduzierbarer Seed-42 Lauf erreichte:

- **98.98% AUROC** im within-CIFAR Setting
- **90.50%-96.97%** zero-shot Generalisierung auf CIFAR-100, Places365, FashionMNIST, Textures und SVHN

## Warum dieses Ergebnis wichtig ist

Entscheidend ist nicht nur der höhere Score. Entscheidend ist der starke Rückgang der Varianz. Der Schritt von 92.52% +/- 11.07% zu 99.03% +/- 0.07% trennt eine interessante Idee von einer deutlich glaubwürdigeren Sicherheitskomponente.

## Transfer in die Industrie

Ich habe denselben Ansatz auch auf industrielle Druckqualitätskontrolle mit dem öffentlichen FTI_Zer0P Benchmark übertragen. Dort erreichte die crop-basierte YOLO + CDM Basis **0.8673 +/- 0.0230 AUROC** unter strenger 5-facher Kreuzvalidierung, während die Separation Loss nach Holm-Korrektur **keine** signifikante Verbesserung brachte.

Auch das war ein wichtiges Ergebnis. Es zeigt, dass der Mechanismus in semantischen Bildräumen wie CIFAR-10 stark hilft, aber nicht automatisch auf kleine, texturlastige Produktionsdaten übergeht.

## Stack und Artefakte

- PyTorch + PyTorch Lightning
- DDPM U-Net mit Klassenkonditionierung
- Hydra + Weights & Biases
- JKU GPU-Infrastruktur

Öffentliche Artefakte:

- Thesis PDF: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code: https://github.com/ahmed-3m/DiffusionOOD
- Industrieller Transfer: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: "Comment j'ai atteint 99.03% AUROC pour la détection OOD avec des modèles de diffusion conditionnels",
        excerpt:
          "Mon mémoire de master à JKU Linz a introduit une class-conditional separation loss dans des modèles de diffusion conditionnels utilisés comme classificateurs génératifs, atteignant 99.03% +/- 0.07% AUROC sur CIFAR-10 avec un gain stable de +6.5 points face à la baseline sans séparation.",
        tags: ['Modèles de diffusion', 'Détection OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modèles génératifs'],
        readingTime: '14 min de lecture',
        faq: [
          {
            question: 'Quel résultat a été obtenu sur CIFAR-10 ?',
            answer:
              'Le meilleur résultat moyen sur trois seeds est de 99.03% +/- 0.07% AUROC. Le seed-42 a atteint 98.98% dans le split CIFAR et a généralisé zero-shot à cinq benchmarks externes.',
          },
          {
            question: "Qu'est-ce que la separation loss ?",
            answer:
              "C'est un terme d'entraînement supplémentaire qui éloigne les deux prédictions conditionnelles de bruit pour rendre le score basé sur l'erreur de reconstruction plus discriminant et plus stable.",
          },
          {
            question: 'Pourquoi ce résultat compte-t-il ?',
            answer:
              "Parce qu'il transforme une méthode très sensible au seed en détecteur beaucoup plus fiable, ce qui est crucial si l'on veut utiliser la méthode comme vraie couche de sécurité.",
          },
        ],
        content: `
## Le problème

La détection out-of-distribution est la capacité d'un système à dire : "cette entrée ne ressemble pas à ce que j'ai vu pendant l'entraînement". Dans un système IA réel, cette capacité est une propriété de sûreté, pas un détail annexe.

Dans mon mémoire de master à JKU Linz, sous la supervision du Prof. Sepp Hochreiter et de Claus Hofmann, j'ai étudié si un **modèle de diffusion conditionnel** pouvait jouer le rôle d'un **classificateur génératif** pour la détection OOD.

## L'idée centrale

Le modèle reconstruit une image sous deux conditions de classe concurrentes. Si l'image est normale, la bonne condition doit mieux la reconstruire. Si l'image est inhabituelle, les deux explications se dégradent et l'écart entre les erreurs de reconstruction devient le signal d'anomalie.

La baseline fonctionnait déjà, mais avec une forte sensibilité au seed. À $lambda = 0.0$, la moyenne n'était que de **92.52% +/- 11.07% AUROC**.

## Ma contribution : la separation loss

J'ai introduit une **class-conditional separation loss** qui pousse les prédictions conditionnelles de bruit à s'éloigner :

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Le principe est simple : des explications mieux séparées produisent un écart d'erreur de reconstruction plus lisible, donc un score OOD plus robuste.

## Résultats

Le meilleur réglage était **lambda = 0.02**. Sur trois seeds indépendants :

- **99.03% +/- 0.07% AUROC** sur CIFAR-10
- **+6.5 points** face à la baseline sans séparation
- une variance très fortement réduite

Le seed-42 a atteint :

- **98.98% AUROC** dans le cadre within-CIFAR
- **90.50%-96.97%** de généralisation zero-shot sur CIFAR-100, Places365, FashionMNIST, Textures et SVHN

## Pourquoi ce résultat est fort

Le point clé n'est pas seulement l'augmentation du score. C'est surtout l'effondrement de la variance. Passer de 92.52% +/- 11.07% à 99.03% +/- 0.07% signifie passer d'une méthode fragile à une approche bien plus crédible pour une utilisation réelle.

## Transfert vers l'industrie

J'ai ensuite appliqué la même idée à l'inspection de qualité industrielle sur le benchmark public FTI_Zer0P. La baseline YOLO + CDM sur crops a obtenu **0.8673 +/- 0.0230 AUROC** en validation croisée stricte à 5 plis, tandis que la separation loss n'a pas apporté d'amélioration statistiquement significative après correction de Holm.

Ce résultat est important lui aussi : l'idée transfère très bien dans un espace sémantique comme CIFAR-10, mais pas automatiquement vers des textures industrielles fines et peu abondantes.

## Stack et artefacts

- PyTorch + PyTorch Lightning
- DDPM U-Net conditionnel
- Hydra + Weights & Biases
- Infrastructure GPU JKU

Artefacts publics :

- Mémoire PDF : https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code : https://github.com/ahmed-3m/DiffusionOOD
- Transfert industriel : https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Cómo alcancé 99.03% AUROC en detección OOD con modelos de difusión condicional',
        excerpt:
          'Mi tesis de máster en JKU Linz introdujo una class-conditional separation loss en modelos de difusión condicional usados como clasificadores generativos, alcanzando 99.03% +/- 0.07% AUROC en CIFAR-10 y una mejora estable de +6.5 puntos sobre la base sin separación.',
        tags: ['Modelos de difusión', 'Detección OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modelos generativos'],
        readingTime: '14 min de lectura',
        faq: [
          {
            question: '¿Qué resultado se logró en CIFAR-10?',
            answer:
              'El mejor promedio sobre tres semillas fue 99.03% +/- 0.07% AUROC. La seed-42 logró 98.98% dentro de CIFAR y generalizó zero-shot a cinco benchmarks externos.',
          },
          {
            question: '¿Qué es la separation loss?',
            answer:
              'Es un término extra de entrenamiento que separa las dos predicciones condicionales de ruido para que la diferencia de error de reconstrucción sea más clara y estable.',
          },
          {
            question: '¿Por qué importa este resultado?',
            answer:
              'Porque convierte un detector generativo muy sensible a la semilla en uno mucho más confiable, algo clave si se quiere usar como capa real de seguridad.',
          },
        ],
        content: `
## El problema

La detección out-of-distribution es la capacidad de un sistema para decir: "esta entrada no pertenece a lo que vi durante el entrenamiento". En un sistema de IA real, eso es una propiedad de seguridad.

En mi tesis de máster en JKU Linz, bajo la supervisión del Prof. Sepp Hochreiter y Claus Hofmann, estudié si un **modelo de difusión condicional** podía usarse como **clasificador generativo** para detección OOD.

## La idea central

El modelo reconstruye una imagen bajo dos condiciones de clase rivales. Si la imagen es normal, la condición correcta debe reconstruirla mejor. Si la imagen es rara, ambas explicaciones fallan y la brecha entre errores de reconstrucción se vuelve la señal de anomalía.

La versión base ya funcionaba, pero tenía un problema serio: mucha sensibilidad a la semilla. Con $lambda = 0.0$, el promedio fue **92.52% +/- 11.07% AUROC**.

## Mi contribución: separation loss

Introduje una **class-conditional separation loss** que empuja a separar las predicciones condicionales de ruido:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Si las dos explicaciones son más distintas, la diferencia de error de reconstrucción es más clara y el puntaje OOD se vuelve más robusto.

## Resultados

La mejor configuración fue **lambda = 0.02**. En tres semillas independientes:

- **99.03% +/- 0.07% AUROC** en CIFAR-10
- **+6.5 puntos porcentuales** sobre la base sin separación
- una varianza mucho menor

La seed-42 logró:

- **98.98% AUROC** en el escenario within-CIFAR
- **90.50%-96.97%** de generalización zero-shot en CIFAR-100, Places365, FashionMNIST, Textures y SVHN

## Por qué este resultado es importante

Lo importante no es solo subir el puntaje. Lo importante es reducir drásticamente la varianza. Pasar de 92.52% +/- 11.07% a 99.03% +/- 0.07% significa pasar de una heurística frágil a un componente de seguridad mucho más creíble.

## Transferencia industrial

También apliqué la misma idea al control de calidad industrial en el benchmark público FTI_Zer0P. Allí, la base YOLO + CDM por crops obtuvo **0.8673 +/- 0.0230 AUROC** con validación cruzada estricta de 5 folds, mientras que la separation loss no mejoró de forma significativa tras la corrección de Holm.

Ese resultado también fue valioso. Mostró que el mecanismo ayuda mucho en espacios semánticos como CIFAR-10, pero no se transfiere automáticamente a texturas industriales pequeñas y complejas.

## Stack y artefactos

- PyTorch + PyTorch Lightning
- DDPM U-Net condicionado por clase
- Hydra + Weights & Biases
- Infraestructura GPU de JKU

Artefactos públicos:

- PDF de tesis: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Codigo: https://github.com/ahmed-3m/DiffusionOOD
- Transferencia industrial: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      ar: {
        title: 'كيف وصلت إلى 99.03% AUROC في كشف OOD باستخدام نماذج الانتشار الشرطية',
        excerpt:
          'قدمت رسالتي في JKU Linz خسارة فصل شرطية داخل نماذج الانتشار الشرطية المستخدمة كمصنفات توليدية، وحققت 99.03% +/- 0.07% AUROC على CIFAR-10 مع تحسن ثابت قدره +6.5 نقطة مقارنة بالخط الأساسي من دون الفصل.',
        tags: ['نماذج الانتشار', 'كشف OOD', 'التعلم العميق', 'PyTorch', 'CIFAR-10', 'نماذج توليدية'],
        readingTime: '14 دقيقة قراءة',
        faq: [
          {
            question: 'ما النتيجة التي حققتها الرسالة على CIFAR-10؟',
            answer:
              'أفضل متوسط عبر ثلاث بذور كان 99.03% +/- 0.07% AUROC. أما seed-42 فحقق 98.98% داخل CIFAR وعمم zero-shot على خمسة benchmarks خارجية.',
          },
          {
            question: 'ما هي separation loss؟',
            answer:
              'هي حد إضافي في التدريب يدفع تنبؤي الضوضاء الشرطيين بعيداً عن بعضهما، بحيث تصبح فجوة خطأ إعادة البناء أوضح وأكثر ثباتاً.',
          },
          {
            question: 'لماذا هذه النتيجة مهمة؟',
            answer:
              'لأنها تحول كاشفاً حساساً جداً للبذرة إلى كاشف أكثر موثوقية، وهذا مهم إذا أردنا استخدامه كطبقة أمان حقيقية.',
          },
        ],
        content: `
## المشكلة

كشف out-of-distribution هو الجزء الذي يقول: "هذه العينة لا تشبه ما تدربت عليه". في الأنظمة الحقيقية، هذه ليست ميزة جانبية بل خاصية أمان أساسية.

في رسالتي للماجستير في JKU Linz تحت إشراف Prof. Sepp Hochreiter وClaus Hofmann، درست ما إذا كان **نموذج انتشار شرطي** يمكن أن يعمل كـ **مصنف توليدي** لكشف OOD.

## الفكرة الأساسية

يقوم النموذج بإعادة بناء الصورة تحت شرطين مختلفين للفئة. إذا كانت الصورة طبيعية، فيجب أن ينجح الشرط الصحيح أكثر. وإذا كانت غير مألوفة، فإن التفسيرين يضعفان وتصبح فجوة خطأ إعادة البناء هي إشارة الشذوذ.

النسخة الأساسية كانت جيدة، لكنها عانت من مشكلة واضحة: حساسية كبيرة للبذرة. عند $lambda = 0.0$ كان المتوسط **92.52% +/- 11.07% AUROC**.

## مساهمتي: separation loss

أضفت **class-conditional separation loss** تدفع تنبؤات الضوضاء الشرطية بعيداً عن بعضها:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

عندما تصبح التفسيرات أبعد عن بعضها، تصبح فجوة خطأ إعادة البناء أوضح، وبالتالي تصبح درجة OOD أكثر ثباتاً.

## النتائج

أفضل إعداد كان **lambda = 0.02**. عبر ثلاث بذور مستقلة وصلنا إلى:

- **99.03% +/- 0.07% AUROC** على CIFAR-10
- **+6.5 نقطة مئوية** فوق الخط الأساسي بدون فصل
- انخفاض كبير جداً في التباين

أما seed-42 فحقق:

- **98.98% AUROC** في within-CIFAR
- **90.50%-96.97%** تعميماً zero-shot على CIFAR-100 وPlaces365 وFashionMNIST وTextures وSVHN

## لماذا هذه النتيجة مهمة

الأهم ليس فقط ارتفاع الدرجة، بل انهيار التباين. الانتقال من 92.52% +/- 11.07% إلى 99.03% +/- 0.07% يعني الانتقال من فكرة بحثية هشة إلى مكون أكثر مصداقية كنظام أمان.

## الاختبار عبر المجال الصناعي

طبقت الفكرة نفسها أيضاً على مراقبة جودة الطباعة الصناعية في benchmark العام FTI_Zer0P. هناك وصل خط YOLO + CDM المعتمد على crops إلى **0.8673 +/- 0.0230 AUROC** مع تحقق تقاطعي صارم من 5 طيات، بينما لم تحقق separation loss تحسناً ذا دلالة إحصائية بعد Holm correction.

وهذه أيضاً نتيجة مهمة، لأنها توضح أن الفكرة تعمل بقوة في فضاءات دلالية مثل CIFAR-10، لكنها لا تنتقل تلقائياً إلى بيانات صناعية صغيرة وغنية بالملمس.

## الأدوات والروابط

- PyTorch + PyTorch Lightning
- DDPM U-Net مع class conditioning
- Hydra + Weights & Biases
- بنية GPU في JKU

الروابط العامة:

- PDF الرسالة: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- الكود: https://github.com/ahmed-3m/DiffusionOOD
- النقل الصناعي: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
    },
  },
  {
    slug: 'diffusion-models-anomaly-detection',
    date: '2024-11-20',
    ogImage: '/og-diffusion-models-anomaly-detection.png',
    lastModified: '2026-04-25',
    translations: {
      en: {
        title: 'Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH',
        excerpt:
          'How I evaluated a public YOLO + conditional diffusion pipeline on the FTI_Zer0P benchmark under strict 5-fold cross-validation, reaching a 0.8673 +/- 0.0230 AUROC baseline and learning where the method transfers and where it does not.',
        tags: ['Diffusion Models', 'Anomaly Detection', 'Industrial AI', 'YOLOv8', 'Quality Control'],
        readingTime: '11 min read',
        faq: [
          {
            question: 'What result did the industrial system achieve?',
            answer:
              'On the public benchmark, the strict 5-fold CV baseline reached 0.8673 +/- 0.0230 AUROC. In the production setting, the deployed decision pipeline reached 98.4% defect-classification accuracy.',
          },
          {
            question: 'What was the architecture?',
            answer:
              'YOLOv8 was used as a feature backbone, and a conditional diffusion model acted as the generative classifier. Multi-head conditioning handled the different inkjet feature types.',
          },
          {
            question: 'Did separation loss help here too?',
            answer:
              'Not significantly. That became one of the most honest findings of the work: the method transferred well across code and workflow, but not all gains transferred to this small industrial dataset.',
          },
        ],
        content: `
## Industrial Context

At PROFACTOR GmbH in Austria, I worked on machine vision for inkjet-printed building components. The goal was simple to state and difficult to solve: detect defects before a bad component leaves the line.

The challenge was not only model accuracy. The data was small, defects were heterogeneous, and evaluation had to be statistically honest.

## The Pipeline

The system used a **YOLO + conditional diffusion model** pipeline:

1. YOLOv8 extracted structured visual features from the printed component.
2. A conditional diffusion model learned what normal feature crops should look like for each feature type.
3. The reconstruction-based score became the anomaly signal.

This reused the same generative-classification mindset from my thesis, but in a much more constrained industrial environment.

## Why the Setting Was Hard

- only a limited number of source groups
- strong variation across feature types
- defect classes were not equally represented
- cross-validation was mandatory

That means a flashy one-run result would have been misleading. I evaluated the pipeline on the public **FTI_Zer0P** benchmark with strict **5-fold cross-validation**.

## Results

The public crop-based baseline at $lambda = 0.0$ reached:

- **0.8673 +/- 0.0230 AUROC**

In the production thresholded deployment, the system reached:

- **98.4% defect classification accuracy**

Those numbers describe two different realities:

- AUROC describes threshold-independent ranking quality under rigorous evaluation
- the 98.4% number describes an operational decision threshold in deployment

## What I Learned About Transfer

One of the most useful outcomes was discovering where the separation-loss idea stopped helping. On CIFAR-10 it was a major win. On this industrial benchmark, non-zero separation settings stayed within the cross-fold variation and did not survive Holm-corrected significance testing.

That does not make the idea weak. It makes the conclusion more precise: some gains are domain-dependent.

## Engineering Takeaways

- industrial ML needs evaluation discipline more than leaderboard energy
- feature-type heterogeneity can matter more than architecture choice
- public artifacts matter if you want results other people can trust

Artifacts:

- Report PDF: https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      de: {
        title: 'Diffusionsmodelle für industrielle Defekterkennung bei PROFACTOR GmbH',
        excerpt:
          'Wie ich eine öffentliche YOLO + Conditional-Diffusion-Pipeline auf dem FTI_Zer0P Benchmark unter strenger 5-facher Kreuzvalidierung bewertet habe und eine Baseline von 0.8673 +/- 0.0230 AUROC erreicht wurde.',
        tags: ['Diffusionsmodelle', 'Anomalieerkennung', 'Industrielle KI', 'YOLOv8', 'Qualitätskontrolle'],
        readingTime: '11 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis erreichte das industrielle System?',
            answer:
              'Auf dem öffentlichen Benchmark lag die strenge 5-fold-CV Baseline bei 0.8673 +/- 0.0230 AUROC. Im produktionsnahen Betrieb erreichte das Entscheidungssetup 98.4% Defektklassifikationsgenauigkeit.',
          },
          {
            question: 'Wie sah die Architektur aus?',
            answer:
              'YOLOv8 wurde als Feature-Backbone genutzt und ein konditionales Diffusionsmodell übernahm die generative Klassifikation. Multi-Head Conditioning modellierte die verschiedenen Merkmalstypen.',
          },
          {
            question: 'Half die Separation Loss auch hier?',
            answer:
              'Nicht signifikant. Genau das war eine wichtige, ehrliche Erkenntnis: Workflow und Methodik übertrugen sich, aber nicht jeder Gewinn übertrug sich auf diesen kleinen industriellen Datensatz.',
          },
        ],
        content: `
## Industrieller Kontext

Bei PROFACTOR GmbH in Österreich arbeitete ich an Machine Vision für inkjet-bedruckte Bauteile. Das Ziel war klar: Defekte erkennen, bevor fehlerhafte Teile die Linie verlassen.

Schwierig war nicht nur die Modellleistung. Der Datensatz war klein, die Defekte waren heterogen, und die Auswertung musste statistisch sauber sein.

## Die Pipeline

Die Lösung nutzte eine **YOLO + Conditional-Diffusion-Model** Pipeline:

1. YOLOv8 extrahierte strukturierte visuelle Features.
2. Ein konditionales Diffusionsmodell lernte für jeden Merkmalstyp, wie normale Feature-Crops aussehen.
3. Der rekonstruktionsbasierte Score wurde als Anomaliesignal verwendet.

Damit wurde derselbe generative Klassifikationsgedanke wie in meiner Thesis in eine viel stärker eingeschränkte industrielle Umgebung übertragen.

## Warum das Setting schwierig war

- nur begrenzte Datenmenge
- starke Unterschiede zwischen den Merkmalstypen
- unausgeglichene Defektverteilungen
- Kreuzvalidierung war Pflicht

Darum wäre ein einzelner guter Lauf irreführend gewesen. Ich habe die Pipeline auf dem öffentlichen **FTI_Zer0P** Benchmark mit strenger **5-facher Kreuzvalidierung** bewertet.

## Ergebnisse

Die öffentliche crop-basierte Baseline bei $lambda = 0.0$ erreichte:

- **0.8673 +/- 0.0230 AUROC**

Im produktionsnahen Schwellwertbetrieb erreichte das System:

- **98.4% Defektklassifikationsgenauigkeit**

Diese Werte beschreiben zwei verschiedene Ebenen:

- AUROC misst die threshold-unabhängige Rangqualität
- 98.4% beschreibt eine betriebliche Entscheidungsschwelle

## Was ich über Transfer gelernt habe

Eine der wichtigsten Erkenntnisse war, wo die Separation Loss aufhört zu helfen. Auf CIFAR-10 war sie ein großer Gewinn. Auf diesem industriellen Benchmark blieben die nicht-null Einstellungen innerhalb der Fold-Variation und überstanden keine Holm-korrigierte Signifikanzprüfung.

Das ist kein negatives Ergebnis, sondern ein präziseres Ergebnis: Einige Verbesserungen sind stark domänenabhängig.

## Engineering-Erkenntnisse

- industrielle ML-Projekte brauchen Auswertungsdisziplin
- Heterogenität der Merkmalstypen kann wichtiger sein als Architekturdetails
- öffentliche Artefakte machen Resultate prüfbar

Artefakte:

- Report PDF: https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: 'Modèles de diffusion pour la détection de défauts industriels chez PROFACTOR GmbH',
        excerpt:
          "Comment j'ai évalué une pipeline publique YOLO + diffusion conditionnelle sur le benchmark FTI_Zer0P avec validation croisée stricte à 5 plis, obtenant une baseline de 0.8673 +/- 0.0230 AUROC.",
        tags: ['Modèles de diffusion', "Détection d'anomalie", 'IA industrielle', 'YOLOv8', 'Contrôle qualité'],
        readingTime: '11 min de lecture',
        faq: [
          {
            question: 'Quel résultat le système industriel a-t-il obtenu ?',
            answer:
              'Sur le benchmark public, la baseline en validation croisée stricte à 5 plis a atteint 0.8673 +/- 0.0230 AUROC. En exploitation, le pipeline de décision a atteint 98.4% de précision de classification des défauts.',
          },
          {
            question: "Quelle était l'architecture ?",
            answer:
              'YOLOv8 servait de backbone de features et un modèle de diffusion conditionnel jouait le rôle de classificateur génératif. Le multi-head conditioning gérait les différents types de motifs inkjet.',
          },
          {
            question: 'La separation loss a-t-elle aidé ici aussi ?',
            answer:
              "Pas de façon significative. C'est justement une conclusion utile et honnête : la méthode se transfère, mais pas tous les gains.",
          },
        ],
        content: `
## Contexte industriel

Chez PROFACTOR GmbH en Autriche, j'ai travaillé sur la vision industrielle pour des composants de construction imprimés à jet d'encre. L'objectif était clair : détecter les défauts avant qu'une pièce mauvaise quitte la ligne.

La difficulté ne venait pas seulement du modèle. Le jeu de données était petit, les défauts étaient hétérogènes, et l'évaluation devait être rigoureuse.

## La pipeline

La solution utilisait une pipeline **YOLO + modèle de diffusion conditionnel** :

1. YOLOv8 extrayait des features visuelles structurées.
2. Le modèle de diffusion apprenait à représenter des crops normaux pour chaque type de feature.
3. Le score basé sur la reconstruction devenait le signal d'anomalie.

On retrouve ici la même logique de classification générative que dans mon mémoire, mais dans un contexte industriel beaucoup plus contraint.

## Pourquoi le problème était difficile

- peu de données
- forte hétérogénéité selon les types de feature
- répartition des défauts déséquilibrée
- validation croisée indispensable

Un résultat unique aurait donc été trompeur. J'ai évalué la pipeline sur le benchmark public **FTI_Zer0P** avec une **validation croisée stricte à 5 plis**.

## Résultats

La baseline publique par crops à $lambda = 0.0$ a atteint :

- **0.8673 +/- 0.0230 AUROC**

En mode décision en production, le système a atteint :

- **98.4% de précision de classification des défauts**

Ces deux nombres décrivent deux choses différentes :

- AUROC mesure la qualité de classement indépendamment du seuil
- 98.4% mesure une décision opérationnelle avec seuil

## Ce que j'ai appris sur le transfert

Le point le plus utile a été de voir où la separation loss cessait d'aider. Sur CIFAR-10, elle était très forte. Sur ce benchmark industriel, les réglages non nuls restaient dans la variation des folds et n'étaient pas significatifs après correction de Holm.

Ce n'est pas un mauvais résultat. C'est un résultat plus précis : certains gains sont dépendants du domaine.

## Leçons d'ingénierie

- l'IA industrielle demande surtout de la rigueur d'évaluation
- l'hétérogénéité des features peut compter davantage que l'architecture
- les artefacts publics rendent un résultat vérifiable

Artefacts :

- PDF du rapport : https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code : https://github.com/ahmed-3m/InkjetOOD
- Weights : https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Modelos de difusión para detección de defectos industriales en PROFACTOR GmbH',
        excerpt:
          'Cómo evalué una pipeline pública YOLO + difusión condicional en el benchmark FTI_Zer0P con validación cruzada estricta de 5 folds, logrando una base de 0.8673 +/- 0.0230 AUROC.',
        tags: ['Modelos de difusión', 'Detección de anomalías', 'IA industrial', 'YOLOv8', 'Control de calidad'],
        readingTime: '11 min de lectura',
        faq: [
          {
            question: '¿Qué resultado logró el sistema industrial?',
            answer:
              'En el benchmark público, la base con validación cruzada estricta de 5 folds alcanzó 0.8673 +/- 0.0230 AUROC. En producción, el pipeline de decisión alcanzó 98.4% de precisión de clasificación de defectos.',
          },
          {
            question: '¿Cuál era la arquitectura?',
            answer:
              'YOLOv8 se usó como backbone de features y un modelo de difusión condicional actuó como clasificador generativo. Multi-head conditioning manejó los distintos tipos de features de inkjet.',
          },
          {
            question: '¿La separation loss también ayudó aquí?',
            answer:
              'No de forma significativa. Esa fue una conclusión muy útil: el método se transfirió, pero no todos los beneficios pasaron a este pequeño dataset industrial.',
          },
        ],
        content: `
## Contexto industrial

En PROFACTOR GmbH en Austria trabajé en visión por computador para componentes de construcción impresos por inkjet. El objetivo era detectar defectos antes de que una pieza mala saliera de la línea.

La dificultad no era solo el modelo. El dataset era pequeño, los defectos eran heterogéneos y la evaluación debía ser rigurosa.

## La pipeline

La solución usó una pipeline **YOLO + modelo de difusión condicional**:

1. YOLOv8 extraía features visuales estructuradas.
2. El modelo de difusión aprendía cómo debían verse los crops normales de cada tipo de feature.
3. El score basado en reconstrucción se convertía en la señal de anomalía.

Es la misma idea de clasificación generativa de mi tesis, pero dentro de un entorno industrial mucho más restringido.

## Por qué el problema era difícil

- pocos datos
- mucha heterogeneidad entre tipos de feature
- distribución de defectos desequilibrada
- validación cruzada obligatoria

Por eso un solo run llamativo habría sido engañoso. Evalué la pipeline sobre el benchmark público **FTI_Zer0P** con **validación cruzada estricta de 5 folds**.

## Resultados

La base pública por crops con $lambda = 0.0$ alcanzó:

- **0.8673 +/- 0.0230 AUROC**

En el modo de decisión de producción, el sistema alcanzó:

- **98.4% de precisión de clasificación de defectos**

Estos dos números describen dos cosas distintas:

- AUROC mide calidad de ranking sin depender del umbral
- 98.4% describe una decisión operativa con umbral

## Lo que aprendí sobre transferencia

Lo más valioso fue ver dónde la separation loss dejaba de ayudar. En CIFAR-10 fue una gran mejora. En este benchmark industrial, las configuraciones no nulas quedaron dentro de la variación entre folds y no fueron significativas tras la corrección de Holm.

Eso no debilita la idea. La hace más precisa: algunas mejoras dependen del dominio.

## Lecciones de ingeniería

- el ML industrial necesita disciplina de evaluación
- la heterogeneidad de los tipos de feature puede importar más que la arquitectura
- los artefactos públicos hacen que el resultado sea verificable

Artefactos:

- PDF del informe: https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Codigo: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      ar: {
        title: 'نماذج الانتشار لكشف العيوب الصناعية في PROFACTOR GmbH',
        excerpt:
          'كيف قمت بتقييم خط عام يجمع بين YOLO ونموذج انتشار شرطي على benchmark FTI_Zer0P مع تحقق تقاطعي صارم من 5 طيات، وحققت baseline قدرها 0.8673 +/- 0.0230 AUROC.',
        tags: ['نماذج الانتشار', 'كشف الشذوذ', 'الذكاء الاصطناعي الصناعي', 'YOLOv8', 'ضبط الجودة'],
        readingTime: '11 دقيقة قراءة',
        faq: [
          {
            question: 'ما النتيجة التي حققها النظام الصناعي؟',
            answer:
              'على benchmark العام وصلت baseline مع تحقق تقاطعي صارم من 5 طيات إلى 0.8673 +/- 0.0230 AUROC. وفي وضع التشغيل وصل خط القرار إلى 98.4% دقة في تصنيف العيوب.',
          },
          {
            question: 'ما هي البنية المستخدمة؟',
            answer:
              'استُخدم YOLOv8 كبنية لاستخراج الميزات، بينما عمل نموذج الانتشار الشرطي كمصنف توليدي. كما استُخدم multi-head conditioning للتعامل مع أنواع الميزات المختلفة.',
          },
          {
            question: 'هل ساعدت separation loss هنا أيضاً؟',
            answer:
              'ليس بشكل ذي دلالة. وكانت هذه من أكثر النتائج صدقاً في العمل: المنهجية انتقلت، لكن ليس كل المكاسب انتقلت إلى هذا dataset الصناعي الصغير.',
          },
        ],
        content: `
## السياق الصناعي

في PROFACTOR GmbH في النمسا عملت على الرؤية الحاسوبية لمكونات بناء مطبوعة بالحبر. الهدف كان واضحاً: اكتشاف العيوب قبل أن تغادر القطعة المعيبة خط الإنتاج.

الصعوبة لم تكن في النموذج فقط. البيانات كانت قليلة، والعيوب متنوعة، والتقييم كان يجب أن يكون صارماً.

## خط العمل

استخدمنا خطاً يجمع بين **YOLO ونموذج انتشار شرطي**:

1. استخرج YOLOv8 ميزات بصرية منظمة.
2. تعلم نموذج الانتشار كيف تبدو crops الطبيعية لكل نوع من الميزات.
3. أصبحت الدرجة المعتمدة على إعادة البناء هي إشارة الشذوذ.

إنها نفس عقلية التصنيف التوليدي في رسالتي، لكن داخل بيئة صناعية أكثر تقييداً.

## لماذا كانت المهمة صعبة

- بيانات محدودة
- اختلاف كبير بين أنواع الميزات
- توزيع غير متوازن للعيوب
- التحقق التقاطعي كان إلزامياً

لذلك فإن أي نتيجة جيدة من تشغيل واحد فقط كانت ستكون مضللة. قمت بتقييم الخط على benchmark العام **FTI_Zer0P** مع **تحقق تقاطعي صارم من 5 طيات**.

## النتائج

وصلت baseline العامة المعتمدة على crops عند $lambda = 0.0$ إلى:

- **0.8673 +/- 0.0230 AUROC**

وفي وضع القرار التشغيلي وصل النظام إلى:

- **98.4% دقة في تصنيف العيوب**

هاتان النتيجتان تصفان مستويين مختلفين:

- AUROC يقيس جودة الترتيب من دون الاعتماد على threshold
- 98.4% تصف قراراً تشغيلياً عند threshold محدد

## ما تعلمته عن النقل بين المجالات

أهم ما خرجت به هو معرفة أين تتوقف separation loss عن المساعدة. على CIFAR-10 كانت مفيدة جداً. أما على هذا benchmark الصناعي فبقيت الإعدادات غير الصفرية داخل تباين الطيات، ولم تكن ذات دلالة بعد Holm correction.

وهذا ليس نتيجة سلبية، بل نتيجة أكثر دقة: بعض المكاسب تعتمد على طبيعة المجال.

## دروس هندسية

- التعلم الآلي الصناعي يحتاج إلى انضباط في التقييم
- اختلاف أنواع الميزات قد يكون أهم من اختيار البنية نفسها
- artefacts العامة تجعل النتائج قابلة للتحقق

الروابط:

- PDF التقرير: https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- الكود: https://github.com/ahmed-3m/InkjetOOD
- الأوزان: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
    },
  },
  {
    slug: 'computer-vision-yolo-mastery',
    date: '2024-10-20',
    ogImage: '/og-computer-vision-yolo-mastery.png',
    lastModified: '2026-04-25',
    translations: {
      en: {
        title: 'YOLOv8 for Industrial Quality Control: Decisions That Actually Moved the Needle',
        excerpt:
          'A practical post-mortem on the architecture, data strategy, and deployment decisions that mattered in industrial inkjet quality control, instead of another generic YOLO tutorial.',
        tags: ['Computer Vision', 'YOLOv8', 'Industrial AI', 'PyTorch', 'Production ML'],
        readingTime: '10 min read',
        faq: [
          {
            question: 'Why use YOLO as a feature extractor and not as a detector?',
            answer:
              'Because the task was not natural object detection. The feature types behaved more like structured visual signatures than bounding-box objects, so the backbone features were more useful than the detector head.',
          },
          {
            question: 'What latency did the deployed system reach?',
            answer:
              'Around 35 ms per component in the final production-friendly configuration, which stayed within the edge constraint.',
          },
          {
            question: 'What mattered most?',
            answer:
              'Data discipline, fold design, and choosing a stable deployment path mattered more than chasing the fanciest architecture variant.',
          },
        ],
        content: `
## This Was Not a Tutorial Project

Most YOLO posts stop at "train on a large dataset and report mAP." Industrial quality control does not work that way. The constraints are different: fewer images, harder defects, tighter latency budgets, and real-world consequences for false alarms and misses.

## The First Important Decision

I did **not** use YOLOv8 mainly as a detector. I used it as a **feature extractor**. The print-quality problem involved feature types such as dots, distances, edges, and angles. Those are not always best represented as classic object-detection boxes.

Using the backbone features gave the downstream anomaly detector richer geometric information than relying on the final detection head alone.

## Data Engineering Mattered More Than Hype

With a limited dataset, the biggest wins came from discipline:

- careful fold construction
- avoiding leakage between folds
- realistic augmentation only
- respecting feature-type imbalance

Heavy synthetic tricks were much less useful than simply being honest about the data regime.

## Training Choices That Helped

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

The key was not the exact numbers by themselves. The key was matching them to a small industrial dataset and a production target. Freeze-then-unfreeze strategies, conservative optimization, and per-feature inspection mattered much more than generic defaults.

## Evaluation That Meant Something

The system was evaluated with strict **5-fold cross-validation**. Per-feature AUROC told a more honest story than a single overall score. Some features were highly reliable, while others were limited mostly by data scarcity rather than by architecture.

## Deployment Reality

The final system had to run within edge constraints. Quantization helped latency, but reliability still came first. The practical lesson was simple: a slightly slower stable deployment is better than a faster unstable one.

## What Actually Moved the Needle

- using YOLO features instead of forcing a detector framing
- building a disciplined evaluation loop
- treating feature types as different sub-problems
- optimizing for dependable inference, not just lab numbers
        `,
      },
      de: {
        title: 'YOLOv8 für industrielle Qualitätskontrolle: Entscheidungen, die wirklich etwas verändert haben',
        excerpt:
          'Ein praxisnahes Post-Mortem über Architektur, Datenstrategie und Deployment-Entscheidungen in industrieller Inkjet-Qualitätskontrolle statt eines weiteren allgemeinen YOLO-Tutorials.',
        tags: ['Computer Vision', 'YOLOv8', 'Industrielle KI', 'PyTorch', 'Production ML'],
        readingTime: '10 Min. Lesezeit',
        faq: [
          {
            question: 'Warum YOLO als Feature-Extractor und nicht als Detektor?',
            answer:
              'Weil die Aufgabe keine klassische Objekterkennung war. Die Merkmalstypen verhielten sich eher wie strukturierte visuelle Signaturen als wie Bounding-Box-Objekte.',
          },
          {
            question: 'Welche Latenz erreichte das System?',
            answer:
              'Etwa 35 ms pro Komponente in der finalen produktionsnahen Konfiguration, also innerhalb der Edge-Vorgabe.',
          },
          {
            question: 'Was war am wichtigsten?',
            answer:
              'Datendisziplin, Fold-Design und ein stabiles Deployment waren wichtiger als die schickste Architekturvariante.',
          },
        ],
        content: `
## Kein Tutorial-Projekt

Die meisten YOLO-Beiträge enden bei "auf großem Datensatz trainieren und mAP berichten". Industrielle Qualitätskontrolle funktioniert anders: weniger Bilder, schwierigere Defekte, engere Latenzbudgets und echte Kosten für Fehlalarme und übersehene Fehler.

## Die erste wichtige Entscheidung

Ich habe YOLOv8 **nicht** primär als Detektor verwendet, sondern als **Feature-Extractor**. Das Druckqualitätsproblem bestand aus Merkmalen wie Punkten, Abständen, Kanten und Winkeln. Diese lassen sich nicht immer sinnvoll als klassische Bounding-Box-Objekte behandeln.

Die Backbone-Features gaben dem nachgelagerten Anomaliedetektor deutlich mehr geometrische Information.

## Datenarbeit war wichtiger als Hype

Bei einem kleinen Datensatz kamen die größten Gewinne aus Disziplin:

- saubere Fold-Konstruktion
- keine Leakage zwischen Folds
- nur realistische Augmentation
- Respekt vor dem Ungleichgewicht der Merkmalstypen

Aufwendige synthetische Tricks brachten viel weniger als ein ehrlicher Umgang mit dem Datenregime.

## Trainingseinstellungen, die geholfen haben

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

Entscheidend waren nicht die Zahlen allein, sondern ihre Passung zu kleinem Industriedatensatz und Produktionsziel. Freeze-then-unfreeze, konservative Optimierung und Analyse pro Merkmal waren wichtiger als Standarddefaults.

## Aussagekräftige Evaluation

Das System wurde mit strenger **5-facher Kreuzvalidierung** bewertet. AUROC pro Merkmal erzählte eine ehrlichere Geschichte als ein einzelner Gesamtscore. Einige Merkmale waren sehr stabil, andere litten vor allem unter zu wenig Daten.

## Deployment-Realität

Das finale System musste unter Edge-Bedingungen laufen. Quantisierung half bei der Latenz, aber Zuverlässigkeit blieb wichtiger. Die praktische Lektion: eine etwas langsamere stabile Variante ist besser als eine schnelle instabile.

## Was wirklich den Unterschied gemacht hat

- YOLO-Features statt erzwungener Detektor-Perspektive
- disziplinierte Evaluation
- Merkmalstypen als unterschiedliche Teilprobleme behandeln
- auf zuverlässige Inferenz optimieren
        `,
      },
      fr: {
        title: 'YOLOv8 pour le contrôle qualité industriel : les décisions qui ont vraiment compté',
        excerpt:
          "Un retour pratique sur les choix d'architecture, de données et de déploiement qui ont compté en contrôle qualité inkjet industriel, au lieu d'un tutoriel YOLO générique.",
        tags: ['Vision par ordinateur', 'YOLOv8', 'IA industrielle', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lecture',
        faq: [
          {
            question: "Pourquoi utiliser YOLO comme extracteur de features et non comme détecteur ?",
            answer:
              "Parce que la tâche n'était pas une détection d'objets classique. Les types de feature ressemblaient davantage à des signatures visuelles structurées qu'à des objets en bounding box.",
          },
          {
            question: 'Quelle latence a été atteinte ?',
            answer:
              'Environ 35 ms par composant dans la configuration finale compatible production edge.',
          },
          {
            question: "Qu'est-ce qui a le plus compté ?",
            answer:
              "La discipline sur les données, le design des folds et un chemin de déploiement stable ont compté plus qu'une architecture à la mode.",
          },
        ],
        content: `
## Ce n'était pas un projet tutoriel

La plupart des articles YOLO s'arrêtent à "entraîner sur un grand dataset et rapporter le mAP". Le contrôle qualité industriel est tout autre chose : moins d'images, défauts plus subtils, budget de latence plus strict, et vraies conséquences opérationnelles.

## La première décision importante

Je n'ai pas utilisé YOLOv8 principalement comme détecteur, mais comme **extracteur de features**. Le problème concernait des points, distances, bords et angles. Ce sont des motifs structurés, pas toujours des objets détectables de façon classique.

Les features du backbone étaient plus riches pour l'étape suivante de détection d'anomalie.

## L'ingénierie des données a plus compté que le buzz

Sur un petit dataset, les plus grands gains sont venus de la discipline :

- construction propre des folds
- absence de fuite de données
- augmentations réalistes seulement
- prise en compte de l'hétérogénéité des features

Les astuces synthétiques ont moins aidé qu'une évaluation honnête du régime de données.

## Des choix d'entraînement utiles

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

Le plus important n'était pas le chiffre exact, mais l'adéquation au petit dataset industriel et à la cible de production. Les stratégies freeze-then-unfreeze et l'analyse par feature ont davantage compté que les réglages par défaut.

## Une évaluation qui veut dire quelque chose

Le système a été évalué avec une **validation croisée stricte à 5 plis**. L'AUROC par feature racontait une histoire plus honnête qu'un score global unique. Certaines features étaient robustes, d'autres étaient surtout limitées par le manque de données.

## Réalité du déploiement

Le système final devait tourner en environnement edge. La quantification aidait la latence, mais la stabilité restait prioritaire. Leçon pratique : un déploiement légèrement plus lent mais fiable vaut mieux qu'une option rapide mais instable.

## Ce qui a vraiment fait la différence

- utiliser les features YOLO plutôt qu'imposer une logique de détection
- une boucle d'évaluation disciplinée
- traiter les types de feature comme des sous-problèmes différents
- optimiser pour une inférence fiable
        `,
      },
      es: {
        title: 'YOLOv8 para control de calidad industrial: decisiones que realmente movieron la aguja',
        excerpt:
          'Un post-mortem práctico sobre las decisiones de arquitectura, datos y despliegue que importaron en control de calidad inkjet industrial, en lugar de otro tutorial genérico de YOLO.',
        tags: ['Visión por computador', 'YOLOv8', 'IA industrial', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lectura',
        faq: [
          {
            question: '¿Por qué usar YOLO como extractor de features y no como detector?',
            answer:
              'Porque la tarea no era detección clásica de objetos. Los tipos de feature se comportaban más como firmas visuales estructuradas que como objetos en bounding boxes.',
          },
          {
            question: '¿Qué latencia alcanzó el sistema?',
            answer:
              'Alrededor de 35 ms por componente en la configuración final apta para producción edge.',
          },
          {
            question: '¿Qué fue lo más importante?',
            answer:
              'La disciplina de datos, el diseño de folds y un camino de despliegue estable importaron más que perseguir la arquitectura más llamativa.',
          },
        ],
        content: `
## Esto no fue un proyecto tutorial

La mayoría de los posts sobre YOLO terminan en "entrena sobre un gran dataset y reporta mAP". El control de calidad industrial es otra cosa: menos imágenes, defectos más difíciles, presupuestos de latencia más estrictos y consecuencias reales.

## La primera decisión importante

No usé YOLOv8 principalmente como detector, sino como **extractor de features**. El problema incluía puntos, distancias, bordes y ángulos. Esos patrones no siempre encajan bien como objetos clásicos con bounding boxes.

Las features del backbone dieron al detector de anomalías una representación geométrica mejor.

## La ingeniería de datos importó más que el hype

Con un dataset pequeño, las mayores mejoras vinieron de la disciplina:

- construcción cuidadosa de folds
- evitar leakage
- augmentations realistas solamente
- respetar la heterogeneidad de las features

Los trucos sintéticos ayudaron menos que una lectura honesta del régimen de datos.

## Ajustes de entrenamiento útiles

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

Lo importante no fueron solo los números, sino ajustarlos al dataset industrial pequeño y al objetivo de producción. Freeze-then-unfreeze, optimización conservadora y análisis por feature importaron más que usar defaults.

## Una evaluación que significaba algo

El sistema se evaluó con **validación cruzada estricta de 5 folds**. El AUROC por feature contó una historia más honesta que un solo score global. Algunas features eran estables; otras estaban limitadas sobre todo por la falta de datos.

## Realidad del despliegue

El sistema final tenía que funcionar en edge. La cuantización mejoró la latencia, pero la fiabilidad siguió siendo lo primero. La lección práctica fue simple: una versión un poco más lenta pero estable es mejor que una rápida e inestable.

## Qué movió la aguja de verdad

- usar features de YOLO en vez de forzar una perspectiva de detector
- una evaluación disciplinada
- tratar los tipos de feature como subproblemas distintos
- optimizar para inferencia confiable
        `,
      },
      ar: {
        title: 'YOLOv8 لمراقبة الجودة الصناعية: القرارات التي أحدثت الفرق فعلاً',
        excerpt:
          'مراجعة عملية لقرارات البنية والبيانات والنشر التي أثرت فعلاً في جودة الطباعة الصناعية، بدلاً من تكرار شرح YOLO العام.',
        tags: ['الرؤية الحاسوبية', 'YOLOv8', 'الذكاء الاصطناعي الصناعي', 'PyTorch', 'Production ML'],
        readingTime: '10 دقائق قراءة',
        faq: [
          {
            question: 'لماذا استخدمت YOLO كمستخرج ميزات وليس ككاشف فقط؟',
            answer:
              'لأن المهمة لم تكن كشف أجسام تقليدي. أنواع الميزات كانت أقرب إلى إشارات بصرية منظمة منها إلى أجسام ضمن bounding boxes.',
          },
          {
            question: 'ما زمن الاستدلال الذي وصل إليه النظام؟',
            answer:
              'حوالي 35 مللي ثانية لكل مكوّن في الإعداد النهائي المناسب للتشغيل على edge.',
          },
          {
            question: 'ما العامل الأهم فعلاً؟',
            answer:
              'الانضباط في البيانات، وتصميم الطيات، ومسار نشر ثابت كان أهم من مطاردة أكثر نسخة معمارية لامعة.',
          },
        ],
        content: `
## هذا لم يكن مشروعاً تعليمياً عادياً

معظم مقالات YOLO تنتهي عند "درّب على dataset كبيرة واذكر mAP". أما ضبط الجودة الصناعي فله شروط مختلفة: صور أقل، وعيوب أصعب، وقيود زمنية أقسى، وعواقب حقيقية.

## أول قرار مهم

لم أستخدم YOLOv8 أساساً ككاشف، بل كمستخرج ميزات. المشكلة كانت تتعلق بالنقاط والمسافات والحواف والزوايا، وهذه لا تتصرف دائماً كأجسام كلاسيكية يمكن تمثيلها بسهولة في bounding boxes.

ميزات الـ backbone أعطت مرحلة كشف الشذوذ تمثيلاً هندسياً أفضل.

## هندسة البيانات كانت أهم من الضجيج

مع dataset صغيرة، جاءت أكبر المكاسب من الانضباط:

- بناء طيات نظيف
- منع التسرب بين الطيات
- augmentations واقعية فقط
- احترام اختلاف أنواع الميزات

الحيل الاصطناعية لم تكن مفيدة بقدر الفهم الصريح لطبيعة البيانات.

## إعدادات التدريب التي ساعدت

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

المهم لم يكن الأرقام وحدها، بل ملاءمتها لبيانات صناعية صغيرة وهدف نشر حقيقي. استراتيجيات freeze-then-unfreeze والتحسين المحافظ والتحليل لكل feature كانت أكثر فائدة من الاعتماد على الإعدادات الافتراضية.

## تقييم له معنى

تم تقييم النظام باستخدام **تحقق تقاطعي صارم من 5 طيات**. وقد أعطى AUROC لكل feature صورة أصدق من رقم إجمالي واحد. بعض الميزات كانت مستقرة، وبعضها كان محدوداً أساساً بنقص البيانات.

## واقع النشر

كان لا بد أن يعمل النظام النهائي على edge. ساعدت quantization في الزمن، لكن الثبات بقي أهم. والدرس العملي كان واضحاً: نسخة أبطأ قليلاً لكنها مستقرة أفضل من نسخة أسرع وغير موثوقة.

## ما الذي أحدث الفرق فعلاً

- استخدام ميزات YOLO بدلاً من فرض منظور كاشف تقليدي
- حلقة تقييم منضبطة
- التعامل مع أنواع الميزات كمشكلات فرعية مختلفة
- تحسين النظام من أجل استدلال موثوق
        `,
      },
    },
  },
  {
    slug: '5-month-llm-adventure',
    date: '2025-11-15',
    ogImage: '/og-5-month-llm-adventure.png',
    lastModified: '2026-04-25',
    translations: {
      en: {
        title: 'Shipping Faultrix: What I Learned Building an AI SaaS From Zero',
        excerpt:
          'What changed when I moved from research into product building: Faultrix, an AI SaaS for construction quality control that generated ONORM-aligned reports in under a minute.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'Production AI', 'Faultrix'],
        readingTime: '9 min read',
        faq: [
          {
            question: 'What was Faultrix?',
            answer:
              'Faultrix was an AI-powered construction quality-control SaaS. Users uploaded site photos and received a structured ONORM-aligned report with evidence handling and security-minded storage.',
          },
          {
            question: 'What stack powered it?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker, and a Python-heavy AI workflow behind the scenes.',
          },
          {
            question: 'What was hardest?',
            answer:
              'Not the AI itself. The hardest part was making the product fit real workflows, legal formatting expectations, and a low-friction user experience.',
          },
        ],
        content: `
## From Research to Product

Faultrix was an AI-powered construction quality-control SaaS. A user uploaded site photos, the system analyzed them, and the platform generated an ONORM-aligned report in under a minute.

Building it taught me that the jump from research to product is not mostly about choosing another model. It is about making the whole system useful.

## The Product Stack

Faultrix was built with:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

The stack was chosen for speed of iteration and operational clarity. I wanted to spend time on product flow, reliability, and reporting quality, not on boilerplate infrastructure.

## The Hardest Part Was Not the Model

The AI side was important, but it was not the hardest part. The hardest part was product fit:

- shaping outputs so they matched real reporting expectations
- keeping the user flow short and clear
- handling evidence and storage in a way that felt trustworthy

That is where research instincts help and fail at the same time. Rigor transfers well. Product intuition has to be earned in the field.

## What Research Helped With

- structured experimentation
- testing output quality before shipping
- understanding where the model should ask for human review

## What Research Did Not Automatically Teach Me

- pricing
- friction in onboarding
- how fast users lose patience
- how much UX can matter more than raw model capability

## The Main Lesson

The first version of Faultrix had strong AI and too much workflow friction. That taught me the key product lesson: users experience value through the path, not through the architecture diagram.

If the path to value is too long, the sophistication underneath barely matters.
        `,
      },
      de: {
        title: 'Faultrix ausliefern: Was ich beim Bau eines AI-SaaS von null gelernt habe',
        excerpt:
          'Was sich verändert hat, als ich von Forschung in Produktbau gewechselt bin: Faultrix, ein AI-SaaS für Bauqualitätskontrolle mit ÖNORM-orientierten Berichten in unter einer Minute.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'Production AI', 'Faultrix'],
        readingTime: '9 Min. Lesezeit',
        faq: [
          {
            question: 'Was war Faultrix?',
            answer:
              'Faultrix war ein KI-basiertes SaaS für Bauqualitätskontrolle. Nutzer luden Baustellenfotos hoch und erhielten einen strukturierten ÖNORM-orientierten Bericht mit Evidenzkette und sicherheitsbewusster Speicherung.',
          },
          {
            question: 'Welcher Stack steckte dahinter?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker und ein Python-lastiger AI-Workflow im Hintergrund.',
          },
          {
            question: 'Was war am schwierigsten?',
            answer:
              'Nicht die KI selbst. Schwieriger war, das Produkt an echte Arbeitsabläufe, Formatvorgaben und eine reibungsarme UX anzupassen.',
          },
        ],
        content: `
## Von Forschung zu Produkt

Faultrix war ein KI-basiertes SaaS für Bauqualitätskontrolle. Nutzer luden Fotos hoch, das System analysierte sie, und in weniger als einer Minute entstand ein ÖNORM-orientierter Bericht.

Beim Bauen wurde mir klar: Der Schritt von Forschung zu Produkt besteht nicht primär aus einem anderen Modell, sondern daraus, das ganze System nützlich zu machen.

## Der Produkt-Stack

Faultrix wurde gebaut mit:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

Ich habe den Stack so gewählt, dass schnelle Iteration möglich ist und der operative Aufbau klar bleibt.

## Das Schwierigste war nicht das Modell

Die KI war wichtig, aber nicht der härteste Teil. Schwieriger waren:

- Ausgaben so formen, dass sie zu realen Berichtsabläufen passen
- den Nutzerpfad kurz und klar halten
- Evidenz und Speicherung vertrauenswürdig präsentieren

Genau hier helfen Forschungsinstinkte teilweise und teilweise nicht. Strenge überträgt sich gut. Produktintuition muss man sich in der Praxis erarbeiten.

## Was die Forschung übertragen hat

- systematisches Experimentieren
- Qualitätstests vor dem Release
- gutes Gespür dafür, wann menschliche Prüfung nötig ist

## Was die Forschung nicht automatisch lehrt

- Pricing
- Reibung beim Onboarding
- wie schnell Nutzer Geduld verlieren
- wie oft UX wichtiger ist als reine Modellstärke

## Die wichtigste Lektion

Die erste Version von Faultrix hatte starke KI, aber zu viel Reibung im Ablauf. Daraus entstand die wichtigste Produktlektion: Nutzer erleben Wert über den Weg, nicht über das Architekturdiagramm.

Wenn der Weg zum Nutzen zu lang ist, spielt die darunterliegende Raffinesse kaum noch eine Rolle.
        `,
      },
      fr: {
        title: "Livrer Faultrix : ce que j'ai appris en construisant un SaaS IA de zéro",
        excerpt:
          "Ce qui a changé lorsque je suis passé de la recherche au produit : Faultrix, un SaaS IA pour le contrôle qualité construction qui générait des rapports alignés ÖNORM en moins d'une minute.",
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'IA en production', 'Faultrix'],
        readingTime: '9 min de lecture',
        faq: [
          {
            question: "Qu'était Faultrix ?",
            answer:
              "Faultrix était un SaaS de contrôle qualité construction piloté par IA. Les utilisateurs chargeaient des photos de chantier et recevaient un rapport structuré aligné ÖNORM avec gestion des preuves et stockage sécurisé.",
          },
          {
            question: 'Quel stack utilisait-il ?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker, plus un workflow IA fortement centré sur Python.',
          },
          {
            question: "Qu'est-ce qui a été le plus difficile ?",
            answer:
              "Pas l'IA en elle-même. Le plus difficile a été d'adapter le produit aux vrais usages, aux attentes de format et à une UX sans friction.",
          },
        ],
        content: `
## De la recherche au produit

Faultrix était un SaaS de contrôle qualité construction alimenté par IA. L'utilisateur chargeait des photos de chantier, le système les analysait, puis générait un rapport aligné ÖNORM en moins d'une minute.

Le vrai saut entre recherche et produit n'est pas seulement une question de modèle. C'est la capacité à rendre tout le système utile.

## Le stack produit

Faultrix a été construit avec :

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

Ce stack a été choisi pour itérer vite et garder un système simple à faire évoluer.

## Le plus dur n'était pas le modèle

La partie IA comptait, mais ce n'était pas le plus dur. Le plus dur était :

- adapter la sortie aux attentes réelles de reporting
- garder le parcours utilisateur court et clair
- rendre la gestion des preuves et du stockage digne de confiance

La rigueur de recherche aide beaucoup. L'intuition produit, elle, se construit au contact du terrain.

## Ce que la recherche m'a apporté

- expérimentation structurée
- tests de qualité avant livraison
- bonne compréhension des limites du modèle

## Ce que la recherche ne m'a pas donné automatiquement

- la logique de pricing
- la gestion de la friction d'onboarding
- la vitesse à laquelle un utilisateur perd patience
- le fait que l'UX peut compter plus que la sophistication du modèle

## La leçon principale

La première version de Faultrix avait une IA solide mais trop de friction. La leçon a été simple : la valeur est ressentie à travers le parcours utilisateur, pas à travers le schéma technique.

Si le chemin vers la valeur est trop long, la sophistication du dessous ne compense pas.
        `,
      },
      es: {
        title: 'Lanzando Faultrix: lo que aprendí construyendo un SaaS de IA de cero',
        excerpt:
          'Lo que cambió cuando pasé de investigación a producto: Faultrix, un SaaS de IA para control de calidad en construcción que generaba informes alineados con ÖNORM en menos de un minuto.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'IA en producción', 'Faultrix'],
        readingTime: '9 min de lectura',
        faq: [
          {
            question: '¿Qué era Faultrix?',
            answer:
              'Faultrix era un SaaS de control de calidad en construcción impulsado por IA. Los usuarios subían fotos de obra y recibían un informe estructurado alineado con ÖNORM, con manejo de evidencia y almacenamiento seguro.',
          },
          {
            question: '¿Qué stack usaba?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker y un flujo de IA muy apoyado en Python.',
          },
          {
            question: '¿Qué fue lo más difícil?',
            answer:
              'No la IA en sí. Lo más difícil fue adaptar el producto a flujos reales, expectativas de formato y una UX con poca fricción.',
          },
        ],
        content: `
## De investigación a producto

Faultrix era un SaaS de control de calidad en construcción impulsado por IA. El usuario subía fotos de obra, el sistema las analizaba y generaba un informe alineado con ÖNORM en menos de un minuto.

El salto real entre investigación y producto no es solo elegir otro modelo. Es lograr que todo el sistema sea útil.

## El stack del producto

Faultrix fue construido con:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

El stack se eligió para iterar rápido y mantener una base operativa clara.

## Lo más difícil no fue el modelo

La parte de IA importaba, pero no fue lo más duro. Lo más difícil fue:

- ajustar la salida a expectativas reales de reporte
- mantener el flujo del usuario corto y claro
- presentar evidencia y almacenamiento de forma confiable

La disciplina de investigación ayuda mucho. La intuición de producto hay que ganársela en el campo.

## Lo que sí me dio la investigación

- experimentación estructurada
- pruebas de calidad antes de lanzar
- comprensión de cuándo pedir revisión humana

## Lo que la investigación no me dio automáticamente

- pricing
- fricción de onboarding
- cuán rápido el usuario pierde paciencia
- cuánto puede importar más la UX que la potencia del modelo

## La lección principal

La primera versión de Faultrix tenía una IA fuerte pero demasiada fricción. La lección fue clara: el usuario siente el valor a través del camino, no del diagrama de arquitectura.

Si el camino hacia el valor es largo, la sofisticación técnica deja de importar.
        `,
      },
      ar: {
        title: 'إطلاق Faultrix: ما الذي تعلمته من بناء SaaS بالذكاء الاصطناعي من الصفر',
        excerpt:
          'ما الذي تغير عندما انتقلت من البحث إلى المنتج: Faultrix، منصة SaaS للذكاء الاصطناعي في مراقبة جودة البناء، كانت تولد تقارير متوافقة مع ONORM في أقل من دقيقة.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'ذكاء اصطناعي في الإنتاج', 'Faultrix'],
        readingTime: '9 دقائق قراءة',
        faq: [
          {
            question: 'ماذا كان Faultrix؟',
            answer:
              'Faultrix كان SaaS لمراقبة جودة البناء مدعوم بالذكاء الاصطناعي. كان يرفع المستخدم صور الموقع ويحصل على تقرير منظم متوافق مع ONORM مع إدارة للأدلة وتخزين آمن.',
          },
          {
            question: 'ما هو الـ stack المستخدم؟',
            answer:
              'Next.js وConvex وOpenAI API وClerk وCloudflare R2 وStripe وDocker، مع workflow كان يعتمد كثيراً على Python في طبقة الذكاء الاصطناعي.',
          },
          {
            question: 'ما أصعب جزء؟',
            answer:
              'ليس الذكاء الاصطناعي نفسه. الأصعب كان جعل المنتج مناسباً لسير العمل الحقيقي وتوقعات التنسيق وتجربة استخدام منخفضة الاحتكاك.',
          },
        ],
        content: `
## من البحث إلى المنتج

Faultrix كان SaaS لمراقبة جودة البناء بالذكاء الاصطناعي. كان يرفع المستخدم صور الموقع، ثم يحللها النظام ويولد تقريراً متوافقاً مع ONORM في أقل من دقيقة.

الانتقال الحقيقي من البحث إلى المنتج لا يعني فقط اختيار نموذج آخر، بل يعني جعل النظام كله مفيداً فعلاً.

## stack المنتج

تم بناء Faultrix باستخدام:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

تم اختيار هذا stack من أجل سرعة التطوير ووضوح البنية التشغيلية.

## أصعب جزء لم يكن النموذج

طبقة الذكاء الاصطناعي كانت مهمة، لكنها لم تكن الأصعب. الأصعب كان:

- تشكيل المخرجات بحيث تناسب توقعات التقارير الحقيقية
- إبقاء مسار المستخدم قصيراً وواضحاً
- تقديم الأدلة والتخزين بطريقة موثوقة

صرامة البحث تساعد كثيراً، لكن حدس المنتج لا يأتي تلقائياً، بل يُكتسب من الاحتكاك الحقيقي مع المستخدمين.

## ما الذي نقلته معي من البحث

- التجريب المنظم
- اختبار جودة المخرجات قبل الإطلاق
- فهم متى يجب طلب مراجعة بشرية

## ما الذي لم يعلمنيه البحث تلقائياً

- التسعير
- احتكاك onboarding
- مدى سرعة فقدان المستخدم للصبر
- كيف يمكن أن تتفوق UX على قوة النموذج نفسها

## الدرس الأساسي

كانت النسخة الأولى من Faultrix قوية من ناحية الذكاء الاصطناعي، لكنها احتوت على احتكاك كبير في سير الاستخدام. والدرس كان واضحاً: المستخدم يشعر بالقيمة عبر المسار الذي يسلكه، لا عبر مخطط البنية.

إذا كان الطريق إلى القيمة طويلاً، فلن تنقذ التعقيدات التقنية التجربة.
        `,
      },
    },
  },
]

function localizePost(post: BlogPost, lang: Language = 'en'): LocalizedBlogPost {
  const translation = post.translations[lang] ?? post.translations.en
  return {
    slug: post.slug,
    date: post.date,
    ogImage: post.ogImage,
    lastModified: post.lastModified,
    title: translation.title,
    excerpt: translation.excerpt,
    tags: translation.tags,
    content: translation.content,
    readingTime: translation.readingTime,
    faq: translation.faq,
  }
}

export function getRawBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRawBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getBlogPost(slug: string, lang: Language = 'en'): LocalizedBlogPost | undefined {
  const post = getRawBlogPost(slug)
  return post ? localizePost(post, lang) : undefined
}

export function getAllBlogPosts(lang: Language = 'en'): LocalizedBlogPost[] {
  return getRawBlogPosts().map((post) => localizePost(post, lang))
}
