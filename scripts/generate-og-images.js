const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const blogPosts = [
    {
        slug: '5-month-llm-adventure',
        title: '5 Month LLM Adventure',
        subtitle: 'From Zero to Production',
        tags: 'LLM · AI · Deep Learning · GPT',
        gradient: ['#2563eb', '#7c3aed'],
        emoji: '🚀',
    },
    {
        slug: 'computer-vision-yolo-mastery',
        title: '98.4% Accuracy in\nDefect Detection',
        subtitle: 'Industrial YOLO Mastery',
        tags: 'Computer Vision · YOLO · CNN · Industrial AI',
        gradient: ['#059669', '#0d9488'],
        emoji: '🎯',
    },
    {
        slug: 'diffusion-models-anomaly-detection',
        title: 'Diffusion Models for\nAnomaly Detection',
        subtitle: 'Zero-Shot Detection',
        tags: 'Diffusion Models · Generative AI · Research',
        gradient: ['#dc2626', '#ea580c'],
        emoji: '🔬',
    },
];

async function generateOGImage(post) {
    const width = 1200;
    const height = 630;
    const [color1, color2] = post.gradient;

    const titleLines = post.title.split('\n');
    const titleSvg = titleLines
        .map(
            (line, i) =>
                `<text x="80" y="${220 + i * 65}" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800" fill="white">${escapeXml(line)}</text>`
        )
        .join('');

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.3)"/>
      </linearGradient>
    </defs>
    
    <!-- Background gradient -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#overlay)"/>
    
    <!-- Decorative circles -->
    <circle cx="900" cy="150" r="200" fill="white" opacity="0.05"/>
    <circle cx="1050" cy="350" r="150" fill="white" opacity="0.04"/>
    <circle cx="1100" cy="100" r="80" fill="white" opacity="0.06"/>
    
    <!-- Grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" opacity="0.08"/>
    </pattern>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    
    <!-- Content -->
    <text x="80" y="100" font-family="system-ui, sans-serif" font-size="20" fill="white" opacity="0.8">ahmed-3m.github.io/blog</text>
    
    <!-- Title -->
    ${titleSvg}
    
    <!-- Subtitle -->
    <text x="80" y="${220 + titleLines.length * 65 + 15}" font-family="system-ui, sans-serif" font-size="28" fill="white" opacity="0.85">${escapeXml(post.subtitle)}</text>
    
    <!-- Tags -->
    <text x="80" y="${height - 80}" font-family="system-ui, sans-serif" font-size="18" fill="white" opacity="0.6">${escapeXml(post.tags)}</text>
    
    <!-- Author -->
    <text x="80" y="${height - 40}" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="white" opacity="0.9">Ahmed Mohammed · AI/ML Engineer</text>
    
    <!-- Logo -->
    <rect x="${width - 120}" y="${height - 80}" width="50" height="50" rx="10" fill="white" opacity="0.15"/>
    <text x="${width - 103}" y="${height - 42}" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="white" text-anchor="middle">A</text>
  </svg>`;

    const filename = `og-${post.slug}.png`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(publicDir, filename));
    console.log(`Generated ${filename}`);
}

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function generateMainOG() {
    const width = 1200;
    const height = 630;

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    
    <!-- Decorative elements -->
    <circle cx="950" cy="200" r="250" fill="#2563eb" opacity="0.08"/>
    <circle cx="1050" cy="400" r="180" fill="#7c3aed" opacity="0.06"/>
    <circle cx="200" cy="500" r="150" fill="#2563eb" opacity="0.04"/>
    
    <!-- Grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" opacity="0.05"/>
    </pattern>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    
    <!-- Accent line -->
    <rect x="80" y="180" width="60" height="4" rx="2" fill="url(#accent)"/>
    
    <!-- Name -->
    <text x="80" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="white">Ahmed Mohammed</text>
    
    <!-- Title -->
    <text x="80" y="320" font-family="system-ui, sans-serif" font-size="32" fill="#93c5fd">AI/ML Engineer &amp; Entrepreneur</text>
    
    <!-- Description -->
    <text x="80" y="390" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.7">Computer Vision · Anomaly Detection · Diffusion Models</text>
    <text x="80" y="425" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.7">Founder of Faultrix · Based in Linz, Austria</text>
    
    <!-- Stats boxes -->
    <rect x="80" y="470" width="200" height="70" rx="12" fill="white" opacity="0.08"/>
    <text x="180" y="502" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle">98.4%</text>
    <text x="180" y="527" font-family="system-ui, sans-serif" font-size="14" fill="white" opacity="0.6" text-anchor="middle">Defect Detection</text>
    
    <rect x="300" y="470" width="200" height="70" rx="12" fill="white" opacity="0.08"/>
    <text x="400" y="502" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle">M.Sc. AI</text>
    <text x="400" y="527" font-family="system-ui, sans-serif" font-size="14" fill="white" opacity="0.6" text-anchor="middle">JKU Linz</text>
    
    <rect x="520" y="470" width="200" height="70" rx="12" fill="white" opacity="0.08"/>
    <text x="620" y="502" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="white" text-anchor="middle">Faultrix</text>
    <text x="620" y="527" font-family="system-ui, sans-serif" font-size="14" fill="white" opacity="0.6" text-anchor="middle">Founder</text>
    
    <!-- URL -->
    <text x="80" y="${height - 30}" font-family="system-ui, sans-serif" font-size="18" fill="white" opacity="0.5">ahmed-3m.github.io</text>
    
    <!-- Logo -->
    <rect x="${width - 120}" y="${height - 80}" width="50" height="50" rx="10" fill="url(#accent)"/>
    <text x="${width - 95}" y="${height - 45}" font-family="system-ui, sans-serif" font-size="30" font-weight="800" fill="white" text-anchor="middle">A</text>
  </svg>`;

    await sharp(Buffer.from(svg)).png().toFile(path.join(publicDir, 'og-image.png'));
    console.log('Generated og-image.png (main)');
}

async function main() {
    await generateMainOG();
    for (const post of blogPosts) {
        await generateOGImage(post);
    }
    console.log('\nAll OG images generated!');
}

main().catch(console.error);
