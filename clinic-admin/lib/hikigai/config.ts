const DEFAULT_PLATFORM_URL = "https://hikigaiplatform.io";
const DEFAULT_API_BASE = "https://backend.hikigaiplatform.io";
const DEFAULT_TIMEOUT_SEC = 300;

function resolvePlatformUrl(): string {
  const platform = process.env.HIKIGAI_PLATFORM_URL?.trim();
  return (platform || DEFAULT_PLATFORM_URL).replace(/\/$/, "");
}

function resolveApiBaseUrl(): string {
  const explicit = process.env.HIKIGAI_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const platform = process.env.HIKIGAI_PLATFORM_URL?.trim();
  if (platform?.includes("hikigaiplatform.io")) {
    return DEFAULT_API_BASE;
  }
  if (platform) return platform.replace(/\/$/, "");

  return DEFAULT_API_BASE;
}

export function getHikigaiConfig() {
  const apiKey = process.env.HIKIGAI_API_KEY?.trim();
  const projectId = process.env.HIKIGAI_PROJECT_ID?.trim();

  if (!apiKey) {
    throw new Error("HIKIGAI_API_KEY is not configured");
  }
  if (!projectId) {
    throw new Error("HIKIGAI_PROJECT_ID is not configured");
  }

  const siteId = Number(process.env.HIKIGAI_SITE_ID ?? "1");
  if (!Number.isFinite(siteId)) {
    throw new Error("HIKIGAI_SITE_ID must be a valid integer");
  }

  return {
    apiKey,
    projectId,
    platformUrl: resolvePlatformUrl(),
    apiBaseUrl: resolveApiBaseUrl(),
    siteId,
    defaultTimeoutSec: Number(process.env.HIKIGAI_DEFAULT_TIMEOUT_SEC ?? DEFAULT_TIMEOUT_SEC),
  } as const;
}

export function isHikigaiConfigured(): boolean {
  return Boolean(
    process.env.HIKIGAI_API_KEY?.trim() && process.env.HIKIGAI_PROJECT_ID?.trim(),
  );
}
