'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating gradient orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-1/4 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-5 z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Headshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-sm opacity-60" />
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                <Image
                  src="/headshot.jpg"
                  alt="Ahmed Mohammed — AI/ML Engineer and Entrepreneur based in Linz, Austria"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <div className="text-center md:text-left">
            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {t('Open to opportunities', 'Offen für Möglichkeiten')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight"
            >
              <span className="text-slate-800 dark:text-slate-100">Ahmed </span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
                Mohammed
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-8"
            >
              {t('AI/ML Engineer & Entrepreneur', 'AI/ML Ingenieur & Unternehmer')}
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center md:justify-start gap-10 md:gap-14 flex-wrap mb-10"
            >
              {[
                { value: '4+', label: t('Years Experience', 'Jahre Erfahrung') },
                { value: '98.4%', label: t('Defect Detection', 'Fehler Erkennung') },
                { value: '~15%', label: t('Efficiency Gain', 'Effizienzgewinn') },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="text-center group"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex gap-4 justify-center md:justify-start flex-wrap"
            >
              <a
                href="#contact"
                className="btn-3d px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                {t('Get In Touch', 'Kontakt aufnehmen')}
              </a>
              <a
                href="#projects"
                className="btn-3d px-8 py-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 font-semibold text-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
              >
                {t('View Projects', 'Projekte ansehen')}
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 text-center"
        >
          <motion.a
            href="#about"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors"
          >
            <span className="text-xs mb-1">{t('Scroll', 'Scrollen')}</span>
            <ChevronDown size={20} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
