"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { MarketAnalyzerResponse } from "@/lib/api/types";
import { mockMarketAnalyzer } from "@/lib/mock/market";

const USE_MOCK = (process.env.NEXT_PUBLIC_ENABLE_MOCK ?? "true") === "true";

export function useMarketAnalyzer(jobTitle: string) {
  return useQuery({
    queryKey: ["market", jobTitle],
    enabled: !!jobTitle,
    queryFn: async () => {
      if (USE_MOCK) return mockMarketAnalyzer(jobTitle);
      // Expect GET /market-analyzer?jobTitle=...
      const url = `${API.marketAnalyzer}?jobTitle=${encodeURIComponent(jobTitle)}`;
      return apiFetch<MarketAnalyzerResponse>(url, { method: "GET" });
    },
  });
}
