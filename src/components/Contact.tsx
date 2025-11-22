'use client';

import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Phone, Bot, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/ahmed-3m' },
  { icon: Bot, label: 'Hugging Face', href: 'https://huggingface.co/ahmed-3m' },
  { icon: BarChart3, label: 'W&B', href: 'https://wandb.ai/ahmed-mu-0593' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-3m/' },
  { icon: Mail, label: 'Email', href: 'mailto:ahmed@faultrix.com' },
  { icon: Phone, label: 'Phone', href: 'tel:+4368120567353' },
];

export default function Contact() {
  const { t } = useI18n();

  return (
    <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <h2 className="text-4xl font-bold mb-4">
          {t("Let's Build Something Amazing", 'Lassen Sie uns etwas Großartiges schaffen')}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          {t(
            "I'm always interested in discussing AI/ML challenges and opportunities",
            'Ich bin immer daran interessiert, AI/ML-Herausforderungen und -Möglichkeiten zu besprechen'
          )}
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {socials.map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.1 } }}
              whileTap={{ y: 2, transition: { duration: 0.05 } }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="btn-3d flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[100px]"
            >
              <social.icon size={28} className="text-blue-600" />
              <span className="text-sm">{social.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
