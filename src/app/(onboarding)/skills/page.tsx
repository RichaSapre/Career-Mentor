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

    const filtered = base.filter((s) => !normalizedSelected.has(s.toLowerCase()));

    return filtered.slice(0, 12);
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

    router.push("/dashboard");
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-heading">Skills</h1>

        <GlassCard>
          <label className="text-sm text-muted">Add skills (min 4)</label>

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
              className="w-full rounded-xl bg-input-bg border border-input-border px-4 py-3 outline-none placeholder:text-input-placeholder text-input-text focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all"
            />

            {/* Dropdown */}
            {open && results.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-surface backdrop-blur-xl shadow-elevated overflow-hidden">
                {results.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="w-full text-left px-4 py-2 text-sm text-body hover:bg-surface-hover transition-colors"
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
                className="inline-flex items-center gap-2 rounded-full bg-tag-bg border border-tag-border px-3 py-1 text-sm text-tag-text"
              >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-faint hover:text-heading transition-colors"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted">
            Selected: {selected.length} / 4 minimum
          </p>

          <button
            type="button"
            onClick={onNext}
            className="mt-6 w-full rounded-xl bg-btn-primary-bg text-btn-primary-text py-3 font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)]"
          >
            Next →
          </button>
        </GlassCard>

        {/* click outside to close dropdown */}
        
      </div>
    </main>
  );
}