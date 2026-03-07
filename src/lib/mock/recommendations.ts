import type { RecommendationItem } from "@/lib/api/types";

const ROLE_SKILLS: Array<{ roleId: string; roleTitle: string; skills: string[] }> = [
  { roleId: "data-analyst", roleTitle: "Data Analyst", skills: ["SQL", "Excel", "Python", "Tableau", "Statistics", "Data Cleaning", "Power BI"] },
  { roleId: "software-engineer", roleTitle: "Software Engineer", skills: ["Data Structures", "Algorithms", "Git", "Java", "C++", "Python", "Testing"] },
  { roleId: "frontend-engineer", roleTitle: "Frontend Engineer", skills: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Testing", "Git"] },
  { roleId: "backend-engineer", roleTitle: "Backend Engineer", skills: ["Node.js", "Databases", "APIs", "System Design", "Python", "Java", "Git"] },
  { roleId: "ml-engineer", roleTitle: "Machine Learning Engineer", skills: ["Python", "ML", "Statistics", "Pandas", "Model Training", "Data Pipelines", "SQL"] },
  { roleId: "devops", roleTitle: "DevOps / Cloud Engineer", skills: ["Linux", "Docker", "CI/CD", "Cloud", "Kubernetes", "Monitoring", "Networking"] },
  { roleId: "qa", roleTitle: "QA / SDET", skills: ["Testing", "Automation", "Selenium", "API Testing", "Git", "Java", "CI/CD"] },
  { roleId: "product", roleTitle: "Product Manager", skills: ["Communication", "User Research", "Roadmapping", "Analytics", "Stakeholders", "Writing", "Prioritization"] },
];

function normalize(s?: string) {
  return (s ?? "").trim().toLowerCase();
}


export function getRecommendationsFromSkills(userSkills: string[]): RecommendationItem[] {
  const userSet = new Set(userSkills.map(normalize));

  const recs = ROLE_SKILLS.map((r) => {
    const required = r.skills;
    const matches = required.filter((sk) => userSet.has(normalize(sk)));
    const matchCount = matches.length;

    const fitScore = Math.min(100, Math.round((matchCount / Math.max(required.length, 1)) * 100));
    const missing = required.filter((sk) => !userSet.has(normalize(sk))).slice(0, 6);

    return {
      roleId: r.roleId,
      roleTitle: r.roleTitle,
      fitScore,
      topRequiredSkills: required.slice(0, 6),
      missingSkills: missing,
      matchingSkillsCount: matchCount,
      trendDirection: "stable" as const,
      explanation:
        matchCount >= 4
          ? `You match ${matchCount} key skills for this role.`
          : `Add more relevant skills to unlock this role (currently ${matchCount} matches).`,
    } satisfies RecommendationItem;
  });

  // Rule: recommend only if at least 4 skills match
  return recs
    .filter((r) => (r.matchingSkillsCount ?? 0) >= 4)
    .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));
}
