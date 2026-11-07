'use client';

import { useEffect } from 'react';

let sharedObserver: IntersectionObserver | null = null;
let activeCount = 0;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            sharedObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
  }
  return sharedObserver;
}

export function useReveal() {
  useEffect(() => {
    const observer = getSharedObserver();
    if (!observer) return;

    activeCount++;
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      activeCount--;
      if (activeCount <= 0) {
        sharedObserver?.disconnect();
        sharedObserver = null;
        activeCount = 0;
      }
    };
  }, []);
}
