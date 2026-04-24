'use client'
import { useReveal } from '@/lib/useReveal'

export default function Hero() {
  useReveal()

  return (
    <section
      id="hero"
      className="cd-hero"
      style={{ borderTop: 'none' }}
    >
      <div className="cd-container">
        <div className="cd-hero-grid">

          {/* Left: text */}
          <div>
            <div className="cd-hero-eyebrow">Based in Linz, Austria</div>
            <h1 className="cd-hero-name">
              Ahmed<br />Mohammed
            </h1>
            <div className="cd-hero-title">
              <span>Computer Vision</span>
              {' · '}
              <span>Diffusion Models</span>
              {' · '}
              <span>OOD Detection</span>
            </div>
            <p className="cd-hero-body">
              AI/ML engineer and entrepreneur. I build systems that work in the real world — from research to production.
            </p>
            <div className="cd-hero-ctas">
              <a href="#projects" className="cd-btn-primary">View work →</a>
              <a href="#contact" className="cd-btn-ghost">Get in touch</a>
            </div>
            <div className="cd-hero-stats">
              <div className="cd-stat">
                <div className="cd-stat-num">4<span className="a">+</span></div>
                <div className="cd-stat-label">Years in AI/ML</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">98<span className="a">.</span>4<span style={{ fontSize: 14, color: 'var(--cd-fg3)', fontWeight: 400 }}>%</span></div>
                <div className="cd-stat-label">Detection accuracy</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">~15<span className="g" style={{ fontSize: 16 }}>%</span></div>
                <div className="cd-stat-label">Efficiency gain</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">&lt;1<span style={{ fontSize: 14, color: 'var(--cd-fg3)', fontWeight: 400 }}> min</span></div>
                <div className="cd-stat-label">Report generation</div>
              </div>
            </div>
          </div>

          {/* Right: terminal */}
          <div>
            <div className="cd-hero-terminal">
              <div className="cd-term-bar">
                <div className="cd-term-dot" style={{ background: '#ff5f57' }} />
                <div className="cd-term-dot" style={{ background: '#febc2e' }} />
                <div className="cd-term-dot" style={{ background: '#28c840' }} />
              </div>
              <div className="cd-term-line"><span className="tc">~/faultrix $ </span><span className="ta">python</span> train.py --model diffusion</div>
              <div className="cd-term-line" style={{ color: 'var(--cd-fg3)' }}>Loading 42,810 samples · GPU: RTX 4090</div>
              <div className="cd-term-line"><span className="tg">✓</span> Model init · params: 87M · dtype: bf16</div>
              <div className="cd-term-line"><span className="tg">✓</span> Epoch 100/100 · loss: <span className="ta">0.0023</span></div>
              <div className="cd-term-line">Detection accuracy: <span className="tg" style={{ fontWeight: 600 }}>98.4%</span> <span className="tc">← SOTA</span></div>
              <div className="cd-term-line"><span className="tw">→</span> Generating QC report... <span className="ta">&lt;1 min</span></div>
              <div className="cd-term-line"><span className="tc">~/faultrix $ </span><span className="cd-cursor" /></div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['PyTorch', 'Diffusion Models', 'Computer Vision', 'OOD Detection', 'CUDA', 'Python'].map(t => (
                <span key={t} className="cd-chip">{t}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
