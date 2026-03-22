"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { signupDraft } from "@/lib/auth/signupDraft";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/auth/tokenStore";
import {
  DEGREE_LEVELS,
  CITIZENSHIP_STATUSES,
  PROFICIENCY_LEVELS,
  REMOTE_PREFERENCES,
  INDUSTRIES,
  COMMON_MAJORS,
} from "@/lib/data/constants";
import { TECH_SKILLS } from "@/lib/data/techSkills";
import { USA_LOCATIONS } from "@/lib/data/usaLocations";
import { TECH_ROLES } from "@/lib/data/techRoles";
import { USA_UNIVERSITIES } from "@/lib/data/usaUniversities";
import { signupStep1Schema, signupStep2Schema } from "@/features/profile/schema";
import type { Experience, Tokens, SignupPayload } from "@/lib/api/types";

import {
  UserPlus,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  ChevronsUpDown,
} from "lucide-react";

type Step1Values = z.infer<typeof signupStep1Schema>;
type Step2Values = z.infer<typeof signupStep2Schema>;

// ────────────────────────────────────────────
// MONTHS & GRADUATION YEARS
// ────────────────────────────────────────────
const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) =>
  String(currentYear - 2 + i)
);

// ────────────────────────────────────────────
// UNIVERSITY COMBOBOX (searchable + "Other")
// ────────────────────────────────────────────
function UniversityCombobox({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isOther = value === "__other__" || (value !== "" && !USA_UNIVERSITIES.includes(value as any));
  const displayValue = isOther ? value : value;

  const filtered = React.useMemo(() => {
    if (!query) return [...USA_UNIVERSITIES].slice(0, 30);
    const q = query.toLowerCase();
    return [...USA_UNIVERSITIES].filter((u) => u.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2" ref={containerRef}>
      <Label className="text-sm font-medium text-body">University *</Label>
      <div className="relative">
        <div
          className="flex items-center h-11 rounded-xl bg-input-bg border border-input-border cursor-pointer"
          onClick={() => {
            setOpen(!open);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <Input
            ref={inputRef}
            placeholder="Search or select university..."
            value={open ? query : (isOther && value !== "__other__" ? value : displayValue)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="h-full border-0 bg-transparent rounded-xl text-input-text placeholder:text-input-placeholder focus:ring-0 focus:ring-offset-0"
          />
          <ChevronsUpDown className="w-4 h-4 text-muted mr-3 shrink-0" />
        </div>

        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
            {filtered.length > 0 ? (
              filtered.map((uni) => (
                <button
                  type="button"
                  key={uni}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(uni);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors flex items-center gap-2 ${
                    value === uni ? "text-accent-primary font-medium" : "text-body"
                  }`}
                >
                  {value === uni && <Check className="w-3.5 h-3.5 text-accent-primary" />}
                  {uni}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted">No universities found</div>
            )}
            <div className="border-t border-border">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange("__other__");
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-accent-primary font-medium hover:bg-surface-hover transition-colors"
              >
                + Other (enter manually)
              </button>
            </div>
          </div>
        )}
      </div>
      {(isOther || value === "__other__") && (
        <Input
          placeholder="Enter your university name"
          value={value === "__other__" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
          autoFocus
        />
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ────────────────────────────────────────────
// STEP INDICATOR
// ────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold transition-all duration-300 ${
            currentStep >= 1
              ? "bg-btn-primary-bg border-btn-primary-bg text-btn-primary-text shadow-glow-primary"
              : "border-border text-muted"
          }`}
        >
          {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
        </div>
        <div
          className={`h-0.5 w-16 rounded-full transition-all duration-500 ${
            currentStep > 1 ? "bg-btn-primary-bg" : "bg-border"
          }`}
        />
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold transition-all duration-300 ${
            currentStep >= 2
              ? "bg-btn-primary-bg border-btn-primary-bg text-btn-primary-text shadow-glow-primary"
              : "border-border text-muted"
          }`}
        >
          2
        </div>
      </div>
      <div className="flex justify-center gap-12 text-xs text-muted">
        <span className={currentStep === 1 ? "text-heading font-semibold" : ""}>
          Account & Education
        </span>
        <span className={currentStep === 2 ? "text-heading font-semibold" : ""}>
          Skills & Career
        </span>
      </div>
      <Progress
        value={currentStep === 1 ? 50 : 100}
        className="mt-4 h-1.5 bg-surface-inset"
      />
    </div>
  );
}

// ────────────────────────────────────────────
// SKILL COMBOBOX
// ────────────────────────────────────────────
function SkillCombobox({
  selected,
  onAdd,
}: {
  selected: Set<string>;
  onAdd: (skill: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? TECH_SKILLS.filter((s) => s.toLowerCase().includes(q))
      : TECH_SKILLS;
    return base.filter((s) => !selected.has(s.toLowerCase())).slice(0, 10);
  }, [query, selected]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-input-placeholder" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search skills (e.g., React, Python, AWS)…"
          className="pl-9 h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface backdrop-blur-xl shadow-elevated overflow-hidden max-h-56 overflow-y-auto">
          {results.map((skill) => (
            <button
              type="button"
              key={skill}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onAdd(skill);
                setQuery("");
                inputRef.current?.focus();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-body hover:bg-surface-hover transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-accent-primary" />
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// TAG INPUT (for roles / locations)
// ────────────────────────────────────────────
function TagInput({
  label,
  placeholder,
  suggestions,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  suggestions: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = React.useState("");

  function add(val: string) {
    const v = val.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setInput("");
  }
  function remove(val: string) {
    onChange(values.filter((v) => v !== val));
  }

  const filteredSuggestions = suggestions
    .filter((s) => !values.includes(s))
    .slice(0, 8);

  return (
    <div>
      <Label className="text-sm font-medium text-body">{label}</Label>
      <div className="flex gap-2 mt-1.5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
        />
        <Button
          type="button"
          onClick={() => add(input)}
          variant="secondary"
          className="h-11 rounded-xl bg-btn-secondary-bg text-btn-secondary-text border-btn-secondary-border hover:bg-btn-secondary-hover"
        >
          Add
        </Button>
      </div>

      {/* Quick-pick suggestions */}
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2.5 py-1 rounded-lg text-xs bg-surface-inset border border-border hover:border-accent-primary text-body transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Selected tags */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="bg-tag-bg border-tag-border text-tag-text px-3 py-1 gap-1.5"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN SIGNUP PAGE
// ════════════════════════════════════════════
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ── Step 1 form ──
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      degreeLevel: "",
      major: "",
      university: "",
      graduationDate: "",
      gpa: undefined,
      citizenshipStatus: "",
      needsSponsorship: false,
    },
  });

  // ── Step 2 form ──
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      skills: [],
      hasExperience: false,
      experiences: [
        {
          title: "",
          company: "",
          description: "",
          month: "",
          year: "",
          techStack: "",
          duration: "",
          isCurrent: false,
        },
      ],
      targetRoles: [],
      preferredLocations: [],
      remotePreference: "",
      industryPreferences: [],
      relocationWillingness: false,
      salaryMin: "",
      salaryMax: "",
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: step2Form.control,
    name: "experiences",
  });

  const watchedSkills = step2Form.watch("skills");
  const hasExperience = step2Form.watch("hasExperience");
  const targetRoles = step2Form.watch("targetRoles");
  const preferredLocations = step2Form.watch("preferredLocations");
  const industryPreferences = step2Form.watch("industryPreferences");

  // Restore from localStorage on mount
  React.useEffect(() => {
    const draft = signupDraft.get();
    if (draft.fullName) step1Form.setValue("fullName", draft.fullName);
    if (draft.email) step1Form.setValue("email", draft.email);
    if (draft.degreeLevel) step1Form.setValue("degreeLevel", draft.degreeLevel);
    if (draft.major) step1Form.setValue("major", draft.major);
    if (draft.university) step1Form.setValue("university", draft.university);
    if (draft.graduationDate)
      step1Form.setValue("graduationDate", draft.graduationDate);
    if (draft.gpa !== undefined) step1Form.setValue("gpa", draft.gpa);
    if (draft.citizenshipStatus)
      step1Form.setValue("citizenshipStatus", draft.citizenshipStatus);
    if (draft.needsSponsorship !== undefined)
      step1Form.setValue("needsSponsorship", draft.needsSponsorship);

    if (draft.skills?.length) step2Form.setValue("skills", draft.skills.map(s =>
      typeof s === "string" ? { skillName: s, proficiencyLevel: 3 } : { skillName: s.skillName ?? "", proficiencyLevel: s.proficiencyLevel ?? 3 }
    ));
    if (draft.targetRoles?.length) step2Form.setValue("targetRoles", draft.targetRoles);
    if (draft.preferredLocations?.length)
      step2Form.setValue("preferredLocations", draft.preferredLocations);
    if (draft.remotePreference) step2Form.setValue("remotePreference", draft.remotePreference);
    if (draft.industryPreferences?.length)
      step2Form.setValue("industryPreferences", draft.industryPreferences);
    if (draft.relocationWillingness !== undefined)
      step2Form.setValue("relocationWillingness", draft.relocationWillingness);
    if (draft.salaryRange) {
      step2Form.setValue("salaryMin", String(draft.salaryRange.min));
      step2Form.setValue("salaryMax", String(draft.salaryRange.max));
    }
    if (draft.linkedinUrl) step2Form.setValue("linkedinUrl", draft.linkedinUrl);
    if (draft.githubUrl) step2Form.setValue("githubUrl", draft.githubUrl);
    if (draft.portfolioUrl) step2Form.setValue("portfolioUrl", draft.portfolioUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Password validation helpers ──
  const password = step1Form.watch("password") || "";
  const confirmPassword = step1Form.watch("confirmPassword") || "";
  const pwChecks = {
    minLength: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  };
  const allPwValid =
    pwChecks.minLength &&
    pwChecks.capital &&
    pwChecks.number &&
    pwChecks.special &&
    pwChecks.match;

  // ── STEP 1 → STEP 2 ──
  function handleStep1Submit(values: Step1Values) {
    // Clean up "Other" selections
    const cleanMajor = values.major?.startsWith("__other__:")
      ? values.major.replace("__other__:", "")
      : values.major;
    const cleanUniversity = values.university === "__other__" ? "" : values.university;

    signupDraft.set({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      degreeLevel: values.degreeLevel,
      major: cleanMajor,
      university: cleanUniversity,
      graduationDate: values.graduationDate,
      gpa: values.gpa,
      citizenshipStatus: values.citizenshipStatus,
      needsSponsorship: values.needsSponsorship,
    });
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── STEP 2 → SUBMIT ──
  async function handleStep2Submit(values: Step2Values) {
    const draft = signupDraft.get();

    const salaryRange =
      values.salaryMin && values.salaryMax
        ? {
            min: parseInt(values.salaryMin, 10),
            max: parseInt(values.salaryMax, 10),
            currency: "USD",
          }
        : undefined;

    // Map experiences
    const mappedExperiences: Experience[] = values.hasExperience
      ? values.experiences
          .filter((e) => e.title && e.company)
          .map((e, idx) => {
            const mm = String(e.month).padStart(2, "0");
            const startDate = e.year ? `${e.year}-${mm}-15` : undefined;
            const techStack = e.techStack
              ? e.techStack
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : undefined;
            return {
              title: e.title!.trim(),
              company: e.company!.trim(),
              description: e.description?.trim(),
              duration: e.duration?.trim() || undefined,
              techStack,
              startDate,
              isCurrent: e.isCurrent ?? idx === values.experiences.length - 1,
            };
          })
      : [];

    const payload: SignupPayload = {
      email: draft.email!,
      password: draft.password!,
      fullName: draft.fullName!,
      degreeLevel: draft.degreeLevel!,
      major: draft.major!,
      university: draft.university!,
      graduationDate: draft.graduationDate!,
      gpa: draft.gpa,
      citizenshipStatus: draft.citizenshipStatus!,
      needsSponsorship: draft.needsSponsorship ?? false,
      skills: values.skills.map((s) => ({
        skillName: s.skillName,
        proficiencyLevel: s.proficiencyLevel ?? 3,
      })),
      experiences: mappedExperiences,
      targetRoles: values.targetRoles,
      preferredLocations: values.preferredLocations,
      remotePreference: values.remotePreference,
      industryPreferences: values.industryPreferences,
      salaryRange,
      relocationWillingness: values.relocationWillingness,
      linkedinUrl: values.linkedinUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
    };

    setIsSubmitting(true);

    try {
      const res = await apiFetch<{
        accessToken?: string;
        refreshToken?: string;
        tokens?: Tokens;
        data?: { accessToken?: string; refreshToken?: string };
      }>(API.signupComplete, {
        method: "POST",
        body: JSON.stringify(payload),
        auth: false,
      });

      const d = res?.data ?? res;
      const accessToken =
        res?.accessToken ?? d?.accessToken ?? res?.tokens?.accessToken;
      const refreshToken =
        res?.refreshToken ?? d?.refreshToken ?? res?.tokens?.refreshToken;
      if (accessToken && refreshToken) {
        tokenStore.set({ accessToken, refreshToken });
      }
      signupDraft.clear();
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Skill helpers ──
  const normalizedSelected = React.useMemo(
    () => new Set(watchedSkills.map((s) => s.skillName.toLowerCase())),
    [watchedSkills]
  );

  function addSkill(skillName: string) {
    if (normalizedSelected.has(skillName.toLowerCase())) return;
    step2Form.setValue("skills", [
      ...watchedSkills,
      { skillName, proficiencyLevel: 3 },
    ]);
  }

  function removeSkill(skillName: string) {
    step2Form.setValue(
      "skills",
      watchedSkills.filter((s) => s.skillName !== skillName)
    );
  }

  function setProficiency(skillName: string, level: number) {
    step2Form.setValue(
      "skills",
      watchedSkills.map((s) =>
        s.skillName === skillName ? { ...s, proficiencyLevel: level } : s
      )
    );
  }

  function toggleIndustry(ind: string) {
    const current = industryPreferences.includes(ind)
      ? industryPreferences.filter((i) => i !== ind)
      : [...industryPreferences, ind];
    step2Form.setValue("industryPreferences", current);
  }

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <GlassCard className="p-8 md:p-12">
          <StepIndicator currentStep={step} />

          {/* ────────────── STEP 1 ────────────── */}
          {step === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-6"
            >
              {/* Section: Account */}
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-accent-primary" />
                <h2 className="text-xl font-bold text-heading">Account Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">
                    Full Name *
                  </Label>
                  <Input
                    placeholder="John Doe"
                    className="h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
                    {...step1Form.register("fullName")}
                  />
                  {step1Form.formState.errors.fullName && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">Email *</Label>
                  <Input
                    type="email"
                    placeholder="you@university.edu"
                    className="h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
                    {...step1Form.register("email")}
                  />
                  {step1Form.formState.errors.email && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder pr-10"
                      {...step1Form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted hover:text-heading transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">
                    Confirm Password *
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
                    {...step1Form.register("confirmPassword")}
                  />
                  {step1Form.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { ok: pwChecks.minLength, label: "8+ characters" },
                    { ok: pwChecks.capital, label: "Uppercase letter" },
                    { ok: pwChecks.number, label: "Number" },
                    { ok: pwChecks.special, label: "Special char (!@#$%^&*)" },
                    { ok: pwChecks.match, label: "Passwords match" },
                  ].map((c) => (
                    <span
                      key={c.label}
                      className={`flex items-center gap-1 ${
                        c.ok ? "text-badge-success-text" : "text-red-400"
                      }`}
                    >
                      {c.ok ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {c.label}
                    </span>
                  ))}
                </div>
              )}

              <Separator className="bg-divider" />

              {/* Section: Education */}
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-accent-primary" />
                <h2 className="text-xl font-bold text-heading">Education</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Degree Level */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">
                    Degree Level *
                  </Label>
                  <Select
                    value={step1Form.watch("degreeLevel")}
                    onValueChange={(v) => v && step1Form.setValue("degreeLevel", v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_LEVELS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {step1Form.formState.errors.degreeLevel && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.degreeLevel.message}
                    </p>
                  )}
                </div>

                {/* Major */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">Major *</Label>
                  <Select
                    value={step1Form.watch("major")?.startsWith("__other__") ? "__other__" : step1Form.watch("major")}
                    onValueChange={(v) => {
                      if (v === "__other__") {
                        step1Form.setValue("major", "__other__:");
                      } else {
                        step1Form.setValue("major", v);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                      <SelectValue placeholder="Select major" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_MAJORS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                      <SelectItem value="__other__">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {step1Form.watch("major")?.startsWith("__other__") && (
                    <Input
                      placeholder="Enter your major"
                      value={step1Form.watch("major")?.replace("__other__:", "") ?? ""}
                      onChange={(e) =>
                        step1Form.setValue("major", `__other__:${e.target.value}`)
                      }
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder mt-1"
                    />
                  )}
                  {step1Form.formState.errors.major && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.major.message}
                    </p>
                  )}
                </div>

                {/* University (searchable combobox) */}
                <UniversityCombobox
                  value={step1Form.watch("university") ?? ""}
                  onChange={(v) => step1Form.setValue("university", v)}
                  error={step1Form.formState.errors.university?.message}
                />

                {/* Graduation Date (month/year) */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">
                    Graduation Date *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={step1Form.watch("graduationDate")?.split("-")?.[1] ?? ""}
                      onValueChange={(month) => {
                        const current = step1Form.watch("graduationDate") ?? "";
                        const year = current.split("-")?.[0] ?? "";
                        step1Form.setValue("graduationDate", `${year}-${month}-01`);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={step1Form.watch("graduationDate")?.split("-")?.[0] ?? ""}
                      onValueChange={(year) => {
                        const current = step1Form.watch("graduationDate") ?? "";
                        const month = current.split("-")?.[1] ?? "01";
                        step1Form.setValue("graduationDate", `${year}-${month}-01`);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADUATION_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {step1Form.formState.errors.graduationDate && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.graduationDate.message}
                    </p>
                  )}
                </div>

                {/* GPA */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-body">GPA (0-4)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="3.8"
                    className="h-11 rounded-xl bg-input-bg border-input-border text-input-text placeholder:text-input-placeholder"
                    {...step1Form.register("gpa", {
                      setValueAs: (v) =>
                        v === "" || isNaN(Number(v)) ? undefined : Number(v),
                    })}
                  />
                  {step1Form.formState.errors.gpa && (
                    <p className="text-xs text-red-400">
                      {step1Form.formState.errors.gpa.message}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-divider" />

              {/* Section: Visa / Authorization */}
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-accent-primary" />
                <h2 className="text-xl font-bold text-heading">
                  Visa & Work Authorization
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-body">
                  Current Status *
                </Label>
                <Select
                  value={step1Form.watch("citizenshipStatus")}
                  onValueChange={(v) =>
                    v && step1Form.setValue("citizenshipStatus", v)
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                    <SelectValue placeholder="Select your visa / work authorization" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIZENSHIP_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.citizenshipStatus && (
                  <p className="text-xs text-red-400">
                    {step1Form.formState.errors.citizenshipStatus.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border bg-surface-inset hover:bg-surface-hover transition-colors">
                <Checkbox
                  checked={step1Form.watch("needsSponsorship")}
                  onCheckedChange={(checked) =>
                    step1Form.setValue("needsSponsorship", !!checked)
                  }
                />
                <span className="text-body font-medium text-sm">
                  I will need visa sponsorship for employment
                </span>
              </label>

              {/* Continue */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)]"
              >
                Continue to Skills & Career
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <button
                  type="button"
                  className="underline text-accent-primary hover:opacity-80 transition-opacity font-medium"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ────────────── STEP 2 ────────────── */}
          {step === 2 && (
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="space-y-6"
            >
              {/* Skills Section */}
              <div>
                <h2 className="text-xl font-bold text-heading mb-1">
                  Technical Skills
                </h2>
                <p className="text-xs text-muted mb-3">
                  Add at least 4 skills with proficiency level
                </p>

                <SkillCombobox selected={normalizedSelected} onAdd={addSkill} />

                {/* Selected skills */}
                <div className="mt-3 space-y-2">
                  {watchedSkills.map((skill) => (
                    <div
                      key={skill.skillName}
                      className="flex items-center justify-between gap-2 rounded-xl bg-surface-inset border border-border p-3"
                    >
                      <span className="font-medium text-sm text-heading">
                        {skill.skillName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(skill.proficiencyLevel ?? 3)}
                          onValueChange={(v) =>
                            v && setProficiency(skill.skillName, Number(v))
                          }
                        >
                          <SelectTrigger className="h-8 w-32 text-xs rounded-lg bg-input-bg border-input-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFICIENCY_LEVELS.map((p) => (
                              <SelectItem
                                key={p.value}
                                value={String(p.value)}
                              >
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.skillName)}
                          className="text-faint hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Selected: {watchedSkills.length} / 4 minimum
                </p>
                {step2Form.formState.errors.skills && (
                  <p className="text-xs text-red-400 mt-1">
                    {step2Form.formState.errors.skills.message}
                  </p>
                )}
              </div>

              <Separator className="bg-divider" />

              {/* Experience Section */}
              <div>
                <h2 className="text-xl font-bold text-heading mb-3">
                  Work Experience
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => step2Form.setValue("hasExperience", false)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      !hasExperience
                        ? "bg-surface-hover border-border-hover text-heading"
                        : "border-border bg-surface-inset text-muted"
                    }`}
                  >
                    No experience
                  </button>
                  <button
                    type="button"
                    onClick={() => step2Form.setValue("hasExperience", true)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      hasExperience
                        ? "bg-surface-hover border-border-hover text-heading"
                        : "border-border bg-surface-inset text-muted"
                    }`}
                  >
                    I have experience
                  </button>
                </div>

                {hasExperience && (
                  <div className="mt-4 space-y-4">
                    {experienceFields.map((f, idx) => (
                      <div
                        key={f.id}
                        className="rounded-2xl border border-border bg-surface-inset p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-heading">
                            Experience {idx + 1}
                          </span>
                          {experienceFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="text-xs text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted">Job Title *</Label>
                            <Input
                              placeholder="Software Engineer Intern"
                              className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                              {...step2Form.register(
                                `experiences.${idx}.title`
                              )}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted">
                              Company *
                            </Label>
                            <Input
                              placeholder="Google"
                              className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                              {...step2Form.register(
                                `experiences.${idx}.company`
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted">Month</Label>
                            <Input
                              placeholder="1-12"
                              className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                              {...step2Form.register(
                                `experiences.${idx}.month`
                              )}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted">Year</Label>
                            <Input
                              placeholder="2024"
                              className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                              {...step2Form.register(
                                `experiences.${idx}.year`
                              )}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-1">
                          <Label className="text-xs text-muted">Description</Label>
                          <Input
                            placeholder="What did you do?"
                            className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                            {...step2Form.register(
                              `experiences.${idx}.description`
                            )}
                          />
                        </div>

                        <div className="mt-3 flex flex-col gap-1">
                          <Label className="text-xs text-muted">
                            Tech Stack (comma separated)
                          </Label>
                          <Input
                            placeholder="React, Node.js, PostgreSQL"
                            className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                            {...step2Form.register(
                              `experiences.${idx}.techStack`
                            )}
                          />
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex-1 flex flex-col gap-1">
                            <Label className="text-xs text-muted">
                              Duration
                            </Label>
                            <Input
                              placeholder="3 months"
                              className="h-10 rounded-lg bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                              {...step2Form.register(
                                `experiences.${idx}.duration`
                              )}
                            />
                          </div>
                          <label className="flex items-center gap-2 mt-5 cursor-pointer">
                            <Checkbox
                              checked={step2Form.watch(
                                `experiences.${idx}.isCurrent`
                              )}
                              onCheckedChange={(checked) =>
                                step2Form.setValue(
                                  `experiences.${idx}.isCurrent`,
                                  !!checked
                                )
                              }
                            />
                            <span className="text-xs text-body">Current</span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-border text-body hover:bg-surface-hover"
                      onClick={() =>
                        appendExperience({
                          title: "",
                          company: "",
                          description: "",
                          month: "",
                          year: "",
                          techStack: "",
                          duration: "",
                          isCurrent: false,
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add another experience
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="bg-divider" />

              {/* Career Preferences */}
              <div>
                <h2 className="text-xl font-bold text-heading mb-3">
                  Career Preferences
                </h2>

                <div className="space-y-5">
                  <TagInput
                    label="Target Roles * (add at least 1)"
                    placeholder="Type or select a role"
                    suggestions={TECH_ROLES}
                    values={targetRoles}
                    onChange={(v) => step2Form.setValue("targetRoles", v)}
                  />
                  {step2Form.formState.errors.targetRoles && (
                    <p className="text-xs text-red-400">
                      {step2Form.formState.errors.targetRoles.message}
                    </p>
                  )}

                  <TagInput
                    label="Preferred Locations * (add at least 1)"
                    placeholder="Type or select a location"
                    suggestions={USA_LOCATIONS}
                    values={preferredLocations}
                    onChange={(v) =>
                      step2Form.setValue("preferredLocations", v)
                    }
                  />
                  {step2Form.formState.errors.preferredLocations && (
                    <p className="text-xs text-red-400">
                      {step2Form.formState.errors.preferredLocations.message}
                    </p>
                  )}

                  {/* Remote Preference */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-body">
                      Remote Preference *
                    </Label>
                    <Select
                      value={step2Form.watch("remotePreference")}
                      onValueChange={(v) =>
                        v && step2Form.setValue("remotePreference", v)
                      }
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-input-bg border-input-border text-input-text">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {REMOTE_PREFERENCES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {step2Form.formState.errors.remotePreference && (
                      <p className="text-xs text-red-400">
                        {step2Form.formState.errors.remotePreference.message}
                      </p>
                    )}
                  </div>

                  {/* Industries */}
                  <div>
                    <Label className="text-sm font-medium text-body">
                      Industry Preferences
                    </Label>
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

                  {/* Relocation */}
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border bg-surface-inset hover:bg-surface-hover transition-colors">
                    <Checkbox
                      checked={step2Form.watch("relocationWillingness")}
                      onCheckedChange={(checked) =>
                        step2Form.setValue("relocationWillingness", !!checked)
                      }
                    />
                    <span className="text-body font-medium text-sm">
                      I am willing to relocate for the right opportunity
                    </span>
                  </label>
                </div>
              </div>

              <Separator className="bg-divider" />

              {/* Salary & Links */}
              <div>
                <h2 className="text-xl font-bold text-heading mb-1">
                  Salary & Links
                </h2>
                <p className="text-xs text-muted mb-3">
                  Optional but helps personalize recommendations
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted">
                      Salary Min (USD)
                    </Label>
                    <Input
                      type="number"
                      placeholder="80000"
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                      {...step2Form.register("salaryMin")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted">
                      Salary Max (USD)
                    </Label>
                    <Input
                      type="number"
                      placeholder="150000"
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                      {...step2Form.register("salaryMax")}
                    />
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted">LinkedIn URL</Label>
                    <Input
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                      {...step2Form.register("linkedinUrl")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted">GitHub URL</Label>
                    <Input
                      type="url"
                      placeholder="https://github.com/yourusername"
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                      {...step2Form.register("githubUrl")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted">Portfolio URL</Label>
                    <Input
                      type="url"
                      placeholder="https://yourportfolio.dev"
                      className="h-10 rounded-xl bg-input-bg border-input-border text-input-text text-sm placeholder:text-input-placeholder"
                      {...step2Form.register("portfolioUrl")}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-border text-body hover:bg-surface-hover"
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all shadow-glow-primary hover:shadow-[0_0_30px_var(--btn-primary-hover)] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Complete Signup"
                  )}
                </Button>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </main>
  );
}