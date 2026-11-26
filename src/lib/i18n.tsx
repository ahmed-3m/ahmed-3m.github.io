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
export { languageOptions, isLanguage } from '@/lib/i18n-config'

interface I18nContextType {
  lang: Language
  setLanguage: (lang: Language) => void
  toggleLang: () => void
  t: (copy: TranslationMap | string, de?: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function readStoredLanguage(): Language | null {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(saved) ? saved : null
  } catch {
    try {
      const prefix = `${LANGUAGE_COOKIE}=`
      const match = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix))
      const cookieLang = match?.slice(prefix.length)
      return isLanguage(cookieLang) ? cookieLang : null
    } catch {
      return null
    }
  }
}

function writeStoredLanguage(nextLang: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang)
  } catch {
    // Ignore SecurityError / QuotaExceededError; React state holds the active language.
  }
}

function writeLanguageCookie(nextLang: Language): void {
  try {
    document.cookie = `${LANGUAGE_COOKIE}=${nextLang}; path=/; max-age=31536000; samesite=lax`
  } catch {
    // Ignore SecurityError when cookies are disabled or blocked.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en')
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const saved = readStoredLanguage()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is unavailable during static-export build, so the initial render must default to 'en' and we hydrate the saved language on mount.
    if (saved) setLang(saved)
    // Batched with setLang above, so the sync effect below first runs with the restored language.
    setRestored(true)
  }, [])

  useEffect(() => {
    // Before the saved language is restored, `lang` is only the build-time default.
    // Writing it here would undo the pre-paint script in layout.tsx and show a saved
    // RTL language as LTR until the next render.
    if (!restored) return
    document.documentElement.lang = lang
    document.documentElement.dir = getDirection(lang)
    writeLanguageCookie(lang)
  }, [lang, restored])

  const setLanguage = (nextLang: Language) => {
    setLang(nextLang)
    writeStoredLanguage(nextLang)
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
