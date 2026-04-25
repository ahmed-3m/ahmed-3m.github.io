'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Touch / stylus devices — keep native cursor
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot  = dotRef.current!
    const ring = ringRef.current!

    let mx = -200, my = -200   // mouse (starts off-screen)
    let rx = -200, ry = -200   // ring (lerped)
    let raf: number
    let entered = false

    /* ── Reveal on first move ── */
    const reveal = () => {
      if (entered) return
      entered = true
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
    }

    /* ── State helpers ── */
    const setHover   = (on: boolean) => {
      ring.classList.toggle('cd-cursor-ring--hover', on)
      dot.classList.toggle('cd-cursor-dot--hover',  on)
    }
    const setExpand  = (on: boolean) => ring.classList.toggle('cd-cursor-ring--expand', on)
    const setClick   = (on: boolean) => ring.classList.toggle('cd-cursor-ring--click',  on)

    /* ── Per-move: check what's under the cursor ── */
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      reveal()

      const el = e.target as Element | null
      const hover  = !!(el?.closest('a, button, [role="button"], input, select, textarea, label, [tabindex="0"]'))
      const expand = !hover && !!(el?.closest('.cd-rf-chart--zoom'))
      setHover(hover)
      setExpand(expand)
    }

    const onDown = () => setClick(true)
    const onUp   = () => setClick(false)

    /* ── Hide when leaving window ── */
    const onLeave = () => { dot.style.opacity = '0'; ring.style.opacity = '0'; entered = false }
    const onEnter = () => { /* opacity set by first onMove */ }

    /* ── rAF loop: lerp ring position ── */
    const tick = () => {
      dot.style.transform  = `translate(${mx}px,${my}px)`
      rx += (mx - rx) * 0.11
      ry += (my - ry) * 0.11
      ring.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mouseup',    onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cd-cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cd-cursor-ring" aria-hidden="true" />
    </>
  )
}
