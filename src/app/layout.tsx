import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { I18nProvider } from "@/lib/i18n";
import {
  PersonSchema,
  WebsiteSchema,
  OrganizationSchema,
  FAQSchema,
  SocialProfileSchema,
  ProjectsSchema,
  ResearchSchema
} from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmed-3m.github.io'),
  title: {
    default: 'Ahmed Mohammed | AI/ML Engineer & Entrepreneur',
    template: '%s | Ahmed Mohammed'
  },
  description: "Ahmed Mohammed — AI/ML Engineer & Entrepreneur based in Linz, Austria. Specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. 98.4% accuracy in industrial defect detection. M.Sc. AI from JKU Linz.",
  keywords: ["AI Engineer", "Machine Learning Engineer", "Computer Vision", "Deep Learning", "PyTorch", "YOLO", "Diffusion Models", "Anomaly Detection", "Ahmed Mohammed", "Faultrix", "AI Entrepreneur", "Linz Austria", "JKU", "OOD Detection", "Industrial Quality Control", "Construction AI"],
  authors: [{ name: "Ahmed Mohammed", url: 'https://ahmed-3m.github.io' }],
  creator: 'Ahmed Mohammed',
  publisher: 'Ahmed Mohammed',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer & Entrepreneur",
    description: "AI/ML Engineer & Entrepreneur based in Linz, Austria. Specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. M.Sc. AI from JKU Linz.",
    url: 'https://ahmed-3m.github.io/',
    siteName: 'Ahmed Mohammed Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ahmed Mohammed - AI/ML Engineer & Entrepreneur'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Mohammed | AI/ML Engineer',
    description: 'AI/ML Engineer & Entrepreneur specializing in computer vision and deep learning',
    images: ['/og-image.png'],
    creator: '@Ahmed_mo_93',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ahmed-3m.github.io/',
  },
  verification: {
    google: 'google939eb896825506d2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch (e) {}
          })();
        `}} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <PersonSchema />
        <WebsiteSchema />
        <OrganizationSchema />
        <FAQSchema />
        <SocialProfileSchema />
        <ProjectsSchema />
        <ResearchSchema />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            <h1>Ahmed Mohammed — AI/ML Engineer &amp; Entrepreneur</h1>
            <p>Based in Linz, Austria. Specializing in computer vision, anomaly detection, and diffusion models. Founder of <a href="https://faultrix.com">Faultrix</a>.</p>
            <h2>About</h2>
            <p>M.Sc. Artificial Intelligence from Johannes Kepler University Linz (JKU). Achieved 98.4% accuracy in industrial defect detection at PROFACTOR GmbH. Research focus on conditional diffusion models for out-of-distribution detection.</p>
            <h2>Projects</h2>
            <ul>
              <li><strong>Faultrix</strong> — AI-powered construction quality control SaaS. ÖNORM-compliant reports in under 1 minute. <a href="https://faultrix.com">faultrix.com</a></li>
              <li><strong>Industrial Anomaly Detection</strong> — YOLO + diffusion models pipeline. 98.4% accuracy. <a href="https://github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking">GitHub</a></li>
              <li><strong>OOD Detection Framework</strong> — Conditional diffusion models as generative classifiers. <a href="https://github.com/ahmed-3m/OOD-diffusion-detector">GitHub</a></li>
              <li><strong>EEG Signal Classification</strong> — Deep RNN architectures for brain-computer interfaces. <a href="https://github.com/ahmed-3m/Motor-Imagery-classification">GitHub</a></li>
            </ul>
            <h2>Experience</h2>
            <ul>
              <li>Founder &amp; Full-Stack Developer — Faultrix (2025–Present)</li>
              <li>ML Researcher — JKU Machine Learning Institute (Dec 2024–Mar 2026)</li>
              <li>Machine Vision Researcher — PROFACTOR GmbH (Mar 2024–Nov 2024)</li>
            </ul>
            <h2>Contact</h2>
            <p>Email: <a href="mailto:ahmed.mo.0595@gmail.com">ahmed.mo.0595@gmail.com</a> | <a href="https://www.linkedin.com/in/ahmed-3m/">LinkedIn</a> | <a href="https://github.com/ahmed-3m">GitHub</a></p>
          </div>
        </noscript>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
