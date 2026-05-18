'use client'

import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageCircle, X } from 'lucide-react'

type ChatRole = 'user' | 'assistant'
type ApiRole = ChatRole | 'system'

type ChatMessage = {
  role: ChatRole
  content: string
}

type ApiMessage = {
  role: ApiRole
  content: string
}

type HuggingFaceChatResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: string
}

const SYSTEM_PROMPT = `You are Ahmed Mohammed's portfolio assistant. Answer questions about Ahmed concisely and professionally, as if you are his representative. Stay on topic — only answer questions related to Ahmed's work, skills, projects, and background. If asked something unrelated, politely redirect.

Here is Ahmed's full profile:

NAME: Ahmed Mohammed
ROLE: AI/ML Engineer & Entrepreneur
LOCATION: Linz, Austria
EMAIL: ahmed.mo.0595@gmail.com
LINKEDIN: https://www.linkedin.com/in/ahmed-3m/
GITHUB: https://github.com/ahmed-3m
WEBSITE: https://ahmed-3m.github.io

EDUCATION:

M.Sc. in Artificial Intelligence, Johannes Kepler University Linz (Oct 2024 – Mar 2026). Thesis: "Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection" — 99.03% AUROC on CIFAR-10, supervised by Prof. Sepp Hochreiter (inventor of LSTM).
B.Sc. in Mechatronics Engineering, Eastern Mediterranean University, Cyprus (Feb 2015 – Jan 2018). Thesis: SCARA robotic system for dynamic object tracking.
EXPERIENCE:

Founder & Full-Stack Developer at Faultrix (Jul 2025 – Present): Built AI construction analysis platform solo from zero to production. Stack: Python, Next.js, Convex, OpenAI API, Docker, Clerk, Cloudflare R2, Stripe. Generates ÖNORM-compliant reports with SHA-256 evidence chain and AES-256 encryption in under 1 minute.
ML Researcher at JKU Machine Learning Institute (Dec 2024 – Mar 2026): Master's thesis research under Prof. Sepp Hochreiter.
Machine Vision Researcher at PROFACTOR GmbH, Steyr, Austria (Apr 2024 – Nov 2024): YOLO + diffusion model pipeline for industrial defect detection. 98.4% accuracy in real-time production. Part of the Zer0P project (funded by Government of Upper Austria) — zero-defect inkjet printing on building components.
AI Research Intern at Karunya University, India — Remote (Aug 2023 – Oct 2023): RNN/CNN for EEG motor imagery classification. LSTM, Bi-LSTM, GRU hyperparameter optimization.
AI & Programming Tutor, Freelance (Jan 2021 – Present): Python, ML, Deep Learning mentoring.
SKILLS:

Deep Learning: PyTorch, PyTorch Lightning, Diffusion Models (DDPM/UNet), CNNs, Transformers, RNNs, LLMs
Computer Vision: OOD Detection, Object Detection (YOLOv8), Defect Detection, Image Classification
Research: Hydra, Experiment Design, Ablation Studies, AUROC/FPR95, Monte Carlo, Cross-Validation
ML Engineering: End-to-End Pipelines, LLM Inference, Prompt Engineering, OpenAI API
Infrastructure: Docker, Git, Linux, REST APIs, TypeScript, Next.js, Convex, CUDA, Python, OpenCV
Languages: Arabic (Native), English (B2 Professional), German (B1 CEFR)
OPEN TO: Senior AI/ML roles and research collaborations.

KEY NUMBERS:

99.03% AUROC on OOD detection (CIFAR-10)
+18.8pp improvement over baseline
98.4% defect detection accuracy (PROFACTOR)
<1 min report generation (Faultrix)
4+ years in AI/ML`

const STARTER_PROMPTS = [
  'What is Faultrix?',
  'Tell me about the thesis',
  "What's his tech stack?",
  'Is he open to work?',
] as const

const panelStyle = {
  background: 'linear-gradient(180deg, rgba(19, 23, 31, 0.98) 0%, rgba(8, 9, 13, 0.98) 100%)',
  borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255,255,255,0.02)',
  fontFamily: 'var(--font-body)',
} satisfies CSSProperties

const bubbleStyles = {
  assistant: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
    color: 'var(--cd-fg1)',
  },
  user: {
    background: 'linear-gradient(135deg, var(--cd-accent, #7c3aed) 0%, rgba(0, 212, 255, 0.82) 100%)',
    borderColor: 'rgba(0,212,255,0.22)',
    color: '#031018',
  },
} satisfies Record<ChatRole, CSSProperties>

function LoadingDots() {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
      style={bubbleStyles.assistant}
      aria-label="Ahmed is typing"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--cd-accent, #7c3aed)',
            animation: `pulse-dot 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading])

  async function sendMessage(messageText: string) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const token = process.env.NEXT_PUBLIC_GROQ_TOKEN
    if (!token || token === 'your_groq_token_here') {
      setError('Add a valid Groq token to NEXT_PUBLIC_GROQ_TOKEN to enable the assistant.')
      return
    }

    const nextUserMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, nextUserMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const payloadMessages: ApiMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...nextMessages,
      ]

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: payloadMessages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        }
      )

      const data = (await response.json()) as HuggingFaceChatResponse

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Model is warming up, try again in a moment.')
        }

        throw new Error(data.error || 'The assistant could not respond right now.')
      }

      const reply = data.choices?.[0]?.message?.content?.trim()
      if (!reply) {
        throw new Error('The assistant returned an empty response.')
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: reply },
      ])
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while contacting the assistant.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handleStarterPrompt(prompt: string) {
    void sendMessage(prompt)
  }

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 z-[9998] w-[min(380px,calc(100vw-2rem))] transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <section
          id="ahmed-chatbot-panel"
          className="flex h-[min(480px,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-3xl border backdrop-blur-xl"
          style={panelStyle}
          role="dialog"
          aria-label="Ask about Ahmed"
        >
          <header
            className="flex items-center justify-between border-b px-4 py-4"
            style={{ borderColor: 'var(--cd-border, rgba(255,255,255,0.08))' }}
          >
            <div>
              <h2
                className="text-sm font-semibold tracking-[0.02em]"
                style={{ color: 'var(--cd-fg1)' }}
              >
                Ask about Ahmed
              </h2>
              <p className="mt-1 text-xs" style={{ color: 'var(--cd-fg2)' }}>
                Portfolio assistant powered by Groq
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--cd-fg2)',
              }}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </header>

          <div ref={messagesRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div
                  className="max-w-[85%] rounded-2xl border px-3 py-2.5 text-sm leading-6"
                  style={bubbleStyles.assistant}
                >
                  Ask anything about Ahmed&apos;s work, research, projects, or background.
                </div>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleStarterPrompt(prompt)}
                      disabled={isLoading}
                      className="rounded-full border px-3 py-2 text-left text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--cd-fg2)',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] whitespace-pre-wrap rounded-2xl border px-3 py-2.5 text-sm leading-6 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                    style={bubbleStyles[message.role]}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}

            {isLoading ? (
              <div className="flex justify-start">
                <LoadingDots />
              </div>
            ) : null}
          </div>

          <div
            className="border-t px-4 pb-4 pt-3"
            style={{ borderColor: 'var(--cd-border, rgba(255,255,255,0.08))' }}
          >
            {error ? (
              <p className="mb-3 text-xs leading-5" style={{ color: '#f59e0b' }}>
                {error}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Ahmed..."
                className="h-11 flex-1 rounded-2xl border px-4 text-sm outline-none transition-colors"
                style={{
                  borderColor: 'var(--cd-border, rgba(255,255,255,0.08))',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--cd-fg1)',
                }}
                aria-label="Ask about Ahmed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'var(--cd-accent, #7c3aed)',
                  color: 'var(--cd-bg)',
                  boxShadow: '0 12px 30px rgba(0, 212, 255, 0.22)',
                }}
                aria-label="Send message"
              >
                <ArrowUp size={17} />
              </button>
            </form>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((currentState) => !currentState)}
        className="fixed bottom-6 right-6 z-[9999] inline-flex h-14 w-14 items-center justify-center rounded-full border transition-transform duration-300 ease-out hover:-translate-y-0.5"
        style={{
          background: 'var(--cd-accent, #7c3aed)',
          borderColor: 'rgba(255,255,255,0.12)',
          color: 'var(--cd-bg)',
          boxShadow: '0 18px 40px rgba(0, 212, 255, 0.24)',
        }}
        aria-expanded={isOpen}
        aria-controls="ahmed-chatbot-panel"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
