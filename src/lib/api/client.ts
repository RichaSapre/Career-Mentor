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
  userId: "demo-user",
  fullName: "Richa Sapre",
  email: "demo@careermentor.app",
  profileStatus: "complete",
  degreeLevel: "Masters",
  major: "Computer Science",
  university: "CSU East Bay",
  graduationDate: "2026-05-15",
  skills: [
    { skillName: "Python", proficiencyLevel: 4 },
    { skillName: "SQL", proficiencyLevel: 4 },
    { skillName: "React", proficiencyLevel: 3 },
    { skillName: "Data Analysis", proficiencyLevel: 4 },
  ],
  experiences: [
    {
      title: "Student Developer",
      company: "University Project",
      description: "Built an airline booking system and worked on UI modules.",
      techStack: ["C++", "SQL"],
    },
  ],
};

const demoRecommendations: RecommendationItem[] = [
  {
    roleId: "role-1",
    roleTitle: "Data Analyst",
    fitScore: 85,
    demandScore: 78,
    competitionScore: 55,
    trendDirection: "up",
    topRequiredSkills: ["SQL", "Python", "Excel", "Data Visualization"],
    missingSkills: ["Tableau"],
    averageSalary: "$85k–$110k",
    topLocations: ["San Francisco", "Seattle", "Austin"],
    explanation: "Strong match based on your Python + SQL + analysis skills.",
    matchingSkillsCount: 4,
  },
  {
    roleId: "role-2",
    roleTitle: "Software Engineer",
    fitScore: 74,
    demandScore: 82,
    competitionScore: 70,
    trendDirection: "stable",
    topRequiredSkills: ["DSA", "JavaScript", "React", "APIs"],
    missingSkills: ["DSA practice"],
    averageSalary: "$100k–$140k",
    topLocations: ["San Jose", "New York", "Remote"],
    explanation: "Good fit, but strengthen DSA to improve competitiveness.",
    matchingSkillsCount: 4,
  },
];

const demoMarket: MarketAnalyzerResponse = {
  jobTitle: "Data Analyst",
  jobPostingCount: 1240,
  trendSeries: [
    { date: "2025-10", count: 820 },
    { date: "2025-11", count: 910 },
    { date: "2025-12", count: 970 },
    { date: "2026-01", count: 1120 },
    { date: "2026-02", count: 1240 },
  ],
  topSkills: [
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
  if (path === API.signupComplete || path === API.signupMinimal) {
    tokenStore.set(demoTokens);
    return demoTokens as unknown as T;
  }
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
    return { ...demoUser, profileStatus: "complete" } as unknown as T;
  }

  // RECOMMENDATIONS / MARKET
  if (path === API.recommendedRoles) return demoRecommendations as unknown as T;
  if (path.startsWith(API.marketAnalyzer)) return demoMarket as unknown as T;

  // Default safe fallback
  return {} as T;
}

type RefreshResponse = { accessToken?: string; refreshToken?: string; tokens?: Tokens };

async function doRefreshToken(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}${API.refreshToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as RefreshResponse;
    const accessToken = data?.accessToken ?? data?.tokens?.accessToken;
    const refreshToken = data?.refreshToken ?? data?.tokens?.refreshToken;

    if (accessToken && refreshToken) {
      tokenStore.set({ accessToken, refreshToken });
      return true;
    }
  } catch {
    // refresh failed
  }
  // Session expired: clear tokens so user is prompted to log in again
  tokenStore.clear();
  if (typeof window !== "undefined") window.location.replace("/welcome");
  return false;
}

async function tryRealFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
  isRetry = false
): Promise<T> {
  const { auth = true, ...rest } = options;

  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (auth) {
    const access = tokenStore.getAccess();
    if (access) headers.set("Authorization", `Bearer ${access}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

  // On 401 Unauthorized: try refresh token, then retry (only for auth requests, not the refresh endpoint itself)
  if (res.status === 401 && auth && path !== API.refreshToken && !isRetry) {
    const refreshed = await doRefreshToken();
    if (refreshed) {
      return tryRealFetch<T>(path, options, true);
    }
  }

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
    // Never fall back to mock for auth - user must see real errors (wrong OTP, signup failed, etc.)
    if (
      path === API.loginSendOtp ||
      path === API.verifyLoginOtp ||
      path === API.signupComplete ||
      path === API.signupMinimal
    ) {
      throw e;
    }
    // fallback for UI demo (keeps navigation working)
    console.warn("[apiFetch] Falling back to demo response for:", path, e);
    if (!tokenStore.getAccess() && isAuthPath(path)) tokenStore.set(demoTokens);
    return mockResponseFor<T>(path);
  }
}
