import { type Language } from '@/lib/i18n-config'
import type { BlogFaqItem, BlogCitation } from './blog-posts-meta'

export type { BlogFaqItem, BlogCitation }

export interface BlogPostTranslation {
  title: string
  excerpt: string
  tags: string[]
  content: string
  readingTime: string
  faq: BlogFaqItem[]
}

export interface BlogPost {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
  citation?: BlogCitation
  translations: Record<Language, BlogPostTranslation>
}

export interface LocalizedBlogPost extends BlogPostTranslation {
  slug: string
  date: string
  ogImage?: string
  lastModified?: string
  citation?: BlogCitation
}

const blogPosts: BlogPost[] = [
  {
    slug: 'deterministic-guardrails-for-llm-and-agent-systems',
    date: '2026-11-25',
    ogImage: '/og-deterministic-guardrails.png',
    lastModified: '2026-11-25',
    translations: {
      en: {
        title: "Deterministic Guardrails for LLM and Agent Systems: Sihem's Arbiter and mergeproof",
        excerpt:
          "Why probabilistic language models need deterministic boundaries around scheduling, state, and verification—illustrated through Sihem's generators-arbiter-composer pipeline and mergeproof's zero-LLM pull-request gate.",
        tags: ['Agentic AI', 'LLM Systems', 'Deterministic Guardrails', 'Sihem', 'mergeproof', 'Supabase'],
        readingTime: '9 min read',
        faq: [
          {
            question: 'How does Sihem separate deterministic decisions from LLM generation?',
            answer:
              'Sihem splits execution into generators, a deterministic arbiter, and a composer. Deterministic scheduling and trigger rules evaluate calendar shifts and routines before an LLM composes the Telegram or PWA check-in.',
          },
          {
            question: 'What stage is Sihem currently in?',
            answer:
              'Sihem is in invitation-only beta on Telegram (@sihem_ai_bot) and an installable PWA (sihem-pwa.pages.dev) within the tech2b incubator in Linz, alongside a native Android client (Kotlin/Jetpack Compose) in private testing.',
          },
          {
            question: 'What does mergeproof check, and what are its limits?',
            answer:
              'mergeproof (@ahmed-3m/mergeproof, zero dependencies, MIT) checks AI-written pull requests against configured deterministic merge requirements—such as flagging modified existing tests for human review—with 0 LLM calls. Passing deterministic checks does not guarantee defect-free code.',
          },
        ],
        content: `
## The Reliability Gap in LLM and Agent Workflows

Probabilistic models excel at messy interfaces: summarizing a shifting schedule, adapting tone to a tired user, or drafting a pull request across unfamiliar files. What they are poor at is enforcing hard invariants consistently over time.

When an assistant decides **whether** to interrupt someone, or an automated reviewer decides **whether** an AI-written patch touches protected tests, letting a language model improvise the rule turns a deterministic policy question into a coin flip.

Across two separate projects—[Sihem](https://ahmed-3m.github.io/case-studies/sihem/) (a proactive habits and planning assistant) and [mergeproof](https://github.com/ahmed-3m/mergeproof) (a zero-dependency pull-request gate)—I reached the same architectural rule: keep the probabilistic model inside the synthesis layer, and wrap state, scheduling, and policy checks in deterministic code.

## Pattern 1: Sihem's Generators → Arbiter → Composer Split

Sihem is an independent personal-mentor project accepted into the **tech2b** incubator in Linz. It is currently running in **invitation-only beta** via a Telegram bot ([t.me/sihem_ai_bot](https://t.me/sihem_ai_bot)) and an installable progressive web app ([sihem-pwa.pages.dev](https://sihem-pwa.pages.dev/)), alongside a native Android client built in Kotlin and Jetpack Compose in private testing.

Early prototypes showed why putting scheduling logic inside a single LLM prompt breaks down: a model cannot reliably track quiet hours, avoid duplicate nudges, or weigh calendar shifts across days from prompt instructions alone.

Instead, Sihem separates proactive outreach into three explicit stages:

\`\`\`text
Signals (calendar, routines, activity logs)
   -> Generators (candidate check-ins)
   -> Deterministic Arbiter (rules, cooldowns, schedule state)
   -> Composer (pgvector RAG + multi-provider LLM)
\`\`\`

### 1. Generators

Scheduled jobs driven by ` + '`pg_cron`' + ` inside Supabase inspect recent activity logs (workouts, medication, study sessions, custom habits, and Google Calendar sync) and propose candidate outreach moments—such as a morning briefing, an evening review, or a check-in after a shifted calendar event.

### 2. Deterministic Arbiter

The arbiter runs as plain TypeScript logic inside **Deno / Supabase Edge Functions** backed by **Supabase PostgreSQL with Row-Level Security (RLS)**. It applies deterministic scheduling and trigger rules before any text is generated:

- Check whether a candidate trigger conflicts with quiet windows, recent check-ins, or already-completed items.
- Enforce per-user isolation through PostgreSQL RLS policies before any context is assembled.
- Suppress redundant notifications so the assistant stays non-spammy even when schedules move repeatedly.

Only candidates that pass the arbiter reach the language model.

### 3. Composer and Multi-Provider Failover

Once the arbiter approves a trigger, the composer retrieves long-term user context from ` + '`pgvector`' + ` RAG memory and drafts the message. Because an outage from a single LLM API breaks daily habit continuity, Sihem routes calls across multiple providers (**GLM**, **Gemini**, and **Groq**) with escalation and automatic failover, optionally generating voice notes via **Cloudflare MeloTTS**.

Even with deterministic scheduling, generated text still requires validation and can contain errors. And because Sihem is in invitation-only beta, I treat cohort testing in Linz as ongoing product validation rather than claiming measured user outcome gains.

## Pattern 2: mergeproof — 0 LLM Calls at Merge Time

The same boundary problem shows up when coding agents open pull requests. Asking an LLM reviewer to verify whether an AI-generated diff obeyed repo rules introduces latency, cost, and non-determinism into a check that should be purely mechanical.

[mergeproof](https://github.com/ahmed-3m/mergeproof) (published on npm as ` + '`@ahmed-3m/mergeproof`' + `, zero dependencies, MIT license) takes the opposite approach:

- **0 LLM calls:** every check runs deterministically against the diff and configured merge requirements.
- **Flagging risky edits:** for example, if an AI-written pull request modifies an existing test file, ` + '`mergeproof`' + ` flags the PR for human review rather than letting a green test suite mask a weakened assertion.
- **Explicit honesty about scope:** passing deterministic merge requirements does **not** guarantee defect-free code; it simply enforces repeatable baseline hygiene before a human spends review time.

## Shared Design Principle

1. **Let deterministic code own policy and timing:** trigger rules, RLS permissions, cooldowns, and diff-level merge gates belong in testable code, not prompts.
2. **Let probabilistic models own synthesis:** natural phrasing, multimodal meal-photo interpretation, and semantic retrieval over ` + '`pgvector`' + ` embeddings are where LLMs add real flexibility.
3. **Design for provider failure:** multi-provider routing with failover keeps user-facing assistants resilient without relaxing the upstream arbiter rules.

Whether the domain is out-of-distribution vision detection or agentic software workflows, reliability comes from knowing where the model's authority stops.
        `,
      },
      de: {
        title: 'Deterministische Guardrails für LLM- und Agentensysteme: Sihems Arbiter und mergeproof',
        excerpt:
          'Warum probabilistische Sprachmodelle deterministische Grenzen bei Zeitplanung, Zustand und Verifikation brauchen – gezeigt an Sihems Generators-Arbiter-Composer-Pipeline und dem LLM-freien PR-Gate mergeproof.',
        tags: ['Agentic AI', 'LLM-Systeme', 'Deterministische Guardrails', 'Sihem', 'mergeproof', 'Supabase'],
        readingTime: '9 Min. Lesezeit',
        faq: [
          {
            question: 'Wie trennt Sihem deterministische Entscheidungen von der LLM-Generierung?',
            answer:
              'Sihem teilt die Ausführung in Generatoren, einen deterministischen Arbiter und einen Komponisten. Deterministische Planungs- und Trigger-Regeln prüfen Kalenderänderungen und Routinen, bevor ein LLM die Telegram- oder PWA-Nachricht formuliert.',
          },
          {
            question: 'In welcher Phase befindet sich Sihem aktuell?',
            answer:
              'Sihem läuft als Beta mit Einladung auf Telegram (@sihem_ai_bot) und als installierbare PWA (sihem-pwa.pages.dev) im tech2b-Inkubator in Linz; ein nativer Android-Client (Kotlin/Jetpack Compose) befindet sich im privaten Test.',
          },
          {
            question: 'Was prüft mergeproof, und wo liegen die Grenzen?',
            answer:
              'mergeproof (@ahmed-3m/mergeproof, ohne Abhängigkeiten, MIT) prüft KI-generierte Pull Requests gegen konfigurierte deterministische Merge-Anforderungen – etwa das Markieren geänderter bestehender Tests zur menschlichen Prüfung – mit 0 LLM-Aufrufen. Bestandene Prüfungen garantieren keinen fehlerfreien Code.',
          },
        ],
        content: `
## Die Zuverlässigkeitslücke in LLM- und Agenten-Workflows

Probabilistische Modelle sind stark an unstrukturierten Schnittstellen: einen verschobenen Tagesplan zusammenfassen, den Ton anpassen oder einen Pull Request über unbekannte Dateien entwerfen. Schwach sind sie darin, harte Invarianten dauerhaft und reproduzierbar durchzusetzen.

Wenn ein Assistent entscheidet, **ob** er jemanden unterbrechen darf, oder ein automatisierter Review-Schritt prüft, **ob** ein KI-Patch bestehende Tests verändert hat, macht ein Sprachmodell aus einer klaren Regel schnell einen Zufallstreffer.

In zwei Projekten – [Sihem](https://ahmed-3m.github.io/case-studies/sihem/) (ein proaktiver Gewohnheits- und Planungsassistent) und [mergeproof](https://github.com/ahmed-3m/mergeproof) (ein Pull-Request-Gate ohne Abhängigkeiten) – hat sich dasselbe Prinzip bewährt: Das probabilistische Modell bleibt in der Syntheseschicht, während Zustand, Zeitplanung und Policy-Prüfungen in deterministischem Code liegen.

## Muster 1: Sihems Trennung in Generatoren → Arbiter → Komponist

Sihem ist ein eigenständiges Nebenprojekt im **tech2b**-Inkubator in Linz. Es läuft aktuell als **Beta mit Einladung** über einen Telegram-Bot ([t.me/sihem_ai_bot](https://t.me/sihem_ai_bot)) und eine installierbare Web-App ([sihem-pwa.pages.dev](https://sihem-pwa.pages.dev/)); zusätzlich befindet sich ein nativer Android-Client in Kotlin und Jetpack Compose im privaten Test.

Frühe Prototypen zeigten, warum Zeitplanlogik nicht in einen einzigen LLM-Prompt gehört: Ein Sprachmodell hält Ruhezeiten, Abkühlphasen gegen Spam oder verschobene Kalendereinträge über mehrere Tage nicht zuverlässig allein über Prompt-Anweisungen ein.

Darum trennt Sihem proaktive Check-ins in drei klar abgegrenzte Stufen:

\`\`\`text
Signale (Kalender, Routinen, Aktivitätslogs)
   -> Generatoren (Kandidaten für Check-ins)
   -> Deterministischer Arbiter (Regeln, Cooldowns, Zeitplan-Zustand)
   -> Komponist (pgvector RAG + Multi-Provider-LLM)
\`\`\`

### 1. Generatoren

Geplante Jobs über ` + '`pg_cron`' + ` in Supabase werten aktuelle Aktivitätsdaten (Workouts, Medikation, Lerneinheiten, individuelle Gewohnheiten und Google-Kalender-Sync) aus und schlagen mögliche Zeitpunkte vor – etwa ein Morgenbriefing, ein Abendreview oder eine Nachfrage nach einem verschobenen Termin.

### 2. Deterministischer Arbiter

Der Arbiter läuft als regulärer TypeScript-Code in **Deno / Supabase Edge Functions** auf Basis von **Supabase PostgreSQL mit Row-Level Security (RLS)**. Er wendet deterministische Planungs- und Trigger-Regeln an, bevor überhaupt Text erzeugt wird:

- Prüfung, ob ein Kandidat mit Ruhezeiten, kürzlichen Check-ins oder bereits erledigten Punkten kollidiert.
- Strikte Datentrennung pro Nutzer durch PostgreSQL-RLS-Regeln vor dem Zusammenstellen des Kontexts.
- Unterdrückung doppelter Impulse, damit der Assistent auch bei häufigen Terminänderungen nicht aufdringlich wird.

Nur freigegebene Kandidaten erreichen das Sprachmodell.

### 3. Komponist und Multi-Provider-Failover

Sobald der Arbiter einen Impuls freigibt, lädt der Komponist langfristigen Kontext aus dem ` + '`pgvector`' + `-RAG-Speicher und formuliert die Nachricht. Da der Ausfall einer einzelnen LLM-API die Kontinuität sofort unterbricht, routet Sihem Anfragen über mehrere Anbieter (**GLM**, **Gemini** und **Groq**) mit Eskalation und automatischem Failover sowie optionaler Sprachausgabe über **Cloudflare MeloTTS**.

Auch mit deterministischer Zeitplanung muss generierter Text validiert werden und kann Fehler enthalten. Da sich Sihem in einer Beta mit Einladung befindet, dienen die Tests in Linz der laufenden Produktvalidierung – ohne vorab gemessene Wirkungskennzahlen zu behaupten.

## Muster 2: mergeproof – 0 LLM-Aufrufe beim Merge

Dasselbe Abgrenzungsproblem entsteht, wenn Coding-Agenten Pull Requests öffnen. Ein LLM zu fragen, ob ein KI-Diff die Repo-Regeln einhält, bringt Latenz, Kosten und Nicht-Determinismus in eine Prüfung, die rein mechanisch sein sollte.

[mergeproof](https://github.com/ahmed-3m/mergeproof) (auf npm als ` + '`@ahmed-3m/mergeproof`' + `, ohne Abhängigkeiten, MIT-Lizenz) geht den umgekehrten Weg:

- **0 LLM-Aufrufe:** Jede Prüfung läuft deterministisch gegen den Diff und die konfigurierten Merge-Anforderungen.
- **Riskante Änderungen markieren:** Ändert ein KI-Pull-Request beispielsweise eine bestehende Testdatei, markiert ` + '`mergeproof`' + ` den PR zur menschlichen Prüfung, statt eine abgeschwächte Assertion hinter grünen Tests zu verbergen.
- **Klare Grenzen:** Bestandene deterministische Prüfungen garantieren **keinen** fehlerfreien Code – sie sichern lediglich wiederholbare Basis-Hygiene vor dem menschlichen Review.

## Gemeinsames Architekturprinzip

1. **Deterministischer Code besitzt Regeln und Timing:** Trigger-Logik, RLS-Berechtigungen, Cooldowns und Diff-Gates gehören in testbaren Code, nicht in Prompts.
2. **Probabilistische Modelle besitzen die Synthese:** Natürliche Formulierungen, multimodale Mahlzeitenfoto-Auswertung und semantische Suche über ` + '`pgvector`' + ` sind die Stärken von LLMs.
3. **Ausfälle einplanen:** Multi-Provider-Routing mit Failover hält Assistenten verfügbar, ohne die vorgelagerten Arbiter-Regeln aufzuweichen.

Ob bei Out-of-Distribution-Erkennung in der Bildverarbeitung oder bei agentischen Workflows: Verlässlichkeit entsteht dort, wo die Zuständigkeit des Modells sauber begrenzt ist.
        `,
      },
      fr: {
        title: "Garde-fous déterministes pour systèmes LLM et agents : l'arbitre de Sihem et mergeproof",
        excerpt:
          "Pourquoi les modèles de langage probabilistes ont besoin de frontières déterministes pour la planification, l'état et la vérification — illustré par l'architecture générateurs-arbitre-compositeur de Sihem et le contrôle de PR sans LLM mergeproof.",
        tags: ['IA agentique', 'Systèmes LLM', 'Garde-fous déterministes', 'Sihem', 'mergeproof', 'Supabase'],
        readingTime: '9 min de lecture',
        faq: [
          {
            question: 'Comment Sihem sépare-t-il les décisions déterministes de la génération LLM ?',
            answer:
              "Sihem sépare l'exécution en générateurs, un arbitre déterministe et un compositeur. Des règles déterministes évaluent les changements d'agenda et les habitudes avant qu'un LLM ne rédige le message Telegram ou PWA.",
          },
          {
            question: 'À quel stade se trouve Sihem actuellement ?',
            answer:
              "Sihem est en bêta sur invitation sur Telegram (@sihem_ai_bot) et en PWA installable (sihem-pwa.pages.dev) au sein de l'incubateur tech2b à Linz, avec un client Android natif (Kotlin/Jetpack Compose) en test privé.",
          },
          {
            question: 'Que vérifie mergeproof et quelles sont ses limites ?',
            answer:
              "mergeproof (@ahmed-3m/mergeproof, zéro dépendance, licence MIT) vérifie les pull requests écrites par IA selon des critères de fusion déterministes — par exemple signaler les tests existants modifiés pour revue humaine — avec 0 appel LLM. Réussir ces vérifications ne garantit pas un code sans défaut.",
          },
        ],
        content: `
## Le déficit de fiabilité dans les workflows LLM et agents

Les modèles probabilistes excellent aux interfaces ambiguës : résumer un emploi du temps mouvant, adapter le ton ou rédiger une pull request dans un dépôt peu familier. En revanche, ils appliquent mal des invariants stricts dans la durée.

Lorsqu'un assistant décide **s'il doit** interrompre quelqu'un, ou qu'un contrôle automatique vérifie **si** un correctif généré par IA modifie des tests existants, confier la règle à un modèle de langage transforme une politique déterministe en tirage aléatoire.

Sur deux projets distincts — [Sihem](https://ahmed-3m.github.io/case-studies/sihem/) (assistant proactif d'habitudes et de planification) et [mergeproof](https://github.com/ahmed-3m/mergeproof) (porte de contrôle de PR sans dépendance) — j'ai appliqué la même séparation : laisser le modèle probabiliste dans la couche de synthèse, et confier l'état, la planification et la conformité à du code déterministe.

## Modèle 1 : la séparation Générateurs → Arbitre → Compositeur de Sihem

Sihem est un projet personnel accepté dans l'incubateur **tech2b** à Linz. Il fonctionne actuellement en **bêta sur invitation** via un bot Telegram ([t.me/sihem_ai_bot](https://t.me/sihem_ai_bot)) et une application web progressive installable ([sihem-pwa.pages.dev](https://sihem-pwa.pages.dev/)), avec un client Android natif en Kotlin et Jetpack Compose en test privé.

Les premiers prototypes ont montré pourquoi la logique de planification ne doit pas vivre dans un prompt unique : un LLM ne garantit pas de manière fiable les plages de calme, la déduplication des rappels ni la gestion des décalages d'agenda sur plusieurs jours.

Sihem découpe donc les relances proactives en trois étapes explicites :

\`\`\`text
Signaux (agenda, routines, journaux d'activité)
   -> Générateurs (candidats de suivi)
   -> Arbitre déterministe (règles, délais, état du planning)
   -> Compositeur (RAG pgvector + LLM multi-fournisseurs)
\`\`\`

### 1. Générateurs

Des tâches planifiées par ` + '`pg_cron`' + ` dans Supabase examinent les journaux récents (entraînements, médication, sessions d'étude, habitudes personnalisées et synchro Google Calendar) et proposent des moments candidats : briefing du matin, bilan du soir ou suivi après le déplacement d'un événement.

### 2. Arbitre déterministe

L'arbitre s'exécute en TypeScript pur dans des **Edge Functions Deno / Supabase** appuyées sur **Supabase PostgreSQL avec Row-Level Security (RLS)**. Il applique des règles déterministes de planification et de déclenchement avant toute génération de texte :

- Vérifier qu'un déclencheur candidat n'entre pas en conflit avec les heures calmes, des rappels récents ou des tâches déjà accomplies.
- Isoler strictement les données par utilisateur via les politiques RLS de PostgreSQL avant d'assembler le contexte.
- Éviter les notifications redondantes même lorsque l'agenda change plusieurs fois de suite.

Seuls les candidats validés par l'arbitre atteignent le modèle de langage.

### 3. Compositeur et basculement multi-fournisseurs

Une fois le déclenchement approuvé, le compositeur récupère le contexte long terme dans la mémoire RAG ` + '`pgvector`' + ` et rédige le message. Comme la panne d'une seule API LLM brise immédiatement la régularité des habitudes, Sihem route les appels entre plusieurs fournisseurs (**GLM**, **Gemini** et **Groq**) avec escalade et basculement automatique, plus des mémos vocaux via **Cloudflare MeloTTS**.

Même avec une planification déterministe, le texte généré doit être validé et peut contenir des erreurs. Et comme Sihem reste en bêta sur invitation, les tests menés à Linz servent à la validation produit en cours, sans revendiquer de gains chiffrés d'impact utilisateur.

## Modèle 2 : mergeproof — 0 appel LLM au moment de la fusion

Le même problème de frontière apparaît lorsque des agents de code ouvrent des pull requests. Demander à un relecteur LLM si un diff généré par IA respecte les règles du dépôt ajoute latence, coût et variabilité à un contrôle qui doit rester purement mécanique.

[mergeproof](https://github.com/ahmed-3m/mergeproof) (publié sur npm sous ` + '`@ahmed-3m/mergeproof`' + `, zéro dépendance, licence MIT) adopte l'approche inverse :

- **0 appel LLM :** chaque vérification s'exécute de manière déterministe sur le diff et les exigences de fusion configurées.
- **Signalement des modifications sensibles :** par exemple, si une pull request écrite par IA modifie un fichier de test existant, ` + '`mergeproof`' + ` signale la PR pour une revue humaine au lieu de laisser des tests verts masquer une assertion affaiblie.
- **Portée explicite :** réussir les vérifications déterministes ne garantit **pas** un code sans défaut ; cela impose simplement une hygiène répétable avant la revue humaine.

## Principe de conception partagé

1. **Laisser au code déterministe les règles et le timing :** déclencheurs, permissions RLS, délais d'attente et portes de fusion sur diff appartiennent au code testable, pas aux prompts.
2. **Laisser aux modèles probabilistes la synthèse :** formulation naturelle, analyse multimodale de photos de repas et recherche sémantique sur ` + '`pgvector`' + ` exploitent au mieux la souplesse des LLM.
3. **Prévoir la panne des fournisseurs :** le routage multi-fournisseurs avec basculement préserve la disponibilité sans affaiblir les règles de l'arbitre en amont.

De la détection OOD en vision par ordinateur aux workflows d'agents logiciels, la fiabilité vient d'une limite nette autour de l'autorité du modèle.
        `,
      },
      es: {
        title: 'Controles deterministas para sistemas LLM y agentes: el árbitro de Sihem y mergeproof',
        excerpt:
          'Por qué los modelos de lenguaje probabilísticos necesitan límites deterministas en planificación, estado y verificación, ilustrado con la arquitectura generadores-árbitro-compositor de Sihem y la puerta de PR sin LLM mergeproof.',
        tags: ['IA agéntica', 'Sistemas LLM', 'Controles deterministas', 'Sihem', 'mergeproof', 'Supabase'],
        readingTime: '9 min de lectura',
        faq: [
          {
            question: '¿Cómo separa Sihem las decisiones deterministas de la generación con LLM?',
            answer:
              'Sihem divide la ejecución en generadores, un árbitro determinista y un compositor. Reglas deterministas evalúan los cambios de calendario y las rutinas antes de que un LLM redacte el aviso por Telegram o PWA.',
          },
          {
            question: '¿En qué fase se encuentra Sihem actualmente?',
            answer:
              'Sihem está en beta por invitación en Telegram (@sihem_ai_bot) y como PWA instalable (sihem-pwa.pages.dev) dentro de la incubadora tech2b en Linz, junto con un cliente nativo de Android (Kotlin/Jetpack Compose) en pruebas privadas.',
          },
          {
            question: '¿Qué comprueba mergeproof y cuáles son sus límites?',
            answer:
              'mergeproof (@ahmed-3m/mergeproof, cero dependencias, licencia MIT) valida pull requests escritos por IA frente a requisitos de fusión deterministas configurados —por ejemplo, marcar pruebas existentes modificadas para revisión humana— con 0 llamadas LLM. Superar estas comprobaciones no garantiza código sin errores.',
          },
        ],
        content: `
## La brecha de fiabilidad en flujos con LLM y agentes

Los modelos probabilísticos brillan en interfaces ambiguas: resumir un horario cambiante, adaptar el tono o redactar un pull request en archivos poco conocidos. Donde fallan es en hacer cumplir invariantes estrictas de forma constante a lo largo del tiempo.

Cuando un asistente decide **si debe** interrumpir a una persona, o una revisión automática comprueba **si** un parche escrito por IA ha tocado pruebas existentes, dejar la regla en manos de un modelo de lenguaje convierte una política determinista en una moneda al aire.

En dos proyectos distintos —[Sihem](https://ahmed-3m.github.io/case-studies/sihem/) (un asistente proactivo de hábitos y planificación) y [mergeproof](https://github.com/ahmed-3m/mergeproof) (una puerta de pull requests sin dependencias)— apliqué el mismo principio: mantener el modelo probabilístico en la capa de síntesis y encerrar el estado, la programación horaria y las políticas en código determinista.

## Patrón 1: separación Generadores → Árbitro → Compositor en Sihem

Sihem es un proyecto independiente aceptado en la incubadora **tech2b** en Linz. Actualmente opera en **beta por invitación** mediante un bot de Telegram ([t.me/sihem_ai_bot](https://t.me/sihem_ai_bot)) y una aplicación web instalable ([sihem-pwa.pages.dev](https://sihem-pwa.pages.dev/)), junto con un cliente nativo de Android en Kotlin y Jetpack Compose en pruebas privadas.

Los primeros prototipos mostraron por qué la lógica de horarios no debe vivir dentro de un único prompt: un LLM no respeta de forma fiable las horas de descanso, los enfriamientos anti-spam ni los cambios repetidos de calendario solo a partir de instrucciones en texto.

Por eso Sihem divide los seguimientos proactivos en tres etapas explícitas:

\`\`\`text
Señales (calendario, rutinas, registros de actividad)
   -> Generadores (candidatos de seguimiento)
   -> Árbitro determinista (reglas, esperas, estado del horario)
   -> Compositor (RAG pgvector + LLM multiproveedor)
\`\`\`

### 1. Generadores

Tareas programadas mediante ` + '`pg_cron`' + ` en Supabase inspeccionan los registros recientes (entrenamientos, medicación, sesiones de estudio, hábitos personalizados y sincronización con Google Calendar) y proponen momentos candidatos, como un resumen matutino, una revisión nocturna o un seguimiento tras mover un evento.

### 2. Árbitro determinista

El árbitro se ejecuta como lógica TypeScript directa en **Deno / Supabase Edge Functions** sobre **Supabase PostgreSQL con Row-Level Security (RLS)**. Aplica reglas deterministas de programación y disparo antes de generar texto:

- Comprobar si un candidato choca con franjas de silencio, avisos recientes o tareas ya completadas.
- Aislar estrictamente los datos por usuario mediante políticas RLS de PostgreSQL antes de armar el contexto.
- Suprimir notificaciones redundantes incluso cuando la agenda cambia varias veces.

Solo los candidatos aprobados por el árbitro llegan al modelo de lenguaje.

### 3. Compositor y failover multiproveedor

Cuando el árbitro aprueba un disparo, el compositor recupera contexto a largo plazo desde la memoria RAG en ` + '`pgvector`' + ` y redacta el mensaje. Como la caída de una sola API LLM rompe de inmediato la constancia diaria, Sihem enruta las peticiones entre varios proveedores (**GLM**, **Gemini** y **Groq**) con escalado y failover automático, además de notas de voz opcionales con **Cloudflare MeloTTS**.

Incluso con programación determinista, el texto generado requiere validación y puede contener errores. Y al estar Sihem en beta por invitación, las pruebas en Linz se enfocan en la validación continua del producto sin afirmar mejoras medidas en resultados de usuarios.

## Patrón 2: mergeproof — 0 llamadas LLM al fusionar

El mismo problema de límites aparece cuando los agentes de código abren pull requests. Pedir a un revisor LLM que verifique si un diff generado por IA cumplió las reglas del repositorio añade latencia, coste y variabilidad a una comprobación que debería ser puramente mecánica.

[mergeproof](https://github.com/ahmed-3m/mergeproof) (publicado en npm como ` + '`@ahmed-3m/mergeproof`' + `, cero dependencias, licencia MIT) sigue el camino contrario:

- **0 llamadas LLM:** cada comprobación se ejecuta de forma determinista sobre el diff y los requisitos de fusión configurados.
- **Señalización de cambios sensibles:** por ejemplo, si un pull request escrito por IA modifica un archivo de prueba existente, ` + '`mergeproof`' + ` lo marca para revisión humana en lugar de dejar que una suite en verde oculte una aserción debilitada.
- **Alcance explícito:** superar los requisitos deterministas no garantiza un código libre de defectos; simplemente impone una higiene repetible antes de invertir tiempo de revisión humana.

## Principio de diseño compartido

1. **El código determinista manda sobre políticas y tiempos:** reglas de disparo, permisos RLS, esperas y puertas sobre diffs pertenecen a código comprobable, no a prompts.
2. **Los modelos probabilísticos mandan sobre la síntesis:** redacción natural, visión multimodal de fotos de comidas y recuperación semántica en ` + '`pgvector`' + ` aprovechan la flexibilidad de los LLM.
3. **Diseñar para caídas de proveedores:** el enrutamiento multiproveedor con failover mantiene disponible al asistente sin relajar las reglas previas del árbitro.

Tanto en visión por computador fuera de distribución como en flujos agénticos de software, la fiabilidad nace de saber dónde termina la autoridad del modelo.
        `,
      },
      ar: {
        title: 'الضوابط الحتمية لأنظمة LLM والوكلاء: محكّم Sihem وأداة mergeproof',
        excerpt:
          'لماذا تحتاج نماذج اللغة الاحتمالية إلى حدود حتمية حول الجدولة والحالة والتحقق — كما يتضح في بنية المولدات والمحكّم والمؤلف في Sihem وبوابة فحص طلبات الدمج mergeproof الخالية من LLM.',
        tags: ['الذكاء الوكيلي', 'أنظمة LLM', 'الضوابط الحتمية', 'Sihem', 'mergeproof', 'Supabase'],
        readingTime: '9 دقائق قراءة',
        faq: [
          {
            question: 'كيف يفصل Sihem القرارات الحتمية عن التوليد اللغوي؟',
            answer:
              'يقسّم Sihem التنفيذ إلى مولدات ثم محكّم حتمي ثم مؤلف. تقيّم قواعد الجدولة والتنبيه الحتمية تغيرات التقويم والروتين قبل أن يصيغ النموذج اللغوي رسالة المتابعة على تيليجرام أو PWA.',
          },
          {
            question: 'ما المرحلة الحالية لمشروع Sihem؟',
            answer:
              'يعمل Sihem في نسخة تجريبية بدعوة على تيليجرام (@sihem_ai_bot) وتطبيق ويب قابل للتثبيت (sihem-pwa.pages.dev) ضمن حاضنة tech2b في لينتس، إلى جانب تطبيق أندرويد أصلي (Kotlin/Jetpack Compose) قيد الاختبار الخاص.',
          },
          {
            question: 'ما الذي تفحصه أداة mergeproof وما حدودها؟',
            answer:
              'تفحص mergeproof (@ahmed-3m/mergeproof، بدون تبعيات، ترخيص MIT) طلبات الدمج المكتوبة بالذكاء الاصطناعي وفق متطلبات دمج حتمية محددة — مثل تنبيه المراجع البشري عند تعديل اختبارات قائمة — بـ 0 استدعاءات LLM. اجتياز هذه الفحوص لا يضمن خلو الشيفرة من الأخطاء.',
          },
        ],
        content: `
## فجوة الموثوقية في أنظمة النماذج اللغوية والوكلاء

تتفوق النماذج الاحتمالية عند التعامل مع الواجهات غير المهيكلة: تلخيص جدول متغيّر، أو تكييف الأسلوب، أو صياغة طلب دمج عبر ملفات متعددة. لكنها تضعف عندما يُطلب منها فرض قيود صارمة بثبات مع مرور الوقت.

عندما يقرر المساعد **متى** يقاطع المستخدم، أو تتحقق أداة مراجعة آلية **مما إذا** كان تعديل كتبه وكيل ذكاء اصطناعي قد مسّ اختبارات قائمة، فإن ترك القرار لنموذج لغوي يحوّل السياسة الصارمة إلى احتمال غير مضمون.

في مشروعين مختلفين — [Sihem](https://ahmed-3m.github.io/case-studies/sihem/) (مساعد استباقي للعادات والتخطيط) و[mergeproof](https://github.com/ahmed-3m/mergeproof) (بوابة فحص طلبات الدمج بدون تبعيات) — طبّقت المبدأ المعماري نفسه: إبقاء النموذج الاحتمالي في طبقة الصياغة والتوليد، ووضع الحالة والجدولة وقواعد التحقق داخل شيفرة حتمية.

## النمط الأول: فصل المولدات ← المحكّم ← المؤلف في Sihem

يُعدّ Sihem مشروعاً مستقلاً مقبولاً في حاضنة **tech2b** في لينتس. ويعمل حالياً في **نسخة تجريبية بدعوة** عبر بوت تيليجرام ([t.me/sihem_ai_bot](https://t.me/sihem_ai_bot)) وتطبيق ويب تقدمي قابل للتثبيت ([sihem-pwa.pages.dev](https://sihem-pwa.pages.dev/))، إلى جانب عميل أندرويد أصلي بلغة Kotlin وJetpack Compose في مرحلة الاختبار الخاص.

أوضحت النماذج الأولية المبكرة سبب فشل وضع منطق الجدولة داخل موجه نصي واحد للـ LLM: لا يستطيع النموذج التزام ساعات الهدوء أو منع التنبيهات المكررة أو تتبع تحولات التقويم عبر الأيام بدقة من التعليمات النصية وحدها.

لذلك يقسّم Sihem المتابعة الاستباقية إلى ثلاث مراحل واضحة:

\`\`\`text
Signals (calendar, routines, activity logs)
   -> Generators (candidate check-ins)
   -> Deterministic Arbiter (rules, cooldowns, schedule state)
   -> Composer (pgvector RAG + multi-provider LLM)
\`\`\`

### 1. المولدات

تفحص مهام مجدولة عبر ` + '`pg_cron`' + ` داخل Supabase سجلات النشاط الحديثة (التمارين، والأدوية، وجلسات الدراسة، والعادات المخصصة، ومزامنة Google Calendar) وتقترح نقاط متابعة مرشحة مثل الموجز الصباحي أو المراجعة المسائية أو المتابعة بعد تغيّر موعد في التقويم.

### 2. المحكّم الحتمي

يعمل المحكّم كشيفرة TypeScript حتمية داخل **Deno / Supabase Edge Functions** فوق **Supabase PostgreSQL مع أمان على مستوى الصفوف (RLS)**. ويطبّق قواعد الجدولة والتنبيه الحتمية قبل توليد أي نص:

- التحقق من تعارض التنبيه المرشح مع فترات الهدوء أو التنبيهات القريبة أو العناصر المكتملة.
- عزل بيانات كل مستخدم بصرامة عبر سياسات PostgreSQL RLS قبل تجميع السياق.
- منع الإشعارات المكررة حتى عند تغيّر المواعيد بشكل متكرر.

لا تصل إلى النموذج اللغوي إلا الحالات التي يجيزها المحكّم.

### 3. المؤلف والتبديل التلقائي بين المزودين

بعد موافقة المحكّم، يسترجع المؤلف السياق طويل المدى من ذاكرة ` + '`pgvector`' + ` RAG ويصوغ الرسالة. ولأن انقطاع واجهة LLM واحدة يكسر استمرارية العادات اليومية فوراً، يوجّه Sihem الطلبات عبر عدة مزودين (**GLM** و**Gemini** و**Groq**) مع تصعيد وتبديل تلقائي عند الأعطال، إضافةً إلى إمكانية توليد رسائل صوتية عبر **Cloudflare MeloTTS**.

وحتى مع الجدولة الحتمية، يظل النص المولّد بحاجة إلى تحقق وقد يحتوي على أخطاء. وبما أن Sihem لا يزال في نسخة تجريبية بدعوة، فإن الاختبارات الجارية في لينتس تهدف إلى التحقق من المنتج دون الادعاء بقياس تحسّن رقمي في نتائج المستخدمين.

## النمط الثاني: أداة mergeproof — صفر استدعاءات LLM عند الدمج

تظهر مشكلة الحدود نفسها عندما يفتح وكلاء البرمجة طلبات دمج. طلب التحقق من التزام التعديلات بقواعد المستودع من مراجع LLM يضيف زمناً وتكلفةً وتذبذباً إلى فحص ينبغي أن يكون ميكانيكياً بالكامل.

تعتمد أداة [mergeproof](https://github.com/ahmed-3m/mergeproof) (المنشورة على npm باسم ` + '`@ahmed-3m/mergeproof`' + `، بدون تبعيات وبترخيص MIT) النهج المعاكس:

- **0 استدعاءات LLM:** كل فحص يعمل بشكل حتمي على الفروقات البرمجية ومتطلبات الدمج المحددة.
- **تنبيه التعديلات الحساسة:** إذا عدّل طلب دمج مكتوب بالذكاء الاصطناعي ملف اختبار قائماً، تشير ` + '`mergeproof`' + ` إليه للمراجعة البشرية بدلاً من السماح لنجاح الاختبارات بإخفاء إضعاف الشروط.
- **وضوح الحدود:** اجتياز الفحوصات الحتمية لا يضمن خلو الشيفرة من الأخطاء؛ بل يفرض فقط حداً أدنى متكرراً للانضباط قبل وقت المراجعة البشرية.

## مبدأ التصميم المشترك

1. **الشيفرة الحتمية تملك القواعد والتوقيت:** قواعد الإطلاق وصلاحيات RLS وفترات التهدئة وبوابات الدمج مكانها الشيفرة القابلة للاختبار، لا الموجهات النصية.
2. **النماذج الاحتمالية تملك الصياغة:** الصياغة الطبيعية، وفهم صور الوجبات متعدد الوسائط، والاسترجاع الدلالي عبر ` + '`pgvector`' + ` هي مواضع قوة نماذج اللغة.
3. **التصميم لتجاوز الأعطال:** التوجيه متعدد المزودين مع التبديل التلقائي يحافظ على توفر المساعد دون التنازل عن قواعد المحكّم السابقة.

سواء في كشف الصور خارج التوزيع أو في مسارات عمل الوكلاء البرمجيين، تأتي الموثوقية من تحديد النقطة التي تتوقف عندها صلاحية النموذج.
        `,
      },
    },
  },
  {
    slug: 'ood-diffusion-thesis',
    date: '2026-07-12',
    ogImage: '/og-ood-diffusion-thesis.png',
    lastModified: '2026-11-13',
    citation: {
      title:
        'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control',
      date: '2026-07-12',
      pdfUrl: 'https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf',
    },
    translations: {
      en: {
        title: 'How I Reached 99.03% ± 0.07% AUROC (3-seed mean) on OOD Detection with Conditional Diffusion Models',
        excerpt:
          "My master's thesis at JKU Linz introduced class-conditional separation loss into conditional diffusion models used as generative classifiers, reaching 99.03% ± 0.07% AUROC (3-seed mean) on CIFAR-10 and adding a stable +6.5pp over the non-separated baseline.",
        tags: ['Diffusion Models', 'OOD Detection', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Models'],
        readingTime: '14 min read',
        faq: [
          {
            question: 'What result did the thesis achieve on CIFAR-10?',
            answer:
              'The best averaged result was 99.03% +/- 0.07% AUROC across three seeds. Seed-42 reached 98.98% within-CIFAR and generalized zero-shot to five external OOD benchmarks.',
          },
          {
            question: 'What is the separation loss?',
            answer:
              'It is an extra training term that pushes the two class-conditional noise predictions apart, making the reconstruction-error gap more discriminative and much more stable across seeds.',
          },
          {
            question: 'Why does this matter?',
            answer:
              'It turns a seed-sensitive generative OOD detector into a much more reliable one, which matters if the method is meant to become a real safety layer instead of a one-off experiment.',
          },
        ],
        content: `
## The Problem

Out-of-distribution detection is the part of a system that says, "this input does not belong to what I was trained on." In practice that means catching unusual inputs before a model makes a confident wrong decision. For any safety-relevant AI pipeline, that ability matters as much as raw accuracy.

In my master's thesis at JKU Linz, supervised by Prof. Sepp Hochreiter and Claus Hofmann, I studied whether a **conditional diffusion model** can act as a **generative classifier** for OOD detection instead of just generating images.

## The Core Idea

The model reconstructs an image under two competing class conditions. If the image is truly in-distribution, the matching condition should reconstruct it better. If the image is unusual, both explanations should struggle and the reconstruction gap becomes the anomaly signal.

The baseline already worked, but it had a frustrating weakness: it was highly seed-sensitive. At λ = 0.0, the average AUROC was **92.52% +/- 11.07%**, which means some seeds looked excellent and some collapsed badly.

## My Contribution: Separation Loss

I introduced a **class-conditional separation loss** that pushes the conditional noise predictions apart during training:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

The point is simple: if the two explanations become more distinct, the reconstruction-error difference becomes clearer. That makes the OOD score easier to trust.

## Results

The best setting was **λ = 0.02**. Averaged across three independent seeds, it reached:

- **99.03% +/- 0.07% AUROC** (3-seed mean) on CIFAR-10
- **+6.5 percentage points** over the non-separated baseline
- much lower cross-seed standard deviation than the baseline

For a concrete reproducible run, seed-42 achieved:

- **98.98% AUROC** (seed 42) on the within-CIFAR split
- **90.50%-96.97%** zero-shot generalization across CIFAR-100, Places365, FashionMNIST, Textures, and SVHN

## Why I Care About This Result

The important part is not only that the score went up. The important part is that the cross-seed standard deviation collapsed. Moving from a fragile 92.52% +/- 11.07% to a stable 99.03% +/- 0.07% (both 3-seed means) is the difference between "interesting research result" and "plausible building block for a real safety system."

## Cross-Domain Reality Check

I also transferred the same idea to industrial print-quality control on the public FTI_Zer0P benchmark. There, the crop-based YOLO + CDM baseline reached **0.8673 +/- 0.0230 AUROC** under strict 5-fold cross-validation, while separation loss did **not** significantly improve performance after Holm correction.

That was a valuable result too. It showed that the mechanism transfers strongly in semantic image space like CIFAR-10, but not automatically to small, texture-heavy manufacturing data. Knowing where a method stops helping is part of doing honest research.

## Stack and Artifacts

- PyTorch + PyTorch Lightning
- DDPM U-Net with class conditioning
- Hydra + Weights & Biases
- JKU GPU infrastructure

Public artifacts:

- Thesis PDF: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code: https://github.com/ahmed-3m/DiffusionOOD
- Industrial transfer: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      de: {
        title: 'Wie ich mit konditionalen Diffusionsmodellen 99,03 % ± 0,07 % AUROC (3-Seed-Mittel) für OOD-Erkennung erreicht habe',
        excerpt:
          'Meine Masterarbeit an der JKU Linz führte eine class-conditional separation loss in konditionale Diffusionsmodelle als generative Klassifikatoren ein und erreichte 99,03 % ± 0,07 % AUROC (3-Seed-Mittel) auf CIFAR-10 sowie einen stabilen Gewinn von +6.5 Prozentpunkten gegenüber der Basis ohne Separation.',
        tags: ['Diffusionsmodelle', 'OOD-Erkennung', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Generative Modelle'],
        readingTime: '14 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis wurde auf CIFAR-10 erreicht?',
            answer:
              'Der beste Mittelwert über drei Seeds lag bei 99.03% +/- 0.07% AUROC. Seed-42 erreichte 98.98% innerhalb von CIFAR und generalisierte zero-shot auf fünf externe OOD-Benchmarks.',
          },
          {
            question: 'Was ist die Separation Loss?',
            answer:
              'Das ist ein zusätzlicher Trainingsterm, der die beiden class-conditional noise predictions auseinanderzieht und damit die Rekonstruktionsfehler-Differenz klarer und stabiler macht.',
          },
          {
            question: 'Warum ist das wichtig?',
            answer:
              'Weil aus einem seed-sensitiven OOD-Detektor ein deutlich verlässlicherer wird. Genau diese Stabilität entscheidet, ob eine Methode später produktionsnah nutzbar ist.',
          },
        ],
        content: `
## Das Problem

OOD-Erkennung ist der Teil eines Systems, der sagt: "Dieses Eingabebeispiel gehört nicht zu dem, worauf ich trainiert wurde." In sicherheitskritischen Anwendungen ist das genauso wichtig wie die eigentliche Klassifikationsleistung.

In meiner Masterarbeit an der JKU Linz, betreut von Prof. Sepp Hochreiter und Claus Hofmann, habe ich untersucht, ob ein **konditionales Diffusionsmodell** als **generativer Klassifikator** für OOD-Erkennung eingesetzt werden kann.

## Die Grundidee

Das Modell rekonstruiert ein Bild unter zwei konkurrierenden Klassenbedingungen. Wenn das Bild wirklich zur Verteilung gehört, sollte die passende Bedingung besser rekonstruieren. Ist das Bild ungewöhnlich, werden beide Erklärungen schlechter und die Lücke im Rekonstruktionsfehler wird zum Anomaliesignal.

Die Basisvariante funktionierte bereits, hatte aber ein ernstes Problem: starke Seed-Abhängigkeit. Bei λ = 0.0 lag der Mittelwert nur bei **92.52% +/- 11.07% AUROC**. Einige Seeds sahen sehr gut aus, andere brachen deutlich ein.

## Mein Beitrag: Separation Loss

Ich habe eine **class-conditional separation loss** eingeführt, die die konditionalen Noise-Vorhersagen während des Trainings auseinanderdrückt:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Wenn die beiden Erklärungen klarer getrennt sind, wird auch die Rekonstruktionsfehler-Differenz klarer. Genau dadurch wird der OOD-Score robuster.

## Ergebnisse

Die beste Einstellung war **λ = 0.02**. Über drei unabhängige Seeds ergab sich:

- **99.03% +/- 0.07% AUROC** (3-Seed-Mittel) auf CIFAR-10
- **+6.5 Prozentpunkte** gegenüber der Basis ohne Separation
- deutlich geringere Standardabweichung über Seeds

Ein reproduzierbarer Seed-42 Lauf erreichte:

- **98.98% AUROC** (Seed 42) im within-CIFAR Setting
- **90.50%-96.97%** zero-shot Generalisierung auf CIFAR-100, Places365, FashionMNIST, Textures und SVHN

## Warum dieses Ergebnis wichtig ist

Entscheidend ist nicht nur der höhere Score. Entscheidend ist der starke Rückgang der Standardabweichung. Der Schritt von 92.52% +/- 11.07% zu 99.03% +/- 0.07% (jeweils 3-Seed-Mittel) trennt eine interessante Idee von einer deutlich glaubwürdigeren Sicherheitskomponente.

## Transfer in die Industrie

Ich habe denselben Ansatz auch auf industrielle Druckqualitätskontrolle mit dem öffentlichen FTI_Zer0P Benchmark übertragen. Dort erreichte die crop-basierte YOLO + CDM Basis **0.8673 +/- 0.0230 AUROC** unter strenger 5-facher Kreuzvalidierung, während die Separation Loss nach Holm-Korrektur **keine** signifikante Verbesserung brachte.

Auch das war ein wichtiges Ergebnis. Es zeigt, dass der Mechanismus in semantischen Bildräumen wie CIFAR-10 stark hilft, aber nicht automatisch auf kleine, texturlastige Produktionsdaten übergeht.

## Stack und Artefakte

- PyTorch + PyTorch Lightning
- DDPM U-Net mit Klassenkonditionierung
- Hydra + Weights & Biases
- JKU GPU-Infrastruktur

Öffentliche Artefakte:

- Thesis PDF: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code: https://github.com/ahmed-3m/DiffusionOOD
- Industrieller Transfer: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: "Comment j'ai atteint 99,03 % ± 0,07 % AUROC (moyenne 3 seeds) pour la détection OOD avec des modèles de diffusion conditionnels",
        excerpt:
          "Mon mémoire de master à JKU Linz a introduit une class-conditional separation loss dans des modèles de diffusion conditionnels utilisés comme classificateurs génératifs, atteignant 99,03 % ± 0,07 % AUROC (moyenne 3 seeds) sur CIFAR-10 avec un gain stable de +6.5 points face à la baseline sans séparation.",
        tags: ['Modèles de diffusion', 'Détection OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modèles génératifs'],
        readingTime: '14 min de lecture',
        faq: [
          {
            question: 'Quel résultat a été obtenu sur CIFAR-10 ?',
            answer:
              'Le meilleur résultat moyen est de 99.03% +/- 0.07% AUROC (moyenne 3 seeds). Le seed-42 a atteint 98.98% dans le split CIFAR et a généralisé zero-shot à cinq benchmarks externes.',
          },
          {
            question: "Qu'est-ce que la separation loss ?",
            answer:
              "C'est un terme d'entraînement supplémentaire qui éloigne les deux prédictions conditionnelles de bruit pour rendre le score basé sur l'erreur de reconstruction plus discriminant et plus stable.",
          },
          {
            question: 'Pourquoi ce résultat compte-t-il ?',
            answer:
              "Parce qu'il transforme une méthode très sensible au seed en détecteur beaucoup plus fiable, ce qui est crucial si l'on veut utiliser la méthode comme vraie couche de sécurité.",
          },
        ],
        content: `
## Le problème

La détection out-of-distribution est la capacité d'un système à dire : "cette entrée ne ressemble pas à ce que j'ai vu pendant l'entraînement". Dans un système IA réel, cette capacité est une propriété de sûreté, pas un détail annexe.

Dans mon mémoire de master à JKU Linz, sous la supervision du Prof. Sepp Hochreiter et de Claus Hofmann, j'ai étudié si un **modèle de diffusion conditionnel** pouvait jouer le rôle d'un **classificateur génératif** pour la détection OOD.

## L'idée centrale

Le modèle reconstruit une image sous deux conditions de classe concurrentes. Si l'image est normale, la bonne condition doit mieux la reconstruire. Si l'image est inhabituelle, les deux explications se dégradent et l'écart entre les erreurs de reconstruction devient le signal d'anomalie.

La baseline fonctionnait déjà, mais avec une forte sensibilité au seed. À λ = 0.0, la moyenne n'était que de **92.52% +/- 11.07% AUROC**.

## Ma contribution : la separation loss

J'ai introduit une **class-conditional separation loss** qui pousse les prédictions conditionnelles de bruit à s'éloigner :

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Le principe est simple : des explications mieux séparées produisent un écart d'erreur de reconstruction plus lisible, donc un score OOD plus robuste.

## Résultats

Le meilleur réglage était **λ = 0.02**. Sur trois seeds indépendants :

- **99.03% +/- 0.07% AUROC** (moyenne 3 seeds) sur CIFAR-10
- **+6.5 points** face à la baseline sans séparation
- un écart-type très fortement réduit entre seeds

Le seed-42 a atteint :

- **98.98% AUROC** (seed 42) dans le cadre within-CIFAR
- **90.50%-96.97%** de généralisation zero-shot sur CIFAR-100, Places365, FashionMNIST, Textures et SVHN

## Pourquoi ce résultat est fort

Le point clé n'est pas seulement l'augmentation du score. C'est surtout l'effondrement de l'écart-type. Passer de 92.52% +/- 11.07% à 99.03% +/- 0.07% (moyennes 3 seeds) signifie passer d'une méthode fragile à une approche bien plus crédible pour une utilisation réelle.

## Transfert vers l'industrie

J'ai ensuite appliqué la même idée à l'inspection de qualité industrielle sur le benchmark public FTI_Zer0P. La baseline YOLO + CDM sur crops a obtenu **0.8673 +/- 0.0230 AUROC** en validation croisée stricte à 5 plis, tandis que la separation loss n'a pas apporté d'amélioration statistiquement significative après correction de Holm.

Ce résultat est important lui aussi : l'idée transfère très bien dans un espace sémantique comme CIFAR-10, mais pas automatiquement vers des textures industrielles fines et peu abondantes.

## Stack et artefacts

- PyTorch + PyTorch Lightning
- DDPM U-Net conditionnel
- Hydra + Weights & Biases
- Infrastructure GPU JKU

Artefacts publics :

- Mémoire PDF : https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Code : https://github.com/ahmed-3m/DiffusionOOD
- Transfert industriel : https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Cómo alcancé 99.03% ± 0.07% AUROC (media de 3 seeds) en detección OOD con modelos de difusión condicional',
        excerpt:
          'Mi tesis de máster en JKU Linz introdujo una class-conditional separation loss en modelos de difusión condicional usados como clasificadores generativos, alcanzando 99.03% ± 0.07% AUROC (media de 3 seeds) en CIFAR-10 y una mejora estable de +6.5 puntos sobre la base sin separación.',
        tags: ['Modelos de difusión', 'Detección OOD', 'Deep Learning', 'PyTorch', 'CIFAR-10', 'Modelos generativos'],
        readingTime: '14 min de lectura',
        faq: [
          {
            question: '¿Qué resultado se logró en CIFAR-10?',
            answer:
              'El mejor promedio sobre tres semillas fue 99.03% +/- 0.07% AUROC. La seed-42 logró 98.98% dentro de CIFAR y generalizó zero-shot a cinco benchmarks externos.',
          },
          {
            question: '¿Qué es la separation loss?',
            answer:
              'Es un término extra de entrenamiento que separa las dos predicciones condicionales de ruido para que la diferencia de error de reconstrucción sea más clara y estable.',
          },
          {
            question: '¿Por qué importa este resultado?',
            answer:
              'Porque convierte un detector generativo muy sensible a la semilla en uno mucho más confiable, algo clave si se quiere usar como capa real de seguridad.',
          },
        ],
        content: `
## El problema

La detección out-of-distribution es la capacidad de un sistema para decir: "esta entrada no pertenece a lo que vi durante el entrenamiento". En un sistema de IA real, eso es una propiedad de seguridad.

En mi tesis de máster en JKU Linz, bajo la supervisión del Prof. Sepp Hochreiter y Claus Hofmann, estudié si un **modelo de difusión condicional** podía usarse como **clasificador generativo** para detección OOD.

## La idea central

El modelo reconstruye una imagen bajo dos condiciones de clase rivales. Si la imagen es normal, la condición correcta debe reconstruirla mejor. Si la imagen es rara, ambas explicaciones fallan y la brecha entre errores de reconstrucción se vuelve la señal de anomalía.

La versión base ya funcionaba, pero tenía un problema serio: mucha sensibilidad a la semilla. Con λ = 0.0, el promedio fue **92.52% +/- 11.07% AUROC**.

## Mi contribución: separation loss

Introduje una **class-conditional separation loss** que empuja a separar las predicciones condicionales de ruido:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

Si las dos explicaciones son más distintas, la diferencia de error de reconstrucción es más clara y el puntaje OOD se vuelve más robusto.

## Resultados

La mejor configuración fue **λ = 0.02**. En tres semillas independientes:

- **99.03% +/- 0.07% AUROC** (media de 3 seeds) en CIFAR-10
- **+6.5 puntos porcentuales** sobre la base sin separación
- una desviación estándar mucho menor entre semillas

La seed-42 logró:

- **98.98% AUROC** (semilla 42) en el escenario within-CIFAR
- **90.50%-96.97%** de generalización zero-shot en CIFAR-100, Places365, FashionMNIST, Textures y SVHN

## Por qué este resultado es importante

Lo importante no es solo subir el puntaje. Lo importante es reducir drásticamente la desviación estándar. Pasar de 92.52% +/- 11.07% a 99.03% +/- 0.07% (medias de 3 seeds) significa pasar de una heurística frágil a un componente de seguridad mucho más creíble.

## Transferencia industrial

También apliqué la misma idea al control de calidad industrial en el benchmark público FTI_Zer0P. Allí, la base YOLO + CDM por crops obtuvo **0.8673 +/- 0.0230 AUROC** con validación cruzada estricta de 5 folds, mientras que la separation loss no mejoró de forma significativa tras la corrección de Holm.

Ese resultado también fue valioso. Mostró que el mecanismo ayuda mucho en espacios semánticos como CIFAR-10, pero no se transfiere automáticamente a texturas industriales pequeñas y complejas.

## Stack y artefactos

- PyTorch + PyTorch Lightning
- DDPM U-Net condicionado por clase
- Hydra + Weights & Biases
- Infraestructura GPU de JKU

Artefactos públicos:

- PDF de tesis: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Codigo: https://github.com/ahmed-3m/DiffusionOOD
- Transferencia industrial: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
      ar: {
        title: 'كيف وصلت إلى \u206699.03%\u00a0±\u00a00.07% AUROC\u2069 (متوسط 3 بذور) في كشف OOD باستخدام نماذج الانتشار الشرطية',
        excerpt:
          'قدمت رسالتي في JKU Linz خسارة فصل شرطية داخل نماذج الانتشار الشرطية المستخدمة كمصنفات توليدية، وحققت \u206699.03%\u00a0±\u00a00.07% AUROC\u2069 (متوسط 3 بذور) على CIFAR-10 مع تحسن ثابت قدره +6.5 نقطة مقارنة بالخط الأساسي من دون الفصل.',
        tags: ['نماذج الانتشار', 'كشف OOD', 'التعلم العميق', 'PyTorch', 'CIFAR-10', 'نماذج توليدية'],
        readingTime: '14 دقيقة قراءة',
        faq: [
          {
            question: 'ما النتيجة التي حققتها الرسالة على CIFAR-10؟',
            answer:
              'أفضل متوسط عبر ثلاث بذور كان 99.03% +/- 0.07% AUROC. أما seed-42 فحقق 98.98% داخل CIFAR وعمم zero-shot على خمسة benchmarks خارجية.',
          },
          {
            question: 'ما هي separation loss؟',
            answer:
              'هي حد إضافي في التدريب يدفع تنبؤي الضوضاء الشرطيين بعيداً عن بعضهما، بحيث تصبح فجوة خطأ إعادة البناء أوضح وأكثر ثباتاً.',
          },
          {
            question: 'لماذا هذه النتيجة مهمة؟',
            answer:
              'لأنها تحول كاشفاً حساساً جداً للبذرة إلى كاشف أكثر موثوقية، وهذا مهم إذا أردنا استخدامه كطبقة أمان حقيقية.',
          },
        ],
        content: `
## المشكلة

كشف out-of-distribution هو الجزء الذي يقول: "هذه العينة لا تشبه ما تدربت عليه". في الأنظمة الحقيقية، هذه ليست ميزة جانبية بل خاصية أمان أساسية.

في رسالتي للماجستير في JKU Linz تحت إشراف Prof. Sepp Hochreiter وClaus Hofmann، درست ما إذا كان **نموذج انتشار شرطي** يمكن أن يعمل كـ **مصنف توليدي** لكشف OOD.

## الفكرة الأساسية

يقوم النموذج بإعادة بناء الصورة تحت شرطين مختلفين للفئة. إذا كانت الصورة طبيعية، فيجب أن ينجح الشرط الصحيح أكثر. وإذا كانت غير مألوفة، فإن التفسيرين يضعفان وتصبح فجوة خطأ إعادة البناء هي إشارة الشذوذ.

النسخة الأساسية كانت جيدة، لكنها عانت من مشكلة واضحة: حساسية كبيرة للبذرة. عند λ = 0.0 كان المتوسط **92.52% +/- 11.07% AUROC**.

## مساهمتي: separation loss

أضفت **class-conditional separation loss** تدفع تنبؤات الضوضاء الشرطية بعيداً عن بعضها:

\`\`\`python
loss = L_diffusion + lambda * L_separation
\`\`\`

عندما تصبح التفسيرات أبعد عن بعضها، تصبح فجوة خطأ إعادة البناء أوضح، وبالتالي تصبح درجة OOD أكثر ثباتاً.

## النتائج

أفضل إعداد كان **λ = 0.02**. عبر ثلاث بذور مستقلة وصلنا إلى:

- **99.03% +/- 0.07% AUROC** (متوسط 3 بذور) على CIFAR-10
- **+6.5 نقطة مئوية** فوق الخط الأساسي بدون فصل
- انخفاض كبير جداً في الانحراف المعياري بين البذور

أما seed-42 فحقق:

- **98.98% AUROC** (البذرة 42) في within-CIFAR
- **90.50%-96.97%** تعميماً zero-shot على CIFAR-100 وPlaces365 وFashionMNIST وTextures وSVHN

## لماذا هذه النتيجة مهمة

الأهم ليس فقط ارتفاع الدرجة، بل انهيار الانحراف المعياري. الانتقال من 92.52% +/- 11.07% إلى 99.03% +/- 0.07% (متوسط 3 بذور) يعني الانتقال من فكرة بحثية هشة إلى مكون أكثر مصداقية كنظام أمان.

## الاختبار عبر المجال الصناعي

طبقت الفكرة نفسها أيضاً على مراقبة جودة الطباعة الصناعية في benchmark العام FTI_Zer0P. هناك وصل خط YOLO + CDM المعتمد على crops إلى **0.8673 +/- 0.0230 AUROC** مع تحقق تقاطعي صارم من 5 طيات، بينما لم تحقق separation loss تحسناً ذا دلالة إحصائية بعد Holm correction.

وهذه أيضاً نتيجة مهمة، لأنها توضح أن الفكرة تعمل بقوة في فضاءات دلالية مثل CIFAR-10، لكنها لا تنتقل تلقائياً إلى بيانات صناعية صغيرة وغنية بالملمس.

## الأدوات والروابط

- PyTorch + PyTorch Lightning
- DDPM U-Net مع class conditioning
- Hydra + Weights & Biases
- بنية GPU في JKU

الروابط العامة:

- PDF الرسالة: https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- الكود: https://github.com/ahmed-3m/DiffusionOOD
- النقل الصناعي: https://github.com/ahmed-3m/InkjetOOD
        `,
      },
    },
  },
  {
    slug: 'diffusion-models-anomaly-detection',
    date: '2024-11-20',
    ogImage: '/og-diffusion-models-anomaly-detection.png',
    lastModified: '2026-11-22',
    translations: {
      en: {
        title: 'Diffusion Models for Industrial Defect Detection at PROFACTOR GmbH',
        excerpt:
          'How I evaluated a two-stage YOLOv8m detector and conditional diffusion pipeline on the FTI_Zer0P benchmark under strict 5-fold image-level cross-validation, reaching a 0.8673 ± 0.0230 AUROC baseline and mapping where separation loss does not transfer.',
        tags: ['Diffusion Models', 'Anomaly Detection', 'Industrial AI', 'YOLOv8', 'Quality Control'],
        readingTime: '11 min read',
        faq: [
          {
            question: 'What result did the industrial system achieve?',
            answer:
              'On the public FTI_Zer0P benchmark under strict 5-fold image-level CV across 573 source-image groups (6,408 128×128 crops), the λ = 0.0 baseline reached 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 accuracy, K=100).',
          },
          {
            question: 'What was the architecture?',
            answer:
              'A two-stage pipeline: Stage 1 runs a YOLOv8m detector (25.86M params in yolo_best.pt; thesis PDF erratum prints YOLOv8n) to localize 8 print feature types into 128×128 crops, and Stage 2 runs a multi-head conditional diffusion U-Net (AdaGN) as the generative classifier.',
          },
          {
            question: 'Did separation loss help here too?',
            answer:
              'Not significantly. Across λ ∈ {0.01, 0.02, 0.05}, scores stayed within the cross-fold standard deviation and failed Holm-corrected significance testing — showing where natural-image gains stop transferring.',
          },
        ],
        content: `
## Industrial Context

At PROFACTOR GmbH in Austria, I worked on machine vision for inkjet-printed building components under the Zer0P initiative. The goal was clear: inspect printed features reliably on a small, heterogeneous industrial dataset.

## The Two-Stage Pipeline

The public **InkjetOOD** evaluation uses a **Stage-1 YOLOv8m detector + Stage-2 conditional diffusion model** pipeline on **FTI_Zer0P**:

1. **Stage 1 (YOLOv8m detector):** Localizes 8 structured feature types (angle, dist1, dist6, dots, edge1–4) from 1920×1080 frames at 640×640 input and crops each region to **128×128 RGB** (**6,408 crops** across **573 source-image groups**). *(Thesis PDF erratum: the thesis text identifies the detector as YOLOv8n, while the released checkpoint \`yolo_best.pt\` is YOLOv8m with 25.86M parameters verified from \`train_args\`.)*
2. **Stage 2 (Multi-head CDM):** A conditional diffusion U-Net (\`NoisePredictorV3\` with AdaGN feature-type embeddings) models normal vs. defective crops per feature category.
3. **Anomaly scoring:** Differential reconstruction error \`s_OOD(x) = ê_0(x) - ê_1(x)\` averaged across \`K = 100\` Monte Carlo timesteps scores each crop.

## Why the Setting Was Hard

- Only **573 source-image groups** (expanded into **6,408** feature crops)
- Strong heterogeneity and class imbalance across the 8 feature types (e.g. Angle at 9.67:1 GOOD:BAD)
- Multiple crops originate from the same physical print, requiring strict **image-level** fold grouping to prevent data leakage

## Results on Public FTI_Zer0P

Evaluated under strict **5-fold stratified image-level cross-validation** at \`λ = 0.0\` (\`K = 100\`):

- **0.8673 ± 0.0230 AUROC** overall baseline (5-fold CV)
- **0.8094 ± 0.0151 accuracy** and **0.5631 ± 0.1697 FPR@95%TPR**
- Strongest per-feature AUROC on **Dots (0.9557 ± 0.0353)** and **Distance 6 (0.9362 ± 0.0666)**, with higher spread on sparse features such as **Angle (0.8166 ± 0.1381)** and **Edge 3 (0.7441 ± 0.0757)**

## What I Learned About Transfer

The most honest finding was where separation loss stopped helping. On CIFAR-10 airplane-vs-rest, \`λ = 0.02\` lifted mean AUROC by +6.5 pp and collapsed seed variance. On FTI_Zer0P, non-zero separation weights (\`0.8628 ± 0.0286\` at \`λ=0.01\`, \`0.8510 ± 0.0326\` at \`λ=0.02\`, \`0.8670 ± 0.0256\` at \`λ=0.05\`) stayed within fold spread and were non-significant after Holm correction (\`p > 0.05\`).

## Engineering Takeaways

- Image-level fold splitting is non-negotiable whenever a detector extracts multiple crops per frame
- Per-feature reporting reveals failure modes hidden by a single aggregate metric
- Public code, weights, and thesis documentation make negative transfer findings genuinely useful

Artifacts:

- M.Sc. Thesis PDF (source of the 0.8673 ± 0.0230 AUROC 5-fold CV baseline): https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Early Technical Report PDF (2024, negative result): https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      de: {
        title: 'Diffusionsmodelle für industrielle Defekterkennung bei PROFACTOR GmbH',
        excerpt:
          'Wie ich eine zweistufige Pipeline aus YOLOv8m-Detektor und konditionalem Diffusionsmodell auf FTI_Zer0P unter strenger 5-facher bildbasierter Kreuzvalidierung evaluiert habe (0.8673 ± 0.0230 AUROC Baseline).',
        tags: ['Diffusionsmodelle', 'Anomalieerkennung', 'Industrielle KI', 'YOLOv8', 'Qualitätskontrolle'],
        readingTime: '11 Min. Lesezeit',
        faq: [
          {
            question: 'Welches Ergebnis erreichte das industrielle System?',
            answer:
              'Auf dem öffentlichen FTI_Zer0P Benchmark unter strenger 5-facher bildbasierter Kreuzvalidierung über 573 Quellbild-Gruppen (6.408 128×128-Ausschnitte) erreichte die λ = 0.0 Baseline 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 Genauigkeit, K=100).',
          },
          {
            question: 'Wie sah die Architektur aus?',
            answer:
              'Eine zweistufige Pipeline: Stufe 1 nutzt einen YOLOv8m-Detektor (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n), der 8 Druckmerkmalstypen in 128×128-Crops lokalisiert; Stufe 2 klassifiziert per Multi-Head-Konditional-Diffusion (AdaGN).',
          },
          {
            question: 'Half die Separation Loss auch hier?',
            answer:
              'Nicht signifikant. Bei λ ∈ {0.01, 0.02, 0.05} blieben die Werte innerhalb der Fold-Streuung und zeigten nach Holm-Korrektur keinen signifikanten Vorteil.',
          },
        ],
        content: `
## Industrieller Kontext

Bei PROFACTOR GmbH in Österreich arbeitete ich im Rahmen von Zer0P an Machine Vision für inkjet-bedruckte Bauteile. Die Datenbasis war begrenzt, die Defekte heterogen, und die Auswertung musste statistisch sauber auf Bildebene erfolgen.

## Die zweistufige Pipeline

Die öffentliche **InkjetOOD**-Evaluation kombiniert einen **Stufe-1-YOLOv8m-Detektor** mit einem **Stufe-2-Diffusionsklassifikator** auf **FTI_Zer0P**:

1. **Stufe 1 (YOLOv8m-Detektor):** Lokalisiert 8 strukturierte Merkmalstypen (angle, dist1, dist6, dots, edge1–4) in 1920×1080-Bildern bei 640×640-Eingang und schneidet sie auf **128×128 RGB** zu (**6.408 Crops** aus **573 Quellbild-Gruppen**). *(Thesis-PDF-Erratum: Der Text der Arbeit bezeichnet den Detektor als YOLOv8n; das veröffentlichte Gewicht \`yolo_best.pt\` ist laut \`train_args\` YOLOv8m mit 25,86 Mio. Parametern.)*
2. **Stufe 2 (Multi-Head CDM):** Ein konditionales Diffusions-U-Net (\`NoisePredictorV3\` mit AdaGN-Embeddings pro Merkmalstyp) modelliert normale vs. fehlerhafte Crops.
3. **Anomalie-Score:** Die Rekonstruktionsfehler-Differenz \`s_OOD(x) = ê_0(x) - ê_1(x)\` über \`K = 100\` Monte-Carlo-Schritte bewertet jeden Ausschnitt.

## Warum das Setting schwierig war

- Nur **573 Quellbild-Gruppen** (erweitert auf **6.408** Merkmals-Crops)
- Starke Heterogenität und Ungleichgewicht zwischen den 8 Merkmalstypen (z. B. Angle 9,67:1 GOOD:BAD)
- Mehrere Crops stammen vom selben Bauteilbild — daher strikte **bildbasierte** Fold-Trennung gegen Data Leakage

## Ergebnisse auf FTI_Zer0P

Unter strenger **5-facher stratifizierter bildbasierter Kreuzvalidierung** bei \`λ = 0.0\` (\`K = 100\`):

- **0.8673 ± 0.0230 AUROC** Gesamt-Baseline (5-fach-CV)
- **0.8094 ± 0.0151 Genauigkeit** und **0.5631 ± 0.1697 FPR@95%TPR**
- Stärkste Einzelwerte bei **Dots (0.9557 ± 0.0353)** und **Distance 6 (0.9362 ± 0.0666)**; größere Streuung bei dünn besetzten Merkmalen wie **Angle (0.8166 ± 0.1381)** und **Edge 3 (0.7441 ± 0.0757)**

## Was ich über Transfer gelernt habe

Eine zentrale Erkenntnis war, wo die Separation Loss aufhört zu helfen. Auf CIFAR-10 brachte \`λ = 0.02\` +6.5 Prozentpunkte und minimale Seed-Streuung. Auf FTI_Zer0P lagen alle \`λ > 0\`-Läufe (\`0.8628 ± 0.0286\` bei \`λ=0.01\`, \`0.8510 ± 0.0326\` bei \`λ=0.02\`, \`0.8670 ± 0.0256\` bei \`λ=0.05\`) innerhalb der Fold-Streuung und blieben nach Holm-Korrektur nicht signifikant (\`p > 0.05\`).

## Engineering-Erkenntnisse

- Bildbasierte Fold-Trennung ist Pflicht, sobald ein Detektor mehrere Crops pro Aufnahme liefert
- Metriken pro Merkmalstyp decken Schwächen auf, die ein Gesamtwert verdeckt
- Offene Artefakte und ehrliche Nullresultate machen Ergebnisse prüfbar

Artefakte:

- Masterarbeit PDF (Quelle der Baseline 0.8673 ± 0.0230 AUROC, 5-fach-CV): https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Frühzeitiger Technikbericht PDF (2024, Negativergebnis): https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      fr: {
        title: 'Modèles de diffusion pour la détection de défauts industriels chez PROFACTOR GmbH',
        excerpt:
          "Comment j'ai évalué une pipeline en deux étapes (détecteur YOLOv8m + diffusion conditionnelle) sur FTI_Zer0P avec validation croisée stricte par image source à 5 plis, obtenant une baseline de 0.8673 ± 0.0230 AUROC.",
        tags: ['Modèles de diffusion', "Détection d'anomalie", 'IA industrielle', 'YOLOv8', 'Contrôle qualité'],
        readingTime: '11 min de lecture',
        faq: [
          {
            question: 'Quel résultat le système industriel a-t-il obtenu ?',
            answer:
              'Sur le benchmark public FTI_Zer0P en validation croisée stricte par image source à 5 plis (573 groupes d’images, 6 408 crops 128×128), la baseline λ = 0.0 a atteint 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 d’exactitude, K=100).',
          },
          {
            question: "Quelle était l'architecture ?",
            answer:
              'Une pipeline en deux étapes : la phase 1 utilise un détecteur YOLOv8m (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) pour localiser 8 types de motifs en crops 128×128, et la phase 2 un U-Net de diffusion conditionnel multi-têtes (AdaGN).',
          },
          {
            question: 'La separation loss a-t-elle aidé ici aussi ?',
            answer:
              "Pas de façon significative. Pour λ ∈ {0.01, 0.02, 0.05}, les scores restaient dans l'écart-type des plis après correction de Holm — montrant les limites du transfert inter-domaines.",
          },
        ],
        content: `
## Contexte industriel

Chez PROFACTOR GmbH en Autriche, j'ai travaillé dans le cadre du projet Zer0P sur la vision industrielle pour des composants imprimés par jet d'encre. Le jeu de données était limité, hétérogène et exigeait une validation sans fuite de données.

## La pipeline en deux étapes

L'évaluation publique **InkjetOOD** combine un **détecteur YOLOv8m (phase 1)** et un **classificateur génératif par diffusion conditionnelle (phase 2)** sur **FTI_Zer0P** :

1. **Phase 1 (Détecteur YOLOv8m) :** Localise 8 types de motifs structurés (angle, dist1, dist6, dots, edge1–4) sur des images 1920×1080 (entrée 640×640) et extrait **6 408 crops RGB 128×128** issus de **573 groupes d'images sources**. *(Erratum PDF du mémoire : le mémoire désigne le détecteur comme YOLOv8n, alors que le checkpoint publié \`yolo_best.pt\` est YOLOv8m avec 25,86 M paramètres vérifiés dans \`train_args\`.)*
2. **Phase 2 (CDM multi-têtes) :** Un U-Net de diffusion conditionnel (\`NoisePredictorV3\` avec conditionnement AdaGN par type de motif) apprend la reconstruction des crops normaux et défectueux.
3. **Score d'anomalie :** L'écart d'erreur de reconstruction \`s_OOD(x) = ê_0(x) - ê_1(x)\` sur \`K = 100\` pas Monte Carlo évalue chaque crop.

## Pourquoi le problème était difficile

- Seulement **573 groupes d'images sources** (expansés en **6 408** crops de motifs)
- Forte hétérogénéité et déséquilibre entre les 8 types (ex. Angle à 9,67:1 GOOD:BAD)
- Plusieurs crops proviennent de la même image : séparation stricte par **image source** obligatoire

## Résultats sur FTI_Zer0P public

En **validation croisée stratifiée par image à 5 plis** avec \`λ = 0.0\` (\`K = 100\`) :

- **0.8673 ± 0.0230 AUROC** (baseline globale, VC 5 plis)
- **0.8094 ± 0.0151 d'exactitude** et **0.5631 ± 0.1697 FPR@95%TPR**
- Meilleures performances sur **Dots (0.9557 ± 0.0353)** et **Distance 6 (0.9362 ± 0.0666)**, et plus forte variance sur **Angle (0.8166 ± 0.1381)** ou **Edge 3 (0.7441 ± 0.0757)**

## Ce que j'ai appris sur le transfert

Le constat le plus honnête concerne les limites de la separation loss. Sur CIFAR-10, \`λ = 0.02\` gagnait +6.5 points tout en stabilisant les seeds. Sur FTI_Zer0P, les valeurs \`λ > 0\` (\`0.8628 ± 0.0286\` à \`0.01\`, \`0.8510 ± 0.0326\` à \`0.02\`, \`0.8670 ± 0.0256\` à \`0.05\`) restaient dans la dispersion des plis et n'étaient pas significatives après correction de Holm (\`p > 0.05\`).

## Leçons d'ingénierie

- Le découpage par image source est indispensable dès qu'un détecteur extrait plusieurs crops par vue
- Les scores par type de motif révèlent ce qu'une moyenne globale masque
- Les artefacts publics donnent de la valeur même aux résultats négatifs

Artefacts :

- PDF du mémoire (source de la baseline 0.8673 ± 0.0230 AUROC, VC 5 plis) : https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- Rapport technique précoce PDF (2024, résultat négatif) : https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Code : https://github.com/ahmed-3m/InkjetOOD
- Weights : https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      es: {
        title: 'Modelos de difusión para detección de defectos industriales en PROFACTOR GmbH',
        excerpt:
          'Cómo evalué una pipeline de dos etapas (detector YOLOv8m + difusión condicional) en el benchmark FTI_Zer0P bajo validación cruzada estricta de 5 folds a nivel de imagen, logrando una base de 0.8673 ± 0.0230 AUROC.',
        tags: ['Modelos de difusión', 'Detección de anomalías', 'IA industrial', 'YOLOv8', 'Control de calidad'],
        readingTime: '11 min de lectura',
        faq: [
          {
            question: '¿Qué resultado logró el sistema industrial?',
            answer:
              'En el benchmark público FTI_Zer0P bajo validación cruzada estricta de 5 folds a nivel de imagen (573 grupos fuente, 6.408 recortes 128×128), la base con λ = 0.0 alcanzó 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 de exactitud, K=100).',
          },
          {
            question: '¿Cuál era la arquitectura?',
            answer:
              'Una pipeline de dos etapas: la etapa 1 usa un detector YOLOv8m (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) para localizar 8 tipos de rasgos en recortes de 128×128, y la etapa 2 un U-Net de difusión condicional multi-cabeza (AdaGN).',
          },
          {
            question: '¿La separation loss también ayudó aquí?',
            answer:
              'No de forma significativa. Para λ ∈ {0.01, 0.02, 0.05}, los resultados quedaron dentro de la dispersión entre folds tras la corrección de Holm, delimitando el alcance de transferencia.',
          },
        ],
        content: `
## Contexto industrial

En PROFACTOR GmbH en Austria trabajé dentro del proyecto Zer0P en visión artificial para componentes impresos por inyección de tinta. El dataset era reducido y heterogéneo, exigiendo una evaluación rigurosa sin fugas de datos.

## La pipeline de dos etapas

La evaluación pública **InkjetOOD** combina un **detector YOLOv8m en etapa 1** con un **clasificador generativo por difusión condicional en etapa 2** sobre **FTI_Zer0P**:

1. **Etapa 1 (Detector YOLOv8m):** Localiza 8 tipos de rasgos impresos (angle, dist1, dist6, dots, edge1–4) en fotogramas 1920×1080 (entrada 640×640) y extrae **6.408 recortes RGB de 128×128** en **573 grupos de imágenes fuente**. *(Errata del PDF de la tesis: la tesis identifica el detector como YOLOv8n, pero el checkpoint publicado \`yolo_best.pt\` es YOLOv8m con 25,86 M parámetros verificados en \`train_args\`.)*
2. **Etapa 2 (CDM multi-cabeza):** Una U-Net de difusión condicional (\`NoisePredictorV3\` con condicionamiento AdaGN por tipo de rasgo) modela recortes normales frente a defectuosos.
3. **Puntuación de anomalía:** La diferencia de error de reconstrucción \`s_OOD(x) = ê_0(x) - ê_1(x)\` promediada en \`K = 100\` pasos de Monte Carlo puntúa cada recorte.

## Por qué el problema era difícil

- Solo **573 grupos de imágenes fuente** (expandidos a **6.408** recortes)
- Alta heterogeneidad y desbalanceo entre los 8 tipos (p. ej. Angle 9,67:1 GOOD:BAD)
- Varios recortes provienen de la misma captura, obligando a dividir los folds a **nivel de imagen fuente**

## Resultados en FTI_Zer0P público

Con **validación cruzada estratificada de 5 folds a nivel de imagen** (\`λ = 0.0\`, \`K = 100\`):

- **0.8673 ± 0.0230 AUROC** de línea base global (CV de 5 pliegues)
- **0.8094 ± 0.0151 de exactitud** y **0.5631 ± 0.1697 FPR@95%TPR**
- Mayor separación en **Dots (0.9557 ± 0.0353)** y **Distance 6 (0.9362 ± 0.0666)**, y mayor dispersión en rasgos escasos como **Angle (0.8166 ± 0.1381)** y **Edge 3 (0.7441 ± 0.0757)**

## Lo que aprendí sobre transferencia

La conclusión más honesta fue observar dónde dejaba de ayudar la separation loss. En CIFAR-10, \`λ = 0.02\` aportó +6.5 puntos y estabilidad entre semillas. En FTI_Zer0P, los ajustes \`λ > 0\` (\`0.8628 ± 0.0286\` en \`0.01\`, \`0.8510 ± 0.0326\` en \`0.02\`, \`0.8670 ± 0.0256\` en \`0.05\`) no superaron la variación entre folds ni la corrección de Holm (\`p > 0.05\`).

## Lecciones de ingeniería

- Dividir por imagen fuente es obligatorio cuando un detector genera múltiples recortes por imagen
- El desglose por tipo de rasgo evita que una media oculte debilidades concretas
- Publicar código, pesos y resultados negativos convierte las limitaciones en conocimiento útil

Artefactos:

- PDF de la tesis (fuente de la línea base 0.8673 ± 0.0230 AUROC, CV de 5 pliegues): https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- PDF del informe técnico temprano (2024, resultado negativo): https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- Código: https://github.com/ahmed-3m/InkjetOOD
- Weights: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
      ar: {
        title: 'نماذج الانتشار لكشف العيوب الصناعية في PROFACTOR GmbH',
        excerpt:
          'كيف قيّمت خطاً من مرحلتين يجمع بين كاشف YOLOv8m ونموذج انتشار شرطي على معيار FTI_Zer0P بتحقق تقاطعي صارم من 5 طيات على مستوى الصورة الأصلية، محقّقاً خط أساس 0.8673 ± 0.0230 AUROC.',
        tags: ['نماذج الانتشار', 'كشف الشذوذ', 'الذكاء الاصطناعي الصناعي', 'YOLOv8', 'ضبط الجودة'],
        readingTime: '11 دقيقة قراءة',
        faq: [
          {
            question: 'ما النتيجة التي حققها النظام الصناعي؟',
            answer:
              'على معيار FTI_Zer0P العام مع تحقق تقاطعي صارم من 5 طيات على مستوى الصورة الأصلية عبر 573 مجموعة صور (6,408 قصاصات 128×128)، حقق خط الأساس عند λ = 0.0 مقياس 0.8673 ± 0.0230 AUROC (ودقة 0.8094 ± 0.0151، عند K=100).',
          },
          {
            question: 'ما هي البنية المستخدمة؟',
            answer:
              'نظام من مرحلتين: المرحلة الأولى تستخدم كاشف YOLOv8m (بـ 25.86 مليون معامل في yolo_best.pt؛ ورد سهواً YOLOv8n في نص PDF الرسالة) لتحديد 8 أنواع من الميزات واقتصاصها بأبعاد 128×128، والمرحلة الثانية شبكة U-Net انتشارية شرطية متعددة الرؤوس (AdaGN).',
          },
          {
            question: 'هل ساعدت separation loss هنا أيضاً؟',
            answer:
              'ليس بشكل ذي دلالة إحصائية. عند λ ∈ {0.01, 0.02, 0.05} بقيت النتائج ضمن تباين الطيات بعد تصحيح هولم، مما يوضح حدود انتقال المكاسب بين المجالات.',
          },
        ],
        content: `
## السياق الصناعي

في شركة PROFACTOR GmbH في النمسا عملت ضمن مشروع Zer0P على الرؤية الحاسوبية لمكونات بناء مطبوعة بنفث الحبر. كانت البيانات محدودة ومتنوعة، مما استلزم تقييماً إحصائياً صارماً خالياً من تسرب البيانات.

## خط العمل ذو المرحلتين

يجمع التقييم العام **InkjetOOD** بين **كاشف YOLOv8m في المرحلة الأولى** و**مصنف توليدي بالانتشار الشرطي في المرحلة الثانية** على مجموعة **FTI_Zer0P**:

1. **المرحلة الأولى (كاشف YOLOv8m):** يحدّد 8 أنواع من ميزات الطباعة (angle، dist1، dist6، dots، edge1–4) داخل إطارات 1920×1080 (بمدخل 640×640) ويقتطع **6,408 قصاصة RGB بأبعاد 128×128** عبر **573 مجموعة صور أصلية**. *(تصويب مطبعي في PDF الرسالة: يصف نص الرسالة الكاشف بأنه YOLOv8n، بينما النموذج المدرب المنشور \`yolo_best.pt\` هو YOLOv8m بـ 25.86 مليون معامل وفق \`train_args\`.)*
2. **المرحلة الثانية (CDM متعدد الرؤوس):** شبكة U-Net انتشارية شرطية (\`NoisePredictorV3\` مع تكييف AdaGN لكل نوع ميزة) تميّز بين القصاصات السليمة والمعيبة.
3. **حساب درجة الشذوذ:** يقيس فرق خطأ إعادة البناء \`s_OOD(x) = ê_0(x) - ê_1(x)\` عبر \`K = 100\` عينة مونت كارلو درجة كل قصاصة.

## لماذا كانت المهمة صعبة

- وجود **573 مجموعة صور أصلية** فقط (تنتج **6,408** قصاصة ميزات)
- تباين وعدم توازن كبيران بين الأنواع الثمانية (مثل Angle بنسبة 9.67:1 سليم:معيب)
- صدور عدة قصاصات من اللقطة نفسها مما يفرض التقسيم على **مستوى الصورة الأصلية** لمنع التسرب

## النتائج على FTI_Zer0P العام

بتحقق تقاطعي طبقي صارم من **5 طيات على مستوى الصورة** عند \`λ = 0.0\` (\`K = 100\`):

- **0.8673 ± 0.0230 AUROC** كخط أساس عام (تحقق متقاطع خماسي)
- **0.8094 ± 0.0151 دقة** و**0.5631 ± 0.1697 FPR@95%TPR**
- أقوى فصل في **Dots (0.9557 ± 0.0353)** و**Distance 6 (0.9362 ± 0.0666)**، مقابل تباين أعلى في الفئات الأقل وفرة مثل **Angle (0.8166 ± 0.1381)** و**Edge 3 (0.7441 ± 0.0757)**

## ما تعلمته عن النقل بين المجالات

النتيجة الأصدق كانت تحديد أين تتوقف خسارة الفصل عن تقديم فائدة. على CIFAR-10 حقق \`λ = 0.02\` زيادة +6.5 نقطة مئوية واستقراراً عالياً عبر البذور. أما على FTI_Zer0P فبقيت قيم \`λ > 0\` (\`0.8628 ± 0.0286\` عند \`0.01\`، \`0.8510 ± 0.0326\` عند \`0.02\`، \`0.8670 ± 0.0256\` عند \`0.05\`) ضمن تباين الطيات ولم تثبت دلالتها بعد تصحيح هولم (\`p > 0.05\`).

## دروس هندسية

- التقسيم على مستوى الصورة الأصلية ضروري متى استخرج الكاشف عدة قصاصات من كل إطار
- تحليل كل نوع ميزة يكشف تفاصيل يخفيها المتوسط العام
- مشاركة الكود والأوزان والرسالة تجعل النتائج السلبية قابلة للتحقق ومفيدة للباحثين

الروابط:

- PDF الرسالة (مصدر خط الأساس 0.8673 ± 0.0230 AUROC، تحقق متقاطع خماسي): https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf
- PDF التقرير التقني المبكر (2024، نتيجة سلبية): https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf
- الكود: https://github.com/ahmed-3m/InkjetOOD
- الأوزان: https://huggingface.co/ahmed-3m/InkjetOOD
        `,
      },
    },
  },
  {
    slug: 'computer-vision-yolo-mastery',
    date: '2024-10-20',
    ogImage: '/og-computer-vision-yolo-mastery.png',
    lastModified: '2026-11-22',
    translations: {
      en: {
        title: 'YOLOv8m for Industrial Quality Control: Stage-1 Detection & Leakage-Free Splits',
        excerpt:
          'Engineering notes on using YOLOv8m as a Stage-1 feature detector and 128×128 cropper across 573 source-image groups on FTI_Zer0P, plus why image-level 5-fold CV mattered more than model tweaks.',
        tags: ['Computer Vision', 'YOLOv8', 'Industrial AI', 'PyTorch', 'Production ML'],
        readingTime: '10 min read',
        faq: [
          {
            question: 'Why use YOLOv8m as a Stage-1 feature detector and cropper?',
            answer:
              'Industrial inkjet frames (1920×1080) contain 8 localized feature types (dots, distances, edges, angle). Stage-1 YOLOv8m (25.86M params in yolo_best.pt; thesis PDF erratum prints YOLOv8n) detects and crops 6,408 normalized 128×128 patches across 573 source images so Stage 2 can score local anomalies cleanly.',
          },
          {
            question: 'What did the strict 5-fold evaluation show on FTI_Zer0P?',
            answer:
              'Under 5-fold stratified image-level cross-validation across the 573 source-image groups, the YOLO+CDM baseline reached 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 accuracy, K=100), with Dots at 0.9557 ± 0.0353 and Distance 6 at 0.9362 ± 0.0666.',
          },
          {
            question: 'What mattered most?',
            answer:
              'Source-image fold grouping to avoid crop leakage, per-feature evaluation, and reproducible Hydra + PyTorch Lightning runs mattered far more than architecture tuning.',
          },
        ],
        content: `
## This Was Not a Tutorial Project

Most YOLO posts stop at "train on a large dataset and report mAP." Industrial quality control has harder constraints: 573 source images, asymmetric class balance, heterogeneous geometries, and zero tolerance for fold leakage.

## Stage-1 Detection & Cropping with YOLOv8m

In the **InkjetOOD** two-stage pipeline, **YOLOv8m** acts explicitly as a **Stage-1 feature detector and cropper** (` + '`640×640`' + ` YOLO input over ` + '`1920×1080`' + ` print frames). *(Erratum note: the thesis text identifies the detector as YOLOv8n, whereas the released trained checkpoint ` + '`yolo_best.pt`' + ` is ` + '`YOLOv8m`' + ` with 25.86M parameters verified from ` + '`train_args`' + `.)*

Each detected print region (8 feature classes: ` + '`angle`' + `, ` + '`dist1`' + `, ` + '`dist6`' + `, ` + '`dots`' + `, and ` + '`edge1–4`' + `) is cropped and resized via bilinear interpolation to **128×128 RGB**. Across the 573 processed source-image groups on **FTI_Zer0P**, that yields **6,408 retained feature crops** for Stage-2 generative classification.

## Data Discipline Over Tricks

When one frame produces ~11 feature crops on average, random crop-level train/validation splits leak near-identical background context across folds and inflate metrics. Grouping strictly by **source image (` + '`573`' + ` groups)** kept every crop from a given physical print inside a single fold, and resizing crops cleanly to ` + '`128×128`' + ` without synthetic crop augmentation preserved authentic defect textures.

## Reproducible Pipeline Setup

\`\`\`python
pipeline = {
    "stage1_detector": "YOLOv8m (yolo_best.pt, 25.86M params, 640x640 input)",
    "stage2_crop_size": "128x128 RGB (6,408 crops / 573 source groups)",
    "stage2_classifier": "Multi-head AdaGN Diffusion UNet (NoisePredictorV3)",
    "cv_protocol": "5-fold image-level stratified CV, K=100 trials",
}
\`\`\`

## Evaluation That Meant Something

Evaluated on public **FTI_Zer0P** under 5-fold image-level CV (` + '`λ = 0.0`' + `), the two-stage baseline achieved **0.8673 ± 0.0230 AUROC** (` + '`0.8094 ± 0.0151`' + ` accuracy). Per-feature AUROC told the real engineering story: dense local patterns like **Dots (0.9557 ± 0.0353)** and **Distance 6 (0.9362 ± 0.0666)** scored reliably, whereas sparse or imbalanced classes like **Angle (9.67:1 GOOD:BAD, 0.8166 ± 0.1381)** and **Edge 3 (0.7441 ± 0.0757)** carried high cross-fold spread.

## What Actually Moved the Needle

- decoupling Stage-1 localization (` + '`YOLOv8m`' + `) from Stage-2 anomaly scoring on ` + '`128×128`' + ` crops
- enforcing strict image-level grouping across all ` + '`573`' + ` source images
- reporting per-feature AUROC and cross-fold standard deviations instead of cherry-picked runs
- publishing reproducible Hydra configs, checkpoints, and documented errata openly
        `,
      },
      de: {
        title: 'YOLOv8m für industrielle Qualitätskontrolle: Stufe-1-Detektion & saubere Splits',
        excerpt:
          'Engineering-Notizen zum Einsatz von YOLOv8m als Stufe-1-Detektor für 6.408 128×128-Crops über 573 Quellbild-Gruppen auf FTI_Zer0P — und warum bildbasierte 5-fach-CV mehr zählte als Architektur-Tuning.',
        tags: ['Computer Vision', 'YOLOv8', 'Industrielle KI', 'PyTorch', 'Production ML'],
        readingTime: '10 Min. Lesezeit',
        faq: [
          {
            question: 'Warum YOLOv8m als Stufe-1-Merkmalsdetektor und Cropper einsetzen?',
            answer:
              'Industrielle Inkjet-Aufnahmen (1920×1080) enthalten 8 lokale Merkmalstypen (Punkte, Abstände, Kanten, Winkel). Stufe 1 mit YOLOv8m (25,86 Mio. Parameter in yolo_best.pt; Thesis-PDF-Erratum nennt YOLOv8n) erkennt und schneidet 6.408 normierte 128×128-Crops aus 573 Quellbildern für die nachgelagerte Anomaliebewertung.',
          },
          {
            question: 'Was zeigte die strenge 5-fache Kreuzvalidierung auf FTI_Zer0P?',
            answer:
              'Unter 5-facher stratifizierter bildbasierter CV über 573 Quellbild-Gruppen erreichte die YOLO+CDM-Baseline 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 Genauigkeit, K=100), mit Dots bei 0.9557 ± 0.0353 und Distance 6 bei 0.9362 ± 0.0666.',
          },
          {
            question: 'Was war am wichtigsten?',
            answer:
              'Gruppierung der Folds auf Quellbildebene zur Vermeidung von Data Leakage, Auswertung pro Merkmalstyp und reproduzierbare Hydra-/PyTorch-Lightning-Läufe waren wichtiger als Modell-Tuning.',
          },
        ],
        content: `
## Kein Tutorial-Projekt

Die meisten YOLO-Beiträge enden bei "auf großem Datensatz trainieren und mAP berichten". Industrielle Qualitätskontrolle bedeutet in der Praxis: 573 Quellbilder, unausgewogene Klassen, heterogene Geometrien und null Toleranz für Data Leakage zwischen Folds.

## Stufe-1-Detektion und Zuschneiden mit YOLOv8m

In der zweistufigen **InkjetOOD**-Pipeline arbeitet **YOLOv8m** gezielt als **Stufe-1-Merkmalsdetektor und Cropper** (` + '`640×640`' + `-Eingang auf ` + '`1920×1080`' + `-Druckbildern). *(Erratum-Hinweis: der Text der Arbeit bezeichnet den Detektor als YOLOv8n, das trainierte Gewicht ` + '`yolo_best.pt`' + ` ist jedoch laut ` + '`train_args`' + ` YOLOv8m mit 25,86 Mio. Parametern.)*

Jede erkannte Druckregion (8 Klassen: ` + '`angle`' + `, ` + '`dist1`' + `, ` + '`dist6`' + `, ` + '`dots`' + `, ` + '`edge1–4`' + `) wird ausgeschnitten und bilinear auf **128×128 RGB** skaliert. Über die 573 verarbeiteten Quellbild-Gruppen von **FTI_Zer0P** entstehen so **6.408 Merkmals-Crops** für die zweite Stufe.

## Datendisziplin statt Tricks

Wenn ein Bild im Schnitt rund 11 Crops liefert, verursacht ein zufälliges Splitting auf Crop-Ebene sofort Leakage zwischen Training und Validierung. Durch strikte Gruppierung nach **Quellbild (` + '`573`' + ` Gruppen)** blieben alle Ausschnitte derselben Aufnahme im selben Fold, während die direkte Skalierung auf ` + '`128×128`' + ` ohne synthetische Crop-Augmentierung die reale Oberflächentextur bewahrte.

## Reproduzierbares Setup

\`\`\`python
pipeline = {
    "stage1_detector": "YOLOv8m (yolo_best.pt, 25.86M params, 640x640 input)",
    "stage2_crop_size": "128x128 RGB (6,408 crops / 573 source groups)",
    "stage2_classifier": "Multi-head AdaGN Diffusion UNet (NoisePredictorV3)",
    "cv_protocol": "5-fold image-level stratified CV, K=100 trials",
}
\`\`\`

## Aussagekräftige Evaluation

Unter 5-facher bildbasierter Kreuzvalidierung auf dem öffentlichen **FTI_Zer0P**-Datensatz (` + '`λ = 0.0`' + `) erreichte die Baseline **0.8673 ± 0.0230 AUROC** (` + '`0.8094 ± 0.0151`' + ` Genauigkeit). Die Aufschlüsselung pro Merkmal zeigt das reale Bild: **Dots (0.9557 ± 0.0353)** und **Distance 6 (0.9362 ± 0.0666)** trennen sehr stabil, während stark unausgewogene oder dünne Klassen wie **Angle (9.67:1 GOOD:BAD, 0.8166 ± 0.1381)** und **Edge 3 (0.7441 ± 0.0757)** deutlich stärker streuen.

## Was wirklich den Unterschied gemacht hat

- Klare Trennung von Stufe-1-Lokalisierung (` + '`YOLOv8m`' + `) und Stufe-2-Anomaliebewertung auf ` + '`128×128`' + `-Crops
- Strikte Gruppierung nach den ` + '`573`' + ` Quellbildern statt Crop-Level-Splits
- Ehrliche Auswertung pro Merkmal samt Standardabweichung statt Einzelwerten
- Offene Hydra-Konfigurationen, Checkpoints und transparent dokumentierte Errata
        `,
      },
      fr: {
        title: 'YOLOv8m pour le contrôle qualité industriel : détection phase 1 et splits sans fuite',
        excerpt:
          "Notes d'ingénierie sur l'utilisation de YOLOv8m comme détecteur de phase 1 (6 408 crops 128×128 sur 573 groupes d'images FTI_Zer0P) et pourquoi la validation croisée par image source a compté plus que le tuning.",
        tags: ['Vision par ordinateur', 'YOLOv8', 'IA industrielle', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lecture',
        faq: [
          {
            question: 'Pourquoi utiliser YOLOv8m comme détecteur et recadreur en phase 1 ?',
            answer:
              'Les images industrielles (1920×1080) contiennent 8 types de motifs locaux (points, distances, bords, angle). En phase 1, YOLOv8m (25,86 M paramètres dans yolo_best.pt ; erratum PDF : YOLOv8n) détecte et recadre 6 408 patchs 128×128 sur 573 images sources pour la phase 2 générative.',
          },
          {
            question: 'Qu’a montré la validation croisée en 5 plis sur FTI_Zer0P ?',
            answer:
              'En validation croisée stratifiée par image source sur 573 groupes, la baseline YOLO+CDM a atteint 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 d’exactitude, K=100), avec Dots à 0.9557 ± 0.0353 et Distance 6 à 0.9362 ± 0.0666.',
          },
          {
            question: "Qu'est-ce qui a le plus compté ?",
            answer:
              'Le regroupement des plis par image source pour éviter les fuites, l’analyse par type de motif et des runs Hydra + PyTorch Lightning reproductibles ont compté plus que les ajustements d’architecture.',
          },
        ],
        content: `
## Ce n'était pas un projet tutoriel

La plupart des articles YOLO s'arrêtent à « entraîner sur un grand dataset et afficher le mAP ». En contrôle qualité industriel, les contraintes sont tout autres : 573 images sources, fort déséquilibre de classes, géométries variées et aucune tolérance aux fuites de données.

## Détection et recadrage en phase 1 avec YOLOv8m

Dans la pipeline en deux étapes **InkjetOOD**, **YOLOv8m** sert explicitement de **détecteur et recadreur de phase 1** (entrée ` + '`640×640`' + ` sur images ` + '`1920×1080`' + `). *(Erratum : le mémoire désigne le détecteur comme YOLOv8n, alors que le checkpoint publié ` + '`yolo_best.pt`' + ` est ` + '`YOLOv8m`' + ` à 25,86 M paramètres selon ` + '`train_args`' + `.)*

Chaque motif détecté (8 catégories : ` + '`angle`' + `, ` + '`dist1`' + `, ` + '`dist6`' + `, ` + '`dots`' + `, ` + '`edge1–4`' + `) est recadré et redimensionné par interpolation bilinéaire en **128×128 RGB**. Sur les 573 groupes d'images de **FTI_Zer0P**, cela produit **6 408 crops de motifs** pour le classificateur génératif de phase 2.

## Discipline sur les données

Puisqu'une image fournit en moyenne ~11 crops, un découpage aléatoire par crop introduirait une fuite directe entre apprentissage et validation. Regrouper strictement par **image source (` + '`573`' + ` groupes)** garantit qu'aucune impression ne traverse deux plis, et redimensionner sans augmentation synthétique préserve les textures réelles des défauts.

## Configuration reproductible

\`\`\`python
pipeline = {
    "stage1_detector": "YOLOv8m (yolo_best.pt, 25.86M params, 640x640 input)",
    "stage2_crop_size": "128x128 RGB (6,408 crops / 573 source groups)",
    "stage2_classifier": "Multi-head AdaGN Diffusion UNet (NoisePredictorV3)",
    "cv_protocol": "5-fold image-level stratified CV, K=100 trials",
}
\`\`\`

## Une évaluation révélatrice

Évaluée sur **FTI_Zer0P** en validation croisée par image à 5 plis (` + '`λ = 0.0`' + `), la baseline atteint **0.8673 ± 0.0230 AUROC** (` + '`0.8094 ± 0.0151`' + ` d'exactitude). Le détail par motif montre la réalité terrain : **Dots (0.9557 ± 0.0353)** et **Distance 6 (0.9362 ± 0.0666)** se séparent nettement, tandis que les classes rares ou déséquilibrées comme **Angle (9.67:1 GOOD:BAD, 0.8166 ± 0.1381)** et **Edge 3 (0.7441 ± 0.0757)** présentent une dispersion plus élevée.

## Ce qui a vraiment fait la différence

- découpler la localisation phase 1 (` + '`YOLOv8m`' + `) de l'évaluation d'anomalie phase 2 sur crops ` + '`128×128`' + `
- imposer une séparation stricte par image source sur les ` + '`573`' + ` groupes
- rapporter l'AUROC et l'écart-type par motif plutôt qu'un score isolé
- publier configurations Hydra, poids et errata de façon transparente
        `,
      },
      es: {
        title: 'YOLOv8m para control de calidad industrial: detección en etapa 1 y splits sin fugas',
        excerpt:
          'Notas de ingeniería sobre YOLOv8m como detector de etapa 1 (6.408 recortes 128×128 en 573 grupos de FTI_Zer0P) y por qué la validación cruzada a nivel de imagen importó más que ajustar la arquitectura.',
        tags: ['Visión por computador', 'YOLOv8', 'IA industrial', 'PyTorch', 'Production ML'],
        readingTime: '10 min de lectura',
        faq: [
          {
            question: '¿Por qué usar YOLOv8m como detector y recortador en la etapa 1?',
            answer:
              'Los fotogramas industriales (1920×1080) contienen 8 tipos de rasgos locales (puntos, distancias, bordes, ángulo). En la etapa 1, YOLOv8m (25,86 M parámetros en yolo_best.pt; errata del PDF: YOLOv8n) detecta y recorta 6.408 parches de 128×128 desde 573 imágenes fuente para la etapa 2 generativa.',
          },
          {
            question: '¿Qué mostró la evaluación de 5 folds en FTI_Zer0P?',
            answer:
              'Bajo validación cruzada estratificada de 5 folds a nivel de imagen (573 grupos), la base YOLO+CDM alcanzó 0.8673 ± 0.0230 AUROC (0.8094 ± 0.0151 de exactitud, K=100), con Dots en 0.9557 ± 0.0353 y Distance 6 en 0.9362 ± 0.0666.',
          },
          {
            question: '¿Qué fue lo más importante?',
            answer:
              'Agrupar los folds por imagen fuente para evitar fugas, analizar cada rasgo por separado y mantener ejecuciones reproducibles con Hydra y PyTorch Lightning.',
          },
        ],
        content: `
## Esto no fue un proyecto tutorial

La mayoría de los posts sobre YOLO terminan en «entrenar en un gran dataset y reportar mAP». En control de calidad industrial las condiciones son distintas: 573 imágenes fuente, fuerte desbalanceo, geometrías heterogéneas y cero tolerancia a fugas entre folds.

## Detección y recorte en etapa 1 con YOLOv8m

En la pipeline de dos etapas **InkjetOOD**, **YOLOv8m** funciona explícitamente como **detector y recortador de etapa 1** (entrada ` + '`640×640`' + ` sobre capturas ` + '`1920×1080`' + `). *(Nota de errata: la tesis identifica el detector como YOLOv8n, pero el checkpoint publicado ` + '`yolo_best.pt`' + ` es ` + '`YOLOv8m`' + ` con 25,86 M parámetros verificados en ` + '`train_args`' + `.)*

Cada región detectada (8 tipos: ` + '`angle`' + `, ` + '`dist1`' + `, ` + '`dist6`' + `, ` + '`dots`' + `, ` + '`edge1–4`' + `) se recorta y redimensiona por interpolación bilineal a **128×128 RGB**. En los 573 grupos de imágenes fuente de **FTI_Zer0P**, eso produce **6.408 recortes** para el clasificador generativo de etapa 2.

## Disciplina de datos antes que trucos

Cuando una imagen genera ~11 recortes de media, dividir aleatoriamente por recorte filtra contexto entre entrenamiento y validación. Agrupar estrictamente por **imagen fuente (` + '`573`' + ` grupos)** mantiene toda la pieza en un único fold, y escalar limpiamente a ` + '`128×128`' + ` sin aumentación sintética conserva la textura real de cada defecto.

## Configuración reproducible

\`\`\`python
pipeline = {
    "stage1_detector": "YOLOv8m (yolo_best.pt, 25.86M params, 640x640 input)",
    "stage2_crop_size": "128x128 RGB (6,408 crops / 573 source groups)",
    "stage2_classifier": "Multi-head AdaGN Diffusion UNet (NoisePredictorV3)",
    "cv_protocol": "5-fold image-level stratified CV, K=100 trials",
}
\`\`\`

## Evaluación con significado real

Evaluado en **FTI_Zer0P** con 5-fold CV a nivel de imagen (` + '`λ = 0.0`' + `), la línea base obtuvo **0.8673 ± 0.0230 AUROC** (` + '`0.8094 ± 0.0151`' + ` de exactitud). El desglose por rasgo cuenta la historia real: **Dots (0.9557 ± 0.0353)** y **Distance 6 (0.9362 ± 0.0666)** muestran alta separación, mientras que rasgos escasos o desbalanceados como **Angle (9.67:1 GOOD:BAD, 0.8166 ± 0.1381)** y **Edge 3 (0.7441 ± 0.0757)** presentan mayor dispersión.

## Qué movió la aguja de verdad

- desacoplar la localización en etapa 1 (` + '`YOLOv8m`' + `) de la puntuación de anomalía en etapa 2 sobre recortes ` + '`128×128`' + `
- exigir agrupación estricta por las ` + '`573`' + ` imágenes fuente
- reportar AUROC y desviación entre folds por cada tipo de rasgo
- publicar configuraciones Hydra, pesos y erratas con total transparencia
        `,
      },
      ar: {
        title: 'YOLOv8m لمراقبة الجودة الصناعية: كشف المرحلة الأولى وتقسيم البيانات بلا تسرب',
        excerpt:
          'ملاحظات هندسية حول استخدام YOLOv8m ككاشف للمرحلة الأولى (6,408 قصاصة 128×128 عبر 573 مجموعة صور في FTI_Zer0P)، ولماذا كان التحقق التقاطعي على مستوى الصورة أهم من تعديل البنية.',
        tags: ['الرؤية الحاسوبية', 'YOLOv8', 'الذكاء الاصطناعي الصناعي', 'PyTorch', 'Production ML'],
        readingTime: '10 دقائق قراءة',
        faq: [
          {
            question: 'لماذا استُخدم YOLOv8m ككاشف ومقتطع في المرحلة الأولى؟',
            answer:
              'تحوي إطارات الطباعة الصناعية (1920×1080) 8 أنواع ميزات محلية (نقاط، مسافات، حواف، زاوية). يكتشف YOLOv8m في المرحلة الأولى (25.86 مليون معامل في yolo_best.pt؛ ورد سهواً YOLOv8n في نص PDF الرسالة) هذه المناطق ويقتطع 6,408 قصاصات 128×128 عبر 573 صورة أصلية للمرحلة الثانية.',
          },
          {
            question: 'ماذا أظهر التقييم الخماسي الصارم على FTI_Zer0P؟',
            answer:
              'بتحقق تقاطعي طبقي من 5 طيات على مستوى الصورة عبر 573 مجموعة، حقق خط الأساس YOLO+CDM مقياس 0.8673 ± 0.0230 AUROC (ودقة 0.8094 ± 0.0151، عند K=100)، مع 0.9557 ± 0.0353 لـ Dots و0.9362 ± 0.0666 لـ Distance 6.',
          },
          {
            question: 'ما العامل الأهم فعلاً؟',
            answer:
              'تجميع الطيات حسب الصورة الأصلية لمنع التسرب، وتقييم كل نوع ميزة على حدة، وتشغيلات Hydra وPyTorch Lightning القابلة لإعادة الإنتاج.',
          },
        ],
        content: `
## هذا لم يكن مشروعاً تعليمياً عادياً

معظم مقالات YOLO تتوقف عند "درّب على بيانات كبيرة واذكر mAP". أما ضبط الجودة الصناعي فيفرض قيوداً مختلفة: 573 صورة أصلية فقط، وعدم توازن بين الفئات، وأشكال هندسية متباينة، وصفر تسامح مع تسرب البيانات بين الطيات.

## الكشف والاقتصاص في المرحلة الأولى باستخدام YOLOv8m

في خط **InkjetOOD** ذي المرحلتين، يعمل **YOLOv8m** صراحةً كـ **كاشف ومقتطع للمرحلة الأولى** (مدخل ` + '`640×640`' + ` على إطارات ` + '`1920×1080`' + `). *(ملاحظة تصويب: يصف نص الرسالة الكاشف بأنه YOLOv8n، بينما نقطة التحقق المنشورة ` + '`yolo_best.pt`' + ` هي ` + '`YOLOv8m`' + ` بـ 25.86 مليون معامل وفق ` + '`train_args`' + `.)*

تُقتطع كل منطقة ميزة مكتشفة (8 فئات: ` + '`angle`' + `، ` + '`dist1`' + `، ` + '`dist6`' + `، ` + '`dots`' + `، ` + '`edge1–4`' + `) ويُعاد تحجيمها ثنائياً إلى **128×128 RGB**. وعبر 573 مجموعة صور أصلية في **FTI_Zer0P** ينتج عن ذلك **6,408 قصاصات** لمصنف المرحلة الثانية التوليدي.

## انضباط البيانات قبل الحيل

عندما تنتج الصورة الواحدة نحو 11 قصاصة في المتوسط، فإن التقسيم العشوائي على مستوى القصاصة يسرّب سياق اللقطة نفسها بين التدريب والتحقق. التجميع الصارم حسب **الصورة الأصلية (` + '`573`' + ` مجموعة)** يحفظ كل قصاصات اللقطة في طية واحدة، كما يحفظ التحجيم المباشر إلى ` + '`128×128`' + ` دون توليد اصطناعي نسيجَ العيب الحقيقي.

## إعداد قابل لإعادة الإنتاج

\`\`\`python
pipeline = {
    "stage1_detector": "YOLOv8m (yolo_best.pt, 25.86M params, 640x640 input)",
    "stage2_crop_size": "128x128 RGB (6,408 crops / 573 source groups)",
    "stage2_classifier": "Multi-head AdaGN Diffusion UNet (NoisePredictorV3)",
    "cv_protocol": "5-fold image-level stratified CV, K=100 trials",
}
\`\`\`

## تقييم ذو معنى فعلي

على معيار **FTI_Zer0P** العام بتحقق تقاطعي من 5 طيات على مستوى الصورة (` + '`λ = 0.0`' + `)، بلغ خط الأساس **0.8673 ± 0.0230 AUROC** (` + '`0.8094 ± 0.0151`' + ` دقة). وتوضح نتائج كل ميزة الصورة الكاملة: حققت **Dots (0.9557 ± 0.0353)** و**Distance 6 (0.9362 ± 0.0666)** فصلاً قوياً، بينما سجلت الفئات الأقل وفرة مثل **Angle (9.67:1 سليم:معيب، 0.8166 ± 0.1381)** و**Edge 3 (0.7441 ± 0.0757)** تبايناً أكبر عبر الطيات.

## ما الذي أحدث الفرق فعلاً

- فصل تحديد المواضع في المرحلة الأولى (` + '`YOLOv8m`' + `) عن تقييم الشذوذ في المرحلة الثانية على قصاصات ` + '`128×128`' + `
- فرض التقسيم الصارم على مستوى الصور الـ ` + '`573`' + `
- الإبلاغ عن AUROC والانحراف المعياري لكل ميزة بدلاً من نتائج منتقاة
- نشر إعدادات Hydra والأوزان والتصويبات بشفافية كاملة
        `,
      },
    },
  },
]

function localizePost(post: BlogPost, lang: Language = 'en'): LocalizedBlogPost {
  const translation = post.translations[lang] ?? post.translations.en
  return {
    slug: post.slug,
    date: post.date,
    ogImage: post.ogImage,
    lastModified: post.lastModified,
    citation: post.citation,
    title: translation.title,
    excerpt: translation.excerpt,
    tags: translation.tags,
    content: translation.content,
    readingTime: translation.readingTime,
    faq: translation.faq,
  }
}

export function getRawBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRawBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getBlogPost(slug: string, lang: Language = 'en'): LocalizedBlogPost | undefined {
  const post = getRawBlogPost(slug)
  return post ? localizePost(post, lang) : undefined
}

export function getAllBlogPosts(lang: Language = 'en'): LocalizedBlogPost[] {
  return getRawBlogPosts().map((post) => localizePost(post, lang))
}
