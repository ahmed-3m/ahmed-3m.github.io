'use client'

import { CALENDLY_URL } from '@/lib/booking'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  label: {
    en: 'Schedule meeting',
    de: 'Meeting planen',
    fr: 'Planifier un rendez-vous',
    es: 'Programar reunión',
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
      {variant === 'link' && !compact && (
        <>
          {' '}
          <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
        </>
      )}
    </a>
  )
}
