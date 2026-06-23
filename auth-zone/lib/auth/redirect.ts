/** Main clinic-admin app URL — used when login runs on the auth-zone host. */
export function getMainAppUrl(): string {
  if (typeof window !== "undefined" && !window.location.hostname.startsWith("auth-zone-")) {
    return window.location.origin;
  }

  return (
    process.env.NEXT_PUBLIC_MAIN_APP_URL?.trim().replace(/\/$/, "") ||
    "https://clinic-admin-6d1073e3.apps.hikigaiplatform.io"
  );
}

export function redirectToMainApp() {
  const mainAppUrl = getMainAppUrl();
  const target =
    typeof window !== "undefined" && mainAppUrl === window.location.origin
      ? "/"
      : mainAppUrl;
  window.location.replace(target);
}
