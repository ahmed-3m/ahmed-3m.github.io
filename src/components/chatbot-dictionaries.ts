import type { TranslationMap } from '@/lib/i18n-config'

/**
 * Chatbot copy shared by the always-rendered launcher shell (ChatBot.tsx) and the
 * lazily loaded panel (ChatBotPanel.tsx).
 *
 * It lives in its own module so the shell can render the launcher label and the
 * panel's dialog label without pulling the heavy panel chunk into the initial
 * page bundle. Contents are unchanged from the pre-split ChatBot.tsx.
 */

export const GENIE_NAME = 'Genie\u{1F9DE}\u200D\u2642\uFE0F'

export const CHAT_COPY = {
  dialogLabel: {
    en: 'Ask Genie',
    de: 'Fragen zu Ahmed',
    fr: 'Questions sur Ahmed',
    es: 'Preguntar sobre Ahmed',
    ar: 'اسأل عن أحمد',
  },
  title: {
    en: GENIE_NAME,
    de: GENIE_NAME,
    fr: GENIE_NAME,
    es: GENIE_NAME,
    ar: GENIE_NAME,
  },
  welcome: {
    en: `Hi, I'm ${GENIE_NAME}, Ahmed's Personal assistant. Ask me about Ahmed's research, products, projects, or background.`,
    de: `Hi, ich bin ${GENIE_NAME}, Ahmeds persönlicher Assistent. Frage nach Ahmeds Forschung, Produkten, Projekten oder Hintergrund.`,
    fr: `Bonjour, je suis ${GENIE_NAME}, l’assistant personnel d’Ahmed. Posez une question sur la recherche, les produits, les projets ou le parcours d’Ahmed.`,
    es: `Hola, soy ${GENIE_NAME}, el asistente personal de Ahmed. Pregunta sobre la investigación, los productos, los proyectos o la trayectoria de Ahmed.`,
    ar: `مرحباً، أنا ${GENIE_NAME}، المساعد الشخصي لأحمد. اسألني عن أبحاث أحمد أو منتجاته أو مشاريعه أو خلفيته.`,
  },
  placeholder: {
    en: 'Ask Genie...',
    de: 'Frage zu Ahmed...',
    fr: 'Question sur Ahmed...',
    es: 'Pregunta sobre Ahmed...',
    ar: 'اسأل عن أحمد...',
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
    de: 'Ahmed schreibt',
    fr: 'Ahmed répond',
    es: 'Ahmed está respondiendo',
    ar: 'أحمد يكتب الآن',
  },
  missingToken: {
    en: 'Add NEXT_PUBLIC_GROQ_TOKEN or NEXT_PUBLIC_BIGMODEL_TOKEN to enable the assistant.',
    de: 'Füge NEXT_PUBLIC_GROQ_TOKEN oder NEXT_PUBLIC_BIGMODEL_TOKEN hinzu, um den Assistenten zu aktivieren.',
    fr: 'Ajoutez NEXT_PUBLIC_GROQ_TOKEN ou NEXT_PUBLIC_BIGMODEL_TOKEN pour activer l’assistant.',
    es: 'Agrega NEXT_PUBLIC_GROQ_TOKEN o NEXT_PUBLIC_BIGMODEL_TOKEN para activar el asistente.',
    ar: 'أضف NEXT_PUBLIC_GROQ_TOKEN أو NEXT_PUBLIC_BIGMODEL_TOKEN لتفعيل المساعد.',
  },
  genericError: {
    en: 'Something went wrong while contacting the assistant.',
    de: 'Beim Kontakt mit dem Assistenten ist etwas schiefgelaufen.',
    fr: 'Une erreur est survenue pendant le contact avec l’assistant.',
    es: 'Ocurrió un problema al contactar al asistente.',
    ar: 'حدث خطأ أثناء الاتصال بالمساعد.',
  },
} satisfies Record<string, TranslationMap>
