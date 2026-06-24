import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load Hikigai env from monorepo root and clinic-admin/.env
loadEnvConfig(path.join(__dirname, ".."));
loadEnvConfig(__dirname);

const config: NextConfig = {
  output: "standalone",
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
