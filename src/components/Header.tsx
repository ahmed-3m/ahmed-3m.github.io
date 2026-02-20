'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun, Menu, X, Droplets } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18n';

const navItems = [
  { href: '/#about', en: 'About', de: 'Über' },
  { href: '/#projects', en: 'Projects', de: 'Projekte' },
  { href: '/#experience', en: 'Experience', de: 'Erfahrung' },
  { href: '/#research', en: 'Research', de: 'Forschung' },
  { href: '/#skills', en: 'Skills', de: 'Fähigkeiten' },
  { href: '/blog', en: 'Blog', de: 'Blog' },
  { href: '/#contact', en: 'Contact', de: 'Kontakt' },
];

export default function Header() {
  const { theme, toggleTheme, reduceTransparency, toggleReduceTransparency } = useTheme();
  const { lang, toggleLang, t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const safeTheme = isHydrated ? theme : 'light';
  const safeReduceTransparency = isHydrated ? reduceTransparency : false;
  const [mobileOpen, setMobileOpen] = useState(false);
  const controlButtonClass =
    'h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="max-w-6xl mx-auto">
        <nav className="glass-surface glass-medium glass-noise flex justify-between items-center px-4 py-3 sm:px-5">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AM
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-1 py-1 text-slate-700 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {t(item.en, item.de)}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={controlButtonClass}
              aria-label="Toggle theme"
            >
              {safeTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleReduceTransparency}
              className={`${controlButtonClass} ${safeReduceTransparency ? 'text-blue-700 dark:text-blue-300' : ''}`}
              aria-label={t('Toggle reduced transparency', 'Reduzierte Transparenz umschalten')}
              aria-pressed={safeReduceTransparency}
              title={t('Reduce transparency', 'Transparenz reduzieren')}
            >
              <Droplets size={18} className={safeReduceTransparency ? 'opacity-55' : ''} />
            </button>
            <button
              onClick={toggleLang}
              className={`${controlButtonClass} text-[18px] leading-none`}
              aria-label="Toggle language"
            >
              <span>{lang === 'en' ? '🇬🇧' : '🇦🇹'}</span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden ${controlButtonClass}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.ul
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="glass-surface glass-strong glass-noise md:hidden mt-3 p-3"
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-slate-700 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
                >
                  {t(item.en, item.de)}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </header>
  );
}
