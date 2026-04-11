/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  trailingSlash: true,
};

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();

module.exports = nextConfig;
