'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18n';

const navItems = [
  { href: '#about', en: 'About', de: 'Über' },
  { href: '#projects', en: 'Projects', de: 'Projekte' },
  { href: '#experience', en: 'Experience', de: 'Erfahrung' },
  { href: '#research', en: 'Research', de: 'Forschung' },
  { href: '#skills', en: 'Skills', de: 'Fähigkeiten' },
  { href: '/blog', en: 'Blog', de: 'Blog' },
  { href: '#contact', en: 'Contact', de: 'Kontakt' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/95 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-700 transition-all">
      <div className="max-w-6xl mx-auto px-5">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AM
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors relative group"
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
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleLang}
              className="w-[34px] h-[34px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
              aria-label="Toggle language"
            >
              <span className="text-[18px] leading-none">{lang === 'en' ? '🇬🇧' : '🇦🇹'}</span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700"
          >
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600"
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
