"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/GlassCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { fetchMarketJobs, type JobListing, type JobsQueryFilters } from "@/lib/api/jobs";
import { MARKET_ROLES } from "@/lib/data/marketRole-handshake";
import { COMPANIES } from "@/lib/data/companyName-handshake";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  MoreHorizontal,
  X,
} from "lucide-react";

type JobsFormState = {
  search: string;
  canonicalRole: string;
  company: string;
  location: string;
  jobType: string;
  employmentDuration: string;
  schedule: string;
  status: string;
  isRemote: "any" | "true" | "false";
  skillsCsv: string;
  minSalary: string;
  maxSalary: string;
  postedAfter: string;
  postedBefore: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const LIMIT_OPTIONS = [10, 20, 50];
const JOB_TYPE_OPTIONS = ["job", "internship", "fellowship", "co-op", "apprenticeship"];
const EMPLOYMENT_DURATION_OPTIONS = ["Permanent", "Temporary or seasonal"];
const SCHEDULE_OPTIONS = ["Full time", "Part time"];
const STATUS_OPTIONS = ["Approved", "Pending", "Rejected"];
const SORT_BY_OPTIONS = ["postedDate", "salaryMax", "salaryMin", "title", "company"];

const DEFAULT_FORM: JobsFormState = {
  search: "",
  canonicalRole: "",
  company: "",
  location: "",
  jobType: "",
  employmentDuration: "",
  schedule: "",
  status: "",
  isRemote: "any",
  skillsCsv: "",
  minSalary: "",
  maxSalary: "",
  postedAfter: "",
  postedBefore: "",
  sortBy: "postedDate",
  sortOrder: "desc",
};

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDateInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

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

type SuggestionInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
  limit?: number;
};

function SuggestionInput({ value, onChange, placeholder, options, limit = 200 }: SuggestionInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, limit);
    return options.filter((option) => option.toLowerCase().includes(q)).slice(0, limit);
  }, [limit, options, query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSelect(option: string) {
    if (value === option) {
      onChange("");
    } else {
      onChange(option);
    }
    setOpen(false);
    setQuery("");
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-between font-normal",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate text-left">{value || placeholder}</span>
        <div className="flex items-center ml-2 shrink-0 opacity-50">
          {value && (
            <div
              role="button"
              tabIndex={0}
              onClick={clearSelection}
              className="mr-1 hover:opacity-100 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </div>
          )}
          <ChevronsUpDown className="h-4 w-4" />
        </div>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg shadow-black/5 ring-1 ring-foreground/[0.06] backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            <CommandList className="max-h-56 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = value === option;
                    return (
                      <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => handleSelect(option)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{option}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [form, setForm] = useState<JobsFormState>(DEFAULT_FORM);
  const [filters, setFilters] = useState<JobsQueryFilters>({
    page: 1,
    limit: 20,
    sortBy: "postedDate",
    sortOrder: "desc",
  });
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
    const minSalary = form.minSalary.trim() ? Number(form.minSalary.trim()) : undefined;
    const maxSalary = form.maxSalary.trim() ? Number(form.maxSalary.trim()) : undefined;

    setFilters((prev) => ({
      page: 1,
      limit: prev.limit ?? 20,
      search: form.search.trim() || undefined,
      canonicalRole: form.canonicalRole?.trim() || undefined,
      company: form.company?.trim() || undefined,
      location: form.location.trim() || undefined,
      jobType: form.jobType.trim() || undefined,
      employmentDuration: form.employmentDuration.trim() || undefined,
      schedule: form.schedule.trim() || undefined,
      status: form.status.trim() || undefined,
      isRemote:
        form.isRemote === "any"
          ? undefined
          : form.isRemote === "true"
            ? true
            : false,
      skills: splitCsv(form.skillsCsv),
      minSalary:
        typeof minSalary === "number" && Number.isFinite(minSalary)
          ? minSalary
          : undefined,
      maxSalary:
        typeof maxSalary === "number" && Number.isFinite(maxSalary)
          ? maxSalary
          : undefined,
      postedAfter: parseDateInputToIso(form.postedAfter),
      postedBefore: parseDateInputToIso(form.postedBefore),
      sortBy: form.sortBy || "postedDate",
      sortOrder: form.sortOrder,
    }));
  }, [form]);

  const clearFilters = useCallback(() => {
    setForm(DEFAULT_FORM);
    setFilters({ page: 1, limit, sortBy: "postedDate", sortOrder: "desc" });
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
    if (form.canonicalRole.trim()) count += 1;
    if (form.company.trim()) count += 1;
    if (form.location.trim()) count += 1;
    if (form.jobType.trim()) count += 1;
    if (form.employmentDuration.trim()) count += 1;
    if (form.schedule.trim()) count += 1;
    if (form.status.trim()) count += 1;
    if (form.isRemote !== "any") count += 1;
    if (form.skillsCsv.trim()) count += 1;
    if (form.minSalary.trim()) count += 1;
    if (form.maxSalary.trim()) count += 1;
    if (form.postedAfter.trim()) count += 1;
    if (form.postedBefore.trim()) count += 1;
    if (form.sortBy !== "postedDate") count += 1;
    if (form.sortOrder !== "desc") count += 1;
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
            Query the listings API with role, company, duration, schedule, salary band, and posting window filters.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface-inset text-sm text-muted">
          <Sparkles className="w-4 h-4 text-accent-primary" />
          <span className="font-semibold">{activeFilterCount}</span>
          <span>active filters</span>
        </div>
      </div>

      <GlassCard className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr_1fr_auto] gap-3">
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

          <SuggestionInput
            value={form.canonicalRole}
            onChange={(next) => updateForm("canonicalRole", next)}
            placeholder="Canonical role"
            options={MARKET_ROLES}
            limit={1000}
          />

          <SuggestionInput
            value={form.company}
            onChange={(next) => updateForm("company", next)}
            placeholder="Company"
            options={COMPANIES}
            limit={300}
          />

          <Button onClick={applyFilters} className="px-6">
            Search
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Job Type</p>
            <Select
              value={form.jobType || "any"}
              onValueChange={(value) => updateForm("jobType", value === "any" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {JOB_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Duration</p>
            <Select
              value={form.employmentDuration || "any"}
              onValueChange={(value) => updateForm("employmentDuration", value === "any" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {EMPLOYMENT_DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Schedule</p>
            <Select
              value={form.schedule || "any"}
              onValueChange={(value) => updateForm("schedule", value === "any" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {SCHEDULE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Status</p>
            <Select
              value={form.status || "any"}
              onValueChange={(value) => updateForm("status", value === "any" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Remote</p>
            <Select value={form.isRemote} onValueChange={(value: "any" | "true" | "false") => updateForm("isRemote", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="true">Remote only</SelectItem>
                <SelectItem value="false">On-site / hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "gap-2"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
                Filter Actions
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filters</DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowAdvancedFilters((prev) => !prev);
                  }}
                >
                  {showAdvancedFilters ? "Hide" : "Show"} advanced filters
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    applyFilters();
                  }}
                >
                  Apply filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    clearFilters();
                  }}
                  disabled={activeFilterCount === 0}
                >
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-xs md:text-sm text-muted">
            Tip: press Enter in search to run filters quickly.
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <Input
              value={form.location}
              onChange={(e) => updateForm("location", e.target.value)}
              placeholder="Primary location"
            />
            <Input
              value={form.skillsCsv}
              onChange={(e) => updateForm("skillsCsv", e.target.value)}
              placeholder="Skills CSV"
            />
            <Input
              type="number"
              min={0}
              value={form.minSalary}
              onChange={(e) => updateForm("minSalary", e.target.value)}
              placeholder="Min salary"
            />
            <Input
              type="number"
              min={0}
              value={form.maxSalary}
              onChange={(e) => updateForm("maxSalary", e.target.value)}
              placeholder="Max salary"
            />

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Sort By</p>
              <Select
                value={form.sortBy}
                onValueChange={(value) => updateForm("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_BY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-faint font-black mb-1.5">Sort Order</p>
              <Select value={form.sortOrder} onValueChange={(value: "asc" | "desc") => updateForm("sortOrder", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">desc</SelectItem>
                  <SelectItem value="asc">asc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="datetime-local"
              value={form.postedAfter}
              onChange={(e) => updateForm("postedAfter", e.target.value)}
              placeholder="Posted after"
            />
            <Input
              type="datetime-local"
              value={form.postedBefore}
              onChange={(e) => updateForm("postedBefore", e.target.value)}
              placeholder="Posted before"
            />

            <div className="md:col-span-2 xl:col-span-4 flex justify-end">
              <Button onClick={applyFilters} className="px-6">
                Apply Advanced Filters
              </Button>
            </div>
          </div>
        )}
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

        {!loading && !error && jobs.map((job) => (
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

                {job.description && (
                  <p className="text-sm text-muted leading-relaxed">
                    {job.description.replace(/\s*\|\s*/g, " ").slice(0, 240)}
                    {job.description.length > 240 ? "..." : ""}
                  </p>
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

                <Button
                  onClick={() =>
                    router.push(
                      `/market-analyzer?role=${encodeURIComponent(
                        job.canonicalRole || job.groupedRole || job.title
                      )}` as any
                    )
                  }
                  className="w-full mt-1"
                >
                  Analyze This Role
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
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