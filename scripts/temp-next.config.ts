import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  distDir: '.next',
  // Static export for blog
  output: 'export',
  // Configure for blog export
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Helps with static hosting
};

export default nextConfig;
