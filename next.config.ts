import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false, // ✅ Turbopack 끄기 (캐시 오류 방지)
  },
};

export default nextConfig;
