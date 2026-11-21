import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./portfolio.css";
import { I18nProvider } from "@/lib/i18n";
import {
  PersonSchema,
  WebsiteSchema,
} from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import SkipLink from "@/components/SkipLink";
import ChatBot from "@/components/ChatBot";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ogImage } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Next injects a default viewport meta; declaring it here as well produced a
// duplicate <meta name="viewport"> in the exported HTML. The Viewport export
// is the single source — maximumScale 5 keeps pinch-zoom available.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmed-3m.github.io'),
  title: {
    default: 'Ahmed Mohammed | AI/ML Engineer',
    template: '%s | Ahmed Mohammed'
  },
  description: "AI/ML Engineer in Linz, Austria (M.Sc. AI, JKU Linz, thesis graded 1). Specializing in computer vision, industrial ML, and diffusion-based OOD detection: 99.03% +/- 0.07% AUROC (within-CIFAR airplane-vs-rest binary split, 3-seed mean) and 0.8673 +/- 0.0230 AUROC on FTI_Zer0P (5-fold CV), plus Sihem and mergeproof.",
  keywords: ["AI Engineer", "Machine Learning Engineer", "Computer Vision", "Deep Learning", "PyTorch", "YOLO", "Diffusion Models", "Anomaly Detection", "Ahmed Mohammed", "Sihem", "LLM applications", "mergeproof", "AI Agent Tooling", "Linz Austria", "JKU", "OOD Detection", "Industrial Quality Control", "DiffusionOOD", "InkjetOOD", "Case Study", "Research Portfolio"],
  authors: [{ name: "Ahmed Mohammed", url: 'https://ahmed-3m.github.io' }],
  creator: 'Ahmed Mohammed',
  publisher: 'Ahmed Mohammed',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer",
    description: "AI/ML Engineer in Linz, Austria. Computer vision, industrial ML, diffusion-based OOD detection (thesis graded 1), LLM systems (Sihem), and deterministic agent tooling (mergeproof).",
    url: 'https://ahmed-3m.github.io/',
    siteName: 'Ahmed Mohammed Portfolio',
    images: ogImage('Ahmed Mohammed - AI/ML Engineer'),
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Mohammed | AI/ML Engineer',
    description: 'AI/ML engineer with public thesis artifacts, industrial AI evaluation, LLM products, agent tooling (mergeproof), and product case studies.',
    images: ['/og-image.png'],
    // TODO(owner): re-enable with new X account
    // creator: '@Ahmed_mo_93',
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: { google: 'google939eb896825506d2' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});` }} />
        )}
        {/* Pre-paint theme restore. Must stay inline and blocking so returning
            visitors never flash the default dark theme. Keep the attribute
            names and fallbacks in sync with src/lib/ThemeContext.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var resolved=(t==='light'||t==='dark')?t:((window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark');document.documentElement.setAttribute('data-theme',resolved);document.documentElement.style.colorScheme=resolved;var r=localStorage.getItem('reduceTransparency');if(r==='true'||r==='false'){document.documentElement.setAttribute('data-reduce-transparency',r);}else if(window.matchMedia&&window.matchMedia('(prefers-reduced-transparency: reduce)').matches){document.documentElement.setAttribute('data-reduce-transparency','true');}}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#08090d" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3eadc" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="alternate" type="application/rss+xml" title="Ahmed Mohammed Blog" href="/feed.xml" />
        <PersonSchema />
        <WebsiteSchema />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; animation: none !important; }`}</style>
        </noscript>
        <ThemeProvider>
          <I18nProvider>
            <SkipLink />
            {children}
            <ChatBot />
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
