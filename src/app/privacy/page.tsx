import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LegalContent from '@/components/LegalContent'

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: 'How ahmed-3m.github.io handles personal data: hosting, the chat assistant and the AI front desk voice demo.',
  alternates: { canonical: 'https://ahmed-3m.github.io/privacy/' },
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="portfolio-detail">
        <LegalContent kind="privacy" />
      </main>
      <Footer />
    </>
  )
}
