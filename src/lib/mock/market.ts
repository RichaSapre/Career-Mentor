import type { MarketAnalyzerResponse } from "@/lib/api/types";

const MARKET_SKILLS: Record<string, string[]> = {
  "data analyst": ["SQL", "Excel", "Tableau", "Python", "Statistics"],
  "software engineer": ["Git", "Algorithms", "Testing", "System Design", "Java"],
  "frontend engineer": ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
  "backend engineer": ["APIs", "Databases", "Node.js", "System Design", "Python"],
  "machine learning engineer": ["Python", "ML", "Pandas", "Statistics", "Model Training"],
};

function seeded(n: number) {
  let x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

export function mockMarketAnalyzer(jobTitle: string): MarketAnalyzerResponse {
  const key = jobTitle.trim().toLowerCase();
  const topSkills = (MARKET_SKILLS[key] ?? ["Communication", "Problem Solving", "Teamwork", "Git", "Documentation"]).slice(0, 5);

  // 12 weeks of posting counts
  const now = new Date();
  const trendSeries: { date: string; count: number }[] = [];
  let base = 80 + Math.floor(seeded(key.length) * 60);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    const bump = Math.floor(seeded(i + key.length) * 25);
    const count = base + bump - Math.floor(i * 1.2);
    trendSeries.push({ date: d.toISOString().slice(0, 10), count: Math.max(10, count) });
  }

  const topSkillsWithCounts = topSkills.map((s, idx) => ({
    skill: s,
    count: Math.floor(35 + seeded(idx + key.length) * 90),
  }));

  const jobPostingCount = trendSeries[trendSeries.length - 1]?.count ?? base;

  return {
    jobTitle,
    jobPostingCount,
    trendSeries,
    topSkills: topSkillsWithCounts,
  };
}
