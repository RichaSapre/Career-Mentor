import type { Experience, Skill, SalaryRange } from "@/lib/api/types";

export type SignupDraft = {
  fullName?: string;
  email?: string;
  password?: string;
  profilePhoto?: string | null;

  // Education (API: degreeLevel, major, university, graduationDate, gpa)
  degreeLevel?: string;
  major?: string;
  university?: string;
  graduationDate?: string;
  gpa?: number;

  // Citizenship & Sponsorship
  citizenshipStatus?: string;
  needsSponsorship?: boolean;

  // Skills (API: { skillName, proficiencyLevel }[])
  skills?: Skill[];

  // Experiences
  experiences?: Experience[];

  // Career Preferences
  targetRoles?: string[];
  preferredLocations?: string[];
  remotePreference?: string;
  industryPreferences?: string[];
  relocationWillingness?: boolean;

  // Salary & Links
  salaryRange?: SalaryRange;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
};

const KEY = "signupDraft";

export const signupDraft = {
  get(): SignupDraft {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  },

  set(partial: Partial<SignupDraft>) {
    const current = this.get();
    const updated = { ...current, ...partial };
    localStorage.setItem(KEY, JSON.stringify(updated));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};
