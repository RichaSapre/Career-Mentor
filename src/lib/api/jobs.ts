import { apiFetch } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";

export type JobsQueryFilters = {
	page?: number;
	limit?: number;
	search?: string;
	canonicalRole?: string;
	company?: string;
	location?: string;
	jobType?: string;
	employmentDuration?: string;
	schedule?: string;
	status?: string;
	isRemote?: boolean;
	skills?: string[];
	minSalary?: number;
	maxSalary?: number;
	postedAfter?: string;
	postedBefore?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};

export type JobListing = {
	id: string;
	title: string;
	company: string;
	location: string;
	canonicalRole: string;
	groupedRole: string;
	description?: string;
	source?: string;
	jobType?: string;
	employmentDuration?: string;
	schedule?: string;
	status?: string;
	jobLevel?: string;
	industry?: string;
	locationType?: string;
	isRemote?: boolean;
	skills: string[];
	salaryMin?: number;
	maxSalary?: number;
	salaryPeriod?: string;
	postedDate?: string;
	jobUrl?: string;
	workAuthorization?: string;
};

export type JobsPagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
};

export type JobsListResponse = {
	jobs: JobListing[];
	pagination: JobsPagination;
};

function compactCsv(value?: string): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function splitCsv(value?: string): string[] {
	if (!value) return [];
	return value
		.split(",")
		.map((v) => v.trim())
		.filter(Boolean);
}

function normalizeSkills(value: unknown): string[] {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value
			.map((entry) => {
				if (typeof entry === "string") return entry.trim();
				if (entry && typeof entry === "object") {
					const obj = entry as { skill?: string; skillName?: string; name?: string };
					return (obj.skill ?? obj.skillName ?? obj.name ?? "").trim();
				}
				return "";
			})
			.filter(Boolean);
	}

	if (typeof value === "string") return splitCsv(value);
	return [];
}

function pickString(obj: Record<string, unknown>, keys: string[], fallback = ""): string {
	for (const key of keys) {
		const value = obj[key];
		if (typeof value === "string" && value.trim().length > 0) return value;
	}
	return fallback;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
	for (const key of keys) {
		const value = obj[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
		if (typeof value === "string") {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) return parsed;
		}
	}
	return undefined;
}

function pickBoolean(obj: Record<string, unknown>, keys: string[]): boolean | undefined {
	for (const key of keys) {
		const value = obj[key];
		if (typeof value === "boolean") return value;
		if (typeof value === "string") {
			const normalized = value.trim().toLowerCase();
			if (normalized === "true") return true;
			if (normalized === "false") return false;
		}
	}
	return undefined;
}

function normalizeJobs(raw: unknown): JobsListResponse {
	const root = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
	const payload = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;

	const sourceList =
		(Array.isArray(payload.jobs) && payload.jobs) ||
		(Array.isArray(payload.items) && payload.items) ||
		(Array.isArray(payload.results) && payload.results) ||
		(Array.isArray(root.jobs) && root.jobs) ||
		[];

	const jobs = sourceList.reduce<JobListing[]>((acc, entry, index) => {
		if (!entry || typeof entry !== "object") return acc;
		const item = entry as Record<string, unknown>;

		const salaryRange = (item.salaryRange && typeof item.salaryRange === "object"
			? item.salaryRange
			: {}) as Record<string, unknown>;
		const jobFunction = pickString(item, ["jobFunction", "job_function"], "");
		const canonicalRole = pickString(item, ["canonicalRole", "canonical_role"], jobFunction);

		const id = pickString(item, ["id", "_id", "jobId", "job_id"], `job-${index}`);
		const title = pickString(item, ["title", "jobTitle", "job_title", "role"], "Untitled Role");

		acc.push({
			id,
			title,
			company: pickString(item, ["company", "companyName", "employer"], "Unknown Company"),
			location: pickString(item, ["location", "city", "jobLocation"], "Remote"),
			canonicalRole,
			groupedRole: pickString(item, ["groupedRole", "grouped_role"], canonicalRole),
			description: pickString(item, ["description", "summary"], "") || undefined,
			source: pickString(item, ["source"], "") || undefined,
			jobType: pickString(item, ["jobType", "job_type"], "") || undefined,
			employmentDuration:
				pickString(item, ["employmentDuration", "employment_duration"], "") || undefined,
			schedule: pickString(item, ["schedule"], "") || undefined,
			status: pickString(item, ["status"], "") || undefined,
			jobLevel: pickString(item, ["jobLevel", "job_level", "experienceLevel"], "") || undefined,
			industry: pickString(item, ["industry", "sector"], "") || undefined,
			locationType: pickString(item, ["locationType", "location_type"], "") || undefined,
			isRemote: pickBoolean(item, ["isRemote", "remote", "is_remote"]),
			skills: normalizeSkills(item.skills ?? item.requiredSkills ?? item.required_skills),
			salaryMin:
				pickNumber(item, ["salaryMin", "salary_min", "minSalary", "compensationMin"]) ??
				pickNumber(salaryRange, ["min", "lower"]),
			maxSalary:
				pickNumber(item, ["maxSalary", "salaryMax", "salary_max", "compensationMax"]) ??
				pickNumber(salaryRange, ["max", "upper"]),
			salaryPeriod:
				pickString(item, ["salaryPeriod", "salary_period", "compensationPeriod"], "") || undefined,
			postedDate: pickString(item, ["postedDate", "posted_date", "createdAt", "publishedAt"], "") || undefined,
			jobUrl: pickString(item, ["jobUrl", "job_url", "applyUrl", "url"], "") || undefined,
			workAuthorization:
				pickString(item, ["workAuthorization", "work_authorization"], "") || undefined,
		});

		return acc;
	}, []);

	const meta = (payload.pagination && typeof payload.pagination === "object"
		? payload.pagination
		: payload.meta && typeof payload.meta === "object"
			? payload.meta
			: {}) as Record<string, unknown>;

	const page =
		pickNumber(meta, ["page"]) ?? pickNumber(payload, ["page"]) ?? pickNumber(root, ["page"]) ?? 1;
	const limit =
		pickNumber(meta, ["limit", "pageSize"]) ??
		pickNumber(payload, ["limit", "pageSize"]) ??
		pickNumber(root, ["limit", "pageSize"]) ??
		25;
	const total =
		pickNumber(meta, ["total", "totalItems", "count"]) ??
		pickNumber(payload, ["total", "totalItems", "count"]) ??
		pickNumber(root, ["total", "totalItems", "count"]) ??
		jobs.length;

	const totalPages =
		pickNumber(meta, ["totalPages", "pages"]) ??
		pickNumber(payload, ["totalPages", "pages"]) ??
		Math.max(1, Math.ceil(total / Math.max(1, limit)));

	const pagination: JobsPagination = {
		page,
		limit,
		total,
		totalPages,
		hasNextPage:
			pickBoolean(meta, ["hasNextPage", "hasNext"]) ??
			pickBoolean(payload, ["hasNextPage", "hasNext"]) ??
			page < totalPages,
		hasPrevPage:
			pickBoolean(meta, ["hasPrevPage", "hasPrev"]) ??
			pickBoolean(payload, ["hasPrevPage", "hasPrev"]) ??
			page > 1,
	};

	return { jobs, pagination };
}

export function jobsFiltersToSearchParams(filters: JobsQueryFilters): URLSearchParams {
	const params = new URLSearchParams();

	if (filters.page) params.set("page", String(filters.page));
	if (filters.limit) params.set("limit", String(filters.limit));

	const search = compactCsv(filters.search);
	if (search) params.set("search", search);

	const canonicalRole = compactCsv(filters.canonicalRole);
	if (canonicalRole) params.set("canonicalRole", canonicalRole);

	const company = compactCsv(filters.company);
	if (company) params.set("company", company);

	const location = compactCsv(filters.location);
	if (location) params.set("location", location);

	const jobType = compactCsv(filters.jobType);
	if (jobType) params.set("jobType", jobType);

	const employmentDuration = compactCsv(filters.employmentDuration);
	if (employmentDuration) params.set("employmentDuration", employmentDuration);

	const schedule = compactCsv(filters.schedule);
	if (schedule) params.set("schedule", schedule);

	const status = compactCsv(filters.status);
	if (status) params.set("status", status);

	if (typeof filters.isRemote === "boolean") params.set("isRemote", String(filters.isRemote));

	if (filters.skills && filters.skills.length > 0) {
		params.set("skills", filters.skills.join(","));
	}

	if (typeof filters.minSalary === "number" && Number.isFinite(filters.minSalary)) {
		params.set("minSalary", String(filters.minSalary));
	}

	if (typeof filters.maxSalary === "number" && Number.isFinite(filters.maxSalary)) {
		params.set("maxSalary", String(filters.maxSalary));
	}

	const postedAfter = compactCsv(filters.postedAfter);
	if (postedAfter) params.set("postedAfter", postedAfter);

	const postedBefore = compactCsv(filters.postedBefore);
	if (postedBefore) params.set("postedBefore", postedBefore);

	const sortBy = compactCsv(filters.sortBy);
	if (sortBy) params.set("sortBy", sortBy);

	if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

	return params;
}

export async function fetchMarketJobs(
	filters: JobsQueryFilters,
	options?: { signal?: AbortSignal }
): Promise<JobsListResponse> {
	const params = jobsFiltersToSearchParams(filters);
	const query = params.toString();
	const path = query.length > 0 ? `${API.marketJobs}?${query}` : API.marketJobs;
	const raw = await apiFetch<unknown>(path, {
		method: "GET",
		auth: false,
		signal: options?.signal,
	});
	return normalizeJobs(raw);
}
