"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/glass/GlassCard";
import { getMarketPreview } from "@/lib/api/market";
import { MARKET_ROLES } from "@/lib/data/marketRoles";
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

function formatPct(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
  return `${Math.round(value)}%`;
}

export default function PublicMarketPage() {
  const [role, setRole] = useState("Software Engineer");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!role.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await getMarketPreview(role);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch preview.");
    }
    setLoading(false);
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-7">

        <div className="inline-flex items-center gap-2 rounded-full border border-badge-info-border bg-badge-info-bg px-3 py-1 text-sm text-badge-info-text">
          <BarChart3 className="h-4 w-4" />
          Public Market Preview
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-heading">Market Analysis</h1>
            <p className="mt-1 text-muted">
              Explore hiring trends and demand signals. Sign in for full AI insights and personalized recommendations.
            </p>
          </div>
          <Link
            href="/login"
            className="rounded-xl bg-btn-secondary-bg border border-btn-secondary-border px-4 py-2 text-sm text-btn-secondary-text hover:bg-btn-secondary-hover transition-all"
          >
            Sign in for full analysis
          </Link>
        </div>

        {/* Role Input */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-input-placeholder" />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              list="public-market-role-options"
              className="h-12 w-full rounded-xl border border-input-border bg-input-bg pl-10 pr-4 text-input-text placeholder:text-input-placeholder"
              placeholder="Enter job role..."
            />
            <datalist id="public-market-role-options">
              {MARKET_ROLES.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-btn-primary-bg px-6 font-semibold text-btn-primary-text transition-all hover:bg-btn-primary-hover disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <TrendingUp className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {error ? (
          <GlassCard className="border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </GlassCard>
        ) : null}

        {data && (
          <>
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-4">
              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Job postings</div>
                <div className="text-2xl font-semibold text-heading">
                  {formatCompactNumber(data.totalJobs)}
                </div>
              </GlassCard>

              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Top skill</div>
                <div className="text-2xl font-semibold text-accent-primary">
                  {data.topSkill}
                </div>
              </GlassCard>

              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Growth rate</div>
                <div className="text-2xl font-semibold text-accent-secondary">
                  {formatPct(data.growthRate)}
                </div>
              </GlassCard>

              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Market status</div>
                <div className="text-2xl font-semibold text-heading">
                  {data.marketStatus ?? "Preview"}
                </div>
              </GlassCard>
            </div>

            {/* Trend Chart */}
            {Array.isArray(data.trend) && data.trend.length > 0 && (
              <GlassCard className="min-h-[320px] p-6">
                <div className="text-lg font-semibold text-heading">
                  Trend for {role}
                </div>

                <div className="mt-6" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend}>
                      <CartesianGrid strokeDasharray="6 6" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--accent-primary)"
                        fill="var(--accent-primary)"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 border-t border-divider pt-5">
                  <p className="text-sm text-muted">Top skills in this preview</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.topSkills?.slice(0, 8).map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-full border border-tag-border bg-tag-bg px-3 py-1 text-xs text-tag-text"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            <GlassCard className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-heading">Unlock full Market Analyzer</h3>
                  <p className="mt-1 text-sm text-muted">
                    Get full demand scoring, top locations, top companies, and AI-generated deep analysis.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-btn-primary-bg px-4 py-2 text-sm font-semibold text-btn-primary-text hover:bg-btn-primary-hover"
                  >
                    Create account
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-btn-secondary-border bg-btn-secondary-bg px-4 py-2 text-sm font-semibold text-btn-secondary-text hover:bg-btn-secondary-hover"
                  >
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg bg-surface-inset/50 px-3 py-2">
                  <Briefcase className="h-4 w-4 text-accent-primary" />
                  Personalized role recommendations
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-inset/50 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-accent-secondary" />
                  AI narrative and actionable insights
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-surface-inset/50 px-3 py-2">
                  <BarChart3 className="h-4 w-4 text-accent-primary" />
                  Full salary and geography breakdown
                </div>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </main>
  );
}