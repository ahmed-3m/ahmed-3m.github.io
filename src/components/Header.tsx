'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, ChevronDown, Globe2, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { languageOptions, useI18n, type TranslationMap, type Language } from '@/lib/i18n'

const links = [
  { href: '/#about', label: { en: 'About', de: 'Profil', fr: 'Profil', es: 'Perfil', ar: 'نبذة' } },
  { href: '/#projects', label: { en: 'Projects', de: 'Projekte', fr: 'Projets', es: 'Proyectos', ar: 'المشاريع' } },
  { href: '/#experience', label: { en: 'Experience', de: 'Erfahrung', fr: 'Experience', es: 'Experiencia', ar: 'الخبرة' } },
  { href: '/#research', label: { en: 'Research', de: 'Forschung', fr: 'Recherche', es: 'Investigacion', ar: 'الأبحاث' } },
  { href: '/#writing', label: { en: 'Blog', de: 'Blog', fr: 'Blog', es: 'Blog', ar: 'المدونة' } },
  { href: '/news', label: { en: 'News', de: 'News', fr: 'Actualites', es: 'Noticias', ar: 'الأخبار' } },
  { href: '/#contact', label: { en: 'Contact', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' } },
] satisfies Array<{ href: string; label: TranslationMap }>

const ctaLabel: TranslationMap = {
  en: 'Get in touch',
  de: 'Kontakt',
  fr: 'Contact',
  es: 'Contacto',
  ar: 'تواصل',
}

const languageNames: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Francais',
  es: 'Espanol',
  ar: 'Arabic',
}

const languageCodes = languageOptions.map(({ code }) => code)

function isLanguage(value: string): value is Language {
  return languageCodes.includes(value as Language)
}

function LanguageSelector() {
  const { lang, setLanguage } = useI18n()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = languageOptions.find(({ code }) => code === lang) ?? languageOptions[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="cd-lang-menu" ref={menuRef}>
      <button
        type="button"
        className="cd-lang-trigger"
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 size={15} strokeWidth={2.1} />
        <span>{current.short}</span>
        <ChevronDown size={13} strokeWidth={2.1} className={open ? 'is-open' : ''} />
      </button>

      {open && (
        <div className="cd-lang-popover" role="menu" aria-label="Language">
          {languageOptions.map(({ code, short, label }) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === code}
              className={`cd-lang-option${lang === code ? ' active' : ''}`}
              onClick={() => {
                if (isLanguage(code)) setLanguage(code)
                setOpen(false)
              }}
            >
              <span className="cd-lang-option-code">{short}</span>
              <span className="cd-lang-option-name">{label}</span>
              {lang === code && <Check size={14} strokeWidth={2.2} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NavLink({ href, label, onClick }: { href: string; label: TranslationMap; onClick?: () => void }) {
  const { t } = useI18n()

  return (
    <Link href={href} className="cd-nav-link" onClick={onClick}>
      {t(label)}
    </Link>
  )
}

function NavCta({ onClick }: { onClick?: () => void }) {
  const { t } = useI18n()

  return (
    <Link href="/#contact" className="cd-nav-cta" onClick={onClick}>
      {t(ctaLabel)}
    </Link>
  )
}

const menuLabels = {
  open: { en: 'Open menu', de: 'Menu offnen', fr: 'Ouvrir le menu', es: 'Abrir menu', ar: 'افتح القائمة' },
  close: { en: 'Close menu', de: 'Menu schliessen', fr: 'Fermer le menu', es: 'Cerrar menu', ar: 'أغلق القائمة' },
} satisfies Record<string, TranslationMap>

const themeLabels = {
  cream: { en: 'Switch to cream mode', de: 'Zum Creme-Modus wechseln', fr: 'Passer au mode creme', es: 'Cambiar al modo crema', ar: 'التبديل إلى النمط الكريمي' },
  dark: { en: 'Switch to dark mode', de: 'Zum dunklen Modus wechseln', fr: 'Passer au mode sombre', es: 'Cambiar al modo oscuro', ar: 'التبديل إلى النمط الداكن' },
} satisfies Record<string, TranslationMap>

export default function Header() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  // On the homepage the logo scrolls to the hero; everywhere else it returns home.
  const isHome = usePathname() === '/'

  return (
    <nav className="cd-nav">
      <div className="cd-nav-inner">
        <a href={isHome ? '#hero' : '/'} className="cd-nav-logo" aria-label="Ahmed Mohammed — home">Ahmed<span>.</span></a>

        <ul className="cd-nav-links">
          {links.map(l => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} />
            </li>
          ))}
        </ul>

        <div className="cd-nav-actions">
          <LanguageSelector />
          <button
            type="button"
            className="cd-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? t(themeLabels.cream) : t(themeLabels.dark)}
            title={isDark ? 'Cream mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={16} strokeWidth={2.1} /> : <Moon size={16} strokeWidth={2.1} />}
          </button>
          <NavCta />
        </div>

        <button
          className="cd-nav-mobile-btn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? t(menuLabels.close) : t(menuLabels.open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--cd-b0)', background: 'var(--cd-bg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {links.map(l => (
            <NavLink key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} />
          ))}
          <NavCta onClick={() => setOpen(false)} />
        </div>
      )}
    </nav>
  )
}
