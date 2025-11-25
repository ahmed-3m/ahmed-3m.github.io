'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const skillCategories = [
  {
    title: { en: 'Machine Learning', de: 'Machine Learning' },
    skills: ['CNNs', 'LSTMs', 'Autoencoders', 'GANs', 'Diffusion Models', 'YOLO', 'Self-Supervised Learning', 'OOD Detection', 'Anomaly Detection'],
  },
  {
    title: { en: 'Tools & Frameworks', de: 'Tools & Frameworks' },
    skills: ['Python', 'TensorFlow', 'PyTorch', 'OpenCV', 'Scikit-learn', 'NumPy', 'Pandas', 'MATLAB'],
  },
  {
    title: { en: 'Infrastructure', de: 'Infrastruktur' },
    skills: ['Docker', 'MLflow', 'CI/CD', 'Git', 'REST APIs', 'MLOps'],
  },
];

export default function Skills() {
  const { t } = useI18n();

  return (
    <section id="skills" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">
        {t('Technical Skills', 'Technische Fähigkeiten')}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {skillCategories.map((category, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              {t(category.title.en, category.title.de)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-md text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
