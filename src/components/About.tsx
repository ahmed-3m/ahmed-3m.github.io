'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 01 - About', de: '// 01 - Profil', fr: '// 01 - Profil', es: '// 01 - Perfil', ar: '// 01 - نبذة' },
  title: {
    en: 'AI/ML Engineer - research that ships.',
    de: 'AI/ML Engineer - Forschung, die produktiv wird.',
    fr: 'Ingenieur IA/ML - recherche qui devient produit.',
    es: 'Ingeniero IA/ML - investigacion que llega a produccion.',
    ar: 'مهندس ذكاء اصطناعي - بحث يتحول إلى منتج.',
  },
  p1: {
    en: 'I am an AI/ML engineer who completed an M.Sc. in Artificial Intelligence at JKU Linz, working under Prof. Sepp Hochreiter, the pioneer of LSTM and deep learning.',
    de: 'Ich bin AI/ML Engineer mit M.Sc. in Artificial Intelligence an der JKU Linz, betreut von Prof. Sepp Hochreiter, dem Pionier von LSTM und Deep Learning.',
    fr: 'Je suis ingenieur IA/ML avec un M.Sc. en intelligence artificielle a JKU Linz, sous la supervision du Prof. Sepp Hochreiter, pionnier du LSTM et du deep learning.',
    es: 'Soy ingeniero de IA/ML con un M.Sc. en Inteligencia Artificial en JKU Linz, bajo la supervision del Prof. Sepp Hochreiter, pionero de LSTM y deep learning.',
    ar: 'أنا مهندس ذكاء اصطناعي وتعلم آلي، أكملت ماجستير الذكاء الاصطناعي في JKU Linz تحت إشراف البروفيسور سيب هوخرايتر، رائد LSTM والتعلم العميق.',
  },
  p2: {
    en: 'My work spans the full stack: from class-conditional separation loss for diffusion-based OOD detection to industrial computer vision pipelines evaluated under rigorous cross-validation.',
    de: 'Meine Arbeit umfasst den gesamten Stack: von class-conditional separation loss fur diffusionsbasierte OOD-Erkennung bis zu industriellen Computer-Vision-Pipelines mit strenger Kreuzvalidierung.',
    fr: 'Mon travail couvre toute la chaine : de la separation loss conditionnelle pour la detection OOD par diffusion aux pipelines de vision industrielle valides rigoureusement.',
    es: 'Mi trabajo cubre todo el stack: desde separation loss condicional para deteccion OOD con difusion hasta pipelines industriales de vision por computador evaluados rigurosamente.',
    ar: 'يمتد عملي عبر كامل السلسلة: من خسارة الفصل الشرطية لكشف الخارج عن التوزيع بنماذج الانتشار إلى خطوط رؤية حاسوبية صناعية بتقييم صارم.',
  },
  p3: {
    en: 'I founded Faultrix to turn this research mindset into a real product: AI-powered construction quality control that generates compliant reports in under a minute.',
    de: 'Ich habe Faultrix gegrundet, um diese Forschungsweise in ein echtes Produkt zu verwandeln: KI-gestutzte Bauqualitatskontrolle mit Berichten in unter einer Minute.',
    fr: 'J ai fonde Faultrix pour transformer cette approche recherche en produit reel : controle qualite construction par IA avec rapports en moins d une minute.',
    es: 'Funde Faultrix para convertir esta mentalidad de investigacion en un producto real: control de calidad en construccion con IA e informes en menos de un minuto.',
    ar: 'أسست Faultrix لتحويل عقلية البحث إلى منتج حقيقي: مراقبة جودة البناء بالذكاء الاصطناعي مع تقارير خلال أقل من دقيقة.',
  },
  education: { en: 'Education', de: 'Ausbildung', fr: 'Formation', es: 'Educacion', ar: 'التعليم' },
  skills: { en: 'Skills & Stack', de: 'Skills & Stack', fr: 'Competences & stack', es: 'Habilidades y stack', ar: 'المهارات والتقنيات' },
  languages: { en: 'Languages', de: 'Sprachen', fr: 'Langues', es: 'Idiomas', ar: 'اللغات' },
  location: { en: 'Location', de: 'Standort', fr: 'Lieu', es: 'Ubicacion', ar: 'الموقع' },
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  company: { en: 'Company', de: 'Firma', fr: 'Entreprise', es: 'Empresa', ar: 'الشركة' },
  openTo: { en: 'Open to', de: 'Offen fur', fr: 'Ouvert a', es: 'Abierto a', ar: 'متاح لـ' },
  roles: { en: 'AI/ML Roles - Research Collaborations', de: 'AI/ML-Rollen - Forschungskooperationen', fr: 'Roles IA/ML - collaborations recherche', es: 'Roles IA/ML - colaboraciones de investigacion', ar: 'أدوار الذكاء الاصطناعي - تعاونات بحثية' },
  degree1: { en: 'M.Sc. in Artificial Intelligence', de: 'M.Sc. Artificial Intelligence', fr: 'M.Sc. en intelligence artificielle', es: 'M.Sc. en Inteligencia Artificial', ar: 'ماجستير في الذكاء الاصطناعي' },
  degree2: { en: 'B.Sc. in Mechatronics Engineering', de: 'B.Sc. Mechatronik', fr: 'B.Sc. en genie mecatronique', es: 'B.Sc. en Ingenieria Mecatronica', ar: 'بكالوريوس في هندسة الميكاترونكس' },
  desc1: { en: 'Thesis: conditional diffusion models for OOD detection - 99.03% +/- 0.07% average AUROC.', de: 'Thesis: konditionale Diffusionsmodelle fur OOD-Erkennung - 99.03% +/- 0.07% AUROC.', fr: 'Memoire : modeles de diffusion conditionnels pour detection OOD - 99.03% +/- 0.07% AUROC.', es: 'Tesis: modelos de difusion condicional para deteccion OOD - 99.03% +/- 0.07% AUROC.', ar: 'الرسالة: نماذج انتشار شرطية لكشف OOD - 99.03% +/- 0.07% AUROC.' },
  desc2: { en: 'Thesis: SCARA robotic system for dynamic object tracking.', de: 'Thesis: SCARA-Robotersystem fur dynamische Objektverfolgung.', fr: 'Memoire : systeme robotique SCARA pour suivi dynamique d objets.', es: 'Tesis: sistema robotico SCARA para seguimiento dinamico de objetos.', ar: 'المشروع: نظام روبوت SCARA لتتبع الأجسام المتحركة.' },
} satisfies Record<string, TranslationMap>

const skillCategories = [
  { name: 'Deep Learning', skills: ['PyTorch', 'PyTorch Lightning', 'Diffusion Models', 'CNNs', 'Transformers', 'RNNs', 'LLMs'] },
  { name: 'Computer Vision', skills: ['OOD Detection', 'Object Detection', 'Defect Detection', 'Image Classification'] },
  { name: 'Research & Experimentation', skills: ['Hydra', 'Experiment Design', 'Ablation Studies', 'AUROC/FPR95', 'Monte Carlo', 'Cross-Validation'] },
  { name: 'ML Engineering', skills: ['End-to-End Pipelines', 'LLM Inference', 'Prompt Engineering', 'OpenAI API'] },
  { name: 'Infrastructure', skills: ['Docker', 'Git', 'Linux', 'REST APIs', 'TypeScript', 'Next.js', 'CUDA', 'Python', 'OpenCV'] },
  { name: 'AI Tools', skills: ['GitHub Copilot', 'ChatGPT', 'Weights & Biases'] },
]

export default function About() {
  useReveal()
  const { t } = useI18n()

  const education = [
    { degree: t(copy.degree1), school: 'Johannes Kepler University Linz', date: 'Oct 2024 - Mar 2026', desc: t(copy.desc1) },
    { degree: t(copy.degree2), school: 'Eastern Mediterranean University, Cyprus', date: 'Feb 2015 - Jan 2018', desc: t(copy.desc2) },
  ]

  const infoRows = [
    { label: t(copy.location), value: 'Linz, Austria', accent: false },
    { label: t(copy.supervisor), value: 'Prof. Sepp Hochreiter', accent: false },
    { label: t(copy.company), value: 'Faultrix.com - Founder', accent: true },
    { label: t(copy.openTo), value: t(copy.roles), accent: false },
  ]

  const languages = [
    { lang: 'Arabic', level: t({ en: 'Native', de: 'Muttersprache', fr: 'Natif', es: 'Nativo', ar: 'اللغة الأم' }) },
    { lang: 'English', level: t({ en: 'B2 - Professional', de: 'B2 - Professionell', fr: 'B2 - professionnel', es: 'B2 - profesional', ar: 'B2 - مهني' }) },
    { lang: 'German', level: t({ en: 'B1 CEFR - improving', de: 'B1 CEFR - in Verbesserung', fr: 'B1 CEFR - en progression', es: 'B1 CEFR - mejorando', ar: 'B1 CEFR - قيد التطوير' }) },
  ]

  return (
    <section id="about" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <div className="cd-about-bio-row reveal">
          <div>
            <h2 className="cd-section-title" style={{ marginBottom: 24 }}>{t(copy.title)}</h2>
            <div className="cd-about-text" data-speakable>
              <p>{t(copy.p1)}</p>
              <p>{t(copy.p2)} <strong>99.03% +/- 0.07% AUROC</strong> · <strong>0.8673 AUROC</strong>.</p>
              <p>{t(copy.p3)}</p>
            </div>
          </div>

          <div className="cd-about-side">
            {infoRows.map(row => (
              <div key={row.label} className="cd-info-row">
                <div className="cd-info-label">{row.label}</div>
                <div className={`cd-info-val${row.accent ? ' accent' : ''}`}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">{t(copy.education)}</div>
          <div className="cd-education-grid">
            {education.map(edu => (
              <div key={edu.degree} className="cd-education-card">
                <div className="cd-edu-header">
                  <div className="cd-edu-degree">{edu.degree}</div>
                  <div className="cd-edu-date">{edu.date}</div>
                </div>
                <div className="cd-edu-institution">{edu.school}</div>
                <div className="cd-edu-description">{edu.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">{t(copy.skills)}</div>
          <div className="cd-skills-grid">
            {skillCategories.map(cat => (
              <div key={cat.name} className="cd-skill-category">
                <div className="cd-skill-cat-name">{cat.name}</div>
                <div className="cd-chips" style={{ marginTop: 0 }}>
                  {cat.skills.map(skill => <span key={skill} className="cd-chip">{skill}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd-about-band reveal">
          <div className="cd-band-eyebrow">{t(copy.languages)}</div>
          <div className="cd-lang-row">
            {languages.map(lang => (
              <div key={lang.lang} className="cd-lang-card">
                <div className="cd-lang-name">{lang.lang}</div>
                <div className="cd-lang-level">{lang.level}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
