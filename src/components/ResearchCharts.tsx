import ResearchFigure from '@/components/ResearchFigure'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { cifarCharts, industrialCharts } from '@/lib/research-figures'

const moreResults = {
  en: 'More results',
  de: 'Weitere Ergebnisse',
  fr: 'Plus de résultats',
  es: 'Más resultados',
  ar: 'المزيد من النتائج',
} satisfies TranslationMap

export default function ResearchCharts({ track }: { track: 'cifar' | 'industrial' }) {
  const { t } = useI18n()
  const [separationWeightSweep, ...supportingCharts] = cifarCharts

  if (track === 'cifar') {
    return (
      <>
        <div className="portfolio-charts portfolio-charts-featured">
          <ResearchFigure figure={separationWeightSweep} chart />
        </div>
        <details className="portfolio-chart-results">
          <summary>{t(moreResults)}</summary>
          <div className="portfolio-charts">
            {supportingCharts.map((figure) => <ResearchFigure key={figure.src} figure={figure} chart />)}
          </div>
        </details>
      </>
    )
  }

  return (
    <div className="portfolio-charts">
      {industrialCharts.map((figure) => <ResearchFigure key={figure.src} figure={figure} chart />)}
    </div>
  )
}
