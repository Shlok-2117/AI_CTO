/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { mermaid: 'mermaid' }]
    return config
  },
}
module.exports = nextConfig
