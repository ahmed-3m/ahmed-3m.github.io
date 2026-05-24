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

const cifarCharts = [
  { src: '/fig_lambda_sweep.png', alt: 'Separation Loss Weight Sweep', caption: 'Separation weight λ sweep — performance peaks at λ=0.02 with stable convergence' },
  { src: '/fig_calibration.png', alt: 'Operating Threshold Calibration', caption: 'Score distributions under airplane-vs-rest split at calibrated 95% TPR operating threshold' },
  { src: '/fig_per_timestep_error.png', alt: 'Per-Timestep Reconstruction Error', caption: 'Mean reconstruction error vs. timestep t (OOD-discriminative gap peaks at intermediate noise)' },
]

const industrialCharts = [
  { src: '/fig_cross_domain_comparison.png', alt: 'Cross-Domain Impact of Separation Loss', caption: 'Separation loss cross-domain impact: CIFAR-10 (+6.51pp gain) vs. Inkjet QC (within CV variance)' },
  { src: '/fig_inkjet_lambda.png', alt: 'Per-Feature AUROC Sweep', caption: 'Per-feature AUROC across separation weights under rigorous 5-fold cross-validation' },
]

export default function Research() {
  useReveal()
  const [lightbox, setLightbox] = useState<{ type: 'cifar' | 'industrial', index: number } | null>(null)

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
              <div className="cd-rf-label">Master&apos;s Thesis (Track 1) · JKU Linz · 2026</div>
              <div className="cd-rf-title" itemProp="name">
                Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection
              </div>
              <div className="cd-rf-desc" itemProp="description">
                Pioneered a generative classification approach treating class-conditional reconstruction error as the OOD signal in diffusion models. Introduced an innovative <strong>class-conditional separation loss</strong> that pushes conditional noise predictions apart. This breakthrough achieves an outstanding average of <strong>99.03% &plusmn; 0.07% AUROC</strong> over three independent seeds, stabilizing performance and delivering a <strong>+6.51pp gain</strong> with far lower variance over the non-separated baseline (92.52% &plusmn; 11.07%). Validated with seed-42 achieving 98.98% AUROC within-CIFAR and 90.50%&ndash;96.97% zero-shot generalization across five external OOD benchmarks (CIFAR-100, Places365, FashionMNIST, Textures, SVHN).
              </div>
              <div className="cd-rf-meta">
                Supervisor: <span itemProp="contributor" itemScope itemType="https://schema.org/Person"><span itemProp="name">Prof. Sepp Hochreiter</span></span> (LSTM Inventor)
                {' · '}Assistant: <span itemProp="contributor" itemScope itemType="https://schema.org/Person"><span itemProp="name">Claus Hofmann, MSc</span></span>
                {' · '}<span itemProp="publisher" itemScope itemType="https://schema.org/CollegeOrUniversity"><span itemProp="name">JKU Linz</span></span>
                {' · '}<span itemProp="datePublished">2026</span>
              </div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">99.03<span className="cd-rf-metric-unit">%</span></div>
              <div className="cd-rf-metric-label">AUROC · CIFAR-10 Average</div>
              <div className="cd-rf-metric-delta">&plusmn;0.07% variance (3 seeds)</div>
            </div>
          </div>

          <div className="cd-rf-charts">
            {cifarCharts.map(({ src, alt, caption }, i) => (
              <div
                key={src}
                className="cd-rf-chart cd-rf-chart--zoom"
                onClick={() => setLightbox({ type: 'cifar', index: i })}
                title="Click to expand"
              >
                <img
                  src={src}
                  alt={alt}
                  style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div className="cd-rf-chart-caption">{caption}</div>
              </div>
            ))}
          </div>

          <div className="cd-rf-formula-box">
            <div className="cd-rfc-simple-label">Novel contribution &middot; separation loss</div>
            <div className="cd-rfc-summary">
              <strong>Plain idea:</strong> train the model to make its two explanations visibly different. If an image looks
              normal, the normal explanation should reconstruct it better. If it looks unusual, the other explanation
              should win. That gap becomes the anomaly signal.
            </div>
            <div className="cd-rfc-flow" aria-label="Separation loss workflow">
              <div>
                <img src="/research/separation-denoise-clean.png" alt="Noisy image becoming clean through denoising" className="cd-rfc-visual" />
                <span className="cd-rfc-step">1</span>
                <strong>Learn to denoise</strong>
                <span>Reconstruct images under each class condition.</span>
              </div>
              <div>
                <img src="/research/separation-apart-clean.png" alt="Two model explanations being pushed apart" className="cd-rfc-visual" />
                <span className="cd-rfc-step">2</span>
                <strong>Push explanations apart</strong>
                <span>Increase the distance between the two conditional predictions.</span>
              </div>
              <div>
                <img src="/research/separation-gap-clean.png" alt="Difference between reconstruction errors becoming an OOD signal" className="cd-rfc-visual" />
                <span className="cd-rfc-step">3</span>
                <strong>Score the gap</strong>
                <span>Use the reconstruction-error difference as the OOD signal.</span>
              </div>
            </div>
            <div className="cd-rfc-compact-formula">
              <span>Total loss</span>
              <strong>=</strong>
              <span>denoising loss</span>
              <strong>+</strong>
              <span>lambda * separation loss</span>
            </div>
            <div className="cd-rfc-result">
              Latest thesis result: lambda = 0.02 reached 99.03% &plusmn; 0.07% AUROC, a +6.51pp gain over no separation loss.
            </div>
          </div>

          <div className="cd-rf-footer">
            <a
              href="https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="cd-proj-link"
            >
              View Full Thesis (PDF) ↗
            </a>
          </div>
        </div>

        <div className="cd-research-featured reveal">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">Master&apos;s Thesis (Track 2) · JKU Linz · 2026</div>
              <div className="cd-rf-title">
                Rigorous Cross-Domain Transfer &amp; FTI_Zer0P Benchmark
              </div>
              <div className="cd-rf-desc">
                Evaluated the public <strong>YOLO+CDM print quality classification pipeline</strong> (released in the <code>InkjetOOD</code> codebase) on the public <strong>FTI_Zer0P</strong> inkjet dataset under strict 5-fold cross-validation. Established that the crop-based CDM reaches a robust <strong>0.8673 &plusmn; 0.0230 AUROC</strong> at baseline. Critically analyzed the boundary conditions of the separation loss on small, fine-grained manufacturing data, demonstrating that the separation benefit does not automatically transfer to localized textures.
              </div>
              <div className="cd-rf-meta">
                Public Benchmark · InkjetOOD Codebase · FTI_Zer0P Public Dataset
              </div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num">0.8673</div>
              <div className="cd-rf-metric-label">AUROC · 5-Fold CV Baseline</div>
              <div className="cd-rf-metric-delta">Rigorous Public Evaluation</div>
            </div>
          </div>

          <div className="cd-rf-charts" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {industrialCharts.map(({ src, alt, caption }, i) => (
              <div
                key={src}
                className="cd-rf-chart cd-rf-chart--zoom"
                onClick={() => setLightbox({ type: 'industrial', index: i })}
                title="Click to expand"
              >
                <img
                  src={src}
                  alt={alt}
                  style={{ width: '100%', height: '260px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div className="cd-rf-chart-caption">{caption}</div>
              </div>
            ))}
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

      {lightbox !== null && (
        <div className="cd-lightbox" onClick={() => setLightbox(null)}>
          <div className="cd-lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="cd-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            {lightbox.type === 'industrial' ? (
              <>
                <img src={industrialCharts[lightbox.index].src} alt={industrialCharts[lightbox.index].alt} />
                <div className="cd-lightbox-caption">{industrialCharts[lightbox.index].caption}</div>
              </>
            ) : (
              <>
                <img src={cifarCharts[lightbox.index].src} alt={cifarCharts[lightbox.index].alt} />
                <div className="cd-lightbox-caption">{cifarCharts[lightbox.index].caption}</div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
