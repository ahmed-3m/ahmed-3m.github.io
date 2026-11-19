import ResearchFigure from '@/components/ResearchFigure'
import { cifarCharts, industrialCharts } from '@/lib/research-figures'

export default function ResearchCharts({ track }: { track: 'cifar' | 'industrial' }) {
  const charts = track === 'cifar' ? cifarCharts : industrialCharts

  return (
    <div className="portfolio-charts">
      {charts.map((figure) => <ResearchFigure key={figure.src} figure={figure} chart />)}
    </div>
  )
}
