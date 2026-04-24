'use client'
import { useState } from 'react'

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#research', label: 'Research' },
  { href: '#contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="cd-nav">
      <div className="cd-nav-inner">
        <a href="#hero" className="cd-nav-logo">Ahmed<span>.</span></a>

        <ul className="cd-nav-links">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className="cd-nav-link">{l.label}</a>
            </li>
          ))}
        </ul>

        <a href="#contact" className="cd-nav-cta">Get in touch</a>

        <button
          className="cd-nav-mobile-btn"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
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
            <a key={l.href} href={l.href} className="cd-nav-link" onClick={() => setOpen(false)} style={{ fontSize: '15px' }}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="cd-nav-cta" style={{ textAlign: 'center' }} onClick={() => setOpen(false)}>
            Get in touch
          </a>
        </div>
      )}
    </nav>
  )
}
