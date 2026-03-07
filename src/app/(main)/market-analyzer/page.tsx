"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  Briefcase,
  AlertCircle,
  GitCompare
} from "lucide-react";

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
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/80 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Market Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
            Market Analysis
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Real-time hiring trends and skill saturation data.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Top metrics */}
      <div className="grid gap-5 md:grid-cols-3">
        <GlassCard className="hover:border-cyan-500/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Active Postings</div>
          <div className="mt-2 text-3xl font-black italic text-zinc-100">
            {loading ? "…" : postingCount.toLocaleString()}
          </div>
        </GlassCard>

        <GlassCard className="hover:border-cyan-500/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Most Demanded</div>
          <div className="mt-2 text-3xl font-black italic text-cyan-400">
            {loading ? "…" : (topSkills?.[0]?.skill ?? "—")}
          </div>
        </GlassCard>

        <GlassCard className="hover:border-emerald-500/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Monthly Volume</div>
          <div className="mt-2 text-3xl font-black italic text-emerald-400">
            {loading ? "…" : (trend?.[trend.length - 1]?.count ?? "—")}
          </div>
        </GlassCard>
      </div>

      {/* Chart + top skills */}
      <div className="grid gap-8 md:grid-cols-3">
        <GlassCard className="md:col-span-2 border-slate-800/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Trend Dataset</div>
              <div className="text-xl font-bold text-zinc-200 mt-1">{jobTitle}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-xs text-zinc-500 font-medium tracking-wide">Volume</span>
            </div>
          </div>

          <div className="mt-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" stroke="#ffffff08" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#52525b", fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: "#52525b", fontSize: 10, fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#06B6D4"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#06B6D4', strokeWidth: 2, stroke: '#0F172A' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="border-slate-800/50">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-6">Market Saturation</div>

          <div className="space-y-4">
            {topSkills.map((s, idx) => (
              <div key={s.skill} className="group flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{s.skill}</span>
                  <span className="text-zinc-600 font-medium">{s.count} mentions</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500/40 rounded-full group-hover:bg-cyan-500 transition-all duration-500"
                    style={{ width: `${(s.count / topSkills[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs text-cyan-400/70 leading-relaxed font-medium">
            Personalized recommendations are generated by cross-referencing these skills with your profile.
          </div>
        </GlassCard>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-bold text-zinc-200">Personalized Trajectory</h2>
          <div className="text-sm text-zinc-500 font-medium">Profile Match Consensus</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {(recs?.length ? recs : FALLBACK_RECS).map((r) => (
            <GlassCard key={r.role_id} className="group hover:bg-[#0F172A]/60 border-slate-800/50 hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex justify-between gap-6">
                <div className="flex-1">
                  <div className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">{r.role_title}</div>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{r.explanation}</p>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(r.missing_skills ?? []).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-zinc-900 border border-white/5 px-3 py-1 text-xs text-zinc-400 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Fit</div>
                  <div className="text-4xl font-black italic tracking-tighter text-cyan-400">
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