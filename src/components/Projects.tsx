'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const projects = [
  {
    title: { en: 'Industrial Anomaly Detection', de: 'Industrielle Anomalieerkennung' },
    description: {
      en: 'End-to-end pipeline integrating YOLO and diffusion models for industrial quality control',
      de: 'End-to-End-Pipeline, die YOLO und Diffusionsmodelle für industrielle Qualitätskontrolle integriert',
    },
    metrics: ['98.4% Accuracy', 'Real-time'],
    tags: ['YOLO', 'Diffusion Models', 'PyTorch', 'OpenCV'],
  },
  {
    title: { en: 'OOD Detection Framework', de: 'OOD-Erkennungs-Framework' },
    description: {
      en: 'Novel approach using diffusion models for robust out-of-distribution detection',
      de: 'Neuartiger Ansatz mit Diffusionsmodellen für robuste Out-of-Distribution-Erkennung',
    },
    metrics: ['15% Efficiency Gain', 'Research'],
    tags: ['Diffusion Models', 'PyTorch', 'Statistical Analysis'],
  },
  {
    title: { en: 'EEG Signal Classification', de: 'EEG-Signal-Klassifikation' },
    description: {
      en: 'Deep RNN architectures for brain-computer interface applications',
      de: 'Tiefe RNN-Architekturen für Brain-Computer-Interface-Anwendungen',
    },
    metrics: ['Motor Imagery', 'BCIs'],
    tags: ['LSTM', 'Bi-LSTM', 'GRU', 'TensorFlow'],
  },
];

export default function Projects() {
  const { t } = useI18n();

  return (
    <section id="projects" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">
        {t('Featured Projects', 'Ausgewählte Projekte')}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="card-3d bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              {t(project.title.en, project.title.de)}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {t(project.description.en, project.description.de)}
            </p>
            <div className="flex gap-2 mb-4">
              {project.metrics.map((metric) => (
                <span
                  key={metric}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                >
                  {metric}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-xs text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
