"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signupDraft } from "@/lib/auth/signupDraft";
import { CITIZENSHIP_STATUSES } from "@/lib/data/constants";

type FormValues = {
  citizenshipStatus: string;
  needsSponsorship: boolean;
};

export default function CitizenshipPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    defaultValues: {
      citizenshipStatus: "",
      needsSponsorship: false,
    },
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");
    if (!draft.degreeLevel || !draft.university) router.replace("/education");
    if (!draft.skills?.length || draft.skills.length < 4) router.replace("/skills");

    if (draft.citizenshipStatus) {
      const mapped = CITIZENSHIP_STATUSES.find((s) => s.value === draft.citizenshipStatus || s.label === draft.citizenshipStatus);
      form.setValue("citizenshipStatus", mapped?.value ?? draft.citizenshipStatus);
    }
    if (draft.needsSponsorship !== undefined) form.setValue("needsSponsorship", draft.needsSponsorship);
  }, [form, router]);

  function onSubmit(values: FormValues) {
    signupDraft.set({
      citizenshipStatus: values.citizenshipStatus,
      needsSponsorship: values.needsSponsorship,
    });
    router.push("/career-preferences");
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Citizenship & Sponsorship</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label>Citizenship / Work Authorization Status*</Label>
          <select
            {...form.register("citizenshipStatus", { required: "Please select your status" })}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-input-bg border border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all"
          >
            <option value="">Select status</option>
            {CITIZENSHIP_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {form.formState.errors.citizenshipStatus && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.citizenshipStatus.message}</p>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border bg-surface-inset hover:bg-surface-hover transition-colors">
          <input
            type="checkbox"
            {...form.register("needsSponsorship")}
            className="rounded border-border"
          />
          <span className="text-body font-medium">I need visa sponsorship for employment</span>
        </label>

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
