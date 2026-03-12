export const DEGREE_LEVELS = [
  "High School",
  "Associate",
  "Bachelors",
  "Masters",
  "PhD",
  "Other",
] as const;

// API values must match backend validation - update if your backend expects different enums
export const CITIZENSHIP_STATUSES = [
  { value: "us_citizen", label: "US Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "h1b", label: "H-1B" },
  { value: "f1_opt", label: "F-1/OPT" },
  { value: "other", label: "Other Work Authorization" },
  { value: "need_sponsorship", label: "Need Sponsorship" },
] as const;

export const REMOTE_PREFERENCES = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const INDUSTRIES = [
  "Technology",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "Education",
  "Finance",
  "Consulting",
  "Manufacturing",
  "Media",
  "Other",
] as const;

export const PROFICIENCY_LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Elementary" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
] as const;
