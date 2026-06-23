import type { NextConfig } from "next";

// Auth zone in the Multi-Zones (micro-frontend) setup. Owns /login and
// /signup; reached through rewrites in the main ai-scribe app.
//
// assetPrefix namespaces this zone's JS/CSS under /auth-static/_next/... so
// they don't collide with the other zones' assets on the shared origin.
const config: NextConfig = {
  output: "standalone",
  assetPrefix: "/auth-static",
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/login",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default config;
