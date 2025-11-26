'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-N9WZD1WLDZ';

export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('set', {'analytics_storage': 'denied'});
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=Strict',
            enable_display_features: false,
            anonymize_ip: true,
            allow_google_signals: false,
            cookie_domain: 'none',
            storage: 'none'
          });
        `}
      </Script>
    </>
  );
}
