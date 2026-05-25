'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

const CV_PATH = '/cv.pdf'
const CV_FILENAME = 'Ahmed_Mohammed_CV.pdf'

const copy = {
  label: {
    en: 'Download CV',
    de: 'CV herunterladen',
    fr: 'Télécharger le CV',
    es: 'Descargar CV',
    ar: 'تحميل السيرة الذاتية',
  },
} satisfies Record<string, TranslationMap>

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

  const cls = variant === 'link' ? (className ?? 'cd-contact-link') : (className ?? 'cd-btn-ghost')

  return (
    <a
      href={CV_PATH}
      download={CV_FILENAME}
      className={cls}
    >
      {t(copy.label)}
      {variant === 'link' && !compact && ' ->'}
    </a>
  )
}
