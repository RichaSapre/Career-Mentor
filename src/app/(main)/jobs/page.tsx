"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { signupDraft } from "@/lib/auth/signupDraft";

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
    job.title.toLowerCase().includes(query.toLowerCase())
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

    return { fitScore, missing };
  }

  return (
    <div className="w-full flex flex-col gap-8">

      <h1 className="text-3xl font-bold">Jobs</h1>

      {/* 🔎 Search Bar */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a role..."
        className="w-full max-w-xl px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none text-lg"
      />

      {/* Job Results */}
      <div className="flex flex-col gap-6">
        {filteredJobs.map((job) => {
          const { fitScore, missing } = calculateFit(job);

          return (
            <GlassCard key={job.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="text-white/60 text-sm">
                    {job.company} • {job.location}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white/60 text-sm">Fit</p>
                  <p className="text-2xl font-bold">{fitScore}%</p>
                </div>
              </div>

              {/* Missing Skills */}
              <div className="mt-4">
                <p className="text-white/60 text-sm">Skills to improve:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {missing.length === 0 ? (
                    <span className="text-green-400 text-sm">
                      You match all required skills 🎉
                    </span>
                  ) : (
                    missing.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
                >
                  Compare With Profile
                </button>

                <button
                  onClick={() =>
                    router.push(`/market-analyzer?role=${job.title}`)
                  }
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold"
                >
                  Run Debate
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Chain of Debate Section (Preview) */}
      {selectedJob && (
        <GlassCard className="p-8 mt-10">
          <h2 className="text-2xl font-semibold">
            Debate Analysis for {selectedJob.title}
          </h2>

          <p className="mt-4 text-white/70">
            🧠 Agent 1 (Market Agent): High demand in top cities.
          </p>
          <p className="text-white/70">
            🎓 Agent 2 (Profile Agent): You match 75% skills.
          </p>
          <p className="text-white/70">
            ⚖️ Agent 3 (Competition Agent): Competitive but achievable.
          </p>

          <p className="mt-4 font-semibold text-green-400">
            Final Recommendation: Strongly consider applying.
          </p>
        </GlassCard>
      )}
    </div>
  );
}