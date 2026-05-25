export type Language = 'en' | 'de' | 'fr' | 'es' | 'ar'

export type TranslationMap = Partial<Record<Language, string>> & { en: string }

export const LANGUAGE_STORAGE_KEY = 'language'
export const LANGUAGE_COOKIE = 'language'

export const languageOptions: Array<{ code: Language; label: string; short: string }> = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Francais', short: 'FR' },
  { code: 'es', label: 'Espanol', short: 'ES' },
  { code: 'ar', label: 'العربية', short: 'AR' },
]

export const languageLocale: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ar: 'ar',
}

export const languageName: Record<Language, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
}

export function isLanguage(value: string | null | undefined): value is Language {
  return Boolean(value && languageOptions.some(({ code }) => code === value))
}

export function translateValue(lang: Language, copy: TranslationMap | string, de?: string): string {
  if (typeof copy === 'string') return lang === 'de' && de ? de : copy
  return copy[lang] ?? copy.en
}

export function getDirection(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}
