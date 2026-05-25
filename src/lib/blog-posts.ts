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
    date: '2026-03-20',
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
        title: 'Wie ich mit konditionalen Diffusionsmodellen 99.03% AUROC fuer OOD-Erkennung erreicht habe',
        excerpt:
          'Meine Masterarbeit an der JKU Linz fuehrte eine class-conditional separation loss in konditionale Diffusionsmodelle als generative Klassifikatoren ein und erreichte 99.03% +/- 0.07% AUROC auf CIFAR-10 sowie einen stabilen Gewinn von +6.5 Prozentpunkten gegenueber der Basis ohne Separation.',
        tags: ['Diffusionsmodelle', 'OOD-Erkennung', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Modelle'],
        readingTime: '14 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis wurde auf CIFAR-10 erreicht?',
            answer:
              'Der beste Mittelwert ueber drei Seeds lag bei 99.03% +/- 0.07% AUROC. Seed-42 erreichte 98.98% innerhalb von CIFAR und generalisierte zero-shot auf fuenf externe OOD-Benchmarks.',
          },
          {
            question: 'Was ist die Separation Loss?',
            answer:
              'Das ist ein zusaetzlicher Trainingsterm, der die beiden class-conditional noise predictions auseinanderzieht und damit die Rekonstruktionsfehler-Differenz klarer und stabiler macht.',
          },
          {
            question: 'Warum ist das wichtig?',
            answer:
              'Weil aus einem seed-sensitiven OOD-Detektor ein deutlich verlaesslicherer wird. Genau diese Stabilitaet entscheidet, ob eine Methode spaeter produktionsnah nutzbar ist.',
          },
        ],
        content: `
## Das Problem

OOD-Erkennung ist der Teil eines Systems, der sagt: "Dieses Eingabebeispiel gehoert nicht zu dem, worauf ich trainiert wurde." In sicherheitskritischen Anwendungen ist das genauso wichtig wie die eigentliche Klassifikationsleistung.

In meiner Masterarbeit an der JKU Linz, betreut von Prof. Sepp Hochreiter und Claus Hofmann, habe ich untersucht, ob ein **konditionales Diffusionsmodell** als **generativer Klassifikator** fuer OOD-Erkennung eingesetzt werden kann.

## Die Grundidee

Das Modell rekonstruiert ein Bild unter zwei konkurrierenden Klassenbedingungen. Wenn das Bild wirklich zur Verteilung gehoert, sollte die passende Bedingung besser rekonstruieren. Ist das Bild ungewoehnlich, werden beide Erklaerungen schlechter und die Luecke im Rekonstruktionsfehler wird zum Anomaliesignal.

Die Basisvariante funktionierte bereits, hatte aber ein ernstes Problem: starke Seed-Abhaengigkeit. Bei $lambda = 0.0$ lag der Mittelwert nur bei **92.52% +/- 11.07% AUROC**. Einige Seeds sahen sehr gut aus, andere brachen deutlich ein.

## Mein Beitrag: Separation Loss

Ich habe eine **class-conditional separation loss** eingefuehrt, die die konditionalen Noise-Vorhersagen waehrend des Trainings auseinanderdrueckt:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Wenn die beiden Erklaerungen klarer getrennt sind, wird auch die Rekonstruktionsfehler-Differenz klarer. Genau dadurch wird der OOD-Score robuster.

## Ergebnisse

Die beste Einstellung war **lambda = 0.02**. Ueber drei unabhaengige Seeds ergab sich:

- **99.03% +/- 0.07% AUROC** auf CIFAR-10
- **+6.5 Prozentpunkte** gegenueber der Basis ohne Separation
- deutlich geringere Varianz

Ein reproduzierbarer Seed-42 Lauf erreichte:

- **98.98% AUROC** im within-CIFAR Setting
- **90.50%-96.97%** zero-shot Generalisierung auf CIFAR-100, Places365, FashionMNIST, Textures und SVHN

## Warum dieses Ergebnis wichtig ist

Entscheidend ist nicht nur der hoehere Score. Entscheidend ist der starke Rueckgang der Varianz. Der Schritt von 92.52% +/- 11.07% zu 99.03% +/- 0.07% trennt eine interessante Idee von einer deutlich glaubwuerdigeren Sicherheitskomponente.

## Transfer in die Industrie

Ich habe denselben Ansatz auch auf industrielle Druckqualitaetskontrolle mit dem oeffentlichen FTI_Zer0P Benchmark uebertragen. Dort erreichte die crop-basierte YOLO + CDM Basis **0.8673 +/- 0.0230 AUROC** unter strenger 5-facher Kreuzvalidierung, waehrend die Separation Loss nach Holm-Korrektur **keine** signifikante Verbesserung brachte.

Auch das war ein wichtiges Ergebnis. Es zeigt, dass der Mechanismus in semantischen Bildraeumen wie CIFAR-10 stark hilft, aber nicht automatisch auf kleine, texturlastige Produktionsdaten uebergeht.

## Stack und Artefakte

- PyTorch + PyTorch Lightning
- DDPM U-Net mit Klassenkonditionierung
- Hydra + Weights & Biases
- JKU GPU-Infrastruktur

Oeffentliche Artefakte:

- Thesis PDF: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code: https://github.com/ahmed-3m/DiffusionOOD
- Industrieller Transfer: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: 'Comment j ai atteint 99.03% AUROC pour la detection OOD avec des modeles de diffusion conditionnels',
        excerpt:
          "Mon memoire de master a JKU Linz a introduit une class-conditional separation loss dans des modeles de diffusion conditionnels utilises comme classificateurs generatifs, atteignant 99.03% +/- 0.07% AUROC sur CIFAR-10 avec un gain stable de +6.5 points face a la baseline sans separation.",
        tags: ['Modeles de diffusion', 'Detection OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modeles generatifs'],
        readingTime: '14 min de lecture',
        faq: [
          {
            question: 'Quel resultat a ete obtenu sur CIFAR-10 ?',
            answer:
              'Le meilleur resultat moyen sur trois seeds est de 99.03% +/- 0.07% AUROC. Le seed-42 a atteint 98.98% dans le split CIFAR et a generalise zero-shot a cinq benchmarks externes.',
          },
          {
            question: 'Qu est-ce que la separation loss ?',
            answer:
              'C est un terme d entrainement supplementaire qui eloigne les deux predictions conditionnelles de bruit pour rendre le score base sur l erreur de reconstruction plus discriminant et plus stable.',
          },
          {
            question: 'Pourquoi ce resultat compte-t-il ?',
            answer:
              'Parce qu il transforme une methode tres sensible au seed en detecteur beaucoup plus fiable, ce qui est crucial si l on veut utiliser la methode comme vraie couche de securite.',
          },
        ],
        content: `
## Le probleme

La detection out-of-distribution est la capacite d un systeme a dire : "cette entree ne ressemble pas a ce que j ai vu pendant l entrainement". Dans un systeme IA reeel, cette capacite est une propriete de surete, pas un detail annexe.

Dans mon memoire de master a JKU Linz, sous la supervision du Prof. Sepp Hochreiter et de Claus Hofmann, j ai etudie si un **modele de diffusion conditionnel** pouvait jouer le role d un **classificateur generatif** pour la detection OOD.

## L idee centrale

Le modele reconstruit une image sous deux conditions de classe concurrentes. Si l image est normale, la bonne condition doit mieux la reconstruire. Si l image est inhabituelle, les deux explications se degradent et l ecart entre les erreurs de reconstruction devient le signal d anomalie.

La baseline fonctionnait deja, mais avec une forte sensibilite au seed. A $lambda = 0.0$, la moyenne n etait que de **92.52% +/- 11.07% AUROC**.

## Ma contribution : la separation loss

J ai introduit une **class-conditional separation loss** qui pousse les predictions conditionnelles de bruit a s eloigner :

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Le principe est simple : des explications mieux separees produisent un ecart d erreur de reconstruction plus lisible, donc un score OOD plus robuste.

## Resultats

Le meilleur reglage etait **lambda = 0.02**. Sur trois seeds independants :

- **99.03% +/- 0.07% AUROC** sur CIFAR-10
- **+6.5 points** face a la baseline sans separation
- une variance tres fortement reduite

Le seed-42 a atteint :

- **98.98% AUROC** dans le cadre within-CIFAR
- **90.50%-96.97%** de generalisation zero-shot sur CIFAR-100, Places365, FashionMNIST, Textures et SVHN

## Pourquoi ce resultat est fort

Le point cle n est pas seulement l augmentation du score. C est surtout l effondrement de la variance. Passer de 92.52% +/- 11.07% a 99.03% +/- 0.07% signifie passer d une methode fragile a une approche bien plus credible pour une utilisation reelle.

## Transfert vers l industrie

J ai ensuite applique la meme idee a l inspection de qualite industrielle sur le benchmark public FTI_Zer0P. La baseline YOLO + CDM sur crops a obtenu **0.8673 +/- 0.0230 AUROC** en validation croisee stricte a 5 plis, tandis que la separation loss n a pas apporte d amelioration statistiquement significative apres correction de Holm.

Ce resultat est important lui aussi : l idee transfere tres bien dans un espace semantique comme CIFAR-10, mais pas automatiquement vers des textures industrielles fines et peu abondantes.

## Stack et artefacts

- PyTorch + PyTorch Lightning
- DDPM U-Net conditionnel
- Hydra + Weights & Biases
- Infrastructure GPU JKU

Artefacts publics :

- Memoire PDF : https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code : https://github.com/ahmed-3m/DiffusionOOD
- Transfert industriel : https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Como alcance 99.03% AUROC en deteccion OOD con modelos de difusion condicional',
        excerpt:
          'Mi tesis de master en JKU Linz introdujo una class-conditional separation loss en modelos de difusion condicional usados como clasificadores generativos, alcanzando 99.03% +/- 0.07% AUROC en CIFAR-10 y una mejora estable de +6.5 puntos sobre la base sin separacion.',
        tags: ['Modelos de difusion', 'Deteccion OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modelos generativos'],
        readingTime: '14 min de lectura',
        faq: [
          {
            question: 'Que resultado se logro en CIFAR-10?',
            answer:
              'El mejor promedio sobre tres semillas fue 99.03% +/- 0.07% AUROC. La seed-42 logro 98.98% dentro de CIFAR y generalizo zero-shot a cinco benchmarks externos.',
          },
          {
            question: 'Que es la separation loss?',
            answer:
              'Es un termino extra de entrenamiento que separa las dos predicciones condicionales de ruido para que la diferencia de error de reconstruccion sea mas clara y estable.',
          },
          {
            question: 'Por que importa este resultado?',
            answer:
              'Porque convierte un detector generativo muy sensible a la semilla en uno mucho mas confiable, algo clave si se quiere usar como capa real de seguridad.',
          },
        ],
        content: `
## El problema

La deteccion out-of-distribution es la capacidad de un sistema para decir: "esta entrada no pertenece a lo que vi durante el entrenamiento". En un sistema de IA real, eso es una propiedad de seguridad.

En mi tesis de master en JKU Linz, bajo la supervision del Prof. Sepp Hochreiter y Claus Hofmann, estudie si un **modelo de difusion condicional** podia usarse como **clasificador generativo** para deteccion OOD.

## La idea central

El modelo reconstruye una imagen bajo dos condiciones de clase rivales. Si la imagen es normal, la condicion correcta debe reconstruirla mejor. Si la imagen es rara, ambas explicaciones fallan y la brecha entre errores de reconstruccion se vuelve la senal de anomalia.

La version base ya funcionaba, pero tenia un problema serio: mucha sensibilidad a la semilla. Con $lambda = 0.0$, el promedio fue **92.52% +/- 11.07% AUROC**.

## Mi contribucion: separation loss

Introduje una **class-conditional separation loss** que empuja a separar las predicciones condicionales de ruido:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Si las dos explicaciones son mas distintas, la diferencia de error de reconstruccion es mas clara y el puntaje OOD se vuelve mas robusto.

## Resultados

La mejor configuracion fue **lambda = 0.02**. En tres semillas independientes:

- **99.03% +/- 0.07% AUROC** en CIFAR-10
- **+6.5 puntos porcentuales** sobre la base sin separacion
- una varianza mucho menor

La seed-42 logro:

- **98.98% AUROC** en el escenario within-CIFAR
- **90.50%-96.97%** de generalizacion zero-shot en CIFAR-100, Places365, FashionMNIST, Textures y SVHN

## Por que este resultado es importante

Lo importante no es solo subir el puntaje. Lo importante es reducir drasticamente la varianza. Pasar de 92.52% +/- 11.07% a 99.03% +/- 0.07% significa pasar de una heuristica fragil a un componente de seguridad mucho mas creible.

## Transferencia industrial

Tambien aplique la misma idea al control de calidad industrial en el benchmark publico FTI_Zer0P. Alli, la base YOLO + CDM por crops obtuvo **0.8673 +/- 0.0230 AUROC** con validacion cruzada estricta de 5 folds, mientras que la separation loss no mejoro de forma significativa tras la correccion de Holm.

Ese resultado tambien fue valioso. Mostro que el mecanismo ayuda mucho en espacios semanticos como CIFAR-10, pero no se transfiere automaticamente a texturas industriales pequenas y complejas.

## Stack y artefactos

- PyTorch + PyTorch Lightning
- DDPM U-Net condicionado por clase
- Hydra + Weights & Biases
- Infraestructura GPU de JKU

Artefactos publicos:

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
        title: 'Diffusionsmodelle fuer industrielle Defekterkennung bei PROFACTOR GmbH',
        excerpt:
          'Wie ich eine oeffentliche YOLO + Conditional-Diffusion-Pipeline auf dem FTI_Zer0P Benchmark unter strenger 5-facher Kreuzvalidierung bewertet habe und eine Baseline von 0.8673 +/- 0.0230 AUROC erreicht wurde.',
        tags: ['Diffusionsmodelle', 'Anomalieerkennung', 'Industrielle KI', 'YOLOv8', 'Qualitaetskontrolle'],
        readingTime: '11 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis erreichte das industrielle System?',
            answer:
              'Auf dem oeffentlichen Benchmark lag die strenge 5-fold-CV Baseline bei 0.8673 +/- 0.0230 AUROC. Im produktionsnahen Betrieb erreichte das Entscheidungssetup 98.4% Defektklassifikationsgenauigkeit.',
          },
          {
            question: 'Wie sah die Architektur aus?',
            answer:
              'YOLOv8 wurde als Feature-Backbone genutzt und ein konditionales Diffusionsmodell uebernahm die generative Klassifikation. Multi-Head Conditioning modellierte die verschiedenen Merkmalstypen.',
          },
          {
            question: 'Half die Separation Loss auch hier?',
            answer:
              'Nicht signifikant. Genau das war eine wichtige, ehrliche Erkenntnis: Workflow und Methodik uebertrugen sich, aber nicht jeder Gewinn uebertrug sich auf diesen kleinen industriellen Datensatz.',
          },
        ],
        content: `
## Industrieller Kontext

Bei PROFACTOR GmbH in Oesterreich arbeitete ich an Machine Vision fuer inkjet-bedruckte Bauteile. Das Ziel war klar: Defekte erkennen, bevor fehlerhafte Teile die Linie verlassen.

Schwierig war nicht nur die Modellleistung. Der Datensatz war klein, die Defekte waren heterogen, und die Auswertung musste statistisch sauber sein.

## Die Pipeline

Die Loesung nutzte eine **YOLO + Conditional-Diffusion-Model** Pipeline:

1. YOLOv8 extrahierte strukturierte visuelle Features.
2. Ein konditionales Diffusionsmodell lernte fuer jeden Merkmalstyp, wie normale Feature-Crops aussehen.
3. Der rekonstruktionsbasierte Score wurde als Anomaliesignal verwendet.

Damit wurde derselbe generative Klassifikationsgedanke wie in meiner Thesis in eine viel staerker eingeschraenkte industrielle Umgebung uebertragen.

## Warum das Setting schwierig war

- nur begrenzte Datenmenge
- starke Unterschiede zwischen den Merkmalstypen
- unausgeglichene Defektverteilungen
- Kreuzvalidierung war Pflicht

Darum waere ein einzelner guter Lauf irrefuehrend gewesen. Ich habe die Pipeline auf dem oeffentlichen **FTI_Zer0P** Benchmark mit strenger **5-facher Kreuzvalidierung** bewertet.

## Ergebnisse

Die oeffentliche crop-basierte Baseline bei $lambda = 0.0$ erreichte:

- **0.8673 +/- 0.0230 AUROC**

Im produktionsnahen Schwellwertbetrieb erreichte das System:

- **98.4% Defektklassifikationsgenauigkeit**

Diese Werte beschreiben zwei verschiedene Ebenen:

- AUROC misst die threshold-unabhaengige Rangqualitaet
- 98.4% beschreibt eine betriebliche Entscheidungsschwelle

## Was ich ueber Transfer gelernt habe

Eine der wichtigsten Erkenntnisse war, wo die Separation Loss aufhoert zu helfen. Auf CIFAR-10 war sie ein grosser Gewinn. Auf diesem industriellen Benchmark blieben die nicht-null Einstellungen innerhalb der Fold-Variation und ueberstanden keine Holm-korrigierte Signifikanzpruefung.

Das ist kein negatives Ergebnis, sondern ein praeziseres Ergebnis: Einige Verbesserungen sind stark domaenenabhaengig.

## Engineering-Erkenntnisse

- industrielle ML-Projekte brauchen Auswertungsdisziplin
- Heterogenitaet der Merkmalstypen kann wichtiger sein als Architekturdetails
- oeffentliche Artefakte machen Resultate pruefbar

Artefakte:

- Report PDF: https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: 'Modeles de diffusion pour la detection de defauts industriels chez PROFACTOR GmbH',
        excerpt:
          'Comment j ai evalue une pipeline publique YOLO + diffusion conditionnelle sur le benchmark FTI_Zer0P avec validation croisee stricte a 5 plis, obtenant une baseline de 0.8673 +/- 0.0230 AUROC.',
        tags: ['Modeles de diffusion', 'Detection d anomalie', 'IA industrielle', 'YOLOv8', 'Controle qualite'],
        readingTime: '11 min de lecture',
        faq: [
          {
            question: 'Quel resultat le systeme industriel a-t-il obtenu ?',
            answer:
              'Sur le benchmark public, la baseline en validation croisee stricte a 5 plis a atteint 0.8673 +/- 0.0230 AUROC. En exploitation, le pipeline de decision a atteint 98.4% de precision de classification des defauts.',
          },
          {
            question: 'Quelle etait l architecture ?',
            answer:
              'YOLOv8 servait de backbone de features et un modele de diffusion conditionnel jouait le role de classificateur generatif. Le multi-head conditioning gerait les differents types de motifs inkjet.',
          },
          {
            question: 'La separation loss a-t-elle aide ici aussi ?',
            answer:
              'Pas de facon significative. C est justement une conclusion utile et honnete : la methode se transfere, mais pas tous les gains.',
          },
        ],
        content: `
## Contexte industriel

Chez PROFACTOR GmbH en Autriche, j ai travaille sur la vision industrielle pour des composants de construction imprimes a jet d encre. L objectif etait clair : detecter les defauts avant qu une piece mauvaise quitte la ligne.

La difficulte ne venait pas seulement du modele. Le jeu de donnees etait petit, les defauts etaient heterogenes, et l evaluation devait etre rigoureuse.

## La pipeline

La solution utilisait une pipeline **YOLO + modele de diffusion conditionnel** :

1. YOLOv8 extrayait des features visuelles structurees.
2. Le modele de diffusion apprenait a representer des crops normaux pour chaque type de feature.
3. Le score base sur la reconstruction devenait le signal d anomalie.

On retrouve ici la meme logique de classification generative que dans mon memoire, mais dans un contexte industriel beaucoup plus contraint.

## Pourquoi le probleme etait difficile

- peu de donnees
- forte heterogeneite selon les types de feature
- repartition des defauts desequilibree
- validation croisee indispensable

Un resultat unique aurait donc ete trompeur. J ai evalue la pipeline sur le benchmark public **FTI_Zer0P** avec une **validation croisee stricte a 5 plis**.

## Resultats

La baseline publique par crops a $lambda = 0.0$ a atteint :

- **0.8673 +/- 0.0230 AUROC**

En mode decision en production, le systeme a atteint :

- **98.4% de precision de classification des defauts**

Ces deux nombres decrivent deux choses differentes :

- AUROC mesure la qualite de classement independamment du seuil
- 98.4% mesure une decision operationnelle avec seuil

## Ce que j ai appris sur le transfert

Le point le plus utile a ete de voir ou la separation loss cessait d aider. Sur CIFAR-10, elle etait tres forte. Sur ce benchmark industriel, les reglages non nuls restaient dans la variation des folds et n etaient pas significatifs apres correction de Holm.

Ce n est pas un mauvais resultat. C est un resultat plus precis : certains gains sont dependants du domaine.

## Lecons d ingenierie

- l IA industrielle demande surtout de la rigueur d evaluation
- l heterogeneite des features peut compter davantage que l architecture
- les artefacts publics rendent un resultat verifiable

Artefacts :

- PDF du rapport : https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code : https://github.com/ahmed-3m/InkjetOOD
- Weights : https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Modelos de difusion para deteccion de defectos industriales en PROFACTOR GmbH',
        excerpt:
          'Como evalua una pipeline publica YOLO + difusion condicional en el benchmark FTI_Zer0P con validacion cruzada estricta de 5 folds, logrando una base de 0.8673 +/- 0.0230 AUROC.',
        tags: ['Modelos de difusion', 'Deteccion de anomalias', 'IA industrial', 'YOLOv8', 'Control de calidad'],
        readingTime: '11 min de lectura',
        faq: [
          {
            question: 'Que resultado logro el sistema industrial?',
            answer:
              'En el benchmark publico, la base con validacion cruzada estricta de 5 folds alcanzo 0.8673 +/- 0.0230 AUROC. En produccion, el pipeline de decision alcanzo 98.4% de precision de clasificacion de defectos.',
          },
          {
            question: 'Cual era la arquitectura?',
            answer:
              'YOLOv8 se uso como backbone de features y un modelo de difusion condicional actuo como clasificador generativo. Multi-head conditioning manejo los distintos tipos de features de inkjet.',
          },
          {
            question: 'La separation loss tambien ayudo aqui?',
            answer:
              'No de forma significativa. Esa fue una conclusion muy util: el metodo se transfirio, pero no todos los beneficios pasaron a este pequeno dataset industrial.',
          },
        ],
        content: `
## Contexto industrial

En PROFACTOR GmbH en Austria trabaje en vision por computador para componentes de construccion impresos por inkjet. El objetivo era detectar defectos antes de que una pieza mala saliera de la linea.

La dificultad no era solo el modelo. El dataset era pequeno, los defectos eran heterogeneos y la evaluacion debia ser rigurosa.

## La pipeline

La solucion uso una pipeline **YOLO + modelo de difusion condicional**:

1. YOLOv8 extraia features visuales estructuradas.
2. El modelo de difusion aprendia como debian verse los crops normales de cada tipo de feature.
3. El score basado en reconstruccion se convertia en la senal de anomalia.

Es la misma idea de clasificacion generativa de mi tesis, pero dentro de un entorno industrial mucho mas restringido.

## Por que el problema era dificil

- pocos datos
- mucha heterogeneidad entre tipos de feature
- distribucion de defectos desequilibrada
- validacion cruzada obligatoria

Por eso un solo run llamativo habria sido enganoso. Evalua la pipeline sobre el benchmark publico **FTI_Zer0P** con **validacion cruzada estricta de 5 folds**.

## Resultados

La base publica por crops con $lambda = 0.0$ alcanzo:

- **0.8673 +/- 0.0230 AUROC**

En el modo de decision de produccion, el sistema alcanzo:

- **98.4% de precision de clasificacion de defectos**

Estos dos numeros describen dos cosas distintas:

- AUROC mide calidad de ranking sin depender del umbral
- 98.4% describe una decision operativa con umbral

## Lo que aprendi sobre transferencia

Lo mas valioso fue ver donde la separation loss dejaba de ayudar. En CIFAR-10 fue una gran mejora. En este benchmark industrial, las configuraciones no nulas quedaron dentro de la variacion entre folds y no fueron significativas tras la correccion de Holm.

Eso no debilita la idea. La hace mas precisa: algunas mejoras dependen del dominio.

## Lecciones de ingenieria

- el ML industrial necesita disciplina de evaluacion
- la heterogeneidad de los tipos de feature puede importar mas que la arquitectura
- los artefactos publicos hacen que el resultado sea verificable

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
        title: 'YOLOv8 fuer industrielle Qualitaetskontrolle: Entscheidungen, die wirklich etwas veraendert haben',
        excerpt:
          'Ein praxisnahes Post-Mortem ueber Architektur, Datenstrategie und Deployment-Entscheidungen in industrieller Inkjet-Qualitaetskontrolle statt eines weiteren allgemeinen YOLO-Tutorials.',
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

Die meisten YOLO-Beitraege enden bei "auf grossem Datensatz trainieren und mAP berichten". Industrielle Qualitaetskontrolle funktioniert anders: weniger Bilder, schwierigere Defekte, engere Latenzbudgets und echte Kosten fuer Fehlalarme und uebersehene Fehler.

## Die erste wichtige Entscheidung

Ich habe YOLOv8 **nicht** primaer als Detektor verwendet, sondern als **Feature-Extractor**. Das Druckqualitaetsproblem bestand aus Merkmalen wie Punkten, Abstaenden, Kanten und Winkeln. Diese lassen sich nicht immer sinnvoll als klassische Bounding-Box-Objekte behandeln.

Die Backbone-Features gaben dem nachgelagerten Anomaliedetektor deutlich mehr geometrische Information.

## Datenarbeit war wichtiger als Hype

Bei einem kleinen Datensatz kamen die groessten Gewinne aus Disziplin:

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

## Aussagekraeftige Evaluation

Das System wurde mit strenger **5-facher Kreuzvalidierung** bewertet. AUROC pro Merkmal erzaehlte eine ehrlichere Geschichte als ein einzelner Gesamtscore. Einige Merkmale waren sehr stabil, andere litten vor allem unter zu wenig Daten.

## Deployment-Realitaet

Das finale System musste unter Edge-Bedingungen laufen. Quantisierung half bei der Latenz, aber Zuverlaessigkeit blieb wichtiger. Die praktische Lektion: eine etwas langsamere stabile Variante ist besser als eine schnelle instabile.

## Was wirklich den Unterschied gemacht hat

- YOLO-Features statt erzwungener Detektor-Perspektive
- disziplinierte Evaluation
- Merkmalstypen als unterschiedliche Teilprobleme behandeln
- auf zuverlaessige Inferenz optimieren
        `,
      },
      fr: {
        title: 'YOLOv8 pour le controle qualite industriel : les decisions qui ont vraiment compte',
        excerpt:
          'Un retour pratique sur les choix d architecture, de donnees et de deploiement qui ont compte en controle qualite inkjet industriel, au lieu d un tutoriel YOLO generique.',
        tags: ['Vision par ordinateur', 'YOLOv8', 'IA industrielle', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lecture',
        faq: [
          {
            question: 'Pourquoi utiliser YOLO comme extracteur de features et non comme detecteur ?',
            answer:
              'Parce que la tache n etait pas une detection d objets classique. Les types de feature ressemblaient davantage a des signatures visuelles structurees qu a des objets en bounding box.',
          },
          {
            question: 'Quelle latence a ete atteinte ?',
            answer:
              'Environ 35 ms par composant dans la configuration finale compatible production edge.',
          },
          {
            question: 'Qu est-ce qui a le plus compte ?',
            answer:
              'La discipline sur les donnees, le design des folds et un chemin de deploiement stable ont compte plus qu une architecture a la mode.',
          },
        ],
        content: `
## Ce n etait pas un projet tutoriel

La plupart des articles YOLO s arretent a "entrainer sur un grand dataset et rapporter le mAP". Le controle qualite industriel est tout autre chose : moins d images, defauts plus subtils, budget de latence plus strict, et vraies consequences operationnelles.

## La premiere decision importante

Je n ai pas utilise YOLOv8 principalement comme detecteur, mais comme **extracteur de features**. Le probleme concernait des points, distances, bords et angles. Ce sont des motifs structures, pas toujours des objets detectables de facon classique.

Les features du backbone etaient plus riches pour l etape suivante de detection d anomalie.

## L ingenierie des donnees a plus compte que le buzz

Sur un petit dataset, les plus grands gains sont venus de la discipline :

- construction propre des folds
- absence de fuite de donnees
- augmentations realistes seulement
- prise en compte de l heterogeneite des features

Les astuces synthetiques ont moins aide qu une evaluation honnete du regime de donnees.

## Des choix d entrainement utiles

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

Le plus important n etait pas le chiffre exact, mais l adequation au petit dataset industriel et a la cible de production. Les strategies freeze-then-unfreeze et l analyse par feature ont davantage compte que les reglages par defaut.

## Une evaluation qui veut dire quelque chose

Le systeme a ete evalue avec une **validation croisee stricte a 5 plis**. L AUROC par feature racontait une histoire plus honnete qu un score global unique. Certaines features etaient robustes, d autres etaient surtout limitees par le manque de donnees.

## Realite du deploiement

Le systeme final devait tourner en environnement edge. La quantification aidait la latence, mais la stabilite restait prioritaire. Lecon pratique : un deploiement legerement plus lent mais fiable vaut mieux qu une option rapide mais instable.

## Ce qui a vraiment fait la difference

- utiliser les features YOLO plutot qu imposer une logique de detection
- une boucle d evaluation disciplinee
- traiter les types de feature comme des sous-problemes differents
- optimiser pour une inference fiable
        `,
      },
      es: {
        title: 'YOLOv8 para control de calidad industrial: decisiones que realmente movieron la aguja',
        excerpt:
          'Un post-mortem practico sobre las decisiones de arquitectura, datos y despliegue que importaron en control de calidad inkjet industrial, en lugar de otro tutorial generico de YOLO.',
        tags: ['Vision por computador', 'YOLOv8', 'IA industrial', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lectura',
        faq: [
          {
            question: 'Por que usar YOLO como extractor de features y no como detector?',
            answer:
              'Porque la tarea no era deteccion clasica de objetos. Los tipos de feature se comportaban mas como firmas visuales estructuradas que como objetos en bounding boxes.',
          },
          {
            question: 'Que latencia alcanzo el sistema?',
            answer:
              'Alrededor de 35 ms por componente en la configuracion final apta para produccion edge.',
          },
          {
            question: 'Que fue lo mas importante?',
            answer:
              'La disciplina de datos, el diseno de folds y un camino de despliegue estable importaron mas que perseguir la arquitectura mas llamativa.',
          },
        ],
        content: `
## Esto no fue un proyecto tutorial

La mayoria de los posts sobre YOLO terminan en "entrena sobre un gran dataset y reporta mAP". El control de calidad industrial es otra cosa: menos imagenes, defectos mas dificiles, presupuestos de latencia mas estrictos y consecuencias reales.

## La primera decision importante

No use YOLOv8 principalmente como detector, sino como **extractor de features**. El problema incluia puntos, distancias, bordes y angulos. Esos patrones no siempre encajan bien como objetos clasicos con bounding boxes.

Las features del backbone dieron al detector de anomalias una representacion geometrica mejor.

## La ingenieria de datos importo mas que el hype

Con un dataset pequeno, las mayores mejoras vinieron de la disciplina:

- construccion cuidadosa de folds
- evitar leakage
- augmentations realistas solamente
- respetar la heterogeneidad de las features

Los trucos sinteticos ayudaron menos que una lectura honesta del regimen de datos.

## Ajustes de entrenamiento utiles

\`\`\`python
config = {
    "lr": 1e-4,
    "batch_size": 16,
    "epochs": 150,
    "scheduler": "cosine",
}
\`\`\`

Lo importante no fueron solo los numeros, sino ajustarlos al dataset industrial pequeno y al objetivo de produccion. Freeze-then-unfreeze, optimizacion conservadora y analisis por feature importaron mas que usar defaults.

## Una evaluacion que significaba algo

El sistema se evaluo con **validacion cruzada estricta de 5 folds**. El AUROC por feature conto una historia mas honesta que un solo score global. Algunas features eran estables; otras estaban limitadas sobre todo por la falta de datos.

## Realidad del despliegue

El sistema final tenia que funcionar en edge. La cuantizacion mejoro la latencia, pero la fiabilidad siguio siendo lo primero. La leccion practica fue simple: una version un poco mas lenta pero estable es mejor que una rapida e inestable.

## Que movio la aguja de verdad

- usar features de YOLO en vez de forzar una perspectiva de detector
- una evaluacion disciplinada
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
        title: 'Shipping Faultrix: What I Learned Building an AI SaaS in 5 Months',
        excerpt:
          'What changed when I moved from research into product building: Faultrix, an AI SaaS for construction quality control that generates ONORM-aligned reports in under a minute.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'Production AI', 'Faultrix'],
        readingTime: '9 min read',
        faq: [
          {
            question: 'What is Faultrix?',
            answer:
              'Faultrix is an AI-powered construction quality-control SaaS. Users upload site photos and receive a structured ONORM-aligned report with evidence handling and security-minded storage.',
          },
          {
            question: 'What stack powers it?',
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

Faultrix is an AI-powered construction quality-control SaaS. A user uploads site photos, the system analyzes them, and the platform generates an ONORM-aligned report in under a minute.

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
        title: 'Faultrix ausliefern: Was ich beim Bau eines AI-SaaS in 5 Monaten gelernt habe',
        excerpt:
          'Was sich veraendert hat, als ich von Forschung in Produktbau gewechselt bin: Faultrix, ein AI-SaaS fuer Bauqualitaetskontrolle mit ONORM-orientierten Berichten in unter einer Minute.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'Production AI', 'Faultrix'],
        readingTime: '9 Min. Lesezeit',
        faq: [
          {
            question: 'Was ist Faultrix?',
            answer:
              'Faultrix ist ein KI-basiertes SaaS fuer Bauqualitaetskontrolle. Nutzer laden Baustellenfotos hoch und erhalten einen strukturierten ONORM-orientierten Bericht mit Evidenzkette und sicherheitsbewusster Speicherung.',
          },
          {
            question: 'Welcher Stack steckt dahinter?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker und ein Python-lastiger AI-Workflow im Hintergrund.',
          },
          {
            question: 'Was war am schwierigsten?',
            answer:
              'Nicht die KI selbst. Schwieriger war, das Produkt an echte Arbeitsablaeufe, Formatvorgaben und eine reibungsarme UX anzupassen.',
          },
        ],
        content: `
## Von Forschung zu Produkt

Faultrix ist ein KI-basiertes SaaS fuer Bauqualitaetskontrolle. Nutzer laden Fotos hoch, das System analysiert sie, und in weniger als einer Minute entsteht ein ONORM-orientierter Bericht.

Beim Bauen wurde mir klar: Der Schritt von Forschung zu Produkt besteht nicht primaer aus einem anderen Modell, sondern daraus, das ganze System nuetzlich zu machen.

## Der Produkt-Stack

Faultrix wurde gebaut mit:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

Ich habe den Stack so gewaehlt, dass schnelle Iteration moeglich ist und der operative Aufbau klar bleibt.

## Das Schwierigste war nicht das Modell

Die KI war wichtig, aber nicht der haerteste Teil. Schwieriger waren:

- Ausgaben so formen, dass sie zu realen Berichtsablaeufen passen
- den Nutzerpfad kurz und klar halten
- Evidenz und Speicherung vertrauenswuerdig praesentieren

Genau hier helfen Forschungsinstinkte teilweise und teilweise nicht. Strenge uebertraegt sich gut. Produktintuition muss man sich in der Praxis erarbeiten.

## Was die Forschung uebertragen hat

- systematisches Experimentieren
- Qualitaetstests vor dem Release
- gutes Gespuer dafuer, wann menschliche Pruefung noetig ist

## Was die Forschung nicht automatisch lehrt

- Pricing
- Reibung beim Onboarding
- wie schnell Nutzer Geduld verlieren
- wie oft UX wichtiger ist als reine Modellstaerke

## Die wichtigste Lektion

Die erste Version von Faultrix hatte starke KI, aber zu viel Reibung im Ablauf. Daraus entstand die wichtigste Produktlektion: Nutzer erleben Wert ueber den Weg, nicht ueber das Architekturdiagramm.

Wenn der Weg zum Nutzen zu lang ist, spielt die darunterliegende Raffinesse kaum noch eine Rolle.
        `,
      },
      fr: {
        title: 'Livrer Faultrix : ce que j ai appris en construisant un SaaS IA en 5 mois',
        excerpt:
          'Ce qui a change lorsque je suis passe de la recherche au produit : Faultrix, un SaaS IA pour le controle qualite construction qui genere des rapports alignes ONORM en moins d une minute.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'IA en production', 'Faultrix'],
        readingTime: '9 min de lecture',
        faq: [
          {
            question: 'Qu est-ce que Faultrix ?',
            answer:
              'Faultrix est un SaaS de controle qualite construction pilote par IA. Les utilisateurs chargent des photos de chantier et recoivent un rapport structure aligne ONORM avec gestion des preuves et stockage securise.',
          },
          {
            question: 'Quel stack utilise-t-il ?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker, plus un workflow IA fortement centre sur Python.',
          },
          {
            question: 'Qu est-ce qui a ete le plus difficile ?',
            answer:
              'Pas l IA en elle-meme. Le plus difficile a ete d adapter le produit aux vrais usages, aux attentes de format et a une UX sans friction.',
          },
        ],
        content: `
## De la recherche au produit

Faultrix est un SaaS de controle qualite construction alimente par IA. L utilisateur charge des photos de chantier, le systeme les analyse, puis genere un rapport aligne ONORM en moins d une minute.

Le vrai saut entre recherche et produit n est pas seulement une question de modele. C est la capacite a rendre tout le systeme utile.

## Le stack produit

Faultrix a ete construit avec :

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

Ce stack a ete choisi pour iterer vite et garder un systeme simple a faire evoluer.

## Le plus dur n etait pas le modele

La partie IA comptait, mais ce n etait pas le plus dur. Le plus dur etait :

- adapter la sortie aux attentes reelles de reporting
- garder le parcours utilisateur court et clair
- rendre la gestion des preuves et du stockage digne de confiance

La rigueur de recherche aide beaucoup. L intuition produit, elle, se construit au contact du terrain.

## Ce que la recherche m a apporte

- experimentation structuree
- tests de qualite avant livraison
- bonne comprehension des limites du modele

## Ce que la recherche ne m a pas donne automatiquement

- la logique de pricing
- la gestion de la friction d onboarding
- la vitesse a laquelle un utilisateur perd patience
- le fait que l UX peut compter plus que la sophistication du modele

## La lecon principale

La premiere version de Faultrix avait une IA solide mais trop de friction. La lecon a ete simple : la valeur est ressentie a travers le parcours utilisateur, pas a travers le schema technique.

Si le chemin vers la valeur est trop long, la sophistication du dessous ne compense pas.
        `,
      },
      es: {
        title: 'Lanzando Faultrix: lo que aprendi construyendo un SaaS de IA en 5 meses',
        excerpt:
          'Lo que cambio cuando pase de investigacion a producto: Faultrix, un SaaS de IA para control de calidad en construccion que genera informes alineados con ONORM en menos de un minuto.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'IA en produccion', 'Faultrix'],
        readingTime: '9 min de lectura',
        faq: [
          {
            question: 'Que es Faultrix?',
            answer:
              'Faultrix es un SaaS de control de calidad en construccion impulsado por IA. Los usuarios suben fotos de obra y reciben un informe estructurado alineado con ONORM, con manejo de evidencia y almacenamiento seguro.',
          },
          {
            question: 'Que stack usa?',
            answer:
              'Next.js, Convex, OpenAI API, Clerk, Cloudflare R2, Stripe, Docker y un flujo de IA muy apoyado en Python.',
          },
          {
            question: 'Que fue lo mas dificil?',
            answer:
              'No la IA en si. Lo mas dificil fue adaptar el producto a flujos reales, expectativas de formato y una UX con poca friccion.',
          },
        ],
        content: `
## De investigacion a producto

Faultrix es un SaaS de control de calidad en construccion impulsado por IA. El usuario sube fotos de obra, el sistema las analiza y genera un informe alineado con ONORM en menos de un minuto.

El salto real entre investigacion y producto no es solo elegir otro modelo. Es lograr que todo el sistema sea util.

## El stack del producto

Faultrix fue construido con:

- Next.js
- Convex
- OpenAI API
- Clerk
- Cloudflare R2
- Stripe
- Docker

El stack se eligio para iterar rapido y mantener una base operativa clara.

## Lo mas dificil no fue el modelo

La parte de IA importaba, pero no fue lo mas duro. Lo mas dificil fue:

- ajustar la salida a expectativas reales de reporte
- mantener el flujo del usuario corto y claro
- presentar evidencia y almacenamiento de forma confiable

La disciplina de investigacion ayuda mucho. La intuicion de producto hay que ganarsela en el campo.

## Lo que si me dio la investigacion

- experimentacion estructurada
- pruebas de calidad antes de lanzar
- comprension de cuando pedir revision humana

## Lo que la investigacion no me dio automaticamente

- pricing
- friccion de onboarding
- cuan rapido el usuario pierde paciencia
- cuanto puede importar mas la UX que la potencia del modelo

## La leccion principal

La primera version de Faultrix tenia una IA fuerte pero demasiada friccion. La leccion fue clara: el usuario siente el valor a traves del camino, no del diagrama de arquitectura.

Si el camino hacia el valor es largo, la sofisticacion tecnica deja de importar.
        `,
      },
      ar: {
        title: 'إطلاق Faultrix: ما الذي تعلمته من بناء SaaS بالذكاء الاصطناعي خلال 5 أشهر',
        excerpt:
          'ما الذي تغير عندما انتقلت من البحث إلى المنتج: Faultrix، منصة SaaS للذكاء الاصطناعي في مراقبة جودة البناء، تولد تقارير متوافقة مع ONORM في أقل من دقيقة.',
        tags: ['LLM', 'SaaS', 'Next.js', 'OpenAI', 'ذكاء اصطناعي في الإنتاج', 'Faultrix'],
        readingTime: '9 دقائق قراءة',
        faq: [
          {
            question: 'ما هو Faultrix؟',
            answer:
              'Faultrix هو SaaS لمراقبة جودة البناء مدعوم بالذكاء الاصطناعي. يرفع المستخدم صور الموقع ويحصل على تقرير منظم متوافق مع ONORM مع إدارة للأدلة وتخزين آمن.',
          },
          {
            question: 'ما هو الـ stack المستخدم؟',
            answer:
              'Next.js وConvex وOpenAI API وClerk وCloudflare R2 وStripe وDocker، مع workflow يعتمد كثيراً على Python في طبقة الذكاء الاصطناعي.',
          },
          {
            question: 'ما أصعب جزء؟',
            answer:
              'ليس الذكاء الاصطناعي نفسه. الأصعب كان جعل المنتج مناسباً لسير العمل الحقيقي وتوقعات التنسيق وتجربة استخدام منخفضة الاحتكاك.',
          },
        ],
        content: `
## من البحث إلى المنتج

Faultrix هو SaaS لمراقبة جودة البناء بالذكاء الاصطناعي. يرفع المستخدم صور الموقع، ثم يحللها النظام ويولد تقريراً متوافقاً مع ONORM في أقل من دقيقة.

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
