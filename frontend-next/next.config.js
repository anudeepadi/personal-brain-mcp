/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional: Proxy API requests to local backend during development
  // For production, configure this in vercel.json or remove if deploying as static demo
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
