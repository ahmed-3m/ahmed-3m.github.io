'use client';

import { useState, ReactNode } from 'react';
import { useI18n } from '@/lib/i18n';

const tabs = [
  { id: 'founder', en: 'Entrepreneur', de: 'Unternehmer' },
  { id: 'researcher', en: 'Researcher', de: 'Forscher' },
  { id: 'engineer', en: 'Engineer', de: 'Ingenieur' },
];

const content: Record<string, {
  title: { en: string; de: string };
  text: { en: ReactNode; de: ReactNode };
  tags: string[];
}> = {
  founder: {
    title: { en: 'Building the Future', de: 'Die Zukunft gestalten' },
    text: {
      en: <>As Founder of <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Faultrix</a>, I built an AI-powered SaaS for construction quality control. The platform analyzes building photos and generates ÖNORM-compliant technical reports in under 1 minute — with SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption.</>,
      de: <>Als Gründer von <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Faultrix</a> habe ich eine KI-gestützte SaaS für Bauqualitätskontrolle entwickelt. Die Plattform analysiert Gebäudefotos und erstellt ÖNORM-konforme technische Berichte in unter 1 Minute — mit SHA-256 Beweiskette, DSGVO-Konformität und AES-256 Verschlüsselung.</>,
    },
    tags: ['AI/ML', 'Computer Vision', 'Full-Stack Development', 'Product Strategy'],
  },
  researcher: {
    title: { en: 'Machine Learning Researcher', de: 'Machine Learning Forscher' },
    text: {
      en: <>Currently researching out-of-distribution detection with diffusion models under <a href="https://www.jku.at/institut-fuer-machine-learning/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Prof. Sepp Hochreiter at JKU Linz</a>. Previously achieved 98.4% accuracy in industrial defect detection at <a href="https://www.profactor.at" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">PROFACTOR GmbH</a> using YOLO and diffusion-based classifiers.</>,
      de: <>Derzeit erforsche ich Out-of-Distribution-Erkennung mit Diffusionsmodellen unter <a href="https://www.jku.at/institut-fuer-machine-learning/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Prof. Sepp Hochreiter an der JKU Linz</a>. Zuvor erreichte ich 98.4% Genauigkeit bei der industriellen Fehlererkennung bei <a href="https://www.profactor.at" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">PROFACTOR GmbH</a>.</>,
    },
    tags: ['Diffusion Models', 'PyTorch', 'YOLO', 'Self-Supervised Learning', 'Computer Vision'],
  },
  engineer: {
    title: { en: 'Technical Excellence', de: 'Technische Exzellenz' },
    text: {
      en: 'Deep expertise in computer vision, anomaly detection, and generative models with 4+ years of hands-on experience. Specialized in bridging cutting-edge research with production systems.',
      de: 'Tiefe Expertise in Computer Vision, Anomalieerkennung und generativen Modellen mit über 4 Jahren praktischer Erfahrung. Spezialisiert auf die Verbindung von Spitzenforschung mit Produktionssystemen.',
    },
    tags: ['CNNs', 'LSTMs', 'GANs', 'Autoencoders', 'TensorFlow', 'PyTorch', 'OpenCV'],
  },
};

export default function About() {
  const [activeTab, setActiveTab] = useState('founder');
  const { t, lang } = useI18n();
  const current = content[activeTab];

  return (
    <section id="about" className="py-20 max-w-6xl mx-auto px-5">
      <h2 className="text-4xl font-bold text-center mb-12">{t('Who I Am', 'Wer ich bin')}</h2>

      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-3d px-6 py-3 rounded-lg font-medium ${activeTab === tab.id
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {t(tab.en, tab.de)}
          </button>
        ))}
      </div>

      <div
        className="card-3d bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          {t(current.title.en, current.title.de)}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {lang === 'en' ? current.text.en : current.text.de}
        </p>
        <div className="flex flex-wrap gap-2">
          {current.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
