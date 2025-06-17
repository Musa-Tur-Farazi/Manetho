import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  // Moved out of experimental as required by Next.js 15
  outputFileTracingRoot: process.cwd(),
  // Disable ESLint and TypeScript checking during build for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
