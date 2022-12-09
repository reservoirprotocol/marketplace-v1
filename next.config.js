/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: false,
  },
  async rewrites() {
    return [
      {
        source: '/discover',
        destination: '/collections/0x5a0121a0a21232ec0d024dab9017314509026480',
      },
      {
        source: '/discover/:tokenId',
        destination: '/0x5a0121a0a21232ec0d024dab9017314509026480/:tokenId'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/collections/0x5a0121a0a21232ec0d024dab9017314509026480',
        destination: '/discover',
        permanent: true,
      },
      {
        source: '/0x5a0121a0a21232ec0d024dab9017314509026480/:tokenId',
        destination: '/discover/:tokenId',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
