import type { Metadata } from 'next'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import PortfolioPageTitle from '@/components/PortfolioPageTitle'
import AdditionalProjects from '@/components/Projects'

export const metadata: Metadata = {
  title: 'About',
  description: 'Ahmed Mohammed’s background in mechatronics, industrial computer vision, and AI research. Find education, experience, and technical skills.',
  alternates: { canonical: '/about/' },
}

export default function AboutPage() {
  return (
    <>
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
