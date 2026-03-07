"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";
import { 
  Search, 
  MapPin, 
  Building2, 
  BrainCircuit, 
  GitCompare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
};

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Data Analyst",
    company: "TechCorp",
    location: "San Francisco",
    requiredSkills: ["SQL", "Python", "Tableau", "Statistics"],
  },
  {
    id: "2",
    title: "Software Engineer",
    company: "InnovateX",
    location: "Seattle",
    requiredSkills: ["Java", "DSA", "System Design", "Spring Boot"],
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Nexus Dynamics",
    location: "Remote",
    requiredSkills: ["Agile", "Jira", "Strategy", "SQL"],
  }
];

export default function JobsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const draft = signupDraft.get();
  const userSkills =
    draft.skills?.map((s: any) =>
      typeof s === "string" ? s : s.skill_name
    ) || [];

  const filteredJobs = MOCK_JOBS.filter((job) =>
    job.title.toLowerCase().includes(query.toLowerCase()) || 
    job.company.toLowerCase().includes(query.toLowerCase())
  );

  function calculateFit(job: Job) {
    const matched = job.requiredSkills.filter((skill) =>
      userSkills.includes(skill)
    );

    const fitScore = Math.round(
      (matched.length / job.requiredSkills.length) * 100
    );

    const missing = job.requiredSkills.filter(
      (skill) => !userSkills.includes(skill)
    );

    return { fitScore, missing, matched };
  }

  return (
    <div className="w-full flex flex-col gap-10 pb-16">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/80 text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            <span>Opportunity Board</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
            Find Your Next Role
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Matches are personalized based on your skill profile.
          </p>
        </div>
      </div>

      {/* 🔎 Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-zinc-600 group-focus-within:text-cyan-500transition-colors" />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by role or company..."
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#0F172A]/40 border border-slate-800/50 focus:border-cyan-500/30 focus:bg-[#0F172A]/60 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 text-lg transition-all shadow-lg backdrop-blur-md placeholder:text-zinc-700 text-zinc-200"
        />
      </div>

      {/* Job Results */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.length === 0 && (
          <div className="text-center py-20 text-zinc-600 border border-slate-800/50 rounded-[2.5rem] bg-[#0F172A]/40">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No jobs found matching your search.</p>
          </div>
        )}

        {filteredJobs.map((job) => {
          const { fitScore, missing, matched } = calculateFit(job);

          return (
            <GlassCard 
              key={job.id} 
              className="group hover:bg-[#0F172A]/60 border-slate-800/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Left Side: Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-200 group-hover:text-white transition-colors">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-zinc-500 text-sm font-medium">
                        <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-lg border border-white/5">
                          <Building2 className="w-4 h-4 text-zinc-600" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-lg border border-white/5">
                          <MapPin className="w-4 h-4 text-zinc-600" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Fit Score Badge */}
                    <div className="lg:hidden flex flex-col items-end">
                      <div className="text-2xl font-black italic text-zinc-400 group-hover:text-cyan-400 transition-colors">
                        {fitScore}%
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Fit</span>
                    </div>
                  </div>

                  {/* Skills Assessment */}
                  <div className="mt-8 space-y-3">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Skills Assessment</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {matched.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/70 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                      
                      {missing.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/60 text-xs font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Desktop Fit Score & Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-800/50 pt-6 lg:pt-0 lg:pl-8 gap-6 min-w-[220px]">
                  
                  {/* Desktop Fit Score */}
                  <div className="hidden lg:flex flex-col items-end w-full">
                    <div className="flex items-center gap-2 text-zinc-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Match Accuracy</span>
                    </div>
                    <div className="text-5xl font-black italic tracking-tighter text-zinc-500 group-hover:text-emerald-400 transition-colors duration-500">
                      {fitScore}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all font-medium text-sm text-zinc-400 hover:text-zinc-200"
                    >
                      <GitCompare className="w-4 h-4" />
                      Deep Analysis
                    </button>

                    <button
                      onClick={() => router.push(`/market-analyzer?role=${job.title}` as any)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition-all font-bold text-sm shadow-xl active:scale-95 shadow-cyan-900/20"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      Run Debate
                    </button>
                  </div>
                </div>

              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Selected Job Analysis Modal */}
      {selectedJob && (() => {
        const { matched, missing } = calculateFit(selectedJob);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedJob(null)}>
            <GlassCard className="w-full max-w-2xl bg-[#0F172A] border-slate-800/50 shadow-3xl" onClick={e => e.stopPropagation()}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/80 text-[10px] font-bold uppercase tracking-widest mb-6">
                <BrainCircuit className="w-3.5 h-3.5" />
                AI Consensus Preview
              </div>

              <h2 className="text-3xl font-bold text-zinc-100">
                {selectedJob.title}
              </h2>
              <p className="text-zinc-500 mt-1">{selectedJob.company} • {selectedJob.location}</p>

              <div className="mt-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-1">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-300">Market Agent</h4>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">High demand detected for {selectedJob.title} in {selectedJob.location}. High saturation of applicants but your specific skill stack remains rare.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-300">Profile Agent</h4>
                    <p className="text-zinc-500 text-sm mt-1 leading-relaxed">Your foundation in {matched.slice(0,2).join(", ")} is 1:1 with market needs. {missing.length > 0 ? `Consider learning ${missing[0]} to lock this role down.` : 'You are a perfect fit.'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors text-zinc-400"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => router.push(`/market-analyzer?role=${selectedJob.title}` as any)}
                  className="flex-[2] px-6 py-4 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20"
                >
                  Initialize Full Analysis
                </button>
              </div>
            </GlassCard>
          </div>
        );
      })()}
    </div>
  );
}