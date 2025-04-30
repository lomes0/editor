const IS_VERCEL = !!process.env.NEXT_PUBLIC_VERCEL_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require("./next-pwa")({
  dest: "public",
  disable: !IS_PRODUCTION,
  register: false,
  buildExcludes: ["app-build-manifest.json"],
  skipWaiting: false,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  reloadOnOnline: false,
});


/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  /** @param { import('webpack').Configuration } config */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas');
    }
    if (IS_VERCEL) {
      config.externals.push('puppeteer');
    }
    return config
  },
};

module.exports = withPWA(withBundleAnalyzer(config));
