'use client'

import { useId, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const DEFAULT_FRONT_DESK_URL = 'https://pilot-voice.a3m201493.workers.dev/'
const FRONT_DESK_URL = process.env.NEXT_PUBLIC_FRONT_DESK_URL || DEFAULT_FRONT_DESK_URL

const copy = {
  label: {
    en: 'Talk to my AI front desk',
    de: 'Mit meinem KI-Empfang sprechen',
    fr: 'Parler à mon accueil IA',
    es: 'Hablar con mi recepción con IA',
    ar: 'تحدّث مع موظف الاستقبال الذكي',
  },
  title: {
    en: 'Talk to my AI front desk',
    de: 'Mit meinem KI-Empfang sprechen',
    fr: 'Parler à mon accueil IA',
    es: 'Hablar con mi recepción con IA',
    ar: 'تحدّث مع موظف الاستقبال الذكي',
  },
  intro: {
    en: 'An AI version of me answers in my cloned voice, with an animated face. It can tell you about my work and help you book a meeting. It is a live demo: calls last up to 3 minutes, it can make mistakes, and it may be busy or unavailable.',
    de: 'Eine KI-Version von mir antwortet mit meiner geklonten Stimme und einem animierten Gesicht. Sie erzählt von meiner Arbeit und hilft dir, ein Meeting zu buchen. Es ist eine Live-Demo: Gespräche dauern höchstens 3 Minuten, die KI kann Fehler machen und ist manchmal besetzt oder nicht erreichbar.',
    fr: "Une version IA de moi répond avec ma voix clonée et un visage animé. Elle peut présenter mon travail et vous aider à réserver un rendez-vous. C'est une démo en direct : les appels durent 3 minutes au plus, l'IA peut se tromper et peut être occupée ou indisponible.",
    es: 'Una versión de mí con IA responde con mi voz clonada y una cara animada. Puede contarte sobre mi trabajo y ayudarte a reservar una reunión. Es una demo en vivo: las llamadas duran como máximo 3 minutos, puede equivocarse y a veces está ocupada o no disponible.',
    ar: 'تجيبك نسخة مني بالذكاء الاصطناعي بصوتي المستنسخ ووجه متحرك. يمكنها أن تحدثك عن عملي وتساعدك على حجز موعد. هذا عرض تجريبي مباشر: تستمر المكالمة 3 دقائق كحد أقصى، وقد يخطئ الذكاء الاصطناعي، وقد يكون مشغولاً أو غير متاح.',
  },
  data: {
    en: 'Your browser will ask for the microphone. Your voice goes to Google (Gemini) so the AI can understand and answer you; on the current plan, Google may use it to improve its services. The answer text goes to ElevenLabs to speak in my voice, and that audio goes to Anam to animate the face. I do not record or store your call. Please do not share sensitive personal details.',
    de: 'Dein Browser fragt nach dem Mikrofon. Deine Stimme geht an Google (Gemini), damit die KI dich versteht und antwortet; im aktuellen Tarif kann Google sie zur Verbesserung seiner Dienste nutzen. Der Antworttext geht an ElevenLabs, das ihn mit meiner Stimme spricht, und dieses Audio geht an Anam, das das Gesicht animiert. Ich zeichne dein Gespräch nicht auf und speichere es nicht. Bitte teile keine sensiblen persönlichen Daten.',
    fr: "Votre navigateur demandera l'accès au micro. Votre voix est envoyée à Google (Gemini) pour que l'IA vous comprenne et vous réponde ; avec l'offre actuelle, Google peut l'utiliser pour améliorer ses services. Le texte de la réponse est envoyé à ElevenLabs pour être dit avec ma voix, puis cet audio est envoyé à Anam pour animer le visage. Je n'enregistre ni ne conserve votre appel. Merci de ne pas partager de données personnelles sensibles.",
    es: 'Tu navegador pedirá acceso al micrófono. Tu voz va a Google (Gemini) para que la IA te entienda y te responda; con el plan actual, Google puede usarla para mejorar sus servicios. El texto de la respuesta va a ElevenLabs para decirlo con mi voz, y ese audio va a Anam para animar la cara. No grabo ni guardo tu llamada. Por favor, no compartas datos personales sensibles.',
    ar: 'سيطلب متصفحك إذن الميكروفون. يُرسَل صوتك إلى Google ‏(Gemini) ليفهمك الذكاء الاصطناعي ويجيبك، وفي الخطة الحالية قد تستخدمه Google لتحسين خدماتها. يُرسَل نص الإجابة إلى ElevenLabs لنطقه بصوتي، ثم يُرسَل هذا الصوت إلى Anam لتحريك الوجه. لا أسجّل مكالمتك ولا أحفظها. يُرجى عدم مشاركة بيانات شخصية حساسة.',
  },
  consent: {
    en: 'The call opens in a new tab. By starting it, you agree to this.',
    de: 'Das Gespräch öffnet sich in einem neuen Tab. Mit dem Start stimmst du dem zu.',
    fr: "L'appel s'ouvre dans un nouvel onglet. En le lançant, vous acceptez ces conditions.",
    es: 'La llamada se abre en una pestaña nueva. Al iniciarla, aceptas esto.',
    ar: 'تُفتح المكالمة في علامة تبويب جديدة. ببدئها، فإنك توافق على ما سبق.',
  },
  start: {
    en: 'Start the call',
    de: 'Gespräch starten',
    fr: "Lancer l'appel",
    es: 'Iniciar la llamada',
    ar: 'ابدأ المكالمة',
  },
  cancel: {
    en: 'Not now',
    de: 'Jetzt nicht',
    fr: 'Pas maintenant',
    es: 'Ahora no',
    ar: 'ليس الآن',
  },
} satisfies Record<string, TranslationMap>

const noopSubscribe = () => () => {}

/** False during the static render and hydration, true once mounted in the browser. */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

export default function FrontDeskButton({
  className,
  variant = 'ghost',
  compact = false,
}: {
  className?: string
  variant?: 'ghost' | 'link'
  compact?: boolean
}) {
  const { t } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const bodyId = useId()
  const isClient = useIsClient()

  const cls = variant === 'link' ? (className ?? 'cd-contact-link') : (className ?? 'cd-btn-ghost')

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={cls}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        {t(copy.label)}
        {variant === 'link' && !compact && (
          <>
            {' '}
            <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
          </>
        )}
      </button>
      {isClient && createPortal(
        <dialog
          ref={dialog}
          className="portfolio-figure-dialog front-desk-dialog"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close()
          }}
          onClose={() => trigger.current?.focus()}
        >
          <div>
            <h2 id={titleId} className="front-desk-title">{t(copy.title)}</h2>
            <div id={bodyId}>
              <p>{t(copy.intro)}</p>
              <p>{t(copy.data)}</p>
              <p className="front-desk-consent">{t(copy.consent)}</p>
            </div>
            <div className="front-desk-actions">
              <a
                href={FRONT_DESK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cd-btn-primary"
                onClick={() => dialog.current?.close()}
              >
                {t(copy.start)}
              </a>
              <button type="button" className="cd-btn-ghost" onClick={() => dialog.current?.close()}>
                {t(copy.cancel)}
              </button>
            </div>
          </div>
        </dialog>,
        document.body,
      )}
    </>
  )
}
