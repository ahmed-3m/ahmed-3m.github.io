import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://ahmed-3m.github.io/sitemap.xml',
    host: 'https://ahmed-3m.github.io',
  };
}
