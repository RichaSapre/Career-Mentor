"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Briefcase,
  DollarSign,
  BarChart3,
  Brain,
  MapPin,
  Building2,
  Zap,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";

import { GlassCard } from "@/components/glass/GlassCard";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { MARKET_ROLES } from "@/lib/data/marketRoles";
import type { MarketAnalysisResponse } from "@/lib/api/types";

// ────────────────────────────────────────────
// ROLE COMBOBOX
// ────────────────────────────────────────────
function RoleCombobox({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!query) return [...MARKET_ROLES].slice(0, 30);
    const q = query.toLowerCase();
    return [...MARKET_ROLES]
      .filter((r) => r.toLowerCase().includes(q))
      .slice(0, 30);
  }, [query]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative flex-1 min-w-0" ref={containerRef}>
      <div
        className="flex items-center h-12 rounded-xl bg-input-bg border border-input-border cursor-pointer"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="w-5 h-5 text-muted ml-4 shrink-0" />
        <input
          ref={inputRef}
          placeholder="Search a role — e.g. Software Engineer"
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (query && filtered.length > 0) {
                onChange(filtered[0]);
                setQuery("");
                setOpen(false);
              }
              onSubmit();
            }
          }}
          disabled={disabled}
          className="flex-1 h-full bg-transparent px-3 text-input-text placeholder:text-input-placeholder focus:outline-none"
        />
        <ChevronsUpDown className="w-4 h-4 text-muted mr-3 shrink-0" />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg backdrop-blur-xl">
          {filtered.length > 0 ? (
            filtered.map((role) => (
              <button
                type="button"
                key={role}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(role);
                  setQuery("");
                  setOpen(false);
                  setTimeout(() => onSubmit(), 50);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors flex items-center gap-2 ${value === role
                    ? "text-accent-primary font-medium"
                    : "text-body"
                  }`}
              >
                {value === role && (
                  <Check className="w-3.5 h-3.5 text-accent-primary" />
                )}
                {role}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted">No roles found</div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// FORMAT HELPERS
// ────────────────────────────────────────────
function formatCurrency(n: number) {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "strong") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (s === "moderate") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-red-500/10 text-red-500 border-red-500/20";
}

function demandColor(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

// ────────────────────────────────────────────
// MAIN CONTENT
// ────────────────────────────────────────────
function MarketAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") || "";

  const [roleInput, setRoleInput] = React.useState(roleFromUrl || "Software Engineer");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<MarketAnalysisResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [recs, setRecs] = React.useState<any[]>([]);

  const fetchRef = React.useRef<() => void>();

  const fetchData = React.useCallback(
    async (role: string) => {
      if (!role.trim()) return;
      setLoading(true);
      setError(null);

      try {
        const raw = (await apiFetch(API.marketAnalyzer, {
          method: "POST",
          body: JSON.stringify({ role: role.trim() }),
          auth: true,
        })) as any;

        const d = raw?.data ?? raw;
        if (d) {
          setData(d as MarketAnalysisResponse);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch market data.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Store latest fetchData for combobox to call
  fetchRef.current = () => fetchData(roleInput);

  React.useEffect(() => {
    const role = roleFromUrl || "";
    setRoleInput(role);
    if (role) fetchData(role);

    // Also fetch recommendations
    (async () => {
      try {
        const r = (await apiFetch(API.recommendedRoles, {
          method: "GET",
          auth: true,
        })) as any;
        const rawList = Array.isArray(r) ? r : r?.data ?? [];
        const mapped = rawList
          .slice(0, 4)
          .map((x: any) => ({
            roleId:
              x.roleId ??
              x.role_id ??
              (x.roleTitle ?? x.role_title ?? "").toLowerCase().replace(/\s+/g, "-"),
            roleTitle: x.roleTitle ?? x.role_title ?? "",
            fitScore: x.fitScore ?? x.fit_score ?? 0,
            missingSkills:
              x.missingSkills ?? x.missing_skills ?? [],
            explanation: x.explanation,
            trendDirection: x.trendDirection ?? x.trend_direction,
          }))
          .filter((x: any) => x.roleTitle);
        if (mapped.length) setRecs(mapped);
      } catch {
        // silent
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromUrl]);

  // Prepare trend data — filter to recent periods only
  const trendData = React.useMemo(() => {
    if (!data?.weeklyDemand?.length) return [];
    const sorted = [...data.weeklyDemand].sort(
      (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
    );
    // Take last 20 weeks max for a clean chart
    const recent = sorted.slice(-20);
    return recent.map((d) => ({
      date: new Date(d.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: d.count,
    }));
  }, [data]);

  const topSkills = data?.topSkills ?? [];
  const topLocations = data?.topLocations ?? [];
  const topCompanies = (data?.topCompanies ?? []).filter(
    (c) => c.company !== null
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>Market Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)]">
            Market Analysis
          </h1>
          <p className="text-muted mt-2 text-lg">
            Real-time hiring trends, salary data, and skill demand analysis.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-3">
          <RoleCombobox
            value={roleInput}
            onChange={setRoleInput}
            onSubmit={() => fetchData(roleInput)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fetchData(roleInput)}
            disabled={loading || !roleInput.trim()}
            className="px-6 py-3 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all disabled:opacity-60 flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500 backdrop-blur-md">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            <span className="text-muted">Analyzing market data…</span>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* ── HERO METRICS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Jobs */}
            <GlassCard className="flex flex-col justify-between hover:border-border-hover transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-badge-info-bg text-badge-info-text">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(data.marketStatus)}`}
                >
                  {data.marketStatus}
                </span>
              </div>
              <div className="text-3xl font-black text-heading tracking-tight">
                {data.totalJobs.toLocaleString()}
              </div>
              <div className="text-xs text-faint font-medium mt-1 uppercase tracking-wider">
                Total Jobs
              </div>
            </GlassCard>

            {/* Salary Range */}
            <GlassCard className="flex flex-col justify-between hover:border-border-hover transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-heading tracking-tight">
                {formatCurrency(data.salaryRange.avgMin)} –{" "}
                {formatCurrency(data.salaryRange.avgMax)}
              </div>
              <div className="text-xs text-faint font-medium mt-1 uppercase tracking-wider">
                Avg Salary Range
              </div>
            </GlassCard>

            {/* Demand Score */}
            <GlassCard className="flex flex-col justify-between hover:border-border-hover transition-all p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-muted">
                  {data.trendDirection === "Increasing" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  {data.trendDirection}
                </div>
              </div>
              <div
                className={`text-3xl font-black tracking-tight ${demandColor(data.demandScore)}`}
              >
                {data.demandScore}
              </div>
              <div className="text-xs text-faint font-medium mt-1 uppercase tracking-wider">
                Demand Score
              </div>
            </GlassCard>

          </div>
          {/* ── AI ANALYSIS ── */}
          {data.aiAnalysis && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-heading">
                    AI Market Analysis
                  </div>
                </div>
              </div>
              <p className="text-sm text-body leading-relaxed">
                {data.aiAnalysis}
              </p>
            </GlassCard>
          )}
          {/* ── TREND CHART ── */}
          {trendData.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-faint">
                    Weekly Demand Trend
                  </div>
                  <div className="text-xl font-bold text-heading mt-1">
                    {data.role}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-primary" />
                  <span className="text-xs text-muted font-medium">
                    Job Postings / Week
                  </span>
                </div>
              </div>

              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent-primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent-primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="6 6"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: "var(--faint)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--faint)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-inset)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "var(--heading)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent-primary)"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                      dot={{
                        r: 3,
                        fill: "var(--accent-primary)",
                        strokeWidth: 2,
                        stroke: "var(--background)",
                      }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* ── THREE-COLUMN GRID: Skills / Locations / Companies ── */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Top Skills */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-4 h-4 text-accent-primary" />
                <div className="text-xs font-bold uppercase tracking-widest text-faint">
                  Top Skills
                </div>
              </div>
              <div className="space-y-3">
                {topSkills.slice(0, 10).map((s, idx) => (
                  <div key={s.skill} className="group flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-muted group-hover:text-heading transition-colors capitalize">
                        {s.skill}
                      </span>
                      <span className="text-xs text-faint font-medium">
                        {s.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-inset rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-primary/40 rounded-full group-hover:bg-accent-primary transition-all duration-500"
                        style={{
                          width: `${topSkills[0]?.count ? (s.count / topSkills[0].count) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Top Locations */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-accent-secondary" />
                <div className="text-xs font-bold uppercase tracking-widest text-faint">
                  Top Locations
                </div>
              </div>
              <div className="space-y-3">
                {topLocations.slice(0, 8).map((loc) => (
                  <div
                    key={loc.location}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-inset hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-sm font-medium text-body">
                      {loc.location}
                    </span>
                    <span className="text-xs font-bold text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded-full">
                      {loc.count}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Top Companies */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-4 h-4 text-accent-primary" />
                <div className="text-xs font-bold uppercase tracking-widest text-faint">
                  Top Companies
                </div>
              </div>
              <div className="space-y-3">
                {topCompanies.slice(0, 10).map((c, idx) => (
                  <div
                    key={c.company ?? idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-inset hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-body">
                        {c.company}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>



          {/* ── RECOMMENDED ROLES ── */}
          {recs.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-heading">
                  Recommended for You
                </h2>
                <button
                  onClick={() => router.push("/jobs")}
                  className="text-sm text-accent-primary hover:opacity-80 font-semibold flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {recs.map((r, idx) => (
                  <button
                    key={r.roleId ?? idx}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/market-analyzer?role=${encodeURIComponent(r.roleTitle)}`
                      )
                    }
                    className="group text-left"
                  >
                    <GlassCard className="h-full hover:border-border-hover transition-all duration-300 p-6">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-heading group-hover:text-accent-primary transition-colors">
                            {r.roleTitle}
                          </div>
                          {r.explanation && (
                            <p className="mt-2 text-sm text-muted leading-relaxed">
                              {r.explanation}
                            </p>
                          )}
                          {r.missingSkills?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {r.missingSkills.slice(0, 4).map((s: string) => (
                                <span
                                  key={s}
                                  className="rounded-lg bg-tag-bg border border-tag-border px-2.5 py-1 text-xs text-tag-text font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center justify-center min-w-[70px]">
                          <div className="text-xs font-bold uppercase tracking-widest text-faint mb-1">
                            Fit
                          </div>
                          <div className="text-3xl font-black tracking-tighter text-accent-primary">
                            {r.fitScore}%
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// PAGE EXPORT
// ────────────────────────────────────────────
export default function MarketAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-muted">
          <span className="animate-pulse">Loading market analysis...</span>
        </div>
      }
    >
      <MarketAnalyzerContent />
    </Suspense>
  );
}