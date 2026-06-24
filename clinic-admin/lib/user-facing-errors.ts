type ErrorContext = "appointments" | "clinicians" | "badges" | "general";

const DEFAULT_MESSAGES: Record<ErrorContext, string> = {
  appointments: "We couldn't load today's appointments. Please try again in a moment.",
  clinicians: "We couldn't load clinicians. Please try again in a moment.",
  badges: "We couldn't complete the badge action. Please try again in a moment.",
  general: "Something went wrong. Please try again in a moment.",
};

function looksTechnical(message: string): boolean {
  return (
    /HIKIGAI_|\/api\/v1\/|Bearer|access_token|mcp-server|cloudfront|auth\/exchange/i.test(
      message,
    ) ||
    /\bhikigai\b/i.test(message) ||
    /\bidexx\b/i.test(message) ||
    /\bidentity\b/i.test(message)
  );
}

/** Turn API / server errors into plain language for the clinic admin UI. */
export function formatUserFacingError(
  error: unknown,
  context: ErrorContext = "general",
  fallback?: string,
): string {
  const defaultMessage = fallback ?? DEFAULT_MESSAGES[context];

  if (!(error instanceof Error)) return defaultMessage;

  const message = error.message.trim();
  if (!message) return defaultMessage;

  return sanitizeApiErrorMessage(message, context, defaultMessage);
}

/** Sanitize a raw error string (e.g. from an API JSON body) for display in the UI. */
export function sanitizeApiErrorMessage(
  message: string,
  context: ErrorContext = "general",
  fallback?: string,
): string {
  const defaultMessage = fallback ?? DEFAULT_MESSAGES[context];
  const trimmed = message.trim();
  if (!trimmed) return defaultMessage;

  const lower = trimmed.toLowerCase();

  if (
    lower.includes("not configured") ||
    lower.includes("hikigai_api") ||
    lower.includes("hikigai_app_id")
  ) {
    if (context === "appointments") {
      return "Appointment sync isn't set up yet. Please contact your clinic administrator.";
    }
    if (context === "clinicians" || context === "badges") {
      return "Badge management isn't set up yet. Please contact your clinic administrator.";
    }
    return "This feature isn't set up yet. Please contact your clinic administrator.";
  }

  if (
    lower.includes("session token") ||
    lower.includes("auth exchange") ||
    lower.includes("auth/exchange")
  ) {
    return "We couldn't connect to clinic services. Please try again, or contact your administrator if this continues.";
  }

  if (lower.includes("agent not found")) {
    return "Appointment sync is temporarily unavailable. Please contact your clinic administrator.";
  }

  if (lower.includes("timed out") || lower.includes("timeout")) {
    return "This is taking longer than expected. Please try again in a moment.";
  }

  if (lower.includes("fetch failed") || lower.includes("network")) {
    return "We couldn't reach clinic services. Check your connection and try again.";
  }

  if (lower === "email is required") {
    return "Please enter the clinician's email address.";
  }

  if (lower.includes("invalid request body")) {
    return "Something was wrong with that request. Please try again.";
  }

  if (lower.includes("userid and credentialid")) {
    return "We couldn't deactivate this badge because required details were missing.";
  }

  if (lower.includes("date must be in")) {
    return "Please use a date in YYYY-MM-DD format.";
  }

  if (looksTechnical(trimmed)) {
    return defaultMessage;
  }

  if (trimmed.length <= 120 && !trimmed.includes("http")) {
    return trimmed;
  }

  return defaultMessage;
}
