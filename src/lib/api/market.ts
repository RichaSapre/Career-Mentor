import { apiFetch } from "./client";

export async function getMarketPreview(role: string) {
  return apiFetch("/backend/market/analyze/preview", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}
