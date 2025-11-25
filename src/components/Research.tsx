'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Research() {
  const { t } = useI18n();

  return (
    <section id="research" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">
        {t('Research & Publications', 'Forschung & Publikationen')}
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          {t("Master's Thesis", 'Masterarbeit')}
        </h3>
        <p className="font-semibold mb-2">
          &quot;Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection&quot;
        </p>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {t(
            'Designing class-conditional diffusion frameworks with improved sampling efficiency (~15% improvement)',
            'Entwicklung klassen-konditionaler Diffusionsrahmen mit verbesserter Sampling-Effizienz (~15% Verbesserung)'
          )}
        </p>
        <a
          href="/research-poster.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
        >
          <FileText size={18} />
          {t('View Research Poster', 'Forschungsposter ansehen')}
        </a>

        <h4 className="font-semibold mb-3">
          {t('Manuscripts in Preparation:', 'Manuskripte in Vorbereitung:')}
        </h4>
        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
          <li>
            <a
              href="/Motor Imagery classification Based Brain Computer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FileText size={16} />
              Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation
            </a>
          </li>
          <li>
            <a
              href="/Reading Thoughts Using GANs.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FileText size={16} />
              Reading Thoughts Using GANs
            </a>
          </li>
          <li>
            <a
              href="/Diffusion-Based Multi-class Defect Detection.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FileText size={16} />
              Diffusion-Based Multi-class Defect Detection: A Generative Approach to Industrial QC
            </a>
          </li>
        </ul>
      </motion.div>
    </section>
  );
}
