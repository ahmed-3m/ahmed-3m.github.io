'use client'
import { useReveal } from '@/lib/useReveal'

export default function Projects() {
  useReveal()

  return (
    <section id="projects" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 02 — Projects</div>
        <h2 className="cd-section-title">Research that ships.</h2>

        <div className="cd-projects-grid">

          {/* Featured */}
          <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" className="cd-project-featured reveal">
            <div>
              <div className="cd-proj-eyebrow">⬡ Live SaaS · Founder</div>
              <div className="cd-proj-title">Faultrix</div>
              <div className="cd-proj-desc">
                AI-powered construction quality control SaaS. Analyzes building photos and generates
                ÖNORM-compliant reports in under 1 minute — SHA-256 evidence chain, DSGVO compliant,
                AES-256 encryption. Built solo from zero to production.
              </div>
              <div className="cd-proj-tags">
                {['Next.js', 'Convex', 'OpenAI', 'Clerk', 'Cloudflare R2', 'Stripe'].map(t => (
                  <span key={t} className="cd-proj-tag">{t}</span>
                ))}
              </div>
              <span className="cd-proj-link">faultrix.com ↗</span>
            </div>
            <div className="cd-proj-metric-big">
              <div className="num">&lt;1</div>
              <div className="unit">min per report</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)', marginTop: 8 }}>
                ÖNORM · DSGVO compliant
              </div>
            </div>
          </a>

           {/* OOD */}
           <a href="https://github.com/ahmed-3m/OOD-diffusion-detector" target="_blank" rel="noopener noreferrer" className="cd-project-card reveal">
             <div className="cd-pc-eyebrow">Master&apos;s Thesis · JKU Linz</div>
             <div className="cd-pc-title">OOD Detection Framework</div>
             <div className="cd-pc-desc">
               Conditional diffusion models as generative classifiers achieving 99.03% AUROC for robust out-of-distribution detection. 
               Introduced class-conditional separation loss improving performance by 18.8 percentage points. Applied to industrial 
               quality control with multi-head conditioning for structured manufacturing data.
             </div>
             <div className="cd-pc-metric">99.0<span>% AUROC (CIFAR-10)</span></div>
           </a>

          {/* Anomaly */}
          <a href="https://github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking" target="_blank" rel="noopener noreferrer" className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">PROFACTOR GmbH</div>
            <div className="cd-pc-title">Industrial Anomaly Detection</div>
            <div className="cd-pc-desc">
              YOLO + diffusion model pipeline for industrial quality control.
              Real-time defect detection in production environment.
            </div>
            <div className="cd-pc-metric">98.4<span>% accuracy</span></div>
          </a>

          {/* EEG */}
          <a
            href="https://github.com/ahmed-3m/Motor-Imagery-classification"
            target="_blank"
            rel="noopener noreferrer"
            className="cd-project-card cd-project-card--full reveal"
          >
            <div className="cd-pc-eyebrow">Karunya University · BCI Research</div>
            <div className="cd-pc-title">EEG Signal Classification</div>
            <div className="cd-pc-desc">
              LSTM · Bi-LSTM · GRU architectures for motor imagery classification
              in brain-computer interface applications. Hyperparameter optimization
              across multiple architectures.
            </div>
          </a>

        </div>
      </div>
    </section>
  )
}
