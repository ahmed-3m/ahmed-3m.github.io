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
