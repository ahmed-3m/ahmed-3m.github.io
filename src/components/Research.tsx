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
  {
    title: 'Diffusion-Based Multi-class Defect Detection: A Generative Approach to Industrial QC',
    venue: 'Technical Report · PROFACTOR GmbH · JKU Linz · 2024',
    href: 'https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf',
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

         <div className="cd-research-featured reveal">
           <div className="cd-rf-header">
             <div className="cd-rf-left">
               <div className="cd-rf-label">Master&apos;s Thesis · JKU Linz · 2026</div>
               <div className="cd-rf-title">
                 Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection
               </div>
               <div className="cd-rf-desc">
                 Novel approach using conditional diffusion models as generative classifiers for robust
                 out-of-distribution detection. Introduced class-conditional separation loss improving
                 AUROC by 18.8 percentage points. Applied to industrial quality control with multi-head conditioning.
               </div>
               <div className="cd-rf-meta">
                 Supervisor: Prof. Sepp Hochreiter · Assistant: Claus Hofmann · JKU Linz · 2026
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

           <div className="cd-rf-footer">
             <a
               href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf"
               target="_blank"
               rel="noopener noreferrer"
               className="cd-proj-link"
             >
               View Full Thesis ↗
             </a>
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
             <div className="cd-rf-chart">
               <img
                 src="/ood-industrial-roc.png"
                 alt="Industrial ROC Curves"
                 style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }}
               />
               <div className="cd-rf-chart-caption">Industrial ROC curves - inkjet dataset</div>
             </div>
           </div>

           <div className="cd-rf-footer">
             <a
               href="https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf"
               target="_blank"
               rel="noopener noreferrer"
               className="cd-proj-link"
             >
               View Industrial Report ↗
             </a>
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
            <img
              src={charts[lightbox].src}
              alt={charts[lightbox].alt}
              style={charts[lightbox].lightBg ? { filter: 'invert(1) hue-rotate(180deg)' } : {}}
            />
            <div className="cd-lightbox-caption">{charts[lightbox].caption}</div>
          </div>
        </div>
      )}
    </section>
  )
}
