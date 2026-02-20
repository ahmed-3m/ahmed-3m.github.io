'use client';

import { FormEvent, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Github, Linkedin, Phone, Bot, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// Custom X (formerly Twitter) icon
const XIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/ahmed-3m' },
  { icon: Bot, label: 'Hugging Face', href: 'https://huggingface.co/ahmed-3m' },
  { icon: BarChart3, label: 'W&B', href: 'https://wandb.ai/ahmed-mu-0593' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-3m/' },
  { icon: XIcon, label: 'X', href: 'https://x.com/Ahmed_mo_93' },
  { icon: Mail, label: 'Email', href: 'mailto:ahmed.mo.0595@gmail.com' },
  { icon: Phone, label: 'Phone', href: 'tel:+4368120567353', ariaLabel: 'Call Ahmed' },
];

export default function Contact() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry from ${formData.name || 'Website visitor'}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:ahmed.mo.0595@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-4xl font-bold mb-4">
          {t("Let's Build Something Amazing", 'Lassen Sie uns etwas Großartiges schaffen')}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          {t(
            "I'm always interested in discussing AI/ML challenges and opportunities",
            'Ich bin immer daran interessiert, AI/ML-Herausforderungen und -Möglichkeiten zu besprechen'
          )}
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <motion.form
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45 }}
            viewport={{ once: true }}
            className="glass-surface glass-medium glass-noise p-6 sm:p-8"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-5">
              {t('Send a quick message', 'Senden Sie eine kurze Nachricht')}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                  {t('Name', 'Name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/75 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:border-blue-500"
                  placeholder={t('Your name', 'Ihr Name')}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                  {t('Email', 'E-Mail')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-300/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/75 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:border-blue-500"
                  placeholder={t('you@company.com', 'sie@firma.com')}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                {t('Message', 'Nachricht')}
              </label>
              <textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/75 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:border-blue-500"
                placeholder={t('Tell me about your project or challenge', 'Erzählen Sie mir von Ihrem Projekt oder Ihrer Herausforderung')}
              />
            </div>

            <button
              type="submit"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors"
            >
              {t('Send Message', 'Nachricht senden')}
            </button>
          </motion.form>

          <div className="glass-surface glass-subtle glass-noise p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {t('Or reach me directly', 'Oder kontaktieren Sie mich direkt')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {socials.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-surface glass-subtle flex flex-col items-center gap-2 p-3.5 min-w-[100px] text-center"
                >
                  <social.icon size={24} className="text-blue-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
