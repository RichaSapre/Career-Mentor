"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { experienceSchema } from "@/features/profile/schema";
import { signupDraft } from "@/lib/auth/signupDraft";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { Experience } from "@/lib/api/types";

type FormValues = z.infer<typeof experienceSchema>;

export default function ExperiencePage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      hasExperience: false,
      experiences: [{ title: "", company: "", description: "", month: "", year: "", techStack: "", duration: "", isCurrent: false }],
    },
  });

  const hasExperience = form.watch("hasExperience");
  const [resumeText, setResumeText] = useState("");
  const [resumeExpanded, setResumeExpanded] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");
    if (!draft.degreeLevel || !draft.university) router.replace("/education");

    if (draft.experiences?.length) {
      form.setValue("hasExperience", true);

      replace(
        draft.experiences.map((e) => ({
          title: e.title ?? "",
          company: e.company ?? "",
          description: e.description ?? "",
          month: (e.startDate?.slice(5, 7) ?? "").replace(/^0/, "") || "",
          year: e.startDate?.slice(0, 4) ?? "",
          techStack: (e.techStack ?? []).join(", "),
          duration: e.duration ?? "",
          isCurrent: e.isCurrent ?? false,
        }))
      );
    }
  }, [form, router, replace]);

  function onSubmit(values: FormValues) {
    if (!values.hasExperience) {
      signupDraft.set({ experiences: [] });
      router.push("/skills");
      return;
    }

    const mapped: Experience[] = values.experiences.map((e, idx) => {
      const mm = String(e.month).padStart(2, "0");
      const startDate = `${e.year}-${mm}-15`;
      const techStack = e.techStack
        ? e.techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      const yearsAgo = e.year ? new Date().getFullYear() - parseInt(e.year, 10) : 0;
      const computedDuration = yearsAgo >= 1 ? `${yearsAgo} year${yearsAgo > 1 ? "s" : ""}` : "Less than 1 year";
      const duration = e.duration?.trim() || computedDuration;
      const isCurrent = e.isCurrent ?? (idx === values.experiences.length - 1);

      return {
        title: e.title!.trim(),
        company: e.company!.trim(),
        description: e.description!.trim(),
        duration,
        techStack,
        startDate,
        isCurrent,
      };
    });

    signupDraft.set({ experiences: mapped });
    router.push("/skills");
  }

  async function handleExtractResume() {
    if (!resumeText.trim()) return;
    setResumeLoading(true);
    setResumeError(null);
    try {
      const res = (await apiFetch(API.extractResume, {
        method: "POST",
        body: JSON.stringify({ resumeText: resumeText.trim() }),
        auth: false,
      })) as any;
      const data = res?.data ?? res;
      if (data?.experiences?.length) {
        form.setValue("hasExperience", true);
        replace(
          data.experiences.slice(0, 5).map((e: any) => {
            const startDate = e.startDate ?? (e.duration ? "" : "");
            return {
              title: e.title ?? "",
              company: e.company ?? "",
              description: e.description ?? "",
              month: startDate?.slice?.(5, 7)?.replace?.(/^0/, "") ?? "",
              year: startDate?.slice?.(0, 4) ?? "",
              techStack: Array.isArray(e.techStack) ? e.techStack.join(", ") : (e.techStack ?? ""),
              duration: e.duration ?? "",
              isCurrent: false,
            };
          })
        );
      }
      if (data?.skills?.length) {
        signupDraft.set({
          ...signupDraft.get(),
          skills: data.skills.map((s: any) => ({
            skillName: s.skillName ?? s,
            proficiencyLevel: s.proficiencyLevel ?? 3,
          })),
        });
      }
      if (data?.education) {
        const edu = data.education;
        signupDraft.set({
          ...signupDraft.get(),
          degreeLevel: edu.degreeLevel ?? signupDraft.get().degreeLevel,
          major: edu.major ?? signupDraft.get().major,
          university: edu.university ?? signupDraft.get().university,
          graduationDate: edu.graduationDate ?? signupDraft.get().graduationDate,
        });
      }
      setResumeExpanded(false);
    } catch (e: any) {
      setResumeError(e?.message ?? "Extraction failed. Try again.");
    } finally {
      setResumeLoading(false);
    }
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Experience</h2>

      {/* Resume extraction (proposal: semi-automated extraction from résumés) */}
      <div className="mt-4 mb-4 rounded-xl border border-border bg-surface-inset/50 p-3">
        <button
          type="button"
          onClick={() => setResumeExpanded(!resumeExpanded)}
          className="text-sm font-medium text-accent-primary hover:underline"
        >
          {resumeExpanded ? "−" : "+"} Import from resume (paste text)
        </button>
        {resumeExpanded && (
          <div className="mt-3 space-y-2">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm placeholder:text-input-placeholder min-h-[120px]"
              rows={4}
            />
            {resumeError && <p className="text-xs text-red-500">{resumeError}</p>}
            <button
              type="button"
              onClick={handleExtractResume}
              disabled={resumeLoading || !resumeText.trim()}
              className="rounded-lg bg-accent-primary/20 text-accent-primary px-4 py-2 text-sm font-medium hover:bg-accent-primary/30 disabled:opacity-50"
            >
              {resumeLoading ? "Extracting…" : "Extract & auto-fill"}
            </button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="mt-5 space-y-3">
        <Label>Do you have work experience?</Label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              form.setValue("hasExperience", false);
              signupDraft.set({ experiences: [] });
            }}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              !hasExperience ? "bg-surface-hover border-border-hover text-heading" : "border-border bg-surface-inset text-muted"
            }`}
          >
            No experience
          </button>

          <button
            type="button"
            onClick={() => {
              form.setValue("hasExperience", true);
              if (!fields.length) {
                replace([{ title: "", company: "", description: "", month: "", year: "", techStack: "", duration: "", isCurrent: false }]);
              }
            }}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              hasExperience ? "bg-surface-hover border-border-hover text-heading" : "border-border bg-surface-inset text-muted"
            }`}
          >
            I have experience
          </button>
        </div>

        {hasExperience && (
          <p className="text-xs text-muted">
            Please fill all required fields for at least one experience entry.
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {hasExperience &&
          fields.map((f, idx) => (
            <div key={f.id} className="rounded-2xl border border-border bg-surface-inset p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-heading">Entry {idx + 1}</div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-muted underline underline-offset-4 hover:text-heading transition-colors"
                    onClick={() => remove(idx)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Job Title*</Label>
                  <Input {...form.register(`experiences.${idx}.title`)} placeholder="Job Title" />
                  {form.formState.errors.experiences?.[idx]?.title && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.experiences[idx]?.title?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Company Name*</Label>
                  <Input {...form.register(`experiences.${idx}.company`)} placeholder="Company" />
                  {form.formState.errors.experiences?.[idx]?.company && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.experiences[idx]?.company?.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label>Month*</Label>
                  <Input {...form.register(`experiences.${idx}.month`)} placeholder="1-12" />
                  {form.formState.errors.experiences?.[idx]?.month && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.experiences[idx]?.month?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Year*</Label>
                  <Input {...form.register(`experiences.${idx}.year`)} placeholder="2024" />
                  {form.formState.errors.experiences?.[idx]?.year && (
                    <p className="mt-1 text-xs text-red-400">
                      {form.formState.errors.experiences[idx]?.year?.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <Label>Description*</Label>
                <Input {...form.register(`experiences.${idx}.description`)} placeholder="What did you do?" />
                {form.formState.errors.experiences?.[idx]?.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {form.formState.errors.experiences[idx]?.description?.message as string}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <Label>Tech Stack (comma separated)</Label>
                <Input {...form.register(`experiences.${idx}.techStack`)} placeholder="React, Node.js, SQL" />
              </div>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1">
                  <Label>Duration (e.g. 2 years)</Label>
                  <Input {...form.register(`experiences.${idx}.duration`)} placeholder="2 years" />
                </div>
                <label className="flex items-center gap-2 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register(`experiences.${idx}.isCurrent`)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-body">Current role</span>
                </label>
              </div>
            </div>
          ))}

        {hasExperience && (
          <>
            {form.formState.errors.experiences && (
              <p className="text-xs text-red-400">{(form.formState.errors.experiences as any).message}</p>
            )}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => append({ title: "", company: "", description: "", month: "", year: "", techStack: "", duration: "", isCurrent: false })}
            >
              + Add another experience
            </Button>
          </>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Next →
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}