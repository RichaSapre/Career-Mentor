"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/glass/GlassCard";
import ProfilePhotoModal from "@/components/profile/ProfilePhotoModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/features/auth/hooks";
import type { Education, Experience, UserProfile } from "@/lib/api/types";
import { signupDraft } from "@/lib/auth/signupDraft";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import {
  CITIZENSHIP_STATUSES,
  COMMON_MAJORS,
  DEGREE_LEVELS,
  INDUSTRIES,
  PROFICIENCY_LEVELS,
  REMOTE_PREFERENCES,
} from "@/lib/data/constants";
import { MARKET_ROLES } from "@/lib/data/marketRoles";
import { TECH_ROLES } from "@/lib/data/techRoles";
import { TECH_SKILLS } from "@/lib/data/techSkills";
import { USA_LOCATIONS } from "@/lib/data/usaLocations";
import { USA_UNIVERSITIES } from "@/lib/data/usaUniversities";
import { Briefcase, Code, GraduationCap, Loader2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

type SkillFormItem = {
  skillName: string;
  proficiencyLevel: number;
};

type ExperienceFormItem = {
  title: string;
  company: string;
  description: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  duration: string;
  techStack: string;
  isCurrent: boolean;
};

type EducationFormItem = {
  degreeLevel: string;
  major: string;
  university: string;
  graduationDate: string;
  gpa: string;
};

type ProfileFormState = {
  fullName: string;
  email: string;
  educations: EducationFormItem[];
  citizenshipStatus: string;
  needsSponsorship: boolean;
  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: string;
  industryPreferences: string[];
  relocationWillingness: boolean;
  salaryMin: string;
  salaryMax: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  skills: SkillFormItem[];
  experiences: ExperienceFormItem[];
};

const ROLE_OPTIONS = Array.from(new Set([...TECH_ROLES, ...MARKET_ROLES])).sort((a, b) =>
  a.localeCompare(b)
);

const MONTH_OPTIONS = [
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
const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => String(currentYear + 3 - i));

function emptyExperience(): ExperienceFormItem {
  return {
    title: "",
    company: "",
    description: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    duration: "",
    techStack: "",
    isCurrent: false,
  };
}

function emptyEducation(): EducationFormItem {
  return {
    degreeLevel: "",
    major: "",
    university: "",
    graduationDate: "",
    gpa: "",
  };
}

function emptyForm(): ProfileFormState {
  return {
    fullName: "",
    email: "",
    educations: [emptyEducation()],
    citizenshipStatus: "",
    needsSponsorship: false,
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
    skills: [],
    experiences: [],
  };
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") return value;
  }
  return "";
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function normalizeSkills(values: unknown): SkillFormItem[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const skills: SkillFormItem[] = [];

  for (const raw of values) {
    let skillName = "";
    let proficiencyLevel = 3;

    if (typeof raw === "string") {
      skillName = raw;
    } else if (raw && typeof raw === "object") {
      const skillObj = raw as Record<string, unknown>;
      skillName = pickString(skillObj.skillName, skillObj.skill_name);
      if (typeof skillObj.proficiencyLevel === "number") {
        proficiencyLevel = skillObj.proficiencyLevel;
      }
    }

    const trimmed = skillName.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    skills.push({
      skillName: trimmed,
      proficiencyLevel: Math.max(1, Math.min(5, Math.round(proficiencyLevel || 3))),
    });
  }

  return skills;
}

function normalizeExperiences(values: unknown): ExperienceFormItem[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;

      const exp = raw as Record<string, unknown>;
      const isCurrent = Boolean(exp.isCurrent);

      const startDate = typeof exp.startDate === "string" ? exp.startDate : "";
      const [startYear = "", startMonthRaw = ""] = startDate.split("-");
      const startMonth = startMonthRaw ? startMonthRaw.padStart(2, "0") : "";

      const endDate = typeof exp.endDate === "string" ? exp.endDate : "";
      const [endYear = "", endMonthRaw = ""] = endDate.split("-");
      const endMonth = endMonthRaw ? endMonthRaw.padStart(2, "0") : "";

      return {
        title: pickString(exp.title).trim(),
        company: pickString(exp.company).trim(),
        description: pickString(exp.description),
        startMonth:
          startMonth && MONTH_OPTIONS.some((item) => item.value === startMonth) ? startMonth : "",
        startYear:
          startYear && YEAR_OPTIONS.includes(startYear)
            ? startYear
            : pickString(exp.year),
        endMonth:
          isCurrent || !endMonth || !MONTH_OPTIONS.some((item) => item.value === endMonth)
            ? ""
            : endMonth,
        endYear: isCurrent || !endYear || !YEAR_OPTIONS.includes(endYear) ? "" : endYear,
        duration: pickString(exp.duration),
        techStack: Array.isArray(exp.techStack)
          ? exp.techStack.filter((item): item is string => typeof item === "string").join(", ")
          : pickString(exp.techStack),
        isCurrent,
      };
    })
    .filter((item): item is ExperienceFormItem => item !== null);
}

function normalizeEducations(values: unknown): EducationFormItem[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;

      const edu = raw as Record<string, unknown>;
      const gpaValue = typeof edu.gpa === "number" ? String(edu.gpa) : pickString(edu.gpa);

      return {
        degreeLevel: pickString(edu.degreeLevel, edu.degree_level).trim(),
        major: pickString(edu.major).trim(),
        university: pickString(edu.university).trim(),
        graduationDate: pickString(edu.graduationDate, edu.graduation_date).split("T")[0],
        gpa: gpaValue.trim(),
      };
    })
    .filter((item): item is EducationFormItem => item !== null)
    .filter(
      (item) =>
        item.degreeLevel || item.major || item.university || item.graduationDate || item.gpa
    );
}

function createFormState(user?: UserProfile): ProfileFormState {
  const draft = signupDraft.get();
  const userRecord = (user ?? {}) as Record<string, unknown>;

  const sourceEducations =
    normalizeEducations(userRecord.educations ?? draft.educations ?? []).length > 0
      ? normalizeEducations(userRecord.educations ?? draft.educations ?? [])
      : [
          {
            degreeLevel: pickString(user?.degreeLevel, userRecord.degree_level, draft.degreeLevel),
            major: pickString(user?.major, userRecord.major, draft.major),
            university: pickString(user?.university, userRecord.university, draft.university),
            graduationDate: pickString(
              user?.graduationDate,
              userRecord.graduation_date,
              draft.graduationDate
            ).split("T")[0],
            gpa:
              user?.gpa != null
                ? String(user.gpa)
                : draft.gpa != null
                  ? String(draft.gpa)
                  : "",
          },
        ];

  const salaryRange =
    user?.salaryRange ??
    (draft.salaryRange
      ? {
          min: draft.salaryRange.min,
          max: draft.salaryRange.max,
          currency: draft.salaryRange.currency,
        }
      : undefined);

  const sourceSkills =
    Array.isArray(user?.skills) && user.skills.length > 0 ? user.skills : draft.skills ?? [];
  const sourceExperiences =
    Array.isArray(user?.experiences) && user.experiences.length > 0
      ? user.experiences
      : draft.experiences ?? [];

  return {
    fullName: pickString(user?.fullName, userRecord.full_name, draft.fullName),
    email: pickString(user?.email, userRecord.email, draft.email),
    educations: sourceEducations.length ? sourceEducations : [emptyEducation()],
    citizenshipStatus: pickString(
      user?.citizenshipStatus,
      userRecord.citizenship_status,
      draft.citizenshipStatus
    ),
    needsSponsorship:
      typeof user?.needsSponsorship === "boolean"
        ? user.needsSponsorship
        : typeof draft.needsSponsorship === "boolean"
          ? draft.needsSponsorship
          : false,
    targetRoles: normalizeStringArray(user?.targetRoles ?? draft.targetRoles ?? []),
    preferredLocations: normalizeStringArray(
      user?.preferredLocations ?? draft.preferredLocations ?? []
    ),
    remotePreference: pickString(
      user?.remotePreference,
      userRecord.remote_preference,
      draft.remotePreference
    ),
    industryPreferences: normalizeStringArray(
      user?.industryPreferences ?? draft.industryPreferences ?? []
    ),
    relocationWillingness:
      typeof user?.relocationWillingness === "boolean"
        ? user.relocationWillingness
        : typeof draft.relocationWillingness === "boolean"
          ? draft.relocationWillingness
          : false,
    salaryMin: salaryRange?.min != null ? String(salaryRange.min) : "",
    salaryMax: salaryRange?.max != null ? String(salaryRange.max) : "",
    linkedinUrl: pickString(user?.linkedinUrl, userRecord.linkedin_url, draft.linkedinUrl),
    githubUrl: pickString(user?.githubUrl, userRecord.github_url, draft.githubUrl),
    portfolioUrl: pickString(user?.portfolioUrl, userRecord.portfolio_url, draft.portfolioUrl),
    skills: normalizeSkills(sourceSkills),
    experiences: normalizeExperiences(sourceExperiences),
  };
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();

  const [form, setForm] = useState<ProfileFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [roleToAdd, setRoleToAdd] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [locationToAdd, setLocationToAdd] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [industryToAdd, setIndustryToAdd] = useState("");
  const [skillToAdd, setSkillToAdd] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    setForm(createFormState(user));
    const draft = signupDraft.get();
    setImagePreview(draft.profilePhoto ?? null);
  }, [user]);

  const availableRoles = useMemo(
    () =>
      ROLE_OPTIONS.filter(
        (role) => !form.targetRoles.some((selected) => selected.toLowerCase() === role.toLowerCase())
      ),
    [form.targetRoles]
  );

  const availableLocations = useMemo(
    () =>
      USA_LOCATIONS.filter(
        (location) =>
          !form.preferredLocations.some((selected) => selected.toLowerCase() === location.toLowerCase())
      ),
    [form.preferredLocations]
  );

  const availableIndustries = useMemo(
    () =>
      INDUSTRIES.filter(
        (industry) =>
          !form.industryPreferences.some((selected) => selected.toLowerCase() === industry.toLowerCase())
      ),
    [form.industryPreferences]
  );

  const availableSkills = useMemo(
    () =>
      TECH_SKILLS.filter(
        (skill) => !form.skills.some((selected) => selected.skillName.toLowerCase() === skill.toLowerCase())
      ),
    [form.skills]
  );

  function setField<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addArrayValue(
    field: "targetRoles" | "preferredLocations" | "industryPreferences",
    value: string
  ) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setForm((prev) => {
      const exists = prev[field].some((item) => item.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      return { ...prev, [field]: [...prev[field], trimmed] };
    });
  }

  function removeArrayValue(
    field: "targetRoles" | "preferredLocations" | "industryPreferences",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.toLowerCase() !== value.toLowerCase()),
    }));
  }

  function addSkill(rawSkillName: string) {
    const skillName = rawSkillName.trim();
    if (!skillName) return;

    setForm((prev) => {
      const exists = prev.skills.some((skill) => skill.skillName.toLowerCase() === skillName.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        skills: [...prev.skills, { skillName, proficiencyLevel: 3 }],
      };
    });
  }

  function updateSkillLevel(skillName: string, proficiencyLevel: number) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.skillName.toLowerCase() === skillName.toLowerCase()
          ? { ...skill, proficiencyLevel }
          : skill
      ),
    }));
  }

  function removeSkill(skillName: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.skillName.toLowerCase() !== skillName.toLowerCase()),
    }));
  }

  function addExperience() {
    setForm((prev) => ({
      ...prev,
      experiences: [...prev.experiences, emptyExperience()],
    }));
  }

  function removeExperience(index: number) {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  }

  function updateExperience(index: number, patch: Partial<ExperienceFormItem>) {
    setForm((prev) => {
      const next = [...prev.experiences];
      next[index] = { ...next[index], ...patch };
      return { ...prev, experiences: next };
    });
  }

  function addEducation() {
    setForm((prev) => ({
      ...prev,
      educations: [...prev.educations, emptyEducation()],
    }));
  }

  function removeEducation(index: number) {
    setForm((prev) => {
      const next = prev.educations.filter((_, i) => i !== index);
      return {
        ...prev,
        educations: next.length ? next : [emptyEducation()],
      };
    });
  }

  function updateEducation(index: number, patch: Partial<EducationFormItem>) {
    setForm((prev) => {
      const next = [...prev.educations];
      next[index] = { ...next[index], ...patch };
      return { ...prev, educations: next };
    });
  }

  function resetFromCurrentData() {
    setForm(createFormState(user));
    setError("");
    setSuccess("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const failWith = (message: string) => {
      setError(message);
      toast.error("Unable to save", { description: message });
    };

    if (!form.citizenshipStatus) {
      failWith("Please select citizenship/work authorization status.");
      return;
    }

    if (!form.remotePreference) {
      failWith("Please select a remote preference.");
      return;
    }

    const normalizedRoles = normalizeStringArray(form.targetRoles);
    if (!normalizedRoles.length) {
      failWith("Please add at least one target role.");
      return;
    }

    const normalizedLocations = normalizeStringArray(form.preferredLocations);
    if (!normalizedLocations.length) {
      failWith("Please add at least one preferred location.");
      return;
    }

    let educationValidationError = "";
    const normalizedEducations = form.educations.reduce<Education[]>((acc, education) => {
      const degreeLevel = education.degreeLevel.trim();
      const major = education.major.trim();
      const university = education.university.trim();
      const graduationDate = education.graduationDate.trim();

      const hasAnyValue =
        degreeLevel || major || university || graduationDate || education.gpa.trim();
      if (!hasAnyValue) return acc;

      if (!degreeLevel || !major || !university) {
        educationValidationError = "Each education entry must include degree level, major, and university.";
        return acc;
      }

      const mapped: Education = {
        degreeLevel,
        major,
        university,
      };

      if (graduationDate) mapped.graduationDate = graduationDate;

      const gpaRaw = education.gpa.trim();
      if (gpaRaw) {
        const gpaValue = Number(gpaRaw);
        if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
          educationValidationError = "Each education GPA must be between 0 and 4.";
          return acc;
        }
        mapped.gpa = gpaValue;
      }

      acc.push(mapped);
      return acc;
    }, []);

    if (educationValidationError) {
      failWith(educationValidationError);
      return;
    }

    if (!normalizedEducations.length) {
      failWith("Please add at least one education entry.");
      return;
    }

    const primaryEducation = normalizedEducations[0];

    const hasSalaryMin = form.salaryMin.trim().length > 0;
    const hasSalaryMax = form.salaryMax.trim().length > 0;
    if (hasSalaryMin !== hasSalaryMax) {
      failWith("Please provide both salary minimum and salary maximum.");
      return;
    }

    let salaryRange:
      | {
          min: number;
          max: number;
          currency: string;
        }
      | undefined;

    if (hasSalaryMin && hasSalaryMax) {
      const min = Number(form.salaryMin);
      const max = Number(form.salaryMax);

      if (Number.isNaN(min) || Number.isNaN(max)) {
        failWith("Salary values must be valid numbers.");
        return;
      }

      if (min > max) {
        failWith("Salary minimum cannot be greater than salary maximum.");
        return;
      }

      salaryRange = {
        min: Math.round(min),
        max: Math.round(max),
        currency: "USD",
      };
    }

    const normalizedIndustries = normalizeStringArray(form.industryPreferences);
    const normalizedSkills = normalizeSkills(form.skills);
    const normalizedExperiences = form.experiences.reduce<Experience[]>((acc, experience) => {
      const title = experience.title.trim();
      const company = experience.company.trim();
      if (!title || !company) return acc;

      const startMonth = experience.startMonth ? experience.startMonth.padStart(2, "0") : "";
      const startYear = experience.startYear.trim();
      const startDate = startYear && startMonth ? `${startYear}-${startMonth}-01` : undefined;

      const endMonth = experience.endMonth ? experience.endMonth.padStart(2, "0") : "";
      const endYear = experience.endYear.trim();
      const endDate =
        !experience.isCurrent && endYear && endMonth ? `${endYear}-${endMonth}-01` : undefined;

      const techStack = experience.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const mapped: Experience = {
        title,
        company,
        isCurrent: experience.isCurrent,
      };

      const description = experience.description.trim();
      if (description) mapped.description = description;

      const duration = experience.duration.trim();
      if (duration) mapped.duration = duration;

      if (techStack.length) mapped.techStack = techStack;
      if (startDate) mapped.startDate = startDate;
      if (endDate) mapped.endDate = endDate;

      acc.push(mapped);
      return acc;
    }, []);

    const payload: Record<string, unknown> = {
      fullName: form.fullName.trim() || undefined,
      email: form.email.trim() || undefined,
      degreeLevel: primaryEducation.degreeLevel,
      major: primaryEducation.major,
      university: primaryEducation.university,
      graduationDate: primaryEducation.graduationDate,
      gpa: primaryEducation.gpa,
      educations: normalizedEducations,
      citizenshipStatus: form.citizenshipStatus || undefined,
      needsSponsorship: form.needsSponsorship,
      targetRoles: normalizedRoles,
      preferredLocations: normalizedLocations,
      remotePreference: form.remotePreference || undefined,
      industryPreferences: normalizedIndustries,
      relocationWillingness: form.relocationWillingness,
      salaryRange,
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      githubUrl: form.githubUrl.trim() || undefined,
      portfolioUrl: form.portfolioUrl.trim() || undefined,
      skills: normalizedSkills,
      experiences: normalizedExperiences,
    };

    setSaving(true);

    try {
      await apiFetch(API.patchProfile, {
        method: "PATCH",
        body: JSON.stringify(payload),
        auth: true,
      });

      signupDraft.set({
        fullName: form.fullName.trim() || undefined,
        email: form.email.trim() || undefined,
        degreeLevel: primaryEducation.degreeLevel,
        major: primaryEducation.major,
        university: primaryEducation.university,
        graduationDate: primaryEducation.graduationDate,
        gpa: primaryEducation.gpa,
        educations: normalizedEducations,
        citizenshipStatus: form.citizenshipStatus || undefined,
        needsSponsorship: form.needsSponsorship,
        targetRoles: normalizedRoles,
        preferredLocations: normalizedLocations,
        remotePreference: form.remotePreference || undefined,
        industryPreferences: normalizedIndustries,
        relocationWillingness: form.relocationWillingness,
        salaryRange,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        skills: normalizedSkills,
        experiences: normalizedExperiences,
        profilePhoto: imagePreview,
      });

      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setSuccess("Profile updated successfully.");
      toast.success("Saved successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      setError(message);
      toast.error("Unable to save", { description: message });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <form onSubmit={handleSave} className="space-y-8">
        <GlassCard className="p-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full bg-surface border-4 border-surface shadow-elevated overflow-hidden">
                {imagePreview ? (
                  // imagePreview can be a user-uploaded data URL, which is better handled by a raw img tag.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-faint text-sm bg-surface-inset">
                    No Photo
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="absolute bottom-0 right-0 px-3 py-1 text-xs rounded-full bg-btn-primary-bg text-btn-primary-text"
              >
                Edit
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Citizenship / Work Authorization *</Label>
                <select
                  value={form.citizenshipStatus}
                  onChange={(event) => setField("citizenshipStatus", event.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="">Select status</option>
                  {CITIZENSHIP_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Needs Sponsorship</Label>
                <select
                  value={form.needsSponsorship ? "yes" : "no"}
                  onChange={(event) => setField("needsSponsorship", event.target.value === "yes")}
                  className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className="mt-4 space-y-2">
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetFromCurrentData} disabled={saving}>
              Reset Changes
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-5 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent-primary" />
            Education
          </h2>

          <div className="space-y-4">
            {form.educations.map((education, index) => (
              <div
                key={`education-${index}`}
                className="rounded-xl border border-border p-4 bg-surface-inset/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-heading">Education {index + 1}</p>
                  <Button type="button" variant="ghost" onClick={() => removeEducation(index)}>
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Degree Level *</Label>
                    <select
                      value={education.degreeLevel}
                      onChange={(event) =>
                        updateEducation(index, { degreeLevel: event.target.value })
                      }
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                      required={index === 0}
                    >
                      <option value="">Select degree level</option>
                      {DEGREE_LEVELS.map((degreeLevel) => (
                        <option key={degreeLevel} value={degreeLevel}>
                          {degreeLevel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Major / Concentration *</Label>
                    <Input
                      value={education.major}
                      onChange={(event) => updateEducation(index, { major: event.target.value })}
                      list="major-options"
                      placeholder="Computer Science"
                      className="mt-1"
                      required={index === 0}
                    />
                  </div>

                  <div>
                    <Label>University *</Label>
                    <Input
                      value={education.university}
                      onChange={(event) =>
                        updateEducation(index, { university: event.target.value })
                      }
                      list="university-options"
                      placeholder="Stanford University"
                      className="mt-1"
                      required={index === 0}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Graduation Date</Label>
                      <Input
                        type="date"
                        value={education.graduationDate}
                        onChange={(event) =>
                          updateEducation(index, { graduationDate: event.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>GPA (0 - 4)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={education.gpa}
                        onChange={(event) => updateEducation(index, { gpa: event.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={addEducation}>
              Add Education
            </Button>
          </div>

          <datalist id="major-options">
            {COMMON_MAJORS.map((major) => (
              <option key={major} value={major} />
            ))}
          </datalist>

          <datalist id="university-options">
            {USA_UNIVERSITIES.map((university) => (
              <option key={university} value={university} />
            ))}
          </datalist>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent-primary" />
            Career Preferences
          </h2>

          <div className="space-y-6">
            <div>
              <Label>Target Roles *</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-1">
                <select
                  value={roleToAdd}
                  onChange={(event) => setRoleToAdd(event.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select role to add</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={() => {
                    addArrayValue("targetRoles", roleToAdd);
                    setRoleToAdd("");
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-2">
                <Input
                  value={customRole}
                  onChange={(event) => setCustomRole(event.target.value)}
                  placeholder="Or add custom role"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    addArrayValue("targetRoles", customRole);
                    setCustomRole("");
                  }}
                >
                  Add Custom
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-2 rounded-full border border-tag-border bg-tag-bg px-3 py-1 text-sm text-tag-text"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeArrayValue("targetRoles", role)}
                      className="text-faint hover:text-red-400"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label>Preferred Locations *</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-1">
                <select
                  value={locationToAdd}
                  onChange={(event) => setLocationToAdd(event.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select location to add</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={() => {
                    addArrayValue("preferredLocations", locationToAdd);
                    setLocationToAdd("");
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-2">
                <Input
                  value={customLocation}
                  onChange={(event) => setCustomLocation(event.target.value)}
                  placeholder="Or add custom location"
                />

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    addArrayValue("preferredLocations", customLocation);
                    setCustomLocation("");
                  }}
                >
                  Add Custom
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-2 rounded-full border border-tag-border bg-tag-bg px-3 py-1 text-sm text-tag-text"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeArrayValue("preferredLocations", location)}
                      className="text-faint hover:text-red-400"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Remote Preference *</Label>
                <select
                  value={form.remotePreference}
                  onChange={(event) => setField("remotePreference", event.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                  required
                >
                  <option value="">Select preference</option>
                  {REMOTE_PREFERENCES.map((preference) => (
                    <option key={preference.value} value={preference.value}>
                      {preference.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Relocation Willingness</Label>
                <select
                  value={form.relocationWillingness ? "yes" : "no"}
                  onChange={(event) => setField("relocationWillingness", event.target.value === "yes")}
                  className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="no">Not willing</option>
                  <option value="yes">Willing</option>
                </select>
              </div>

              <div>
                <Label>Expected Salary (USD)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={form.salaryMin}
                    onChange={(event) => setField("salaryMin", event.target.value)}
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={(event) => setField("salaryMax", event.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Industry Preferences</Label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-1">
                <select
                  value={industryToAdd}
                  onChange={(event) => setIndustryToAdd(event.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select industry to add</option>
                  {availableIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={() => {
                    addArrayValue("industryPreferences", industryToAdd);
                    setIndustryToAdd("");
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.industryPreferences.map((industry) => (
                  <span
                    key={industry}
                    className="inline-flex items-center gap-2 rounded-full border border-tag-border bg-tag-bg px-3 py-1 text-sm text-tag-text"
                  >
                    {industry}
                    <button
                      type="button"
                      onClick={() => removeArrayValue("industryPreferences", industry)}
                      className="text-faint hover:text-red-400"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-accent-primary" />
            Experience
          </h2>

          <div className="space-y-4">
            {form.experiences.length === 0 ? <p className="text-sm text-faint">No experience added yet.</p> : null}

            {form.experiences.map((experience, index) => (
              <div
                key={`experience-${index}`}
                className="rounded-xl border border-border p-4 bg-surface-inset/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-heading">Experience {index + 1}</p>
                  <Button type="button" variant="ghost" onClick={() => removeExperience(index)}>
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={experience.title}
                      onChange={(event) => updateExperience(index, { title: event.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={experience.company}
                      onChange={(event) => updateExperience(index, { company: event.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Start Month</Label>
                    <select
                      value={experience.startMonth}
                      onChange={(event) =>
                        updateExperience(index, { startMonth: event.target.value })
                      }
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select month</option>
                      {MONTH_OPTIONS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Start Year</Label>
                    <select
                      value={experience.startYear}
                      onChange={(event) =>
                        updateExperience(index, { startYear: event.target.value })
                      }
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Currently Working Here</Label>
                  <select
                    value={experience.isCurrent ? "yes" : "no"}
                    onChange={(event) => {
                      const isCurrent = event.target.value === "yes";
                      updateExperience(index, {
                        isCurrent,
                        ...(isCurrent ? { endMonth: "", endYear: "" } : {}),
                      });
                    }}
                    className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>End Month</Label>
                    <select
                      value={experience.endMonth}
                      onChange={(event) => updateExperience(index, { endMonth: event.target.value })}
                      disabled={experience.isCurrent}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-60"
                    >
                      <option value="">{experience.isCurrent ? "Present" : "Select month"}</option>
                      {MONTH_OPTIONS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>End Year</Label>
                    <select
                      value={experience.endYear}
                      onChange={(event) => updateExperience(index, { endYear: event.target.value })}
                      disabled={experience.isCurrent}
                      className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-60"
                    >
                      <option value="">{experience.isCurrent ? "Present" : "Select year"}</option>
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Description</Label>
                  <Textarea
                    value={experience.description}
                    onChange={(event) => updateExperience(index, { description: event.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Tech Stack (comma separated)</Label>
                    <Input
                      value={experience.techStack}
                      onChange={(event) => updateExperience(index, { techStack: event.target.value })}
                      placeholder="React, Node.js, PostgreSQL"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={experience.duration}
                      onChange={(event) => updateExperience(index, { duration: event.target.value })}
                      placeholder="2 years"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="secondary" onClick={addExperience}>
              Add Experience
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-5 flex items-center gap-2">
            <Code className="w-4 h-4 text-accent-primary" />
            Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            <select
              value={skillToAdd}
              onChange={(event) => setSkillToAdd(event.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Select skill to add</option>
              {availableSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={() => {
                addSkill(skillToAdd);
                setSkillToAdd("");
              }}
            >
              Add
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-2">
            <Input
              value={customSkill}
              onChange={(event) => setCustomSkill(event.target.value)}
              placeholder="Or add custom skill"
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                addSkill(customSkill);
                setCustomSkill("");
              }}
            >
              Add Custom
            </Button>
          </div>

          <div className="space-y-3 mt-4">
            {form.skills.map((skill) => (
              <div
                key={skill.skillName}
                className="flex flex-col md:flex-row md:items-center gap-2 rounded-xl border border-border bg-surface-inset/50 p-3"
              >
                <div className="font-medium text-heading flex-1">{skill.skillName}</div>
                <select
                  value={String(skill.proficiencyLevel)}
                  onChange={(event) => updateSkillLevel(skill.skillName, Number(event.target.value))}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm md:w-44"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level.value} value={String(level.value)}>
                      {level.label} ({level.value})
                    </option>
                  ))}
                </select>
                <Button type="button" variant="ghost" onClick={() => removeSkill(skill.skillName)}>
                  Remove
                </Button>
              </div>
            ))}

            {form.skills.length === 0 ? <p className="text-sm text-faint">No skills added yet.</p> : null}
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-5 flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-accent-primary" />
            Profile Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input
                type="url"
                value={form.linkedinUrl}
                onChange={(event) => setField("linkedinUrl", event.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1"
              />
            </div>

            <div>
              <Label>GitHub URL</Label>
              <Input
                type="url"
                value={form.githubUrl}
                onChange={(event) => setField("githubUrl", event.target.value)}
                placeholder="https://github.com/yourusername"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Portfolio URL</Label>
              <Input
                type="url"
                value={form.portfolioUrl}
                onChange={(event) => setField("portfolioUrl", event.target.value)}
                placeholder="https://yourportfolio.dev"
                className="mt-1"
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={resetFromCurrentData} disabled={saving}>
            Reset Changes
          </Button>
          {success ? (
            <span className="text-sm text-emerald-400">{success}</span>
          ) : null}
          {error ? (
            <span className="text-sm text-red-400">{error}</span>
          ) : null}
        </div>
      </form>

      {showModal ? (
        <ProfilePhotoModal onClose={() => setShowModal(false)} onSelect={(image) => setImagePreview(image)} />
      ) : null}
    </div>
  );
}