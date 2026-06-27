'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getDirection,
  isLanguage,
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
  languageOptions,
  translateValue,
  type Language,
  type TranslationMap,
} from '@/lib/i18n-config'

export type { Language, TranslationMap } from '@/lib/i18n-config'
export { languageOptions } from '@/lib/i18n-config'

interface I18nContextType {
  lang: Language
  setLanguage: (lang: Language) => void
  toggleLang: () => void
  t: (copy: TranslationMap | string, de?: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is unavailable during static-export build, so the initial render must default to 'en' and we hydrate the saved language on mount.
    if (isLanguage(saved)) setLang(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = getDirection(lang)
    document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
  }, [lang])

  const setLanguage = (nextLang: Language) => {
    setLang(nextLang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang)
  }

  const toggleLang = () => {
    const index = languageOptions.findIndex(({ code }) => code === lang)
    const nextLang = languageOptions[(index + 1) % languageOptions.length].code
    setLanguage(nextLang)
  }

  const t = (copy: TranslationMap | string, de?: string) => translateValue(lang, copy, de)

  return (
    <I18nContext.Provider value={{ lang, setLanguage, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
