/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')([
  '@reservoir0x/reservoir-kit-ui',
])

module.exports = withTM({
  reactStrictMode: true,
  api: {
    bodyParser: false,
  },
})
