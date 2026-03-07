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

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recommendations = [
    { title: "Data Analyst", fit: 85, skills: ["SQL", "Python", "Tableau"], trend: "+12%" },
    { title: "Software Engineer", fit: 74, skills: ["React", "Typescript", "Node.js"], trend: "+5%" },
  ];

  const quickActions = [
    {
      title: "Edit Profile",
      desc: "Update details",
      icon: User,
      link: "/profile",
      color: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20"
    },
    {
      title: "Browse Jobs",
      desc: "Find opportunity",
      icon: Briefcase,
      link: "/jobs",
      color: "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
    },
    {
      title: "Run Analysis",
      desc: "Simulate interview",
      icon: BrainCircuit,
      link: "/market-analyzer",
      color: "bg-cyan-500/20 text-cyan-500 group-hover:bg-cyan-500/30"
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-10">
      {/* Personalized Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tight">
            Welcome back, User
          </h1>
          <p className="text-zinc-400 mt-2 flex items-center gap-2 text-lg">
            <SparkleIcon className="w-4 h-4 text-cyan-400" />
            You're 75% of the way to your ideal Data Analyst role.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-[#0F172A]/40 border border-slate-800/50 px-5 py-2.5 rounded-full text-cyan-400 backdrop-blur-md shadow-lg">
          <LayoutDashboard className="w-4 h-4" />
          Intelligence Overview
        </div>
      </div>

      {/* Primary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full auto-rows-[minmax(140px,auto)]">
        
        {/* Profile Completeness - Large Bento Item */}
        <GlassCard className="col-span-1 md:col-span-8 lg:col-span-6 row-span-2 group relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-500 p-8 shadow-2xl">
          <div className="flex items-start justify-between z-10">
            <div>
              <h3 className="text-xl font-bold text-zinc-100 mb-1">Profile Readiness</h3>
              <p className="text-sm text-zinc-500">Your competitive standing in the current market.</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Match
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto z-10">
            <div>
              <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-emerald-400 mb-2">75%</div>
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Completeness</div>
            </div>
            
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                <circle
                  cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (mounted ? 0.75 : 0))}`}
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        </GlassCard>

        {/* Small metric 1 */}
        <GlassCard className="col-span-1 md:col-span-4 lg:col-span-3 row-span-1 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Briefcase className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">Target Role</div>
            <div className="text-xl font-bold text-zinc-100 tracking-tight">Data Analyst</div>
          </div>
        </GlassCard>

        {/* Small metric 2 */}
        <GlassCard className="col-span-1 md:col-span-4 lg:col-span-3 row-span-1 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <AlertCircle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">Gap Analysis</div>
            <div className="text-xl font-bold text-zinc-100 tracking-tight">2 Missing Skills</div>
          </div>
        </GlassCard>

        {/* Quick Actions Bento Item */}
        <GlassCard className="col-span-1 md:col-span-8 lg:col-span-6 row-span-1 flex flex-col justify-center border-slate-800/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Quick Tools</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-full">
            {quickActions.map((action, idx) => (
              <button key={idx} onClick={() => router.push(action.link as any)} className="group text-left h-full">
                <div className="flex flex-col justify-between h-full bg-zinc-900/40 border border-white/5 group-hover:bg-[#0F172A] group-hover:border-cyan-500/30 rounded-2xl p-4 transition-all duration-300">
                  <div className={cn("p-2.5 rounded-xl self-start mb-3 transition-colors duration-300 shadow", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-200 text-sm">{action.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{action.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Full Width Recommended Roles Slider/List */}
        <GlassCard className="col-span-1 md:col-span-12 lg:col-span-12 row-span-2 p-8 border-slate-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-200">
              <SparkleIcon className="w-5 h-5 text-cyan-400" />
              AI Trajectory Consensus
            </h3>
            <button onClick={() => router.push('/jobs')} className="text-sm text-cyan-500 hover:text-cyan-400 font-medium flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 place-items-stretch">
            {recommendations.map((role, idx) => (
              <div key={idx} className="group flex flex-col justify-between bg-zinc-900/30 hover:bg-[#0F172A]/80 border border-white/5 hover:border-cyan-500/30 rounded-[1.5rem] p-6 transition-all duration-300 cursor-pointer h-full shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">{role.title}</h4>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                      <TrendingUp className="w-3 h-3" /> Demand {role.trend}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/20 border border-white/5 min-w-[70px]">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Fit</div>
                    <div className="text-2xl font-black italic tracking-tighter text-cyan-400 leading-none">
                      {role.fit}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/5 border-dashed">
                  <div className="text-xs font-semibold text-zinc-600 mb-2 uppercase tracking-wider">Required Core</div>
                  <div className="flex flex-wrap gap-2">
                    {role.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 text-xs font-medium group-hover:bg-cyan-500/5 group-hover:border-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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