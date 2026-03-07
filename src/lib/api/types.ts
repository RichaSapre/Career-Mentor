export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type Skill = {
  skillName: string;
  proficiencyLevel?: number; // 1-5
};

export type Experience = {
  title: string;
  company: string;
  duration?: string;
  description?: string;
  techStack?: string[];
  startDate?: string;
  isCurrent?: boolean;
};

export type SalaryRange = {
  min: number;
  max: number;
  currency: string;
};

// Mirrors the camelCase keys used in supernova.json examples
export type UserProfile = {
  userId?: string;
  fullName?: string;
  email?: string;

  degreeLevel?: "Bachelors" | "Masters" | "PhD" | string;
  major?: string;
  university?: string;
  graduationDate?: string;
  gpa?: number;

  citizenshipStatus?: string;
  needsSponsorship?: boolean;
  visaType?: string;

  skills?: Skill[];
  experiences?: Experience[];

  targetRoles?: string[];
  preferredLocations?: string[];
  remotePreference?: string;
  industryPreferences?: string[];
  salaryRange?: SalaryRange;
  relocationWillingness?: boolean;

  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;

  profileStatus?: "incomplete" | "complete";
};

export type RecommendationItem = {
  roleId: string;
  roleTitle: string;
  fitScore: number;
  demandScore?: number;
  competitionScore?: number;
  trendDirection?: "up" | "down" | "stable";
  topRequiredSkills?: string[];
  missingSkills?: string[];
  averageSalary?: string;
  topLocations?: string[];
  sponsorshipLikelihood?: string;
  explanation?: string;
  matchingSkillsCount?: number;
};

export type MarketAnalyzerResponse = {
  jobTitle: string;
  jobPostingCount: number;
  trendSeries: { date: string; count: number }[];
  topSkills: { skill: string; count: number }[]; // top 5
};
