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
    let isHover = false
    let isExpanded = false

    /* ── Reveal on first move ── */
    const reveal = () => {
      if (entered) return
      entered = true
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
    }

    /* ── State helpers ── */
    const setHover   = (on: boolean) => {
      if (on === isHover) return
      isHover = on
      ring.classList.toggle('cd-cursor-ring--hover', on)
      dot.classList.toggle('cd-cursor-dot--hover',  on)
    }
    const setExpand  = (on: boolean) => {
      if (on === isExpanded) return
      isExpanded = on
      ring.classList.toggle('cd-cursor-ring--expand', on)
    }
    const setClick   = (on: boolean) => ring.classList.toggle('cd-cursor-ring--click',  on)

    /* ── Per-move: check what's under the cursor ── */
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`
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
      rx += (mx - rx) * 0.32
      ry += (my - ry) * 0.32
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('mousemove',  onMove, { passive: true })
    window.addEventListener('mousedown',  onDown, { passive: true })
    window.addEventListener('mouseup',    onUp, { passive: true })
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
