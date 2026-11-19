'use client'

import { useI18n } from '@/lib/i18n'
import { portfolioCopy } from '@/lib/portfolio-copy'

export default function PortfolioPageTitle({ page }: { page: 'about' | 'research' }) {
  const { t } = useI18n()

  return <h1 className="portfolio-page-title portfolio-shell">{t(portfolioCopy[page])}</h1>
}
