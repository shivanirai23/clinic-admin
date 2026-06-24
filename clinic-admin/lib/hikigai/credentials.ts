import { getBadgesAccessToken, clearBadgesAccessTokenCache } from "./auth";
import { getBadgesConfig } from "./config";
import { HikigaiApiError } from "./errors";
import type { BadgeStatus } from "@/lib/types";

const SDK_USER_AGENT = "hikigai-sdk/0.0.1";

export interface EndUserCredential {
  id: string;
  end_user_id: string;
  credential_type: string;
  status: string;
  issued_at: string | null;
  expires_at: string | null;
  last_used_at: string | null;
}

export interface QrBadgeInfo {
  badgeStatus: BadgeStatus;
  lastIssued: string | null;
  qrCredentialId: string | null;
}

async function buildSdkHeaders(): Promise<Record<string, string>> {
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
    `Hikigai credentials request failed (${status})`
  );
}

function normalizeCredential(raw: unknown): EndUserCredential | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = String(record.id ?? "").trim();
  const endUserId = String(record.end_user_id ?? "").trim();
  if (!id || !endUserId) return null;

  return {
    id,
    end_user_id: endUserId,
    credential_type: String(record.credential_type ?? ""),
    status: String(record.status ?? ""),
    issued_at: record.issued_at ? String(record.issued_at) : null,
    expires_at: record.expires_at ? String(record.expires_at) : null,
    last_used_at: record.last_used_at ? String(record.last_used_at) : null,
  };
}

function normalizeCredentials(payload: unknown): EndUserCredential[] {
  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = record.credentials ?? record.data ?? record.items;
    if (Array.isArray(nested)) items = nested;
  }

  return items
    .map(normalizeCredential)
    .filter((credential): credential is EndUserCredential => credential !== null);
}

function formatIssuedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isActiveStatus(status: string): boolean {
  return status.toLowerCase() === "active";
}

/** Derive QR badge display state from a user's credential list. */
export function deriveQrBadgeInfo(credentials: EndUserCredential[]): QrBadgeInfo {
  const qrCredentials = credentials.filter((c) => c.credential_type === "qr");
  const activeQr = qrCredentials.find((c) => isActiveStatus(c.status));

  if (activeQr) {
    return {
      badgeStatus: "ACTIVE",
      lastIssued: activeQr.issued_at ? formatIssuedDate(activeQr.issued_at) : null,
      qrCredentialId: activeQr.id,
    };
  }

  if (qrCredentials.length > 0) {
    const latest = [...qrCredentials].sort((a, b) => {
      const aTime = a.issued_at ? new Date(a.issued_at).getTime() : 0;
      const bTime = b.issued_at ? new Date(b.issued_at).getTime() : 0;
      return bTime - aTime;
    })[0];

    return {
      badgeStatus: "DEACTIVATED",
      lastIssued: latest?.issued_at ? formatIssuedDate(latest.issued_at) : null,
      qrCredentialId: null,
    };
  }

  return {
    badgeStatus: "NO_BADGE",
    lastIssued: null,
    qrCredentialId: null,
  };
}

/** List all credentials (QR badges, PINs) for an end user. */
export async function listEndUserCredentials(userId: string): Promise<EndUserCredential[]> {
  const { apiBaseUrl } = getBadgesConfig();
  const url = `${apiBaseUrl}/api/v1/end-users/${encodeURIComponent(userId)}/credentials`;

  let headers = await buildSdkHeaders();
  let response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    clearBadgesAccessTokenCache();
    headers = await buildSdkHeaders();
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

  return normalizeCredentials(payload);
}

/** Revoke a QR badge or PIN credential. */
export async function revokeEndUserCredential(
  userId: string,
  credentialId: string,
): Promise<void> {
  const { apiBaseUrl } = getBadgesConfig();
  const url = `${apiBaseUrl}/api/v1/end-users/${encodeURIComponent(userId)}/credentials/${encodeURIComponent(credentialId)}`;

  let headers = await buildSdkHeaders();
  let response = await fetch(url, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    clearBadgesAccessTokenCache();
    headers = await buildSdkHeaders();
    response = await fetch(url, {
      method: "DELETE",
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
}
