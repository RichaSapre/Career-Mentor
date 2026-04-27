"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchMarketJobs, type JobListing, type JobsQueryFilters } from "@/lib/api/jobs";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

type JobsFormState = {
  search: string;
  location: string;
  jobType: string;
  schedule: string;
  isRemote: "any" | "true" | "false";
  salarySort: "default" | "asc" | "desc";
};

const LIMIT_OPTIONS = [10, 20, 50];
const JOB_TYPE_OPTIONS = ["internship", "fellowship", "co-op", "apprenticeship"];
const SCHEDULE_OPTIONS: { value: string; label: string }[] = [
  { value: "fulltime", label: "Full time" },
  { value: "parttime", label: "Part time" },
];
const DESCRIPTION_PREVIEW_LIMIT = 280;

const DEFAULT_FORM: JobsFormState = {
  search: "",
  location: "",
  jobType: "",
  schedule: "",
  isRemote: "any",
  salarySort: "default",
};

function formatPostedDate(value?: string): string {
  if (!value) return "Date not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

function formatCompensationRange(minSalary?: number, maxSalary?: number, salaryPeriod?: string): string {
  if (typeof minSalary !== "number" && typeof maxSalary !== "number") {
    return "Salary not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const min = typeof minSalary === "number" ? formatter.format(minSalary) : undefined;
  const max = typeof maxSalary === "number" ? formatter.format(maxSalary) : undefined;
  const range = min && max ? `${min} - ${max}` : min ?? max ?? "Salary not disclosed";

  if (!salaryPeriod) return range;
  return `${range} / ${salaryPeriod}`;
}

function normalizePreviewText(value: string): string {
  return value.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}

export default function JobsPage() {
  const [form, setForm] = useState<JobsFormState>(DEFAULT_FORM);
  const [filters, setFilters] = useState<JobsQueryFilters>({
    page: 1,
    limit: 20,
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchMarketJobs(filters, { signal: controller.signal });
        if (cancelled) return;
        setJobs(response.jobs);
        setTotal(response.pagination.total);
        setTotalPages(Math.max(1, response.pagination.totalPages));
      } catch (fetchError) {
        if (cancelled) return;
        setJobs([]);
        setTotal(0);
        setTotalPages(1);

        const isAbort = fetchError instanceof DOMException && fetchError.name === "AbortError";
        setError(
          isAbort
            ? "Request timed out while loading jobs. Please try again."
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to load jobs."
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters]);

  const currentPage = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const updateForm = useCallback(<K extends keyof JobsFormState>(key: K, value: JobsFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    const jobTypeParts = [form.jobType.trim(), form.schedule.trim()].filter(Boolean);
    setFilters((prev) => ({
      page: 1,
      limit: prev.limit ?? 20,
      search: form.search.trim() || undefined,
      location: form.location.trim() || undefined,
      jobType: jobTypeParts.length > 0 ? jobTypeParts.join(",") : undefined,
      isRemote:
        form.isRemote === "any"
          ? undefined
          : form.isRemote === "true"
            ? true
            : false,
      sortBy: form.salarySort === "default" ? undefined : "salaryMax",
      sortOrder: form.salarySort === "default" ? undefined : form.salarySort,
    }));
  }, [form]);

  const clearFilters = useCallback(() => {
    setForm(DEFAULT_FORM);
    setFilters({ page: 1, limit });
  }, [limit]);

  const resultSummary = useMemo(() => {
    if (total === 0) return "No results";
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);
    return `${start}-${end} of ${total}`;
  }, [currentPage, limit, total]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (form.search.trim()) count += 1;
    if (form.location.trim()) count += 1;
    if (form.jobType.trim()) count += 1;
    if (form.schedule.trim()) count += 1;
    if (form.isRemote !== "any") count += 1;
    if (form.salarySort !== "default") count += 1;
    return count;
  }, [form]);

  function handlePageChange(nextPage: number) {
    setFilters((prev) => ({ ...prev, page: nextPage }));
  }

  function handleLimitChange(nextLimit: number) {
    setFilters((prev) => ({ ...prev, page: 1, limit: nextLimit }));
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-sm font-black mb-4">
            <Briefcase className="w-4 h-4" />
            <span>Market Jobs</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-heading leading-tight">
            Discover Roles That Actually Match Your Criteria
          </h1>
          <p className="text-muted mt-2 text-base md:text-lg max-w-3xl">
            Query the listings API with search, job type, workplace type, location, and salary sorting.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface-inset text-sm text-muted">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="font-semibold">{activeFilterCount}</span>
          <span>active filters</span>
        </div>
      </div>

      <GlassCard className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={form.search}
              onChange={(e) => updateForm("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              className="pl-9"
              placeholder="Search title, company, keywords"
            />
          </div>

          <Input
            value={form.location}
            onChange={(e) => updateForm("location", e.target.value)}
            placeholder="Primary location"
          />

          <Select
            value={form.jobType || "any"}
            onValueChange={(value) => updateForm("jobType", value === "any" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All type</SelectItem>
              {JOB_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={form.schedule || "any"}
            onValueChange={(value) => updateForm("schedule", value === "any" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All</SelectItem>
              {SCHEDULE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={form.isRemote} onValueChange={(value: "any" | "true" | "false") => updateForm("isRemote", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Workplace Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any workplace type</SelectItem>
              <SelectItem value="true">Remote only</SelectItem>
              <SelectItem value="false">On-site / hybrid</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={applyFilters} className="px-6">
            Search
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Salary Sort</p>
            <Select
              value={form.salarySort}
              onValueChange={(value: "default" | "asc" | "desc") => updateForm("salarySort", value)}
            >
              <SelectTrigger className="min-w-[230px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="asc">Salary: low to high</SelectItem>
                <SelectItem value="desc">Salary: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearFilters} disabled={activeFilterCount === 0}>
              Clear filters
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-muted font-medium">
          Showing <span className="text-heading font-bold">{resultSummary}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Rows</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => handleLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && (
          <div className="text-center py-20 text-muted border border-border rounded-[2.5rem] bg-surface">
            <div className="inline-flex items-center gap-2 animate-pulse text-lg font-black ">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading opportunities...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-red-400 border border-red-900/40 rounded-[2.5rem] bg-surface space-y-2">
            <AlertCircle className="w-10 h-10 mx-auto" />
            <p className="text-base font-black ">Failed to fetch jobs</p>
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 text-muted border border-border rounded-3xl bg-surface">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-bold">No opportunities matched your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2.5 rounded-xl bg-btn-primary-bg text-btn-primary-text font-semibold hover:bg-btn-primary-hover transition-all"
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !error && jobs.map((job) => {
          const normalizedDescription = job.description ? normalizePreviewText(job.description) : "";
          const hasLongDescription = normalizedDescription.length > DESCRIPTION_PREVIEW_LIMIT;
          const isExpanded = !!expandedDescriptions[job.id];
          const descriptionText = hasLongDescription && !isExpanded
            ? `${normalizedDescription.slice(0, DESCRIPTION_PREVIEW_LIMIT).trimEnd()}...`
            : normalizedDescription;

          return (
            <GlassCard
              key={job.id}
              className="group border border-border/70 hover:bg-surface-hover hover:border-border-hover transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3.5">
                  <h2 className="text-xl md:text-2xl font-black text-heading group-hover:text-accent-primary transition-colors">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5 text-sm font-semibold text-muted">
                    <span className="flex items-center gap-1.5 bg-surface-inset px-3 py-1.5 rounded-lg border border-border">
                      <Building2 className="w-4 h-4 text-faint" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface-inset px-3 py-1.5 rounded-lg border border-border">
                      <MapPin className="w-4 h-4 text-faint" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface-inset px-3 py-1.5 rounded-lg border border-border">
                      <Briefcase className="w-4 h-4 text-faint" />
                      {job.jobType || "N/A"}
                    </span>
                    {job.schedule && (
                      <span className="px-3 py-1.5 rounded-lg border border-border bg-surface-inset">
                        {job.schedule}
                      </span>
                    )}
                    {job.employmentDuration && (
                      <span className="px-3 py-1.5 rounded-lg border border-border bg-surface-inset">
                        {job.employmentDuration}
                      </span>
                    )}
                    {job.status && (
                      <span className="px-3 py-1.5 rounded-lg border border-border bg-surface-inset">
                        {job.status}
                      </span>
                    )}
                    {job.locationType && (
                      <span className="px-3 py-1.5 rounded-lg border border-border bg-surface-inset">
                        {job.locationType}
                      </span>
                    )}
                  </div>

                  {normalizedDescription && (
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted leading-relaxed">{descriptionText}</p>
                      {hasLongDescription && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDescriptions((prev) => ({
                              ...prev,
                              [job.id]: !prev[job.id],
                            }))
                          }
                          className="text-xs font-semibold text-accent-primary hover:underline"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(job.skills || []).slice(0, 10).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-badge-info-bg border border-badge-info-border text-badge-info-text text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.skills || []).length === 0 && (
                      <span className="text-sm text-muted">No skills listed</span>
                    )}
                  </div>
                </div>

                <div className="lg:min-w-[260px] space-y-3 lg:pl-6 lg:border-l lg:border-border">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black">Posted</p>
                    <p className="text-sm font-semibold text-heading mt-1">{formatPostedDate(job.postedDate)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black">Compensation</p>
                    <p className="text-sm font-semibold text-heading mt-1">
                      {formatCompensationRange(job.salaryMin, job.maxSalary, job.salaryPeriod)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black">Status</p>
                    <p className="text-sm font-semibold text-heading mt-1">{job.status || "Unknown"}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black">Remote</p>
                    <p className="text-sm font-semibold text-heading mt-1">
                    {typeof job.isRemote === "boolean" ? (job.isRemote ? "Yes" : "No") : "Unknown"}
                    </p>
                  </div>

                  {job.jobUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(job.jobUrl, "_blank", "noopener,noreferrer")}
                      className="w-full mt-1"
                    >
                      View Listing
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border border-border rounded-2xl px-4 py-3 bg-surface">
        <div className="text-sm text-muted">
          Page <span className="text-heading font-bold">{currentPage}</span> of <span className="text-heading font-bold">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPrev || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNext || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}