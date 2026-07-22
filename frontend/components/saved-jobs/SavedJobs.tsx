"use client";

import { useMemo, useState } from "react";

import { useJobSearch } from "@/lib/job-search/useJobSearch";
import { toJobApplication } from "@/lib/job-search/toJobApplication";
import type {
  JobSearchResult,
  SavedJob,
} from "@/lib/job-search/types";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";

type SavedJobsSortOption =
  | "recent"
  | "match-high"
  | "salary-high"
  | "company";

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function SavedJobs() {
  const {
    savedJobs,
    unsaveJob,
    updateSavedJobNotes,
  } = useJobSearch();

  const {
    applications,
    addApplication,
    isLoaded: isTrackerLoaded,
  } = useJobTracker();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<SavedJobsSortOption>("recent");
  const [sponsorshipOnly, setSponsorshipOnly] =
    useState(false);
  const [selectedSavedJobId, setSelectedSavedJobId] =
    useState<string | null>(savedJobs[0]?.id ?? null);
  const [feedback, setFeedback] =
    useState<FeedbackMessage>(null);

  const filteredSavedJobs = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    const matchingJobs = savedJobs.filter(
      (savedJob) => {
        const job = savedJob.job;

        const matchesSearch =
          !normalizedQuery ||
          [
            job.title,
            job.company,
            job.location,
            job.shortDescription,
            job.description,
            ...job.skills,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(normalizedQuery),
          );

        const matchesSponsorship =
          !sponsorshipOnly ||
          job.sponsorshipStatus === "available" ||
          job.sponsorshipStatus === "possible";

        return (
          matchesSearch && matchesSponsorship
        );
      },
    );

    return [...matchingJobs].sort(
      (firstSavedJob, secondSavedJob) => {
        switch (sortBy) {
          case "match-high":
            return (
              (secondSavedJob.job.matchScore ?? 0) -
              (firstSavedJob.job.matchScore ?? 0)
            );

          case "salary-high":
            return (
              getMaximumSalary(secondSavedJob.job) -
              getMaximumSalary(firstSavedJob.job)
            );

          case "company":
            return firstSavedJob.job.company.localeCompare(
              secondSavedJob.job.company,
            );

          case "recent":
          default:
            return (
              getTimestamp(secondSavedJob.savedAt) -
              getTimestamp(firstSavedJob.savedAt)
            );
        }
      },
    );
  }, [
    savedJobs,
    searchQuery,
    sortBy,
    sponsorshipOnly,
  ]);

  const selectedSavedJob = useMemo(() => {
    if (filteredSavedJobs.length === 0) {
      return null;
    }

    return (
      filteredSavedJobs.find(
        (savedJob) =>
          savedJob.id === selectedSavedJobId,
      ) ?? filteredSavedJobs[0]
    );
  }, [filteredSavedJobs, selectedSavedJobId]);

  function handleSelectSavedJob(savedJob: SavedJob) {
    setSelectedSavedJobId(savedJob.id);
    setFeedback(null);
  }

  function handleRemoveSavedJob(
    savedJob: SavedJob,
  ) {
    unsaveJob(savedJob.job.id);

    setSelectedSavedJobId((currentId) =>
      currentId === savedJob.id
        ? null
        : currentId,
    );

    setFeedback({
      type: "success",
      text: `${savedJob.job.title} was removed from Saved Jobs.`,
    });
  }

  function isJobInTracker(
    job: JobSearchResult,
  ) {
    return applications.some(
      (application) =>
        normalizeUrl(application.jobUrl) ===
          normalizeUrl(job.applicationUrl) ||
        (application.companyName
          .trim()
          .toLowerCase() ===
          job.company.trim().toLowerCase() &&
          application.jobTitle
            .trim()
            .toLowerCase() ===
            job.title.trim().toLowerCase()),
    );
  }

  function handleAddToTracker(
    job: JobSearchResult,
  ) {
    if (!isTrackerLoaded) {
      setFeedback({
        type: "error",
        text: "The Job Tracker is still loading. Try again in a moment.",
      });

      return;
    }

    if (isJobInTracker(job)) {
      setFeedback({
        type: "error",
        text: "This role is already in your Job Tracker.",
      });

      return;
    }

    addApplication(toJobApplication(job));

    setFeedback({
      type: "success",
      text: `${job.title} was added to your Job Tracker.`,
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setSortBy("recent");
    setSponsorshipOnly(false);
    setFeedback(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Panthrex AI
        </p>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Saved Jobs
            </h1>

            <p className="mt-4 max-w-3xl text-slate-400">
              Review bookmarked opportunities,
              compare AI match scores, manage notes,
              tailor application documents, and move
              selected roles into your Job Tracker.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-4">
            <p className="text-sm text-slate-500">
              Saved opportunities
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {savedJobs.length}
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto]">
          <div>
            <label
              htmlFor="saved-job-search"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Search saved jobs
            </label>

            <input
              id="saved-job-search"
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search title, company, location, or skills"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="saved-job-sort"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Sort saved jobs
            </label>

            <select
              id="saved-job-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as SavedJobsSortOption,
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 outline-none transition focus:border-indigo-500"
            >
              <option value="recent">
                Recently saved
              </option>
              <option value="match-high">
                Highest AI match
              </option>
              <option value="salary-high">
                Highest salary
              </option>
              <option value="company">
                Company name
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={sponsorshipOnly}
            onChange={() =>
              setSponsorshipOnly(
                (currentValue) => !currentValue,
              )
            }
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-600"
          />

          <span>
            Show sponsorship available or possible
            only
          </span>
        </label>
      </section>

      {feedback && (
        <div
          className={`rounded-xl border p-4 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {savedJobs.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No saved jobs yet"
          message="Save jobs from the AI Job Search page and they will appear here."
          actionHref="/job-search"
          actionLabel="Search Jobs"
        />
      ) : filteredSavedJobs.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="No saved jobs match"
          message="Try another search term or remove the sponsorship filter."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Saved Opportunities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredSavedJobs.length} of{" "}
                {savedJobs.length} visible
              </p>
            </div>

            {filteredSavedJobs.map(
              (savedJob) => {
                const job = savedJob.job;
                const isSelected =
                  selectedSavedJob?.id ===
                  savedJob.id;

                return (
                  <article
                    key={savedJob.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      handleSelectSavedJob(
                        savedJob,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        handleSelectSavedJob(
                          savedJob,
                        );
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
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

                    <p className="mt-4 text-sm font-medium text-slate-300">
                      {formatSalary(job)}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Saved{" "}
                      {formatDate(savedJob.savedAt)}
                    </p>
                  </article>
                );
              },
            )}
          </section>

          <section className="lg:sticky lg:top-8 lg:self-start">
            {selectedSavedJob && (
              <SavedJobDetails
                savedJob={selectedSavedJob}
                inTracker={isJobInTracker(
                  selectedSavedJob.job,
                )}
                onRemove={() =>
                  handleRemoveSavedJob(
                    selectedSavedJob,
                  )
                }
                onAddToTracker={() =>
                  handleAddToTracker(
                    selectedSavedJob.job,
                  )
                }
                onNotesChange={(notes) =>
                  updateSavedJobNotes(
                    selectedSavedJob.job.id,
                    notes,
                  )
                }
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SavedJobDetails({
  savedJob,
  inTracker,
  onRemove,
  onAddToTracker,
  onNotesChange,
}: {
  savedJob: SavedJob;
  inTracker: boolean;
  onRemove: () => void;
  onAddToTracker: () => void;
  onNotesChange: (notes: string) => void;
}) {
  const job = savedJob.job;

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
          Posted {formatDate(job.postedAt)}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Saved {formatDate(savedJob.savedAt)}
        </p>
      </div>

      {job.sponsorshipEvidence && (
        <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
          <p className="text-sm font-semibold text-indigo-300">
            Sponsorship evidence
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {job.sponsorshipEvidence}
          </p>
        </div>
      )}

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-white">
          Job Description
        </h3>

        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
          {job.description}
        </p>
      </section>

      {job.requirements.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-white">
            Requirements
          </h3>

          <ul className="mt-3 space-y-2 text-slate-300">
            {job.requirements.map(
              (requirement) => (
                <li
                  key={requirement}
                  className="flex gap-3"
                >
                  <span className="text-indigo-400">
                    •
                  </span>
                  <span>{requirement}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {job.matchReasons.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-white">
            Why You Match
          </h3>

          <ul className="mt-3 space-y-2 text-slate-300">
            {job.matchReasons.map((reason) => (
              <li
                key={reason}
                className="flex gap-3"
              >
                <span className="text-emerald-400">
                  ✓
                </span>

                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {job.missingSkills.length > 0 && (
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-white">
            Potential Skill Gaps
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {job.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <label
          htmlFor={`saved-job-notes-${savedJob.id}`}
          className="text-lg font-semibold text-white"
        >
          Personal Notes
        </label>

        <textarea
          id={`saved-job-notes-${savedJob.id}`}
          value={savedJob.notes}
          onChange={(event) =>
            onNotesChange(event.target.value)
          }
          rows={5}
          placeholder="Add reminders, contacts, deadlines, interview details, or application strategy..."
          className="mt-3 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
        />
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onAddToTracker}
          disabled={inTracker}
          className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {inTracker
            ? "Already in Job Tracker"
            : "Add to Job Tracker"}
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

        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/10 sm:col-span-2"
        >
          Remove from Saved Jobs
        </button>
      </div>
    </article>
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
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: string;
  title: string;
  message: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div>
        <div className="text-5xl">{icon}</div>

        <h2 className="mt-4 text-2xl font-semibold text-white">
          {title}
        </h2>

        <p className="mt-3 max-w-md text-slate-400">
          {message}
        </p>

        {actionHref ? (
          <a
            href={actionHref}
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            {actionLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function formatSalary(job: JobSearchResult) {
  if (!job.salary) {
    return "Salary not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: job.salary.currency || "GBP",
    maximumFractionDigits: 0,
  });

  const minimum =
    job.salary.minimum !== null
      ? formatter.format(job.salary.minimum)
      : null;

  const maximum =
    job.salary.maximum !== null
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

function formatDate(value: string | null) {
  if (!value) {
    return "not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "not specified";
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

    case "unknown":
    default:
      return "Sponsorship unknown";
  }
}

function getMaximumSalary(job: JobSearchResult) {
  return (
    job.salary?.maximum ??
    job.salary?.minimum ??
    Number.NEGATIVE_INFINITY
  );
}

function getTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function normalizeUrl(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");
}