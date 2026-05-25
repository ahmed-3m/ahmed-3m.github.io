'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hasHoverPointer =
      window.matchMedia('(any-pointer: fine)').matches ||
      window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(any-hover: hover)').matches ||
      window.matchMedia('(hover: hover)').matches
    const looksDesktopLike = window.innerWidth >= 768 && navigator.maxTouchPoints < 2
    const supportsCustomCursor = hasHoverPointer || looksDesktopLike

    if (!supportsCustomCursor) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.dataset.customCursor = 'true'

    let mx = -200
    let my = -200
    let rx = -200
    let ry = -200
    let raf = 0
    let entered = false
    let isHover = false
    let isExpanded = false

    const reveal = () => {
      if (entered) return
      entered = true
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    const setHover = (on: boolean) => {
      if (on === isHover) return
      isHover = on
      ring.classList.toggle('cd-cursor-ring--hover', on)
      dot.classList.toggle('cd-cursor-dot--hover', on)
    }

    const setExpand = (on: boolean) => {
      if (on === isExpanded) return
      isExpanded = on
      ring.classList.toggle('cd-cursor-ring--expand', on)
    }

    const setClick = (on: boolean) => {
      ring.classList.toggle('cd-cursor-ring--click', on)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      mx = event.clientX
      my = event.clientY
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      reveal()

      const element = event.target as Element | null
      const hover = Boolean(
        element?.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]')
      )
      const expand = !hover && Boolean(element?.closest('.cd-rf-chart--zoom'))
      setHover(hover)
      setExpand(expand)
    }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      setClick(true)
    }

    const onUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      setClick(false)
    }

    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      entered = false
    }

    const tick = () => {
      rx += (mx - rx) * 0.52
      ry += (my - ry) * 0.52
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      delete document.documentElement.dataset.customCursor
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cd-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cd-cursor-ring" aria-hidden="true" />
    </>
  )
}
