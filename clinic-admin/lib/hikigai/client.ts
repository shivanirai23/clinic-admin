import { getAccessToken, clearAccessTokenCache } from "./auth";
import { getHikigaiConfig } from "./config";
import { HikigaiApiError } from "./errors";
import type { HikigaiInvokeResponse, InvokeAgentOptions } from "./types";

export { HikigaiApiError } from "./errors";

async function buildAuthHeaders(): Promise<Record<string, string>> {
  const config = getHikigaiConfig();
  const accessToken = await getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-Project-ID": config.projectId,
  };
}

async function postJson<T>(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  signal: AbortSignal,
): Promise<{ response: Response; payload: T | null }> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as T | null;
  return { response, payload };
}

function extractErrorMessage(payload: unknown, status: number): string {
  const record = payload as { message?: string; error?: string; detail?: string } | null;
  return (
    record?.message ??
    record?.error ??
    record?.detail ??
    `Hikigai request failed (${status})`
  );
}

export async function invokeAgent<TInput extends Record<string, unknown>, TContent = unknown>(
  agentSlug: string,
  input: TInput,
  options?: InvokeAgentOptions,
): Promise<HikigaiInvokeResponse<TContent>> {
  const config = getHikigaiConfig();
  const timeoutSec = options?.timeout ?? config.defaultTimeoutSec;
  const url = `${config.apiBaseUrl}/api/v1/agents/${agentSlug}/invoke`;

  const body: Record<string, unknown> = { input };
  if (timeoutSec) body.timeout = timeoutSec;
  if (options?.connectors) body.connectors = options.connectors;

  const controller = new AbortController();
  const clientTimeoutMs = (timeoutSec + 10) * 1000;
  const timer = setTimeout(() => controller.abort(), clientTimeoutMs);

  try {
    let headers = await buildAuthHeaders();
    let { response, payload } = await postJson(url, headers, body, controller.signal);

    // Retry once with a fresh token if the session expired.
    if (response.status === 401 || response.status === 403) {
      clearAccessTokenCache();
      headers = await buildAuthHeaders();
      ({ response, payload } = await postJson(url, headers, body, controller.signal));
    }

    if (!response.ok) {
      throw new HikigaiApiError(
        extractErrorMessage(payload, response.status),
        response.status,
        payload,
      );
    }

    return payload as HikigaiInvokeResponse<TContent>;
  } catch (error) {
    if (error instanceof HikigaiApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new HikigaiApiError(`Hikigai agent invoke timed out after ${timeoutSec}s`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
