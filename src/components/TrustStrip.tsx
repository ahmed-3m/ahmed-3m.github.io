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
  grade: {
    en: 'M.Sc. thesis graded 1 (top mark)',
    de: 'Masterarbeit mit 1 (Sehr gut) bewertet',
    fr: 'Mémoire M.Sc. noté 1 (meilleure note)',
    es: 'Tesis M.Sc. calificada con 1 (nota máxima)',
    ar: 'رسالة الماجستير بتقدير 1 (أعلى درجة)',
  },
  industrial: {
    en: 'PROFACTOR / FTI_Zer0P',
    de: 'PROFACTOR / FTI_Zer0P',
    fr: 'PROFACTOR / FTI_Zer0P',
    es: 'PROFACTOR / FTI_Zer0P',
    ar: 'PROFACTOR / FTI_Zer0P',
  },
  result: {
    en: '99.03% ± 0.07% AUROC (binary, 3-seed mean)',
    de: '99.03% ± 0.07% AUROC (binär, 3-Seed-Mittel)',
    fr: '99.03% ± 0.07% AUROC (binaire, moy. 3 seeds)',
    es: '99.03% ± 0.07% AUROC (binario, media 3 seeds)',
    ar: '99.03% ± 0.07% AUROC (ثنائي، متوسط 3 بذور)',
  },
  location: {
    en: 'JKU Linz, Austria',
    de: 'JKU Linz, Österreich',
    fr: 'JKU Linz, Autriche',
    es: 'JKU Linz, Austria',
    ar: 'JKU Linz، النمسا',
  },
} satisfies Record<string, TranslationMap>

export default function TrustStrip() {
  const { t } = useI18n()
  const items = [t(copy.location), t(copy.supervision), t(copy.grade), t(copy.industrial), t(copy.result)]

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
