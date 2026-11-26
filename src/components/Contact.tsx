'use client'

import { ArrowUpRight, Mail } from 'lucide-react'
import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
import FrontDeskButton from '@/components/FrontDeskButton'
import { useI18n, type TranslationMap } from '@/lib/i18n'

const socials = [
  { label: 'GitHub', href: 'https://github.com/ahmed-3m' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-3m/' },
  { label: 'Hugging Face', href: 'https://huggingface.co/ahmed-3m' },
  { label: 'ORCID', href: 'https://orcid.org/0009-0004-8934-1270' },
  { label: 'W&B', href: 'https://wandb.ai/ahmed-mu-0593' },
  // TODO(owner): re-enable with new X account
  // { label: 'X / Twitter', href: 'https://x.com/Ahmed_mo_93' },
]

const copy = {
  eyebrow: { en: '// Contact', de: '// Kontakt', fr: '// Contact', es: '// Contacto', ar: '// التواصل' },
  titleA: { en: "Let's build", de: 'Lass uns', fr: 'Construisons', es: 'Construyamos', ar: 'لنبنِ' },
  titleB: { en: 'something', de: 'etwas', fr: 'quelque chose', es: 'algo', ar: 'شيئاً' },
  titleC: { en: 'extraordinary', de: 'Außergewöhnliches bauen', fr: 'd\'extraordinaire', es: 'extraordinario', ar: 'استثنائياً' },
  title: { en: 'Contact', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' },
  sub: {
    en: 'Open to AI/ML roles, research collaborations, and product partnerships.',
    de: 'Offen für AI/ML-Rollen, Forschungskooperationen und Produktpartnerschaften.',
    fr: "Ouvert aux rôles IA/ML, collaborations de recherche et partenariats produit.",
    es: 'Abierto a roles de IA/ML, colaboraciones de investigación y alianzas de producto.',
    ar: 'متاح لأدوار الذكاء الاصطناعي، وتعاونات البحث، وشراكات المنتجات.',
  },
  workPermit: {
    en: 'Based in Linz, Austria · Eligible for Austria’s Rot-Weiß-Rot Karte für Studienabsolventen (no labour-market test).',
    de: 'Standort Linz, Österreich · Berechtigt für die Rot-Weiß-Rot-Karte für Studienabsolventen (ohne Arbeitsmarktprüfung).',
    fr: 'Basé à Linz, Autriche · Éligible à la Rot-Weiß-Rot Karte für Studienabsolventen (sans test du marché du travail).',
    es: 'Con base en Linz, Austria · Elegible para la Rot-Weiß-Rot Karte für Studienabsolventen (sin prueba del mercado laboral).',
    ar: 'مقيم في لينتس، النمسا · مؤهل لبطاقة Rot-Weiß-Rot Karte für Studienabsolventen (دون اختبار سوق العمل).',
  },
} satisfies Record<string, TranslationMap>

export default function Contact({ full = false }: { full?: boolean }) {
  const { t } = useI18n()

  if (full) {
    return (
      <section id="contact" className="cd-section cd-contact-section">
        <div className="cd-container">
          <div className="cd-section-eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>
            {t(copy.eyebrow)}
          </div>

          <h2 className="cd-contact-heading">
            {t(copy.titleA)} <span className="outline">{t(copy.titleB)}</span> {t(copy.titleC)}
          </h2>

          <p className="cd-contact-sub" style={{ marginBottom: 8 }}>{t(copy.sub)}</p>
          <p className="mb-9 text-sm text-[var(--cd-fg3)]">{t(copy.workPermit)}</p>

          <div className="cd-contact-links">
            {socials.map((social) => (
              <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="cd-contact-link">
                {social.label} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
              </a>
            ))}
            <ScheduleMeetingButton variant="link" />
            <FrontDeskButton variant="link" />
            <RequestCvButton variant="link" />
          </div>

          <a href="mailto:ahmed.mu.0905@gmail.com" className="cd-contact-email">
            ahmed.mu.0905@gmail.com
          </a>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="portfolio-contact portfolio-shell" aria-labelledby="portfolio-contact-title">
      <div className="portfolio-contact-top">
        <div>
          <h2 id="portfolio-contact-title">{t(copy.title)}</h2>
          <p className="portfolio-contact-sub">{t(copy.sub)}</p>
          <p className="mt-1.5 max-w-[56ch] text-sm leading-snug text-[var(--cd-fg3)]">{t(copy.workPermit)}</p>
        </div>
        <a href="mailto:ahmed.mu.0905@gmail.com" className="portfolio-contact-email">
          <Mail size={16} strokeWidth={2.1} aria-hidden="true" />
          <bdi dir="ltr">ahmed.mu.0905@gmail.com</bdi>
        </a>
      </div>
      <div className="portfolio-contact-links">
        {socials.map((social) => (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-contact-chip"
          >
            <bdi>{social.label}</bdi>
            <ArrowUpRight size={13} strokeWidth={2.1} className="rtl:-scale-x-100" aria-hidden="true" />
          </a>
        ))}
        <ScheduleMeetingButton variant="link" compact className="portfolio-contact-chip" />
        <FrontDeskButton variant="link" compact className="portfolio-contact-chip" />
        <RequestCvButton variant="link" compact className="portfolio-contact-chip" />
      </div>
    </section>
  )
}
