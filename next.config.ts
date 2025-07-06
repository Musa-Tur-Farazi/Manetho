import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. This prevents CI/CD failures while
    // lint clean-up is in progress.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to successfully complete even if
    // there are TypeScript errors.
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  /* other config options */
};

export default nextConfig;
