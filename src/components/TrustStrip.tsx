'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

const copy = {
  supervision: {
    en: 'Supervised by Prof. Sepp Hochreiter',
    de: 'Betreut von Prof. Sepp Hochreiter',
    fr: 'Sous la supervision du Prof. Sepp Hochreiter',
    es: 'Supervisado por el Prof. Sepp Hochreiter',
    ar: 'بإشراف Prof. Sepp Hochreiter',
  },
  founder: {
    en: 'Founder of Faultrix',
    de: 'Gruender von Faultrix',
    fr: 'Fondateur de Faultrix',
    es: 'Fundador de Faultrix',
    ar: 'مؤسس Faultrix',
  },
  industrial: {
    en: 'PROFACTOR / FTI_Zer0P',
    de: 'PROFACTOR / FTI_Zer0P',
    fr: 'PROFACTOR / FTI_Zer0P',
    es: 'PROFACTOR / FTI_Zer0P',
    ar: 'PROFACTOR / FTI_Zer0P',
  },
  result: {
    en: '99.03% AUROC thesis result (binary, single-class)',
    de: '99.03% AUROC Thesis-Ergebnis (binär, Einzelklasse)',
    fr: '99.03% AUROC sur le memoire (binaire, classe unique)',
    es: '99.03% AUROC en la tesis (binario, clase única)',
    ar: 'نتيجة الرسالة 99.03% AUROC (ثنائي، فئة واحدة)',
  },
  location: {
    en: 'JKU Linz, Austria',
    de: 'JKU Linz, Oesterreich',
    fr: 'JKU Linz, Autriche',
    es: 'JKU Linz, Austria',
    ar: 'JKU Linz، النمسا',
  },
} satisfies Record<string, TranslationMap>

export default function TrustStrip() {
  const { t } = useI18n()
  const items = [t(copy.location), t(copy.supervision), t(copy.industrial), t(copy.result), t(copy.founder)]

  return (
    <section className="cd-section" style={{ padding: '18px 0', borderTop: '1px solid var(--cd-b0)', borderBottom: '1px solid var(--cd-b0)' }}>
      <div className="cd-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}
        >
          {items.map((item) => (
            <div
              key={item}
              style={{
                padding: '10px 14px',
                border: '1px solid var(--cd-b0)',
                borderRadius: '8px',
                background: 'var(--cd-surf)',
                color: 'var(--cd-fg2)',
                fontSize: 13,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
