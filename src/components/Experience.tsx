'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const experiences = [
  {
    date: 'Jul 2025 - Present',
    company: 'Faultrix',
    role: { en: 'Founder & Full-Stack Developer', de: 'Gründer & Full-Stack-Entwickler' },
    description: {
      en: 'Leading development of AI-powered construction analysis platform with cutting-edge machine learning architecture',
      de: 'Leitung der Entwicklung einer KI-gestützten Bauanalyseplattform mit modernster Machine-Learning-Architektur',
    },
    note: '(NormKI Co-Founder & Full-stack dev.)',
  },
  {
    date: 'Dec 2024 - Present',
    company: 'JKU Machine Learning Institute',
    role: { en: 'ML Researcher', de: 'ML Forscher' },
    description: {
      en: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
      de: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
    },
  },
  {
    date: 'Apr - Nov 2024',
    company: 'PROFACTOR GmbH',
    role: { en: 'Machine Vision Researcher', de: 'Machine Vision Forscher' },
    description: {
      en: 'Achieved 98.4% accuracy in industrial defect detection using YOLO',
      de: '98.4% Genauigkeit bei der industriellen Fehlererkennung mit YOLO erreicht',
    },
  },
];

export default function Experience() {
  const { t } = useI18n();

  return (
    <section id="experience" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">
        {t('Professional Journey', 'Beruflicher Werdegang')}
      </h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 transform md:-translate-x-1/2" />

        {experiences.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`relative mb-8 md:w-1/2 ${
              i % 2 === 0 ? 'md:pr-12' : 'md:ml-auto md:pl-12'
            } pl-8 md:pl-0`}
          >
            {/* Dot */}
            <div
              className={`absolute w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 top-0 ${
                i % 2 === 0 ? 'left-0 md:left-auto md:-right-2' : 'left-0 md:-left-2'
              } transform md:translate-x-0 -translate-x-1/2`}
            />

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-blue-600 font-semibold mb-2">{exp.date}</div>
              <h3 className="text-lg font-bold mb-1">{exp.company}</h3>
              <p className="font-medium text-slate-600 dark:text-slate-400 mb-2">
                {t(exp.role.en, exp.role.de)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t(exp.description.en, exp.description.de)}
              </p>
              {exp.note && (
                <p className="text-xs text-slate-400 mt-2 italic">{exp.note}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
