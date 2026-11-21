import type { Metadata } from 'next'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { BreadcrumbSchema } from '@/components/JsonLd'
import PortfolioPageTitle from '@/components/PortfolioPageTitle'
import AdditionalProjects from '@/components/Projects'
import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About',
  description: 'Ahmed Mohammed’s background in mechatronics, industrial computer vision, and AI research. Find education, experience, and technical skills.',
  alternates: { canonical: 'https://ahmed-3m.github.io/about/' },
  openGraph: {
    title: 'About | Ahmed Mohammed',
    description: 'Ahmed Mohammed’s background in mechatronics, industrial computer vision, and AI research. Find education, experience, and technical skills.',
    type: 'website',
    url: 'https://ahmed-3m.github.io/about/',
    images: ogImage('Ahmed Mohammed - AI/ML Engineer'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Ahmed Mohammed',
    description: 'Ahmed Mohammed’s background in mechatronics, industrial computer vision, and AI research. Find education, experience, and technical skills.',
    images: ['/og-image.png'],
  },
}

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ahmed-3m.github.io/' },
          { name: 'About', url: 'https://ahmed-3m.github.io/about/' },
        ]}
      />
      <Header />
      <main id="main" tabIndex={-1} className="portfolio-detail">
        <PortfolioPageTitle page="about" />
        <About />
        <Experience />
        <AdditionalProjects />
      </main>
      <Footer />
    </>
  )
}
