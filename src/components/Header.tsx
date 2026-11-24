'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Check, ChevronDown, Globe2, Layers, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { languageOptions, useI18n, type TranslationMap, isLanguage } from '@/lib/i18n'
import { portfolioCopy } from '@/lib/portfolio-copy'
import { setPortfolioView, usePortfolioView } from '@/lib/portfolio-view'

const links = [
  { href: '#projects', label: { en: 'Projects', de: 'Projekte', fr: 'Projets', es: 'Proyectos', ar: 'المشاريع' } },
  { href: '/about/', label: { en: 'About', de: 'Profil', fr: 'Profil', es: 'Perfil', ar: 'نبذة' } },
  { href: '/research/', label: { en: 'Research', de: 'Forschung', fr: 'Recherche', es: 'Investigación', ar: 'الأبحاث' } },
  { href: '/blog/', label: { en: 'Writing', de: 'Artikel', fr: 'Articles', es: 'Artículos', ar: 'المقالات' } },
  { href: '/news/', label: { en: 'News', de: 'News', fr: 'Actualités', es: 'Noticias', ar: 'الأخبار' } },
] satisfies Array<{ href: string; label: TranslationMap }>

const logoLabels: TranslationMap = {
  en: 'Ahmed Mohammed — home',
  de: 'Ahmed Mohammed — Startseite',
  fr: 'Ahmed Mohammed — accueil',
  es: 'Ahmed Mohammed — inicio',
  ar: 'أحمد محمد — الرئيسية',
}

const ctaLabel: TranslationMap = {
  en: 'Get in touch',
  de: 'Kontakt',
  fr: 'Contact',
  es: 'Contacto',
  ar: 'تواصل',
}

function LanguageSelector() {
  const { lang, setLanguage, t } = useI18n()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = languageOptions.find(({ code }) => code === lang) ?? languageOptions[0]

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
    }
  }, [open])

  return (
    <div
      className="cd-lang-menu"
      ref={menuRef}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={event => {
        if (open && event.key === 'Escape') {
          event.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <button
        type="button"
        className="cd-lang-trigger" ref={triggerRef}
        aria-label={t({ en: "Change language", de: "Sprache ändern", fr: "Changer de langue", es: "Cambiar idioma", ar: "تغيير اللغة" })}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 size={15} strokeWidth={2.1} />
        <span>{current.short}</span>
        <ChevronDown size={13} strokeWidth={2.1} className={open ? 'is-open' : ''} />
      </button>

      {open && (
        <div className="cd-lang-popover" >
          {languageOptions.map(({ code, short, label }) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              className={`cd-lang-option${lang === code ? ' active' : ''}`}
              onClick={() => {
                if (isLanguage(code)) setLanguage(code)
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              <span className="cd-lang-option-code" aria-hidden="true">{short}</span>
              <span className="cd-lang-option-name" lang={code}>{label}</span>
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

function NavCta({ isHome, onClick }: { isHome: boolean; onClick?: () => void }) {
  const { t } = useI18n()

  return (
    <Link href={isHome ? '#contact' : '/#contact'} className="cd-nav-cta" onClick={onClick}>
      {t(ctaLabel)}
    </Link>
  )
}

function ViewModeToggle({ isHome, onAfterClick }: { isHome: boolean; onAfterClick?: () => void }) {
  const { t } = useI18n()
  const { view, toggleView } = usePortfolioView()

  if (isHome) {
    const isConcise = view !== 'full'
    return (
      <button
        type="button"
        className="cd-nav-view-toggle"
        onClick={() => {
          toggleView()
          window.scrollTo({ top: 0 })
          onAfterClick?.()
        }}
      >
        {isConcise && <Layers size={14} strokeWidth={2.2} aria-hidden="true" />}
        <span>{t(isConcise ? portfolioCopy.fullPortfolio : portfolioCopy.conciseView)}</span>
        {isConcise && <ArrowRight size={14} strokeWidth={2.2} className="rtl:rotate-180" aria-hidden="true" />}
      </button>
    )
  }

  return (
    <Link
      href="/?view=full"
      className="cd-nav-view-toggle"
      onClick={() => {
        setPortfolioView('full', false)
        onAfterClick?.()
      }}
    >
      <Layers size={14} strokeWidth={2.2} aria-hidden="true" />
      <span>{t(portfolioCopy.fullPortfolio)}</span>
      <ArrowRight size={14} strokeWidth={2.2} className="rtl:rotate-180" aria-hidden="true" />
    </Link>
  )
}

const menuLabels = {
  open: { en: 'Open menu', de: 'Menü öffnen', fr: 'Ouvrir le menu', es: 'Abrir menú', ar: 'افتح القائمة' },
  close: { en: 'Close menu', de: 'Menü schließen', fr: 'Fermer le menu', es: 'Cerrar menú', ar: 'أغلق القائمة' },
} satisfies Record<string, TranslationMap>

const themeLabels = {
  cream: { en: 'Switch to cream mode', de: 'Zum Creme-Modus wechseln', fr: 'Passer au mode crème', es: 'Cambiar al modo crema', ar: 'التبديل إلى النمط الكريمي' },
  dark: { en: 'Switch to dark mode', de: 'Zum dunklen Modus wechseln', fr: 'Passer au mode sombre', es: 'Cambiar al modo oscuro', ar: 'التبديل إلى النمط الداكن' },
} satisfies Record<string, TranslationMap>

export default function Header() {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  // On the homepage the logo scrolls to the hero; everywhere else it returns home.
  const isHome = usePathname() === '/'
  const navLinks = links.map(link => ({
    ...link,
    href: !isHome && link.href.startsWith('#') ? `/${link.href}` : link.href,
  }))

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuToggleRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <nav className={isHome ? 'cd-nav' : 'cd-nav portfolio-nav'} ref={navRef}>
      <div className="cd-nav-inner">
        <a href={isHome ? '#hero' : '/'} className="cd-nav-logo" aria-label={t(logoLabels)}>Ahmed<span>.</span></a>

        <ul className="cd-nav-links">
          {navLinks.map(l => (
            <li key={l.href}>
              <NavLink href={l.href} label={l.label} />
            </li>
          ))}
        </ul>

        <div className="cd-nav-actions">
          <ViewModeToggle isHome={isHome} />
          <LanguageSelector />
          <button
            type="button"
            className="cd-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? t(themeLabels.cream) : t(themeLabels.dark)}
            title={isDark ? t(themeLabels.cream) : t(themeLabels.dark)}
          >
            {isDark ? <Sun size={16} strokeWidth={2.1} /> : <Moon size={16} strokeWidth={2.1} />}
          </button>
          <NavCta isHome={isHome} />
        </div>

        <button
          ref={menuToggleRef}
          className="cd-nav-mobile-btn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? t(menuLabels.close) : t(menuLabels.open)}
          aria-expanded={open}
          aria-controls="cd-mobile-menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            }
          </svg>
        </button>
      </div>

      <div
        id="cd-mobile-menu"
        className="cd-nav-mobile-panel"
        hidden={!open}
      >
        {navLinks.map(l => (
          <NavLink key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} />
        ))}
        <ViewModeToggle isHome={isHome} onAfterClick={() => setOpen(false)} />
        <NavCta isHome={isHome} onClick={() => setOpen(false)} />
      </div>
    </nav>
  )
}
