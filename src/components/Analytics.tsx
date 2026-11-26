'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { GOATCOUNTER_ENDPOINT, GOATCOUNTER_SCRIPT_SRC } from '@/lib/analytics';

type GoatCounterWindow = Window & {
  goatcounter?: { count?: (vars: { path: string }) => void };
};

/**
 * Counts one visit per page with GoatCounter. count.js runs with `no_onload`, so it
 * counts nothing by itself: this component counts the first page once the script
 * loads, then each client-side route change, which a plain page-load counter would miss.
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
