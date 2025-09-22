import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    turbopack: {
      // Use relative path instead of absolute path
    }
  }
};

export default nextConfig;
