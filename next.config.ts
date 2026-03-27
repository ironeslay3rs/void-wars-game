import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/bazaar/:path*",
        destination: "/market/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/market/:path*",
        destination: "/bazaar/:path*",
      },
    ];
  },
};

export default nextConfig;
