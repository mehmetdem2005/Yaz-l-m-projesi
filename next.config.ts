import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  // Turbopack yerine webpack kullan
  experimental: {
    turbo: false as any,
  },
};

export default nextConfig;
