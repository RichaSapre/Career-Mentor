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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-sm font-black mb-4 italic">
            <Briefcase className="w-4 h-4" />
            <span>Opportunity Board</span>
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)] italic">
            Find Your Next Role
          </h1>
          <p className="text-muted mt-2 text-lg italic font-medium">
            Matches are personalized based on your skill profile.
          </p>
        </div>
      </div>

      {/* 🔎 Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-faint group-focus-within:text-accent-primary transition-colors" />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by role or company..."
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-input-bg border border-input-border focus:border-accent-primary focus:bg-surface-hover focus:outline-none focus:ring-4 focus:ring-input-focus-ring text-lg transition-all shadow-card backdrop-blur-md placeholder:text-input-placeholder text-input-text"
        />
      </div>

      {/* Job Results */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.length === 0 && (
          <div className="text-center py-20 text-muted border border-border rounded-[2.5rem] bg-surface">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-lg italic font-black">No jobs found matching your search.</p>
          </div>
        )}

        {filteredJobs.map((job) => {
          const { fitScore, missing, matched } = calculateFit(job);

          return (
            <GlassCard 
              key={job.id} 
              className="group hover:bg-surface-hover hover:border-border-hover transition-all duration-300 hover:shadow-elevated"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Left Side: Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-heading group-hover:text-accent-primary transition-colors italic">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-muted text-sm font-bold italic">
                        <span className="flex items-center gap-1.5 bg-surface-inset px-3 py-1.5 rounded-lg border border-border shadow-sm">
                          <Building2 className="w-4 h-4 text-faint" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1.5 bg-surface-inset px-3 py-1.5 rounded-lg border border-border shadow-sm">
                          <MapPin className="w-4 h-4 text-faint" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Fit Score Badge */}
                    <div className="lg:hidden flex flex-col items-end">
                      <div className="text-2xl font-black italic text-faint group-hover:text-accent-primary transition-colors">
                        {fitScore}%
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-faint font-black italic">Fit</span>
                    </div>
                  </div>

                  {/* Skills Assessment */}
                  <div className="mt-8 space-y-3">
                    <p className="text-faint text-[10px] font-black uppercase tracking-[0.2em] italic">Skills Assessment</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {matched.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-badge-success-bg border border-badge-success-border text-badge-success-text text-xs font-black shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                      
                      {missing.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-badge-info-bg border border-badge-info-border text-badge-info-text text-xs font-black shadow-sm">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Desktop Fit Score & Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-divider pt-6 lg:pt-0 lg:pl-8 gap-6 min-w-[220px]">
                  
                  {/* Desktop Fit Score */}
                  <div className="hidden lg:flex flex-col items-end w-full">
                    <div className="flex items-center gap-2 text-faint mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-black italic">Match Accuracy</span>
                    </div>
                    <div className="text-5xl font-black italic tracking-tighter text-faint group-hover:text-accent-secondary transition-colors duration-500">
                      {fitScore}%
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-btn-secondary-bg hover:bg-btn-secondary-hover border border-btn-secondary-border transition-all font-black text-sm text-btn-secondary-text shadow-sm"
                    >
                      <GitCompare className="w-4 h-4" />
                      Deep Analysis
                    </button>

                    <button
                      onClick={() => router.push(`/market-analyzer?role=${job.title}` as any)}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover transition-all font-bold text-sm shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] active:scale-95"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedJob(null)}>
            <GlassCard className="w-full max-w-2xl bg-surface shadow-elevated overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.02] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-[10px] font-black uppercase tracking-[0.2em] mb-6 italic">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  AI Consensus Preview
                </div>

                <h2 className="text-3xl font-black text-heading tracking-tight italic">
                  {selectedJob.title}
                </h2>
                <p className="text-muted mt-1 font-medium">{selectedJob.company} • {selectedJob.location}</p>

                <div className="mt-8 space-y-4">
                  <div className="p-5 rounded-2xl bg-surface-inset border border-border flex gap-4 items-start shadow-sm">
                    <div className="p-2 rounded-xl bg-badge-info-bg text-badge-info-text mt-1">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-heading italic">Market Agent</h4>
                      <p className="text-muted text-sm mt-1 leading-relaxed font-medium">High demand detected for {selectedJob.title} in {selectedJob.location}. High saturation of applicants but your specific skill stack remains rare.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-surface-inset border border-border flex gap-4 items-start shadow-sm">
                    <div className="p-2 rounded-xl bg-badge-success-bg text-badge-success-text mt-1">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-heading italic">Profile Agent</h4>
                      <p className="text-muted text-sm mt-1 leading-relaxed font-medium">Your foundation in {matched.slice(0,2).join(", ")} is 1:1 with market needs. {missing.length > 0 ? `Consider learning ${missing[0]} to lock this role down.` : 'You are a perfect fit.'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 px-6 py-4 rounded-xl bg-btn-secondary-bg hover:bg-btn-secondary-hover font-bold transition-all text-btn-secondary-text border border-btn-secondary-border"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => router.push(`/market-analyzer?role=${selectedJob.title}` as any)}
                    className="flex-[2] px-6 py-4 rounded-xl bg-btn-primary-bg text-btn-primary-text font-bold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)]"
                  >
                    Initialize Full Analysis
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        );
      })()}
    </div>
  );
}