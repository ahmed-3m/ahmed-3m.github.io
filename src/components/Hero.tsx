'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 text-blue-800 dark:text-slate-100"
        >
          Ahmed Mohammed
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl text-slate-600 dark:text-slate-300 mb-8"
        >
          {t('AI/ML Engineer & Entrepreneur', 'AI/ML Ingenieur & Unternehmer')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-8 md:gap-12 flex-wrap mb-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">4+</div>
            <div className="text-sm text-slate-500">{t('Years Experience', 'Jahre Erfahrung')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">98.4%</div>
            <div className="text-sm text-slate-500">{t('Defect Detection', 'Fehler Erkennung')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">15%</div>
            <div className="text-sm text-slate-500">{t('Efficiency Gain', 'Effizienzgewinn')}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <a
            href="#contact"
            className="btn-3d px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium"
          >
            {t('Get In Touch', 'Kontakt aufnehmen')}
          </a>
          <a
            href="#projects"
            className="btn-3d px-6 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
          >
            {t('View Projects', 'Projekte ansehen')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
