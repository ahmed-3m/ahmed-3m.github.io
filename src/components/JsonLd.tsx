export function PersonSchema() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ahmed Mohammed',
    alternateName: 'Ahmed 3M',
    givenName: 'Ahmed',
    familyName: 'Mohammed',
    jobTitle: 'AI/ML Engineer & Entrepreneur',
    description: 'AI/ML Engineer specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. M.Sc. Artificial Intelligence from Johannes Kepler University Linz, supervised by Prof. Sepp Hochreiter (inventor of LSTM). Achieved 99.03% AUROC on CIFAR-10 OOD detection and 98.4% industrial defect detection accuracy.',
    url: 'https://ahmed-3m.github.io',
    image: 'https://ahmed-3m.github.io/headshot.jpg',
    email: 'ahmed.mo.0595@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linz',
      addressRegion: 'Upper Austria',
      addressCountry: 'AT',
    },
    sameAs: [
      'https://github.com/ahmed-3m',
      'https://www.linkedin.com/in/ahmed-3m/',
      'https://huggingface.co/ahmed-3m',
      'https://wandb.ai/ahmed-mu-0593',
      'https://x.com/Ahmed_mo_93',
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Computer Vision',
      'Anomaly Detection',
      'Diffusion Models',
      'Conditional Diffusion Models',
      'Out-of-Distribution Detection',
      'YOLO Object Detection',
      'PyTorch',
      'Industrial Quality Control',
      'Defect Detection',
      'Brain-Computer Interfaces',
      'EEG Signal Classification',
      'Generative Models',
      'Construction Technology',
      'AI-powered SaaS',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Faultrix',
      url: 'https://faultrix.com',
    },
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'Johannes Kepler University Linz',
        url: 'https://www.jku.at',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Linz',
          addressCountry: 'AT',
        },
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'Eastern Mediterranean University',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Famagusta',
          addressCountry: 'CY',
        },
      },
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'Master of Science in Artificial Intelligence',
        educationalLevel: "Master's Degree",
        recognizedBy: {
          '@type': 'CollegeOrUniversity',
          name: 'Johannes Kepler University Linz',
        },
        dateCreated: '2026-03',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'Bachelor of Science in Mechatronics Engineering',
        educationalLevel: "Bachelor's Degree",
        recognizedBy: {
          '@type': 'CollegeOrUniversity',
          name: 'Eastern Mediterranean University',
        },
        dateCreated: '2018-01',
      },
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'AI/ML Engineer',
      occupationalCategory: '15-1299.08',
      skills: 'PyTorch, YOLO, Diffusion Models, Computer Vision, Deep Learning, OOD Detection, Industrial Defect Detection',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  );
}

export function WebsiteSchema() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ahmed Mohammed — AI/ML Engineer & Entrepreneur',
    url: 'https://ahmed-3m.github.io',
    description: 'Portfolio of Ahmed Mohammed — AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. 99.03% AUROC on CIFAR-10 OOD detection. 98.4% industrial defect detection accuracy. M.Sc. AI from JKU Linz.',
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      url: 'https://ahmed-3m.github.io',
    },
    inLanguage: ['en', 'de'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}

export function OrganizationSchema() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Faultrix',
    url: 'https://faultrix.com',
    logo: 'https://faultrix.com/icon.svg',
    founder: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      url: 'https://ahmed-3m.github.io',
    },
    foundingDate: '2025-07',
    description: 'AI-powered construction quality control SaaS. Analyzes building photos and generates ÖNORM B 2110-compliant technical reports in under 1 minute. Features SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption. Built with Next.js, Convex, OpenAI API, Cloudflare R2.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linz',
      addressRegion: 'Upper Austria',
      addressCountry: 'AT',
    },
    areaServed: [
      { '@type': 'Country', name: 'Austria' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'Switzerland' },
    ],
    knowsAbout: [
      'Construction Quality Control',
      'AI Building Analysis',
      'ÖNORM B 2110',
      'Defect Detection',
      'DSGVO Compliance',
    ],
    sameAs: ['https://faultrix.com'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}

export function FAQSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: "What is Ahmed Mohammed's expertise in AI/ML?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed is an AI/ML Engineer specializing in computer vision, diffusion models, and out-of-distribution detection. He achieved 99.03% AUROC on CIFAR-10 OOD detection in his Master\'s thesis at JKU Linz and 98.4% defect detection accuracy at PROFACTOR GmbH. He is proficient in PyTorch, YOLOv8, conditional diffusion models, and full-stack ML engineering.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Faultrix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Faultrix is an AI-powered construction quality control SaaS founded by Ahmed Mohammed. It analyzes building photos and generates ÖNORM B 2110-compliant technical reports in under 1 minute. The platform features SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption. Visit faultrix.com for more information.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Ahmed Mohammed based and how can I contact him?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed is based in Linz, Austria. He can be contacted via email at ahmed.mo.0595@gmail.com, on LinkedIn at linkedin.com/in/ahmed-3m, or through his portfolio at ahmed-3m.github.io. He is open to senior AI/ML roles and research collaborations.',
        },
      },
      {
        '@type': 'Question',
        name: 'What industries does Ahmed Mohammed work with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed works primarily with industrial manufacturing, construction, and quality control sectors. His work at PROFACTOR GmbH focused on industrial anomaly detection for inkjet-printed building components (Zer0P project, funded by Upper Austria government). Faultrix serves the Austrian construction industry with AI-powered building analysis and ÖNORM-compliant reporting.',
        },
      },
      {
        '@type': 'Question',
        name: "What is Ahmed Mohammed's educational background?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Ahmed Mohammed holds a Master of Science in Artificial Intelligence from Johannes Kepler University Linz (JKU), where his thesis on conditional diffusion models for out-of-distribution detection was supervised by Prof. Sepp Hochreiter (inventor of LSTM). He also holds a Bachelor of Science in Mechatronics Engineering from Eastern Mediterranean University in Cyprus.",
        },
      },
      {
        '@type': 'Question',
        name: "What was Ahmed Mohammed's Master's thesis about?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Ahmed Mohammed's Master's thesis at JKU Linz (2026) is titled 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection'. He achieved 99.03% AUROC on CIFAR-10, improving the baseline by 18.8 percentage points through a novel class-conditional separation loss. The work was supervised by Prof. Sepp Hochreiter and applied to industrial quality control with multi-head conditioning.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

export function SocialProfileSchema() {
  const socialSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      alternateName: 'Ahmed 3M',
      description: 'AI/ML Engineer & Entrepreneur specializing in computer vision, diffusion models, and out-of-distribution detection. Founder of Faultrix. M.Sc. AI from JKU Linz under Prof. Sepp Hochreiter. Based in Linz, Austria.',
      image: 'https://ahmed-3m.github.io/headshot.jpg',
      email: 'ahmed.mo.0595@gmail.com',
      sameAs: [
        'https://github.com/ahmed-3m',
        'https://www.linkedin.com/in/ahmed-3m/',
        'https://huggingface.co/ahmed-3m',
        'https://wandb.ai/ahmed-mu-0593',
        'https://x.com/Ahmed_mo_93',
      ],
      jobTitle: 'AI/ML Engineer & Entrepreneur',
      worksFor: {
        '@type': 'Organization',
        name: 'Faultrix',
        url: 'https://faultrix.com',
      },
      alumniOf: [
        {
          '@type': 'CollegeOrUniversity',
          name: 'Johannes Kepler University Linz',
        },
        {
          '@type': 'CollegeOrUniversity',
          name: 'Eastern Mediterranean University',
        },
      ],
      knowsAbout: [
        'Artificial Intelligence',
        'Machine Learning',
        'Computer Vision',
        'Deep Learning',
        'PyTorch',
        'YOLOv8',
        'Diffusion Models',
        'Anomaly Detection',
        'Out-of-Distribution Detection',
        'Industrial Quality Control',
        'Construction Technology',
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(socialSchema) }}
    />
  );
}

export function ProjectsSchema() {
  const projectsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ahmed Mohammed — AI/ML Projects',
    description: 'Featured AI/ML projects and research by Ahmed Mohammed',
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'SoftwareApplication',
          name: 'Faultrix — Construction Quality Control AI',
          description: 'AI-powered construction quality control SaaS. Analyzes building photos and generates ÖNORM B 2110-compliant reports in under 1 minute with SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption. Built solo from zero to production.',
          applicationCategory: 'BusinessApplication',
          url: 'https://faultrix.com',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
          featureList: 'ÖNORM-compliant reports, SHA-256 evidence chain, DSGVO compliant, AES-256 encryption, under 1 minute report generation',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'SoftwareApplication',
          name: 'OOD Detection Framework',
          description: 'Novel use of conditional diffusion models as generative classifiers for out-of-distribution detection. Achieved 99.03% AUROC on CIFAR-10 benchmark, improving over baseline by 18.8 percentage points via class-conditional separation loss. Master\'s Thesis at JKU Linz, 2026.',
          applicationCategory: 'ResearchApplication',
          url: 'https://github.com/ahmed-3m/OOD-diffusion-detector',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'SoftwareApplication',
          name: 'Industrial Anomaly Detection — PROFACTOR GmbH',
          description: 'YOLO + diffusion model pipeline for real-time industrial defect detection on inkjet-printed building components. 98.4% accuracy in production environment. Part of the Zer0P project funded by the Government of Upper Austria.',
          applicationCategory: 'BusinessApplication',
          url: 'https://ahmed-3m.github.io/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'SoftwareApplication',
          name: 'EEG Signal Classification — Brain-Computer Interface',
          description: 'Deep RNN architectures (LSTM, Bi-LSTM, GRU) for EEG motor imagery classification in brain-computer interface applications. Hyperparameter optimization across multiple architectures. Karunya University, 2023.',
          applicationCategory: 'ResearchApplication',
          url: 'https://github.com/ahmed-3m/Motor-Imagery-classification',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsSchema) }}
    />
  );
}

export function ResearchSchema() {
  const researchSchema = {
    '@context': 'https://schema.org',
    '@type': 'Thesis',
    headline: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
    name: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
    abstract: 'This thesis introduces a novel approach using conditional diffusion models as generative classifiers for robust out-of-distribution detection. A class-conditional separation loss is proposed that improves AUROC by 18.8 percentage points over the baseline, achieving 99.03% AUROC on CIFAR-10. The method is further applied to industrial quality control using multi-head conditioning for structured manufacturing data.',
    url: 'https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf',
    datePublished: '2026-03',
    inSupportOf: "Master's Degree in Artificial Intelligence",
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      url: 'https://ahmed-3m.github.io',
      email: 'ahmed.mo.0595@gmail.com',
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Johannes Kepler University Linz',
        url: 'https://www.jku.at',
      },
    },
    contributor: [
      {
        '@type': 'Person',
        name: 'Sepp Hochreiter',
        jobTitle: 'Professor',
        affiliation: {
          '@type': 'CollegeOrUniversity',
          name: 'Johannes Kepler University Linz',
        },
      },
      {
        '@type': 'Person',
        name: 'Claus Hofmann',
        jobTitle: 'Research Assistant',
        affiliation: {
          '@type': 'CollegeOrUniversity',
          name: 'Johannes Kepler University Linz',
        },
      },
    ],
    about: [
      'Out-of-Distribution Detection',
      'Conditional Diffusion Models',
      'Generative Classifiers',
      'CIFAR-10',
      'Class-Conditional Separation Loss',
      'Industrial Quality Control',
      'Computer Vision',
    ],
    keywords: 'diffusion models, OOD detection, generative classifiers, CIFAR-10, separation loss, industrial quality control',
    educationalLevel: "Master's Thesis",
    inLanguage: 'en',
    publisher: {
      '@type': 'CollegeOrUniversity',
      name: 'Johannes Kepler University Linz',
      url: 'https://www.jku.at',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(researchSchema) }}
    />
  );
}
