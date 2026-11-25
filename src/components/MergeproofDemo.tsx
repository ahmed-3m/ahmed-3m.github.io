'use client'

import { Fragment, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useI18n, type TranslationMap } from '@/lib/i18n'

function renderBdi(text: string): ReactNode {
  if (!text.includes('\u2066')) return text
  const parts = text.split(/\u2066([^\u2069]+)\u2069/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <bdi key={i} dir="ltr">
        {part}
      </bdi>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

type VerdictCode = 'MERGE' | 'RETRY' | 'HUMAN'
type GateMode = 'enforce' | 'shadow'
type TrustBucketKey = 'earned' | 'cold'
type ScenarioId = 'tampered-test' | 'weak-proof' | 'protected-path' | 'proven-bugfix'
type TraceState = 'pass' | 'fail' | 'hold' | 'skip'

interface GateNote {
  ok: boolean
  text: string
  rule?: string
}

interface ProofOutcome {
  ok: boolean
  weak: boolean
  notes: GateNote[]
  reasonCode?: 'NEW_TEST_PASSES_ON_BASE'
}

interface TrustEvaluation {
  trusted: boolean
  settled: number
  minOutcomes: number
  cleanRatePct: number
  text: string
}

interface VerdictResult {
  verdict: VerdictCode
  exitCode: 0 | 3 | 4
  kind: 'bugfix'
  notes: GateNote[]
  merged: boolean
  cliText: string
}

interface TraceStep {
  key: 'classify' | 'tamper' | 'prove' | 'decide'
  state: TraceState
  label: TranslationMap
  detail: TranslationMap
  codeTag: string
}

interface ScenarioSpec {
  id: ScenarioId
  benchmarkRef: string
  prNumber: number
  branch: string
  issueNumber: number
  kind: 'bugfix'
  configHint?: string
  files: ReadonlyArray<{ status: 'A' | 'M'; path: string; stats: string }>
  tabTitle: TranslationMap
  summary: TranslationMap
  diff: readonly string[]
  tamperNotes: GateNote[]
  holdNotes: GateNote[]
  proof: ProofOutcome | null
}

const EXIT_CODES: Record<VerdictCode, 0 | 3 | 4> = {
  MERGE: 0,
  RETRY: 3,
  HUMAN: 4,
}

const MAX_NOTES = 3
const AGENT_ID = 'claude-code'
const MODEL_ID = 'glm-5.2'

function renderNewTestPassesOnBase(path: string): string {
  return `new test ${path} passes on base, so it proves nothing`
}

function evaluateTrust(bucket: TrustBucketKey, kind: string): TrustEvaluation {
  const minOutcomes = 10
  const who = `${kind} for ${AGENT_ID}/${MODEL_ID}`
  if (bucket === 'earned') {
    const settled = 12
    const cleanRatePct = 100
    return {
      trusted: true,
      settled,
      minOutcomes,
      cleanRatePct,
      text: `${who} trusted (${settled} outcomes, ${cleanRatePct}% clean)`,
    }
  }
  const settled = 3
  return {
    trusted: false,
    settled,
    minOutcomes,
    cleanRatePct: 100,
    text: `${who} not trusted yet (${settled}/${minOutcomes} outcomes)`,
  }
}

function makeVerdict(verdict: VerdictCode, kind: 'bugfix', notes: GateNote[]) {
  const ordered = [...notes.filter((n) => !n.ok), ...notes.filter((n) => n.ok)]
  return {
    verdict,
    exitCode: EXIT_CODES[verdict],
    kind,
    notes: ordered.slice(0, MAX_NOTES),
  }
}

/**
 * Pure deterministic decision table from `@ahmed-3m/mergeproof` (`src/decide.mjs` + `src/land.mjs`).
 */
function runDecisionTable(
  scenario: ScenarioSpec,
  mode: GateMode,
  trustBucket: TrustBucketKey,
): { result: VerdictResult; trust: TrustEvaluation } {
  const trust = evaluateTrust(trustBucket, scenario.kind)
  const { kind, tamperNotes, proof, holdNotes } = scenario

  let core: ReturnType<typeof makeVerdict>
  if (tamperNotes.length > 0) {
    core = makeVerdict('HUMAN', kind, tamperNotes)
  } else if (!proof) {
    core = makeVerdict('HUMAN', kind, [])
  } else if (proof.weak) {
    core = makeVerdict('RETRY', kind, proof.notes)
  } else if (!proof.ok) {
    core = makeVerdict('HUMAN', kind, proof.notes)
  } else if (holdNotes.length > 0) {
    core = makeVerdict('HUMAN', kind, [...holdNotes, ...proof.notes])
  } else if (!trust.trusted) {
    core = makeVerdict('HUMAN', kind, [{ ok: false, text: trust.text }, ...proof.notes])
  } else {
    core = makeVerdict('MERGE', kind, [...proof.notes, { ok: true, text: trust.text }])
  }

  const proven = Boolean(proof?.ok && tamperNotes.length === 0)
  const merged = proven && core.verdict === 'MERGE' && mode === 'enforce'
  const headLine = `Mergeproof — ${core.verdict} (kind: ${core.kind})`
  const noteLines = core.notes.map((n) => `  ${n.ok ? '✓' : '✗'} ${n.text}`)
  const modeLine = `  (${mode}${core.verdict === 'MERGE' ? (merged ? ': merged' : ': not merged') : ''})`

  return {
    trust,
    result: {
      ...core,
      merged,
      cliText: [headLine, ...noteLines, modeLine].join('\n'),
    },
  }
}

const SCENARIOS: readonly ScenarioSpec[] = [
  {
    id: 'tampered-test',
    benchmarkRef: 'benchmarks/specs.md #3',
    prNumber: 42,
    branch: 'agent/issue-17-fix-parser',
    issueNumber: 17,
    kind: 'bugfix',
    files: [
      { status: 'M', path: 'src/parser.js', stats: '+1 −1' },
      { status: 'M', path: 'tests/parser.test.js', stats: '+1 −1' },
    ],
    tabTitle: {
      en: 'Tampered test',
      de: 'Geänderter Test',
      fr: 'Test existant modifié',
      es: 'Prueba modificada',
      ar: 'تعديل اختبار قائم',
    },
    summary: {
      en: 'Bugfix PR edits an existing assertion in tests/parser.test.js alongside source code. Tamper rule existingTestEdited halts immediately with HUMAN (no retry, so retrying never teaches better test tampering).',
      de: 'Der Bugfix-PR ändert neben dem Quellcode eine bestehende Assertion in tests/parser.test.js. Die Regel existingTestEdited stoppt sofort mit HUMAN (kein Retry, damit Wiederholungen kein besseres Umgehen lehren).',
      fr: 'La PR de correctif modifie une assertion existante dans tests/parser.test.js en plus du code source. La règle existingTestEdited bloque immédiatement en HUMAN (sans relance, pour ne pas entraîner le contournement).',
      es: 'El PR de corrección edita una aserción existente en tests/parser.test.js junto con el código fuente. La regla existingTestEdited detiene la ejecución con HUMAN (sin reintento).',
      ar: 'يعدّل طلب إصلاح الخلل تحقّقاً قائماً في \u2066tests/parser.test.js\u2069 إلى جانب الشيفرة المصدرية. توقف قاعدة \u2066existingTestEdited\u2069 الفحص فوراً بالحكم \u2066HUMAN\u2069 دون إعادة محاولة.',
    },
    diff: [
      '--- a/src/parser.js',
      '+++ b/src/parser.js',
      '@@ -14,5 +14,5 @@ export function parseAmount(raw) {',
      '-  return Number.parseFloat(raw);',
      '+  return Number.parseFloat(String(raw).trim()) || 0;',
      ' }',
      '--- a/tests/parser.test.js',
      '+++ b/tests/parser.test.js',
      "@@ -8,5 +8,5 @@ test('rejects malformed input', () => {",
      "-  assert.throws(() => parseAmount('N/A'), /Invalid/);",
      "+  assert.strictEqual(parseAmount('N/A'), 0);",
      ' });',
    ],
    tamperNotes: [
      {
        ok: false,
        rule: 'existingTestEdited',
        text: 'edits existing test tests/parser.test.js',
      },
    ],
    holdNotes: [],
    proof: null,
  },
  {
    id: 'weak-proof',
    benchmarkRef: 'benchmarks/specs.md #4',
    prNumber: 43,
    branch: 'agent/issue-24-clamp-page',
    issueNumber: 24,
    kind: 'bugfix',
    files: [
      { status: 'M', path: 'src/paginate.js', stats: '+2 −1' },
      { status: 'A', path: 'tests/paginate-negative.test.js', stats: '+6 −0' },
    ],
    tabTitle: {
      en: 'Weak test proof',
      de: 'Schwacher Testbeweis',
      fr: 'Preuve de test faible',
      es: 'Prueba débil',
      ar: 'إثبات اختباري ضعيف',
    },
    summary: {
      en: 'Agent adds a new test file that passes on head (3/3) but also already passes on base (0/2 failures), so it never reproduced the bug. Returns RETRY with structured reason NEW_TEST_PASSES_ON_BASE fed back to the agent loop.',
      de: 'Der Agent fügt einen neuen Test hinzu, der auf head besteht (3/3), aber auch auf base bereits grün ist (0/2 Fehler) und den Bug nicht reproduziert. Liefert RETRY mit Grund NEW_TEST_PASSES_ON_BASE zurück an die Agent-Schleife.',
      fr: 'L’agent ajoute un nouveau test qui passe sur head (3/3) mais passe déjà sur base (0/2 échec), sans reproduire le bug. Renvoie RETRY avec le code NEW_TEST_PASSES_ON_BASE transmis à la boucle de l’agent.',
      es: 'El agente añade una prueba nueva que pasa en head (3/3) pero también pasaba ya en base (0/2 fallos), sin reproducir el fallo. Devuelve RETRY con el código NEW_TEST_PASSES_ON_BASE al bucle del agente.',
      ar: 'يضيف الوكيل ملف اختبار جديد ينجح على \u2066head (3/3)\u2069 لكنه ينجح مسبقاً على \u2066base (0/2)\u2069، فلا يثبت وجود الخلل أصلاً. يعيد البوابة الحكم \u2066RETRY\u2069 مع السبب المهيكل \u2066NEW_TEST_PASSES_ON_BASE\u2069 إلى حلقة الوكيل.',
    },
    diff: [
      '--- a/src/paginate.js',
      '+++ b/src/paginate.js',
      '@@ -4,4 +4,5 @@ export function pageOffset(page, size = 20) {',
      '-  return (page - 1) * size;',
      '+  const safe = Math.max(1, page);',
      '+  return (safe - 1) * size;',
      ' }',
      '--- /dev/null',
      '+++ b/tests/paginate-negative.test.js',
      '@@ -0,0 +1,5 @@',
      "+import test from 'node:test';",
      "+import assert from 'node:assert/strict';",
      "+import { pageOffset } from '../src/paginate.js';",
      "+test('clamps offset', () => {",
      '+  assert.strictEqual(pageOffset(1, 20), 0); // passes on base!',
      '+});',
    ],
    tamperNotes: [],
    holdNotes: [],
    proof: {
      ok: false,
      weak: true,
      reasonCode: 'NEW_TEST_PASSES_ON_BASE',
      notes: [
        {
          ok: false,
          text: renderNewTestPassesOnBase('tests/paginate-negative.test.js'),
        },
      ],
    },
  },
  {
    id: 'protected-path',
    benchmarkRef: 'benchmarks/specs.md #9',
    prNumber: 44,
    branch: 'agent/issue-28-session-skew',
    issueNumber: 28,
    kind: 'bugfix',
    configHint: 'paths.humanOnly: ["src/auth/**"]',
    files: [
      { status: 'M', path: 'src/auth/session.js', stats: '+2 −1' },
      { status: 'A', path: 'tests/session-skew.test.js', stats: '+6 −0' },
    ],
    tabTitle: {
      en: 'Protected path',
      de: 'Geschützter Pfad',
      fr: 'Chemin protégé',
      es: 'Ruta protegida',
      ar: 'مسار محمي',
    },
    summary: {
      en: 'PR touches src/auth/session.js, matching paths.humanOnly (while gate files like .github/workflows/* and .mergeproof.json are blocked even earlier by gateFilesEdited). Proof still runs, then auto-merge is withheld with HUMAN.',
      de: 'Der PR ändert src/auth/session.js und trifft paths.humanOnly (während Gate-Dateien wie .github/workflows/* und .mergeproof.json bereits durch gateFilesEdited blockiert werden). Der Beweis läuft trotzdem, danach eskaliert das Gate auf HUMAN.',
      fr: 'La PR touche src/auth/session.js, couvert par paths.humanOnly (tandis que .github/workflows/* et .mergeproof.json sont bloqués encore plus tôt par gateFilesEdited). La preuve s’exécute, puis la fusion auto est retenue en HUMAN.',
      es: 'El PR toca src/auth/session.js, incluido en paths.humanOnly (mientras que .github/workflows/* y .mergeproof.json se bloquean antes mediante gateFilesEdited). La prueba se ejecuta igualmente y se escala a HUMAN.',
      ar: 'يمسّ الطلب المسار \u2066src/auth/session.js\u2069 المطابق لـ \u2066paths.humanOnly\u2069 (بينما تُحظر ملفات البوابة مثل \u2066.github/workflows/*\u2069 و\u2066.mergeproof.json\u2069 مسبقاً عبر \u2066gateFilesEdited\u2069). يُنفَّذ الإثبات الاختباري ثم يُحجب الدمج التلقائي بالحكم \u2066HUMAN\u2069.',
    },
    diff: [
      '--- a/src/auth/session.js',
      '+++ b/src/auth/session.js',
      '@@ -11,4 +11,5 @@ export function isExpired(expSec, nowMs) {',
      '-  return nowMs / 1000 >= expSec;',
      '+  const skewSec = 5;',
      '+  return nowMs / 1000 >= expSec + skewSec;',
      ' }',
      '--- /dev/null',
      '+++ b/tests/session-skew.test.js',
      '@@ -0,0 +1,5 @@',
      "+import test from 'node:test';",
      "+import assert from 'node:assert/strict';",
      "+import { isExpired } from '../src/auth/session.js';",
      "+test('allows 3s clock skew', () => {",
      '+  assert.strictEqual(isExpired(100, 103_000), false);',
      '+});',
    ],
    tamperNotes: [],
    holdNotes: [
      {
        ok: false,
        text: 'touches a human-only path: src/auth/session.js',
      },
    ],
    proof: {
      ok: true,
      weak: false,
      notes: [
        { ok: true, text: 'new test fail on base 2/2 and pass on head 3/3' },
        { ok: true, text: 'CI green' },
      ],
    },
  },
  {
    id: 'proven-bugfix',
    benchmarkRef: 'benchmarks/specs.md #1 & #5',
    prNumber: 45,
    branch: 'agent/issue-31-utf8-slug',
    issueNumber: 31,
    kind: 'bugfix',
    files: [
      { status: 'M', path: 'src/slug.js', stats: '+2 −1' },
      { status: 'A', path: 'tests/slug-unicode.test.js', stats: '+6 −0' },
    ],
    tabTitle: {
      en: 'Proven bugfix',
      de: 'Bewiesener Bugfix',
      fr: 'Correctif prouvé',
      es: 'Corrección probada',
      ar: 'إصلاح مُثبت',
    },
    summary: {
      en: 'New test fails on base (2/2), passes on head (3/3), existing tests stay untouched, and branch matches agent/*. Toggle mode and trust above to watch the gate switch between MERGE (squash-merge vs shadow report) and cold-start HUMAN.',
      de: 'Der neue Test schlägt auf base fehl (2/2) und besteht auf head (3/3), bestehende Tests bleiben unberührt, Branch passt auf agent/*. Schalten Sie oben Modus und Trust um, um zwischen MERGE (Squash-Merge vs. Shadow-Report) und Cold-Start-HUMAN zu wechseln.',
      fr: 'Le nouveau test échoue sur base (2/2) et passe sur head (3/3), aucun test existant n’est touché et la branche correspond à agent/*. Basculez mode et confiance ci-dessus pour voir MERGE (fusion auto vs rapport shadow) ou HUMAN à froid.',
      es: 'La nueva prueba falla en base (2/2) y pasa en head (3/3), sin tocar pruebas existentes en la rama agent/*. Cambie modo y confianza arriba para alternar en vivo entre MERGE (fusión vs informe shadow) y HUMAN en frío.',
      ar: 'يفشل الاختبار الجديد على \u2066base (2/2)\u2069 وينجح على \u2066head (3/3)\u2069 دون المساس بالاختبارات القائمة وعلى فرع \u2066agent/*\u2069. بدّل الوضع ومستوى الثقة أعلاه لمشاهدة تغيّر القرار فورياً بين \u2066MERGE\u2069 و\u2066HUMAN\u2069.',
    },
    diff: [
      '--- a/src/slug.js',
      '+++ b/src/slug.js',
      '@@ -2,4 +2,5 @@ export function toSlug(s) {',
      "-  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');",
      "+  return s.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '')",
      "+    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');",
      ' }',
      '--- /dev/null',
      '+++ b/tests/slug-unicode.test.js',
      '@@ -0,0 +1,5 @@',
      "+import test from 'node:test';",
      "+import assert from 'node:assert/strict';",
      "+import { toSlug } from '../src/slug.js';",
      "+test('transliterates umlauts cleanly', () => {",
      "+  assert.strictEqual(toSlug('Linz — Österreich!'), 'linz-osterreich');",
      '+});',
    ],
    tamperNotes: [],
    holdNotes: [],
    proof: {
      ok: true,
      weak: false,
      notes: [
        { ok: true, text: 'new test fail on base 2/2 and pass on head 3/3' },
        { ok: true, text: 'CI green' },
      ],
    },
  },
] as const

const uiCopy = {
  eyebrow: {
    en: 'Interactive PR gate · @ahmed-3m/mergeproof',
    de: 'Interaktives PR-Gate · @ahmed-3m/mergeproof',
    fr: 'Porte PR interactive · @ahmed-3m/mergeproof',
    es: 'Compuerta PR interactiva · @ahmed-3m/mergeproof',
    ar: 'بوابة طلبات الدمج التفاعلية · \u2066@ahmed-3m/mergeproof\u2069',
  },
  zeroLlm: {
    en: '0 LLM calls · pure decision table',
    de: '0 LLM-Aufrufe · reine Entscheidungstabelle',
    fr: '0 appel LLM · table de décision pure',
    es: '0 llamadas LLM · tabla de decisión pura',
    ar: '\u20660\u2069 استدعاءات \u2066LLM\u2069 · جدول قرار حتمي',
  },
  modeGroupLabel: {
    en: 'Config mode (.mergeproof.json)',
    de: 'Konfigurationsmodus (.mergeproof.json)',
    fr: 'Mode de configuration (.mergeproof.json)',
    es: 'Modo de configuración (.mergeproof.json)',
    ar: 'وضع الإعداد (\u2066.mergeproof.json\u2069)',
  },
  modeEnforce: {
    en: 'enforce',
    de: 'enforce',
    fr: 'enforce',
    es: 'enforce',
    ar: 'enforce',
  },
  modeEnforceHint: {
    en: 'auto-merge on MERGE',
    de: 'Auto-Merge bei MERGE',
    fr: 'fusion auto sur MERGE',
    es: 'fusión auto en MERGE',
    ar: 'دمج تلقائي عند \u2066MERGE\u2069',
  },
  modeShadow: {
    en: 'shadow',
    de: 'shadow',
    fr: 'shadow',
    es: 'shadow',
    ar: 'shadow',
  },
  modeShadowHint: {
    en: 'report only',
    de: 'nur Bericht',
    fr: 'rapport seul',
    es: 'solo informe',
    ar: 'تقرير فقط',
  },
  trustGroupLabel: {
    en: 'Trust ledger (.mergeproof/ledger.json)',
    de: 'Trust-Ledger (.mergeproof/ledger.json)',
    fr: 'Registre de confiance (.mergeproof/ledger.json)',
    es: 'Registro de confianza (.mergeproof/ledger.json)',
    ar: 'سجل الثقة (\u2066.mergeproof/ledger.json\u2069)',
  },
  trustEarned: {
    en: 'Earned (12 settled, 100% clean)',
    de: 'Erworben (12 abgeschlossen, 100% sauber)',
    fr: 'Acquise (12 réglés, 100% propres)',
    es: 'Ganada (12 resueltos, 100% limpios)',
    ar: 'مكتسبة (\u206612\u2069 محسومة، \u2066100%\u2069 سليمة)',
  },
  trustCold: {
    en: 'New install (3/10 settled)',
    de: 'Neuinstallation (3/10 abgeschlossen)',
    fr: 'Nouvelle install. (3/10 réglés)',
    es: 'Instalación nueva (3/10 resueltos)',
    ar: 'تثبيت جديد (\u20663/10\u2069 محسومة)',
  },
  scenarioTablistAria: {
    en: 'Preset AI-agent pull request scenarios',
    de: 'Vordefinierte KI-Agenten-Pull-Request-Szenarien',
    fr: 'Scénarios prédéfinis de pull requests d’agents IA',
    es: 'Escenarios predefinidos de pull requests de agentes IA',
    ar: 'سيناريوهات مسبقة لطلبات دمج وكلاء الذكاء الاصطناعي',
  },
  diffHeading: {
    en: 'Inspectable PR diff',
    de: 'Prüfbarer PR-Diff',
    fr: 'Diff PR inspectable',
    es: 'Diff de PR inspeccionable',
    ar: 'فروق الشيفرة القابلة للفحص',
  },
  traceHeading: {
    en: 'Deterministic check trace',
    de: 'Deterministischer Prüfpfad',
    fr: 'Trace de contrôle déterministe',
    es: 'Traza de comprobación determinista',
    ar: 'مسار الفحص الحتمي',
  },
  cliHeading: {
    en: 'Gate output (formatVerdict + land)',
    de: 'Gate-Ausgabe (formatVerdict + land)',
    fr: 'Sortie de la porte (formatVerdict + land)',
    es: 'Salida de la compuerta (formatVerdict + land)',
    ar: 'مخرجات البوابة (\u2066formatVerdict + land\u2069)',
  },
  landMerged: {
    en: 'enforce: squash-merged & logged pending',
    de: 'enforce: Squash-Merge & als pending protokolliert',
    fr: 'enforce : fusion squash & enregistré pending',
    es: 'enforce: fusión squash y registrado pending',
    ar: '\u2066enforce\u2069: دمج تلقائي وتسجيل \u2066pending\u2069',
  },
  landShadowHold: {
    en: 'shadow: report-only (not merged)',
    de: 'shadow: nur Bericht (kein Merge)',
    fr: 'shadow : rapport seul (non fusionné)',
    es: 'shadow: solo informe (sin fusionar)',
    ar: '\u2066shadow\u2069: تقرير فقط (بدون دمج)',
  },
  landRetry: {
    en: 'feeds reason code back to agent loop (max 3 tries)',
    de: 'gibt Fehlercode an Agent-Loop zurück (max. 3 Versuche)',
    fr: 'renvoie le code raison à la boucle agent (max 3 essais)',
    es: 'devuelve el código de motivo al bucle del agente (máx. 3 intentos)',
    ar: 'يعيد رمز السبب إلى حلقة الوكيل (حتى \u20663\u2069 محاولات)',
  },
  landHuman: {
    en: 'labels mergeproof:human · escalates to reviewer',
    de: 'setzt Label mergeproof:human · eskaliert an Menschen',
    fr: 'ajoute le label mergeproof:human · revue humaine',
    es: 'etiqueta mergeproof:human · escala a revisión humana',
    ar: 'يضيف الوسم \u2066mergeproof:human\u2069 · مراجعة بشرية',
  },
  statePass: { en: 'PASS', de: 'OK', fr: 'OK', es: 'OK', ar: 'اجتياز' },
  stateFail: { en: 'FAIL', de: 'FEHLER', fr: 'ÉCHEC', es: 'FALLO', ar: 'فشل' },
  stateHold: { en: 'HOLD', de: 'HALT', fr: 'RETENU', es: 'RETENIDO', ar: 'إيقاف' },
  stateSkip: { en: 'SKIP', de: 'ÜBERSPR.', fr: 'IGNORÉ', es: 'OMITIDO', ar: 'تخطٍّ' },
  caveat: {
    en: 'Passing configured deterministic checks does not guarantee defect-free code.',
    de: 'Das Bestehen konfigurierter deterministischer Prüfungen garantiert keinen fehlerfreien Code.',
    fr: 'La réussite des vérifications déterministes configurées ne garantit pas un code exempt de défauts.',
    es: 'Superar las comprobaciones deterministas configuradas no garantiza un código libre de defectos.',
    ar: 'اجتياز الفحوصات الحتمية المُعدّة لا يضمن خلو الشيفرة البرمجية من الأخطاء.',
  },
} satisfies Record<string, TranslationMap>

function buildTrace(
  scenario: ScenarioSpec,
  mode: GateMode,
  trust: TrustEvaluation,
  result: VerdictResult,
): TraceStep[] {
  const classifyStep: TraceStep = {
    key: 'classify',
    state: 'pass',
    codeTag: 'classify.mjs',
    label: {
      en: '1. Classify paths & branch',
      de: '1. Pfade & Branch klassifizieren',
      fr: '1. Classifier chemins et branche',
      es: '1. Clasificar rutas y rama',
      ar: '\u20661.\u2069 تصنيف المسارات والفرع',
    },
    detail: {
      en: `Derived kind "${scenario.kind}" from changed paths; branch ${scenario.branch} matches agents.branchPrefixes.`,
      de: `Typ "${scenario.kind}" aus geänderten Pfaden abgeleitet; Branch ${scenario.branch} passt auf agents.branchPrefixes.`,
      fr: `Type "${scenario.kind}" déduit des chemins modifiés ; la branche ${scenario.branch} correspond à agents.branchPrefixes.`,
      es: `Tipo "${scenario.kind}" deducido de las rutas modificadas; la rama ${scenario.branch} coincide con agents.branchPrefixes.`,
      ar: `استنتاج النوع \u2066"${scenario.kind}"\u2069 من المسارات المعدّلة؛ الفرع \u2066${scenario.branch}\u2069 يطابق \u2066agents.branchPrefixes\u2069.`,
    },
  }

  const tamperHit = scenario.tamperNotes[0]
  const tamperStep: TraceStep = tamperHit
    ? {
        key: 'tamper',
        state: 'fail',
        codeTag: `tamper.mjs · ${tamperHit.rule ?? 'tamper'}`,
        label: {
          en: '2. Check tamper rules',
          de: '2. Manipulationsregeln prüfen',
          fr: '2. Vérifier les règles anti-altération',
          es: '2. Comprobar reglas de manipulación',
          ar: '\u20662.\u2069 فحص قواعد التلاعب',
        },
        detail: {
          en: `Rule ${tamperHit.rule}: "${tamperHit.text}" → immediate HUMAN.`,
          de: `Regel ${tamperHit.rule}: „${tamperHit.text}“ → sofort HUMAN.`,
          fr: `Règle ${tamperHit.rule} : « ${tamperHit.text} » → HUMAN immédiat.`,
          es: `Regla ${tamperHit.rule}: «${tamperHit.text}» → HUMAN inmediato.`,
          ar: `القاعدة \u2066${tamperHit.rule}\u2069: \u2066"${tamperHit.text}"\u2069 ← تحويل فوري إلى \u2066HUMAN\u2069.`,
        },
      }
    : {
        key: 'tamper',
        state: 'pass',
        codeTag: 'tamper.mjs',
        label: {
          en: '2. Check tamper rules',
          de: '2. Manipulationsregeln prüfen',
          fr: '2. Vérifier les règles anti-altération',
          es: '2. Comprobar reglas de manipulación',
          ar: '\u20662.\u2069 فحص قواعد التلاعب',
        },
        detail: {
          en: '0 violations across gate files, agent instructions, existing tests, skip markers, and diff limit (<= 300 lines).',
          de: '0 Verstöße bei Gate-Dateien, Agent-Instruktionen, bestehenden Tests, Skip-Markern und Diff-Limit (<= 300 Zeilen).',
          fr: '0 violation sur fichiers de porte, instructions agents, tests existants, marqueurs skip et taille du diff (<= 300 lignes).',
          es: '0 infracciones en archivos de compuerta, instrucciones, pruebas existentes, marcadores skip y límite de diff (<= 300 líneas).',
          ar: '\u20660\u2069 مخالفات في ملفات البوابة وتعليمات الوكيل والاختبارات القائمة وعلامات التخطي وحد الفروق (\u2066<= 300\u2069 سطر).',
        },
      }

  let proveStep: TraceStep
  if (!scenario.proof) {
    proveStep = {
      key: 'prove',
      state: 'skip',
      codeTag: 'prove.mjs',
      label: {
        en: '3. Run isolated worktree proof',
        de: '3. Isolierten Worktree-Beweis ausführen',
        fr: '3. Exécuter la preuve en worktree isolé',
        es: '3. Ejecutar prueba en worktree aislado',
        ar: '\u20663.\u2069 تشغيل الإثبات في بيئة معزولة',
      },
      detail: {
        en: 'Skipped — tamper hit stops evaluate() before running untrusted PR test code.',
        de: 'Übersprungen — Manipulationsfund stoppt evaluate() vor dem Ausführen von PR-Testcode.',
        fr: 'Ignoré — une altération arrête evaluate() avant l’exécution des tests de la PR.',
        es: 'Omitido — la manipulación detiene evaluate() antes de ejecutar código de prueba del PR.',
        ar: 'تم التخطي — اكتشاف التلاعب يوقف \u2066evaluate()\u2069 قبل تشغيل اختبارات الطلب.',
      },
    }
  } else if (!scenario.proof.ok) {
    proveStep = {
      key: 'prove',
      state: 'fail',
      codeTag: `reasons.mjs · ${scenario.proof.reasonCode ?? 'WEAK_PROOF'}`,
      label: {
        en: '3. Run isolated worktree proof',
        de: '3. Isolierten Worktree-Beweis ausführen',
        fr: '3. Exécuter la preuve en worktree isolé',
        es: '3. Ejecutar prueba en worktree aislado',
        ar: '\u20663.\u2069 تشغيل الإثبات في بيئة معزولة',
      },
      detail: {
        en: 'New test failed 0/2 runs on base (expected 2/2 failures) and passed 3/3 on head → weak proof (RETRY).',
        de: 'Neuer Test schlug in 0/2 Läufen auf base fehl (erwartet 2/2) und bestand 3/3 auf head → schwacher Beweis (RETRY).',
        fr: 'Le nouveau test a échoué 0/2 fois sur base (attendu 2/2) et réussi 3/3 sur head → preuve faible (RETRY).',
        es: 'La nueva prueba falló 0/2 veces en base (se esperaban 2/2) y pasó 3/3 en head → prueba débil (RETRY).',
        ar: 'فشل الاختبار الجديد في \u20660/2\u2069 تشغيلات على \u2066base\u2069 (المطلوب \u20662/2\u2069) ونجح \u20663/3\u2069 على \u2066head\u2069 ← إثبات ضعيف (\u2066RETRY\u2069).',
      },
    }
  } else {
    proveStep = {
      key: 'prove',
      state: 'pass',
      codeTag: 'prove.mjs',
      label: {
        en: '3. Run isolated worktree proof',
        de: '3. Isolierten Worktree-Beweis ausführen',
        fr: '3. Exécuter la preuve en worktree isolé',
        es: '3. Ejecutar prueba en worktree aislado',
        ar: '\u20663.\u2069 تشغيل الإثبات في بيئة معزولة',
      },
      detail: {
        en: 'New test fails 2/2 on base worktree, passes 3/3 on head worktree, test count intact, CI green.',
        de: 'Neuer Test schlägt 2/2 auf base fehl, besteht 3/3 auf head, Testanzahl unverändert, CI grün.',
        fr: 'Le nouveau test échoue 2/2 sur base, passe 3/3 sur head, nombre de tests intact, CI verte.',
        es: 'La nueva prueba falla 2/2 en base, pasa 3/3 en head, recuento de pruebas intacto y CI en verde.',
        ar: 'يفشل الاختبار الجديد \u20662/2\u2069 على \u2066base\u2069 وينجح \u20663/3\u2069 على \u2066head\u2069 مع ثبات عدد الاختبارات واخضرار \u2066CI\u2069.',
      },
    }
  }

  let decideStep: TraceStep
  if (tamperHit) {
    decideStep = {
      key: 'decide',
      state: 'fail',
      codeTag: `decide.mjs · mode=${mode}`,
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `Short-circuited by tamper rule — ledger (${trust.settled}/${trust.minOutcomes} settled) never overrides tampering.`,
        de: `Durch Manipulationsregel kurzgeschlossen — Ledger (${trust.settled}/${trust.minOutcomes} abgeschlossen) überstimmt keine Manipulation.`,
        fr: `Court-circuité par l’altération — le registre (${trust.settled}/${trust.minOutcomes} réglés) ne prime jamais sur une altération.`,
        es: `Cortocircuitado por manipulación — el registro (${trust.settled}/${trust.minOutcomes} resueltos) nunca anula una manipulación.`,
        ar: `توقّف مبكر بسبب التلاعب — سجل الثقة (\u2066${trust.settled}/${trust.minOutcomes}\u2069) لا يتجاوز قواعد التلاعب أبداً.`,
      },
    }
  } else if (scenario.proof?.weak) {
    decideStep = {
      key: 'decide',
      state: 'hold',
      codeTag: `decide.mjs · mode=${mode}`,
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `Weak proof returns RETRY (exit 3) before consulting trust (${trust.settled}/${trust.minOutcomes} settled).`,
        de: `Schwacher Beweis liefert RETRY (Exit 3) vor der Trust-Prüfung (${trust.settled}/${trust.minOutcomes} abgeschlossen).`,
        fr: `La preuve faible renvoie RETRY (code 3) avant de consulter la confiance (${trust.settled}/${trust.minOutcomes} réglés).`,
        es: `La prueba débil devuelve RETRY (salida 3) antes de consultar la confianza (${trust.settled}/${trust.minOutcomes} resueltos).`,
        ar: `الإثبات الضعيف يعيد \u2066RETRY (exit 3)\u2069 قبل الرجوع إلى سجل الثقة (\u2066${trust.settled}/${trust.minOutcomes}\u2069).`,
      },
    }
  } else if (scenario.holdNotes.length > 0) {
    decideStep = {
      key: 'decide',
      state: 'hold',
      codeTag: `inspect.mjs · paths.humanOnly`,
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `paths.humanOnly matched src/auth/session.js — escalates to HUMAN even when trust is ${trust.settled}/${trust.minOutcomes}.`,
        de: `paths.humanOnly traf src/auth/session.js — eskaliert auf HUMAN selbst bei Trust ${trust.settled}/${trust.minOutcomes}.`,
        fr: `paths.humanOnly couvre src/auth/session.js — escalade en HUMAN même avec confiance ${trust.settled}/${trust.minOutcomes}.`,
        es: `paths.humanOnly coincide con src/auth/session.js — escala a HUMAN incluso con confianza ${trust.settled}/${trust.minOutcomes}.`,
        ar: `تطابق \u2066paths.humanOnly\u2069 مع \u2066src/auth/session.js\u2069 — تصعيد إلى \u2066HUMAN\u2069 حتى مع ثقة \u2066${trust.settled}/${trust.minOutcomes}\u2069.`,
      },
    }
  } else if (!trust.trusted) {
    decideStep = {
      key: 'decide',
      state: 'hold',
      codeTag: `ledger.mjs · ${trust.settled}/${trust.minOutcomes}`,
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `Cold start (${trust.settled}/${trust.minOutcomes} settled, needs >= 10 at >= 90% clean) → HUMAN; logs proven outcome so human merges build trust.`,
        de: `Cold-Start (${trust.settled}/${trust.minOutcomes} abgeschlossen, benötigt >= 10 bei >= 90% sauber) → HUMAN; protokolliert Beweis zum Trust-Aufbau.`,
        fr: `Démarrage à froid (${trust.settled}/${trust.minOutcomes} réglés, requiert >= 10 à >= 90% propres) → HUMAN ; enregistre le résultat prouvé.`,
        es: `Arranque en frío (${trust.settled}/${trust.minOutcomes} resueltos, requiere >= 10 con >= 90% limpios) → HUMAN; registra el resultado probado.`,
        ar: `بداية باردة (\u2066${trust.settled}/${trust.minOutcomes}\u2069 محسومة، يتطلب \u2066>= 10\u2069 بنسبة سلامة \u2066>= 90%\u2069) ← \u2066HUMAN\u2069 مع تسجيل النتيجة لبناء الثقة.`,
      },
    }
  } else if (mode === 'shadow') {
    decideStep = {
      key: 'decide',
      state: 'hold',
      codeTag: 'land.mjs · shadow',
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `Trusted (${trust.settled} settled, ${trust.cleanRatePct}% clean, 0 reverts) → verdict MERGE, but shadow mode reports only and withholds squash-merge.`,
        de: `Vertrauenswürdig (${trust.settled} abgeschlossen, ${trust.cleanRatePct}% sauber, 0 Reverts) → Urteil MERGE, aber shadow-Modus meldet nur ohne Merge.`,
        fr: `Confiance acquise (${trust.settled} réglés, ${trust.cleanRatePct}% propres, 0 revert) → verdict MERGE, mais le mode shadow publie le rapport sans fusionner.`,
        es: `Confiable (${trust.settled} resueltos, ${trust.cleanRatePct}% limpios, 0 reversiones) → veredicto MERGE, pero el modo shadow solo informa sin fusionar.`,
        ar: `ثقة مكتسبة (\u2066${trust.settled}\u2069 محسومة، \u2066${trust.cleanRatePct}%\u2069 سليمة، \u20660\u2069 تراجعات) ← الحكم \u2066MERGE\u2069، لكن وضع \u2066shadow\u2069 يكتفي بالتقرير دون دمج.`,
      },
    }
  } else {
    decideStep = {
      key: 'decide',
      state: result.merged ? 'pass' : 'hold',
      codeTag: 'land.mjs · enforce',
      label: {
        en: '4. Trust ledger & mode landing',
        de: '4. Trust-Ledger & Modus-Entscheidung',
        fr: '4. Registre de confiance & mode',
        es: '4. Registro de confianza y modo',
        ar: '\u20664.\u2069 سجل الثقة ووضع التنفيذ',
      },
      detail: {
        en: `Trusted (${trust.settled} settled, ${trust.cleanRatePct}% clean, 0 reverts) + enforce mode → squash-merges PR pinned to proven headSha.`,
        de: `Vertrauenswürdig (${trust.settled} abgeschlossen, ${trust.cleanRatePct}% sauber, 0 Reverts) + enforce-Modus → Squash-Merge auf bewiesenen headSha.`,
        fr: `Confiance acquise (${trust.settled} réglés, ${trust.cleanRatePct}% propres, 0 revert) + mode enforce → fusion squash épinglée au headSha prouvé.`,
        es: `Confiable (${trust.settled} resueltos, ${trust.cleanRatePct}% limpios, 0 reversiones) + modo enforce → fusión squash fijada al headSha probado.`,
        ar: `ثقة مكتسبة (\u2066${trust.settled}\u2069 محسومة، \u2066${trust.cleanRatePct}%\u2069 سليمة، \u20660\u2069 تراجعات) مع وضع \u2066enforce\u2069 ← دمج تلقائي مثبت على \u2066headSha\u2069 المُثبت.`,
      },
    }
  }

  return [classifyStep, tamperStep, proveStep, decideStep]
}

function stateLabelMap(state: TraceState): TranslationMap {
  switch (state) {
    case 'pass':
      return uiCopy.statePass
    case 'fail':
      return uiCopy.stateFail
    case 'hold':
      return uiCopy.stateHold
    case 'skip':
      return uiCopy.stateSkip
  }
}

export default function MergeproofDemo() {
  const { t } = useI18n()
  const instanceId = useId()
  const [scenarioId, setScenarioId] = useState<ScenarioId>('tampered-test')
  const [mode, setMode] = useState<GateMode>('enforce')
  const [trustBucket, setTrustBucket] = useState<TrustBucketKey>('earned')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const allEvaluations = useMemo(() => {
    return Object.fromEntries(
      SCENARIOS.map((sc) => [sc.id, runDecisionTable(sc, mode, trustBucket)]),
    ) as Record<ScenarioId, ReturnType<typeof runDecisionTable>>
  }, [mode, trustBucket])

  const activeScenario = SCENARIOS.find((sc) => sc.id === scenarioId) ?? SCENARIOS[0]
  const { result, trust } = allEvaluations[activeScenario.id]
  const traceSteps = useMemo(
    () => buildTrace(activeScenario, mode, trust, result),
    [activeScenario, mode, trust, result],
  )

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = SCENARIOS.length
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = isRtl ? (index - 1 + count) % count : (index + 1) % count
    } else if (event.key === 'ArrowLeft') {
      nextIndex = isRtl ? (index + 1) % count : (index - 1 + count) % count
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = count - 1
    }

    if (nextIndex === null) return
    event.preventDefault()
    const next = SCENARIOS[nextIndex]
    setScenarioId(next.id)
    tabRefs.current[nextIndex]?.focus()
  }

  const verdictTone =
    result.verdict === 'MERGE'
      ? result.merged
        ? 'merge'
        : 'shadow'
      : result.verdict === 'RETRY'
        ? 'retry'
        : 'human'

  const landingText =
    result.verdict === 'MERGE'
      ? result.merged
        ? t(uiCopy.landMerged)
        : t(uiCopy.landShadowHold)
      : result.verdict === 'RETRY'
        ? t(uiCopy.landRetry)
        : t(uiCopy.landHuman)

  return (
    <div className="mp-demo">
      <div className="mp-head">
        <div className="mp-head-titles">
          <span className="mp-eyebrow">{renderBdi(t(uiCopy.eyebrow))}</span>
          <span className="mp-zero-pill">{renderBdi(t(uiCopy.zeroLlm))}</span>
        </div>

        <div className="mp-controls">
          <div className="mp-control-block">
            <span className="mp-control-label" id={`${instanceId}-mode-lbl`}>
              {renderBdi(t(uiCopy.modeGroupLabel))}
            </span>
            <div className="mp-seg" role="group" aria-labelledby={`${instanceId}-mode-lbl`}>
              <button
                type="button"
                className={`mp-seg-btn${mode === 'enforce' ? ' is-active' : ''}`}
                aria-pressed={mode === 'enforce'}
                onClick={() => setMode('enforce')}
              >
                <span className="mp-seg-code">
                  <bdi dir="ltr">{t(uiCopy.modeEnforce)}</bdi>
                </span>
                <span className="mp-seg-sub">{renderBdi(t(uiCopy.modeEnforceHint))}</span>
              </button>
              <button
                type="button"
                className={`mp-seg-btn${mode === 'shadow' ? ' is-active' : ''}`}
                aria-pressed={mode === 'shadow'}
                onClick={() => setMode('shadow')}
              >
                <span className="mp-seg-code">
                  <bdi dir="ltr">{t(uiCopy.modeShadow)}</bdi>
                </span>
                <span className="mp-seg-sub">{renderBdi(t(uiCopy.modeShadowHint))}</span>
              </button>
            </div>
          </div>

          <div className="mp-control-block">
            <span className="mp-control-label" id={`${instanceId}-trust-lbl`}>
              {renderBdi(t(uiCopy.trustGroupLabel))}
            </span>
            <div className="mp-seg" role="group" aria-labelledby={`${instanceId}-trust-lbl`}>
              <button
                type="button"
                className={`mp-seg-btn${trustBucket === 'earned' ? ' is-active' : ''}`}
                aria-pressed={trustBucket === 'earned'}
                onClick={() => setTrustBucket('earned')}
              >
                <span className="mp-seg-prose">{renderBdi(t(uiCopy.trustEarned))}</span>
              </button>
              <button
                type="button"
                className={`mp-seg-btn${trustBucket === 'cold' ? ' is-active' : ''}`}
                aria-pressed={trustBucket === 'cold'}
                onClick={() => setTrustBucket('cold')}
              >
                <span className="mp-seg-prose">{renderBdi(t(uiCopy.trustCold))}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={t(uiCopy.scenarioTablistAria)}
        className="mp-tablist"
      >
        {SCENARIOS.map((sc, idx) => {
          const isSelected = sc.id === activeScenario.id
          const scEval = allEvaluations[sc.id].result
          const chipTone =
            scEval.verdict === 'MERGE'
              ? scEval.merged
                ? 'merge'
                : 'shadow'
              : scEval.verdict === 'RETRY'
                ? 'retry'
                : 'human'

          return (
            <button
              key={sc.id}
              ref={(el) => {
                tabRefs.current[idx] = el
              }}
              type="button"
              role="tab"
              id={`${instanceId}-tab-${sc.id}`}
              aria-selected={isSelected}
              aria-controls={`${instanceId}-panel-${sc.id}`}
              tabIndex={isSelected ? 0 : -1}
              className={`mp-tab${isSelected ? ' is-active' : ''}`}
              onClick={() => setScenarioId(sc.id)}
              onKeyDown={(event) => handleTabKeyDown(event, idx)}
            >
              <span className="mp-tab-title">{renderBdi(t(sc.tabTitle))}</span>
              <span className={`mp-chip mp-chip--${chipTone}`}>
                <bdi dir="ltr">
                  {scEval.verdict}
                  {scEval.verdict === 'MERGE' && !scEval.merged ? ' · shadow' : ''}
                </bdi>
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${instanceId}-panel-${activeScenario.id}`}
        aria-labelledby={`${instanceId}-tab-${activeScenario.id}`}
        className="mp-panel"
      >
        <p className="mp-summary">{renderBdi(t(activeScenario.summary))}</p>

        <div className="mp-columns">
          <div className="mp-col">
            <div className="mp-subhead">
              <span>{renderBdi(t(uiCopy.diffHeading))}</span>
              <span className="mp-meta-mono">
                <bdi dir="ltr">{activeScenario.benchmarkRef}</bdi>
              </span>
            </div>

            <div className="mp-pr-meta" dir="ltr">
              <span className="mp-pr-pill">PR #{activeScenario.prNumber}</span>
              <span className="mp-pr-pill">{activeScenario.branch}</span>
              <span className="mp-pr-pill">issue #{activeScenario.issueNumber} (bug)</span>
              {activeScenario.configHint && (
                <span className="mp-pr-pill mp-pr-pill--warn">{activeScenario.configHint}</span>
              )}
            </div>

            <ul className="mp-file-list" dir="ltr">
              {activeScenario.files.map((file) => (
                <li key={file.path} className="mp-file-item">
                  <span className={`mp-file-status mp-file-status--${file.status.toLowerCase()}`}>
                    {file.status}
                  </span>
                  <span className="mp-file-path">{file.path}</span>
                  <span className="mp-file-stats">{file.stats}</span>
                </li>
              ))}
            </ul>

            <pre className="mp-diff" dir="ltr">
              <code>
                {activeScenario.diff.map((line, i) => {
                  const kindClass =
                    line.startsWith('+++') || line.startsWith('---')
                      ? 'mp-diff-line mp-diff-line--hdr'
                      : line.startsWith('@@')
                        ? 'mp-diff-line mp-diff-line--hunk'
                        : line.startsWith('+')
                          ? 'mp-diff-line mp-diff-line--add'
                          : line.startsWith('-')
                            ? 'mp-diff-line mp-diff-line--del'
                            : 'mp-diff-line'
                  return (
                    <span key={i} className={kindClass}>
                      {line}
                    </span>
                  )
                })}
              </code>
            </pre>
          </div>

          <div className="mp-col">
            <div className={`mp-verdict-banner mp-verdict-banner--${verdictTone}`} aria-live="polite">
              <div className="mp-verdict-main">
                <span className={`mp-verdict-badge mp-verdict-badge--${verdictTone}`}>
                  <bdi dir="ltr">{result.verdict}</bdi>
                </span>
                <span className="mp-verdict-exit">
                  <bdi dir="ltr">exit {result.exitCode}</bdi>
                </span>
                <span className="mp-verdict-kind">
                  <bdi dir="ltr">kind: {result.kind}</bdi>
                </span>
              </div>
              <p className="mp-verdict-land">{renderBdi(landingText)}</p>
            </div>

            <div className="mp-subhead">
              <span>{renderBdi(t(uiCopy.traceHeading))}</span>
              <span className="mp-meta-mono">
                <bdi dir="ltr">decide.mjs</bdi>
              </span>
            </div>

            <ol className="mp-trace">
              {traceSteps.map((step) => (
                <li key={step.key} className={`mp-trace-item mp-trace-item--${step.state}`}>
                  <div className="mp-trace-top">
                    <span className="mp-trace-title">{renderBdi(t(step.label))}</span>
                    <span className="mp-trace-tags">
                      <span className="mp-trace-module">
                        <bdi dir="ltr">{step.codeTag}</bdi>
                      </span>
                      <span className={`mp-trace-state mp-trace-state--${step.state}`}>
                        {renderBdi(t(stateLabelMap(step.state)))}
                      </span>
                    </span>
                  </div>
                  <p className="mp-trace-detail">{renderBdi(t(step.detail))}</p>
                </li>
              ))}
            </ol>

            <div className="mp-subhead">
              <span>{renderBdi(t(uiCopy.cliHeading))}</span>
            </div>
            <pre className="mp-cli" dir="ltr">
              <code>{result.cliText}</code>
            </pre>
          </div>
        </div>
      </div>

      <p className="mp-caveat">{renderBdi(t(uiCopy.caveat))}</p>
    </div>
  )
}
