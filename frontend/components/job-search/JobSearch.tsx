"use client";

import { useMemo } from "react";

import { useJobSearch } from "@/lib/job-search/useJobSearch";
import type {
  JobEmploymentType,
  JobExperienceLevel,
  JobSearchResult,
  JobWorkplaceType,
} from "@/lib/job-search/types";

function formatSalary(job: JobSearchResult) {
  if (!job.salary) {
    return "Salary not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: job.salary.currency || "GBP",
    maximumFractionDigits: 0,
  });

  const minimum = job.salary.minimum
    ? formatter.format(job.salary.minimum)
    : null;

  const maximum = job.salary.maximum
    ? formatter.format(job.salary.maximum)
    : null;

  if (minimum && maximum) {
    return `${minimum} – ${maximum} per ${job.salary.period}`;
  }

  if (minimum) {
    return `From ${minimum} per ${job.salary.period}`;
  }

  if (maximum) {
    return `Up to ${maximum} per ${job.salary.period}`;
  }

  return "Salary not disclosed";
}

function formatPostedDate(postedAt: string | null) {
  if (!postedAt) {
    return "Date not specified";
  }

  const date = new Date(postedAt);

  if (Number.isNaN(date.getTime())) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getSponsorshipLabel(
  status: JobSearchResult["sponsorshipStatus"],
) {
  switch (status) {
    case "available":
      return "Sponsorship available";
    case "possible":
      return "Sponsorship possible";
    case "not-available":
      return "No sponsorship";
    default:
      return "Sponsorship unknown";
  }
}

export default function JobSearch() {
  const {
    jobs,
    savedJobs,
    selectedJob,
    filters,
    pagination,
    loading,
    error,
    hasSearched,
    updateFilters,
    resetFilters,
    searchJobs,
    selectJob,
    saveJob,
    unsaveJob,
    isJobSaved,
    goToNextPage,
    goToPreviousPage,
  } = useJobSearch();

  const savedJobIds = useMemo(
    () =>
      new Set(
        savedJobs.map((savedJob) => savedJob.job.id),
      ),
    [savedJobs],
  );

  function toggleArrayFilter<T extends string>(
    currentValues: T[],
    value: T,
  ) {
    return currentValues.includes(value)
      ? currentValues.filter(
          (currentValue) => currentValue !== value,
        )
      : [...currentValues, value];
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void searchJobs(1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Panthrex AI
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          AI Job Search
        </h1>

        <p className="mt-4 max-w-3xl text-slate-400">
          Search roles with AI-powered matching,
          sponsorship signals, salary insights, and direct
          access to your resume and cover-letter workflows.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_280px_auto]">
          <div>
            <label
              htmlFor="job-query"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Job title or keywords
            </label>

            <input
              id="job-query"
              value={filters.query}
              onChange={(event) =>
                updateFilters({
                  query: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              placeholder="Software Engineer, Data Scientist..."
            />
          </div>

          <div>
            <label
              htmlFor="job-location"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Location
            </label>

            <input
              id="job-location"
              value={filters.location}
              onChange={(event) =>
                updateFilters({
                  location: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              placeholder="London, United Kingdom"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !filters.query.trim()}
              className="w-full rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Jobs"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-t border-slate-800 pt-6 lg:grid-cols-4">
          <FilterGroup title="Workplace">
            {(
              [
                ["remote", "Remote"],
                ["hybrid", "Hybrid"],
                ["onsite", "On-site"],
              ] as Array<[JobWorkplaceType, string]>
            ).map(([value, label]) => (
              <FilterCheckbox
                key={value}
                label={label}
                checked={filters.workplaceTypes.includes(
                  value,
                )}
                onChange={() =>
                  updateFilters({
                    workplaceTypes: toggleArrayFilter(
                      filters.workplaceTypes,
                      value,
                    ),
                  })
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Employment type">
            {(
              [
                ["full-time", "Full-time"],
                ["part-time", "Part-time"],
                ["contract", "Contract"],
                ["internship", "Internship"],
                ["graduate", "Graduate"],
              ] as Array<[JobEmploymentType, string]>
            ).map(([value, label]) => (
              <FilterCheckbox
                key={value}
                label={label}
                checked={filters.employmentTypes.includes(
                  value,
                )}
                onChange={() =>
                  updateFilters({
                    employmentTypes: toggleArrayFilter(
                      filters.employmentTypes,
                      value,
                    ),
                  })
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Experience level">
            {(
              [
                ["entry", "Entry"],
                ["junior", "Junior"],
                ["mid", "Mid-level"],
                ["senior", "Senior"],
              ] as Array<[JobExperienceLevel, string]>
            ).map(([value, label]) => (
              <FilterCheckbox
                key={value}
                label={label}
                checked={filters.experienceLevels.includes(
                  value,
                )}
                onChange={() =>
                  updateFilters({
                    experienceLevels: toggleArrayFilter(
                      filters.experienceLevels,
                      value,
                    ),
                  })
                }
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Additional filters">
            <FilterCheckbox
              label="Visa sponsorship only"
              checked={filters.sponsorshipOnly}
              onChange={() =>
                updateFilters({
                  sponsorshipOnly:
                    !filters.sponsorshipOnly,
                })
              }
            />

            <select
              value={filters.sortBy}
              onChange={(event) =>
                updateFilters({
                  sortBy: event.target
                    .value as typeof filters.sortBy,
                })
              }
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="relevance">
                Sort by relevance
              </option>
              <option value="date">
                Sort by newest
              </option>
              <option value="salary-high">
                Salary: high to low
              </option>
              <option value="salary-low">
                Salary: low to high
              </option>
              <option value="match-score">
                Best AI match
              </option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
            >
              Reset filters
            </button>
          </FilterGroup>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Search Results
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {hasSearched
                  ? `${pagination.totalResults} jobs found`
                  : "Run a search to find matching roles"}
              </p>
            </div>
          </div>

          {!hasSearched && !loading && (
            <EmptyState
              icon="🔍"
              title="Start your job search"
              message="Enter a role and location, then apply filters to discover relevant jobs."
            />
          )}

          {loading && (
            <EmptyState
              icon="⚡"
              title="Searching jobs"
              message="Panthrex is gathering and ranking relevant opportunities."
            />
          )}

          {hasSearched &&
            !loading &&
            jobs.length === 0 && (
              <EmptyState
                icon="📭"
                title="No jobs found"
                message="Try broader keywords, another location, or fewer filters."
              />
            )}

          {!loading &&
            jobs.map((job) => {
              const saved =
                savedJobIds.has(job.id) ||
                isJobSaved(job.id);

              return (
                <article
                  key={job.id}
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    selectedJob?.id === job.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                  onClick={() => selectJob(job)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-slate-300">
                        {job.company}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.location}
                      </p>
                    </div>

                    {job.matchScore !== null && (
                      <div className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-bold text-white">
                        {job.matchScore}%
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <JobTag>
                      {job.workplaceType}
                    </JobTag>
                    <JobTag>
                      {job.employmentType}
                    </JobTag>
                    <JobTag>
                      {getSponsorshipLabel(
                        job.sponsorshipStatus,
                      )}
                    </JobTag>
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    {formatSalary(job)}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Posted {formatPostedDate(job.postedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        if (saved) {
                          unsaveJob(job.id);
                        } else {
                          saveJob(job);
                        }
                      }}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white"
                    >
                      {saved ? "Saved" : "Save Job"}
                    </button>
                  </div>
                </article>
              );
            })}

          {hasSearched && jobs.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={
                  !pagination.hasPreviousPage || loading
                }
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {Math.max(pagination.totalPages, 1)}
              </span>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>

        <section className="lg:sticky lg:top-8 lg:self-start">
          {!selectedJob ? (
            <EmptyState
              icon="💼"
              title="Select a job"
              message="Choose a job from the search results to review its details."
            />
          ) : (
            <JobDetails
              job={selectedJob}
              saved={isJobSaved(selectedJob.id)}
              onSave={() => saveJob(selectedJob)}
              onUnsave={() =>
                unsaveJob(selectedJob.id)
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-600"
      />

      <span>{label}</span>
    </label>
  );
}

function JobTag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs capitalize text-slate-300">
      {children}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div>
        <div className="text-5xl">{icon}</div>

        <h2 className="mt-4 text-xl font-semibold text-white">
          {title}
        </h2>

        <p className="mt-2 max-w-md text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
}

function JobDetails({
  job,
  saved,
  onSave,
  onUnsave,
}: {
  job: JobSearchResult;
  saved: boolean;
  onSave: () => void;
  onUnsave: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            {job.sourceLabel}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {job.title}
          </h2>

          <p className="mt-2 text-lg text-slate-300">
            {job.company}
          </p>

          <p className="mt-1 text-slate-500">
            {job.location}
          </p>
        </div>

        {job.matchScore !== null && (
          <div className="rounded-2xl bg-indigo-600 px-5 py-4 text-center text-white">
            <div className="text-2xl font-bold">
              {job.matchScore}%
            </div>
            <div className="text-xs uppercase tracking-wide">
              AI match
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <JobTag>{job.workplaceType}</JobTag>
        <JobTag>{job.employmentType}</JobTag>
        <JobTag>{job.experienceLevel}</JobTag>
        <JobTag>
          {getSponsorshipLabel(
            job.sponsorshipStatus,
          )}
        </JobTag>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <p className="font-semibold text-white">
          {formatSalary(job)}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Posted {formatPostedDate(job.postedAt)}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white">
          Job Description
        </h3>

        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
          {job.description}
        </p>
      </div>

      {job.requirements.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">
            Requirements
          </h3>

          <ul className="mt-3 space-y-2 text-slate-300">
            {job.requirements.map((requirement) => (
              <li
                key={requirement}
                className="flex gap-3"
              >
                <span className="text-indigo-400">
                  •
                </span>
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {job.matchReasons.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">
            Why You Match
          </h3>

          <ul className="mt-3 space-y-2 text-slate-300">
            {job.matchReasons.map((reason) => (
              <li key={reason} className="flex gap-3">
                <span className="text-emerald-400">
                  ✓
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={saved ? onUnsave : onSave}
          className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
        >
          {saved ? "Remove Saved Job" : "Save Job"}
        </button>

        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-500"
        >
          Apply on Company Site
        </a>

        <a
          href={`/resume-tailor?jobId=${encodeURIComponent(
            job.id,
          )}`}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-emerald-500"
        >
          Tailor Resume
        </a>

        <a
          href={`/cover-letter?jobId=${encodeURIComponent(
            job.id,
          )}`}
          className="rounded-xl bg-slate-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-slate-600"
        >
          Generate Cover Letter
        </a>
      </div>
    </article>
  );
}