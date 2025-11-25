import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-855f8edfc401414b8f96c13867dff69d.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
};

export default nextConfig;
