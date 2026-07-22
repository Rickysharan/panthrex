export type JobWorkplaceType =
  | "remote"
  | "hybrid"
  | "onsite"
  | "unspecified";

export type JobEmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship"
  | "graduate"
  | "apprenticeship"
  | "unspecified";

export type JobExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "manager"
  | "unspecified";

export type JobSource =
  | "adzuna"
  | "reed"
  | "indeed"
  | "linkedin"
  | "totaljobs"
  | "cwjobs"
  | "manual"
  | "mock";

export type SponsorshipStatus =
  | "available"
  | "possible"
  | "not-available"
  | "unknown";

export type JobSortOption =
  | "relevance"
  | "date"
  | "salary-high"
  | "salary-low"
  | "match-score";

export type SalaryPeriod =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type JobSalary = {
  minimum: number | null;
  maximum: number | null;
  currency: string;
  period: SalaryPeriod;
  isEstimated: boolean;
};

export type JobSearchResult = {
  id: string;
  externalId: string | null;
  title: string;
  company: string;
  location: string;
  description: string;
  shortDescription: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  employmentType: JobEmploymentType;
  workplaceType: JobWorkplaceType;
  experienceLevel: JobExperienceLevel;
  salary: JobSalary | null;
  sponsorshipStatus: SponsorshipStatus;
  sponsorshipEvidence: string | null;
  matchScore: number | null;
  matchReasons: string[];
  missingSkills: string[];
  source: JobSource;
  sourceLabel: string;
  applicationUrl: string;
  companyLogoUrl: string | null;
  postedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type JobSearchFilters = {
  query: string;
  location: string;
  workplaceTypes: JobWorkplaceType[];
  employmentTypes: JobEmploymentType[];
  experienceLevels: JobExperienceLevel[];
  sponsorshipOnly: boolean;
  minimumSalary: number | null;
  maximumSalary: number | null;
  postedWithinDays: number | null;
  sortBy: JobSortOption;
};

export type JobSearchPagination = {
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type JobSearchMetadata = {
  query: string;
  location: string;
  searchedAt: string;
  durationMs: number;
  sources: JobSource[];
};

export type JobSearchResponse = {
  success: true;
  jobs: JobSearchResult[];
  pagination: JobSearchPagination;
  metadata: JobSearchMetadata;
};

export type JobSearchErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

export type JobSearchApiResponse =
  | JobSearchResponse
  | JobSearchErrorResponse;

export type JobSearchRequest = {
  filters: JobSearchFilters;
  page?: number;
  pageSize?: number;
};

export type SavedJob = {
  id: string;
  job: JobSearchResult;
  savedAt: string;
  notes: string;
};

export type JobSearchState = {
  jobs: JobSearchResult[];
  savedJobs: SavedJob[];
  selectedJob: JobSearchResult | null;
  filters: JobSearchFilters;
  pagination: JobSearchPagination;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
};

export const DEFAULT_JOB_SEARCH_FILTERS: JobSearchFilters = {
  query: "",
  location: "United Kingdom",
  workplaceTypes: [],
  employmentTypes: [],
  experienceLevels: [],
  sponsorshipOnly: false,
  minimumSalary: null,
  maximumSalary: null,
  postedWithinDays: null,
  sortBy: "relevance",
};

export const DEFAULT_JOB_SEARCH_PAGINATION: JobSearchPagination = {
  page: 1,
  pageSize: 10,
  totalResults: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};