import { getBadgesAccessToken, clearBadgesAccessTokenCache } from "./auth";
import { getBadgesConfig } from "./config";
import { HikigaiApiError } from "./errors";

const SDK_USER_AGENT = "hikigai-sdk/0.0.1";

import type { BadgeStatus } from "@/lib/types";

export interface IssueQrBadgeResponse {
  credential_id: string;
  end_user_id: string;
  email: string;
  qr_payload: string;
  qr_code_png_base64: string;
}

export interface SignupIdentityUserRequest {
  email: string;
  password: string;
  display_name?: string;
  attributes?: Record<string, string>;
}

export interface SignupIdentityUserResponse {
  user_sub: string;
  email: string;
  confirmed: boolean;
}

export interface IdentityUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status?: string;
  createdAt?: string;
}

export interface IdentityUserWithBadge extends IdentityUser {
  badgeStatus: BadgeStatus;
  lastIssued: string | null;
  qrCredentialId: string | null;
}

async function buildAuthenticatedHeaders(): Promise<Record<string, string>> {
  const { apiKey, projectId } = getBadgesConfig();
  const accessToken = await getBadgesAccessToken();

  return {
    "X-API-Key": apiKey,
    "X-Project-ID": projectId,
    "User-Agent": SDK_USER_AGENT,
    Authorization: `Bearer ${accessToken}`,
  };
}

function extractErrorMessage(payload: unknown, status: number): string {
  const record = payload as { message?: string; error?: string; detail?: string } | null;
  return (
    record?.message ??
    record?.error ??
    record?.detail ??
    `Hikigai identity request failed (${status})`
  );
}

/** Register a new end user in the Identity pool for this app. */
export async function signupIdentityUser(
  params: SignupIdentityUserRequest,
): Promise<SignupIdentityUserResponse> {
  const { apiBaseUrl, apiKey, projectId, appId } = getBadgesConfig();

  const url = `${apiBaseUrl}/api/v1/identity/signup`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "X-Project-ID": projectId,
      "User-Agent": SDK_USER_AGENT,
    },
    body: JSON.stringify({
      app_id: appId,
      email: params.email.trim(),
      password: params.password,
      display_name: params.display_name?.trim() || undefined,
      ...(params.attributes && Object.keys(params.attributes).length > 0
        ? { attributes: params.attributes }
        : {}),
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HikigaiApiError(
      extractErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  const data = payload as SignupIdentityUserResponse;
  if (!data?.user_sub || !data?.email) {
    throw new HikigaiApiError(
      "Signup response missing user_sub or email",
      response.status,
      payload,
    );
  }

  return data;
}

/** Issue (or re-issue) a QR login badge for an end user. */
export async function issueQrBadge(email: string): Promise<IssueQrBadgeResponse> {
  const { apiBaseUrl, appId } = getBadgesConfig();

  const encodedEmail = encodeURIComponent(email.trim());
  const url = `${apiBaseUrl}/api/v1/identity/apps/${appId}/users/${encodedEmail}/qr-login`;

  let headers = await buildAuthenticatedHeaders();
  let response = await fetch(url, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    clearBadgesAccessTokenCache();
    headers = await buildAuthenticatedHeaders();
    response = await fetch(url, {
      method: "POST",
      headers,
      cache: "no-store",
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HikigaiApiError(
      extractErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  const data = payload as IssueQrBadgeResponse;
  if (!data?.qr_code_png_base64 || !data?.qr_payload) {
    throw new HikigaiApiError(
      "QR badge response missing qr_code_png_base64 or qr_payload",
      response.status,
      payload,
    );
  }

  return data;
}

function normalizeIdentityUser(raw: unknown): IdentityUser | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const attributes =
    record.attributes && typeof record.attributes === "object"
      ? (record.attributes as Record<string, string>)
      : undefined;

  const email = String(record.email ?? record.username ?? "").trim();
  if (!email) return null;

  const id = String(
    record.sub ?? record.user_sub ?? record.end_user_id ?? record.id ?? email,
  );
  const displayName = String(
    record.display_name ??
      record.name ??
      record.full_name ??
      attributes?.name ??
      attributes?.["custom:name"] ??
      email.split("@")[0],
  );
  const role = String(
    record.role ??
      attributes?.role ??
      attributes?.["custom:role"] ??
      "Clinician",
  );

  return {
    id,
    email,
    displayName,
    role,
    status: record.status ? String(record.status) : undefined,
    createdAt: record.created_at ? String(record.created_at) : undefined,
  };
}

function normalizeIdentityUsers(payload: unknown): IdentityUser[] {
  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = record.users ?? record.data ?? record.items;
    if (Array.isArray(nested)) items = nested;
  }

  return items
    .map(normalizeIdentityUser)
    .filter((user): user is IdentityUser => user !== null);
}

async function buildJwtHeaders(): Promise<Record<string, string>> {
  const { projectId } = getBadgesConfig();
  const accessToken = await getBadgesAccessToken();

  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Project-ID": projectId,
  };
}

/** List end users registered in the Identity pool for this app. */
export async function listIdentityUsers(): Promise<IdentityUser[]> {
  const { apiBaseUrl, projectId, appId } = getBadgesConfig();

  const url = `${apiBaseUrl}/api/v1/projects/${projectId}/apps/${appId}/identity/users`;

  let headers = await buildJwtHeaders();
  let response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    clearBadgesAccessTokenCache();
    headers = await buildJwtHeaders();
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HikigaiApiError(
      extractErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  return normalizeIdentityUsers(payload);
}

/** List identity users with QR badge status from the credentials index. */
export async function listIdentityUsersWithBadges(): Promise<IdentityUserWithBadge[]> {
  const { deriveQrBadgeInfo, listEndUserCredentials } = await import("./credentials");
  const users = await listIdentityUsers();

  return Promise.all(
    users.map(async (user) => {
      try {
        const credentials = await listEndUserCredentials(user.id);
        const badge = deriveQrBadgeInfo(credentials);
        return { ...user, ...badge };
      } catch {
        return {
          ...user,
          badgeStatus: "NO_BADGE" as BadgeStatus,
          lastIssued: null,
          qrCredentialId: null,
        };
      }
    }),
  );
}
