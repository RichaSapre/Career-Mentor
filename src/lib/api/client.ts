import { tokenStore } from "@/lib/auth/tokenStore";
import { API } from "./endpoints";
import type { MarketAnalyzerResponse, RecommendationItem, Tokens, UserProfile } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const DEMO_MODE = (process.env.NEXT_PUBLIC_DEMO_MODE ?? "false").toLowerCase() === "true";

/**
 * Demo/mocked data for UI-only walkthroughs
 */
const demoTokens: Tokens = {
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
};

const demoUser: UserProfile = {
  user_id: "demo-user",
  full_name: "Richa Sapre",
  email: "demo@careermentor.app",
  profile_status: "complete",
  degree_level: "Masters",
  major: "Computer Science",
  university: "CSU East Bay",
  graduation_date: "2026-05-15",
  skills: [
    { skill_name: "Python", proficiency_level: 4 },
    { skill_name: "SQL", proficiency_level: 4 },
    { skill_name: "React", proficiency_level: 3 },
    { skill_name: "Data Analysis", proficiency_level: 4 },
  ],
  experiences: [
    {
      title: "Student Developer",
      company: "University Project",
      description: "Built an airline booking system and worked on UI modules.",
      tech_stack: ["C++", "SQL"],
    },
  ],
};

const demoRecommendations: RecommendationItem[] = [
  {
    role_id: "role-1",
    role_title: "Data Analyst",
    fit_score: 85,
    demand_score: 78,
    competition_score: 55,
    trend_direction: "up",
    top_required_skills: ["SQL", "Python", "Excel", "Data Visualization"],
    missing_skills: ["Tableau"],
    average_salary: "$85k–$110k",
    top_locations: ["San Francisco", "Seattle", "Austin"],
    explanation: "Strong match based on your Python + SQL + analysis skills.",
    matching_skills_count: 4,
  },
  {
    role_id: "role-2",
    role_title: "Software Engineer",
    fit_score: 74,
    demand_score: 82,
    competition_score: 70,
    trend_direction: "stable",
    top_required_skills: ["DSA", "JavaScript", "React", "APIs"],
    missing_skills: ["DSA practice"],
    average_salary: "$100k–$140k",
    top_locations: ["San Jose", "New York", "Remote"],
    explanation: "Good fit, but strengthen DSA to improve competitiveness.",
    matching_skills_count: 4,
  },
];

const demoMarket: MarketAnalyzerResponse = {
  job_title: "Data Analyst",
  job_posting_count: 1240,
  trend_series: [
    { date: "2025-10", count: 820 },
    { date: "2025-11", count: 910 },
    { date: "2025-12", count: 970 },
    { date: "2026-01", count: 1120 },
    { date: "2026-02", count: 1240 },
  ],
  top_skills: [
    { skill: "SQL", count: 880 },
    { skill: "Excel", count: 760 },
    { skill: "Python", count: 640 },
    { skill: "Tableau", count: 520 },
    { skill: "Statistics", count: 480 },
  ],
};

function isAuthPath(path: string) {
  return path.startsWith("/auth/");
}

function mockResponseFor<T>(path: string): T {
  // AUTH
  if (path === API.loginSendOtp) return { ok: true } as unknown as T;
  if (path === API.verifyLoginOtp) {
    tokenStore.set(demoTokens);
    return demoTokens as unknown as T;
  }
  if (path === API.refreshToken) return demoTokens as unknown as T;
  if (path === API.getUserDetails) return demoUser as unknown as T;
  if (path === API.logout) return { ok: true } as unknown as T;

  // PROFILE
  if (path === API.updateProfile) {
    // Return "updated" user for UI
    return { ...demoUser, profile_status: "complete" } as unknown as T;
  }

  // RECOMMENDATIONS / MARKET
  if (path === API.recommendations) return demoRecommendations as unknown as T;
  if (path.startsWith(API.marketAnalyzer)) return demoMarket as unknown as T;

  // Default safe fallback
  return {} as T;
}

async function tryRealFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...rest } = options;

  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (auth) {
    const access = tokenStore.getAccess();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

/**
 * apiFetch:
 * - If DEMO_MODE=true: always return mock data
 * - If DEMO_MODE=false: try real backend; if it fails, fall back to mock to keep UI navigable
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  if (DEMO_MODE) {
    // In demo mode, also ensure tokens exist so "protected" pages feel normal
    if (!tokenStore.getAccess()) tokenStore.set(demoTokens);
    return mockResponseFor<T>(path);
  }

  try {
    return await tryRealFetch<T>(path, options);
  } catch (e) {
    // fallback for UI demo (keeps navigation working)
    console.warn("[apiFetch] Falling back to demo response for:", path, e);
    if (!tokenStore.getAccess() && isAuthPath(path)) tokenStore.set(demoTokens);
    return mockResponseFor<T>(path);
  }
}
