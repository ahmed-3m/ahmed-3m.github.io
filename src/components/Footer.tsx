'use client';

import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="py-8 bg-slate-100 dark:bg-slate-900 text-center text-slate-600 dark:text-slate-400">
      <div className="max-w-6xl mx-auto px-5">
        <p>
          &copy; 2025 Ahmed Mohammed.{' '}
          {t('All rights reserved.', 'Alle Rechte vorbehalten.')}
        </p>
      </div>
    </footer>
  );
}
