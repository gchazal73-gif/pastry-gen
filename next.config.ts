import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/recettes', destination: '/bibliotheque', permanent: true },
    ];
  },
};

export default nextConfig;
