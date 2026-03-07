"use client";

import { useEffect } from "react";
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
import type { Experience } from "@/lib/api/types";

type FormValues = z.infer<typeof experienceSchema>;

export default function ExperiencePage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      hasExperience: false,
      experiences: [{ title: "", company: "", description: "", month: "", year: "", techStack: "" }],
    },
  });

  const hasExperience = form.watch("hasExperience");

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");

    // If draft already has experiences, set toggle to true and load entries
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
        }))
      );
    }
  }, [form, router, replace]);

  function onSubmit(values: FormValues) {
    // If user says "No experience", store empty and continue
    if (!values.hasExperience) {
      signupDraft.set({ experiences: [] });
      router.push("/skills");
      return;
    }

    const mapped: Experience[] = values.experiences.map((e) => {
      const mm = String(e.month).padStart(2, "0");
      const startDate = `${e.year}-${mm}-01`;
      const techStack = e.techStack
        ? e.techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      return {
        title: e.title!.trim(),
        company: e.company!.trim(),
        description: e.description!.trim(),
        duration: `${e.month}/${e.year}`,
        techStack,
        startDate,
        isCurrent: false,
      };
    });

    signupDraft.set({ experiences: mapped });
    router.push("/skills");
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold">Experience</h2>

      {/* Toggle */}
      <div className="mt-5 space-y-3">
        <Label className="text-white/80">Do you have work experience?</Label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              form.setValue("hasExperience", false);
              signupDraft.set({ experiences: [] });
            }}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
              !hasExperience ? "bg-white/15 border-white/20" : "border-white/10 bg-white/5"
            }`}
          >
            No experience
          </button>

          <button
            type="button"
            onClick={() => {
              form.setValue("hasExperience", true);
              if (!fields.length) {
                replace([{ title: "", company: "", description: "", month: "", year: "", techStack: "" }]);
              }
            }}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
              hasExperience ? "bg-white/15 border-white/20" : "border-white/10 bg-white/5"
            }`}
          >
            I have experience
          </button>
        </div>

        {hasExperience && (
          <p className="text-xs text-white/60">
            Please fill all required fields for at least one experience entry.
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* Only show entries if hasExperience */}
        {hasExperience &&
          fields.map((f, idx) => (
            <div key={f.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Entry {idx + 1}</div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-white/70 underline underline-offset-4"
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
                    <p className="mt-1 text-xs text-red-200">
                      {form.formState.errors.experiences[idx]?.title?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Company Name*</Label>
                  <Input {...form.register(`experiences.${idx}.company`)} placeholder="Company" />
                  {form.formState.errors.experiences?.[idx]?.company && (
                    <p className="mt-1 text-xs text-red-200">
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
                    <p className="mt-1 text-xs text-red-200">
                      {form.formState.errors.experiences[idx]?.month?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Year*</Label>
                  <Input {...form.register(`experiences.${idx}.year`)} placeholder="2024" />
                  {form.formState.errors.experiences?.[idx]?.year && (
                    <p className="mt-1 text-xs text-red-200">
                      {form.formState.errors.experiences[idx]?.year?.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <Label>Description*</Label>
                <Input {...form.register(`experiences.${idx}.description`)} placeholder="What did you do?" />
                {form.formState.errors.experiences?.[idx]?.description && (
                  <p className="mt-1 text-xs text-red-200">
                    {form.formState.errors.experiences[idx]?.description?.message as string}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <Label>Tech Stack (comma separated)</Label>
                <Input {...form.register(`experiences.${idx}.techStack`)} placeholder="React, Node.js, SQL" />
              </div>
            </div>
          ))}

        {hasExperience && (
          <>
            {form.formState.errors.experiences && (
              <p className="text-xs text-red-200">{(form.formState.errors.experiences as any).message}</p>
            )}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => append({ title: "", company: "", description: "", month: "", year: "", techStack: "" })}
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