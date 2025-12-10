/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we can use server actions for the Gemini service
  experimental: {
    serverActions: {},
  },
  // Allow external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;