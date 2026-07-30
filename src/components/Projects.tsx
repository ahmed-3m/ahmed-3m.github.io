'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 02 - Projects', de: '// 02 - Projekte', fr: '// 02 - Projets', es: '// 02 - Proyectos', ar: '// 02 - المشاريع' },
  title: { en: 'Research that ships.', de: 'Forschung, die produktiv wird.', fr: 'La recherche qui devient produit.', es: 'Investigación que llega a producción.', ar: 'بحث يتحول إلى منتج.' },
  live: { en: 'Live beta · @sihem_ai_bot', de: 'Live-Beta · @sihem_ai_bot', fr: 'Bêta en ligne · @sihem_ai_bot', es: 'Beta en vivo · @sihem_ai_bot', ar: 'نسخة تجريبية · @sihem_ai_bot' },
  faultrixEyebrow: { en: 'Project · 2025', de: 'Projekt · 2025', fr: 'Projet · 2025', es: 'Proyecto · 2025', ar: 'مشروع · 2025' },
  faultrix: {
    en: 'AI-powered construction quality control SaaS. Analyzes building photos and generates ONORM-compliant reports in under 1 minute - SHA-256 evidence chain, DSGVO compliant, AES-256 encryption. Built solo from zero to production.',
    de: 'KI-gestütztes SaaS für Bauqualitätskontrolle. Analysiert Baustellenfotos und erstellt ONORM-konforme Berichte in unter 1 Minute – SHA-256 Beweiskette, DSGVO-konform, AES-256 Verschlüsselung. Solo von null bis Produktion gebaut.',
    fr: "SaaS de contrôle qualité construction par IA. Analyse les photos de chantier et génère des rapports conformes ONORM en moins d'une minute - chaîne de preuve SHA-256, conforme DSGVO, chiffrement AES-256.",
    es: 'SaaS de control de calidad en construcción con IA. Analiza fotos de obra y genera informes compatibles con ONORM en menos de 1 minuto - cadena SHA-256, cumplimiento DSGVO, cifrado AES-256.',
    ar: 'منصة SaaS لمراقبة جودة البناء بالذكاء الاصطناعي. تحلل صور المواقع وتنشئ تقارير متوافقة مع ONORM خلال أقل من دقيقة مع سلسلة أدلة SHA-256 وتشفير AES-256.',
  },
  reportMetric: { en: 'min per report', de: 'Min. pro Bericht', fr: 'min par rapport', es: 'min por informe', ar: 'دقيقة لكل تقرير' },
  caseStudy: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  code: { en: 'Code', de: 'Code', fr: 'Code', es: 'Código', ar: 'الكود' },
  thesis: { en: "Master's Thesis - JKU Linz", de: 'Masterarbeit - JKU Linz', fr: 'Mémoire de master - JKU Linz', es: 'Tesis de master - JKU Linz', ar: 'رسالة ماجستير - JKU Linz' },
  oodTitle: { en: 'OOD Detection Framework', de: 'OOD-Erkennungsframework', fr: 'Framework de détection OOD', es: 'Framework de detección OOD', ar: 'إطار كشف الخارج عن التوزيع' },
  oodDesc: {
    en: 'Conditional diffusion models as generative classifiers achieving 99.03% +/- 0.07% average AUROC on a within-CIFAR airplane-vs-rest binary split (single ID class; not comparable to multi-class CIFAR-10 OOD benchmarks). Introduced class-conditional separation loss improving average performance by 6.5 percentage points with high seed stability.',
    de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren mit 99.03% +/- 0.07% durchschnittlichem AUROC auf einem Within-CIFAR Airplane-vs-Rest-Binary-Split (einzelne ID-Klasse). Die Separation Loss verbessert die Leistung stabil um 6.5 Prozentpunkte.',
    fr: 'Modèles de diffusion conditionnels utilisés comme classificateurs génératifs, avec 99.03% +/- 0.07% AUROC moyen sur un split binaire airplane-vs-rest within-CIFAR (classe ID unique). La separation loss améliore la stabilité et ajoute 6.5 points.',
    es: 'Modelos de difusión condicional como clasificadores generativos con 99.03% +/- 0.07% AUROC medio en un split binario airplane-vs-rest within-CIFAR (clase ID única). La separation loss mejora la estabilidad y suma 6.5 puntos.',
    ar: 'نماذج انتشار شرطية كمصنفات توليدية حققت 99.03% +/- 0.07% AUROC على تقسيم ثنائي airplane-vs-rest ضمن CIFAR-10 (فئة ID واحدة)، مع خسارة فصل حسنت الثبات والأداء بمقدار 6.5 نقطة.',
  },
  inkjetTitle: { en: 'InkjetOOD Defect Detection', de: 'InkjetOOD Defekterkennung', fr: 'Détection de défauts InkjetOOD', es: 'Detección de defectos InkjetOOD', ar: 'كشف العيوب InkjetOOD' },
  inkjetDesc: {
    en: 'YOLO+CDM quality classification pipeline evaluated on the public FTI_Zer0P benchmark under strict 5-fold cross-validation.',
    de: 'YOLO+CDM Pipeline für Qualitätsklassifikation, evaluiert auf dem öffentlichen FTI_Zer0P Benchmark mit strenger 5-facher Kreuzvalidierung.',
    fr: 'Pipeline YOLO+CDM pour la qualité, évaluée sur le benchmark public FTI_Zer0P avec validation croisée stricte en 5 plis.',
    es: 'Pipeline YOLO+CDM para clasificación de calidad, evaluado en el benchmark público FTI_Zer0P con validación cruzada estricta de 5 folds.',
    ar: 'خط معالجة YOLO+CDM لتصنيف الجودة، تم تقييمه على معيار FTI_Zer0P العام بتحقق تقاطعي صارم من 5 طيات.',
  },
  eegTitle: { en: 'EEG Signal Classification', de: 'EEG-Signalklassifikation', fr: 'Classification de signaux EEG', es: 'Clasificación de señales EEG', ar: 'تصنيف إشارات EEG' },
  eegDesc: {
    en: 'LSTM, Bi-LSTM, and GRU architectures for motor imagery classification in brain-computer interface applications.',
    de: 'LSTM-, Bi-LSTM- und GRU-Architekturen für Motor-Imagery-Klassifikation in Brain-Computer-Interfaces.',
    fr: "Architectures LSTM, Bi-LSTM et GRU pour la classification d'imagerie motrice dans les interfaces cerveau-ordinateur.",
    es: 'Arquitecturas LSTM, Bi-LSTM y GRU para clasificación de imaginación motora en interfaces cerebro-computadora.',
    ar: 'معماريات LSTM وBi-LSTM وGRU لتصنيف التخيل الحركي في تطبيقات واجهة الدماغ والحاسوب.',
  },
  mentoTitle: { en: 'Sihem — AI Mentor Assistant', de: 'Sihem — KI-Mentor-Assistent', fr: 'Sihem — Assistant mentor IA', es: 'Sihem — Asistente mentor con IA', ar: 'Sihem — مساعد موجه بالذكاء الاصطناعي' },
  mentoDesc: {
    en: 'A proactive personal-mentor assistant on Telegram that plans your week, sends morning briefings and evening reviews, and fires smart check-in triggers. Built on Supabase edge functions (Deno/TS) with a generic activity model (prayer, workouts, medication, custom habits — no schema change per type), a deterministic generators→arbiter→composer decision engine for adaptive nudging, pgvector long-term memory with RAG, multi-provider LLM routing (GLM/Gemini/Groq) with provider failover, multimodal meal-photo vision, TTS voice reminders (Cloudflare MeloTTS), Google Calendar sync, optional Alexa Echo integration, invite-code gated beta access, and an ops dashboard with cost rollups. Now in beta — try it on Telegram at @sihem_ai_bot.',
    de: 'Ein proaktiver persönlicher Mentor-Assistent auf Telegram, der die Woche plant, Morgenbriefings und Abendreviews sendet und intelligente Check-Ins auslöst. Gebaut auf Supabase Edge Functions (Deno/TS) mit einem generischen Aktivitätsmodell (Gebet, Workout, Medikation, eigene Gewohnheiten — keine Schema-Änderung pro Typ), einer deterministischen Generatoren→Arbiter→Komponor-Entscheidungsmaschine für adaptives Nudging, pgvector-Langzeitgedächtnis mit RAG, Multi-Provider-LLM-Routing (GLM/Gemini/Groq) mit Provider-Failover, multimodaler Essen-Foto-Erkennung, TTS-Spracherinnerungen (Cloudflare MeloTTS), Google-Kalender-Sync, optionaler Alexa-Echo-Integration, Beta-Zugang per Einladungscode und einem Ops-Dashboard mit Kostenauswertungen. Jetzt in der Beta — test es auf Telegram unter @sihem_ai_bot.',
    fr: 'Un assistant mentor personnel proactif sur Telegram qui planifie votre semaine, envoie des briefings matinaux et des revues du soir, et déclenche des check-ins intelligents. Construit sur Supabase edge functions (Deno/TS) avec un modèle d\'activité générique (prière, sport, médication, habitudes personnalisées — sans changement de schéma par type), un moteur de décision déterministe generateurs→arbitre→compositeur pour le nudging adaptatif, mémoire long terme pgvector avec RAG, routage LLM multi-fournisseurs (GLM/Gemini/Groq) avec failover, vision multimodale des photos de repas, rappels vocaux TTS (Cloudflare MeloTTS), synchro Google Calendar, intégration Alexa Echo optionnelle, accès beta géré par code d\'invitation, et un tableau de bord ops avec suivi des coûts. Désormais en beta — essayez-le sur Telegram à @sihem_ai_bot.',
    es: 'Un asistente mentor personal proactivo en Telegram que planifica tu semana, envía briefings matutinos y revisiones nocturnas, y activa check-ins inteligentes. Construido sobre Supabase edge functions (Deno/TS) con un modelo de actividad genérico (oración, ejercicio, medicación, hábitos personalizados — sin cambio de esquema por tipo), un motor de decisión determinista generadores→árbitro→compositor para nudging adaptativo, memoria a largo plazo pgvector con RAG, enrutamiento LLM multiproveedor (GLM/Gemini/Groq) con failover, visión multimodal de fotos de comidas, recordatorios de voz TTS (Cloudflare MeloTTS), sincronización con Google Calendar, integración opcional con Alexa Echo, acceso beta por código de invitación, y un panel de ops con seguimiento de costos. Ahora en beta — pruébalo en Telegram en @sihem_ai_bot.',
    ar: 'مساعد موجّه شخصي استباقي على تيليجرام يخطط أسبوعك، ويرسل موجزات صباحية ومراجعات مسائية، ويطلق تنبيهات ذكية للتحقق. مبني على Supabase edge functions (Deno/TS) مع نموذج نشاط عام (الصلاة، التمارين، الأدوية، العادات المخصصة — بدون تغيير المخطط لكل نوع)، محرك قرار حتمي (مولدات→محكّم→مؤلف) للتنبيه التكيّفي، ذاكرة طويلة المدى pgvector مع RAG، توجيه LLM متعدد المزودين (GLM/Gemini/Groq) مع تبديل المزود، رؤية متعددة الوسائط لصور الطعام، تذكيرات صوتية TTS (Cloudflare MeloTTS)، مزامنة Google Calendar، تكامل اختياري مع Alexa Echo، وصول تجريبي برمز دعوة، ولوحة تشغيل مع تتبع التكاليف. الآن في النسخة التجريبية — جرّبه على تيليجرام عبر @sihem_ai_bot.',
  },
} satisfies Record<string, TranslationMap>

export default function Projects() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="projects" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title">{t(copy.title)}</h2>

        <div className="cd-projects-grid">
          <article className="cd-project-featured reveal">
            <div>
              <div className="cd-proj-eyebrow">{t(copy.live)}</div>
              <div className="cd-proj-title">{t(copy.mentoTitle)}</div>
              <div className="cd-proj-desc">{t(copy.mentoDesc)}</div>
              <div className="cd-proj-tags">
                {['Deno / TS', 'Supabase Edge Functions', 'pgvector RAG', 'LLM Routing', 'pg_cron', 'Telegram'].map(tag => (
                  <span key={tag} className="cd-proj-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="cd-proj-metric-big">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cd-fg3)' }}>
                Telegram bot · PWA · pgvector memory
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <a href="https://t.me/sihem_ai_bot" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>Telegram &rarr;</a>
                <a href="https://sihem-pwa.pages.dev/" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12, opacity: 0.78 }}>PWA &rarr;</a>
              </div>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">{t(copy.thesis)}</div>
            <div className="cd-pc-title">{t(copy.oodTitle)}</div>
            <div className="cd-pc-desc">{t(copy.oodDesc)}</div>
            <div className="cd-pc-metric">99.03%<span> +/- 0.07% Avg AUROC</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
              <a href="/case-studies/diffusion-ood" className="cd-proj-link" style={{ fontSize: 12, opacity: 0.65 }}>{t(copy.caseStudy)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card reveal">
            <div className="cd-pc-eyebrow">Master&apos;s Thesis Track 2</div>
            <div className="cd-pc-title">{t(copy.inkjetTitle)}</div>
            <div className="cd-pc-desc">{t(copy.inkjetDesc)}</div>
            <div className="cd-pc-metric">0.8673<span> AUROC (5-Fold CV)</span></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
              <a href="/case-studies/inkjet-ood" className="cd-proj-link" style={{ fontSize: 12, opacity: 0.65 }}>{t(copy.caseStudy)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card cd-project-card--full reveal">
            <div className="cd-pc-eyebrow">{t(copy.faultrixEyebrow)}</div>
            <div className="cd-pc-title">Faultrix</div>
            <div className="cd-pc-desc">{t(copy.faultrix)}</div>
            <div className="cd-pc-metric">&lt;1<span> {t(copy.reportMetric)}</span></div>
            <div className="cd-proj-tags" style={{ marginTop: 12 }}>
              {['Next.js', 'Convex', 'OpenAI', 'Clerk', 'Cloudflare R2', 'Stripe'].map(tag => (
                <span key={tag} className="cd-proj-tag">{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://faultrix.com" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>faultrix.com &rarr;</a>
              <a href="/case-studies/faultrix" className="cd-proj-link" style={{ fontSize: 12, opacity: 0.65 }}>{t(copy.caseStudy)} &rarr;</a>
            </div>
          </article>

          <article className="cd-project-card cd-project-card--full reveal">
            <div className="cd-pc-eyebrow">Karunya University · BCI Research</div>
            <div className="cd-pc-title">{t(copy.eegTitle)}</div>
            <div className="cd-pc-desc">{t(copy.eegDesc)}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <a href="https://github.com/ahmed-3m/Motor-Imagery-classification" target="_blank" rel="noopener noreferrer" className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.code)} &rarr;</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
