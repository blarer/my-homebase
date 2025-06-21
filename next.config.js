/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/my-homebase' : '',
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 