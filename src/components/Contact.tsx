'use client'
import { useReveal } from '@/lib/useReveal'

const socials = [
  { label: 'GitHub', href: 'https://github.com/ahmed-3m' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmed-3m/' },
  { label: 'Hugging Face', href: 'https://huggingface.co/ahmed-3m' },
  { label: 'W&B', href: 'https://wandb.ai/ahmed-mu-0593' },
  { label: 'X / Twitter', href: 'https://x.com/Ahmed_mo_93' },
]

export default function Contact() {
  useReveal()

  return (
    <section id="contact" className="cd-section cd-contact-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow" style={{ justifyContent: 'center', marginBottom: 16 }}>
          // 05 — Contact
        </div>

        <h2 className="cd-contact-heading reveal">
          Let&apos;s build <span className="outline">something</span> extraordinary
        </h2>

        <p className="cd-contact-sub reveal">
          Open to AI/ML roles, research collaborations, and product partnerships.
        </p>

        <div className="cd-contact-links reveal">
          {socials.map(s => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="cd-contact-link">
              {s.label} ↗
            </a>
          ))}
        </div>

        <a href="mailto:ahmed.mo.0595@gmail.com" className="cd-contact-email reveal">
          ahmed.mo.0595@gmail.com
        </a>
      </div>
    </section>
  )
}
