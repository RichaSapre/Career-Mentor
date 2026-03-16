export const DEGREE_LEVELS = [
  "High School",
  "Associate",
  "Bachelors",
  "Masters",
  "PhD",
  "Other",
] as const;

// Values must match backend validation exactly (authValidation.ts)
export const CITIZENSHIP_STATUSES = [
  { value: "US Citizen", label: "US Citizen" },
  { value: "Green Card", label: "Permanent Resident" },
  { value: "Work Visa", label: "H-1B / Work Visa" },
  { value: "Student Visa", label: "F-1/OPT" },
  { value: "No Authorization", label: "Need Sponsorship" },
  { value: "Other", label: "Other Work Authorization" },
] as const;

export const REMOTE_PREFERENCES = [
  { value: "Remote Only", label: "Remote" },
  { value: "On-site", label: "On-site" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Flexible", label: "Flexible" },
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
