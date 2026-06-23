import { getHikigaiConfig } from "./config";
import { HikigaiApiError } from "./errors";

interface AuthExchangeResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;
let exchangePromise: Promise<string> | null = null;

async function exchangeApiKey(): Promise<string> {
  const config = getHikigaiConfig();
  const url = `${config.platformUrl}/api/v1/auth/exchange`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string; error?: string; detail?: string } | null)
        ?.message ??
      (payload as { error?: string } | null)?.error ??
      (payload as { detail?: string } | null)?.detail ??
      `Hikigai auth exchange failed (${response.status})`;
    throw new HikigaiApiError(message, response.status, payload);
  }

  const data = payload as AuthExchangeResponse;
  if (!data?.access_token) {
    throw new HikigaiApiError("Hikigai auth exchange returned no access_token", response.status, payload);
  }

  const refreshBufferSec = 300;
  const ttlSec = Math.max(60, (data.expires_in ?? 3600) - refreshBufferSec);

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + ttlSec * 1000,
  };

  return cachedToken.accessToken;
}

/** Exchange API key for a short-lived bearer token (cached until expiry). */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.accessToken;
  }

  if (!exchangePromise) {
    exchangePromise = exchangeApiKey().finally(() => {
      exchangePromise = null;
    });
  }

  return exchangePromise;
}

/** Clear cached token (useful after 401/403 to force re-exchange). */
export function clearAccessTokenCache() {
  cachedToken = null;
}
