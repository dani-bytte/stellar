/** @type {import('next').NextConfig} */
const nextConfig = {
  // Movido de experimental.serverComponentsExternalPackages para a raiz
  serverExternalPackages: ['http-proxy'],

  experimental: {
    // Outros configs experimentais podem permanecer
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

  // Otimizar geração de imagens
  images: {
    domains: ['minios3.muonityzone.top'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Adicionar linting em tempo de build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
