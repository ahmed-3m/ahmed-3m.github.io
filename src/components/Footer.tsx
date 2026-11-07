'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  meta: {
    en: '© 2026 · AI/ML Engineer · Linz, Austria',
    de: '© 2026 · KI-/ML-Ingenieur · Linz, Österreich',
    fr: '© 2026 · Ingénieur IA/ML · Linz, Autriche',
    es: '© 2026 · Ingeniero de IA/ML · Linz, Austria',
    ar: '© 2026 · مهندس ذكاء اصطناعي وتعلم آلي · لينز، النمسا',
  },
} satisfies Record<string, TranslationMap>

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="cd-footer">
      <div className="cd-container">
        <div className="cd-footer-inner">
          <div className="cd-footer-brand">Ahmed<span>.</span></div>
          <nav aria-label="Footer links" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://www.linkedin.com/in/ahmed-3m/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>LinkedIn</a>
            <a href="https://github.com/ahmed-3m" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>GitHub</a>
            <a href="https://huggingface.co/ahmed-3m" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>HuggingFace</a>
            <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>Faultrix</a>
            <a href="mailto:ahmed.mo.0595@gmail.com" style={{ color: 'var(--cd-fg3)', fontSize: '0.8rem', textDecoration: 'none' }}>Email</a>
          </nav>
          <div className="cd-footer-meta">{t(copy.meta)}</div>
        </div>
      </div>
    </footer>
  )
}
