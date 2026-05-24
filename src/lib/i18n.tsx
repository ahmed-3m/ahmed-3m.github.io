'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'de' | 'fr' | 'es' | 'ar';
export type TranslationMap = Partial<Record<Language, string>> & { en: string };

export const languageOptions: Array<{ code: Language; label: string; short: string }> = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];

const isLanguage = (value: string | null): value is Language =>
  languageOptions.some(({ code }) => code === value);

interface I18nContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  toggleLang: () => void;
  t: (copy: TranslationMap | string, de?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (isLanguage(saved)) setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLanguage = (nextLang: Language) => {
    setLang(nextLang);
    localStorage.setItem('language', nextLang);
  };

  const toggleLang = () => {
    const index = languageOptions.findIndex(({ code }) => code === lang);
    const nextLang = languageOptions[(index + 1) % languageOptions.length].code;
    setLanguage(nextLang);
  };

  const t = (copy: TranslationMap | string, de?: string) => {
    if (typeof copy === 'string') return lang === 'de' && de ? de : copy;
    return copy[lang] ?? copy.en;
  };

  return (
    <I18nContext.Provider value={{ lang, setLanguage, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
