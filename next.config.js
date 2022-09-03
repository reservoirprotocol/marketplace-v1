/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: false,
  },
  images: {
    loader: 'akamai',
    path: '',
  },
}

module.exports = nextConfig
