import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow API calls to the local kernel during development
  async rewrites() {
    return [
      {
        source: "/kernel/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
