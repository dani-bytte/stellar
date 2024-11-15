/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true, // Use `true` para redirecionamento permanente (301) ou `false` para redirecionamento temporário (302)
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy to Backend
      },
    ];
  },
  webpack(config) {
    // Remova a alteração do devtool para evitar problemas de desempenho
    return config;
  },
};

export default nextConfig;
