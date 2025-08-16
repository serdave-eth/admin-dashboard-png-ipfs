/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'scontent-iad4-1.choicecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'magic.decentralized-content.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Fallback to domains for broader compatibility
    domains: [
      'gateway.pinata.cloud', 
      'ipfs.io', 
      'scontent-iad4-1.choicecdn.com',
      'magic.decentralized-content.com'
    ],
  },
}

module.exports = nextConfig