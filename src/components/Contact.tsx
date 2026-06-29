'use client'

import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const socials = [
  { label: 'GitHub', href: 'https://github.com/ahmed-3m' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-3m/' },
  { label: 'Hugging Face', href: 'https://huggingface.co/ahmed-3m' },
  { label: 'W&B', href: 'https://wandb.ai/ahmed-mu-0593' },
  { label: 'X / Twitter', href: 'https://x.com/Ahmed_mo_93' },
]

const copy = {
  eyebrow: { en: '// 06 - Contact', de: '// 06 - Kontakt', fr: '// 06 - Contact', es: '// 06 - Contacto', ar: '// 06 - التواصل' },
  titleA: { en: "Let's build", de: 'Lass uns', fr: 'Construisons', es: 'Construyamos', ar: 'لنبنِ' },
  titleB: { en: 'something', de: 'etwas', fr: 'quelque chose', es: 'algo', ar: 'شيئاً' },
  titleC: { en: 'extraordinary', de: 'Aussergewohnliches bauen', fr: 'd extraordinaire', es: 'extraordinario', ar: 'استثنائياً' },
  sub: {
    en: 'Open to AI/ML roles, research collaborations, and product partnerships.',
    de: 'Offen fur AI/ML-Rollen, Forschungskooperationen und Produktpartnerschaften.',
    fr: 'Ouvert aux roles IA/ML, collaborations de recherche et partenariats produit.',
    es: 'Abierto a roles de IA/ML, colaboraciones de investigacion y alianzas de producto.',
    ar: 'متاح لأدوار الذكاء الاصطناعي، وتعاونات البحث، وشراكات المنتجات.',
  },
} satisfies Record<string, TranslationMap>

export default function Contact() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="contact" className="cd-section cd-contact-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>
          {t(copy.eyebrow)}
        </div>

        <h2 className="cd-contact-heading reveal">
          {t(copy.titleA)} <span className="outline">{t(copy.titleB)}</span> {t(copy.titleC)}
        </h2>

        <p className="cd-contact-sub reveal">{t(copy.sub)}</p>

        <div className="cd-contact-links reveal">
          {socials.map((social) => (
            <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" className="cd-contact-link">
              {social.label} &rarr;
            </a>
          ))}
          <ScheduleMeetingButton variant="link" />
          <RequestCvButton variant="link" />
        </div>

        <a href="mailto:ahmed@faultrix.com" className="cd-contact-email reveal">
          ahmed@faultrix.com
        </a>
      </div>
    </section>
  )
}
