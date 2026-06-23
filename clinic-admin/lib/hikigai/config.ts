const DEFAULT_PLATFORM_URL = "https://hikigaiplatform.io";
const DEFAULT_API_BASE = "https://backend.hikigaiplatform.io";
const DEFAULT_APPOINTMENTS_AGENT_SLUG = "clinic-agent";
const DEFAULT_IDEXX_MCP_CLOUDFRONT = "https://d3lzkl3r2m6rut.cloudfront.net";
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

function resolveIdexxMcpUrl(projectId: string): string {
  const explicit = process.env.HIKIGAI_IDEXX_MCP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const shortId = projectId.split("-")[0];
  return `${DEFAULT_IDEXX_MCP_CLOUDFRONT}/idexx-mcp-server-${shortId}/mcp`;
}

function resolveAppointmentsAgentSlug(): string {
  return (
    process.env.HIKIGAI_APPOINTMENTS_AGENT_SLUG?.trim() || DEFAULT_APPOINTMENTS_AGENT_SLUG
  );
}

export function getHikigaiConfig() {
  const apiKey = process.env.HIKIGAI_API_KEY?.trim();
  const projectId = process.env.HIKIGAI_PROJECT_ID?.trim();
  const appId = process.env.HIKIGAI_APP_ID?.trim();

  if (!apiKey) {
    throw new Error("HIKIGAI_API_KEY is not configured");
  }
  if (!projectId) {
    throw new Error("HIKIGAI_PROJECT_ID is not configured");
  }

  return {
    apiKey,
    projectId,
    appId: appId ?? "",
    appointmentsAgentSlug: resolveAppointmentsAgentSlug(),
    idexxMcpUrl: resolveIdexxMcpUrl(projectId),
    idexxApiKey: process.env.HIKIGAI_IDEXX_API_KEY?.trim() || apiKey,
    idexxProjectId: process.env.HIKIGAI_IDEXX_PROJECT_ID?.trim() || projectId,
    platformUrl: resolvePlatformUrl(),
    apiBaseUrl: resolveApiBaseUrl(),
    defaultTimeoutSec: Number(process.env.HIKIGAI_DEFAULT_TIMEOUT_SEC ?? DEFAULT_TIMEOUT_SEC),
  } as const;
}

export function isHikigaiConfigured(): boolean {
  return Boolean(
    process.env.HIKIGAI_API_KEY?.trim() && process.env.HIKIGAI_PROJECT_ID?.trim(),
  );
}

export function isIdentityConfigured(): boolean {
  return isHikigaiConfigured() && Boolean(process.env.HIKIGAI_APP_ID?.trim());
}
