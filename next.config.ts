import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Standalone output for optimized Vercel/Docker deployment
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
