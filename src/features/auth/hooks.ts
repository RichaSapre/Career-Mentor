"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { Tokens, UserProfile } from "@/lib/api/types";
import { tokenStore } from "@/lib/auth/tokenStore";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<UserProfile>(API.getUserDetails, { method: "GET" }),
    enabled,
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      apiFetch<{ ok?: boolean }>(API.loginSendOtp, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false,
      }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const res = await apiFetch<any>(API.verifyLoginOtp, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false,
      });

      // Expecting Tokens or { tokens: Tokens }
      const tokens: Tokens | undefined = res?.accessToken
        ? { accessToken: res.accessToken, refreshToken: res.refreshToken }
        : res?.tokens;

      if (tokens?.accessToken && tokens?.refreshToken) tokenStore.set(tokens);
      return res;
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiFetch<any>(API.signupComplete, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false,
      });

      const tokens: Tokens | undefined = res?.accessToken
        ? { accessToken: res.accessToken, refreshToken: res.refreshToken }
        : res?.tokens;

      if (tokens?.accessToken && tokens?.refreshToken) tokenStore.set(tokens);
      return res;
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await apiFetch(API.logout, { method: "POST" });
      } finally {
        tokenStore.clear();
      }
    },
  });
}
