export type PreviewTrendPoint = {
  date: string;
  count: number;
};

export type PublicMarketPreview = {
  role: string;
  totalJobs: number;
  topSkill: string;
  growthRate: number;
  trend: PreviewTrendPoint[];
  marketStatus?: string;
  demandScore?: number;
  salaryMin?: number;
  salaryMax?: number;
  remoteShare?: number;
  topSkills: string[];
};

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizePreview(raw: any, fallbackRole: string): PublicMarketPreview {
  const source = raw?.data ?? raw ?? {};

  const trendSource = Array.isArray(source.trend)
    ? source.trend
    : Array.isArray(source.weeklyDemand)
      ? source.weeklyDemand
      : Array.isArray(source.weeklyDemandPreview)
        ? source.weeklyDemandPreview
      : Array.isArray(source.trendSeries)
        ? source.trendSeries
        : [];

  const normalizedTrend: PreviewTrendPoint[] = trendSource
    .map((item: any) => {
      const date =
        typeof item?.date === "string"
          ? item.date
          : typeof item?.week === "string"
            ? item.week
            : "";

      return {
        date,
        count: toNumber(item?.count, 0),
      };
    })
    .filter((item: PreviewTrendPoint) => item.date);

  const topSkills = Array.isArray(source.topSkills)
    ? source.topSkills
        .map((item: any) =>
          typeof item === "string"
            ? item
            : typeof item?.skill === "string"
              ? item.skill
              : ""
        )
        .filter(Boolean)
    : Array.isArray(source.topSkillsPreview)
      ? source.topSkillsPreview
          .map((item: any) =>
            typeof item === "string"
              ? item
              : typeof item?.skill === "string"
                ? item.skill
                : ""
          )
          .filter(Boolean)
    : typeof source.top_skill === "string"
      ? [source.top_skill]
      : [];

  const explicitGrowth = toNumber(source.growthRate ?? source.growth_rate, NaN);
  const derivedGrowth =
    normalizedTrend.length >= 2
      ? (() => {
          const first = normalizedTrend[0].count;
          const last = normalizedTrend[normalizedTrend.length - 1].count;
          if (!Number.isFinite(first) || first <= 0 || !Number.isFinite(last)) return 0;
          return ((last - first) / first) * 100;
        })()
      : 0;

  return {
    role:
      (typeof source.role === "string" && source.role) ||
      (typeof source.jobTitle === "string" && source.jobTitle) ||
      fallbackRole,
    totalJobs: toNumber(source.totalJobs ?? source.job_posting_count ?? source.jobPostingCount),
    topSkill: topSkills[0] ?? "N/A",
    growthRate: Number.isFinite(explicitGrowth) ? explicitGrowth : derivedGrowth,
    trend: normalizedTrend,
    marketStatus:
      typeof source.marketStatus === "string"
        ? source.marketStatus
        : typeof source.market_status === "string"
          ? source.market_status
          : undefined,
    demandScore: toNumber(source.demandScore ?? source.demand_score, NaN),
    salaryMin: toNumber(source?.salaryRange?.avgMin ?? source?.salaryRange?.min, NaN),
    salaryMax: toNumber(source?.salaryRange?.avgMax ?? source?.salaryRange?.max, NaN),
    remoteShare: toNumber(source.remoteShare ?? source.remote_share ?? source.remoteSharePreview, NaN),
    topSkills,
  };
}

export async function getMarketPreview(role: string): Promise<PublicMarketPreview> {
  const res = await fetch("/api/public-market-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `Preview request failed (${res.status})`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string") message = parsed.message;
      else if (typeof parsed?.error === "string") message = parsed.error;
    } catch {
      // keep fallback text
    }
    throw new Error(message);
  }

  const raw = await res.json();
  return normalizePreview(raw, role);
}
