import { shouldEnableLocalAuthBypass, tokenStore } from "@/lib/auth/tokenStore";
import { API } from "./endpoints";
import type { Tokens } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend";
const TOKEN_ERROR_CODES = new Set(["INVALID_TOKEN", "TOKEN_EXPIRED", "UNAUTHORIZED"]);
const TOKEN_ERROR_PATTERN =
  /invalid\s*(access|refresh)?\s*token|token\s*(is\s*)?(invalid|expired)|expired\s*token|jwt\s*expired|jwt\s*malformed|invalid\s*(jwt|signature)|signature\s*has\s*expired|authentication\s*token|access\s*token\s*is\s*required/i;

type RefreshResponse = { accessToken?: string; refreshToken?: string; tokens?: Tokens };
type ApiErrorDetails = { message: string; code?: string };

function forceLogoutAndRedirect() {
  tokenStore.clear();
  if (typeof window !== "undefined" && window.location.pathname !== "/welcome") {
    window.location.replace("/welcome");
  }
}

function extractErrorDetails(text: string, status: number): ApiErrorDetails {
  const fallbackMessage = text || `Request failed: ${status}`;
  try {
    if (!text) return { message: fallbackMessage };
    const jsonError = JSON.parse(text) as Record<string, unknown>;

    const payloadMessage =
      typeof jsonError.message === "string" && jsonError.message.trim().length > 0
        ? jsonError.message.trim()
        : undefined;

    const payloadError =
      typeof jsonError.error === "string" && jsonError.error.trim().length > 0
        ? jsonError.error.trim()
        : undefined;

    const payloadCode =
      payloadError && /^[A-Z0-9_]+$/.test(payloadError)
        ? payloadError
        : typeof jsonError.code === "string" && jsonError.code.trim().length > 0
          ? jsonError.code.trim().toUpperCase()
          : undefined;

    if (payloadMessage) {
      return { message: payloadMessage, code: payloadCode };
    }

    if (payloadError) {
      return {
        message: payloadCode ? fallbackMessage : payloadError,
        code: payloadCode,
      };
    }
  } catch {
    // Ignore JSON parse errors and fallback to raw text.
  }
  return { message: fallbackMessage };
}

function shouldLogoutForTokenFailure(status: number, error: ApiErrorDetails, auth: boolean): boolean {
  if (!auth) return false;
  if (status === 401) return true;

  if (error.code && TOKEN_ERROR_CODES.has(error.code.toUpperCase())) {
    return true;
  }

  const normalizedMessage = error.message.replace(/[_-]+/g, " ");
  return TOKEN_ERROR_PATTERN.test(normalizedMessage);
}

async function doRefreshToken(): Promise<boolean> {
  if (shouldEnableLocalAuthBypass()) {
    return false;
  }

  const refresh = tokenStore.getRefresh();
  if (!refresh) {
    forceLogoutAndRedirect();
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}${API.refreshToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const errorDetails = extractErrorDetails(text, res.status);
      if (shouldLogoutForTokenFailure(res.status, errorDetails, true)) {
        forceLogoutAndRedirect();
      }
      return false;
    }

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

  forceLogoutAndRedirect();
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

  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }

  if (auth) {
    const access = tokenStore.getAccess();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (res.status === 401 && auth && path !== API.refreshToken && !isRetry) {
    const refreshed = await doRefreshToken();
    if (refreshed) return tryRealFetch<T>(path, options, true);

    forceLogoutAndRedirect();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const errorDetails = extractErrorDetails(text, res.status);
    if (shouldLogoutForTokenFailure(res.status, errorDetails, auth)) {
      forceLogoutAndRedirect();
    }
    throw new Error(errorDetails.message);
  }

  return (await res.json()) as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  return tryRealFetch<T>(path, options);
}
