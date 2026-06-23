import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";

// Load Hikigai (and other) env vars from the monorepo root .env
loadEnvConfig(path.join(__dirname, ".."));

const config: NextConfig = {
  output: "standalone",
};

export default config;
