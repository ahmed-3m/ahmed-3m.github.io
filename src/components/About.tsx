'use client'
import { useReveal } from '@/lib/useReveal'

const chips = [
  'Computer Vision', 'Diffusion Models', 'OOD Detection', 'PyTorch',
  'CUDA', 'Python', 'OpenCV', 'MLOps', 'Research', 'Entrepreneurship',
]

const infoRows = [
  { label: 'Location', value: 'Linz, Austria', accent: false },
  { label: 'Education', value: 'M.Sc. AI · JKU Linz', accent: false },
  { label: 'Supervisor', value: 'Prof. Sepp Hochreiter', accent: false },
  { label: 'Company', value: 'Faultrix.com — Founder', accent: true },
  { label: 'Open to', value: 'AI/ML Roles · Research Collaborations', accent: false },
]

export default function About() {
  useReveal()

  return (
    <section id="about" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 01 — About</div>
        <div className="cd-about-grid">

          <div className="reveal">
            <h2 className="cd-section-title" style={{ marginBottom: 24 }}>
              Built on research.<br />Deployed in production.
            </h2>
            <div className="cd-about-text">
              <p>
                I&apos;m an AI/ML engineer completing my{' '}
                <strong>M.Sc. in Artificial Intelligence at JKU Linz</strong>, working under{' '}
                <strong>Prof. Sepp Hochreiter</strong> — the inventor of LSTM.
              </p>
              <p>
                My work spans the full stack: from novel training methods for diffusion models
                and out-of-distribution detection in academic settings, to shipping
                production-grade CV pipelines that catch defects at{' '}
                <strong>98.4% accuracy</strong>.
              </p>
              <p>
                I founded <strong>Faultrix</strong> to turn this research into a real product —
                AI-powered construction quality control that generates ÖNORM-compliant reports
                in under a minute. Open to research collaborations and senior AI/ML roles.
              </p>
            </div>
            <div className="cd-chips">
              {chips.map(c => <span key={c} className="cd-chip">{c}</span>)}
            </div>
          </div>

          <div className="cd-about-side reveal">
            {infoRows.map(r => (
              <div key={r.label} className="cd-info-row">
                <div className="cd-info-label">{r.label}</div>
                <div className={`cd-info-val${r.accent ? ' accent' : ''}`}>{r.value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
