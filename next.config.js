/** @type {import('next').NextConfig} */

// Vercel Environment Variable Debugging
console.log("--- Vercel Environment Variable Check ---");
console.log("ELEVENLABS_API_KEY is defined:", !!process.env.ELEVENLABS_API_KEY);
console.log("Length of ELEVENLABS_API_KEY:", process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.length : 0);
console.log("-----------------------------------------");

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
