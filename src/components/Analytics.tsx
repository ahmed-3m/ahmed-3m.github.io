'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const GA_CONFIG = {
  cookie_flags: 'SameSite=Strict',
  enable_display_features: false,
  anonymize_ip: true,
  allow_google_signals: false,
  cookie_domain: 'none',
  storage: 'none',
} as const;

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function Analytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = pathname;
      return;
    }
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const win = window as GtagWindow;
    if (typeof win.gtag === 'function') {
      win.gtag('config', GA_MEASUREMENT_ID, {
        ...GA_CONFIG,
        page_path: pathname,
      });
    }
  }, [pathname]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, Object.assign({ page_path: window.location.pathname }, ${JSON.stringify(GA_CONFIG)}));
        `}
      </Script>
    </>
  );
}
