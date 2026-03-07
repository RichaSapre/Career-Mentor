"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { TECH_SKILLS } from "@/lib/data/techSkills";

export default function SkillsPage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  const normalizedSelected = React.useMemo(
    () => new Set(selected.map((s) => s.toLowerCase())),
    [selected]
  );

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? TECH_SKILLS.filter((s) => s.toLowerCase().includes(q))
      : TECH_SKILLS;

    // Hide already selected
    const filtered = base.filter((s) => !normalizedSelected.has(s.toLowerCase()));

    return filtered.slice(0, 12); // keep dropdown short
  }, [query, normalizedSelected]);

  function addSkill(skill: string) {
    const key = skill.toLowerCase();
    if (normalizedSelected.has(key)) return;
    setSelected((prev) => [...prev, skill]);
    setQuery("");
    setOpen(false);
  }

  function removeSkill(skill: string) {
    setSelected((prev) => prev.filter((s) => s !== skill));
  }

  function onNext() {
    if (selected.length < 4) {
      alert("Please add at least 4 skills to continue.");
      return;
    }

    // Demo navigation (or call your backend updateProfile here)
    router.push("/dashboard");
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Skills</h1>

        <GlassCard>
          <label className="text-sm text-white/80">Add skills (min 4)</label>

          {/* Search input */}
          <div className="relative mt-2">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search skills (e.g., React, SQL, AWS)"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none placeholder:text-white/40"
            />

            {/* Dropdown */}
            {open && results.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0B1026]/95 backdrop-blur-xl shadow-xl overflow-hidden">
                {results.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-white/70 hover:text-white"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/60">
            Selected: {selected.length} / 4 minimum
          </p>

          <button
            type="button"
            onClick={onNext}
            className="mt-6 w-full rounded-xl bg-white text-[#070A18] py-3 font-semibold"
          >
            Next →
          </button>
        </GlassCard>

        {/* click outside to close dropdown */}
        
      </div>
    </main>
  );
}