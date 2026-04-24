'use client'
import { useReveal } from '@/lib/useReveal'

const education = [
  { degree: 'M.Sc. in Artificial Intelligence', school: 'Johannes Kepler University Linz', date: 'Oct 2024 – Mar 2026', desc: '' },
  { degree: 'B.Sc. in Mechatronics Engineering', school: 'Eastern Mediterranean University, Cyprus', date: 'Feb 2015 – Jan 2018', desc: 'Thesis: SCARA robotic system for dynamic object tracking (real-time control + sensor integration)' }
]

const skillCategories = [
  { name: 'Deep Learning', skills: ['PyTorch', 'PyTorch Lightning', 'Diffusion Models (DDPM/UNet)', 'CNNs', 'Transformers', 'RNNs', 'LLMs'] },
  { name: 'Computer Vision', skills: ['OOD Detection', 'Object Detection (YOLOv8)', 'Defect Detection', 'Image Classification'] },
  { name: 'Research & Experimentation', skills: ['Hydra', 'Experiment Design', 'Ablation Studies', 'AUROC/FPR95', 'Monte Carlo', 'Cross-Validation'] },
  { name: 'ML Engineering', skills: ['End-to-End Pipelines', 'LLM Inference', 'Prompt Engineering', 'Structured Output Extraction', 'OpenAI API'] },
  { name: 'Infrastructure', skills: ['Docker', 'Git', 'Linux', 'REST APIs', 'TypeScript', 'Next.js', 'Convex', 'CUDA', 'Python', 'OpenCV'] },
  { name: 'AI Tools', skills: ['Claude Code (daily)', 'GitHub Copilot', 'ChatGPT'] }
]

const languages = [
  { lang: 'Arabic', level: 'Native' },
  { lang: 'English', level: 'B2 Professional Working' },
  { lang: 'German', level: 'B1 CEFR (actively improving)' },
]

const infoRows = [
   { label: 'Location', value: 'Linz, Austria', accent: false },
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
                I&apos;m an AI/ML engineer who completed my{' '}
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
             <div style={{ marginTop: '40px' }}>
               <div className="cd-section-eyebrow" style={{ marginBottom: '16px' }}>Education</div>
               <div className="cd-education-grid">
                 {education.map((edu, i) => (
                   <div key={i} className="cd-education-card reveal">
                     <div className="cd-edu-header">
                       <div className="cd-edu-degree">{edu.degree}</div>
                       <div className="cd-edu-date">{edu.date}</div>
                     </div>
                     <div className="cd-edu-institution">{edu.school}</div>
                     {edu.desc && <div className="cd-edu-description">{edu.desc}</div>}
                   </div>
                 ))}
               </div>
             </div>

            <div style={{ marginTop: '40px' }}>
              <div className="cd-section-eyebrow" style={{ marginBottom: '16px' }}>Skills & Technologies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {skillCategories.map(cat => (
                  <div key={cat.name}>
                    <div style={{ fontSize: '13px', color: 'var(--cd-fg1)', fontWeight: 600, marginBottom: '8px' }}>{cat.name}</div>
                    <div className="cd-chips" style={{ marginTop: 0 }}>
                      {cat.skills.map(skill => <span key={skill} className="cd-chip">{skill}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <div className="cd-section-eyebrow" style={{ marginBottom: '16px' }}>Languages</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {languages.map(l => (
                  <div key={l.lang} style={{ background: 'var(--cd-surf)', border: '1px solid var(--cd-b0)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--cd-fg1)', fontWeight: 600, fontSize: '14px' }}>{l.lang}</div>
                    <div style={{ color: 'var(--cd-fg2)', fontSize: '12px', marginTop: '2px' }}>{l.level}</div>
                  </div>
                ))}
              </div>
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
