import { tokenStore } from "@/lib/auth/tokenStore";
import { API } from "./endpoints";
import type { Tokens } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";

type RefreshResponse = { accessToken?: string; refreshToken?: string; tokens?: Tokens };

async function doRefreshToken(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}${API.refreshToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as RefreshResponse;
    const accessToken = data?.accessToken ?? data?.tokens?.accessToken;
    const refreshToken = data?.refreshToken ?? data?.tokens?.refreshToken;

    if (accessToken && refreshToken) {
      tokenStore.set({ accessToken, refreshToken });
      return true;
    }
  } catch {
    // refresh failed
  }
  tokenStore.clear();
  if (typeof window !== "undefined") window.location.replace("/welcome");
  return false;
}

async function tryRealFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
  isRetry = false
): Promise<T> {
  const { auth = true, ...rest } = options;

  const headers = new Headers(rest.headers);
  const method = (rest.method ?? "GET").toUpperCase();
  const canHaveBody = method !== "GET" && method !== "HEAD";
  const hasBody = canHaveBody && rest.body !== undefined && rest.body !== null;

  if (
    hasBody &&
    !headers.has("Content-Type") &&
    !(typeof FormData !== "undefined" && rest.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const access = tokenStore.getAccess();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (res.status === 401 && auth && path !== API.refreshToken && !isRetry) {
    const refreshed = await doRefreshToken();
    if (refreshed) return tryRealFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let errorMessage = text || `Request failed: ${res.status}`;
    try {
      if (text) {
        const jsonError = JSON.parse(text);
        if (jsonError.message) {
          errorMessage = typeof jsonError.message === "string" ? jsonError.message : JSON.stringify(jsonError.message);
        } else if (jsonError.error) {
          errorMessage = typeof jsonError.error === "string" ? jsonError.error : JSON.stringify(jsonError.error);
        }
      }
    } catch (e) {
      // ignore JSON parse errors and fallback to raw text
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  return tryRealFetch<T>(path, options);
}
