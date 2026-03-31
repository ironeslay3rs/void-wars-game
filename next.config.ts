import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Self-hosted / Phase 10 — slim Node image via `Dockerfile` (`output: "standalone"`). */
  output: "standalone",
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
