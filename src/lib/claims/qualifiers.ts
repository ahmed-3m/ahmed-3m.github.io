// Qualifiers a registered figure must keep near it (spec 008, research R7): the display
// wording per language, and the phrasings the figure check accepts. New phrasings go
// here, never into the check.

import type { Language } from '@/lib/i18n-config'

export type QualifierId = 'threeSeeds' | 'seed42' | 'fiveFoldCv' | 'airplaneVsRest'

export interface Qualifier {
  id: QualifierId
  /** Display wording, as the site states it today. */
  text: Record<Language, string>
  /** Phrasings the check accepts in the same text unit as the figure. */
  accepts: Record<Language, RegExp>
}

export const QUALIFIERS: Readonly<Record<QualifierId, Qualifier>> = {
  threeSeeds: {
    id: 'threeSeeds',
    text: { en: '3-seed mean', de: '3-Seed-Mittel', fr: 'moyenne 3 seeds', es: 'media de 3 seeds', ar: 'متوسط 3 بذور' },
    // The first alternative of each language is the Genie test's original THREE_SEEDS pattern.
    accepts: {
      en: /three seeds|3[- ]seeds?/i,
      de: /drei Läufe|3-Seed|drei Seeds/i,
      fr: /trois essais|3 seeds|trois graines|3 graines/i,
      es: /tres ejecuciones|3 semillas|3 seeds|tres semillas/i,
      ar: /ثلاث تجارب|3 بذور|ثلاث بذور/,
    },
  },
  seed42: {
    id: 'seed42',
    text: { en: 'seed 42', de: 'Seed 42', fr: 'seed 42', es: 'semilla 42', ar: 'البذرة 42' },
    accepts: {
      en: /seed[- ]42/i,
      de: /Seed[- ]42/i,
      fr: /seed[- ]42/i,
      es: /seed[- ]42|semilla 42/i,
      ar: /البذرة 42|لبذرة 42|seed[- ]42/i,
    },
  },
  fiveFoldCv: {
    id: 'fiveFoldCv',
    text: { en: '5-fold CV', de: '5-fach-CV', fr: 'VC 5 plis', es: 'CV de 5 pliegues', ar: 'تحقق متقاطع خماسي' },
    accepts: {
      en: /five-fold|5-fold/i,
      de: /fünffach|5-fach/i,
      fr: /cinq plis|5[- ]plis|5-fold/i,
      es: /cinco pliegues|5 pliegues|5-fold|5[- ]folds/i,
      ar: /خمسة أجزاء|خماسي|5-fold|5 طيات|خمس طيات/,
    },
  },
  // Candidate only (research R7): measured in PR A, not enforced until a spec amendment.
  airplaneVsRest: {
    id: 'airplaneVsRest',
    text: {
      en: 'airplane-vs-rest',
      de: 'Flugzeug-vs-Rest',
      fr: 'avion contre reste',
      es: 'avión frente al resto',
      ar: 'طائرة مقابل البقية',
    },
    accepts: {
      en: /airplane[- ]vs\.?[- ]rest/i,
      de: /Flugzeug(?:e)?[- ](?:vs\.?[- ]Rest|gegen)/i,
      fr: /avions?[- ](?:contre|vs)/i,
      es: /avi(?:ón|ones?)[- ](?:frente|vs)/i,
      ar: /طائرة مقابل|للطائرة مقابل/,
    },
  },
}
