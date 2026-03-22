export const DEGREE_LEVELS = [
  "Associate",
  "Bachelors",
  "Masters",
  "PhD",
  "Bootcamp",
  "Other",
] as const;

// USA-specific visa/work authorization types for international students
export const CITIZENSHIP_STATUSES = [
  { value: "US Citizen", label: "US Citizen" },
  { value: "Green Card", label: "Green Card" },
  { value: "Work Visa", label: "Work Visa" },
  { value: "Student Visa", label: "Student Visa" },
  { value: "No Authorization", label: "No Authorization" },
  { value: "Other", label: "Other" },
] as const;

export const REMOTE_PREFERENCES = [
  { value: "Remote Only", label: "Remote" },
  { value: "On-site", label: "On-site" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Flexible", label: "Flexible" },
] as const;

export const INDUSTRIES = [
  "Technology",
  "AI / Machine Learning",
  "Fintech",
  "Healthcare / HealthTech",
  "E-commerce",
  "Cybersecurity",
  "Cloud Computing / SaaS",
  "Blockchain / Web3",
  "Education / EdTech",
  "Finance / Banking",
  "Consulting",
  "Robotics / IoT",
  "Gaming / AR / VR",
  "Telecom / Networking",
  "Manufacturing / Hardware",
  "Media / Entertainment",
  "Government / Defense Tech",
  "Other",
] as const;

export const PROFICIENCY_LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Elementary" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
] as const;

// Common tech majors for international students at US universities
export const COMMON_MAJORS = [
  "Computer Science",
  "Data Science",
  "Information Technology",
  "Software Engineering",
  "Computer Engineering",
  "Electrical Engineering",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Information Systems",
  "Applied Mathematics",
  "Statistics",
  "Bioinformatics",
  "Computational Biology",
  "Robotics",
  "Human-Computer Interaction",
  "Cloud Computing",
  "Network Engineering",
  "Business Analytics",
  "Quantitative Finance",
  "Other",
] as const;
