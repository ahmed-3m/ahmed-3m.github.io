'use client'

import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
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
  title: { en: 'Contact', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' },
  sub: {
    en: 'Open to AI/ML roles, research collaborations, and product partnerships.',
    de: 'Offen für AI/ML-Rollen, Forschungskooperationen und Produktpartnerschaften.',
    fr: "Ouvert aux rôles IA/ML, collaborations de recherche et partenariats produit.",
    es: 'Abierto a roles de IA/ML, colaboraciones de investigación y alianzas de producto.',
    ar: 'متاح لأدوار الذكاء الاصطناعي، وتعاونات البحث، وشراكات المنتجات.',
  },
} satisfies Record<string, TranslationMap>

export default function Contact() {
  const { t } = useI18n()

  return (
    <section id="contact" className="portfolio-contact portfolio-shell" aria-labelledby="portfolio-contact-title">
      <h2 id="portfolio-contact-title">{t(copy.title)}</h2>
      <p>{t(copy.sub)}</p>
      <a href="mailto:ahmed.mo.0595@gmail.com" className="portfolio-text-link">
        ahmed.mo.0595@gmail.com
      </a>
      <div className="portfolio-case-links">
        {socials.map((social) => (
          <a key={social.href} href={social.href} className="portfolio-text-link">{social.label}</a>
        ))}
        <ScheduleMeetingButton variant="link" compact className="portfolio-text-link" />
        <RequestCvButton variant="link" compact className="portfolio-text-link" />
      </div>
    </section>
  )
}
