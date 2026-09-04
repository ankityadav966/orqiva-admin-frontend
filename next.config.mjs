/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'sonner', 'clsx', 'tailwind-merge'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api.orqivatech.com' },
      { protocol: 'https', hostname: 'www.orqivatech.com' },
      { protocol: 'https', hostname: 'orqivatech.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
