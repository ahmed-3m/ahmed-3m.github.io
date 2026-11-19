import type { TranslationMap } from '@/lib/i18n-config'

export const portfolioCopy = {
  role: { en: 'AI/ML Engineer', de: 'KI- und ML-Ingenieur', fr: 'Ingénieur IA et ML', es: 'Ingeniero de IA y ML', ar: 'مهندس ذكاء اصطناعي وتعلّم آلي' },
  lede: {
    en: 'I build AI systems that inspect manufactured products and recognize unfamiliar images.',
    de: 'Ich entwickle KI-Systeme, die Industrieprodukte prüfen und unbekannte Bilder erkennen.',
    fr: 'Je développe des systèmes d’IA qui contrôlent des produits manufacturés et détectent les images inhabituelles.',
    es: 'Desarrollo sistemas de IA que inspeccionan productos fabricados y detectan imágenes desconocidas.',
    ar: 'أبني أنظمة ذكاء اصطناعي تفحص المنتجات المصنّعة وتتعرف على الصور غير المألوفة.',
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
} satisfies Record<string, TranslationMap>

export const selectedWork = [
  {
    slug: 'inkjet-ood',
    href: '/case-studies/inkjet-ood/#evaluation',
    visual: true,
    context: { en: 'PROFACTOR · Industrial computer vision', de: 'PROFACTOR · Industrielle Bildverarbeitung', fr: 'PROFACTOR · Vision industrielle', es: 'PROFACTOR · Visión industrial', ar: 'PROFACTOR · الرؤية الحاسوبية الصناعية' },
    title: { en: 'Finding defects in inkjet printing', de: 'Fehler im Tintenstrahldruck erkennen', fr: 'Détecter les défauts d’impression jet d’encre', es: 'Detectar defectos en la impresión por inyección de tinta', ar: 'اكتشاف عيوب الطباعة بنفث الحبر' },
    summary: {
      en: 'Small print defects are easy to miss on manufactured parts. At PROFACTOR, I built and evaluated a vision pipeline that locates printed features and flags unusual patterns.',
      de: 'Kleine Druckfehler auf gefertigten Bauteilen sind leicht zu übersehen. Bei PROFACTOR habe ich eine Bildverarbeitung entwickelt und getestet, die gedruckte Elemente lokalisiert und auffällige Muster markiert.',
      fr: 'Les petits défauts d’impression passent facilement inaperçus sur les pièces fabriquées. Chez PROFACTOR, j’ai développé et évalué une chaîne de vision qui repère les éléments imprimés et signale les motifs inhabituels.',
      es: 'Los pequeños defectos de impresión son fáciles de pasar por alto en las piezas fabricadas. En PROFACTOR desarrollé y evalué un sistema de visión que localiza los elementos impresos y señala patrones inusuales.',
      ar: 'يسهل إغفال عيوب الطباعة الصغيرة على القطع المصنّعة. في PROFACTOR بنيت وقيّمت نظام رؤية يحدد مواضع العناصر المطبوعة وينبّه إلى الأنماط غير المعتادة.',
    },
    link: { en: 'See the industrial evaluation', de: 'Industrielle Evaluation ansehen', fr: 'Voir l’évaluation industrielle', es: 'Ver la evaluación industrial', ar: 'اطّلع على التقييم الصناعي' },
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
    link: { en: 'See thesis findings and explorer', de: 'Ergebnisse und interaktive Analyse ansehen', fr: 'Voir les résultats et l’explorateur', es: 'Ver los resultados y el explorador', ar: 'اطّلع على نتائج الرسالة والمستكشف' },
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
  },
] satisfies Array<{
  slug: 'inkjet-ood' | 'diffusion-ood' | 'sihem'
  href: string
  visual?: boolean
  context: TranslationMap
  title: TranslationMap
  summary: TranslationMap
  link: TranslationMap
}>
