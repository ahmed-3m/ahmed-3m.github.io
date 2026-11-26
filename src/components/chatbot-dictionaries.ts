import type { TranslationMap } from '@/lib/i18n-config'

/**
 * Chatbot copy shared by the always-rendered launcher shell (ChatBot.tsx) and the
 * lazily loaded panel (ChatBotPanel.tsx).
 *
 * It lives in its own module so the shell can render the launcher label and the
 * panel's dialog label without pulling the heavy panel chunk into the initial
 * page bundle.
 */

export const GENIE_NAME = 'Genie\u{1F9DE}\u200D\u2642\uFE0F'

export const CHAT_COPY = {
  dialogLabel: {
    en: 'Ask Genie',
    de: 'Genie fragen',
    fr: 'Demander à Genie',
    es: 'Preguntar a Genie',
    ar: 'اسأل جيني',
  },
  title: {
    en: GENIE_NAME,
    de: GENIE_NAME,
    fr: GENIE_NAME,
    es: GENIE_NAME,
    ar: GENIE_NAME,
  },
  welcome: {
    en: 'Find out what Ahmed built, how he tested it, or where to get his CV.',
    de: 'Erfahren Sie, was Ahmed entwickelt hat, wie er es getestet hat und wo sein Lebenslauf zu finden ist.',
    fr: 'Découvrez ce qu’Ahmed a développé, comment il l’a testé ou où télécharger son CV.',
    es: 'Descubre qué desarrolló Ahmed, cómo lo evaluó o dónde descargar su CV.',
    ar: 'تعرّف على مشاريع أحمد وكيف اختبرها، أو اعثر على سيرته الذاتية.',
  },
  suggestions: {
    en: 'Suggested questions',
    de: 'Vorgeschlagene Fragen',
    fr: 'Questions suggérées',
    es: 'Preguntas sugeridas',
    ar: 'أسئلة مقترحة',
  },
  followUps: {
    en: 'Explore further',
    de: 'Mehr entdecken',
    fr: 'Aller plus loin',
    es: 'Seguir explorando',
    ar: 'اكتشف المزيد',
  },
  placeholder: {
    en: 'Ask Genie...',
    de: 'Genie fragen...',
    fr: 'Demander à Genie...',
    es: 'Preguntar a Genie...',
    ar: 'اسأل جيني...',
  },
  close: {
    en: 'Close chat',
    de: 'Chat schließen',
    fr: 'Fermer le chat',
    es: 'Cerrar chat',
    ar: 'إغلاق الدردشة',
  },
  open: {
    en: 'Ask Genie',
    de: 'Genie fragen',
    fr: 'Demander à Genie',
    es: 'Preguntar a Genie',
    ar: 'اسأل جيني',
  },
  send: {
    en: 'Send message',
    de: 'Nachricht senden',
    fr: 'Envoyer le message',
    es: 'Enviar mensaje',
    ar: 'إرسال الرسالة',
  },
  typing: {
    en: 'Genie is typing',
    de: 'Genie schreibt',
    fr: 'Genie écrit',
    es: 'Genie está escribiendo',
    ar: 'جيني يكتب الآن',
  },
  limitedAnswers: {
    en: 'Open-ended answers are temporarily unavailable. Ask about Ahmed’s projects, thesis, background, or CV.',
    de: 'Freie Antworten sind vorübergehend nicht verfügbar. Fragen Sie nach Ahmeds Projekten, der Masterarbeit, seinem Hintergrund oder Lebenslauf.',
    fr: 'Les réponses aux questions libres sont temporairement indisponibles. Posez une question sur les projets, le mémoire, le parcours ou le CV d’Ahmed.',
    es: 'Las respuestas abiertas no están disponibles temporalmente. Pregunta por los proyectos, la tesis, la trayectoria o el CV de Ahmed.',
    ar: 'الإجابات عن الأسئلة المفتوحة غير متاحة مؤقتًا. اسأل عن مشاريع أحمد أو رسالته أو خلفيته أو سيرته الذاتية.',
  },
  rateLimited: {
    en: 'Too many requests right now. Please wait a bit before asking another open-ended question, or try the suggested prompts.',
    de: 'Gerade zu viele Anfragen. Bitte warten Sie einen Moment vor der nächsten freien Frage oder nutzen Sie die vorgeschlagenen Fragen.',
    fr: 'Trop de requêtes en ce moment. Patientez un instant avant une nouvelle question libre ou utilisez les questions suggérées.',
    es: 'Demasiadas solicitudes en este momento. Espera un momento antes de hacer otra pregunta abierta o prueba las preguntas sugeridas.',
    ar: 'تم تجاوز حد الطلبات حاليًا. يُرجى الانتظار قليلًا قبل طرح سؤال مفتوح جديد، أو تجربة الأسئلة المقترحة.',
  },
  incompleteReply: {
    en: 'The reply was cut short.',
    de: 'Die Antwort wurde unterbrochen.',
    fr: 'La réponse a été interrompue.',
    es: 'La respuesta se interrumpió.',
    ar: 'انقطع الرد قبل اكتماله.',
  },
  retryReply: {
    en: 'Try again',
    de: 'Erneut versuchen',
    fr: 'Réessayer',
    es: 'Volver a intentar',
    ar: 'أعد المحاولة',
  },
  genericError: {
    en: 'Something went wrong while contacting the assistant.',
    de: 'Beim Kontakt mit dem Assistenten ist etwas schiefgelaufen.',
    fr: 'Une erreur est survenue pendant le contact avec l’assistant.',
    es: 'Ocurrió un problema al contactar al asistente.',
    ar: 'حدث خطأ أثناء الاتصال بالمساعد.',
  },
  newChat: {
    en: 'New chat',
    de: 'Neuer Chat',
    fr: 'Nouvelle conversation',
    es: 'Nuevo chat',
    ar: 'محادثة جديدة',
  },
  stopGenerating: {
    en: 'Stop generating',
    de: 'Antwort stoppen',
    fr: 'Arrêter la génération',
    es: 'Detener respuesta',
    ar: 'إيقاف التوليد',
  },
} satisfies Record<string, TranslationMap>
