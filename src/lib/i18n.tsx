'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'de';

interface I18nContextType {
  lang: Language;
  toggleLang: () => void;
  t: (en: string, de: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'de' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (en: string, de: string) => lang === 'en' ? en : de;

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
