/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    transpilePackages: ['@reservoir0x/reservoir-kit-ui'],
  },
  async redirects() {
    return [
      {
        source: '/collections/:contractAddress',
        destination: 'https://marketplace.reservoir.tools/collection/ethereum/:contractAddress',
        permanent: true,
      },
      {
        source: '/:contractAddress/:tokenId',
        destination: 'https://marketplace.reservoir.tools/collection/ethereum/:contractAddress/:tokenId',
        permanent: true,
      },{
        source: '/address/:address',
        destination: 'https://marketplace.reservoir.tools/profile/:address',
        permanent: true,
      },
      {
        source: '/sell',
        destination: 'https://marketplace.reservoir.tools/portfolio',
        permanent: true,
      },
      {
        source: '/:path*',
        destination: 'https://marketplace.reservoir.tools/:path*',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
