/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/my-homebase' : '',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 