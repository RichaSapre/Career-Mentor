"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupDraft } from "@/lib/auth/signupDraft";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/auth/tokenStore";
import { CITIZENSHIP_STATUSES, REMOTE_PREFERENCES } from "@/lib/data/constants";
import type { SignupPayload, Tokens } from "@/lib/api/types";

// Map draft values to API values - handles labels, uppercase, and cached data
function toApiCitizenship(val: string): string {
  const found = CITIZENSHIP_STATUSES.find(
    (s) =>
      s.value === val ||
      s.label === val ||
      s.value === val?.toLowerCase() ||
      s.value === val?.toLowerCase()?.replace(/-/g, "_")
  );
  return found?.value ?? val;
}
function toApiRemote(val: string): string {
  const found = REMOTE_PREFERENCES.find(
    (r) => r.value === val || r.label === val || r.value === val?.toLowerCase()
  );
  return found?.value ?? val?.toLowerCase() ?? val;
}

type FormValues = {
  salaryMin: string;
  salaryMax: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
};

export default function SalaryLinksPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      salaryMin: "",
      salaryMax: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
    },
  });

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");
    if (!draft.targetRoles?.length) router.replace("/career-preferences");

    if (draft.salaryRange) {
      form.setValue("salaryMin", String(draft.salaryRange.min));
      form.setValue("salaryMax", String(draft.salaryRange.max));
    }
    if (draft.linkedinUrl) form.setValue("linkedinUrl", draft.linkedinUrl);
    if (draft.githubUrl) form.setValue("githubUrl", draft.githubUrl);
    if (draft.portfolioUrl) form.setValue("portfolioUrl", draft.portfolioUrl);
  }, [form, router]);

  async function onSubmit(values: FormValues) {
    const draft = signupDraft.get();

    const salaryRange =
      values.salaryMin && values.salaryMax
        ? {
            min: parseInt(values.salaryMin, 10),
            max: parseInt(values.salaryMax, 10),
            currency: "USD",
          }
        : undefined;

    signupDraft.set({
      salaryRange,
      linkedinUrl: values.linkedinUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
    });

    const updatedDraft = signupDraft.get();

    // Build complete payload and submit to API
    const payload: SignupPayload = {
      email: updatedDraft.email!,
      password: updatedDraft.password!,
      fullName: updatedDraft.fullName!,
      degreeLevel: updatedDraft.degreeLevel!,
      major: updatedDraft.major!,
      university: updatedDraft.university!,
      graduationDate: updatedDraft.graduationDate!,
      gpa: updatedDraft.gpa,
      citizenshipStatus: toApiCitizenship(updatedDraft.citizenshipStatus!),
      needsSponsorship: updatedDraft.needsSponsorship ?? false,
      skills: (updatedDraft.skills ?? []).map((s) => ({
        skillName: typeof s === "string" ? s : s.skillName,
        proficiencyLevel: typeof s === "string" ? 3 : (s.proficiencyLevel ?? 3),
      })),
      experiences: updatedDraft.experiences ?? [],
      targetRoles: updatedDraft.targetRoles ?? [],
      preferredLocations: updatedDraft.preferredLocations ?? [],
      remotePreference: toApiRemote(updatedDraft.remotePreference!),
      industryPreferences: updatedDraft.industryPreferences ?? [],
      salaryRange,
      relocationWillingness: updatedDraft.relocationWillingness ?? false,
      linkedinUrl: updatedDraft.linkedinUrl,
      githubUrl: updatedDraft.githubUrl,
      portfolioUrl: updatedDraft.portfolioUrl,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch<{ accessToken?: string; refreshToken?: string; tokens?: Tokens }>(
        API.signupComplete,
        {
          method: "POST",
          body: JSON.stringify(payload),
          auth: false,
        }
      );

      const accessToken = res?.accessToken ?? res?.tokens?.accessToken;
      const refreshToken = res?.refreshToken ?? res?.tokens?.refreshToken;
      if (accessToken && refreshToken) {
        tokenStore.set({ accessToken, refreshToken });
      }
      signupDraft.clear();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Salary & Links</h2>
      <p className="text-center text-sm text-muted mt-1">Optional but helps us personalize recommendations</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Expected Salary Min (USD)</Label>
            <Input
              type="number"
              placeholder="80000"
              {...form.register("salaryMin")}
            />
          </div>
          <div>
            <Label>Expected Salary Max (USD)</Label>
            <Input
              type="number"
              placeholder="150000"
              {...form.register("salaryMax")}
            />
          </div>
        </div>

        <div>
          <Label>LinkedIn URL</Label>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            {...form.register("linkedinUrl")}
          />
        </div>

        <div>
          <Label>GitHub URL</Label>
          <Input
            type="url"
            placeholder="https://github.com/yourusername"
            {...form.register("githubUrl")}
          />
        </div>

        <div>
          <Label>Portfolio URL</Label>
          <Input
            type="url"
            placeholder="https://yourportfolio.dev"
            {...form.register("portfolioUrl")}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()} disabled={isSubmitting}>
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Complete Signup"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
