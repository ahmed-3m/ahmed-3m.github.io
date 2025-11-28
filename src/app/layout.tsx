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
  SocialProfileSchema
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
  description: "AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and generative models. Expert in YOLO, PyTorch, and diffusion models with 98.4% accuracy in defect detection.",
  keywords: ["AI Engineer", "Machine Learning", "Computer Vision", "Deep Learning", "PyTorch", "YOLO", "Diffusion Models", "Anomaly Detection", "Ahmed Mohammed", "Faultrix", "AI Entrepreneur"],
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
    description: "AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and generative models. Founder of Faultrix.",
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
    languages: {
      'en': 'https://ahmed-3m.github.io',
      'de': 'https://ahmed-3m.github.io?lang=de',
    },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <PersonSchema />
        <WebsiteSchema />
        <OrganizationSchema />
        <FAQSchema />
        <SocialProfileSchema />
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
