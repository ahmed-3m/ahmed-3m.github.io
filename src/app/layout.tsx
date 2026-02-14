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
    url: 'https://ahmed-3m.github.io',
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
    canonical: 'https://ahmed-3m.github.io',
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
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <PersonSchema />
        <WebsiteSchema />
        <OrganizationSchema />
        <FAQSchema />
        <SocialProfileSchema />
        <ProjectsSchema />
        <ResearchSchema />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
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
