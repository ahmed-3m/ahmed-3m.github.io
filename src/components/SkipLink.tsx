'use client';

import { useI18n, type TranslationMap } from '@/lib/i18n';

const label: TranslationMap = {
  en: 'Skip to content',
  de: 'Zum Inhalt springen',
  fr: 'Aller au contenu',
  es: 'Saltar al contenido',
  ar: 'انتقل إلى المحتوى',
};

export default function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="cd-skip-link">
      {t(label)}
    </a>
  );
}
