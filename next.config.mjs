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
        source: '/:path*',
        destination: 'https://marketplace.reservoir.tools/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
