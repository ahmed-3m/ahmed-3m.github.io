import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import {
  PersonSchema,
  WebsiteSchema,
  FAQSchema,
  SocialProfileSchema,
  ProjectsSchema,
  ResearchSchema,
  WebPageSchema
} from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import CustomCursor from "@/components/CustomCursor";
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
  description: "AI/ML Engineer in Linz, Austria. 99.03% +/- 0.07% AUROC thesis result (within-CIFAR airplane-vs-rest binary split), 0.8673 +/- 0.0230 industrial baseline, builder of Sihem (LLM assistant) and Faultrix (AI QC), and public proof artifacts across thesis, reports, repositories, and case studies.",
  keywords: ["AI Engineer", "Machine Learning Engineer", "Computer Vision", "Deep Learning", "PyTorch", "YOLO", "Diffusion Models", "Anomaly Detection", "Ahmed Mohammed", "Faultrix", "Sihem", "LLM applications", "Linz Austria", "JKU", "OOD Detection", "Industrial Quality Control", "Construction AI", "DiffusionOOD", "InkjetOOD", "Case Study", "Research Portfolio"],
  authors: [{ name: "Ahmed Mohammed", url: 'https://ahmed-3m.github.io' }],
  creator: 'Ahmed Mohammed',
  publisher: 'Ahmed Mohammed',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer",
    description: "AI/ML Engineer in Linz, Austria. Thesis, industrial evaluation, Faultrix product work, and public proof artifacts including PDFs, repositories, and case studies.",
    url: 'https://ahmed-3m.github.io/',
    siteName: 'Ahmed Mohammed Portfolio',
    images: ogImage('Ahmed Mohammed - AI/ML Engineer'),
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Mohammed | AI/ML Engineer',
    description: 'AI/ML engineer with public thesis artifacts, industrial AI evaluation, and product case studies.',
    images: ['/og-image.png'],
    // TODO(owner): re-enable with new X account
    // creator: '@Ahmed_mo_93',
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://ahmed-3m.github.io/' },
  verification: { google: 'google939eb896825506d2' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Pre-paint theme restore. Must stay inline and blocking so returning
            visitors never flash the default dark theme. Keep the attribute
            names and fallbacks in sync with src/lib/ThemeContext.tsx. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var r=localStorage.getItem('reduceTransparency');if(r==='true'||r==='false'){document.documentElement.setAttribute('data-reduce-transparency',r);}else if(window.matchMedia&&window.matchMedia('(prefers-reduced-transparency: reduce)').matches){document.documentElement.setAttribute('data-reduce-transparency','true');}}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#08090d" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="alternate" type="application/rss+xml" title="Ahmed Mohammed Blog" href="/feed.xml" />
        <PersonSchema />
        <WebsiteSchema />
        <FAQSchema />
        <SocialProfileSchema />
        <ProjectsSchema />
        <ResearchSchema />
        <WebPageSchema />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <a href="#about" className="cd-skip-link">
          Skip to content
        </a>
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Ahmed Mohammed — AI/ML Engineer</h1>
            <p>Based in Linz, Austria. Specializing in computer vision, anomaly detection, and diffusion models. Builder of <a href="https://sihem-pwa.pages.dev/">Sihem</a> and <a href="https://faultrix.com">Faultrix</a>.</p>
            <h2>Contact</h2>
            <p>Email: <a href="mailto:ahmed.mo.0595@gmail.com">ahmed.mo.0595@gmail.com</a> | <a href="https://www.linkedin.com/in/ahmed-3m/">LinkedIn</a> | <a href="https://github.com/ahmed-3m">GitHub</a></p>
          </div>
        </noscript>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <ChatBot />
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
        <CustomCursor />
      </body>
    </html>
  );
}
