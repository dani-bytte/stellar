/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add experimental flag for http-proxy warning
  experimental: {
    serverComponentsExternalPackages: ['http-proxy'],
  },

  // Existing redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },

  // Optimize rewrites with headers
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },

  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Optimize webpack config
  webpack(config) {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    return config;
  },

  // Existing image config
  images: {
    domains: ['minios3.muonityzone.top'],
  },
};

export default nextConfig;
