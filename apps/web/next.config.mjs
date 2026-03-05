/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static page generation completely - all pages are dynamic
  // DO NOT use 'output: standalone' as it triggers static export

  // Skip type checking during build (handled separately in CI)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    domains: ['localhost', 'api.nebula-ai.com'],
    unoptimized: true, // Disable optimization for Docker
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5003',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:4200',
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
