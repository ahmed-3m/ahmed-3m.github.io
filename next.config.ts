import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  trailingSlash: true,
  // Prevent trailingSlash from redirecting .xml/.txt files because it breaks sitemap/robots fetching.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
