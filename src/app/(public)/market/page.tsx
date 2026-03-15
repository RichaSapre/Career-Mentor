"use client";

import Link from "next/link";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/glass/GlassCard";

const DEMO_TREND = [
  { date: "2025-10", count: 820 },
  { date: "2025-11", count: 910 },
  { date: "2025-12", count: 970 },
  { date: "2026-01", count: 1120 },
  { date: "2026-02", count: 1240 },
];

export default function PublicMarketPage() {
  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-heading">Market Analysis</h1>
          <Link href="/login" className="rounded-xl bg-btn-secondary-bg border border-btn-secondary-border px-4 py-2 text-sm text-btn-secondary-text hover:bg-btn-secondary-hover transition-all">
            Sign in for personalization
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-muted">Job postings</div>
            <div className="text-2xl font-semibold text-heading">1240</div>
          </GlassCard>
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-muted">Top skill</div>
            <div className="text-2xl font-semibold text-accent-primary">SQL</div>
          </GlassCard>
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-muted">Trend</div>
            <div className="text-2xl font-semibold text-accent-secondary">Up</div>
          </GlassCard>
        </div>

        <GlassCard className="min-h-[320px] p-6">
          <div className="text-lg font-semibold text-heading">Trend for Data Analyst</div>
          <div className="mt-2 text-sm text-muted">Sample hiring volume over time (sign in for live data)</div>

          <div className="mt-6" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={DEMO_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                    backgroundColor: "var(--surface-inset)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "var(--heading)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--accent-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--accent-primary)", strokeWidth: 2, stroke: "var(--background)" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">Want &ldquo;Recommended roles for you&rdquo;?</p>
            <Link href="/login" className="underline font-semibold text-accent-primary hover:opacity-80 transition-opacity">
              Know more?
            </Link>
          </div>
        </GlassCard>

        <div className="text-center">
          <Link href="/welcome" className="underline text-muted hover:text-heading transition-colors">
            Back to Welcome
          </Link>
        </div>
      </div>
    </main>
  );
}