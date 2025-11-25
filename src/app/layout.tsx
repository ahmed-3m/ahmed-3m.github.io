import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ahmed Mohammed | AI/ML Engineer",
  description: "AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and generative models.",
  keywords: ["AI", "ML", "Machine Learning", "Computer Vision", "Deep Learning", "Ahmed Mohammed"],
  authors: [{ name: "Ahmed Mohammed" }],
  openGraph: {
    title: "Ahmed Mohammed | AI/ML Engineer",
    description: "AI/ML Engineer & Entrepreneur",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
