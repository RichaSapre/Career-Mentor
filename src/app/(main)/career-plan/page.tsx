"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BrainCircuit,
  Target,
  Clock,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  MapPin,
  Building2,
  Zap,
  Bot,
  Check,
  ChevronsUpDown,
  X,
  Search
} from "lucide-react";
import { GlassCard } from "@/components/glass/GlassCard";
import { useMe } from "@/features/auth/hooks";
import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { CareerPlanResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { MARKET_ROLES } from "@/lib/data/marketRoles";

function getTierColor(tier: string) {
  if (tier.toLowerCase().includes("high")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (tier.toLowerCase().includes("exploratory")) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-badge-info-text bg-badge-info-bg border-badge-info-border";
}

function formatCurrency(n: number) {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n.toLocaleString()}`;
}

function removeExecutiveSummaryHeading(summary: string) {
  const normalized = summary.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  let index = 0;
  while (index < lines.length && lines[index].trim().length === 0) {
    index += 1;
  }

  if (index >= lines.length) {
    return normalized.trim();
  }

  const firstLine = lines[index].trim();
  const plainFirstLine = firstLine
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\*\*(.*)\*\*$/, "$1")
    .replace(/^__(.*)__$/, "$1")
    .trim();

  if (/^executive summary\b/i.test(plainFirstLine)) {
    index += 1;
    while (index < lines.length && lines[index].trim().length === 0) {
      index += 1;
    }
    return lines.slice(index).join("\n").trim();
  }

  return normalized.trim();
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function readFirstString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const normalized = normalizeText(value);
      if (normalized) return normalized;
    }
  }
  return null;
}

function formatDebatePoint(item: unknown): string | null {
  if (typeof item === "string") {
    const normalized = normalizeText(item);
    return normalized || null;
  }

  if (!isRecord(item)) return null;

  const agent = readFirstString(item, [
    "agent",
    "agentName",
    "speaker",
    "role",
    "name",
    "persona",
  ]);

  const message = readFirstString(item, [
    "point",
    "summary",
    "text",
    "argument",
    "message",
    "content",
    "reasoning",
    "analysis",
    "details",
    "insight",
  ]);

  if (agent && message) return `${agent}: ${message}`;
  if (message) return message;

  return null;
}

function extractDebatePoints(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => normalizeText(line))
      .filter(Boolean);
  }

  if (isRecord(value)) {
    const directPoint = formatDebatePoint(value);
    const nestedValues = [
      value.points,
      value.debatePoints,
      value.keyPoints,
      value.messages,
      value.arguments,
      value.entries,
      value.rounds,
      value.summary,
      value.text,
      value.content,
    ];

    const nestedPoints = nestedValues.flatMap((nested) => extractDebatePoints(nested));
    if (directPoint) nestedPoints.unshift(directPoint);
    return Array.from(new Set(nestedPoints));
  }

  if (!Array.isArray(value)) return [];

  const points: string[] = [];

  for (const item of value) {
    const directPoint = formatDebatePoint(item);
    if (directPoint) {
      points.push(directPoint);
      continue;
    }

    if (!isRecord(item)) continue;

    const nestedArrays = [
      item.points,
      item.debatePoints,
      item.keyPoints,
      item.messages,
      item.arguments,
      item.entries,
    ];

    for (const nested of nestedArrays) {
      points.push(...extractDebatePoints(nested));
    }
  }

  return Array.from(new Set(points));
}

function scoreDebatePoints(points: string[]) {
  if (points.length === 0) return -Infinity;

  const totalLength = points.reduce((sum, point) => sum + point.length, 0);
  const averageLength = totalLength / points.length;
  const punctuationRatio = points.filter((point) => /[.!?]["')\]]?\s*$/.test(point)).length / points.length;
  const agentPrefixRatio = points.filter((point) => /^[A-Za-z][A-Za-z\s&\/-]{2,40}:\s/.test(point)).length / points.length;

  return averageLength + punctuationRatio * 30 + agentPrefixRatio * 40 + Math.min(points.length, 8) * 3;
}

function getBestDebatePoints(plan: CareerPlanResponse["recommendation"] | null): string[] {
  if (!plan) return [];

  const rawPlan = plan as unknown as UnknownRecord;
  const rawDebateSummary = isRecord(rawPlan.debateSummary) ? rawPlan.debateSummary : null;

  const candidateSources: unknown[] = [
    rawDebateSummary?.keyDebatePoints,
    rawDebateSummary?.detailedDebatePoints,
    rawDebateSummary?.fullDebatePoints,
    rawDebateSummary?.debatePoints,
    rawDebateSummary?.agentDebatePoints,
    rawDebateSummary?.agentPerspectives,
    rawDebateSummary?.roundSummaries,
    rawDebateSummary?.debateLog,
    rawDebateSummary?.fullDebateLog,
    rawDebateSummary?.summary,
    rawDebateSummary?.text,
    rawPlan.keyFactors,
  ];

  const candidates = candidateSources
    .map((source) => extractDebatePoints(source))
    .filter((candidate) => candidate.length > 0);

  if (candidates.length === 0) {
    return Array.isArray(plan.debateSummary?.keyDebatePoints)
      ? plan.debateSummary.keyDebatePoints.map((point) => normalizeText(point)).filter(Boolean)
      : [];
  }

  return candidates.sort((a, b) => scoreDebatePoints(b) - scoreDebatePoints(a))[0];
}

export default function CareerPlanPage() {
  const { data: user } = useMe();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<CareerPlanResponse["recommendation"] | null>(null);

  // Multi-select state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debatePoints = useMemo(() => getBestDebatePoints(plan), [plan]);

  // Initialize selected roles from user profile once
  // useEffect(() => {
  //   if (user?.targetRoles?.length && selectedRoles.length === 0) {
  //     setSelectedRoles(user.targetRoles);
  //   }
  // }, [user]);

  const filteredRoles = useMemo(() => {
    if (!query) return [...MARKET_ROLES].slice(0, 30);
    const q = query.toLowerCase();
    return [...MARKET_ROLES].filter((r) => r.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleRole(role: string) {
    if (selectedRoles.includes(role)) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles([role]); // Only allow 1 role
    }
    setQuery("");
    inputRef.current?.focus();
  }

  async function handleGenerate() {
    if (selectedRoles.length === 0) {
      setError("Please select at least one role.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(API.generateRecommendations, {
        method: "POST",
        body: JSON.stringify({
          targetRoles: selectedRoles,
          maxRounds: 4,
          consensusThreshold: 4
        }),
        auth: true
      }) as { data?: CareerPlanResponse; recommendation?: any };
      
      const payload = res?.data?.recommendation || res?.recommendation;
      if (payload) {
        setPlan(payload);
      } else {
        throw new Error("Invalid format received from API");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate AI career plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-4">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Mentorship</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--gradient-from)] via-[var(--gradient-via)] to-[var(--gradient-to)]">
            Career Trajectory Plan
          </h1>
          <p className="text-muted mt-2 text-lg">
            Multi-agent AI personalized roadmap focusing on your target roles.
          </p>
        </div>

        {plan && (
          <button
            onClick={() => setPlan(null)} // Reset plan to generate a new one
            className="px-6 py-3 rounded-xl bg-surface-inset text-heading font-semibold hover:bg-surface-hover border border-border transition-all flex items-center gap-2"
          >
            Start New Plan
          </button>
        )}
      </div>

      {!plan && !loading && (
        <GlassCard className="p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold text-heading mb-2">Select your Target Roles</h2>
          <p className="text-sm text-muted mb-6">Choose one specific target role for our AI agents to debate and analyze.</p>
          
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="relative flex-1" ref={containerRef}>
              <div 
                className="min-h-12 rounded-xl bg-input-bg border border-input-border flex items-center gap-2 p-1.5 cursor-pointer transition-all hover:border-input-focus-ring/50 focus-within:ring-2 focus-within:ring-input-focus-ring focus-within:border-transparent"
                onClick={() => {
                  if (selectedRoles.length === 0) {
                    setOpen(true);
                    inputRef.current?.focus();
                  }
                }}
              >
                {selectedRoles.length > 0 ? (
                  <div className="flex-1 flex items-center justify-between px-3 py-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-sm font-semibold text-heading">{selectedRoles[0]}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoles([]);
                        setQuery("");
                        setTimeout(() => {
                          setOpen(true);
                          inputRef.current?.focus();
                        }, 10);
                      }}
                      className="p-1 rounded-md hover:bg-surface-hover text-muted hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center px-3">
                    <Search className="w-4 h-4 text-muted mr-3 shrink-0" />
                    <input
                      ref={inputRef}
                      placeholder="Search a target role (e.g. Product Manager)"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                      }}
                      onFocus={() => setOpen(true)}
                      className="flex-1 bg-transparent text-sm text-input-text placeholder:text-input-placeholder focus:outline-none h-9"
                    />
                  </div>
                )}
                <div className="pr-3">
                  <ChevronsUpDown className="w-4 h-4 text-muted opacity-50" />
                </div>
              </div>

              {open && selectedRoles.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl shadow-black/5 ring-1 ring-black/5 backdrop-blur-xl custom-scrollbar py-1 animate-in fade-in zoom-in-95 duration-100">
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <button
                        type="button"
                        key={role}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedRoles([role]);
                          setQuery("");
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover hover:text-accent-primary transition-colors flex items-center justify-between group border-b border-border/40 last:border-0"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform font-medium text-body group-hover:text-heading">{role}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-sm text-muted text-center flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-border mb-1" />
                      <p>No roles found matching &quot;{query}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={selectedRoles.length === 0}
              className="px-6 py-3.5 rounded-xl bg-btn-primary-bg text-btn-primary-text font-bold hover:bg-btn-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full mt-4 shadow-glow-primary"
            >
              <Target className="w-5 h-5" /> Generate Action Plan
            </button>
          </div>
        </GlassCard>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500 backdrop-blur-md">
          {error}
        </div>
      )}

      {loading && !plan && (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-accent-primary animate-spin"></div>
              <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-accent-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-heading">Multi-Agent Debate Active</h3>
              <p className="text-muted text-sm mt-2">
                Our AI agents (Analyst, Coach, Visa Specialist, Recruiter) are debating the optimal path for <span className="font-bold text-heading">{selectedRoles.join(" & ")}</span>. This may take up to a minute...
              </p>
            </div>
          </div>
        </div>
      )}

      {plan && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Executive Summary */}
          <GlassCard className="p-8 border-l-4 border-l-accent-primary shadow-elevated">
            <h2 className="text-sm font-bold uppercase tracking-widest text-faint mb-4">Executive Summary</h2>
            <div className="text-body text-base leading-relaxed whitespace-pre-wrap">
              {removeExecutiveSummaryHeading(plan.executiveSummary)}
            </div>
          </GlassCard>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-black text-heading">{plan.confidenceMetrics.overall}%</div>
              <div className="text-[10px] text-faint font-bold uppercase tracking-widest mt-1">Confidence Score</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-black text-accent-primary">{plan.actionPlan.totalDuration}</div>
              <div className="text-[10px] text-faint font-bold uppercase tracking-widest mt-1">Timeline</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-black text-heading">{plan.actionPlan.weeklyCommitmentHours}h</div>
              <div className="text-[10px] text-faint font-bold uppercase tracking-widest mt-1">Weekly Focus</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col justify-center items-center text-center">
              <div className="text-3xl font-black text-amber-500">{plan.debateSummary.agreementScore ? Math.round(plan.debateSummary.agreementScore * 100) : 0}%</div>
              <div className="text-[10px] text-faint font-bold uppercase tracking-widest mt-1">AI Agreement</div>
            </GlassCard>
          </div>

          {/* Immediate Steps & Warnings */}
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-faint mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-primary" /> Top Priorities
              </h3>
              <div className="space-y-3">
                {plan.nextSteps.slice(0, 3).map((step, i) => (
                  <div key={i} className="flex gap-3 bg-surface-inset p-3 rounded-xl border border-border">
                    <div className="mt-0.5"><CheckCircle2 className="w-5 h-5 text-badge-success-text" /></div>
                    <div>
                      <div className="text-sm font-medium text-heading">{step.step}</div>
                      <div className="text-xs text-muted mt-0.5">{step.timeline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-faint mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Considerations
              </h3>
              <ul className="space-y-3">
                {plan.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-body">
                    <span className="text-amber-500">•</span> {w}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Role Rankings */}
          <div>
            <h2 className="text-2xl font-bold text-heading mb-6">Target Role Feasibility</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {plan.roleRankings.map((role, i) => (
                <GlassCard key={i} className="p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-heading">{role.role}</h3>
                      <div className="text-sm text-muted mt-1">{role.reasoning}</div>
                    </div>
                    <div className={cn("px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border", getTierColor(role.tier))}>
                      {role.tier}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-surface-inset border border-border">
                    <div>
                      <div className="text-xs text-faint font-bold uppercase tracking-widest mb-1">Avg Salary</div>
                      <div className="text-lg font-bold text-heading">{formatCurrency(role.marketInsights.avgSalary)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-faint font-bold uppercase tracking-widest mb-1">Demand</div>
                      <div className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> {role.marketInsights.demand}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    <div className="font-semibold text-heading mb-2">Time to Ready: <span className="text-accent-primary">{role.skillGap.timeToReady}</span></div>
                    {role.skillGap.gapSkills.length > 0 && (
                      <div className="text-muted">
                        <span className="font-medium text-body">Skill Gaps:</span> {role.skillGap.gapSkills.join(", ")}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Action Plan Timeline */}
          <div>
            <h2 className="text-2xl font-bold text-heading mb-6">Phased Execution Plan</h2>
            <div className="space-y-6">
              {plan.actionPlan.phases.map((phase, i) => (
                <div key={i} className="relative pl-8 md:pl-0">
                  {/* Desktop layout: split timeline */}
                  <div className="hidden md:grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-3 text-right pt-2 border-r-2 border-border pr-6 relative">
                      <div className="text-lg font-bold text-heading">{phase.name}</div>
                      <div className="text-sm font-medium text-accent-primary">{phase.duration}</div>
                      
                      {/* Timeline dot */}
                      <div className="absolute top-4 -right-[9px] w-4 h-4 rounded-full bg-accent-primary border-4 border-surface shadow-sm" />
                    </div>
                    <div className="col-span-9">
                      <GlassCard className="p-6">
                        <div className="mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-faint mb-2">Primary Goals</h4>
                          <ul className="list-disc list-inside text-sm text-heading space-y-1">
                            {phase.goals.map((g, idx) => <li key={idx}>{g}</li>)}
                          </ul>
                        </div>
                        <div className="pt-4 border-t border-divider">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-faint mb-2">Key Tasks</h4>
                          <div className="flex flex-wrap gap-2">
                            {phase.tasks.map((t, idx) => (
                              <span key={idx} className="bg-surface-inset border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-muted">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-border" />
                    {/* Timeline dot */}
                    <div className="absolute left-1 top-2 w-5 h-5 rounded-full bg-accent-primary border-4 border-surface shadow-sm" />
                    
                    <div className="mb-2">
                      <div className="text-lg font-bold text-heading">{phase.name}</div>
                      <div className="text-sm font-medium text-accent-primary">{phase.duration}</div>
                    </div>
                    <GlassCard className="p-5 mb-6">
                        <div className="mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-faint mb-2">Primary Goals</h4>
                          <ul className="list-disc list-inside text-sm text-heading space-y-1">
                            {phase.goals.map((g, idx) => <li key={idx}>{g}</li>)}
                          </ul>
                        </div>
                        <div className="pt-4 border-t border-divider">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-faint mb-2">Key Tasks</h4>
                          <div className="flex flex-wrap gap-2">
                            {phase.tasks.map((t, idx) => (
                              <span key={idx} className="bg-surface-inset border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-muted">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                    </GlassCard>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Debate Log */}
          <GlassCard className="p-6 bg-surface-inset/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-faint mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4" /> Multi-Agent Debate Summary
            </h3>
            <p className="text-sm text-muted mb-4">
              Our specialized AI agents conducted <strong>{plan.debateSummary.totalRounds} rounds</strong> of debate to build this plan.
            </p>
            <div className="space-y-3">
              {debatePoints.map((pt, i) => {
                const [agent, ...rest] = pt.split(":");
                // Avoid crashing if split doesn't work well
                return (
                  <div key={i} className="text-sm p-3 rounded-xl bg-surface/50 border border-border/50 break-words">
                    {rest.length > 0 ? (
                      <>
                        <span className="font-bold text-heading capitalize">{agent.replace(/_/g, " ")}:</span>
                        <span className="text-body ml-2 whitespace-pre-wrap">{rest.join(":")}</span>
                      </>
                    ) : (
                      <span className="text-body whitespace-pre-wrap">{agent}</span>
                    )}
                  </div>
                );
              })}
              {debatePoints.length === 0 && (
                <div className="text-sm p-3 rounded-xl bg-surface/50 border border-border/50 text-muted">
                  Debate points are currently unavailable.
                </div>
              )}
            </div>
          </GlassCard>

        </div>
      )}
    </div>
  );
}
