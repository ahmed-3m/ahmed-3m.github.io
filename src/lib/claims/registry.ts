// The claims registry (spec 008): every headline figure the site states, read from
// src/lib/ood-explorer-data.ts, never typed in. Client-safe: no node: imports, no file
// access. Retired figures are not here; they live in ./retired.ts, which only the check
// imports, so they never reach the client bundle.

import * as DATA from '@/lib/ood-explorer-data'
import type { QualifierId } from './qualifiers'

export type ClaimUnit = '%' | 'auroc01' | 'pp'

export interface Claim {
  id: ClaimId
  value: number
  /** Standard deviation, where the result has one. */
  spread?: number
  /** Registered precision; display never rounds below it. */
  decimals: number
  unit: ClaimUnit
  metric: string
  /** Where the value comes from in the data file. */
  source: string
  /** Qualifiers required near the figure on every surface (enforced). */
  qualifiers: readonly QualifierId[]
  /** Qualifiers measured but not enforced until a spec amendment (research R7). */
  candidateQualifiers: readonly QualifierId[]
  /** Thesis table, figure or page, or a public artifact. */
  evidence: string
}

const cifarBaseline = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.lambda === '0.0')!
const cifarOptimal = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.isOptimal)!
const seed42 = DATA.BENCHMARK_DATASETS.within_cifar
const inkjetBaseline = DATA.INKJET_OVERALL_SWEEP['0.0']
const externalAurocs = Object.values(DATA.BENCHMARK_DATASETS)
  .filter((d) => d.category !== 'within')
  .map((d) => d.auroc)

/** Values computed from the data file rather than stored in it. */
export const DERIVED = {
  separationGainPp: Number((cifarOptimal.withinCifarMean - cifarBaseline.withinCifarMean).toFixed(1)),
  externalAurocMean: Number((externalAurocs.reduce((a, b) => a + b, 0) / externalAurocs.length).toFixed(2)),
} as const

// Provenance as recorded in the data file's comments.
const THESIS = 'Thesis Table 6.6 and D.1 (within-CIFAR λ sweep), public/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf'
const BENCHMARK = 'Seed-42 score tensors (λ = 0.02, K = 100), https://huggingface.co/ahmed-3m/DiffusionOOD'

const CLAIM_LIST = [
  {
    id: 'thesis.mean',
    value: cifarOptimal.withinCifarMean,
    spread: cifarOptimal.withinCifarStd!,
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: 'CIFAR_LAMBDA_SWEEP[isOptimal].withinCifarMean ± withinCifarStd',
    qualifiers: ['threeSeeds'],
    candidateQualifiers: ['airplaneVsRest'],
    evidence: THESIS,
  },
  {
    id: 'thesis.baseline',
    value: cifarBaseline.withinCifarMean,
    spread: cifarBaseline.withinCifarStd!,
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: "CIFAR_LAMBDA_SWEEP[lambda '0.0'].withinCifarMean ± withinCifarStd",
    qualifiers: [],
    candidateQualifiers: ['threeSeeds', 'airplaneVsRest'],
    evidence: THESIS,
  },
  {
    id: 'thesis.gainPp',
    value: DERIVED.separationGainPp,
    decimals: 1,
    unit: 'pp',
    metric: 'AUROC gain',
    source: 'thesis.mean − thesis.baseline, computed',
    qualifiers: [],
    candidateQualifiers: ['threeSeeds'],
    evidence: THESIS,
  },
  {
    id: 'thesis.seed42',
    value: seed42.auroc,
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: 'BENCHMARK_DATASETS.within_cifar.auroc',
    qualifiers: ['seed42'],
    candidateQualifiers: ['airplaneVsRest'],
    evidence: BENCHMARK,
  },
  {
    id: 'thesis.seed42Fpr95',
    value: seed42.fpr95,
    decimals: 1,
    unit: '%',
    metric: 'FPR@95',
    source: 'BENCHMARK_DATASETS.within_cifar.fpr95',
    qualifiers: [],
    candidateQualifiers: ['seed42'],
    evidence: BENCHMARK,
  },
  {
    id: 'benchmark.externalMin',
    value: Math.min(...externalAurocs),
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: "min of BENCHMARK_DATASETS[category ≠ 'within'].auroc",
    qualifiers: [],
    candidateQualifiers: ['seed42'],
    evidence: BENCHMARK,
  },
  {
    id: 'benchmark.externalMax',
    value: Math.max(...externalAurocs),
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: "max of BENCHMARK_DATASETS[category ≠ 'within'].auroc",
    qualifiers: [],
    candidateQualifiers: ['seed42'],
    evidence: BENCHMARK,
  },
  {
    id: 'benchmark.externalMean',
    value: DERIVED.externalAurocMean,
    decimals: 2,
    unit: '%',
    metric: 'AUROC',
    source: "mean of BENCHMARK_DATASETS[category ≠ 'within'].auroc, computed",
    qualifiers: [],
    candidateQualifiers: ['seed42'],
    evidence: BENCHMARK,
  },
  {
    id: 'inkjet.baseline',
    value: inkjetBaseline.aurocMean,
    spread: inkjetBaseline.aurocStd,
    decimals: 4,
    unit: 'auroc01',
    metric: 'AUROC',
    source: "INKJET_OVERALL_SWEEP['0.0'].aurocMean ± aurocStd",
    qualifiers: ['fiveFoldCv'],
    candidateQualifiers: [],
    evidence: 'Thesis Tables 6.7 and 6.8 (FTI_Zer0P, 5-fold stratified image-level CV, K = 100)',
  },
] as const satisfies readonly (Omit<Claim, 'id'> & { id: string })[]

export type ClaimId = (typeof CLAIM_LIST)[number]['id']

export const CLAIMS: Readonly<Record<ClaimId, Claim>> = Object.fromEntries(
  CLAIM_LIST.map((c) => [c.id, c]),
) as unknown as Record<ClaimId, Claim>

// ---------------------------------------------------------------------------------
// Data-backed values (research R2): every number in the data file outside the plot
// arrays, plus the computed values. They satisfy the "registered value" rule only.

const PLOT_KEYS = new Set(['histogram', 'roc', 'id_pct', 'ood_pct'])

/** Data fields that hold a 0-1 metric the copy may show as a percentage (accMean 0.8094 as
 *  80.94%). Other fractions (λ, thresholds, p-values, noise schedules, scores) are not. */
const FRACTION_KEY = /^(?:auroc|acc|fpr95|auprc|f1)(?:Mean|Std)$|^(?:mean|std)$/

function collectDataNumbers(): { values: number[]; fractions: number[] } {
  const values: number[] = []
  const fractions: number[] = []
  const walk = (value: unknown, key = ''): void => {
    if (PLOT_KEYS.has(key)) return
    if (typeof value === 'number') {
      values.push(value)
      if (value > 0 && value < 1 && FRACTION_KEY.test(key)) fractions.push(value)
    } else if (typeof value === 'string') for (const m of value.matchAll(/\d+(?:\.\d+)?/g)) values.push(Number(m[0]))
    else if (Array.isArray(value)) value.forEach((item) => walk(item, key))
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, k)
  }
  for (const [name, value] of Object.entries(DATA)) walk(value, name)
  return { values, fractions }
}

const DATA_NUMBERS = collectDataNumbers()

const BACKED_VALUES: readonly number[] = [
  ...DATA_NUMBERS.values,
  ...Object.values(DERIVED),
  ...CLAIM_LIST.flatMap((c) => ('spread' in c ? [c.value, c.spread] : [c.value])),
]

/** A 0-1 metric field written as a percentage. */
const BACKED_PERCENTAGES: readonly number[] = DATA_NUMBERS.fractions.map((v) => v * 100)

/** True when the number equals a named claim, a data-file value or a computed value, or
 *  is a 0-1 metric field of the data file written as a percentage (FRACTION_KEY). */
export function isBackedValue(n: number): boolean {
  const near = (v: number) => Math.abs(v - n) < 1e-9
  return BACKED_VALUES.some(near) || BACKED_PERCENTAGES.some(near)
}
