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
  // Turbopack devre dışı — webpack kullan
  // (Vercel'de @tailwindcss/postcss modülü bulunamıyor sorunu için)
  turbopack: false as any,
  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
