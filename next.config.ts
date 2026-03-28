import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for production
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Type checking is handled by TypeScript, not Next.js
  // For better build performance in CI/CD
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable strict mode in production for better performance
  // Enable it in development to catch side effects
  reactStrictMode: process.env.NODE_ENV !== 'production',

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,
};

export default nextConfig;
