'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const projects = [
  {
    title: { en: 'Industrial Anomaly Detection', de: 'Industrielle Anomalieerkennung' },
    description: {
      en: 'End-to-end pipeline integrating YOLO and diffusion models for industrial quality control at PROFACTOR GmbH',
      de: 'End-to-End-Pipeline, die YOLO und Diffusionsmodelle für industrielle Qualitätskontrolle bei PROFACTOR GmbH integriert',
    },
    metrics: ['98.4% Accuracy', 'Real-time'],
    tags: ['YOLO', 'Diffusion Models', 'PyTorch', 'OpenCV'],
    gradient: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5',
    borderHover: 'hover:border-blue-400/50',
    icon: '🔍',
    github: 'https://github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking',
  },
  {
    title: { en: 'OOD Detection Framework', de: 'OOD-Erkennungs-Framework' },
    description: {
      en: 'Novel approach using conditional diffusion models as generative classifiers for robust out-of-distribution detection',
      de: 'Neuartiger Ansatz mit konditionalen Diffusionsmodellen als generative Klassifikatoren für robuste Out-of-Distribution-Erkennung',
    },
    metrics: ['~15% Efficiency Gain', 'Master\'s Thesis'],
    tags: ['Diffusion Models', 'PyTorch', 'Statistical Analysis'],
    gradient: 'from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5',
    borderHover: 'hover:border-purple-400/50',
    icon: '🧪',
    link: '/research-poster.pdf',
    github: 'https://github.com/ahmed-3m/OOD-diffusion-detector',
  },
  {
    title: { en: 'Faultrix', de: 'Faultrix' },
    description: {
      en: 'AI-powered construction quality control SaaS — photo to ÖNORM-compliant report in under 1 minute. Features SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption.',
      de: 'KI-gestützte SaaS-Plattform für Bauqualitätskontrolle — vom Foto zum ÖNORM-konformen Bericht in unter 1 Minute. Mit SHA-256 Beweiskette, DSGVO-Konformität und AES-256 Verschlüsselung.',
    },
    metrics: ['Live SaaS', 'ÖNORM B 2110'],
    tags: ['Next.js', 'Convex', 'OpenAI', 'Computer Vision'],
    gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5',
    borderHover: 'hover:border-emerald-400/50',
    icon: '🏗️',
    link: 'https://faultrix.com',
  },
  {
    title: { en: 'EEG Signal Classification', de: 'EEG-Signal-Klassifikation' },
    description: {
      en: 'Deep RNN architectures (LSTM, Bi-LSTM, GRU) for motor imagery classification in brain-computer interface applications',
      de: 'Tiefe RNN-Architekturen (LSTM, Bi-LSTM, GRU) für Motorbildklassifikation in Brain-Computer-Interface-Anwendungen',
    },
    metrics: ['Motor Imagery', 'BCIs'],
    tags: ['LSTM', 'Bi-LSTM', 'GRU', 'TensorFlow'],
    gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5',
    borderHover: 'hover:border-amber-400/50',
    icon: '🧠',
    link: '/Motor Imagery classification Based Brain Computer.pdf',
    github: 'https://github.com/ahmed-3m/Motor-Imagery-classification',
  },
];

export default function Projects() {
  const { t } = useI18n();

  return (
    <section id="projects" className="py-20 max-w-6xl mx-auto px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-4xl font-bold mb-3">
          {t('Featured Projects', 'Ausgewählte Projekte')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {t(
            'From research prototypes to production systems — here\'s what I\'ve been building',
            'Von Forschungsprototypen bis Produktionssysteme — hier ist, woran ich gebaut habe'
          )}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`card-3d group relative bg-gradient-to-br ${project.gradient} p-6 rounded-xl border border-slate-200 dark:border-slate-700 ${project.borderHover} transition-all duration-300`}
          >
            {/* Project icon */}
            <div className="text-3xl mb-4">{project.icon}</div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {t(project.title.en, project.title.de)}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
              {t(project.description.en, project.description.de)}
            </p>

            {/* Metrics */}
            <div className="flex gap-2 mb-4">
              {project.metrics.map((metric) => (
                <span
                  key={metric}
                  className="px-2.5 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
                >
                  {metric}
                </span>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded text-xs text-slate-600 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Links */}
            {(project.link || project.github) && (
              <div className="flex gap-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    <Github size={15} />
                    Code
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <ArrowUpRight size={15} />
                    {t('View Project', 'Projekt ansehen')}
                  </a>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
