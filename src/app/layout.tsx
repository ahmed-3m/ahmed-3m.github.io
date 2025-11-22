import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { I18nProvider } from "@/lib/i18n";
import { PersonSchema, WebsiteSchema, OrganizationSchema } from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ahmed-3m.github.io'),
  title: {
    default: 'Ahmed Mohammed | AI/ML Engineer & Entrepreneur',
    template: '%s | Ahmed Mohammed',
  },
  description: 'AI/ML Engineer and Entrepreneur specializing in computer vision, anomaly detection, and generative models. Founder of Faultrix. 98.4% accuracy in industrial defect detection.',
  keywords: [
    'AI Engineer', 'ML Engineer', 'Machine Learning Engineer', 'Deep Learning',
    'Computer Vision', 'Anomaly Detection', 'Ahmed Mohammed', 'Faultrix',
    'PyTorch', 'TensorFlow', 'YOLO', 'Diffusion Models', 'OOD Detection',
    'KI-Ingenieur', 'Machine Learning Entwickler'
  ],
  authors: [{ name: 'Ahmed Mohammed', url: 'https://ahmed-3m.github.io' }],
  creator: 'Ahmed Mohammed',
  publisher: 'Ahmed Mohammed',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'de_DE',
    url: 'https://ahmed-3m.github.io',
    siteName: 'Ahmed Mohammed Portfolio',
    title: 'Ahmed Mohammed | AI/ML Engineer & Entrepreneur',
    description: 'AI/ML Engineer and Entrepreneur specializing in computer vision, anomaly detection, and generative models. Founder of Faultrix.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ahmed Mohammed - AI/ML Engineer & Entrepreneur',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Mohammed | AI/ML Engineer & Entrepreneur',
    description: 'AI/ML Engineer specializing in computer vision and deep learning. Founder of Faultrix.',
    images: ['/og-image.png'],
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
      'de': 'https://ahmed-3m.github.io',
    },
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
        <PersonSchema />
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
