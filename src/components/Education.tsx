'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const education = [
  {
    degree: 'Master of Artificial Intelligence',
    school: 'Johannes Kepler University, Linz',
    date: 'Oct 2020 - Present',
    thesis: {
      en: 'Thesis: Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
      de: 'Thesis: Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
    },
    tags: ['Advanced Deep Learning', 'Probabilistic ML', 'Computer Vision', 'Reinforcement Learning'],
  },
  {
    degree: 'Bachelor of Mechatronics Engineering',
    school: 'Eastern Mediterranean University, Cyprus',
    date: 'Feb 2015 - Jan 2018',
    thesis: {
      en: 'Graduation Project: SCARA Robotic System for Dynamic Object Tracking',
      de: 'Abschlussprojekt: SCARA-Robotersystem für dynamisches Objekt-Tracking',
    },
  },
];

export default function Education() {
  const { t } = useI18n();

  return (
    <section id="education" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">
        {t('Education', 'Ausbildung')}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {education.map((edu, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{edu.degree}</h3>
            <p className="font-medium mb-1">{edu.school}</p>
            <p className="text-sm text-blue-600 mb-3">{edu.date}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {t(edu.thesis.en, edu.thesis.de)}
            </p>
            {edu.tags && (
              <div className="flex flex-wrap gap-2">
                {edu.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
