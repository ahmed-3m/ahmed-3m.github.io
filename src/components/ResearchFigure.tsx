'use client'

import { useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useI18n, type TranslationMap } from '@/lib/i18n'

export type ResearchFigureData = {
  src: string
  previewSrc?: string
  width: number
  height: number
  alt: TranslationMap
  caption: TranslationMap
}

const copy = {
  open: { en: 'Enlarge image', de: 'Bild vergrößern', fr: 'Agrandir l’image', es: 'Ampliar imagen', ar: 'تكبير الصورة' },
  close: { en: 'Close image viewer', de: 'Bildansicht schließen', fr: 'Fermer la visionneuse', es: 'Cerrar el visor', ar: 'إغلاق عارض الصورة' },
  original: { en: 'Open original image', de: 'Originalbild öffnen', fr: 'Ouvrir l’image originale', es: 'Abrir la imagen original', ar: 'فتح الصورة الأصلية' },
} satisfies Record<string, TranslationMap>

export default function ResearchFigure({ figure, chart = false }: { figure: ResearchFigureData; chart?: boolean }) {
  const { t } = useI18n()
  const captionId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const alt = t(figure.alt)
  const caption = t(figure.caption)

  return (
    <figure className={chart ? 'cd-rf-chart' : undefined}>
      <a
        ref={trigger}
        href={figure.src}
        className={chart ? 'portfolio-figure-trigger' : 'cd-rfc-visual-button'}
        aria-label={`${t(copy.open)}: ${alt}`}
        aria-haspopup="dialog"
        title={t(copy.open)}
        onClick={(event) => {
          const viewer = dialog.current
          if (typeof viewer?.showModal !== 'function' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          viewer.showModal()
          setOpen(true)
        }}
      >
        <Image
          src={figure.previewSrc ?? figure.src}
          width={figure.width}
          height={figure.height}
          alt={alt}
          className={chart ? 'cd-rf-chart-preview' : 'cd-rfc-visual'}
        />
      </a>
      {chart && <figcaption className="cd-rf-chart-caption">{caption}</figcaption>}
      <dialog
        ref={dialog}
        className="portfolio-figure-dialog"
        aria-labelledby={captionId}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
        onClose={() => {
          setOpen(false)
          trigger.current?.focus()
        }}
      >
        <div>
          <button type="button" className="portfolio-text-link" onClick={() => dialog.current?.close()}>{t(copy.close)}</button>
          {open && <Image src={figure.src} width={figure.width} height={figure.height} alt={alt} />}
          <p id={captionId}>{caption}</p>
          <a className="portfolio-text-link" href={figure.src}>{t(copy.original)}</a>
        </div>
      </dialog>
    </figure>
  )
}
