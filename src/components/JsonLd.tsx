export function PersonSchema() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ahmed Mohammed',
    alternateName: 'Ahmed 3M',
    givenName: 'Ahmed',
    familyName: 'Mohammed',
    jobTitle: 'AI/ML Engineer & Entrepreneur',
    description: 'AI/ML Engineer specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. M.Sc. Artificial Intelligence from Johannes Kepler University Linz.',
    url: 'https://ahmed-3m.github.io',
    image: 'https://ahmed-3m.github.io/headshot.jpg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linz',
      addressRegion: 'Upper Austria',
      addressCountry: 'AT',
    },
    nationality: {
      '@type': 'Country',
      name: 'Austria',
    },
    sameAs: [
      'https://github.com/ahmed-3m',
      'https://huggingface.co/ahmed-3m',
      'https://wandb.ai/ahmed-mu-0593',
      'https://www.linkedin.com/in/ahmed-3m/',
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
      'TensorFlow',
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
        name: 'Karunya Institute of Technology and Sciences',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Coimbatore',
          addressCountry: 'IN',
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
        name: 'Bachelor of Mechatronics Engineering',
        educationalLevel: "Bachelor's Degree",
        recognizedBy: {
          '@type': 'CollegeOrUniversity',
          name: 'Karunya Institute of Technology and Sciences',
        },
        dateCreated: '2020',
      },
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'AI/ML Engineer',
      occupationalCategory: '15-1299.08',
      skills: 'PyTorch, TensorFlow, YOLO, Diffusion Models, Computer Vision, Deep Learning',
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
    name: 'Ahmed Mohammed Portfolio',
    url: 'https://ahmed-3m.github.io',
    description: 'Portfolio of Ahmed Mohammed — AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix.',
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
    foundingDate: '2025',
    description: 'AI-powered construction quality control SaaS. Generates ÖNORM-compliant technical reports from building photos in under 1 minute with SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Linz',
      addressCountry: 'AT',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Austria',
    },
    knowsAbout: [
      'Construction Quality Control',
      'AI Building Analysis',
      'ÖNORM B 2110',
      'Defect Detection',
    ],
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
        name: 'What is Ahmed Mohammed\'s expertise in AI/ML?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed specializes in computer vision, anomaly detection, and diffusion models with expertise in PyTorch, YOLO, and production ML systems. He achieved 98.4% accuracy in industrial defect detection at PROFACTOR GmbH and developed novel OOD detection methods using conditional diffusion models at JKU Linz.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Faultrix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Faultrix is an AI-powered construction quality control SaaS platform founded by Ahmed Mohammed. It analyzes building photos and generates ÖNORM B 2110 compliant technical reports in under 1 minute. The platform features SHA-256 evidence chain, DSGVO compliance, and AES-256 encryption. Visit faultrix.com for more information.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Ahmed Mohammed based?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed is based in Linz, Austria. He completed his Master of Science in Artificial Intelligence at Johannes Kepler University Linz (JKU) and works in the industrial manufacturing and construction technology sectors in the DACH region.',
        },
      },
      {
        '@type': 'Question',
        name: 'What industries does Ahmed Mohammed work with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed works primarily with manufacturing, construction, and industrial automation sectors, specializing in quality control, defect detection, and process optimization. His work at PROFACTOR GmbH focused on industrial anomaly detection, and Faultrix serves the Austrian construction industry with AI-powered building analysis.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Ahmed Mohammed\'s educational background?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ahmed Mohammed holds a Master of Science in Artificial Intelligence from Johannes Kepler University Linz (JKU), where his thesis focused on conditional diffusion models for out-of-distribution detection. He also holds a Bachelor of Mechatronics Engineering from Karunya Institute of Technology and Sciences in India.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact Ahmed Mohammed for a project?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can reach Ahmed Mohammed via email at ahmed.mo.0595@gmail.com, through LinkedIn at linkedin.com/in/ahmed-3m, or via the contact section on his portfolio at ahmed-3m.github.io.',
        },
      },
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
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
      description: 'AI/ML Engineer & Entrepreneur specializing in computer vision, anomaly detection, and diffusion models. Founder of Faultrix. Based in Linz, Austria.',
      image: 'https://ahmed-3m.github.io/headshot.jpg',
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
          name: 'Karunya Institute of Technology and Sciences',
        },
      ],
      knowsAbout: [
        'Artificial Intelligence',
        'Machine Learning',
        'Computer Vision',
        'Deep Learning',
        'PyTorch',
        'YOLO',
        'Diffusion Models',
        'Anomaly Detection',
        'Out-of-Distribution Detection',
        'Industrial Quality Control',
      ],
      hasOccupation: {
        '@type': 'Occupation',
        name: 'AI/ML Engineer',
        occupationalCategory: '15-1299.08',
      },
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
    name: 'Ahmed Mohammed Projects',
    description: 'Featured AI/ML projects by Ahmed Mohammed',
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'SoftwareApplication',
          name: 'Industrial Anomaly Detection',
          description: 'End-to-end pipeline integrating YOLO and diffusion models for industrial quality control at PROFACTOR GmbH. Achieved 98.4% accuracy in defect detection.',
          applicationCategory: 'AI/ML',
          operatingSystem: 'Linux',
          url: 'https://github.com/ahmed-3m/Occluded-Object-Detection-With-Tracking',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'SoftwareApplication',
          name: 'OOD Detection Framework',
          description: 'Novel approach using conditional diffusion models as generative classifiers for robust out-of-distribution detection on CIFAR-10 benchmarks.',
          applicationCategory: 'AI/ML Research',
          url: 'https://github.com/ahmed-3m/OOD-diffusion-detector',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'SoftwareApplication',
          name: 'Faultrix',
          description: 'AI-powered construction quality control SaaS — generates ÖNORM-compliant reports from photos in under 1 minute.',
          applicationCategory: 'BusinessApplication',
          url: 'https://faultrix.com',
          author: { '@type': 'Person', name: 'Ahmed Mohammed' },
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'SoftwareApplication',
          name: 'EEG Signal Classification',
          description: 'Deep RNN architectures (LSTM, Bi-LSTM, GRU) for motor imagery classification in brain-computer interface applications.',
          applicationCategory: 'AI/ML Research',
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
    '@type': 'ScholarlyArticle',
    headline: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection',
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Johannes Kepler University Linz',
      },
    },
    about: [
      'Out-of-Distribution Detection',
      'Conditional Diffusion Models',
      'Generative Classifiers',
      'CIFAR-10',
    ],
    educationalLevel: "Master's Thesis",
    inLanguage: 'en',
    isPartOf: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Master of Science in Artificial Intelligence',
      educationalLevel: "Master's Degree",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(researchSchema) }}
    />
  );
}
