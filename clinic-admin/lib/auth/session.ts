const SESSION_KEY = "clinic_admin_dev_session";

export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS !== "false";

export interface DevSession {
  email: string;
}

export function setDevSession(email: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
}

export function getDevSession(): DevSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DevSession;
  } catch {
    return null;
  }
}

export function isDevAuthenticated(): boolean {
  return !!localStorage.getItem(SESSION_KEY);
}

export function clearDevSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function logout() {
  clearDevSession();
  window.location.replace("/login");
}
