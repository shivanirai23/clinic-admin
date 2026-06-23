import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load Hikigai (and other) env vars from the monorepo root .env
loadEnvConfig(path.join(__dirname, ".."));

// Multi-Zones (micro-frontends): /login + /signup are served by the auth-zone
// app. This app acts as the router for the whole domain and proxies those paths
// (plus the zone's static assets) to the owning zone.
const AUTH_ZONE_URL = process.env.AUTH_ZONE_URL ?? "http://localhost:3002";

const config: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/login",
        destination: `${AUTH_ZONE_URL}/login`,
      },
      {
        source: "/signup",
        destination: `${AUTH_ZONE_URL}/signup`,
      },
      {
        source: "/auth-static/:path+",
        destination: `${AUTH_ZONE_URL}/auth-static/:path+`,
      },
    ];
  },
};

export default config;
