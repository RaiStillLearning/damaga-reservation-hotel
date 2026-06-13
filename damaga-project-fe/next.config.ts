import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "187.77.113.216",
      },
      {
        protocol: "https",
        hostname: "api.damaga.my.id",
      },
    ],
    // Also allow data: URIs for base64 avatar previews
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
