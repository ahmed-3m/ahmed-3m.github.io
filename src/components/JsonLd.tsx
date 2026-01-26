export function PersonSchema() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ahmed Mohammed',
    alternateName: 'Ahmed 3M',
    jobTitle: 'AI/ML Engineer & Entrepreneur',
    url: 'https://ahmed-3m.github.io',
    sameAs: [
      'https://github.com/ahmed-3m',
      'https://huggingface.co/ahmed-3m',
      'https://wandb.ai/ahmed-mu-0593',
      'https://www.linkedin.com/in/ahmed-3m/',
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Computer Vision',
      'Anomaly Detection',
      'Diffusion Models',
      'YOLO',
      'PyTorch',
      'TensorFlow',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Faultrix',
      url: 'https://faultrix.com',
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
    description: 'AI/ML Engineer & Entrepreneur Portfolio',
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
    },
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
    founder: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
    },
    foundingDate: '2025',
    description: 'AI-powered tools for construction quality control',
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
        name: 'What is your expertise in AI/ML?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I specialize in computer vision, anomaly detection, and diffusion models with expertise in PyTorch, YOLO, and production ML systems. I achieved 98.4% accuracy in industrial defect detection at PROFACTOR GmbH.',
        },
      },
      {
        '@type': 'Question',
        name: 'What services do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I offer AI/ML consulting, computer vision solutions, custom model development, and production deployment. Currently focusing on AI-powered quality control systems through Faultrix.',
        },
      },
      {
        '@type': 'Question',
        name: 'What industries do you work with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'I work primarily with manufacturing, construction, and industrial automation sectors, specializing in quality control, defect detection, and process optimization.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact you for a project?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can reach me via email at ahmed.mo.0595@gmail.com, through LinkedIn at linkedin.com/in/ahmed-3m, or via the contact section on my portfolio.',
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
    mainEntity: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      alternateName: 'Ahmed 3M',
      description: 'AI/ML Engineer & Entrepreneur specializing in computer vision and deep learning',
      image: 'https://ahmed-3m.github.io/og-image.png',
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
      },
      alumniOf: {
        '@type': 'Organization',
        name: 'Johannes Kepler University',
      },
      knowsAbout: [
        'Artificial Intelligence',
        'Machine Learning',
        'Computer Vision',
        'Deep Learning',
        'PyTorch',
        'YOLO',
        'Diffusion Models',
        'Anomaly Detection',
      ],
      hasOccupation: {
        '@type': 'Occupation',
        name: 'AI/ML Engineer',
        occupationalCategory: '15-1299.08',
        estimatedSalary: {
          '@type': 'MonetaryAmountDistribution',
          currency: 'EUR',
          duration: 'P1Y',
        },
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
