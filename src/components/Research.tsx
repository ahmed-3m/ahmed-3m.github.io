'use client'
import { useReveal } from '@/lib/useReveal'

const publications = [
  {
    title: 'Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation',
    venue: 'Karunya University · 2023',
    href: 'https://ahmed-3m.github.io/Motor%20Imagery%20classification%20Based%20Brain%20Computer.pdf',
  },
  {
    title: 'Reading Thoughts Using GANs',
    venue: 'JKU Linz · 2023',
    href: 'https://ahmed-3m.github.io/Reading%20Thoughts%20Using%20GANs.pdf',
  },
  {
    title: 'Diffusion-Based Multi-class Defect Detection: A Generative Approach to Industrial QC',
    venue: 'PROFACTOR GmbH · JKU Linz · 2024',
    href: 'https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf',
  },
]

export default function Research() {
  useReveal()

  return (
    <section id="research" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 04 — Research</div>
        <h2 className="cd-section-title" style={{ marginBottom: 32 }}>Publications &amp; Thesis</h2>

         <div className="cd-research-featured reveal">
           <div className="cd-rf-label">Master&apos;s Thesis · JKU Linz · 2026</div>
           <div className="cd-rf-title">
             Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection
           </div>
           <div className="cd-rf-desc">
             Novel approach using conditional diffusion models as generative classifiers for robust
             out-of-distribution detection. Achieved 99.03% AUROC on CIFAR-10 with class-conditional separation loss.
           </div>
           <div className="cd-rf-meta">
             Supervisor: Prof. Sepp Hochreiter · Assistant: Claus Hofmann · JKU Linz · 2026
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
             <img src="/ood-roc-cifar10.png" alt="ROC Curves CIFAR-10" style={{ width: '100%', borderRadius: '8px' }} />
             <img src="/ood-score-distributions.png" alt="Score Distributions" style={{ width: '100%', borderRadius: '8px' }} />
             <img src="/ood-separation-loss-ablation.png" alt="Separation Loss Ablation" style={{ width: '100%', borderRadius: '8px' }} />
           </div>
           <a
             href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf"
             target="_blank"
             rel="noopener noreferrer"
             className="cd-proj-link"
             style={{ marginTop: 16 }}
           >
             View Full Thesis ↗
           </a>
         </div>

        <div className="cd-pub-list">
          {publications.map(pub => (
            <a
              key={pub.href}
              href={pub.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cd-pub-item reveal"
            >
              <div>
                <div className="cd-pub-title">{pub.title}</div>
                <div className="cd-pub-venue">{pub.venue}</div>
              </div>
              <div className="cd-pub-arrow">↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
