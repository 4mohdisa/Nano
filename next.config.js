/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.redd.it',
      'preview.redd.it',
      'external-preview.redd.it',
      'b.thumbs.redditmedia.com',
      'a.thumbs.redditmedia.com',
      'imgur.com',
      'i.imgur.com'
    ],
  },
  // Increase body size limit for API routes (for large image uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
