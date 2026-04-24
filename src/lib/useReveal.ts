'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const revealElements = el.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    });

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [handleIntersection]);

  return ref;
}
