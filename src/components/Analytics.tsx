'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { GOATCOUNTER_ENDPOINT, GOATCOUNTER_SCRIPT_SRC, outboundEventName, trackEvent } from '@/lib/analytics';

type GoatCounterWindow = Window & {
  goatcounter?: { count?: (vars: { path: string }) => void };
};

/**
 * Counts one visit per page with GoatCounter. count.js runs with `no_onload`, so it
 * counts nothing by itself: this component counts the first page once the script
 * loads, then each client-side route change, which a plain page-load counter would miss.
 * It also counts clicks on the CV, the thesis PDF and the profile and booking links
 * (see outboundEventName), wherever they are on the page, Genie's answers included.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastCounted = useRef<string | null>(null);

  const countCurrentPage = useCallback(() => {
    const count = (window as GoatCounterWindow).goatcounter?.count;
    const path = window.location.pathname;
    if (typeof count !== 'function' || lastCounted.current === path) return;
    lastCounted.current = path;
    count({ path });
  }, []);

  useEffect(() => {
    if (GOATCOUNTER_ENDPOINT) countCurrentPage();
  }, [pathname, countCurrentPage]);

  // One listener for every link, so links rendered later (such as in Genie) count too.
  // `auxclick` covers a middle click that opens the link in a new tab.
  useEffect(() => {
    if (!GOATCOUNTER_ENDPOINT) return;
    function handleClick(event: MouseEvent) {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const name = outboundEventName(anchor.href);
      if (name) trackEvent(name);
    }
    document.addEventListener('click', handleClick, true);
    document.addEventListener('auxclick', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('auxclick', handleClick, true);
    };
  }, []);

  if (!GOATCOUNTER_ENDPOINT) return null;

  return (
    <Script
      id="goatcounter"
      src={GOATCOUNTER_SCRIPT_SRC}
      strategy="afterInteractive"
      data-goatcounter={GOATCOUNTER_ENDPOINT}
      data-goatcounter-settings='{"no_onload":true}'
      onLoad={countCurrentPage}
    />
  );
}
