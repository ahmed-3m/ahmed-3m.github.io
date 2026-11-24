'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

// Legal texts exist in all five site languages. German is the binding version; the other
// languages carry a short note saying so.

const EMAIL = 'ahmed.mo.0595@gmail.com'
const UPDATED = '2026-11-25'

type Section = { heading: TranslationMap; paragraphs: TranslationMap[] }

const titles = {
  impressum: {
    en: 'Legal notice (Impressum)',
    de: 'Impressum',
    fr: 'Mentions légales (Impressum)',
    es: 'Aviso legal (Impressum)',
    ar: 'البيانات القانونية (Impressum)',
  },
  privacy: {
    en: 'Privacy notice',
    de: 'Datenschutzerklärung',
    fr: 'Politique de confidentialité',
    es: 'Aviso de privacidad',
    ar: 'إشعار الخصوصية',
  },
} satisfies Record<string, TranslationMap>

const bindingNote: TranslationMap = {
  en: 'This is a translation for your convenience. If the versions differ, the German text applies.',
  fr: 'Cette traduction est fournie pour votre commodité. En cas de différence, le texte allemand fait foi.',
  es: 'Esta traducción se ofrece para tu comodidad. Si las versiones difieren, prevalece el texto en alemán.',
  ar: 'هذه ترجمة للتيسير فقط. عند وجود اختلاف بين النسخ، يُعتمد النص الألماني.',
}

const updatedLabel: TranslationMap = {
  en: 'Last updated',
  de: 'Stand',
  fr: 'Dernière mise à jour',
  es: 'Última actualización',
  ar: 'آخر تحديث',
}

const emailLabel: TranslationMap = {
  en: 'Email',
  de: 'E-Mail',
  fr: 'E-mail',
  es: 'Correo electrónico',
  ar: 'البريد الإلكتروني',
}

const impressum: Section[] = [
  {
    heading: {
      en: 'Information under § 5 ECG and § 25 MedienG',
      de: 'Angaben gemäß § 5 ECG und Offenlegung gemäß § 25 MedienG',
      fr: 'Informations selon le § 5 ECG et le § 25 MedienG',
      es: 'Información según el § 5 ECG y el § 25 MedienG',
      ar: 'معلومات وفق المادة 5 من ECG والمادة 25 من MedienG',
    },
    paragraphs: [
      { en: 'Ahmed Mohammed', de: 'Ahmed Mohammed', fr: 'Ahmed Mohammed', es: 'Ahmed Mohammed', ar: 'Ahmed Mohammed' },
      {
        en: 'Linz, Austria',
        de: 'Linz, Österreich',
        fr: 'Linz, Autriche',
        es: 'Linz, Austria',
        ar: 'لينز، النمسا',
      },
    ],
  },
  {
    heading: {
      en: 'Purpose of this website',
      de: 'Blattlinie',
      fr: 'Objet de ce site',
      es: 'Finalidad de este sitio web',
      ar: 'الغرض من هذا الموقع',
    },
    paragraphs: [
      {
        en: 'A personal website presenting my work as an AI/ML engineer: projects, research, writing, news, and a live demo of an AI front desk.',
        de: 'Persönliche Website mit Informationen über meine Arbeit als AI/ML Engineer: Projekte, Forschung, Texte, News und eine Live-Demo eines KI-Empfangs.',
        fr: 'Un site personnel qui présente mon travail d’ingénieur IA/ML : projets, recherche, écrits, actualités et une démo en direct d’un accueil IA.',
        es: 'Un sitio web personal que presenta mi trabajo como ingeniero de IA/ML: proyectos, investigación, textos, noticias y una demo en vivo de una recepción con IA.',
        ar: 'موقع شخصي يعرض عملي كمهندس ذكاء اصطناعي وتعلّم آلي: المشاريع والأبحاث والكتابات والأخبار وعرضاً مباشراً لموظف استقبال يعمل بالذكاء الاصطناعي.',
      },
    ],
  },
  {
    heading: {
      en: 'Links to other websites',
      de: 'Links zu anderen Websites',
      fr: 'Liens vers d’autres sites',
      es: 'Enlaces a otros sitios web',
      ar: 'روابط إلى مواقع أخرى',
    },
    paragraphs: [
      {
        en: 'I am not responsible for the content of external websites linked from this site. When I learn that a linked page breaks the law, I remove the link.',
        de: 'Für Inhalte externer Websites, auf die diese Seite verlinkt, bin ich nicht verantwortlich. Sobald mir Rechtsverletzungen bekannt werden, entferne ich den Link.',
        fr: 'Je ne suis pas responsable du contenu des sites externes vers lesquels ce site renvoie. Si j’apprends qu’une page liée enfreint la loi, je retire le lien.',
        es: 'No soy responsable del contenido de los sitios externos enlazados desde este sitio. Si sé que una página enlazada infringe la ley, elimino el enlace.',
        ar: 'لست مسؤولاً عن محتوى المواقع الخارجية المرتبطة من هذا الموقع. وإذا علمت أن صفحة مرتبطة تخالف القانون، أزيل الرابط.',
      },
    ],
  },
]

const privacy: Section[] = [
  {
    heading: {
      en: 'Who is responsible',
      de: 'Verantwortlicher',
      fr: 'Responsable du traitement',
      es: 'Responsable del tratamiento',
      ar: 'المسؤول عن المعالجة',
    },
    paragraphs: [
      {
        en: 'Ahmed Mohammed, Linz, Austria. For any privacy question or request, write to the email address below.',
        de: 'Ahmed Mohammed, Linz, Österreich. Für Fragen und Anfragen zum Datenschutz schreib mir an die unten angegebene E-Mail-Adresse.',
        fr: 'Ahmed Mohammed, Linz, Autriche. Pour toute question ou demande sur la protection des données, écrivez à l’adresse e-mail ci-dessous.',
        es: 'Ahmed Mohammed, Linz, Austria. Para cualquier pregunta o solicitud sobre privacidad, escribe a la dirección de correo indicada abajo.',
        ar: 'Ahmed Mohammed، لينز، النمسا. لأي سؤال أو طلب يتعلق بالخصوصية، راسلني على عنوان البريد الإلكتروني أدناه.',
      },
    ],
  },
  {
    heading: { en: 'Hosting', de: 'Hosting', fr: 'Hébergement', es: 'Alojamiento', ar: 'الاستضافة' },
    paragraphs: [
      {
        en: 'This site is hosted on GitHub Pages (GitHub, Inc., USA). When you open a page, GitHub processes your IP address and technical request data to deliver the site and keep it secure. Legal basis: my legitimate interest in running a secure website (Art. 6(1)(f) GDPR). See the GitHub Privacy Statement for details.',
        de: 'Diese Website wird auf GitHub Pages (GitHub, Inc., USA) gehostet. Beim Aufruf einer Seite verarbeitet GitHub deine IP-Adresse und technische Anfragedaten, um die Seite auszuliefern und abzusichern. Rechtsgrundlage: mein berechtigtes Interesse an einem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Details stehen in der Datenschutzerklärung von GitHub.',
        fr: 'Ce site est hébergé sur GitHub Pages (GitHub, Inc., États-Unis). Lorsque vous ouvrez une page, GitHub traite votre adresse IP et des données techniques de la requête pour fournir le site et le sécuriser. Base juridique : mon intérêt légitime à exploiter un site sécurisé (art. 6, par. 1, point f du RGPD). Voir la déclaration de confidentialité de GitHub pour plus de détails.',
        es: 'Este sitio está alojado en GitHub Pages (GitHub, Inc., EE. UU.). Cuando abres una página, GitHub trata tu dirección IP y datos técnicos de la solicitud para servir el sitio y mantenerlo seguro. Base jurídica: mi interés legítimo en operar un sitio web seguro (art. 6.1.f del RGPD). Consulta la declaración de privacidad de GitHub para más detalles.',
        ar: 'يُستضاف هذا الموقع على GitHub Pages (شركة GitHub, Inc. في الولايات المتحدة). عند فتح صفحة، تعالج GitHub عنوان IP الخاص بك وبيانات الطلب التقنية لتقديم الموقع وحمايته. الأساس القانوني: مصلحتي المشروعة في تشغيل موقع آمن (المادة 6(1)(و) من اللائحة العامة لحماية البيانات). راجع بيان الخصوصية لدى GitHub لمزيد من التفاصيل.',
      },
    ],
  },
  {
    heading: {
      en: 'One preference cookie, no tracking',
      de: 'Ein Einstellungs-Cookie, kein Tracking',
      fr: 'Un cookie de préférence, aucun suivi',
      es: 'Una cookie de preferencia, sin seguimiento',
      ar: 'ملف تعريف ارتباط واحد للتفضيلات، بلا تتبّع',
    },
    paragraphs: [
      {
        en: 'This site sets one cookie, called "language". It holds only the code of the language you use (for example "de") so that pages open in that language. It lasts one year and is not used for tracking. Your language, theme and display choices are also saved in your browser’s local storage. I do not read or store any of this; the site uses no analytics or advertising tools, and its fonts are served from the site itself.',
        de: 'Diese Website setzt ein einziges Cookie namens „language“. Es enthält nur das Kürzel deiner Sprache (zum Beispiel „de“), damit Seiten in dieser Sprache öffnen. Es gilt ein Jahr und dient nicht dem Tracking. Deine Sprach-, Design- und Anzeige-Auswahl wird außerdem im Local Storage deines Browsers gespeichert. Ich lese und speichere davon nichts; die Website nutzt keine Analyse- oder Werbetools, und Schriften werden von der Website selbst geladen.',
        fr: 'Ce site dépose un seul cookie, nommé « language ». Il contient uniquement le code de la langue que vous utilisez (par exemple « de ») afin que les pages s’ouvrent dans cette langue. Il dure un an et ne sert pas au suivi. Vos choix de langue, de thème et d’affichage sont aussi enregistrés dans le stockage local de votre navigateur. Je ne lis ni ne conserve rien de tout cela ; le site n’utilise aucun outil d’analyse ou de publicité, et ses polices sont servies par le site lui-même.',
        es: 'Este sitio crea una única cookie, llamada «language». Solo guarda el código del idioma que usas (por ejemplo «de») para que las páginas se abran en ese idioma. Dura un año y no se usa para seguimiento. Tus preferencias de idioma, tema y visualización también se guardan en el almacenamiento local de tu navegador. Yo no leo ni guardo nada de esto; el sitio no usa herramientas de analítica ni de publicidad, y sus fuentes se sirven desde el propio sitio.',
        ar: 'يضع هذا الموقع ملف تعريف ارتباط واحداً اسمه "language". يحتوي فقط على رمز اللغة التي تستخدمها (مثل "de") حتى تُفتح الصفحات بهذه اللغة. مدته سنة واحدة ولا يُستخدم للتتبّع. وتُحفظ اختياراتك للغة والمظهر والعرض أيضاً في التخزين المحلي لمتصفحك. لا أقرأ أياً من ذلك ولا أخزّنه؛ ولا يستخدم الموقع أي أدوات تحليل أو إعلان، وتُحمَّل خطوطه من الموقع نفسه.',
      },
    ],
  },
  {
    heading: {
      en: 'Chat assistant',
      de: 'Chat-Assistent',
      fr: 'Assistant de chat',
      es: 'Asistente de chat',
      ar: 'مساعد الدردشة',
    },
    paragraphs: [
      {
        en: 'Some answers of the chat assistant are built into the site. Other questions are sent through my server (a Cloudflare Worker) to the AI providers Z.ai and, as a fallback, Groq, which generate the answer. Your IP address is used to limit the number of requests and is kept for at most one hour. I do not store your chat messages. Please do not enter sensitive personal data. Legal basis: my legitimate interest in answering your question (Art. 6(1)(f) GDPR).',
        de: 'Manche Antworten des Chat-Assistenten sind in die Website eingebaut. Andere Fragen werden über meinen Server (einen Cloudflare Worker) an die KI-Anbieter Z.ai und ersatzweise Groq geschickt, die die Antwort erzeugen. Deine IP-Adresse wird zur Begrenzung der Anfragen genutzt und höchstens eine Stunde gespeichert. Deine Chat-Nachrichten speichere ich nicht. Bitte gib keine sensiblen persönlichen Daten ein. Rechtsgrundlage: mein berechtigtes Interesse, deine Frage zu beantworten (Art. 6 Abs. 1 lit. f DSGVO).',
        fr: 'Certaines réponses de l’assistant de chat sont intégrées au site. Les autres questions passent par mon serveur (un Cloudflare Worker) vers les fournisseurs d’IA Z.ai et, en secours, Groq, qui génèrent la réponse. Votre adresse IP sert à limiter le nombre de requêtes et est conservée une heure au maximum. Je ne conserve pas vos messages. Merci de ne pas saisir de données personnelles sensibles. Base juridique : mon intérêt légitime à répondre à votre question (art. 6, par. 1, point f du RGPD).',
        es: 'Algunas respuestas del asistente de chat están integradas en el sitio. Otras preguntas se envían a través de mi servidor (un Cloudflare Worker) a los proveedores de IA Z.ai y, como respaldo, Groq, que generan la respuesta. Tu dirección IP se usa para limitar el número de solicitudes y se guarda como máximo una hora. No guardo tus mensajes. Por favor, no introduzcas datos personales sensibles. Base jurídica: mi interés legítimo en responder a tu pregunta (art. 6.1.f del RGPD).',
        ar: 'بعض إجابات مساعد الدردشة مدمجة في الموقع. أما الأسئلة الأخرى فتُرسل عبر خادمي (Cloudflare Worker) إلى مزوّدَي الذكاء الاصطناعي Z.ai، وGroq كبديل احتياطي، اللذين يولّدان الإجابة. يُستخدم عنوان IP الخاص بك للحد من عدد الطلبات ويُحتفظ به ساعة واحدة كحد أقصى. لا أخزّن رسائل الدردشة. يُرجى عدم إدخال بيانات شخصية حساسة. الأساس القانوني: مصلحتي المشروعة في الإجابة عن سؤالك (المادة 6(1)(و) من اللائحة العامة لحماية البيانات).',
      },
    ],
  },
  {
    heading: {
      en: 'AI front desk (voice demo)',
      de: 'KI-Empfang (Sprach-Demo)',
      fr: 'Accueil IA (démo vocale)',
      es: 'Recepción con IA (demo de voz)',
      ar: 'موظف الاستقبال بالذكاء الاصطناعي (عرض صوتي)',
    },
    paragraphs: [
      {
        en: 'Only if you start a call: the demo runs on Cloudflare. Your voice is sent to Google (Gemini API) so the AI can understand and answer you; on the current plan, Google may use it to improve its services. The text of each reply is sent to ElevenLabs to speak it in my cloned voice, and that audio is sent to Anam to animate the face. Calls last at most 3 minutes.',
        de: 'Nur wenn du ein Gespräch startest: Die Demo läuft auf Cloudflare. Deine Stimme geht an Google (Gemini API), damit die KI dich versteht und antwortet; im aktuellen Tarif kann Google sie zur Verbesserung seiner Dienste nutzen. Der Text jeder Antwort geht an ElevenLabs, das ihn mit meiner geklonten Stimme spricht, und dieses Audio geht an Anam, das das Gesicht animiert. Gespräche dauern höchstens 3 Minuten.',
        fr: 'Seulement si vous lancez un appel : la démo fonctionne sur Cloudflare. Votre voix est envoyée à Google (API Gemini) pour que l’IA vous comprenne et vous réponde ; avec l’offre actuelle, Google peut l’utiliser pour améliorer ses services. Le texte de chaque réponse est envoyé à ElevenLabs, qui le prononce avec ma voix clonée, et cet audio est envoyé à Anam, qui anime le visage. Les appels durent au maximum 3 minutes.',
        es: 'Solo si inicias una llamada: la demo funciona en Cloudflare. Tu voz se envía a Google (API de Gemini) para que la IA te entienda y responda; con el plan actual, Google puede usarla para mejorar sus servicios. El texto de cada respuesta se envía a ElevenLabs, que lo pronuncia con mi voz clonada, y ese audio se envía a Anam, que anima el rostro. Las llamadas duran como máximo 3 minutos.',
        ar: 'فقط إذا بدأت مكالمة: يعمل العرض على Cloudflare. يُرسل صوتك إلى Google (واجهة Gemini) لكي يفهمك الذكاء الاصطناعي ويجيبك؛ وفي الخطة الحالية قد تستخدمه Google لتحسين خدماتها. ويُرسل نص كل ردّ إلى ElevenLabs لتنطقه بصوتي المستنسخ، ثم يُرسل هذا الصوت إلى Anam لتحريك الوجه. تستمر المكالمات 3 دقائق كحد أقصى.',
      },
      {
        en: 'I do not record or store your voice or what is said. My server logs only counts and timings. To limit calls, your IP address is turned into a salted hash, kept only as long as the hourly and daily limits need it. If you ask the AI to book a meeting, it shows a Calendly link, which may carry the name and email you said; Calendly only receives them if you open the link.',
        de: 'Ich zeichne deine Stimme und das Gesagte nicht auf und speichere sie nicht. Mein Server protokolliert nur Zähler und Zeiten. Zur Begrenzung der Anrufe wird deine IP-Adresse in einen gesalzenen Hash umgewandelt und nur so lange aufbewahrt, wie die Stunden- und Tageslimits es erfordern. Wenn du die KI bittest, ein Meeting zu buchen, zeigt sie einen Calendly-Link, der den genannten Namen und die E-Mail-Adresse enthalten kann; Calendly erhält sie nur, wenn du den Link öffnest.',
        fr: 'Je n’enregistre ni ne conserve votre voix ni ce qui est dit. Mon serveur ne journalise que des compteurs et des durées. Pour limiter les appels, votre adresse IP est transformée en empreinte salée (hash), conservée seulement le temps nécessaire aux limites horaires et journalières. Si vous demandez à l’IA de réserver un rendez-vous, elle affiche un lien Calendly qui peut contenir le nom et l’e-mail que vous avez donnés ; Calendly ne les reçoit que si vous ouvrez le lien.',
        es: 'No grabo ni guardo tu voz ni lo que se dice. Mi servidor solo registra recuentos y tiempos. Para limitar las llamadas, tu dirección IP se convierte en un hash con sal, que se guarda solo mientras lo requieren los límites por hora y por día. Si pides a la IA que reserve una reunión, muestra un enlace de Calendly que puede incluir el nombre y el correo que dijiste; Calendly solo los recibe si abres el enlace.',
        ar: 'لا أسجّل صوتك ولا ما يُقال ولا أخزّنه. يسجّل خادمي الأعداد والأزمنة فقط. وللحد من المكالمات، يُحوَّل عنوان IP الخاص بك إلى قيمة تجزئة مملّحة (hash) لا يُحتفظ بها إلا بقدر ما تتطلبه الحدود الساعية واليومية. إذا طلبت من الذكاء الاصطناعي حجز اجتماع، يعرض رابط Calendly قد يتضمن الاسم والبريد الإلكتروني اللذين ذكرتهما؛ ولا تتلقاهما Calendly إلا إذا فتحت الرابط.',
      },
      {
        en: 'Legal basis: your consent when you start the call (Art. 6(1)(a) GDPR). You can withdraw it at any time by ending the call. Some of these providers process data outside the EU, including in the USA.',
        de: 'Rechtsgrundlage: deine Einwilligung beim Start des Gesprächs (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit widerrufen, indem du das Gespräch beendest. Einige dieser Anbieter verarbeiten Daten außerhalb der EU, auch in den USA.',
        fr: 'Base juridique : votre consentement au lancement de l’appel (art. 6, par. 1, point a du RGPD). Vous pouvez le retirer à tout moment en mettant fin à l’appel. Certains de ces fournisseurs traitent des données hors de l’UE, notamment aux États-Unis.',
        es: 'Base jurídica: tu consentimiento al iniciar la llamada (art. 6.1.a del RGPD). Puedes retirarlo en cualquier momento terminando la llamada. Algunos de estos proveedores tratan datos fuera de la UE, también en EE. UU.',
        ar: 'الأساس القانوني: موافقتك عند بدء المكالمة (المادة 6(1)(أ) من اللائحة العامة لحماية البيانات). يمكنك سحبها في أي وقت بإنهاء المكالمة. يعالج بعض هؤلاء المزوّدين البيانات خارج الاتحاد الأوروبي، بما في ذلك في الولايات المتحدة.',
      },
    ],
  },
  {
    heading: {
      en: 'Booking a meeting',
      de: 'Meeting buchen',
      fr: 'Réserver un rendez-vous',
      es: 'Reservar una reunión',
      ar: 'حجز اجتماع',
    },
    paragraphs: [
      {
        en: 'The booking buttons open Calendly in a new tab. What you enter there is processed by Calendly under its own privacy policy.',
        de: 'Die Buchungs-Buttons öffnen Calendly in einem neuen Tab. Was du dort eingibst, verarbeitet Calendly nach seiner eigenen Datenschutzerklärung.',
        fr: 'Les boutons de réservation ouvrent Calendly dans un nouvel onglet. Ce que vous y saisissez est traité par Calendly selon sa propre politique de confidentialité.',
        es: 'Los botones de reserva abren Calendly en una pestaña nueva. Lo que introduzcas allí lo trata Calendly según su propia política de privacidad.',
        ar: 'تفتح أزرار الحجز موقع Calendly في علامة تبويب جديدة. وما تُدخله هناك تعالجه Calendly وفق سياسة الخصوصية الخاصة بها.',
      },
    ],
  },
  {
    heading: { en: 'Your rights', de: 'Deine Rechte', fr: 'Vos droits', es: 'Tus derechos', ar: 'حقوقك' },
    paragraphs: [
      {
        en: 'You have the right to access, rectification, erasure, restriction of processing, data portability and objection, and to withdraw consent at any time. You can also complain to the Austrian Data Protection Authority (Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna, www.dsb.gv.at).',
        de: 'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, eine Einwilligung jederzeit zu widerrufen. Außerdem kannst du dich bei der Österreichischen Datenschutzbehörde beschweren (Barichgasse 40–42, 1030 Wien, www.dsb.gv.at).',
        fr: 'Vous avez un droit d’accès, de rectification, d’effacement, de limitation du traitement, de portabilité et d’opposition, ainsi que le droit de retirer votre consentement à tout moment. Vous pouvez aussi déposer une plainte auprès de l’autorité autrichienne de protection des données (Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Vienne, www.dsb.gv.at).',
        es: 'Tienes derecho de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición, y a retirar tu consentimiento en cualquier momento. También puedes presentar una reclamación ante la autoridad austriaca de protección de datos (Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Viena, www.dsb.gv.at).',
        ar: 'لك الحق في الاطلاع والتصحيح والمحو وتقييد المعالجة ونقل البيانات والاعتراض، وفي سحب موافقتك في أي وقت. ويمكنك أيضاً تقديم شكوى إلى هيئة حماية البيانات النمساوية (Österreichische Datenschutzbehörde، Barichgasse 40–42، 1030 فيينا، www.dsb.gv.at).',
      },
    ],
  },
]

export default function LegalContent({ kind }: { kind: 'impressum' | 'privacy' }) {
  const { t, lang } = useI18n()
  const sections = kind === 'impressum' ? impressum : privacy

  return (
    <article className="legal-page cd-container">
      <h1>{t(titles[kind])}</h1>
      {lang !== 'de' && <p className="legal-note">{t(bindingNote)}</p>}
      {sections.map((section) => (
        <section key={section.heading.en}>
          <h2>{t(section.heading)}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.en}>{t(paragraph)}</p>
          ))}
        </section>
      ))}
      <section>
        <h2>{t(emailLabel)}</h2>
        <p>
          <a href={`mailto:${EMAIL}`}>
            <bdi dir="ltr">{EMAIL}</bdi>
          </a>
        </p>
      </section>
      <p className="legal-updated">
        {t(updatedLabel)}: <bdi dir="ltr">{UPDATED}</bdi>
      </p>
    </article>
  )
}
