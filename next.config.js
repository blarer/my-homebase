/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  basePath: '/my-homebase',
  assetPrefix: '/my-homebase/',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  trailingSlash: true,
}

module.exports = nextConfig 