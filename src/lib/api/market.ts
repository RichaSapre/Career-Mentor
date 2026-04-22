import { apiFetch } from "./client";

export async function getMarketPreview(role: string) {
  return apiFetch("/backend/market/analyze/preview", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function getMarketPreview(role: string) {
  const res = await fetch("/api/backend/market/analyze/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch market preview");
  }

  return res.json();
}