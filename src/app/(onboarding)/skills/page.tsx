"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { TECH_SKILLS } from "@/lib/data/techSkills";
import { PROFICIENCY_LEVELS } from "@/lib/data/constants";
import { signupDraft } from "@/lib/auth/signupDraft";
import type { Skill } from "@/lib/api/types";

export default function SkillsPage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Skill[]>([]);

  React.useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");
    if (!draft.degreeLevel || !draft.university) router.replace("/education");
    if (draft.skills?.length) {
      setSelected(
        draft.skills.map((s) =>
          typeof s === "string"
            ? { skillName: s, proficiencyLevel: 3 }
            : { skillName: s.skillName ?? "", proficiencyLevel: s.proficiencyLevel ?? 3 }
        )
      );
    }
  }, [router]);

  const normalizedSelected = React.useMemo(
    () => new Set(selected.map((s) => s.skillName.toLowerCase())),
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

  function addSkill(skillName: string) {
    const key = skillName.toLowerCase();
    if (normalizedSelected.has(key)) return;
    setSelected((prev) => [...prev, { skillName, proficiencyLevel: 3 }]);
    setQuery("");
    setOpen(false);
  }

  function removeSkill(skillName: string) {
    setSelected((prev) => prev.filter((s) => s.skillName !== skillName));
  }

  function setProficiency(skillName: string, level: number) {
    setSelected((prev) =>
      prev.map((s) =>
        s.skillName === skillName ? { ...s, proficiencyLevel: level } : s
      )
    );
  }

  function onNext() {
    if (selected.length < 4) {
      alert("Please add at least 4 skills to continue.");
      return;
    }

    signupDraft.set({ skills: selected });
    router.push("/citizenship");
  }

  return (
    <main className="bg-gradient-soft min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-heading">Skills</h1>

        <GlassCard>
          <label className="text-sm text-muted">Add skills (min 4) with proficiency level</label>

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

          {/* Selected skills with proficiency */}
          <div className="mt-4 space-y-3">
            {selected.map((skill) => (
              <div
                key={skill.skillName}
                className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl bg-surface-inset border border-border p-3"
              >
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium text-heading">{skill.skillName}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.skillName)}
                    className="text-faint hover:text-red-400 transition-colors px-1"
                    aria-label={`Remove ${skill.skillName}`}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Level:</span>
                  <select
                    value={skill.proficiencyLevel ?? 3}
                    onChange={(e) => setProficiency(skill.skillName, Number(e.target.value))}
                    className="rounded-lg bg-input-bg border border-input-border px-2 py-1 text-sm text-input-text"
                  >
                    {PROFICIENCY_LEVELS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} ({p.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
      </div>
    </main>
  );
}
