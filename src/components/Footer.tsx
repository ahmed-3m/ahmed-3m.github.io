'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  meta: {
    en: '© 2026 · AI/ML Engineer · Linz, Austria',
    de: '© 2026 · KI-/ML-Ingenieur · Linz, Österreich',
    fr: '© 2026 · Ingénieur IA/ML · Linz, Autriche',
    es: '© 2026 · Ingeniero de IA/ML · Linz, Austria',
    ar: '© 2026 · مهندس ذكاء اصطناعي وتعلم آلي · لينتس، النمسا',
  },
  footerNav: { en: 'Footer links', de: 'Fußzeilen-Links', fr: 'Liens du pied de page', es: 'Enlaces del pie de página', ar: 'روابط التذييل' },
  about: { en: 'About', de: 'Profil', fr: 'Profil', es: 'Perfil', ar: 'نبذة' },
  research: { en: 'Research', de: 'Forschung', fr: 'Recherche', es: 'Investigación', ar: 'الأبحاث' },
  blog: { en: 'Blog', de: 'Blog', fr: 'Blog', es: 'Blog', ar: 'المدونة' },
  news: { en: 'News', de: 'News', fr: 'Actualités', es: 'Noticias', ar: 'الأخبار' },
  caseStudies: { en: 'Case Studies', de: 'Fallstudien', fr: 'Études de cas', es: 'Casos de estudio', ar: 'دراسات الحالة' },
  email: { en: 'Email', de: 'E-Mail', fr: 'E-mail', es: 'Correo', ar: 'البريد الإلكتروني' },
  impressum: { en: 'Impressum', de: 'Impressum', fr: 'Mentions légales', es: 'Aviso legal', ar: 'بيانات الناشر' },
  privacy: { en: 'Privacy', de: 'Datenschutz', fr: 'Confidentialité', es: 'Privacidad', ar: 'الخصوصية' },
} satisfies Record<string, TranslationMap>

export default function Footer() {
  const { t } = useI18n()
  const projectsHref = usePathname() === '/' ? '#projects' : '/#projects'

  return (
    <footer className="cd-footer">
      <div className="cd-container">
        <div className="cd-footer-inner">
          <div className="cd-footer-brand">Ahmed<span>.</span></div>
          <nav aria-label={t(copy.footerNav)} style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/about/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.about)}</Link>
            <Link href="/research/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.research)}</Link>
            <Link href="/blog/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.blog)}</Link>
            <Link href="/news/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.news)}</Link>
            <Link href={projectsHref} style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.caseStudies)}</Link>
            <span aria-hidden="true" style={{ color: 'var(--cd-fg3)', opacity: 0.35 }}>·</span>
            <a href="https://www.linkedin.com/in/ahmed-3m/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>LinkedIn</a>
            <a href="https://github.com/ahmed-3m" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>GitHub</a>
            <a href="https://huggingface.co/ahmed-3m" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>HuggingFace</a>
            <a href="mailto:ahmed.mo.0595@gmail.com" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.email)}</a>
            <span aria-hidden="true" style={{ color: 'var(--cd-fg3)', opacity: 0.35 }}>·</span>
            <Link href="/impressum/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.impressum)}</Link>
            <Link href="/privacy/" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>{t(copy.privacy)}</Link>
          </nav>
          <div className="cd-footer-meta">{t(copy.meta)}</div>
        </div>
      </div>
    </footer>
  )
}
