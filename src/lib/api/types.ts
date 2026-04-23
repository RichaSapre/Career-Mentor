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
  endDate?: string;
  isCurrent?: boolean;
};

export type Education = {
  degreeLevel: string;
  major: string;
  university: string;
  graduationDate?: string;
  gpa?: number;
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
  educations?: Education[];

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

/** Complete signup payload matching backend API */
export type SignupPayload = {
  email: string;
  password: string;
  fullName: string;
  degreeLevel: string;
  major: string;
  university: string;
  graduationDate: string;
  gpa?: number;
  citizenshipStatus: string;
  needsSponsorship: boolean;
  skills: { skillName: string; proficiencyLevel: number }[];
  experiences: Experience[];
  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: string;
  industryPreferences: string[];
  salaryRange?: { min: number; max: number; currency: string };
  relocationWillingness: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
};

/** Full market analysis API response */
export type MarketAnalysisResponse = {
  role: string;
  totalJobs: number;
  demandScore: number;
  marketStatus: string;
  trendDirection: string;
  weeklyDemand: { week: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  topLocations: { location: string; count: number }[];
  topCompanies: { company: string | null; count: number }[];
  remoteShare: number;
  salaryRange: { avgMin: number; avgMax: number };
  aiAnalysis: string;
};

/** AI Career Plan Generation Response */
export type CareerPlanResponse = {
  recommendation: {
    userId: string;
    generatedAt: string;
    executiveSummary: string;
    roleRankings: Array<{
      role: string;
      overallScore: number;
      tier: string;
      reasoning: string;
      marketInsights: {
        demand: number;
        avgSalary: number;
        topLocations: string[];
        topCompanies: (string | null)[];
      };
      skillGap: {
        readySkills: string[];
        gapSkills: string[];
        timeToReady: string;
      };
      nextActions: string[];
    }>;
    actionPlan: {
      phases: Array<{
        name: string;
        duration: string;
        goals: string[];
        tasks: string[];
        milestones: string[];
      }>;
      totalDuration: string;
      criticalPath: string[];
      weeklyCommitmentHours: number;
      successMetrics: string[];
    };
    keyFactors: any[];
    confidenceMetrics: {
      overall: number;
      dataQuality: number;
      agentAgreement: number;
      analysisDepth: number;
    };
    warnings: string[];
    debateSummary: {
      totalRounds: number;
      consensusReached: boolean;
      agreementScore: number;
      keyDebatePoints: string[];
    };
    nextSteps: Array<{
      step: string;
      priority: string;
      timeline: string;
    }>;
    sources: Array<{
      source: string;
      type: string;
      confidence: number;
    }>;
  };
};
