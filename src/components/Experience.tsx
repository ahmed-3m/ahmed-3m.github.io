'use client'
import { useReveal } from '@/lib/useReveal'

const experiences = [
  {
    date: 'Jul 2025\nPresent',
    role: 'Founder & Full-Stack Developer',
    company: 'Faultrix · Linz, Austria',
    desc: 'Built AI construction analysis platform solo from zero to production. Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, Stripe. ÖNORM-compliant reports with SHA-256 evidence chain and AES-256 encryption.',
    badge: 'Active · faultrix.com',
    active: true,
  },
  {
    date: 'Apr 2024\nMar 2026',
    role: 'M.Sc. Thesis Researcher',
    company: 'JKU Machine Learning Institute & PROFACTOR GmbH · Linz / Steyr',
    desc: 'Thesis: "Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection" under Prof. Sepp Hochreiter. Industrial research on-site at PROFACTOR GmbH (Zer0P project, funded by Govt. of Upper Austria): YOLO + diffusion pipeline for inkjet defect detection — 98.4% accuracy in real-time production.',
    badge: 'Thesis submitted · Under review',
    active: false,
  },
  {
    date: 'Aug 2023\nOct 2023',
    role: 'AI Research Intern',
    company: 'Karunya University · India (Remote)',
    desc: 'RNN/CNN architectures for EEG motor imagery classification. Hyperparameter optimization across LSTM, Bi-LSTM, and GRU models.',
    badge: null,
    active: false,
    last: true,
  },
]

export default function Experience() {
  useReveal()

  return (
    <section id="experience" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 03 — Experience</div>
        <h2 className="cd-section-title" style={{ marginBottom: 48 }}>Where I&apos;ve worked.</h2>

        <div className="cd-timeline">
          {experiences.map((exp, i) => (
            <div key={i} className="cd-tl-item reveal">
              <div className="cd-tl-date" style={{ whiteSpace: 'pre-line' }}>{exp.date}</div>
              <div className="cd-tl-spine">
                <div className={`cd-tl-dot${exp.active ? '' : ' dim'}`} />
                {!exp.last && <div className="cd-tl-line" />}
              </div>
              <div className="cd-tl-content">
                <div className="cd-tl-role">{exp.role}</div>
                <div className="cd-tl-company">{exp.company}</div>
                <div className="cd-tl-desc">{exp.desc}</div>
                {exp.badge && <div className="cd-tl-badge">{exp.badge}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
