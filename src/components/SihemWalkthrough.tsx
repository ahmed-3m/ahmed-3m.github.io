'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useI18n, type Language, type TranslationMap } from '@/lib/i18n'

type RichCopy = Record<Language, ReactNode>

type ScenarioId = 'calendar-shift' | 'quiet-hours' | 'provider-failover'
type StepState = 'signal' | 'pass' | 'blocked' | 'skipped' | 'failover' | 'delivered'

interface PipelineStep {
  num: string
  stage: TranslationMap
  state: StepState
  stateLabel: TranslationMap
  techBadge: ReactNode
  detail: RichCopy
}

interface ScenarioSpec {
  id: ScenarioId
  num: string
  tone: 'sent' | 'suppressed' | 'failover'
  tabTitle: TranslationMap
  statusBadge: RichCopy
  summary: RichCopy
  steps: readonly PipelineStep[]
  previewTitle: TranslationMap
  previewSurface: ReactNode
}

const copy = {
  heading: {
    en: 'Scenario walkthrough: deterministic gate to check-in',
    de: 'Szenario-Walkthrough: vom deterministischen Gate zum Check-in',
    fr: 'Parcours de scénarios : du filtre déterministe au suivi',
    es: 'Recorrido de escenarios: del filtro determinista al seguimiento',
    ar: 'جولة السيناريوهات: من البوابة الحتمية إلى رسالة المتابعة',
  },
  honestBadge: {
    en: 'Illustrative walkthrough · Invitation-only beta',
    de: 'Illustrativer Walkthrough · Beta nur mit Einladung',
    fr: 'Parcours illustratif · Bêta sur invitation',
    es: 'Recorrido ilustrativo · Beta por invitación',
    ar: 'عرض توضيحي · نسخة تجريبية بالدعوة',
  },
  intro: {
    en: 'Select a runtime scenario to inspect how Sihem evaluates schedule changes and routine triggers in deterministic TypeScript/Deno rules before calling a language model.',
    de: 'Wähle ein Laufzeitszenario, um zu prüfen, wie Sihem Kalenderänderungen und Routinen mit deterministischen TypeScript/Deno-Regeln auswertet, bevor ein Sprachmodell aufgerufen wird.',
    fr: 'Sélectionnez un scénario pour observer comment Sihem évalue les changements d’agenda et les routines via des règles déterministes TypeScript/Deno avant tout appel au modèle.',
    es: 'Selecciona un escenario para inspeccionar cómo Sihem evalúa cambios de agenda y rutinas mediante reglas deterministas en TypeScript/Deno antes de invocar un modelo de lenguaje.',
    ar: 'اختر سيناريو تشغيل لمعاينة كيف يقيّم Sihem تغيّرات الجدول ومحفزات الروتين بقواعد حتمية قبل استدعاء أي نموذج لغوي.',
  },
  tablistAria: {
    en: 'Sihem architecture scenarios',
    de: 'Sihem-Architekturszenarien',
    fr: 'Scénarios d’architecture Sihem',
    es: 'Escenarios de arquitectura de Sihem',
    ar: 'سيناريوهات معمارية \u2066Sihem\u2069',
  },
  pipelineHeading: {
    en: 'Pipeline trace',
    de: 'Pipeline-Ablauf',
    fr: 'Trace du pipeline',
    es: 'Traza del pipeline',
    ar: 'مسار المعالجة',
  },
  previewEyebrow: {
    en: 'Illustrative UI preview · Not an unedited screenshot',
    de: 'Illustrative UI-Vorschau · Kein unbearbeiteter Screenshot',
    fr: 'Aperçu UI illustratif · Non issu d’une capture brute',
    es: 'Vista previa ilustrativa · No es captura sin editar',
    ar: 'معاينة واجهة توضيحية · ليست لقطة شاشة حية',
  },
  stageSignal: {
    en: 'Signal',
    de: 'Signal',
    fr: 'Signal',
    es: 'Señal',
    ar: 'الإشارة',
  },
  stageArbiter: {
    en: 'Deterministic Arbiter',
    de: 'Deterministischer Arbiter',
    fr: 'Arbitre déterministe',
    es: 'Árbitro determinista',
    ar: 'المحكّم الحتمي',
  },
  stageComposer: {
    en: 'Composer & Routing',
    de: 'Komponist & Routing',
    fr: 'Compositeur & routage',
    es: 'Compositor y enrutamiento',
    ar: 'المؤلّف والتوجيه',
  },
  stageDelivery: {
    en: 'Client Surface',
    de: 'Client-Ausgabe',
    fr: 'Surface client',
    es: 'Superficie cliente',
    ar: 'واجهة التسليم',
  },
  stateIngested: {
    en: 'Ingested',
    de: 'Erfasst',
    fr: 'Ingéré',
    es: 'Ingerido',
    ar: 'تم الاستقبال',
  },
  statePassed: {
    en: 'Passed',
    de: 'Freigegeben',
    fr: 'Validé',
    es: 'Aprobado',
    ar: 'تمت الإجازة',
  },
  stateBlocked: {
    en: 'Blocked',
    de: 'Blockiert',
    fr: 'Bloqué',
    es: 'Bloqueado',
    ar: 'تم الحجب',
  },
  stateSkipped: {
    en: 'Bypassed',
    de: 'Übersprungen',
    fr: 'Ignoré',
    es: 'Omitido',
    ar: 'تم التجاوز',
  },
  stateFailover: {
    en: 'Rerouted',
    de: 'Umgeleitet',
    fr: 'Basculé',
    es: 'Conmutado',
    ar: 'تبديل تلقائي',
  },
  stateDelivered: {
    en: 'Delivered',
    de: 'Zugestellt',
    fr: 'Livré',
    es: 'Entregado',
    ar: 'تم التسليم',
  },
  // Preview card specific labels
  arbiterContextLabel: {
    en: 'Arbiter context passed to composer',
    de: 'Vom Arbiter übergebener Kontext',
    fr: 'Contexte transmis par l’arbitre',
    es: 'Contexto validado por el árbitro',
    ar: 'سياق المحكّم الممرّر للمؤلّف',
  },
  s1ChipSchedule: {
    en: 'Study block moved later',
    de: 'Lernblock nach hinten verschoben',
    fr: 'Créneau d’étude décalé',
    es: 'Bloque de estudio reprogramado',
    ar: 'تأجيل جلسة المذاكرة لوقت لاحق',
  },
  s1ChipGates: {
    en: 'Quiet hours & cooldown clear',
    de: 'Ruhezeit & Cooldown frei',
    fr: 'Heures calmes & délai libres',
    es: 'Horas de silencio y espera libres',
    ar: 'خارج وقت الهدوء وفترة التهدئة',
  },
  s1Bubble: {
    en: 'Your study block moved to later today. Since your afternoon is now open, want to lay out your notes and pick just one focused sub-topic before the new start?',
    de: 'Dein Lernblock wurde auf später heute verschoben. Möchtest du vor dem neuen Start schon kurz deine Notizen bereitlegen und genau ein fokussiertes Teilthema auswählen?',
    fr: 'Ton créneau d’étude a été déplacé plus tard aujourd’hui. Veux-tu simplement préparer tes notes et choisir un seul sous-sujet ciblé avant le nouvel horaire ?',
    es: 'Tu bloque de estudio pasó para más tarde hoy. ¿Quieres dejar listas tus notas y elegir un solo subtema concreto antes del nuevo inicio?',
    ar: 'انتقلت جلسة المذاكرة إلى وقت متأخر اليوم. هل ترغب في تجهيز ملاحظاتك فقط واختيار نقطة فرعية واحدة مركّزة قبل الموعد الجديد؟',
  },
  s1MockAction1: {
    en: 'Pick one topic now',
    de: 'Ein Thema wählen',
    fr: 'Choisir un sujet',
    es: 'Elegir un tema',
    ar: 'اختيار موضوع واحد الآن',
  },
  s1MockAction2: {
    en: 'Keep for new slot',
    de: 'Für neuen Termin lassen',
    fr: 'Garder pour plus tard',
    es: 'Dejar para el nuevo horario',
    ar: 'تأجيل للموعد الجديد',
  },
  s1Footnote: {
    en: 'Deterministic rules decide whether to send; language-model phrasing still requires validation.',
    de: 'Deterministische Regeln steuern den Versand; die LLM-Formulierung erfordert weiterhin Validierung.',
    fr: 'Les règles déterministes décident de l’envoi ; le texte généré reste soumis à validation.',
    es: 'Las reglas deterministas deciden el envío; la redacción del modelo aún requiere validación.',
    ar: 'تحسم القواعد الحتمية قرار الإرسال؛ وتظل صياغة النموذج اللغوي خاضعة للتحقق.',
  },
  s2RowDecision: {
    en: 'Gate verdict',
    de: 'Gate-Entscheidung',
    fr: 'Décision du filtre',
    es: 'Decisión del filtro',
    ar: 'قرار البوابة',
  },
  s2ValDecision: {
    en: 'Suppressed before prompt assembly',
    de: 'Vor Prompt-Aufbau unterdrückt',
    fr: 'Bloqué avant assemblage du prompt',
    es: 'Suprimido antes de armar el prompt',
    ar: 'حُجب قبل بناء المطالبة',
  },
  s2RowRule: {
    en: 'Matched condition',
    de: 'Ausgelöste Regel',
    fr: 'Règle activée',
    es: 'Regla activada',
    ar: 'القاعدة المطابقة',
  },
  s2ValRule: {
    en: 'Configured quiet / focus window or active cooldown',
    de: 'Konfiguriertes Ruhe-/Fokusfenster oder aktiver Cooldown',
    fr: 'Plage calme / focus configurée ou délai actif',
    es: 'Ventana de silencio / enfoque o espera activa',
    ar: 'نافذة هدوء/تركيز مفعّلة أو فترة تهدئة نشطة',
  },
  s2RowCalls: {
    en: 'Model invocations',
    de: 'Modellaufrufe',
    fr: 'Appels modèle',
    es: 'Llamadas al modelo',
    ar: 'استدعاءات النموذج',
  },
  s2RowDelivery: {
    en: 'Notification state',
    de: 'Zustellstatus',
    fr: 'État de notification',
    es: 'Estado de notificación',
    ar: 'حالة الإشعار',
  },
  s2ValDelivery: {
    en: 'Held silently · Re-evaluated on next open window',
    de: 'Still zurückgehalten · Prüfung im nächsten offenen Fenster',
    fr: 'Retenu en silence · Réévalué au prochain créneau ouvert',
    es: 'Retenido en silencio · Se reevalúa en la próxima ventana abierta',
    ar: 'معلّق بصمت · يعاد تقييمه في النافذة المسموحة التالية',
  },
  s2Footnote: {
    en: 'Enforcing silence in code avoids spending tokens or trusting a prompt instruction not to interrupt.',
    de: 'Code-seitige Sperren verhindern Token-Verbrauch, statt einer Prompt-Anweisung zum Nicht-Stören zu vertrauen.',
    fr: 'Bloquer dans le code évite tout coût de tokens au lieu de demander au prompt de ne pas interrompre.',
    es: 'Bloquear en código evita consumir tokens en lugar de pedirle a un prompt que no interrumpa.',
    ar: 'يمنع الحجب البرمجي استهلاك التوكن بدلاً من الاعتماد على تعليمة نصية للنموذج بعدم المقاطعة.',
  },
  s3Attempt1Label: {
    en: 'Attempt 1 · Primary provider',
    de: 'Versuch 1 · Primärer Anbieter',
    fr: 'Tentative 1 · Fournisseur principal',
    es: 'Intento 1 · Proveedor principal',
    ar: 'المحاولة 1 · المزوّد الأساسي',
  },
  s3Attempt1State: {
    en: 'Timeout / upstream error',
    de: 'Timeout / Upstream-Fehler',
    fr: 'Expiration / erreur amont',
    es: 'Timeout / error de origen',
    ar: 'انتهاء المهلة / خطأ من المصدر',
  },
  s3Attempt2Label: {
    en: 'Attempt 2 · Backup provider (same arbiter payload)',
    de: 'Versuch 2 · Backup-Anbieter (identisches Arbiter-Payload)',
    fr: 'Tentative 2 · Fournisseur de secours (même charge arbitre)',
    es: 'Intento 2 · Proveedor de respaldo (mismo payload del árbitro)',
    ar: 'المحاولة 2 · المزوّد الاحتياطي (نفس حمولة المحكّم)',
  },
  s3Attempt2State: {
    en: 'Composed & delivered',
    de: 'Formuliert & zugestellt',
    fr: 'Rédigé & livré',
    es: 'Redactado y entregado',
    ar: 'تمت الصياغة والتسليم',
  },
  s3Bubble: {
    en: 'Evening routine check-in: today’s shifted study session is wrapped. Want to log one brief takeaway and set tomorrow’s first small step?',
    de: 'Abend-Check-in: Deine verschobene Lerneinheit für heute ist abgeschlossen. Möchtest du kurz ein Fazit festhalten und den ersten kleinen Schritt für morgen wählen?',
    fr: 'Suivi du soir : la séance d’étude décalée d’aujourd’hui est terminée. Veux-tu noter un court bilan et définir la première étape de demain ?',
    es: 'Seguimiento nocturno: la sesión de estudio reprogramada de hoy terminó. ¿Quieres anotar una breve conclusión y elegir el primer paso de mañana?',
    ar: 'متابعة المساء: انتهت جلسة المذاكرة المعدّلة لليوم. هل تود تدوين خلاصة قصيرة وتحديد أول خطوة بسيطة ليوم غد؟',
  },
  s3Footnote: {
    en: 'Failover keeps routine check-ins resilient to single-API outages, while adding router and token-accounting complexity.',
    de: 'Failover schützt Routinen vor Einzel-API-Ausfällen, erhöht aber die Komplexität für Routing und Kosten-Tracking.',
    fr: 'La bascule protège la régularité face aux pannes d’une API, au prix d’un routage et d’un suivi de coûts plus complexes.',
    es: 'El respaldo protege la constancia ante caídas de una API, a cambio de mayor complejidad en rutas y registro de costes.',
    ar: 'يحمي التبديل التلقائي استمرارية الروتين عند تعطل واجهة واحدة، مقابل تعقيد إضافي في التوجيه وحساب التكلفة.',
  },
} satisfies Record<string, TranslationMap>

const scenarios: readonly ScenarioSpec[] = [
  {
    id: 'calendar-shift',
    num: '01',
    tone: 'sent',
    tabTitle: {
      en: 'Calendar shift',
      de: 'Kalender-Verschiebung',
      fr: 'Décalage d’agenda',
      es: 'Cambio en calendario',
      ar: 'تغيّر موعد التقويم',
    },
    statusBadge: {
      en: 'Check-in sent',
      de: 'Check-in gesendet',
      fr: 'Suivi envoyé',
      es: 'Seguimiento enviado',
      ar: 'أُرسلت المتابعة',
    },
    summary: {
      en: (
        <>
          A calendar study session shifts later in the day. The deterministic arbiter validates quiet hours, cooldown state, and <bdi dir="ltr">pgvector</bdi> routine preferences under <bdi dir="ltr">Supabase RLS</bdi> before the primary LLM composes an adaptive check-in.
        </>
      ),
      de: (
        <>
          Eine Lerneinheit im Kalender verschiebt sich nach hinten. Der deterministische Arbiter prüft Ruhezeiten, Cooldown und <bdi dir="ltr">pgvector</bdi>-Routinen unter <bdi dir="ltr">Supabase RLS</bdi>, bevor das primäre LLM einen adaptiven Check-in verfasst.
        </>
      ),
      fr: (
        <>
          Une séance d’étude est déplacée plus tard dans l’agenda. L’arbitre déterministe vérifie heures calmes, délai et préférences <bdi dir="ltr">pgvector</bdi> sous <bdi dir="ltr">Supabase RLS</bdi> avant que le LLM principal ne rédige le suivi.
        </>
      ),
      es: (
        <>
          Una sesión de estudio cambia a más tarde en el calendario. El árbitro determinista verifica horas de silencio, espera y preferencias en <bdi dir="ltr">pgvector</bdi> bajo <bdi dir="ltr">Supabase RLS</bdi> antes de que el LLM principal redacte el seguimiento.
        </>
      ),
      ar: (
        <>
          ينتقل موعد جلسة مذاكرة في التقويم إلى وقت متأخر من اليوم. يتحقق المحكّم الحتمي من وقت الهدوء وفترة التهدئة وتفضيلات الروتين في <bdi dir="ltr">pgvector</bdi> ضمن حماية <bdi dir="ltr">Supabase RLS</bdi> قبل أن يصوغ النموذج الأساسي رسالة متابعة متكيّفة.
        </>
      ),
    },
    previewTitle: {
      en: 'Adaptive check-in card',
      de: 'Adaptive Check-in-Karte',
      fr: 'Carte de suivi adaptatif',
      es: 'Tarjeta de seguimiento adaptativo',
      ar: 'بطاقة متابعة متكيّفة',
    },
    previewSurface: <bdi dir="ltr">Telegram + PWA</bdi>,
    steps: [
      {
        num: '01',
        stage: copy.stageSignal,
        state: 'signal',
        stateLabel: copy.stateIngested,
        techBadge: <bdi dir="ltr">Google Calendar</bdi>,
        detail: {
          en: <>Calendar sync detects that a scheduled study block moved later in the day.</>,
          de: <>Der Kalender-Sync erkennt, dass ein geplanter Lernblock auf später am Tag verschoben wurde.</>,
          fr: <>La synchronisation d’agenda détecte le report d’un créneau d’étude plus tard dans la journée.</>,
          es: <>La sincronización del calendario detecta que un bloque de estudio se movió para más tarde.</>,
          ar: <>ترصد مزامنة التقويم انتقال جلسة مذاكرة مجدولة إلى وقت لاحق من اليوم.</>,
        },
      },
      {
        num: '02',
        stage: copy.stageArbiter,
        state: 'pass',
        stateLabel: copy.statePassed,
        techBadge: (
          <>
            <bdi dir="ltr">pgvector</bdi> · <bdi dir="ltr">Supabase RLS</bdi>
          </>
        ),
        detail: {
          en: (
            <>
              Verifies outside quiet hours, confirms cooldown is clear, and retrieves user routine preferences from <bdi dir="ltr">pgvector</bdi> memory under <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          de: (
            <>
              Prüft, dass keine Ruhezeit und kein Cooldown aktiv sind, und lädt Routinen aus dem <bdi dir="ltr">pgvector</bdi>-Gedächtnis unter <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          fr: (
            <>
              Vérifie l’absence d’heures calmes et de délai actif, puis récupère les préférences dans <bdi dir="ltr">pgvector</bdi> sous <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          es: (
            <>
              Confirma que está fuera de horas de silencio y sin espera activa, y recupera preferencias desde <bdi dir="ltr">pgvector</bdi> bajo <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          ar: (
            <>
              يتأكد من عدم وجود وقت هدوء أو فترة تهدئة نشطة، ويسترجع تفضيلات الروتين من ذاكرة <bdi dir="ltr">pgvector</bdi> تحت سياسات <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
        },
      },
      {
        num: '03',
        stage: copy.stageComposer,
        state: 'pass',
        stateLabel: copy.statePassed,
        techBadge: <bdi dir="ltr">GLM / Gemini / Groq</bdi>,
        detail: {
          en: <>Primary LLM receives the structured arbiter payload and composes a concise check-in proposing one manageable next step.</>,
          de: <>Das primäre LLM erhält das strukturierte Arbiter-Payload und formuliert einen knappen Check-in mit einem machbaren nächsten Schritt.</>,
          fr: <>Le LLM principal reçoit le contexte structuré et rédige un message concis proposant une seule prochaine étape accessible.</>,
          es: <>El LLM principal recibe el contexto estructurado y redacta un mensaje breve proponiendo un único siguiente paso manejable.</>,
          ar: <>يستلم النموذج الأساسي حمولة المحكّم المنظّمة ويصوغ رسالة موجزة تقترح خطوة تالية واحدة قابلة للتنفيذ.</>,
        },
      },
      {
        num: '04',
        stage: copy.stageDelivery,
        state: 'delivered',
        stateLabel: copy.stateDelivered,
        techBadge: <bdi dir="ltr">Telegram + PWA</bdi>,
        detail: {
          en: (
            <>
              Dispatches the check-in across <bdi dir="ltr">Telegram + PWA</bdi> (<bdi dir="ltr">@sihem_ai_bot</bdi>) and records per-interaction token usage.
            </>
          ),
          de: (
            <>
              Stellt den Check-in über <bdi dir="ltr">Telegram + PWA</bdi> (<bdi dir="ltr">@sihem_ai_bot</bdi>) zu und protokolliert den Token-Verbrauch pro Interaktion.
            </>
          ),
          fr: (
            <>
              Diffuse le suivi sur <bdi dir="ltr">Telegram + PWA</bdi> (<bdi dir="ltr">@sihem_ai_bot</bdi>) et enregistre le coût en tokens de l’interaction.
            </>
          ),
          es: (
            <>
              Entrega el seguimiento en <bdi dir="ltr">Telegram + PWA</bdi> (<bdi dir="ltr">@sihem_ai_bot</bdi>) y registra el coste de tokens por interacción.
            </>
          ),
          ar: (
            <>
              يرسل المتابعة عبر <bdi dir="ltr">Telegram + PWA</bdi> (<bdi dir="ltr">@sihem_ai_bot</bdi>) ويسجّل تكلفة التوكن لكل تفاعل.
            </>
          ),
        },
      },
    ],
  },
  {
    id: 'quiet-hours',
    num: '02',
    tone: 'suppressed',
    tabTitle: {
      en: 'Quiet-hours / cooldown gate',
      de: 'Ruhezeit- / Cooldown-Sperre',
      fr: 'Filtre heures calmes / délai',
      es: 'Filtro de silencio / espera',
      ar: 'حاجز الهدوء وفترة التهدئة',
    },
    statusBadge: {
      en: (
        <>
          Suppressed · <bdi dir="ltr">0 LLM calls</bdi>
        </>
      ),
      de: (
        <>
          Unterdrückt · <bdi dir="ltr">0 LLM calls</bdi>
        </>
      ),
      fr: (
        <>
          Bloqué · <bdi dir="ltr">0 LLM calls</bdi>
        </>
      ),
      es: (
        <>
          Suprimido · <bdi dir="ltr">0 LLM calls</bdi>
        </>
      ),
      ar: (
        <>
          تم الحجب · <bdi dir="ltr">0 LLM calls</bdi>
        </>
      ),
    },
    summary: {
      en: (
        <>
          A routine trigger fires during a configured focus/quiet window or active cooldown. The <bdi dir="ltr">TypeScript / Deno</bdi> arbiter blocks it deterministically with <bdi dir="ltr">0 LLM calls</bdi> instead of relying on a prompt instruction not to interrupt.
        </>
      ),
      de: (
        <>
          Ein Routine-Trigger feuert während eines Fokus-/Ruhefensters oder aktiven Cooldowns. Der <bdi dir="ltr">TypeScript / Deno</bdi>-Arbiter blockiert ihn deterministisch mit <bdi dir="ltr">0 LLM calls</bdi>, statt einer Prompt-Anweisung zu vertrauen.
        </>
      ),
      fr: (
        <>
          Un déclencheur de routine survient pendant une plage calme ou un délai actif. L’arbitre <bdi dir="ltr">TypeScript / Deno</bdi> bloque l’exécution de façon déterministe (<bdi dir="ltr">0 LLM calls</bdi>) sans dépendre d’une consigne de prompt.
        </>
      ),
      es: (
        <>
          Un disparador de rutina se activa durante una ventana de silencio o espera activa. El árbitro en <bdi dir="ltr">TypeScript / Deno</bdi> lo bloquea de forma determinista (<bdi dir="ltr">0 LLM calls</bdi>) sin depender de una instrucción en el prompt.
        </>
      ),
      ar: (
        <>
          ينطلق محفّز روتيني أثناء نافذة تركيز/هدوء مفعّلة أو فترة تهدئة نشطة. يحجبه المحكّم البرمجي في <bdi dir="ltr">TypeScript / Deno</bdi> حتمياً (<bdi dir="ltr">0 LLM calls</bdi>) دون الاعتماد على مطالبة نصية بعدم المقاطعة.
        </>
      ),
    },
    previewTitle: {
      en: 'Inspectable suppression state',
      de: 'Prüfbarer Unterdrückungsstatus',
      fr: 'État de blocage inspectable',
      es: 'Estado de supresión inspeccionable',
      ar: 'حالة حجب قابلة للفحص',
    },
    previewSurface: <bdi dir="ltr">Deno / TypeScript</bdi>,
    steps: [
      {
        num: '01',
        stage: copy.stageSignal,
        state: 'signal',
        stateLabel: copy.stateIngested,
        techBadge: <bdi dir="ltr">pg_cron</bdi>,
        detail: {
          en: <>Scheduled habit or routine check trigger fires during a configured focus/quiet window or active cooldown.</>,
          de: <>Ein geplanter Gewohnheits- oder Routine-Trigger feuert während eines konfigurierten Fokus-/Ruhefensters oder Cooldowns.</>,
          fr: <>Un déclencheur planifié s’active pendant une plage de concentration / calme ou une période de délai actif.</>,
          es: <>Un disparador programado de rutina se activa durante una ventana de enfoque/silencio o un periodo de espera activo.</>,
          ar: <>ينطلق محفّز روتيني مجدول أثناء نافذة تركيز/هدوء مخصّصة أو خلال فترة تهدئة نشطة.</>,
        },
      },
      {
        num: '02',
        stage: copy.stageArbiter,
        state: 'blocked',
        stateLabel: copy.stateBlocked,
        techBadge: (
          <>
            <bdi dir="ltr">Deno / TypeScript</bdi> · <bdi dir="ltr">0 LLM calls</bdi>
          </>
        ),
        detail: {
          en: (
            <>
              Deterministic rule gate halts execution before any model request (<bdi dir="ltr">0 LLM calls</bdi>) and logs an inspectable suppression reason.
            </>
          ),
          de: (
            <>
              Das deterministische Regel-Gate stoppt die Ausführung vor jedem Modellaufruf (<bdi dir="ltr">0 LLM calls</bdi>) und speichert den Sperrgrund prüfbar.
            </>
          ),
          fr: (
            <>
              Le filtre déterministe arrête l’exécution avant tout appel au modèle (<bdi dir="ltr">0 LLM calls</bdi>) et journalise un motif vérifiable.
            </>
          ),
          es: (
            <>
              La compuerta determinista detiene la ejecución antes de cualquier llamada al modelo (<bdi dir="ltr">0 LLM calls</bdi>) y registra la causa inspeccionable.
            </>
          ),
          ar: (
            <>
              توقف البوابة الحتمية التنفيذ قبل أي طلب للنموذج (<bdi dir="ltr">0 LLM calls</bdi>) وتسجّل سبب الحجب بشكل قابل للمراجعة.
            </>
          ),
        },
      },
      {
        num: '03',
        stage: copy.stageComposer,
        state: 'skipped',
        stateLabel: copy.stateSkipped,
        techBadge: <bdi dir="ltr">0 LLM calls</bdi>,
        detail: {
          en: <>Composer and router are never invoked — no prompt construction and zero external API spend.</>,
          de: <>Komponist und Router werden nicht aufgerufen — kein Prompt-Aufbau und keine externen API-Kosten.</>,
          fr: <>Le compositeur et le routeur ne sont jamais appelés — aucun prompt assemblé ni dépense API.</>,
          es: <>El compositor y el enrutador no se invocan — sin construcción de prompt ni gasto de API externa.</>,
          ar: <>لا يُستدعى المؤلّف ولا الموجّه إطلاقاً — بلا بناء مطالبة وبلا استهلاك لواجهات النماذج الخارجية.</>,
        },
      },
      {
        num: '04',
        stage: copy.stageDelivery,
        state: 'skipped',
        stateLabel: copy.stateSkipped,
        techBadge: <bdi dir="ltr">Telegram + PWA</bdi>,
        detail: {
          en: (
            <>
              <bdi dir="ltr">Telegram + PWA</bdi> remain silent; the routine item stays eligible for the next permitted window.
            </>
          ),
          de: (
            <>
              <bdi dir="ltr">Telegram + PWA</bdi> bleiben stumm; der Routinepunkt wird im nächsten erlaubten Zeitfenster erneut geprüft.
            </>
          ),
          fr: (
            <>
              <bdi dir="ltr">Telegram + PWA</bdi> restent silencieux ; la routine sera réévaluée lors du prochain créneau autorisé.
            </>
          ),
          es: (
            <>
              <bdi dir="ltr">Telegram + PWA</bdi> permanecen en silencio; la rutina queda pendiente para la siguiente ventana permitida.
            </>
          ),
          ar: (
            <>
              تبقى قنوات <bdi dir="ltr">Telegram + PWA</bdi> صامتة، ويظل عنصر الروتين مؤهّلاً للتقييم في النافذة المسموحة التالية.
            </>
          ),
        },
      },
    ],
  },
  {
    id: 'provider-failover',
    num: '03',
    tone: 'failover',
    tabTitle: {
      en: 'Provider timeout failover',
      de: 'Anbieter-Timeout & Failover',
      fr: 'Expiration & bascule LLM',
      es: 'Timeout y respaldo LLM',
      ar: 'تجاوز مهلة المزوّد والتبديل',
    },
    statusBadge: {
      en: 'Failover · Delivered',
      de: 'Failover · Zugestellt',
      fr: 'Bascule · Livré',
      es: 'Respaldo · Entregado',
      ar: 'تبديل المزوّد · تم التسليم',
    },
    summary: {
      en: (
        <>
          A scheduled morning or evening routine check-in passes the deterministic arbiter. When the primary LLM provider times out, the multi-provider router fails over to a backup provider with the exact same upstream arbiter payload and delivers across <bdi dir="ltr">Telegram + PWA</bdi>.
        </>
      ),
      de: (
        <>
          Ein geplanter Morgen- oder Abend-Check-in passiert den deterministischen Arbiter. Bei einem Timeout des primären LLM-Anbieters wechselt der Router mit identischem Arbiter-Payload zum Backup-Anbieter und liefert über <bdi dir="ltr">Telegram + PWA</bdi> aus.
        </>
      ),
      fr: (
        <>
          Un suivi matinal ou du soir franchit l’arbitre déterministe. Lorsque le fournisseur LLM principal expire, le routeur bascule vers un fournisseur de secours avec la même charge amont et livre sur <bdi dir="ltr">Telegram + PWA</bdi>.
        </>
      ),
      es: (
        <>
          Un seguimiento matutino o nocturno supera el árbitro determinista. Si el proveedor LLM principal agota el tiempo, el enrutador conmuta a un proveedor de respaldo con el mismo payload validado y entrega en <bdi dir="ltr">Telegram + PWA</bdi>.
        </>
      ),
      ar: (
        <>
          تجتاز متابعة صباحية أو مسائية مجدولة المحكّم الحتمي. وعند انتهاء مهلة مزوّد النموذج الأساسي، ينتقل الموجّه تلقائياً إلى مزوّد احتياطي بنفس حمولة المحكّم وقيوده ويسلّم الرسالة عبر <bdi dir="ltr">Telegram + PWA</bdi>.
        </>
      ),
    },
    previewTitle: {
      en: 'Failover route & delivered card',
      de: 'Failover-Route & zugestellte Karte',
      fr: 'Route de bascule & carte livrée',
      es: 'Ruta de respaldo y tarjeta entregada',
      ar: 'مسار التبديل وبطاقة التسليم',
    },
    previewSurface: <bdi dir="ltr">GLM / Gemini / Groq → Telegram + PWA</bdi>,
    steps: [
      {
        num: '01',
        stage: copy.stageSignal,
        state: 'signal',
        stateLabel: copy.stateIngested,
        techBadge: <bdi dir="ltr">pg_cron</bdi>,
        detail: {
          en: <>Scheduled morning briefing or evening review window opens and triggers the edge pipeline.</>,
          de: <>Das geplante Zeitfenster für Morgenbriefing oder Abendrückblick öffnet sich und startet die Edge-Pipeline.</>,
          fr: <>Le créneau planifié du briefing matinal ou du bilan du soir s’ouvre et déclenche le pipeline.</>,
          es: <>Se abre la ventana programada de resumen matutino o revisión nocturna y activa el pipeline.</>,
          ar: <>تُفتح نافذة الموجز الصباحي أو المراجعة المسائية المجدولة وتُطلق مسار المعالجة.</>,
        },
      },
      {
        num: '02',
        stage: copy.stageArbiter,
        state: 'pass',
        stateLabel: copy.statePassed,
        techBadge: (
          <>
            <bdi dir="ltr">pgvector</bdi> · <bdi dir="ltr">Supabase RLS</bdi>
          </>
        ),
        detail: {
          en: (
            <>
              Arbiter validates schedule rules and assembles the immutable context payload from <bdi dir="ltr">pgvector</bdi> under <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          de: (
            <>
              Der Arbiter bestätigt die Zeitplanregeln und erstellt das unveränderliche Kontext-Payload aus <bdi dir="ltr">pgvector</bdi> unter <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          fr: (
            <>
              L’arbitre valide les règles horaires et fige le contexte issu de <bdi dir="ltr">pgvector</bdi> sous <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          es: (
            <>
              El árbitro valida las reglas horarias y fija el payload contextual desde <bdi dir="ltr">pgvector</bdi> bajo <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
          ar: (
            <>
              يتحقق المحكّم من قواعد الجدولة ويجهّز حمولة السياق الثابتة من <bdi dir="ltr">pgvector</bdi> ضمن <bdi dir="ltr">Supabase RLS</bdi>.
            </>
          ),
        },
      },
      {
        num: '03',
        stage: copy.stageComposer,
        state: 'failover',
        stateLabel: copy.stateFailover,
        techBadge: <bdi dir="ltr">GLM → Gemini / Groq</bdi>,
        detail: {
          en: <>Primary LLM provider times out or errors; router retries on a backup provider while preserving the exact same upstream arbiter payload and constraints.</>,
          de: <>Primärer LLM-Anbieter meldet Timeout oder Fehler; der Router wechselt mit exakt demselben Arbiter-Payload samt Randbedingungen auf ein Backup-Modell.</>,
          fr: <>Le fournisseur principal expire ou échoue ; le routeur bascule vers un modèle de secours en conservant exactement la même charge et les mêmes contraintes.</>,
          es: <>El proveedor principal falla o agota el tiempo; el enrutador reintenta en un proveedor de respaldo manteniendo exactamente el mismo payload y restricciones.</>,
          ar: <>تنتهي مهلة المزوّد الأساسي أو يرجع خطأ؛ فيعيد الموجّه المحاولة عبر مزوّد احتياطي مع الحفاظ على نفس حمولة المحكّم والقيود تماماً.</>,
        },
      },
      {
        num: '04',
        stage: copy.stageDelivery,
        state: 'delivered',
        stateLabel: copy.stateDelivered,
        techBadge: <bdi dir="ltr">Telegram + PWA</bdi>,
        detail: {
          en: (
            <>
              Delivers the composed check-in across <bdi dir="ltr">Telegram + PWA</bdi> without dropping the routine window, logging the fallback provider route.
            </>
          ),
          de: (
            <>
              Liefert den Check-in ohne Unterbrechung der Routine über <bdi dir="ltr">Telegram + PWA</bdi> aus und protokolliert die genutzte Backup-Route.
            </>
          ),
          fr: (
            <>
              Livre le suivi sur <bdi dir="ltr">Telegram + PWA</bdi> sans manquer le créneau de routine et journalise la route de secours utilisée.
            </>
          ),
          es: (
            <>
              Entrega el seguimiento en <bdi dir="ltr">Telegram + PWA</bdi> sin perder la ventana de rutina y registra el proveedor de respaldo empleado.
            </>
          ),
          ar: (
            <>
              يسلّم رسالة المتابعة عبر <bdi dir="ltr">Telegram + PWA</bdi> دون تفويت نافذة الروتين مع تسجيل مسار المزوّد الاحتياطي.
            </>
          ),
        },
      },
    ],
  },
]

export default function SihemWalkthrough() {
  const { lang, t } = useI18n()
  const [activeId, setActiveId] = useState<ScenarioId>('calendar-shift')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = scenarios.length
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
    const nextScenario = scenarios[nextIndex]
    setActiveId(nextScenario.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      className="portfolio-case-section sihem-wt-section"
      id="walkthrough"
      aria-labelledby="sihem-walkthrough-title"
    >
      <div className="sihem-wt-header">
        <div className="sihem-wt-title-row">
          <h2 id="sihem-walkthrough-title">{t(copy.heading)}</h2>
          <span className="sihem-wt-honest-badge">
            <span className="sihem-wt-honest-dot" aria-hidden="true" />
            <span>{t(copy.honestBadge)}</span>
          </span>
        </div>
        <p className="sihem-wt-intro">{t(copy.intro)}</p>
      </div>

      <div className="sihem-wt-frame">
        <div
          role="tablist"
          aria-label={t(copy.tablistAria)}
          className="sihem-wt-rail"
        >
          {scenarios.map((scenario, index) => {
            const isSelected = scenario.id === activeId
            return (
              <button
                key={scenario.id}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`sihem-wt-tab-${scenario.id}`}
                aria-selected={isSelected}
                aria-controls={`sihem-wt-panel-${scenario.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={`sihem-wt-tab sihem-wt-tab--${scenario.tone}${isSelected ? ' is-active' : ''}`}
                onClick={() => setActiveId(scenario.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span className="sihem-wt-tab-top">
                  <span className="sihem-wt-tab-num">
                    <bdi dir="ltr">{scenario.num}</bdi>
                  </span>
                  <span className="sihem-wt-tab-title">{t(scenario.tabTitle)}</span>
                </span>
                <span className={`sihem-wt-chip sihem-wt-chip--${scenario.tone}`}>
                  {scenario.statusBadge[lang]}
                </span>
              </button>
            )
          })}
        </div>

        {scenarios.map((scenario) => {
          const isSelected = scenario.id === activeId
          return (
            <div
              key={scenario.id}
              role="tabpanel"
              id={`sihem-wt-panel-${scenario.id}`}
              aria-labelledby={`sihem-wt-tab-${scenario.id}`}
              hidden={!isSelected}
              className="sihem-wt-panel"
            >
              <p className="sihem-wt-summary">{scenario.summary[lang]}</p>

              <div className="sihem-wt-grid">
                <div className="sihem-wt-trace">
                  <h3 className="sihem-wt-subhead">{t(copy.pipelineHeading)}</h3>
                  <ol className="sihem-wt-steps">
                    {scenario.steps.map((step) => (
                      <li
                        key={step.num}
                        className={`sihem-wt-step sihem-wt-step--${step.state}`}
                      >
                        <div className="sihem-wt-step-head">
                          <span className="sihem-wt-step-title">
                            <span className="sihem-wt-step-num">
                              <bdi dir="ltr">{step.num}</bdi>
                            </span>
                            <span>{t(step.stage)}</span>
                          </span>
                          <span className={`sihem-wt-state sihem-wt-state--${step.state}`}>
                            {t(step.stateLabel)}
                          </span>
                        </div>
                        <p className="sihem-wt-step-detail">{step.detail[lang]}</p>
                        <span className="sihem-wt-step-tech">{step.techBadge}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="sihem-wt-preview">
                  <div className="sihem-wt-preview-head">
                    <span className="sihem-wt-preview-eyebrow">
                      {t(copy.previewEyebrow)}
                    </span>
                    <div className="sihem-wt-preview-bar">
                      <h3 className="sihem-wt-preview-title">{t(scenario.previewTitle)}</h3>
                      <span className="sihem-wt-preview-surface">{scenario.previewSurface}</span>
                    </div>
                  </div>

                  {scenario.id === 'calendar-shift' && (
                    <div className="sihem-wt-preview-body">
                      <div className="sihem-wt-context-box">
                        <span className="sihem-wt-context-label">{t(copy.arbiterContextLabel)}</span>
                        <div className="sihem-wt-context-tags">
                          <span className="sihem-wt-tag">{t(copy.s1ChipSchedule)}</span>
                          <span className="sihem-wt-tag">{t(copy.s1ChipGates)}</span>
                          <span className="sihem-wt-tag">
                            <bdi dir="ltr">pgvector</bdi> + <bdi dir="ltr">Supabase RLS</bdi>
                          </span>
                        </div>
                      </div>

                      <div className="sihem-wt-card">
                        <div className="sihem-wt-card-meta">
                          <span className="sihem-wt-bot-name">
                            <bdi dir="ltr">Sihem · @sihem_ai_bot</bdi>
                          </span>
                          <span className="sihem-wt-chip sihem-wt-chip--sent">
                            {scenario.statusBadge[lang]}
                          </span>
                        </div>
                        <p className="sihem-wt-card-msg">{t(copy.s1Bubble)}</p>
                        <div className="sihem-wt-mock-actions" aria-hidden="true">
                          <span className="sihem-wt-mock-pill">{t(copy.s1MockAction1)}</span>
                          <span className="sihem-wt-mock-pill">{t(copy.s1MockAction2)}</span>
                        </div>
                      </div>

                      <p className="sihem-wt-footnote">{t(copy.s1Footnote)}</p>
                    </div>
                  )}

                  {scenario.id === 'quiet-hours' && (
                    <div className="sihem-wt-preview-body">
                      <dl className="sihem-wt-kv">
                        <div className="sihem-wt-kv-row">
                          <dt>{t(copy.s2RowDecision)}</dt>
                          <dd className="sihem-wt-kv-strong sihem-wt-kv-strong--warn">
                            {t(copy.s2ValDecision)}
                          </dd>
                        </div>
                        <div className="sihem-wt-kv-row">
                          <dt>{t(copy.s2RowRule)}</dt>
                          <dd>{t(copy.s2ValRule)}</dd>
                        </div>
                        <div className="sihem-wt-kv-row">
                          <dt>{t(copy.s2RowCalls)}</dt>
                          <dd className="sihem-wt-kv-mono">
                            <bdi dir="ltr">0 LLM calls</bdi>
                          </dd>
                        </div>
                        <div className="sihem-wt-kv-row">
                          <dt>{t(copy.s2RowDelivery)}</dt>
                          <dd>{t(copy.s2ValDelivery)}</dd>
                        </div>
                      </dl>

                      <p className="sihem-wt-footnote">{t(copy.s2Footnote)}</p>
                    </div>
                  )}

                  {scenario.id === 'provider-failover' && (
                    <div className="sihem-wt-preview-body">
                      <ol className="sihem-wt-routes">
                        <li className="sihem-wt-route sihem-wt-route--warn">
                          <span className="sihem-wt-route-label">{t(copy.s3Attempt1Label)}</span>
                          <span className="sihem-wt-route-badge sihem-wt-route-badge--warn">
                            {t(copy.s3Attempt1State)}
                          </span>
                        </li>
                        <li className="sihem-wt-route sihem-wt-route--ok">
                          <span className="sihem-wt-route-label">{t(copy.s3Attempt2Label)}</span>
                          <span className="sihem-wt-route-badge sihem-wt-route-badge--ok">
                            {t(copy.s3Attempt2State)}
                          </span>
                        </li>
                      </ol>

                      <div className="sihem-wt-card">
                        <div className="sihem-wt-card-meta">
                          <span className="sihem-wt-bot-name">
                            <bdi dir="ltr">Telegram + PWA</bdi>
                          </span>
                          <span className="sihem-wt-chip sihem-wt-chip--failover">
                            {scenario.statusBadge[lang]}
                          </span>
                        </div>
                        <p className="sihem-wt-card-msg">{t(copy.s3Bubble)}</p>
                      </div>

                      <p className="sihem-wt-footnote">{t(copy.s3Footnote)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
