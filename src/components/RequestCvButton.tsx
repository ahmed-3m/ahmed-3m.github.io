'use client'

import { useEffect, useState } from 'react'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const EMAIL = 'ahmed.mo.0595@gmail.com'
const SUBJECT = 'CV Request'
const RESET_AFTER_MS = 2600

const copy = {
  idle: {
    en: 'Request CV',
    de: 'CV anfragen',
    fr: 'Demander le CV',
    es: 'Solicitar CV',
    ar: 'اطلب السيرة الذاتية',
  },
  copied: {
    en: 'Email copied',
    de: 'E-Mail kopiert',
    fr: 'Email copie',
    es: 'Correo copiado',
    ar: 'تم نسخ البريد',
  },
  manual: {
    en: 'Use contact email',
    de: 'Kontakt-E-Mail nutzen',
    fr: 'Utiliser l email de contact',
    es: 'Usar el correo de contacto',
    ar: 'استخدم بريد التواصل',
  },
  helper: {
    en: 'Copies the CV request email locally and also tries to open your mail app.',
    de: 'Kopiert lokal die CV-Anfrage und versucht auch, dein Mailprogramm zu oeffnen.',
    fr: 'Copie localement l email de demande de CV et essaie aussi d ouvrir votre application mail.',
    es: 'Copia localmente el correo de solicitud de CV y tambien intenta abrir tu app de correo.',
    ar: 'ينسخ بريد طلب السيرة محليا ويحاول ايضا فتح تطبيق البريد لديك.',
  },
} satisfies Record<string, TranslationMap>

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the manual copy path.
    }
  }

  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', 'true')
  area.style.position = 'absolute'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.focus()
  area.select()
  area.setSelectionRange(0, area.value.length)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }

  document.body.removeChild(area)
  return copied
}

export default function RequestCvButton({
  className,
  variant = 'ghost',
  compact = false,
}: {
  className?: string
  variant?: 'ghost' | 'link'
  compact?: boolean
}) {
  const { t } = useI18n()
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timeout = window.setTimeout(() => setStatus('idle'), RESET_AFTER_MS)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function handleClick() {
    const message = `${EMAIL}\nSubject: ${SUBJECT}`
    const copied = await copyToClipboard(message)

    if (copied) {
      setStatus('copied')
      return
    }

    setStatus('manual')
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const label =
    status === 'copied' ? t(copy.copied) : status === 'manual' ? t(copy.manual) : t(copy.idle)

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={className ?? 'cd-contact-link'}
        title={t(copy.helper)}
      >
        {label}
        {!compact && ' ->'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className ?? 'cd-btn-ghost'}
      title={t(copy.helper)}
    >
      {label}
    </button>
  )
}
