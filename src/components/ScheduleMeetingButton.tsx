'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

const DEFAULT_CALENDLY_URL = 'https://calendly.com/ahmed-3m'
const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? DEFAULT_CALENDLY_URL

const copy = {
  label: {
    en: 'Schedule meeting',
    de: 'Meeting planen',
    fr: 'Planifier un rendez-vous',
    es: 'Programar reunion',
    ar: 'جدولة اجتماع',
  },
} satisfies Record<string, TranslationMap>

export default function ScheduleMeetingButton({
  className,
  variant = 'ghost',
  compact = false,
}: {
  className?: string
  variant?: 'ghost' | 'link'
  compact?: boolean
}) {
  const { t } = useI18n()

  const cls = variant === 'link' ? (className ?? 'cd-contact-link') : (className ?? 'cd-btn-calendly')

  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      aria-label={`${t(copy.label)} (Calendly)`}
    >
      {t(copy.label)}
      {variant === 'link' && !compact && ' ->'}
    </a>
  )
}
