import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LegalContent from '@/components/LegalContent'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Legal notice (Impressum) for ahmed-3m.github.io under Austrian law.',
  alternates: { canonical: 'https://ahmed-3m.github.io/impressum/' },
}

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="portfolio-detail">
        <LegalContent kind="impressum" />
      </main>
      <Footer />
    </>
  )
}
