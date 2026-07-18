'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n, type Language, type TranslationMap } from '@/lib/i18n'
import { getGitHubActivityItems, type GitHubActivityItem } from '@/lib/github-activity'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: {
    en: '// Activity',
    de: '// Aktivitaet',
    fr: '// Activite',
    es: '// Actividad',
    ar: '// النشاط',
  },
  title: {
    en: 'Shipping recently.',
    de: 'Kuerzlich geliefert.',
    fr: 'Livraisons recentes.',
    es: 'Entregas recientes.',
    ar: 'إصدارات حديثة.',
  },
  intro: {
    en: 'Public GitHub activity, baked in at build time — no live fetches on the page.',
    de: 'Oeffentliche GitHub-Aktivitaet, zur Build-Zeit eingebettet — keine Live-Abfragen auf der Seite.',
    fr: 'Activite GitHub publique, integree au build — aucun fetch en direct sur la page.',
    es: 'Actividad publica de GitHub, integrada en el build — sin peticiones en vivo en la pagina.',
    ar: 'نشاط GitHub العام مضمّن وقت البناء — بلا طلبات مباشرة من الصفحة.',
  },
  open: {
    en: 'Open on GitHub',
    de: 'Auf GitHub oeffnen',
    fr: 'Ouvrir sur GitHub',
    es: 'Abrir en GitHub',
    ar: 'افتح على GitHub',
  },
  empty: {
    en: 'No recent public activity to show yet.',
    de: 'Noch keine oeffentliche Aktivitaet vorhanden.',
    fr: 'Aucune activite publique recente pour le moment.',
    es: 'Aun no hay actividad publica reciente.',
    ar: 'لا يوجد نشاط عام حديث بعد.',
  },
} satisfies Record<string, TranslationMap>

const typeLabels: Record<string, TranslationMap> = {
  PushEvent: { en: 'Push', de: 'Push', fr: 'Push', es: 'Push', ar: 'دفع' },
  CreateEvent: { en: 'Create', de: 'Erstellt', fr: 'Creation', es: 'Creacion', ar: 'إنشاء' },
  ReleaseEvent: { en: 'Release', de: 'Release', fr: 'Release', es: 'Release', ar: 'إصدار' },
  PublicEvent: { en: 'Public', de: 'Oeffentlich', fr: 'Public', es: 'Publico', ar: 'عام' },
  IssuesEvent: { en: 'Issue', de: 'Issue', fr: 'Issue', es: 'Issue', ar: 'مشكلة' },
  IssueCommentEvent: { en: 'Comment', de: 'Kommentar', fr: 'Commentaire', es: 'Comentario', ar: 'تعليق' },
  PullRequestEvent: { en: 'PR', de: 'PR', fr: 'PR', es: 'PR', ar: 'PR' },
  PullRequestReviewEvent: { en: 'Review', de: 'Review', fr: 'Revue', es: 'Revision', ar: 'مراجعة' },
  CommitCommentEvent: { en: 'Comment', de: 'Kommentar', fr: 'Commentaire', es: 'Comentario', ar: 'تعليق' },
  ForkEvent: { en: 'Fork', de: 'Fork', fr: 'Fork', es: 'Fork', ar: 'نسخة' },
  Repository: { en: 'Repo', de: 'Repo', fr: 'Depot', es: 'Repo', ar: 'مستودع' },
}

function formatRelative(iso: string, lang: Language): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso.slice(0, 10)

  const diffSec = Math.round((then - Date.now()) / 1000)
  const abs = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

  if (abs < 60) return rtf.format(diffSec, 'second')
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 48) return rtf.format(diffHour, 'hour')
  const diffDay = Math.round(diffHour / 24)
  if (Math.abs(diffDay) < 45) return rtf.format(diffDay, 'day')
  const diffMonth = Math.round(diffDay / 30)
  if (Math.abs(diffMonth) < 18) return rtf.format(diffMonth, 'month')
  return rtf.format(Math.round(diffDay / 365), 'year')
}

function RelativeTime({ iso, lang }: { iso: string; lang: Language }) {
  // Absolute date on first paint (SSR / static HTML) avoids hydration mismatch;
  // relative label is filled in on the client after mount.
  const absolute = iso.slice(0, 10)
  const [label, setLabel] = useState(absolute)

  useEffect(() => {
    setLabel(formatRelative(iso, lang))
  }, [iso, lang])

  return (
    <time dateTime={iso} title={iso}>
      {label}
    </time>
  )
}

function typeLabel(type: string, t: (m: TranslationMap) => string): string {
  const map = typeLabels[type]
  if (map) return t(map)
  return type.replace(/Event$/, '')
}

function shortRepo(full: string): string {
  const parts = full.split('/')
  return parts.length > 1 ? parts[parts.length - 1] : full
}

export default function ActivityStrip() {
  useReveal()
  const { lang, t } = useI18n()
  const items = useMemo(() => getGitHubActivityItems(), [])

  return (
    <section
      id="activity"
      className="cd-section cd-activity"
      aria-labelledby="activity-heading"
      style={{ padding: '48px 0' }}
    >
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 id="activity-heading" className="cd-section-title" style={{ marginBottom: 8 }}>
          {t(copy.title)}
        </h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 28, maxWidth: 560 }}>
          {t(copy.intro)}
        </p>

        {items.length === 0 ? (
          <p style={{ color: 'var(--cd-fg2)', fontSize: 14 }}>{t(copy.empty)}</p>
        ) : (
          <ul
            className="cd-activity-list"
            aria-label={t(copy.title)}
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {items.map((item, i) => (
              <ActivityRow key={item.id} item={item} index={i} lang={lang} t={t} openLabel={t(copy.open)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ActivityRow({
  item,
  index,
  lang,
  t,
  openLabel,
}: {
  item: GitHubActivityItem
  index: number
  lang: Language
  t: (m: TranslationMap) => string
  openLabel: string
}) {
  return (
    <li
      className="reveal"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="cd-activity-item"
        aria-label={`${typeLabel(item.type, t)}: ${item.message} — ${openLabel}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(72px, auto) minmax(0, 1fr) auto',
          gap: '10px 14px',
          alignItems: 'center',
          padding: '12px 14px',
          border: '1px solid var(--cd-b0)',
          borderRadius: 8,
          background: 'var(--cd-surf)',
          color: 'inherit',
          textDecoration: 'none',
          transition: 'border-color 200ms, transform 200ms',
        }}
      >
        <span
          className="cd-wc-tag"
          style={{ justifySelf: 'start' }}
        >
          {typeLabel(item.type, t)}
        </span>
        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--cd-accent)',
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              marginBottom: 2,
            }}
          >
            {shortRepo(item.repo)}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--cd-fg1)',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.message}
          </span>
        </span>
        <span
          className="cd-wc-time"
          style={{ fontSize: 12, color: 'var(--cd-fg2)', whiteSpace: 'nowrap' }}
        >
          <RelativeTime iso={item.createdAt} lang={lang} />
        </span>
      </a>
    </li>
  )
}
