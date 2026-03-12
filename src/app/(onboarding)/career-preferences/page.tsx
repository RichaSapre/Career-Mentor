"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupDraft } from "@/lib/auth/signupDraft";
import { REMOTE_PREFERENCES, INDUSTRIES } from "@/lib/data/constants";

const COMMON_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Backend Engineer",
  "Frontend Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Machine Learning Engineer",
];

const COMMON_LOCATIONS = [
  "San Francisco",
  "New York",
  "Seattle",
  "Austin",
  "Boston",
  "Chicago",
  "Los Angeles",
  "Remote",
  "Denver",
  "Washington DC",
];

type FormValues = {
  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: string;
  industryPreferences: string[];
  relocationWillingness: boolean;
};

export default function CareerPreferencesPage() {
  const router = useRouter();
  const [roleInput, setRoleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const form = useForm<FormValues>({
    defaultValues: {
      targetRoles: [],
      preferredLocations: [],
      remotePreference: "",
      industryPreferences: [],
      relocationWillingness: false,
    },
  });

  const targetRoles = form.watch("targetRoles");
  const preferredLocations = form.watch("preferredLocations");
  const industryPreferences = form.watch("industryPreferences");

  useEffect(() => {
    const draft = signupDraft.get();
    if (!draft.email || !draft.password) router.replace("/signup");
    if (!draft.citizenshipStatus) router.replace("/citizenship");

    if (draft.targetRoles?.length) form.setValue("targetRoles", draft.targetRoles);
    if (draft.preferredLocations?.length) form.setValue("preferredLocations", draft.preferredLocations);
    if (draft.remotePreference) {
      const mapped = REMOTE_PREFERENCES.find((r) => r.value === draft.remotePreference || r.label === draft.remotePreference);
      form.setValue("remotePreference", mapped?.value ?? draft.remotePreference);
    }
    if (draft.industryPreferences?.length) form.setValue("industryPreferences", draft.industryPreferences);
    if (draft.relocationWillingness !== undefined) form.setValue("relocationWillingness", draft.relocationWillingness);
  }, [form, router]);

  function addRole(role: string) {
    const r = role.trim();
    if (!r || targetRoles.includes(r)) return;
    form.setValue("targetRoles", [...targetRoles, r]);
    setRoleInput("");
  }

  function removeRole(role: string) {
    form.setValue("targetRoles", targetRoles.filter((r) => r !== role));
  }

  function addLocation(loc: string) {
    const l = loc.trim();
    if (!l || preferredLocations.includes(l)) return;
    form.setValue("preferredLocations", [...preferredLocations, l]);
    setLocationInput("");
  }

  function removeLocation(loc: string) {
    form.setValue("preferredLocations", preferredLocations.filter((l) => l !== loc));
  }

  function toggleIndustry(ind: string) {
    const current = industryPreferences.includes(ind)
      ? industryPreferences.filter((i) => i !== ind)
      : [...industryPreferences, ind];
    form.setValue("industryPreferences", current);
  }

  function onSubmit(values: FormValues) {
    signupDraft.set({
      targetRoles: values.targetRoles,
      preferredLocations: values.preferredLocations,
      remotePreference: values.remotePreference,
      industryPreferences: values.industryPreferences,
      relocationWillingness: values.relocationWillingness,
    });
    router.push("/salary-links");
  }

  return (
    <GlassCard>
      <h2 className="text-center text-xl font-semibold text-heading">Career Preferences</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <Label>Target Roles* (add at least 1)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRole(roleInput))}
              placeholder="Type or select a role"
              className="flex-1"
            />
            <Button type="button" onClick={() => addRole(roleInput)} variant="secondary">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {COMMON_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => addRole(r)}
                className="px-3 py-1 rounded-lg text-xs bg-surface-inset border border-border hover:border-accent-primary text-body"
              >
                + {r}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {targetRoles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-full bg-tag-bg border border-tag-border px-3 py-1 text-sm"
              >
                {r}
                <button type="button" onClick={() => removeRole(r)} className="hover:text-red-400">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Locations* (add at least 1)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation(locationInput))}
              placeholder="Type or select a location"
              className="flex-1"
            />
            <Button type="button" onClick={() => addLocation(locationInput)} variant="secondary">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {COMMON_LOCATIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => addLocation(l)}
                className="px-3 py-1 rounded-lg text-xs bg-surface-inset border border-border hover:border-accent-primary text-body"
              >
                + {l}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {preferredLocations.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 rounded-full bg-tag-bg border border-tag-border px-3 py-1 text-sm"
              >
                {l}
                <button type="button" onClick={() => removeLocation(l)} className="hover:text-red-400">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label>Remote Preference*</Label>
          <select
            {...form.register("remotePreference", { required: "Please select" })}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-input-bg border border-input-border text-input-text focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:border-accent-primary transition-all"
          >
            <option value="">Select preference</option>
            {REMOTE_PREFERENCES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {form.formState.errors.remotePreference && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.remotePreference.message}</p>
          )}
        </div>

        <div>
          <Label>Industry Preferences (select any)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  industryPreferences.includes(ind)
                    ? "bg-accent-primary text-white border-accent-primary"
                    : "bg-surface-inset border-border hover:border-accent-primary text-body"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border bg-surface-inset hover:bg-surface-hover transition-colors">
          <input
            type="checkbox"
            {...form.register("relocationWillingness")}
            className="rounded border-border"
          />
          <span className="text-body font-medium">I am willing to relocate for the right opportunity</span>
        </label>

        <div className="flex gap-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={targetRoles.length === 0 || preferredLocations.length === 0 || !form.watch("remotePreference")}
          >
            Next →
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
