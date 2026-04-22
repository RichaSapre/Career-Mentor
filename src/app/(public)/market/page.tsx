"use client";

import { useState } from "react";
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
import { getMarketPreview } from "@/lib/api/market";

export default function PublicMarketPage() {
  const [role, setRole] = useState("Data Analyst");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const result = await getMarketPreview(role);
      setData(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-heading">
            Market Analysis
          </h1>
          <Link
            href="/login"
            className="rounded-xl bg-btn-secondary-bg border border-btn-secondary-border px-4 py-2 text-sm text-btn-secondary-text hover:bg-btn-secondary-hover transition-all"
          >
            Sign in for personalization
          </Link>
        </div>

        {/* Role Input */}
        <div className="flex gap-4">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
            placeholder="Enter job role..."
          />
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold"
          >
            Analyze
          </button>
        </div>

        {loading && (
          <p className="text-muted text-sm">Analyzing market data...</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Job postings</div>
                <div className="text-2xl font-semibold text-heading">
                  {data.job_posting_count}
                </div>
              </GlassCard>

              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Top skill</div>
                <div className="text-2xl font-semibold text-accent-primary">
                  {data.top_skill}
                </div>
              </GlassCard>

              <GlassCard className="min-h-[110px] flex flex-col justify-between">
                <div className="text-sm text-muted">Growth rate</div>
                <div className="text-2xl font-semibold text-accent-secondary">
                  {data.growth_rate}%
                </div>
              </GlassCard>
            </div>

            {/* Trend Chart */}
            {data.trend && (
              <GlassCard className="min-h-[320px] p-6">
                <div className="text-lg font-semibold text-heading">
                  Trend for {role}
                </div>

                <div className="mt-6" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={data.trend}>
                      <CartesianGrid strokeDasharray="6 6" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={3}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted">
                    Want personalized recommendations?
                  </p>
                  <Link
                    href="/login"
                    className="underline font-semibold text-accent-primary"
                  >
                    Create an account
                  </Link>
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>
    </main>
  );
}