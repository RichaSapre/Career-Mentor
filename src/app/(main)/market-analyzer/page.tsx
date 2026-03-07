"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { GlassCard } from "@/components/glass/GlassCard";
import { apiFetch } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";

// If your endpoints.ts already has these, you can use those instead.
// Keeping inline so this page works even if endpoints.ts isn't updated.
const MARKET_ENDPOINT = "/market-analyzer"; // GET ?job_title=...
const RECS_ENDPOINT = "/recommendations"; // GET (auth)

// ----- Types -----
type TrendPoint = { date: string; count: number };
type TopSkill = { skill: string; count: number };

type MarketResponse = {
  job_title?: string;
  job_posting_count?: number;
  trend_series?: TrendPoint[];
  top_skills?: TopSkill[];
};

type RecommendationItem = {
  role_id: string;
  role_title: string;
  fit_score: number;
  missing_skills?: string[];
  explanation?: string;
};

// ----- Mock fallback (so UI always shows for demo) -----
const FALLBACK_MARKET: MarketResponse = {
  job_title: "Data Analyst",
  job_posting_count: 1240,
  trend_series: [
    { date: "2025-10", count: 820 },
    { date: "2025-11", count: 910 },
    { date: "2025-12", count: 970 },
    { date: "2026-01", count: 1120 },
    { date: "2026-02", count: 1240 },
  ],
  top_skills: [
    { skill: "SQL", count: 880 },
    { skill: "Excel", count: 760 },
    { skill: "Python", count: 640 },
    { skill: "Tableau", count: 520 },
    { skill: "Statistics", count: 480 },
  ],
};

const FALLBACK_RECS: RecommendationItem[] = [
  {
    role_id: "demo-1",
    role_title: "Data Analyst",
    fit_score: 85,
    missing_skills: ["Tableau"],
    explanation: "Strong match based on your Python + SQL + analysis skills.",
  },
  {
    role_id: "demo-2",
    role_title: "Software Engineer",
    fit_score: 74,
    missing_skills: ["DSA practice"],
    explanation: "Good fit, but strengthen DSA to improve competitiveness.",
  },
];

export default function MarketAnalyzerPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [market, setMarket] = React.useState<MarketResponse>(FALLBACK_MARKET);
  const [recs, setRecs] = React.useState<RecommendationItem[]>(FALLBACK_RECS);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      // 1) Market data (can be public or private depending on backend)
      try {
        const m = (await apiFetch(
          `${MARKET_ENDPOINT}?job_title=${encodeURIComponent("Data Analyst")}`,
          { method: "GET", auth: false }
        )) as MarketResponse;

        if (mounted && m) setMarket({
          ...FALLBACK_MARKET,
          ...m,
          trend_series: m.trend_series?.length ? m.trend_series : FALLBACK_MARKET.trend_series,
          top_skills: m.top_skills?.length ? m.top_skills : FALLBACK_MARKET.top_skills,
        });
      } catch (e: any) {
        if (mounted) {
          setMarket(FALLBACK_MARKET);
          setError("Market API not available, showing demo data.");
        }
      }

      // 2) Recommendations (private/auth)
      try {
        const r = (await apiFetch(RECS_ENDPOINT, { method: "GET", auth: true })) as any;

        // Support either: array OR {data: array}
        const recList: RecommendationItem[] = Array.isArray(r) ? r : (r?.data ?? []);

        if (mounted && recList?.length) setRecs(recList);
        else if (mounted) setRecs(FALLBACK_RECS);
      } catch {
        if (mounted) setRecs(FALLBACK_RECS);
      }

      if (mounted) setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const trend = market.trend_series ?? FALLBACK_MARKET.trend_series!;
  const topSkills = market.top_skills ?? FALLBACK_MARKET.top_skills!;
  const postingCount = market.job_posting_count ?? FALLBACK_MARKET.job_posting_count!;
  const jobTitle = market.job_title ?? FALLBACK_MARKET.job_title!;

  function signOut() {
    tokenStore.clear();
    router.push("/welcome");
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Market Analysis</h1>

          <button
            onClick={signOut}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            {error}
          </div>
        )}

        {/* Top cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard>
            <div className="text-sm text-white/70">Job postings</div>
            <div className="mt-2 text-2xl font-semibold">
              {loading ? "…" : postingCount}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm text-white/70">Top skill</div>
            <div className="mt-2 text-2xl font-semibold">
              {loading ? "…" : (topSkills?.[0]?.skill ?? "—")}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm text-white/70">Trend (last 5 months)</div>
            <div className="mt-2 text-2xl font-semibold">
              {loading ? "…" : (trend?.[trend.length - 1]?.count ?? "—")}
            </div>
          </GlassCard>
        </div>

        {/* Chart + top skills */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="md:col-span-2">
            <div className="text-sm text-white/70">Trend for</div>
            <div className="text-lg font-semibold">{jobTitle}</div>

            <div className="mt-4" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                  <XAxis dataKey="date" tick={{ fill: "#cbd5e1" }} />
                  <YAxis tick={{ fill: "#cbd5e1" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#60f2f2"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-sm text-white/70">Top Skills</div>

            <div className="mt-3 space-y-2">
              {topSkills.map((s) => (
                <div key={s.skill} className="flex items-center justify-between">
                  <div className="text-sm">{s.skill}</div>
                  <div className="text-sm font-semibold">{s.count}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-white/60">
              Personalized insights shown below.
            </div>
          </GlassCard>
        </div>

        {/* Recommendations */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recommended roles for you</h2>
          <div className="text-sm text-white/60">Based on your profile & market data</div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {(recs?.length ? recs : FALLBACK_RECS).map((r) => (
              <GlassCard key={r.role_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{r.role_title}</div>
                  <div className="text-sm text-white/70">Fit: {r.fit_score}%</div>
                </div>

                <div className="text-sm text-white/70">{r.explanation}</div>

                <div className="pt-2">
                  <div className="text-xs text-white/60">Missing skills</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(r.missing_skills ?? []).length ? (
                      r.missing_skills!.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-white/10 border border-white/10 px-2 py-1 text-xs"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/60">None</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-3">
            <GlassCard>
              <div className="text-sm text-white/70">Quick Actions</div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => router.push("/jobs")}
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Browse Jobs
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="text-sm text-white/70">Market Snapshot</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-white/70">Top hiring cities</div>
                  <div>San Francisco, Seattle</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/70">Avg salary</div>
                  <div>$90k–$120k</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}