import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://api.halong24h.com"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
