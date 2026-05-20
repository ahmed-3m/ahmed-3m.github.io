'use client'
import { useState, useEffect } from 'react'
import { useReveal } from '@/lib/useReveal'

const publications = [
  {
    title: 'Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation',
    venue: 'Karunya University · 2023',
    href: 'https://ahmed-3m.github.io/Motor%20Imagery%20classification%20Based%20Brain%20Computer.pdf',
  },
  {
    title: 'Reading Thoughts Using GANs',
    venue: 'Project Report · JKU Linz · 2023',
    href: 'https://ahmed-3m.github.io/Reading%20Thoughts%20Using%20GANs.pdf',
  },
]

const charts = [
  { src: '/ood-separation-loss-ablation.png', alt: 'Separation Loss Ablation', caption: 'Separation loss weight λ — key contribution', lightBg: false },
  { src: '/ood-roc-cifar10.png', alt: 'ROC Curves', caption: 'ROC curves — CIFAR-10 vs 5 OOD datasets', lightBg: true },
  { src: '/ood-score-distributions.png', alt: 'Score Distributions', caption: 'ID vs OOD score distributions per class', lightBg: true },
]

export default function Research() {
  useReveal()
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <section id="research" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 04 — Research</div>
        <h2 className="cd-section-title" style={{ marginBottom: 32 }}>Reports &amp; Thesis</h2>

         <div className="cd-research-featured reveal" itemScope itemType="https://schema.org/Thesis">
           <div className="cd-rf-header">
             <div className="cd-rf-left">
               <div className="cd-rf-label">Master&apos;s Thesis · JKU Linz · 2026</div>
               <div className="cd-rf-title" itemProp="name">
                 Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection
               </div>
               <div className="cd-rf-desc" itemProp="description">
                 Novel approach using conditional diffusion models as generative classifiers for robust
                 out-of-distribution detection. Introduced class-conditional separation loss improving
                 AUROC by 18.8 percentage points. Applied to industrial quality control with multi-head conditioning.
               </div>
               <div className="cd-rf-meta">
                 Supervisor: <span itemProp="contributor" itemScope itemType="https://schema.org/Person"><span itemProp="name">Prof. Sepp Hochreiter</span></span>
                 {' · '}Assistant: <span itemProp="contributor" itemScope itemType="https://schema.org/Person"><span itemProp="name">Claus Hofmann</span></span>
                 {' · '}<span itemProp="publisher" itemScope itemType="https://schema.org/CollegeOrUniversity"><span itemProp="name">JKU Linz</span></span>
                 {' · '}<span itemProp="datePublished">2026</span>
               </div>
             </div>
             <div className="cd-rf-metric">
               <div className="cd-rf-metric-num">99.03<span className="cd-rf-metric-unit">%</span></div>
               <div className="cd-rf-metric-label">AUROC · CIFAR-10</div>
               <div className="cd-rf-metric-delta">+18.8pp over baseline</div>
             </div>
           </div>

           <div className="cd-rf-charts">
             {charts.map(({ src, alt, caption, lightBg }, i) => (
               <div
                 key={src}
                 className="cd-rf-chart cd-rf-chart--zoom"
                 onClick={() => setLightbox(i)}
                 title="Click to expand"
               >
                 <img
                   src={src}
                   alt={alt}
                   style={{
                     width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px',
                     ...(lightBg ? { filter: 'invert(1) hue-rotate(180deg)' } : {}),
                   }}
                 />
                 <div className="cd-rf-chart-caption">{caption}</div>
               </div>
             ))}
           </div>

           {/* Novel contribution formula */}
           <div className="cd-rf-formula-box">
             <div className="cd-rfc-label">Novel contribution · Class-conditional separation loss</div>
             <div className="cd-rfc-code">
               <div><span className="cd-rfc-accent">L_total</span>{' = L_diffusion + λ · '}<span className="cd-rfc-green">L_sep</span></div>
               <div><span className="cd-rfc-green">L_sep</span>{'   = −MSE(pred_c=0, pred_c=1)'}<span className="cd-rfc-dim">{'   ← widens ID/OOD reconstruction gap'}</span></div>
               <div className="cd-rfc-dim">{'λ = 0.02  →  99.03% AUROC  '}<span className="cd-rfc-green">{'(↑ from 80.3% baseline, +18.8pp)'}</span></div>
             </div>
           </div>

           {/* Baselines comparison */}
           <div className="cd-rf-baselines">
             <div className="cd-rfc-label">vs published one-class baselines · CIFAR-10 airplane (one-vs-rest)</div>
             <div className="cd-baselines-scroll">
               <table className="cd-baselines-table">
                 <thead>
                   <tr>
                     <th>Method</th>
                     <th>Type</th>
                     <th>AUROC</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr><td>OC-SVM</td><td>One-class</td><td>63.0%</td></tr>
                   <tr><td>Deep SVDD</td><td>One-class</td><td>61.7%</td></tr>
                   <tr><td>DROCC</td><td>One-class</td><td>81.7%</td></tr>
                   <tr><td>CSI</td><td>Contrastive</td><td>89.8%</td></tr>
                   <tr><td>PANDA</td><td>Pretrained + OC</td><td>95.4%</td></tr>
                   <tr><td>Mean-Shifted CL</td><td>Contrastive</td><td>97.5%</td></tr>
                   <tr className="cd-bt-ours">
                     <td>Binary CDM (ours, λ=0.02)</td>
                     <td>Generative</td>
                     <td>99.03% <span className="cd-bt-new">new</span></td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>

           <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
             <a href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">View Full Thesis ↗</a>
             <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>Code: DiffusionOOD ↗</a>
             <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>Code: InkjetOOD ↗</a>
             <a href="https://huggingface.co/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>HF: CIFAR-10 Weights ↗</a>
             <a href="https://huggingface.co/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>HF: Inkjet Weights ↗</a>
             <a href="https://github.com/ahmed-3m/thesis-diffusion-ood-latex" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.7 }}>LaTeX Source ↗</a>
             <a href="https://wandb.ai/ahmed-mu-0593" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.7 }}>W&amp;B Runs (CIFAR-10) ↗</a>
           </div>
          </div>

         <div className="cd-research-featured reveal">
           <div className="cd-rf-header">
             <div className="cd-rf-left">
               <div className="cd-rf-label">Industrial Technical Report · PROFACTOR GmbH · 2024</div>
               <div className="cd-rf-title">
                 Diffusion-Based Multi-class Defect Detection: A Generative Approach to Industrial QC
               </div>
               <div className="cd-rf-desc">
                 Production-oriented industrial quality control pipeline combining YOLO-based feature extraction
                 with diffusion modeling for robust multi-class defect detection on inkjet-printed building components.
                 Includes cross-domain and per-feature evaluation protocols used in real manufacturing settings.
               </div>
               <div className="cd-rf-meta">
                 PROFACTOR GmbH · Zer0P context · Proprietary industrial dataset
               </div>
             </div>
             <div className="cd-rf-metric">
               <div className="cd-rf-metric-num">98.4<span className="cd-rf-metric-unit">%</span></div>
               <div className="cd-rf-metric-label">Defect Detection</div>
               <div className="cd-rf-metric-delta">Real-time production setting</div>
             </div>
           </div>

           <div className="cd-rf-charts" style={{ gridTemplateColumns: '1fr' }}>
             <div
               className="cd-rf-chart cd-rf-chart--zoom"
               onClick={() => setLightbox(-1)}
               title="Click to expand"
             >
               <img
                 src="/ood-industrial-roc.png"
                 alt="Industrial ROC Curves"
                 style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }}
               />
               <div className="cd-rf-chart-caption">ROC curves — inkjet CDM vs baseline, 5-fold CV</div>
             </div>
           </div>

           <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
             <a href="https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">View Industrial Report ↗</a>
             <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>Code: InkjetOOD ↗</a>
             <a href="https://huggingface.co/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.8 }}>HF: Model Weights ↗</a>
             <a href="https://github.com/ahmed-3m/zer0p_notebooks" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ opacity: 0.7 }}>R&amp;D Notebooks ↗</a>
           </div>
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

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="cd-lightbox" onClick={() => setLightbox(null)}>
          <div className="cd-lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="cd-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            {lightbox === -1 ? (
              <>
                <img src="/ood-industrial-roc.png" alt="Industrial ROC Curves" />
                <div className="cd-lightbox-caption">ROC curves — inkjet CDM vs baseline, 5-fold CV</div>
              </>
            ) : (
              <>
                <img
                  src={charts[lightbox].src}
                  alt={charts[lightbox].alt}
                  style={charts[lightbox].lightBg ? { filter: 'invert(1) hue-rotate(180deg)' } : {}}
                />
                <div className="cd-lightbox-caption">{charts[lightbox].caption}</div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
