// Retired figures (spec 008, FR-005): results that must not appear on any surface.
// Only the figure check imports this file (ESLint blocks src/components and src/app),
// so these values never reach the client bundle. Each value is joined from segments so
// that a repository-wide grep for the literal never matches this file.

export interface RetiredFigure {
  id: string
  /** The figure as it was written, e.g. a percentage with its unit. */
  text: string
  unit: '%' | 'pp' | 'phrase'
  reason: string
  retiredOn: string
}

const RETIRED: readonly (Omit<RetiredFigure, 'text'> & { segments: readonly string[] })[] = [
  {
    id: 'retired.cifarBaseline',
    segments: ['80', '.25', '%'],
    unit: '%',
    reason: 'unsourced CIFAR-10 baseline (spec 001)',
    retiredOn: '2026-07-12',
  },
  {
    id: 'retired.cifarDeltaPp',
    segments: ['+18', '.8', 'pp'],
    unit: 'pp',
    reason: 'unsourced percentage-point delta (spec 001)',
    retiredOn: '2026-07-12',
  },
  {
    id: 'retired.cifarDeltaPhrase',
    segments: ['18', '.8 ', 'percentage'],
    unit: 'phrase',
    reason: 'unsourced percentage-point delta (spec 001)',
    retiredOn: '2026-07-12',
  },
  {
    id: 'retired.productionAccuracy',
    segments: ['98', '.4', '%'],
    unit: '%',
    reason: 'production accuracy with no public artifact (spec 008)',
    retiredOn: '2026-11-27',
  },
]

/** The retired figures, with their text joined at runtime. */
export function retiredFigures(): readonly RetiredFigure[] {
  return RETIRED.map(({ segments, ...rest }) => ({ ...rest, text: segments.join('') }))
}
