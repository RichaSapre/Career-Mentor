const ACCESS = "cm_access";
const REFRESH = "cm_refresh";
export const LOGIN_EMAIL_KEY = "cm_login_email";
const DEV_ACCESS = "local-dev-access";
const DEV_REFRESH = "local-dev-refresh";

export function shouldEnableLocalAuthBypass(): boolean {
  if (typeof window === "undefined") return false;

  const fromEnv = process.env.NEXT_PUBLIC_LOCAL_AUTH_BYPASS === "true";
  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return fromEnv || (process.env.NODE_ENV === "development" && isLocalHost);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(ACCESS);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(REFRESH);
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    if (typeof window === "undefined") return;
    setCookie(ACCESS, tokens.accessToken, 7);
    setCookie(REFRESH, tokens.refreshToken, 30);
  },
  setLocalDevSession() {
    if (typeof window === "undefined") return;
    setCookie(ACCESS, DEV_ACCESS, 1);
    setCookie(REFRESH, DEV_REFRESH, 1);
  },
  clear() {
    if (typeof window === "undefined") return;
    removeCookie(ACCESS);
    removeCookie(REFRESH);
    localStorage.removeItem(LOGIN_EMAIL_KEY);
  },
};
