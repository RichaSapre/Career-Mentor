"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { educationSchema } from "@/features/profile/schema";
import { signupDraft } from "@/lib/auth/signupDraft";
import { DEGREE_LEVELS } from "@/lib/data/constants";

type FormValues = z.infer<typeof educationSchema>;

export default function EducationPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degreeLevel: "",
      major: "",
      university: "",
      graduationDate: "",
      gpa: undefined,
    },
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");

    if (draft.degreeLevel) form.setValue("degreeLevel", draft.degreeLevel);
    if (draft.major) form.setValue("major", draft.major);
    if (draft.university) form.setValue("university", draft.university);
    if (draft.graduationDate) form.setValue("graduationDate", draft.graduationDate);
    if (draft.gpa !== undefined) form.setValue("gpa", draft.gpa);
  }, [form, router]);

  function onSubmit(values: FormValues) {
    signupDraft.set({
      degreeLevel: values.degreeLevel,
      major: values.major,
      university: values.university,
      graduationDate: values.graduationDate,
      gpa: values.gpa,
    });
    router.push("/experience");
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Education</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label>Degree Level*</Label>
          <select
            {...form.register("degreeLevel")}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-input-bg border border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all"
          >
            <option value="">Select degree level</option>
            {DEGREE_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {form.formState.errors.degreeLevel && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.degreeLevel.message}</p>
          )}
        </div>

        <div>
          <Label>Major / Concentration*</Label>
          <Input placeholder="Computer Science, AI, Systems..." {...form.register("major")} />
          {form.formState.errors.major && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.major.message}</p>
          )}
        </div>

        <div>
          <Label>University*</Label>
          <Input placeholder="Stanford University" {...form.register("university")} />
          {form.formState.errors.university && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.university.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Graduation Date*</Label>
            <Input
              type="date"
              placeholder="2024-05-15"
              {...form.register("graduationDate")}
            />
            {form.formState.errors.graduationDate && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.graduationDate.message}</p>
            )}
          </div>
          <div>
            <Label>GPA (0-4)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="3.8"
              {...form.register("gpa", {
                setValueAs: (v) => (v === "" || isNaN(Number(v)) ? undefined : Number(v)),
              })}
            />
            {form.formState.errors.gpa && (
              <p className="mt-1 text-xs text-red-400">{form.formState.errors.gpa.message}</p>
            )}
          </div>
        </div>

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
