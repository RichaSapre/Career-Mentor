import Link from "next/link";
import { GlassCard } from "@/components/glass/GlassCard";

export default function PublicMarketPage() {
  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Market Analysis</h1>
          <Link href="/login" className="rounded-xl bg-white/15 px-4 py-2 text-sm">
            Sign in for personalization
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-white/70">Job postings</div>
            <div className="text-2xl font-semibold">1240</div>
          </GlassCard>
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-white/70">Top skill</div>
            <div className="text-2xl font-semibold">SQL</div>
          </GlassCard>
          <GlassCard className="min-h-[110px] flex flex-col justify-between">
            <div className="text-sm text-white/70">Trend</div>
            <div className="text-2xl font-semibold">Up</div>
          </GlassCard>
        </div>

        <GlassCard className="min-h-[320px]">
          <div className="text-lg font-semibold">Trend for Data Analyst</div>
          <div className="mt-2 text-sm text-white/70">
            (Demo chart can be added here. This page is public-only.)
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">Want “Recommended roles for you”?</p>
            <Link href="/login" className="underline font-semibold">
              Know more?
            </Link>
          </div>
        </GlassCard>

        <div className="text-center">
          <Link href="/welcome" className="underline text-white/70">
            Back to Welcome
          </Link>
        </div>
      </div>
    </main>
  );
}