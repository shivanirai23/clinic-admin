import { getBadgesConfig, getHikigaiConfig } from "./config";
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

interface ExchangeCredentials {
  apiKey: string;
  projectId: string;
  platformUrl: string;
  apiBaseUrl: string;
}

let mainCachedToken: TokenCache | null = null;
let mainExchangePromise: Promise<string> | null = null;

let badgesCachedToken: TokenCache | null = null;
let badgesExchangePromise: Promise<string> | null = null;

function extractExchangeError(payload: unknown, status: number): string {
  const record = payload as { message?: string; error?: string; detail?: string } | null;
  return (
    record?.message ??
    record?.error ??
    record?.detail ??
    `Hikigai auth exchange failed (${status})`
  );
}

function buildTokenCache(data: AuthExchangeResponse): TokenCache {
  const refreshBufferSec = 300;
  const ttlSec = Math.max(60, (data.expires_in ?? 3600) - refreshBufferSec);
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + ttlSec * 1000,
  };
}

async function exchangeApiKey(credentials: ExchangeCredentials): Promise<TokenCache> {
  const exchangeUrls = [
    ...new Set([
      `${credentials.apiBaseUrl}/api/v1/auth/exchange`,
      `${credentials.platformUrl}/api/v1/auth/exchange`,
    ]),
  ];

  const headers = {
    "Content-Type": "application/json",
    "X-API-Key": credentials.apiKey,
    "X-Project-ID": credentials.projectId,
  };

  let lastError: HikigaiApiError | null = null;

  for (const url of exchangeUrls) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    if (response.ok) {
      const data = payload as AuthExchangeResponse;
      if (!data?.access_token) {
        throw new HikigaiApiError(
          "Hikigai auth exchange returned no access_token",
          response.status,
          payload,
        );
      }
      return buildTokenCache(data);
    }

    const message = extractExchangeError(payload, response.status);
    lastError = new HikigaiApiError(message, response.status, payload);

    if (response.status === 401 || response.status === 403) {
      throw lastError;
    }
  }

  throw lastError ?? new HikigaiApiError("Hikigai auth exchange failed");
}

async function getScopedAccessToken(
  getCredentials: () => ExchangeCredentials,
  getCache: () => TokenCache | null,
  setCache: (cache: TokenCache | null) => void,
  getPromise: () => Promise<string> | null,
  setPromise: (promise: Promise<string> | null) => void,
): Promise<string> {
  const now = Date.now();
  const cached = getCache();
  if (cached && cached.expiresAt > now) {
    return cached.accessToken;
  }

  let promise = getPromise();
  if (!promise) {
    promise = exchangeApiKey(getCredentials())
      .then((tokenCache) => {
        setCache(tokenCache);
        return tokenCache.accessToken;
      })
      .finally(() => {
        setPromise(null);
      });
    setPromise(promise);
  }

  return promise;
}

/** Exchange main platform API key for a short-lived bearer token (cached until expiry). */
export async function getAccessToken(): Promise<string> {
  const config = getHikigaiConfig();
  const credentials: ExchangeCredentials = {
    apiKey: config.apiKey,
    projectId: config.projectId,
    platformUrl: config.platformUrl,
    apiBaseUrl: config.apiBaseUrl,
  };

  return getScopedAccessToken(
    () => credentials,
    () => mainCachedToken,
    (cache) => {
      mainCachedToken = cache;
    },
    () => mainExchangePromise,
    (promise) => {
      mainExchangePromise = promise;
    },
  );
}

/** Exchange badges API key for a short-lived bearer token (cached until expiry). */
export async function getBadgesAccessToken(): Promise<string> {
  const config = getBadgesConfig();
  const credentials: ExchangeCredentials = {
    apiKey: config.apiKey,
    projectId: config.projectId,
    platformUrl: config.platformUrl,
    apiBaseUrl: config.apiBaseUrl,
  };

  return getScopedAccessToken(
    () => credentials,
    () => badgesCachedToken,
    (cache) => {
      badgesCachedToken = cache;
    },
    () => badgesExchangePromise,
    (promise) => {
      badgesExchangePromise = promise;
    },
  );
}

export function clearAccessTokenCache() {
  mainCachedToken = null;
}

export function clearBadgesAccessTokenCache() {
  badgesCachedToken = null;
}
