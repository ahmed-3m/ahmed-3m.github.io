'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'

// Legal texts are kept in English and German only. Other languages fall back to English,
// so the binding wording is never a machine translation.

const EMAIL = 'ahmed.mo.0595@gmail.com'
const UPDATED = '2026-11-25'

type Section = { heading: TranslationMap; paragraphs: TranslationMap[] }

const titles = {
  impressum: { en: 'Legal notice (Impressum)', de: 'Impressum' },
  privacy: { en: 'Privacy notice', de: 'Datenschutzerklärung' },
} satisfies Record<string, TranslationMap>

const updatedLabel: TranslationMap = { en: 'Last updated', de: 'Stand' }
const emailLabel: TranslationMap = { en: 'Email', de: 'E-Mail' }

const impressum: Section[] = [
  {
    heading: {
      en: 'Information under § 5 ECG and § 25 MedienG',
      de: 'Angaben gemäß § 5 ECG und Offenlegung gemäß § 25 MedienG',
    },
    paragraphs: [
      { en: 'Ahmed Mohammed', de: 'Ahmed Mohammed' },
      { en: 'Linz, Austria', de: 'Linz, Österreich' },
    ],
  },
  {
    heading: { en: 'Purpose of this website', de: 'Blattlinie' },
    paragraphs: [
      {
        en: 'A personal website presenting my work as an AI/ML engineer: projects, research, writing, news, and a live demo of an AI front desk.',
        de: 'Persönliche Website mit Informationen über meine Arbeit als AI/ML Engineer: Projekte, Forschung, Texte, News und eine Live-Demo eines KI-Empfangs.',
      },
    ],
  },
  {
    heading: { en: 'Links to other websites', de: 'Links zu anderen Websites' },
    paragraphs: [
      {
        en: 'I am not responsible for the content of external websites linked from this site. When I learn that a linked page breaks the law, I remove the link.',
        de: 'Für Inhalte externer Websites, auf die diese Seite verlinkt, bin ich nicht verantwortlich. Sobald mir Rechtsverletzungen bekannt werden, entferne ich den Link.',
      },
    ],
  },
]

const privacy: Section[] = [
  {
    heading: { en: 'Who is responsible', de: 'Verantwortlicher' },
    paragraphs: [
      {
        en: 'Ahmed Mohammed, Linz, Austria. For any privacy question or request, write to the email address below.',
        de: 'Ahmed Mohammed, Linz, Österreich. Für Fragen und Anfragen zum Datenschutz schreib mir an die unten angegebene E-Mail-Adresse.',
      },
    ],
  },
  {
    heading: { en: 'Hosting', de: 'Hosting' },
    paragraphs: [
      {
        en: 'This site is hosted on GitHub Pages (GitHub, Inc., USA). When you open a page, GitHub processes your IP address and technical request data to deliver the site and keep it secure. Legal basis: my legitimate interest in running a secure website (Art. 6(1)(f) GDPR). See the GitHub Privacy Statement for details.',
        de: 'Diese Website wird auf GitHub Pages (GitHub, Inc., USA) gehostet. Beim Aufruf einer Seite verarbeitet GitHub deine IP-Adresse und technische Anfragedaten, um die Seite auszuliefern und abzusichern. Rechtsgrundlage: mein berechtigtes Interesse an einem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Details stehen in der Datenschutzerklärung von GitHub.',
      },
    ],
  },
  {
    heading: { en: 'No cookies, no tracking', de: 'Keine Cookies, kein Tracking' },
    paragraphs: [
      {
        en: 'This site sets no cookies and uses no analytics or advertising tools. Fonts are served from this site itself. Your language and theme choices are saved only in your own browser (local storage) and never sent to me.',
        de: 'Diese Website setzt keine Cookies und nutzt keine Analyse- oder Werbetools. Schriften werden von dieser Website selbst geladen. Deine Sprach- und Design-Auswahl wird nur in deinem eigenen Browser (Local Storage) gespeichert und nie an mich übertragen.',
      },
    ],
  },
  {
    heading: { en: 'Chat assistant', de: 'Chat-Assistent' },
    paragraphs: [
      {
        en: 'Some answers of the chat assistant are built into the site. Other questions are sent through my server (a Cloudflare Worker) to the AI providers Z.ai and, as a fallback, Groq, which generate the answer. Your IP address is used to limit the number of requests and is kept for at most one hour. I do not store your chat messages. Please do not enter sensitive personal data. Legal basis: my legitimate interest in answering your question (Art. 6(1)(f) GDPR).',
        de: 'Manche Antworten des Chat-Assistenten sind in die Website eingebaut. Andere Fragen werden über meinen Server (einen Cloudflare Worker) an die KI-Anbieter Z.ai und ersatzweise Groq geschickt, die die Antwort erzeugen. Deine IP-Adresse wird zur Begrenzung der Anfragen genutzt und höchstens eine Stunde gespeichert. Deine Chat-Nachrichten speichere ich nicht. Bitte gib keine sensiblen persönlichen Daten ein. Rechtsgrundlage: mein berechtigtes Interesse, deine Frage zu beantworten (Art. 6 Abs. 1 lit. f DSGVO).',
      },
    ],
  },
  {
    heading: { en: 'AI front desk (voice demo)', de: 'KI-Empfang (Sprach-Demo)' },
    paragraphs: [
      {
        en: 'Only if you start a call: the demo runs on Cloudflare. Your voice is sent to Google (Gemini API) so the AI can understand and answer you; on the current plan, Google may use it to improve its services. The text of each reply is sent to ElevenLabs to speak it in my cloned voice, and that audio is sent to Anam to animate the face. Calls last at most 3 minutes.',
        de: 'Nur wenn du ein Gespräch startest: Die Demo läuft auf Cloudflare. Deine Stimme geht an Google (Gemini API), damit die KI dich versteht und antwortet; im aktuellen Tarif kann Google sie zur Verbesserung seiner Dienste nutzen. Der Text jeder Antwort geht an ElevenLabs, das ihn mit meiner geklonten Stimme spricht, und dieses Audio geht an Anam, das das Gesicht animiert. Gespräche dauern höchstens 3 Minuten.',
      },
      {
        en: 'I do not record or store your voice or what is said. My server logs only counts and timings. To limit calls, your IP address is turned into a salted hash, kept only as long as the hourly and daily limits need it. If you ask the AI to book a meeting, it shows a Calendly link, which may carry the name and email you said; Calendly only receives them if you open the link.',
        de: 'Ich zeichne deine Stimme und das Gesagte nicht auf und speichere sie nicht. Mein Server protokolliert nur Zähler und Zeiten. Zur Begrenzung der Anrufe wird deine IP-Adresse in einen gesalzenen Hash umgewandelt und nur so lange aufbewahrt, wie die Stunden- und Tageslimits es erfordern. Wenn du die KI bittest, ein Meeting zu buchen, zeigt sie einen Calendly-Link, der den genannten Namen und die E-Mail-Adresse enthalten kann; Calendly erhält sie nur, wenn du den Link öffnest.',
      },
      {
        en: 'Legal basis: your consent when you start the call (Art. 6(1)(a) GDPR). You can withdraw it at any time by ending the call. Some of these providers process data outside the EU, including in the USA.',
        de: 'Rechtsgrundlage: deine Einwilligung beim Start des Gesprächs (Art. 6 Abs. 1 lit. a DSGVO). Du kannst sie jederzeit widerrufen, indem du das Gespräch beendest. Einige dieser Anbieter verarbeiten Daten außerhalb der EU, auch in den USA.',
      },
    ],
  },
  {
    heading: { en: 'Booking a meeting', de: 'Meeting buchen' },
    paragraphs: [
      {
        en: 'The booking buttons open Calendly in a new tab. What you enter there is processed by Calendly under its own privacy policy.',
        de: 'Die Buchungs-Buttons öffnen Calendly in einem neuen Tab. Was du dort eingibst, verarbeitet Calendly nach seiner eigenen Datenschutzerklärung.',
      },
    ],
  },
  {
    heading: { en: 'Your rights', de: 'Deine Rechte' },
    paragraphs: [
      {
        en: 'You have the right to access, rectification, erasure, restriction of processing, data portability and objection, and to withdraw consent at any time. You can also complain to the Austrian Data Protection Authority (Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna, www.dsb.gv.at).',
        de: 'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, eine Einwilligung jederzeit zu widerrufen. Außerdem kannst du dich bei der Österreichischen Datenschutzbehörde beschweren (Barichgasse 40–42, 1030 Wien, www.dsb.gv.at).',
      },
    ],
  },
]

export default function LegalContent({ kind }: { kind: 'impressum' | 'privacy' }) {
  const { t, lang } = useI18n()
  // Only en and de exist, so other languages read the English text left to right.
  const textLang = lang === 'de' ? 'de' : 'en'
  const sections = kind === 'impressum' ? impressum : privacy

  return (
    <article className="legal-page cd-container" lang={textLang} dir="ltr">
      <h1>{t(titles[kind])}</h1>
      {sections.map((section) => (
        <section key={section.heading.en}>
          <h2>{t(section.heading)}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.en}>{t(paragraph)}</p>
          ))}
        </section>
      ))}
      <section>
        <h2>{t(emailLabel)}</h2>
        <p>
          <a href={`mailto:${EMAIL}`}>
            <bdi dir="ltr">{EMAIL}</bdi>
          </a>
        </p>
      </section>
      <p className="legal-updated">
        {t(updatedLabel)}: <bdi dir="ltr">{UPDATED}</bdi>
      </p>
    </article>
  )
}
