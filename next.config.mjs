/** @type {import('next').NextConfig} */
const nextConfig = {
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
