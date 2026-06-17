const SESSION_KEY = "clinic_admin_dev_session";

export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS !== "false";

export function setDevSession(email: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

export function isDevAuthenticated(): boolean {
  return !!localStorage.getItem(SESSION_KEY);
}

export function clearDevSession() {
  localStorage.removeItem(SESSION_KEY);
}
