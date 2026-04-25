'use client'
import { useReveal } from '@/lib/useReveal'

const education = [
  {
    degree: 'M.Sc. in Artificial Intelligence',
    school: 'Johannes Kepler University Linz',
    date: 'Oct 2024 – Mar 2026',
    desc: 'Thesis: Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection — 99.03% AUROC on CIFAR-10',
  },
  {
    degree: 'B.Sc. in Mechatronics Engineering',
    school: 'Eastern Mediterranean University, Cyprus',
    date: 'Feb 2015 – Jan 2018',
    desc: 'Thesis: SCARA robotic system for dynamic object tracking (real-time control + sensor integration)',
  },
]

const skillCategories = [
  { name: 'Deep Learning',             skills: ['PyTorch', 'PyTorch Lightning', 'Diffusion Models (DDPM/UNet)', 'CNNs', 'Transformers', 'RNNs', 'LLMs'] },
  { name: 'Computer Vision',           skills: ['OOD Detection', 'Object Detection (YOLOv8)', 'Defect Detection', 'Image Classification'] },
  { name: 'Research & Experimentation',skills: ['Hydra', 'Experiment Design', 'Ablation Studies', 'AUROC/FPR95', 'Monte Carlo', 'Cross-Validation'] },
  { name: 'ML Engineering',            skills: ['End-to-End Pipelines', 'LLM Inference', 'Prompt Engineering', 'Structured Output Extraction', 'OpenAI API'] },
  { name: 'Infrastructure',            skills: ['Docker', 'Git', 'Linux', 'REST APIs', 'TypeScript', 'Next.js', 'Convex', 'CUDA', 'Python', 'OpenCV'] },
  { name: 'AI Tools',                  skills: ['GitHub Copilot', 'ChatGPT', 'Weights & Biases'] },
]

const languages = [
  { lang: 'Arabic',  level: 'Native' },
  { lang: 'English', level: 'B2 · Professional' },
  { lang: 'German',  level: 'B1 CEFR · improving' },
]

const infoRows = [
  { label: 'Location',   value: 'Linz, Austria',                         accent: false },
  { label: 'Supervisor', value: 'Prof. Sepp Hochreiter',                 accent: false },
  { label: 'Company',    value: 'Faultrix.com — Founder',                accent: true  },
  { label: 'Open to',   value: 'AI/ML Roles · Research Collaborations', accent: false },
]

export default function About() {
  useReveal()

  return (
    <section id="about" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 01 — About</div>

        {/* ── Band 1: Bio + sidebar ── */}
        <div className="cd-about-bio-row reveal">
          <div>
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
          </div>

          <div className="cd-about-side">
            {infoRows.map(r => (
              <div key={r.label} className="cd-info-row">
                <div className="cd-info-label">{r.label}</div>
                <div className={`cd-info-val${r.accent ? ' accent' : ''}`}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Band 2: Education ── */}
        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">Education</div>
          <div className="cd-education-grid">
            {education.map((edu, i) => (
              <div key={i} className="cd-education-card">
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

        {/* ── Band 3: Skills ── */}
        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">Skills &amp; Stack</div>
          <div className="cd-skills-grid">
            {skillCategories.map(cat => (
              <div key={cat.name} className="cd-skill-category">
                <div className="cd-skill-cat-name">{cat.name}</div>
                <div className="cd-chips" style={{ marginTop: 0 }}>
                  {cat.skills.map(skill => <span key={skill} className="cd-chip">{skill}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Band 4: Languages ── */}
        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">Languages</div>
          <div className="cd-lang-row">
            {languages.map(l => (
              <div key={l.lang} className="cd-lang-card">
                <div className="cd-lang-name">{l.lang}</div>
                <div className="cd-lang-level">{l.level}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
