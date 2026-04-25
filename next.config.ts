import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Prevent trailingSlash from redirecting .xml/.txt files — breaks sitemap/robots fetching
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
