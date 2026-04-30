/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure we don't have issues with static generation during build
  output: 'standalone',
};

module.exports = nextConfig;
