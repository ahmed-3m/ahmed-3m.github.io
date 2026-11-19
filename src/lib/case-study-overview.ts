import type { TranslationMap } from '@/lib/i18n-config'

export const caseStudyOverview = {
  'inkjet-ood': {
    problem: {
      en: 'Small flaws in patterns printed on building components can be hard to spot by eye. The inspection system also has to cope with several patterns and very few defect examples.',
      de: 'Kleine Fehler in Druckmustern auf Bauteilen sind mit bloßem Auge schwer zu erkennen. Die Prüfung muss außerdem mit mehreren Mustern und wenigen Fehlerbeispielen auskommen.',
      fr: 'Les petits défauts dans les motifs imprimés sur des éléments de construction sont difficiles à voir. Le système doit aussi traiter plusieurs motifs avec peu d’exemples de défauts.',
      es: 'Los pequeños defectos en patrones impresos sobre componentes de construcción son difíciles de ver. El sistema también debe manejar varios patrones con pocos ejemplos de defectos.',
      ar: 'يصعب رصد العيوب الصغيرة في الأنماط المطبوعة على مكوّنات البناء بالعين. ويجب أن يتعامل نظام الفحص مع أنماط متعددة وأمثلة قليلة على العيوب.',
    },
    contribution: {
      en: 'I annotated print images at PROFACTOR and built a two-stage pipeline that first locates printed features, then scores each one for defects.',
      de: 'Bei PROFACTOR habe ich Druckbilder annotiert und eine zweistufige Pipeline gebaut. Sie lokalisiert gedruckte Merkmale und bewertet sie anschließend auf Fehler.',
      fr: 'Chez PROFACTOR, j’ai annoté les images et créé une chaîne en deux étapes qui localise les éléments imprimés avant d’évaluer chacun d’eux.',
      es: 'En PROFACTOR, anoté imágenes y creé un sistema de dos etapas que localiza los elementos impresos y evalúa cada uno en busca de defectos.',
      ar: 'في PROFACTOR، علّمت صور الطباعة وبنيت نظامًا من مرحلتين يحدد العناصر المطبوعة أولًا، ثم يقيّم كل عنصر بحثًا عن عيوب.',
    },
    outcome: {
      en: 'The study established a baseline on five held-out folds. The training change that improved the CIFAR-10 experiment yielded no reliable gain on these print samples.',
      de: 'Die Studie ermittelte einen Referenzwert auf fünf zurückgehaltenen Teilmengen. Die Trainingsänderung aus dem CIFAR-10-Versuch brachte bei den Druckproben keinen verlässlichen Gewinn.',
      fr: 'L’étude a établi une référence sur cinq partitions de test. Le changement d’entraînement qui avait amélioré les résultats sur CIFAR-10 n’a pas apporté de gain fiable sur les échantillons imprimés.',
      es: 'El estudio estableció una referencia en cinco particiones de prueba. El cambio de entrenamiento que mejoró el experimento de CIFAR-10 no produjo una mejora fiable en estas muestras.',
      ar: 'حددت الدراسة خط أساس على خمس طيات اختبار. لم يحقق تعديل التدريب الذي حسّن تجربة CIFAR-10 تحسنًا موثوقًا على عينات الطباعة.',
    },
  },
  'diffusion-ood': {
    problem: {
      en: 'An image classifier can sound confident about an image unlike anything it should recognize. I wanted a way to flag those inputs before relying on its predictions.',
      de: 'Ein Bildklassifikator kann auch bei einem unbekannten Bild überzeugend wirken. Ich wollte solche Eingaben erkennen, bevor man sich auf seine Vorhersagen verlässt.',
      fr: 'Un classificateur peut se montrer sûr de lui face à une image très différente de celles qu’il doit reconnaître. Je voulais signaler ces entrées avant de me fier à ses prédictions.',
      es: 'Un clasificador puede mostrarse seguro ante una imagen muy distinta de las que debería reconocer. Quería detectar esas entradas antes de confiar en sus predicciones.',
      ar: 'قد يبدو مصنّف الصور واثقًا أمام صورة تختلف عما يفترض أن يتعرف عليه. أردت وسيلة لرصد هذه المدخلات قبل الاعتماد على توقعاته.',
    },
    contribution: {
      en: 'For my JKU Linz thesis, I trained a diffusion model to reconstruct the same image under two different assumptions and tested a training objective that makes the two answers easier to distinguish.',
      de: 'Für meine Masterarbeit an der JKU Linz trainierte ich ein Diffusionsmodell, dasselbe Bild unter zwei verschiedenen Annahmen zu rekonstruieren. Ich testete eine Zielfunktion, die die Antworten besser unterscheidbar macht.',
      fr: 'Pour mon mémoire à la JKU Linz, j’ai entraîné un modèle de diffusion à reconstruire la même image sous deux hypothèses et testé un objectif d’entraînement qui distingue mieux les deux réponses.',
      es: 'Para mi tesis en la JKU Linz, entrené un modelo de difusión para reconstruir la misma imagen bajo dos supuestos y probé un objetivo de entrenamiento que facilita distinguir las dos respuestas.',
      ar: 'في رسالتي بجامعة يوهانس كيبلر في لينتس، درّبت نموذج انتشار على إعادة بناء الصورة نفسها وفق افتراضين واختبرت هدف تدريب يساعد على التمييز بين الإجابتين.',
    },
    outcome: {
      en: 'The training change improved both the average score and its consistency across three runs of the CIFAR-10 airplane-versus-rest test.',
      de: 'Die Trainingsänderung verbesserte den Mittelwert und verringerte die Streuung in drei Durchläufen des CIFAR-10-Tests „Flugzeuge gegen den Rest“.',
      fr: 'Le changement a amélioré le score moyen et sa stabilité sur trois essais du test CIFAR-10 opposant les avions aux autres classes.',
      es: 'El cambio mejoró la puntuación media y su consistencia en tres ejecuciones de la prueba de aviones frente al resto de CIFAR-10.',
      ar: 'حسّن تعديل التدريب متوسط الأداء واتساقه عبر ثلاث تجارب على CIFAR-10 قارنت صور الطائرات بباقي الفئات.',
    },
  },
  sihem: {
    problem: {
      en: 'When a schedule changes, a static task list still leaves you to work out what to do next. That can be especially difficult when planning and task initiation already take effort.',
      de: 'Wenn sich der Tagesplan ändert, hilft eine starre Aufgabenliste kaum bei der Wahl des nächsten Schritts. Das ist besonders schwierig, wenn Planung und Aufgabenbeginn ohnehin Kraft kosten.',
      fr: 'Quand un emploi du temps change, une liste de tâches fixe laisse encore le choix de la prochaine étape à la personne. Cela peut être difficile quand planifier et commencer une tâche demandent déjà un effort.',
      es: 'Cuando cambia un horario, una lista fija aún deja en tus manos decidir qué hacer después. Puede ser especialmente difícil cuando planificar y empezar tareas ya requiere esfuerzo.',
      ar: 'عندما يتغيّر الجدول، تظل الخطوة التالية متروكة لك إن كنت تعتمد على قائمة مهام ثابتة. وقد يصعب ذلك عندما يتطلب التخطيط وبدء المهام جهدًا من الأساس.',
    },
    contribution: {
      en: 'I built the scheduling, reminders, Telegram bot, and installable web app. Sihem uses calendar changes and routines to decide when a check-in could help.',
      de: 'Ich entwickelte die Planung, Erinnerungen, den Telegram-Bot und die installierbare Web-App. Sihem nutzt Kalenderänderungen und Routinen, um den Zeitpunkt für eine Nachfrage zu bestimmen.',
      fr: 'J’ai créé la planification, les rappels, le bot Telegram et l’application web installable. Sihem utilise les changements de calendrier et les routines pour choisir le moment d’un suivi.',
      es: 'Creé la planificación, los avisos, el bot de Telegram y la aplicación web instalable. Sihem usa los cambios de calendario y las rutinas para decidir cuándo puede ser útil un aviso.',
      ar: 'بنيت الجدولة والتذكيرات وروبوت تيليجرام وتطبيق الويب القابل للتثبيت. يستخدم Sihem تغيّرات التقويم والروتين لتحديد الوقت المناسب لإرسال متابعة.',
    },
    outcome: {
      en: 'Sihem runs as a private, invitation-only beta. Its morning briefings and evening reviews are available to invited testers.',
      de: 'Sihem läuft als private Beta mit Einladung. Eingeladene Testpersonen können die morgendliche Übersicht und den abendlichen Rückblick nutzen.',
      fr: 'Sihem fonctionne en bêta privée sur invitation. Les personnes invitées peuvent utiliser les bilans du matin et du soir.',
      es: 'Sihem está en beta privada por invitación. Las personas invitadas pueden usar los resúmenes de la mañana y las revisiones de la noche.',
      ar: 'يعمل Sihem في نسخة تجريبية خاصة بالدعوة. ويمكن للمختبرين المدعوين استخدام الملخصات الصباحية والمراجعات المسائية.',
    },
  },
} satisfies Record<string, Record<'problem' | 'contribution' | 'outcome', TranslationMap>>
