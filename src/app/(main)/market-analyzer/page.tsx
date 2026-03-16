"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Search } from "lucide-react";

import { GlassCard } from "@/components/glass/GlassCard";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/auth/tokenStore";

// ----- Types -----
type TrendPoint = { date: string; count: number };
type TopSkill = { skill: string; count: number };

type MarketResponse = {
  role?: string;
  job_title?: string;
  jobTitle?: string;
  job_posting_count?: number;
  jobPostingCount?: number;
  trend_series?: TrendPoint[];
  trendSeries?: TrendPoint[];
  top_skills?: TopSkill[];
  topSkills?: TopSkill[];
};

type RecommendationItem = {
  role_id?: string;
  roleId?: string;
  role_title?: string;
  roleTitle?: string;
  fit_score?: number;
  fitScore?: number;
  missing_skills?: string[];
  missingSkills?: string[];
  explanation?: string;
};

/** Normalize API response (handles both { data } wrap and camelCase/snake_case) */
function normalizeMarketResponse(raw: any): MarketResponse | null {
  const m = raw?.data ?? raw;
  if (!m) return null;
  const weeklyDemand = m.weeklyDemand ?? m.weekly_demand ?? [];
  const trendSeries = (m.trend_series ?? m.trendSeries ?? []).length
    ? (m.trend_series ?? m.trendSeries)
    : weeklyDemand.map((d: { week?: string; date?: string; count: number }) => ({ date: d.week ?? d.date ?? "", count: d.count }));
  const topSkills = m.topSkills ?? m.top_skills ?? [];
  return {
    role: m.role,
    job_title: m.job_title ?? m.jobTitle ?? m.role,
    job_posting_count: m.job_posting_count ?? m.jobPostingCount ?? m.totalJobs,
    trend_series: trendSeries,
    top_skills: topSkills,
  };
}

/** Normalize recommendation item (camelCase or snake_case) */
function normalizeRec(r: any): { role_id: string; role_title: string; fit_score: number; missing_skills: string[]; explanation?: string } {
  return {
    role_id: r.role_id ?? r.roleId ?? `role-${(r.role_title ?? r.roleTitle ?? "").toLowerCase().replace(/\s+/g, "-")}`,
    role_title: r.role_title ?? r.roleTitle ?? "",
    fit_score: r.fit_score ?? r.fitScore ?? 0,
    missing_skills: r.missing_skills ?? r.missingSkills ?? [],
    explanation: r.explanation,
  };
}

const EMPTY_MARKET: MarketResponse = {
  job_title: "",
  job_posting_count: 0,
  trend_series: [],
  top_skills: [],
};

const SUGGESTED_ROLES = ["Data Analyst", "Software Engineer", "Product Manager", "Data Scientist", "DevOps Engineer"];

function MarketAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") || "Data Analyst";

  const [roleInput, setRoleInput] = React.useState(roleFromUrl);
  const [loading, setLoading] = React.useState(true);
  const [market, setMarket] = React.useState<MarketResponse>(EMPTY_MARKET);
  const [recs, setRecs] = React.useState<RecommendationItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchMarketData(role: string) {
    setLoading(true);
    setError(null);

    try {
      const raw = await apiFetch(API.marketAnalyzer, {
        method: "POST",
        body: JSON.stringify({ role: role.trim() }),
        auth: true,
      });
      const m = normalizeMarketResponse(raw);

      if (m && (m.trend_series?.length || m.top_skills?.length || m.job_posting_count)) {
        setMarket({
          ...EMPTY_MARKET,
          ...m,
          job_title: m.job_title ?? m.role ?? role,
          job_posting_count: m.job_posting_count ?? 0,
          trend_series: m.trend_series?.length ? m.trend_series : [],
          top_skills: m.top_skills?.length ? m.top_skills : [],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Market API failed.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    let mounted = true;
    const role = roleFromUrl || roleInput.trim() || "Data Analyst";
    setRoleInput(role);

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const raw = await apiFetch(API.marketAnalyzer, {
          method: "POST",
          body: JSON.stringify({ role }),
          auth: true,
        });
        const m = normalizeMarketResponse(raw);

        if (mounted && m && (m.trend_series?.length || m.top_skills?.length || m.job_posting_count)) {
          setMarket({
            ...EMPTY_MARKET,
            ...m,
            job_title: m.job_title ?? m.role ?? role,
            job_posting_count: m.job_posting_count ?? 0,
            trend_series: m.trend_series?.length ? m.trend_series : [],
            top_skills: m.top_skills?.length ? m.top_skills : [],
          });
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Market API failed.");
      }

      try {
        const r = (await apiFetch(API.recommendedRoles, { method: "GET", auth: true })) as any;
        const rawList = Array.isArray(r) ? r : (r?.data ?? []);
        const recList = rawList.map((x: any) => normalizeRec(x)).filter((x: any) => x.role_title);
        if (mounted && recList?.length) setRecs(recList);
      } catch {
        // Recommendations failed - recs stay empty
      }

      if (mounted) setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, [roleFromUrl]);

  const trend = market.trend_series ?? [];
  const topSkills = market.top_skills ?? [];
  const postingCount = market.job_posting_count ?? 0;
  const jobTitle = market.job_title ?? market.role ?? "—";

  // Average monthly job volume from trend
  const avgMonthly =
    trend?.length > 0
      ? Math.round(trend.reduce((a, t) => a + t.count, 0) / trend.length)
      : postingCount;

  function signOut() {
    tokenStore.clear();
    router.push("/welcome");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Market Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)]">
            Market Analysis
          </h1>
          <p className="text-muted mt-2 text-lg">
            Real-time hiring trends and skill saturation data.
          </p>
        </div>

        {/* Role search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchMarketData(roleInput))}
              placeholder="e.g. Software Engineer"
              className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-xl bg-input-bg border border-input-border text-input-text placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchMarketData(roleInput)}
            disabled={loading || !roleInput.trim()}
            className="px-6 py-3 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>

      {/* Quick role buttons */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRoleInput(r);
              fetchMarketData(r);
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-inset border border-border hover:border-accent-primary hover:text-accent-primary transition-all disabled:opacity-60"
          >
            {r}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Top metrics */}
      <div className="grid gap-5 md:grid-cols-3">
        <GlassCard className="hover:border-border-hover transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-faint">Active Postings</div>
          <div className="mt-2 text-3xl font-black italic text-heading">
            {loading ? "…" : postingCount.toLocaleString()}
          </div>
        </GlassCard>

        <GlassCard className="hover:border-border-hover transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-faint">Most Demanded</div>
          <div className="mt-2 text-3xl font-black italic text-accent-primary">
            {loading ? "…" : (topSkills?.[0]?.skill ?? "—")}
          </div>
        </GlassCard>

        <GlassCard className="hover:border-border-hover transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-faint">Avg Monthly Jobs</div>
          <div className="mt-2 text-3xl font-black italic text-accent-secondary">
            {loading ? "…" : avgMonthly?.toLocaleString() ?? "—"}
          </div>
        </GlassCard>
      </div>

      {/* Chart + top skills */}
      <div className="grid gap-8 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-faint">Trend Dataset</div>
              <div className="text-xl font-bold text-heading mt-1">{jobTitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-primary" />
              <span className="text-xs text-muted font-medium tracking-wide">Volume</span>
            </div>
          </div>

          <div className="mt-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--faint)", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--faint)", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-inset)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--heading)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--accent-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: 'var(--background)' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-[10px] font-bold uppercase tracking-widest text-faint mb-6">Market Saturation</div>

          <div className="space-y-4">
            {topSkills.map((s, idx) => (
              <div key={s.skill} className="group flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-muted group-hover:text-heading transition-colors">{s.skill}</span>
                  <span className="text-faint font-medium">{s.count} mentions</span>
                </div>
                <div className="h-1.5 w-full bg-surface-inset rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-primary/40 rounded-full group-hover:bg-accent-primary transition-all duration-500"
                    style={{ width: `${(s.count / topSkills[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-badge-info-bg border border-badge-info-border text-xs text-badge-info-text leading-relaxed font-medium">
            Personalized recommendations are generated by cross-referencing these skills with your profile.
          </div>
        </GlassCard>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-bold text-heading">Personalized Trajectory</h2>
          <div className="text-sm text-muted font-medium">Profile Match Consensus</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(recs ?? []).map((r) => (
            <GlassCard key={r.role_id} className="group hover:bg-surface-hover hover:border-border-hover transition-all duration-300">
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xl font-bold text-heading group-hover:text-accent-primary transition-colors">{r.role_title}</div>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{r.explanation}</p>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(r.missing_skills ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-tag-bg border border-tag-border px-3 py-1 text-xs text-tag-text font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-faint mb-1">Fit</div>
                  <div className="text-4xl font-black italic tracking-tighter text-accent-primary">
                    {r.fit_score}%
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarketAnalyzerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center text-muted">
        <span className="animate-pulse">Loading market analysis...</span>
      </div>
    }>
      <MarketAnalyzerContent />
    </Suspense>
  );
}