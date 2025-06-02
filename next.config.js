/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['openweathermap.org', 'cdn.coinbase.com'],
  },
  output: 'standalone',
}

module.exports = nextConfig