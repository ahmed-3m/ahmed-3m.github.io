import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import {
  PersonSchema,
  WebsiteSchema,
  OrganizationSchema,
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

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmed-3m.github.io'),
  title: {
    default: 'Ahmed Mohammed | AI/ML Engineer & Entrepreneur',
    template: '%s | Ahmed Mohammed'
  },
  description: "AI/ML Engineer in Linz, Austria. 99.03% +/- 0.07% AUROC thesis result, 0.8673 +/- 0.0230 industrial baseline, founder of Faultrix, and public proof artifacts across thesis, reports, repositories, and case studies.",
  keywords: ["AI Engineer", "Machine Learning Engineer", "Computer Vision", "Deep Learning", "PyTorch", "YOLO", "Diffusion Models", "Anomaly Detection", "Ahmed Mohammed", "Faultrix", "AI Entrepreneur", "Linz Austria", "JKU", "OOD Detection", "Industrial Quality Control", "Construction AI", "DiffusionOOD", "InkjetOOD", "Case Study", "Research Portfolio"],
  authors: [{ name: "Ahmed Mohammed", url: 'https://ahmed-3m.github.io' }],
  creator: 'Ahmed Mohammed',
  publisher: 'Ahmed Mohammed',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer & Entrepreneur",
    description: "AI/ML Engineer in Linz, Austria. Thesis, industrial evaluation, Faultrix product work, and public proof artifacts including PDFs, repositories, and case studies.",
    url: 'https://ahmed-3m.github.io/',
    siteName: 'Ahmed Mohammed Portfolio',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ahmed Mohammed - AI/ML Engineer & Entrepreneur' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Mohammed | AI/ML Engineer',
    description: 'AI/ML engineer with public thesis artifacts, industrial AI evaluation, and product case studies.',
    images: ['/og-image.png'],
    creator: '@Ahmed_mo_93',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#08090d" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="alternate" type="application/rss+xml" title="Ahmed Mohammed Blog" href="/feed.xml" />
        <PersonSchema />
        <WebsiteSchema />
        <OrganizationSchema />
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
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Ahmed Mohammed — AI/ML Engineer &amp; Entrepreneur</h1>
            <p>Based in Linz, Austria. Specializing in computer vision, anomaly detection, and diffusion models. Founder of <a href="https://faultrix.com">Faultrix</a>.</p>
            <h2>Contact</h2>
            <p>Email: <a href="mailto:ahmed@faultrix.com">ahmed@faultrix.com</a> | <a href="https://www.linkedin.com/in/ahmed-3m/">LinkedIn</a> | <a href="https://github.com/ahmed-3m">GitHub</a></p>
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
