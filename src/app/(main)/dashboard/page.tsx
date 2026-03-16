"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  AlertCircle,
  ChevronRight,
  Search,
  BrainCircuit,
  ArrowUpRight,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { cn } from "@/lib/utils";
import { useMe } from "@/features/auth/hooks";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

const FALLBACK_RECOMMENDATIONS = [
  { title: "Data Analyst", fit: 85, skills: ["SQL", "Python", "Tableau"], trend: "+12%" },
  { title: "Software Engineer", fit: 74, skills: ["React", "Typescript", "Node.js"], trend: "+5%" },
];

function trendFromDirection(dir?: string): string {
  if (dir === "up") return "+12%";
  if (dir === "down") return "-3%";
  return "+5%";
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState(FALLBACK_RECOMMENDATIONS);
  const [gapCount, setGapCount] = useState(2);
  const { data: user } = useMe();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = (await apiFetch(API.recommendedRoles, { method: "GET", auth: true })) as any;
        if (cancelled) return;
        const rawList = Array.isArray(r) ? r : (r?.data ?? []);
        if (!rawList?.length) return;
        const mapped = rawList.slice(0, 4).map((x: any) => ({
          title: x.roleTitle ?? x.role_title ?? "",
          fit: x.fitScore ?? x.fit_score ?? 0,
          skills: (x.topRequiredSkills ?? x.top_required_skills ?? x.missingSkills ?? x.missing_skills ?? []).slice(0, 4),
          trend: trendFromDirection(x.trendDirection ?? x.trend_direction),
        })).filter((x: any) => x.title);
        if (cancelled || !mapped.length) return;
        setRecommendations(mapped);
        const totalMissing = rawList.reduce((acc: number, x: any) => acc + (x.missingSkills ?? x.missing_skills ?? []).length, 0);
        setGapCount(Math.min(99, totalMissing || 2));
      } catch {
        // keep fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const userName = user?.fullName ?? (user as any)?.full_name ?? "User";
  const targetRole = user?.targetRoles?.[0] ?? (user as any)?.target_roles?.[0] ?? "Data Analyst";

  const quickActions = [
    {
      title: "Edit Profile",
      desc: "Update details",
      icon: User,
      link: "/profile",
      color: "bg-badge-info-bg text-badge-info-text"
    },
    {
      title: "Browse Jobs",
      desc: "Find opportunity",
      icon: Briefcase,
      link: "/jobs",
      color: "bg-badge-success-bg text-badge-success-text"
    },
    {
      title: "Run Analysis",
      desc: "Market analysis",
      icon: BrainCircuit,
      link: "/market-analyzer",
      color: "bg-badge-info-bg text-accent-primary"
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      {/* Personalized Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] tracking-tight italic">
            Welcome back, {userName}
          </h1>
          <p className="text-muted mt-2 flex items-center gap-2 text-lg font-bold italic">
            <SparkleIcon className="w-4 h-4 text-accent-primary" />
            You&apos;re 75% of the way to your ideal {targetRole} role.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-black bg-surface border border-border px-5 py-2.5 rounded-full text-heading backdrop-blur-xl shadow-card transition-all italic">
          <LayoutDashboard className="w-4 h-4" />
          Intelligence Overview
        </div>
      </div>

      {/* Primary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full auto-rows-[minmax(140px,auto)]">
        
        {/* Profile Completeness - Large Bento Item */}
        <GlassCard className="col-span-1 md:col-span-8 lg:col-span-6 row-span-2 group relative overflow-hidden flex flex-col justify-between hover:border-border-hover transition-all duration-500 p-8 shadow-card">
          <div className="flex items-start justify-between z-10">
            <div>
              <h3 className="text-xl font-black text-heading mb-1 italic">Profile Readiness</h3>
              <p className="text-sm text-muted font-medium">Your competitive standing in the current market.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-badge-success-bg border border-badge-success-border text-badge-success-text text-xs font-black uppercase tracking-wider flex items-center gap-1.5 italic">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Match
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto z-10">
            <div>
              <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[var(--gradient-from)] to-[var(--accent-primary)] mb-2">75%</div>
              <div className="text-sm font-black text-faint uppercase tracking-widest italic">Completeness</div>
            </div>
            
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-inset" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (mounted ? 0.75 : 0))}`}
                  className="text-accent-primary transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-primary/5 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        </GlassCard>

        {/* Small metric 1 - clickable */}
        <button
          type="button"
          onClick={() => router.push(`/market-analyzer?role=${encodeURIComponent(targetRole)}`)}
          className="col-span-1 md:col-span-4 lg:col-span-3 row-span-1 text-left"
        >
          <GlassCard className="h-full flex flex-col justify-between hover:border-border-hover transition-all duration-300 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-badge-info-bg text-badge-info-text border border-badge-info-border shadow-inner">
                <Briefcase className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-faint" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-faint mb-1 italic">Target Role</div>
              <div className="text-xl font-bold text-heading tracking-tight">{mounted ? targetRole : "..."}</div>
            </div>
          </GlassCard>
        </button>

        {/* Small metric 2 - clickable */}
        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="col-span-1 md:col-span-4 lg:col-span-3 row-span-1 text-left"
        >
          <GlassCard className="h-full flex flex-col justify-between hover:border-border-hover transition-all duration-300 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-badge-success-bg text-badge-success-text border border-badge-success-border shadow-inner">
                <AlertCircle className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-faint" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-faint mb-1 italic">Gap Analysis</div>
              <div className="text-xl font-bold text-heading tracking-tight">{gapCount} Missing Skills</div>
            </div>
          </GlassCard>
        </button>

        {/* Quick Actions Bento Item */}
        <GlassCard className="col-span-1 md:col-span-8 lg:col-span-6 row-span-1 flex flex-col justify-center p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-faint italic">Quick Tools</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-full">
            {quickActions.map((action, idx) => (
              <button key={idx} onClick={() => router.push(action.link as any)} className="group text-left h-full">
                <div className="flex flex-col justify-between h-full bg-surface-inset border border-border group-hover:bg-surface-hover group-hover:border-border-hover rounded-3xl p-4 transition-all duration-300 shadow-sm hover:shadow-card">
                  <div className={cn("p-2.5 rounded-xl self-start mb-3 transition-colors duration-300 shadow-sm", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-heading text-sm transition-colors group-hover:text-accent-primary italic">{action.title}</div>
                    <div className="text-[10px] text-faint mt-1 line-clamp-1 font-medium">{action.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Full Width Recommended Roles */}
        <GlassCard className="col-span-1 md:col-span-12 lg:col-span-12 row-span-2 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2 text-heading italic">
              <SparkleIcon className="w-5 h-5 text-accent-primary" />
              AI Trajectory Consensus
            </h3>
            <button onClick={() => router.push('/jobs')} className="text-sm text-accent-primary hover:opacity-80 font-black flex items-center gap-1 transition-colors italic">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 place-items-stretch">
            {recommendations.map((role, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => router.push(`/market-analyzer?role=${encodeURIComponent(role.title)}`)}
                className="group flex flex-col justify-between bg-surface-inset hover:bg-surface-hover border border-border hover:border-border-hover rounded-[1.5rem] p-6 transition-all duration-300 cursor-pointer h-full shadow-sm hover:shadow-elevated text-left w-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-black text-heading group-hover:text-accent-primary transition-colors italic">{role.title}</h4>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-badge-success-bg border border-badge-success-border text-badge-success-text text-[10px] font-black tracking-widest uppercase italic">
                      <TrendingUp className="w-3 h-3" /> Demand {role.trend}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-inset border border-border min-w-[70px]">
                    <div className="text-[10px] uppercase tracking-widest text-faint mb-0.5 font-black italic">FitRatio</div>
                    <div className="text-2xl font-black italic tracking-tighter text-accent-primary leading-none">
                      {role.fit}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-divider border-dashed">
                  <div className="text-[10px] font-black text-faint mb-2 uppercase tracking-wider italic">Required Core</div>
                  <div className="flex flex-wrap gap-2">
                    {(role.skills ?? []).map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-tag-bg border border-tag-border text-tag-text text-xs font-black group-hover:bg-tag-hover-bg group-hover:border-tag-hover-border group-hover:text-tag-hover-text transition-colors shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}