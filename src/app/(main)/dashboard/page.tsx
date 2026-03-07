"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fakeAuth } from "@/lib/auth/fakeAuth";

import { GlassCard } from "@/components/glass/GlassCard";

export default function DashboardPage() {

  const router = useRouter();


  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-white/60">Overview</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        <GlassCard className="flex flex-col justify-between min-h-[110px]">
          <div className="text-sm text-white/70">Profile completeness</div>
          <div className="text-2xl font-semibold">75%</div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between min-h-[110px]">
          <div className="text-sm text-white/70">Top role</div>
          <div className="text-2xl font-semibold">Data Analyst</div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between min-h-[110px]">
          <div className="text-sm text-white/70">Missing skills</div>
          <div className="text-2xl font-semibold">2</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
        <GlassCard className="lg:col-span-2 min-h-[320px]">
          <div className="text-lg font-semibold">Recommended Roles</div>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between">
                <div className="font-semibold">Data Analyst</div>
                <div className="text-white/70">Fit: 85%</div>
              </div>
              <div className="text-sm text-white/70 mt-1">Based on SQL + Python + Analysis</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between">
                <div className="font-semibold">Software Engineer</div>
                <div className="text-white/70">Fit: 74%</div>
              </div>
              <div className="text-sm text-white/70 mt-1">Strengthen DSA for competitiveness</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="min-h-[320px]">
  <div className="text-lg font-semibold">Quick Actions</div>

  <div className="mt-4 space-y-3">

    <button
      onClick={() => router.push("/profile")}
      className="w-full rounded-xl bg-white/10 px-4 py-4 text-left text-sm hover:bg-white/20 transition"
    >
      Edit Profile
    </button>

    <button
      onClick={() => router.push("/jobs")}
      className="w-full rounded-xl bg-white/10 px-4 py-4 text-left text-sm hover:bg-white/20 transition"
    >
      Browse Jobs
    </button>

    <button
      onClick={() => router.push("/market-analyzer")}
      className="w-full rounded-xl bg-white/10 px-4 py-4 text-left text-sm hover:bg-white/20 transition"
    >
      Run Debate
    </button>

  </div>
</GlassCard>
      </div>
    </div>
  );
}