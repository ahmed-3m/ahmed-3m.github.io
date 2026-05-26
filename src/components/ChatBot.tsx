'use client'

import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { languageName, translateValue, type Language, type TranslationMap } from '@/lib/i18n-config'

type ChatRole = 'user' | 'assistant'
type ApiRole = ChatRole | 'system'
type PromptId =
  | 'faultrix_intro'
  | 'faultrix_stack'
  | 'faultrix_build'
  | 'faultrix_story'
  | 'faultrix_speed'
  | 'faultrix_compliance'
  | 'thesis_summary'
  | 'thesis_innovation'
  | 'thesis_loss'
  | 'thesis_datasets'
  | 'thesis_results'
  | 'thesis_diffusion'
  | 'projects_best'
  | 'achievements'
  | 'open_to_work'
  | 'contact'
  | 'tech_stack'
  | 'industrial_pipeline'
  | 'industrial_result'
  | 'product_story'

type ChatMessage = {
  role: ChatRole
  content: string
  followUps?: PromptId[]
}

type ApiMessage = {
  role: ApiRole
  content: string
}

type ApiErrorDetail = { message?: string; type?: string; code?: string }

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
}

type ProviderConfig = {
  name: 'Groq' | 'Z.ai'
  token: string
  url: string
  body: Record<string, unknown>
}

type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: ProviderConfig['name']
}

const GROQ_MODEL = 'llama-3.1-8b-instant'
const ZAI_MODEL = 'glm-4.5-airx'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const ZAI_CHAT_URL = 'https://api.z.ai/api/paas/v4/chat/completions'
const MAX_REPLY_CHARS = 1600
const GENIE_NAME = 'Genie\u{1F9DE}\u200D\u2642\uFE0F'

const SYSTEM_PROMPT = `You are ${GENIE_NAME}, Ahmed Mohammed's personal assistant.

Introduce yourself as ${GENIE_NAME} whenever the user asks who you are or when a brief introduction is helpful.

Only answer questions about Ahmed Mohammed's work, research, products, projects, education, experience, and contact details.

Response rules:
- Answer in the selected language.
- Keep metrics, equations, dataset names, product names, repository names, and links unchanged.
- Default to a medium-full answer of roughly 120-220 words unless the user asks for a short or detailed answer.
- Lead with the direct answer, then give the most useful context.
- Use short paragraphs or compact bullets.
- If the user asks something unrelated, politely redirect to Ahmed's work and background.

Facts you can rely on:
- Ahmed Mohammed is an AI/ML Engineer and entrepreneur based in Linz, Austria.
- He completed an M.Sc. in Artificial Intelligence at JKU Linz under Prof. Sepp Hochreiter.
- His thesis used conditional diffusion models as generative classifiers for OOD detection and reached 99.03% +/- 0.07% average AUROC on CIFAR-10 with separation loss.
- Seed-42 achieved 98.98% AUROC within-CIFAR and generalized zero-shot to CIFAR-100, Places365, FashionMNIST, Textures, and SVHN.
- The non-separated baseline was 92.52% +/- 11.07%, so separation loss added about +6.5 percentage points and dramatically reduced variance.
- Ahmed also worked on industrial defect detection at PROFACTOR GmbH / JKU Linz using a YOLO + conditional diffusion pipeline on the public FTI_Zer0P benchmark, reaching a 0.8673 +/- 0.0230 AUROC baseline under strict 5-fold cross-validation.
- Ahmed founded Faultrix, an AI-powered construction quality-control SaaS that analyzes construction photos and generates ONORM-aligned reports in under 1 minute.
- Faultrix stack includes Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, and Stripe.
- Contact: ahmed.mo.0595@gmail.com
- LinkedIn: https://www.linkedin.com/in/ahmed-3m/
- GitHub: https://github.com/ahmed-3m
- Website: https://ahmed-3m.github.io
`

const CHAT_COPY = {
  dialogLabel: {
    en: 'Ask Genie',
    de: 'Fragen zu Ahmed',
    fr: 'Questions sur Ahmed',
    es: 'Preguntar sobre Ahmed',
    ar: 'اسأل عن أحمد',
  },
  title: {
    en: GENIE_NAME,
    de: 'Fragen zu Ahmed',
    fr: 'Questions sur Ahmed',
    es: 'Preguntar sobre Ahmed',
    ar: 'اسأل عن أحمد',
  },
  welcome: {
    en: `Hi, I'm ${GENIE_NAME}, Ahmed's Personal assistance. Ask me about Ahmed's research, products, projects, or background.`,
    de: 'Frage nach Ahmeds Forschung, Produkten, Projekten oder Hintergrund.',
    fr: 'Posez une question sur la recherche, les produits, les projets ou le parcours d Ahmed.',
    es: 'Pregunta sobre la investigacion, los productos, los proyectos o la trayectoria de Ahmed.',
    ar: 'اسأل عن أبحاث أحمد أو منتجاته أو مشاريعه أو خلفيته.',
  },
  placeholder: {
    en: 'Ask Genie...',
    de: 'Frage zu Ahmed...',
    fr: 'Question sur Ahmed...',
    es: 'Pregunta sobre Ahmed...',
    ar: 'اسأل عن أحمد...',
  },
  close: {
    en: 'Close chat',
    de: 'Chat schliessen',
    fr: 'Fermer le chat',
    es: 'Cerrar chat',
    ar: 'إغلاق الدردشة',
  },
  open: {
    en: 'Open chat',
    de: 'Chat offnen',
    fr: 'Ouvrir le chat',
    es: 'Abrir chat',
    ar: 'فتح الدردشة',
  },
  send: {
    en: 'Send message',
    de: 'Nachricht senden',
    fr: 'Envoyer le message',
    es: 'Enviar mensaje',
    ar: 'إرسال الرسالة',
  },
  typing: {
    en: 'Genie is typing',
    de: 'Ahmed schreibt',
    fr: 'Ahmed repond',
    es: 'Ahmed esta respondiendo',
    ar: 'أحمد يكتب الآن',
  },
  missingToken: {
    en: 'Add NEXT_PUBLIC_GROQ_TOKEN or NEXT_PUBLIC_ZAI_TOKEN to enable the assistant.',
    de: 'Fuge NEXT_PUBLIC_GROQ_TOKEN oder NEXT_PUBLIC_ZAI_TOKEN hinzu, um den Assistenten zu aktivieren.',
    fr: 'Ajoutez NEXT_PUBLIC_GROQ_TOKEN ou NEXT_PUBLIC_ZAI_TOKEN pour activer l assistant.',
    es: 'Agrega NEXT_PUBLIC_GROQ_TOKEN o NEXT_PUBLIC_ZAI_TOKEN para activar el asistente.',
    ar: 'أضف NEXT_PUBLIC_GROQ_TOKEN أو NEXT_PUBLIC_ZAI_TOKEN لتفعيل المساعد.',
  },
  genericError: {
    en: 'Something went wrong while contacting the assistant.',
    de: 'Beim Kontakt mit dem Assistenten ist etwas schiefgelaufen.',
    fr: 'Une erreur est survenue pendant le contact avec l assistant.',
    es: 'Ocurrio un problema al contactar al asistente.',
    ar: 'حدث خطأ أثناء الاتصال بالمساعد.',
  },
} satisfies Record<string, TranslationMap>

const PROMPTS: Record<PromptId, TranslationMap> = {
  faultrix_intro: {
    en: 'What is Faultrix?',
    de: 'Was ist Faultrix?',
    fr: 'Qu est-ce que Faultrix ?',
    es: 'Que es Faultrix?',
    ar: 'ما هو Faultrix؟',
  },
  faultrix_stack: {
    en: "What's the Faultrix tech stack?",
    de: 'Wie sieht der Faultrix Tech-Stack aus?',
    fr: 'Quel est le stack technique de Faultrix ?',
    es: 'Cual es el stack tecnico de Faultrix?',
    ar: 'ما هو الـ stack التقني في Faultrix؟',
  },
  faultrix_build: {
    en: 'How was Faultrix built?',
    de: 'Wie wurde Faultrix gebaut?',
    fr: 'Comment Faultrix a-t-il ete construit ?',
    es: 'Como se construyo Faultrix?',
    ar: 'كيف تم بناء Faultrix؟',
  },
  faultrix_story: {
    en: 'Can I see the product story?',
    de: 'Kann ich die Produktgeschichte sehen?',
    fr: 'Puis-je voir l histoire du produit ?',
    es: 'Puedo ver la historia del producto?',
    ar: 'هل يمكنني رؤية قصة المنتج؟',
  },
  faultrix_speed: {
    en: 'How long does a report take?',
    de: 'Wie lange dauert ein Bericht?',
    fr: 'Combien de temps prend un rapport ?',
    es: 'Cuanto tarda un informe?',
    ar: 'كم يستغرق التقرير؟',
  },
  faultrix_compliance: {
    en: 'Is Faultrix DSGVO compliant?',
    de: 'Ist Faultrix DSGVO-konform?',
    fr: 'Faultrix est-il conforme DSGVO ?',
    es: 'Faultrix cumple con DSGVO?',
    ar: 'هل Faultrix متوافق مع DSGVO؟',
  },
  thesis_summary: {
    en: 'Tell me about the thesis',
    de: 'Erzahl mir von der Thesis',
    fr: 'Parlez-moi du memoire',
    es: 'Cuentame sobre la tesis',
    ar: 'حدثني عن الرسالة',
  },
  thesis_innovation: {
    en: "What's the key innovation in the thesis?",
    de: 'Was ist die Kerninnovation der Thesis?',
    fr: 'Quelle est l innovation cle du memoire ?',
    es: 'Cual es la innovacion principal de la tesis?',
    ar: 'ما هي الفكرة الجديدة الأساسية في الرسالة؟',
  },
  thesis_loss: {
    en: 'How does the separation loss work?',
    de: 'Wie funktioniert die Separation Loss?',
    fr: 'Comment fonctionne la separation loss ?',
    es: 'Como funciona la separation loss?',
    ar: 'كيف تعمل separation loss؟',
  },
  thesis_datasets: {
    en: 'What datasets were tested?',
    de: 'Welche Datensatze wurden getestet?',
    fr: 'Quels jeux de donnees ont ete testes ?',
    es: 'Que datasets se probaron?',
    ar: 'ما هي البيانات التي تم اختبارها؟',
  },
  thesis_results: {
    en: 'What was the best AUROC?',
    de: 'Was war der beste AUROC?',
    fr: 'Quel a ete le meilleur AUROC ?',
    es: 'Cual fue el mejor AUROC?',
    ar: 'ما أفضل نتيجة AUROC؟',
  },
  thesis_diffusion: {
    en: 'Why use diffusion for OOD?',
    de: 'Warum Diffusion fuer OOD?',
    fr: 'Pourquoi utiliser la diffusion pour OOD ?',
    es: 'Por que usar difusion para OOD?',
    ar: 'لماذا استخدام نماذج الانتشار في OOD؟',
  },
  projects_best: {
    en: 'What projects should I see?',
    de: 'Welche Projekte sollte ich mir ansehen?',
    fr: 'Quels projets devrais-je voir ?',
    es: 'Que proyectos deberia ver?',
    ar: 'ما المشاريع التي يجب أن أراها؟',
  },
  achievements: {
    en: 'Show key achievements',
    de: 'Zeige wichtige Erfolge',
    fr: 'Montre les principales realisations',
    es: 'Muestrame los logros clave',
    ar: 'اعرض أهم الإنجازات',
  },
  open_to_work: {
    en: 'Is he open to work?',
    de: 'Ist er offen fuer neue Rollen?',
    fr: 'Est-il ouvert a des opportunites ?',
    es: 'Esta abierto a nuevas oportunidades?',
    ar: 'هل هو متاح لفرص عمل؟',
  },
  contact: {
    en: 'How can I contact him?',
    de: 'Wie kann ich ihn kontaktieren?',
    fr: 'Comment puis-je le contacter ?',
    es: 'Como puedo contactarlo?',
    ar: 'كيف يمكنني التواصل معه؟',
  },
  tech_stack: {
    en: "What's his tech stack?",
    de: 'Wie sieht sein Tech-Stack aus?',
    fr: 'Quel est son stack technique ?',
    es: 'Cual es su stack tecnico?',
    ar: 'ما هو الـ stack التقني الخاص به؟',
  },
  industrial_pipeline: {
    en: 'How does the industrial YOLO + diffusion pipeline work?',
    de: 'Wie funktioniert die industrielle YOLO + Diffusion Pipeline?',
    fr: 'Comment fonctionne la pipeline industrielle YOLO + diffusion ?',
    es: 'Como funciona la pipeline industrial de YOLO + difusion?',
    ar: 'كيف يعمل خط YOLO + diffusion الصناعي؟',
  },
  industrial_result: {
    en: 'What result did the industrial system achieve?',
    de: 'Welches Ergebnis erreichte das Industriesystem?',
    fr: 'Quel resultat le systeme industriel a-t-il atteint ?',
    es: 'Que resultado logro el sistema industrial?',
    ar: 'ما النتيجة التي حققها النظام الصناعي؟',
  },
  product_story: {
    en: 'What did he learn from building Faultrix?',
    de: 'Was hat er beim Bau von Faultrix gelernt?',
    fr: 'Qu a-t-il appris en construisant Faultrix ?',
    es: 'Que aprendio construyendo Faultrix?',
    ar: 'ماذا تعلم من بناء Faultrix؟',
  },
}

const DEFAULT_PROMPTS: PromptId[] = [
  'faultrix_intro',
  'thesis_summary',
  'tech_stack',
  'open_to_work',
  'achievements',
  'contact',
]

const FOLLOWUP_RULES: Array<{ pattern: RegExp; prompts: PromptId[] }> = [
  {
    pattern: /faultrix|construction|report|onorm|dsgvo|sha|aes/i,
    prompts: ['faultrix_stack', 'faultrix_speed', 'faultrix_compliance', 'faultrix_build', 'faultrix_story', 'product_story'],
  },
  {
    pattern: /thesis|ood|out.?of.?distribution|diffusion|auroc|cifar|separation loss/i,
    prompts: ['thesis_innovation', 'thesis_loss', 'thesis_datasets', 'thesis_results', 'thesis_diffusion', 'industrial_result'],
  },
  {
    pattern: /industrial|profactor|inkjet|yolo|zer0p|benchmark/i,
    prompts: ['industrial_pipeline', 'industrial_result', 'thesis_loss', 'projects_best'],
  },
  {
    pattern: /project|github|work|portfolio/i,
    prompts: ['projects_best', 'achievements', 'thesis_summary', 'faultrix_intro'],
  },
  {
    pattern: /job|role|hire|available|open to work|contact|email|linkedin/i,
    prompts: ['open_to_work', 'contact', 'achievements', 'tech_stack'],
  },
]

function isConfiguredToken(token: string | undefined): token is string {
  return Boolean(token && token !== 'your_groq_token_here' && token !== 'your_zai_token_here')
}

function shortenReply(reply: string): string {
  if (reply.length <= MAX_REPLY_CHARS) return reply

  const compact = reply.replace(/\n{3,}/g, '\n\n').trim()
  const boundary = Math.max(
    compact.lastIndexOf('\n', MAX_REPLY_CHARS),
    compact.lastIndexOf('.', MAX_REPLY_CHARS),
    compact.lastIndexOf('!', MAX_REPLY_CHARS),
    compact.lastIndexOf('?', MAX_REPLY_CHARS)
  )
  const end = boundary > 900 ? boundary + 1 : MAX_REPLY_CHARS
  return `${compact.slice(0, end).trim()}...`
}

function createChatError(
  message: string,
  provider: ProviderConfig['name'],
  status?: number,
  code?: string
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  return error
}

function isGroqLimitError(error: unknown): error is ChatCompletionError {
  if (!(error instanceof Error)) return false

  const err = error as ChatCompletionError
  const message = err.message.toLowerCase()
  return (
    err.provider === 'Groq' &&
    (err.status === 429 ||
      err.code === 'rate_limit_exceeded' ||
      err.code === 'quota_exceeded' ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('limit reached'))
  )
}

async function requestChatCompletion(provider: ProviderConfig): Promise<string> {
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(provider.body),
  })

  const data = (await response.json()) as ChatCompletionResponse

  if (!response.ok) {
    const errorDetail = typeof data.error === 'string' ? undefined : data.error
    const message =
      typeof data.error === 'string'
        ? data.error
        : errorDetail?.message ?? `${provider.name} could not respond right now.`

    if (provider.name === 'Groq' && response.status === 503) {
      throw createChatError('Model is warming up, try again in a moment.', provider.name, response.status)
    }

    throw createChatError(message, provider.name, response.status, errorDetail?.code)
  }

  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw createChatError(`${provider.name} returned an empty response.`, provider.name)
  return reply
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const renderLinkedText = (value: string, segmentKey: string): ReactNode[] => {
    const linkPattern = /((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi
    const nodes: ReactNode[] = []
    let lastIndex = 0
    let matchIndex = 0

    for (const match of value.matchAll(linkPattern)) {
      const raw = match[0]
      const start = match.index ?? 0
      const end = start + raw.length

      if (start > lastIndex) {
        nodes.push(value.slice(lastIndex, start))
      }

      const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(raw)
      const href = isEmail ? `mailto:${raw}` : raw.startsWith('http') ? raw : `https://${raw}`
      const display = raw.replace(/[),.;!?]+$/, '')
      const trailing = raw.slice(display.length)

      nodes.push(
        <a
          key={`${segmentKey}-link-${matchIndex++}`}
          href={isEmail ? `mailto:${display}` : display.startsWith('http') ? display : `https://${display}`}
          target={isEmail ? undefined : '_blank'}
          rel={isEmail ? undefined : 'noopener noreferrer'}
          style={{
            color: 'inherit',
            textDecoration: 'underline',
            textUnderlineOffset: '0.18em',
            textDecorationColor: 'color-mix(in srgb, currentColor 55%, transparent)',
          }}
        >
          {display}
        </a>
      )

      if (trailing) nodes.push(trailing)
      lastIndex = end
    }

    if (lastIndex < value.length) {
      nodes.push(value.slice(lastIndex))
    }

    return nodes.length > 0 ? nodes : [value]
  }

  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${keyPrefix}-b${index}`}>{renderLinkedText(part.slice(2, -2), `${keyPrefix}-b${index}`)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={`${keyPrefix}-i${index}`}>{renderLinkedText(part.slice(1, -1), `${keyPrefix}-i${index}`)}</em>
    }
    return <span key={`${keyPrefix}-t${index}`}>{renderLinkedText(part, `${keyPrefix}-t${index}`)}</span>
  })
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const result: ReactNode[] = []
  const pending: string[] = []
  let keyIndex = 0

  const flushList = () => {
    if (pending.length === 0) return
    const key = `ul-${keyIndex++}`
    result.push(
      <ul key={key} style={{ paddingLeft: '1.1em', margin: '0.25em 0', listStyleType: 'disc' }}>
        {pending.map((item, index) => (
          <li key={`${key}-${index}`} style={{ margin: '0.1em 0' }}>
            {renderInline(item, `${key}-${index}`)}
          </li>
        ))}
      </ul>
    )
    pending.length = 0
  }

  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    const bullet = line.match(/^[-*]\s+(.+)/)

    if (heading) {
      flushList()
      result.push(
        <span key={`h-${index}`} style={{ display: 'block', fontWeight: 600, marginTop: '0.5em', marginBottom: '0.1em' }}>
          {renderInline(heading[2], `h-${index}`)}
        </span>
      )
    } else if (bullet) {
      pending.push(bullet[1])
    } else {
      flushList()
      if (!line.trim()) {
        if (result.length > 0) result.push(<div key={`sp-${index}`} style={{ height: '0.4em' }} />)
      } else {
        result.push(
          <span key={`l-${index}`} style={{ display: 'block' }}>
            {renderInline(line, `l-${index}`)}
          </span>
        )
      }
    }
  }

  flushList()
  return <>{result}</>
}

function trackChatEvent(question: string) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-expect-error gtag is injected by analytics
    window.gtag('event', 'chat_message', {
      event_category: 'chatbot',
      event_label: question.slice(0, 100),
    })
  }
}

function useCurrentSection() {
  const [section, setSection] = useState('research')

  useEffect(() => {
    const sections = ['hero', 'about', 'projects', 'experience', 'research', 'writing', 'contact']

    const pickFromViewport = () => {
      if (window.location.hash) {
        setSection(window.location.hash.replace('#', ''))
        return
      }

      let best = 'research'
      let bestDistance = Number.POSITIVE_INFINITY

      for (const id of sections) {
        const element = document.getElementById(id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top - 140)
        if (rect.bottom > 120 && distance < bestDistance) {
          best = id
          bestDistance = distance
        }
      }

      setSection(best)
    }

    pickFromViewport()
    window.addEventListener('hashchange', pickFromViewport)
    window.addEventListener('scroll', pickFromViewport, { passive: true })
    window.addEventListener('resize', pickFromViewport)

    return () => {
      window.removeEventListener('hashchange', pickFromViewport)
      window.removeEventListener('scroll', pickFromViewport)
      window.removeEventListener('resize', pickFromViewport)
    }
  }, [])

  return section
}

function getStarterPrompts(section: string): PromptId[] {
  if (section === 'research') {
    return ['thesis_summary', 'thesis_loss', 'thesis_results', 'industrial_result', 'achievements', 'contact']
  }
  if (section === 'projects') {
    return ['faultrix_intro', 'projects_best', 'tech_stack', 'faultrix_build', 'product_story', 'contact']
  }
  if (section === 'contact') {
    return ['open_to_work', 'contact', 'achievements', 'tech_stack', 'faultrix_intro', 'thesis_summary']
  }
  return DEFAULT_PROMPTS
}

function uniquePromptIds(items: PromptId[]): PromptId[] {
  return [...new Set(items)]
}

function generateFollowUps(reply: string, question: string, section: string): PromptId[] {
  const context = `${section} ${question} ${reply}`
  for (const rule of FOLLOWUP_RULES) {
    if (rule.pattern.test(context)) return uniquePromptIds(rule.prompts).slice(0, 4)
  }
  return uniquePromptIds(getStarterPrompts(section)).slice(0, 4)
}

const panelStyle = {
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--cd-surf) 92%, var(--cd-bg) 8%) 0%, var(--cd-elev) 100%)',
  borderColor: 'var(--cd-b0)',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.24)',
  fontFamily: 'var(--font-body)',
} satisfies CSSProperties

const bubbleStyles = {
  assistant: {
    background: 'color-mix(in srgb, var(--cd-elev) 78%, var(--cd-bg) 22%)',
    borderColor: 'var(--cd-b0)',
    color: 'var(--cd-fg1)',
  },
  user: {
    background: 'linear-gradient(135deg, var(--cd-accent) 0%, color-mix(in srgb, var(--cd-accent) 70%, var(--cd-success) 30%) 100%)',
    borderColor: 'var(--cd-b-accent)',
    color: 'var(--cd-bg)',
  },
} satisfies Record<ChatRole, CSSProperties>

const chipStyle = {
  borderColor: 'var(--cd-b0)',
  background: 'color-mix(in srgb, var(--cd-surf) 70%, var(--cd-bg) 30%)',
  color: 'var(--cd-fg2)',
} satisfies CSSProperties

function GenieOrb({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="genie-orb relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 28%, rgba(176, 245, 255, 0.98) 0%, rgba(95, 159, 255, 0.9) 20%, rgba(24, 38, 79, 0.98) 58%, rgba(10, 13, 24, 1) 100%)',
        boxShadow:
          '0 0 0 1px rgba(159, 228, 255, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.18), 0 10px 24px rgba(26, 57, 163, 0.38)',
      }}
    >
      <span
        className="absolute inset-[8%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
          mixBlendMode: 'screen',
        }}
      />
      <span className="genie-orbit genie-orbit-a" />
      <span className="genie-orbit genie-orbit-b" />
      <span className="genie-orbit genie-orbit-c" />
      <span className="genie-core" />
    </span>
  )
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
      style={bubbleStyles.assistant}
      aria-label={label}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--cd-accent)',
            animation: `pulse-dot 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const { lang, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentSection = useCurrentSection()
  const messagesRef = useRef<HTMLDivElement>(null)

  const starterPrompts = useMemo(() => getStarterPrompts(currentSection), [currentSection])

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  function labelForPrompt(promptId: PromptId) {
    return translateValue(lang, PROMPTS[promptId])
  }

  async function sendMessage(messageText: string) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const groqToken = process.env.NEXT_PUBLIC_GROQ_TOKEN
    const zaiToken = process.env.NEXT_PUBLIC_ZAI_TOKEN ?? process.env.NEXT_PUBLIC_ZAI_API_KEY
    const hasGroqToken = isConfiguredToken(groqToken)
    const hasZaiToken = isConfiguredToken(zaiToken)

    if (!hasGroqToken && !hasZaiToken) {
      setError(t(CHAT_COPY.missingToken))
      return
    }

    const nextUserMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, nextUserMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)
    trackChatEvent(content)

    try {
      const payloadMessages: ApiMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content: `Answer in ${languageName[lang]}. Keep names, product names, repository names, equations, metrics, and links unchanged.`,
        },
        {
          role: 'system',
          content: `The user is currently viewing the "${currentSection}" section of the portfolio. Prefer relevant context when it helps.`,
        },
        ...nextMessages.map(({ role, content: messageContent }) => ({ role, content: messageContent })),
      ]

      const groqProvider: ProviderConfig | null = hasGroqToken
        ? {
            name: 'Groq',
            token: groqToken,
            url: GROQ_CHAT_URL,
            body: {
              model: GROQ_MODEL,
              messages: payloadMessages,
              max_tokens: 380,
              temperature: 0.5,
            },
          }
        : null

      const zaiProvider: ProviderConfig | null = hasZaiToken
        ? {
            name: 'Z.ai',
            token: zaiToken,
            url: ZAI_CHAT_URL,
            body: {
              model: ZAI_MODEL,
              messages: payloadMessages,
              max_tokens: 380,
              temperature: 0.5,
              stream: false,
              thinking: { type: 'disabled' },
            },
          }
        : null

      let rawReply: string
      try {
        rawReply = groqProvider
          ? await requestChatCompletion(groqProvider)
          : await requestChatCompletion(zaiProvider!)
      } catch (providerError) {
        if (!isGroqLimitError(providerError) || !zaiProvider) throw providerError
        rawReply = await requestChatCompletion(zaiProvider)
      }

      const reply = shortenReply(rawReply)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          followUps: generateFollowUps(reply, content, currentSection),
        },
      ])
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t(CHAT_COPY.genericError))
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handlePrompt(promptId: PromptId) {
    void sendMessage(labelForPrompt(promptId))
  }

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 z-[9998] w-[min(400px,calc(100vw-2rem))] transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <section
          id="ahmed-chatbot-panel"
          className="flex h-[min(560px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[28px] border"
          style={panelStyle}
          role="dialog"
          aria-label={t(CHAT_COPY.dialogLabel)}
        >
          <header
            className="flex items-center justify-between border-b px-4 py-4"
            style={{ borderColor: 'var(--cd-b0)' }}
          >
            <h2 className="text-sm font-semibold tracking-[0.02em]" style={{ color: 'var(--cd-fg1)' }}>
              {t(CHAT_COPY.title)}
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: 'var(--cd-b0)',
                background: 'color-mix(in srgb, var(--cd-surf) 74%, var(--cd-bg) 26%)',
                color: 'var(--cd-fg2)',
              }}
              aria-label={t(CHAT_COPY.close)}
            >
              <X size={17} />
            </button>
          </header>

          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div
                  className="max-w-[92%] rounded-2xl border px-3 py-3 text-sm leading-6"
                  style={bubbleStyles.assistant}
                >
                  {t(CHAT_COPY.welcome)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((promptId) => (
                    <button
                      key={promptId}
                      type="button"
                      onClick={() => handlePrompt(promptId)}
                      disabled={isLoading}
                      className="rounded-full border px-3 py-2 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      style={chipStyle}
                    >
                      {labelForPrompt(promptId)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  !messages.slice(index + 1).some((item) => item.role === 'assistant')

                return (
                  <div key={`${message.role}-${index}`} className="space-y-2">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-2xl border px-3 py-2.5 text-sm leading-6 shadow-[0_12px_32px_rgba(0,0,0,0.14)]${
                          message.role === 'user' ? ' whitespace-pre-wrap' : ''
                        }`}
                        style={bubbleStyles[message.role]}
                      >
                        {message.role === 'assistant' ? renderMarkdown(message.content) : message.content}
                      </div>
                    </div>

                    {isLastAssistant && !isLoading && message.followUps && message.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {message.followUps.map((promptId) => (
                          <button
                            key={promptId}
                            type="button"
                            onClick={() => handlePrompt(promptId)}
                            disabled={isLoading}
                            className="rounded-full border px-3 py-1.5 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                            style={chipStyle}
                          >
                            {labelForPrompt(promptId)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {isLoading && (
              <div className="flex justify-start">
                <LoadingDots label={t(CHAT_COPY.typing)} />
              </div>
            )}
          </div>

          <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--cd-b0)' }}>
            {error && (
              <p className="mb-3 text-xs leading-5" style={{ color: 'var(--cd-warn)' }}>
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t(CHAT_COPY.placeholder)}
                className="h-12 flex-1 rounded-2xl border px-4 text-sm outline-none transition-colors"
                style={{
                  borderColor: 'var(--cd-b0)',
                  background: 'color-mix(in srgb, var(--cd-surf) 70%, var(--cd-bg) 30%)',
                  color: 'var(--cd-fg1)',
                }}
                aria-label={t(CHAT_COPY.dialogLabel)}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'var(--cd-accent)',
                  color: 'var(--cd-bg)',
                  boxShadow: '0 12px 30px color-mix(in srgb, var(--cd-accent) 28%, transparent)',
                }}
                aria-label={t(CHAT_COPY.send)}
              >
                <ArrowUp size={17} />
              </button>
            </form>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group fixed bottom-6 right-6 z-[9999] inline-flex h-14 items-center gap-2 overflow-hidden rounded-full border pl-1.5 pr-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:pr-5 focus-visible:pr-5"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 26, 36, 0.96) 0%, rgba(49, 44, 40, 0.98) 100%)',
          borderColor: 'rgba(205, 189, 145, 0.28)',
          color: '#f3eee4',
          boxShadow: '0 18px 40px rgba(7, 11, 20, 0.38)',
        }}
        aria-expanded={isOpen}
        aria-controls="ahmed-chatbot-panel"
        aria-label={isOpen ? t(CHAT_COPY.close) : t(CHAT_COPY.open)}
      >
        <GenieOrb />
        <span
          className={`whitespace-nowrap text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
            isOpen ? 'max-w-0 opacity-0' : 'max-w-0 opacity-0 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:max-w-32 group-focus-visible:opacity-100'
          }`}
        >
          Ask Genie
        </span>
        {isOpen && (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[#f3eee4]">
            <X size={20} />
          </span>
        )}
      </button>
    </>
  )
}
