"use client";

import Link from "next/link";
import { useState } from "react";

import JobApplicationForm from "@/components/job-tracker/JobApplicationForm";
import {
  JOB_APPLICATION_STATUSES,
  type CreateJobApplicationInput,
  type JobApplicationStatus,
} from "@/lib/job-tracker/types";
import { useJobTracker } from "@/lib/job-tracker/useJobTracker";

function formatDate(value: string): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: JobApplicationStatus): string {
  return (
    JOB_APPLICATION_STATUSES.find(
      (option) => option.value === status,
    )?.label ?? status
  );
}

export default function JobTrackerPage() {
  const {
    filteredApplications,
    selectedApplication,
    selectedApplicationId,
    searchQuery,
    statusFilter,
    stats,
    isLoaded,
    setSelectedApplicationId,
    setSearchQuery,
    setStatusFilter,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    duplicateApplication,
    clearAllApplications,
  } = useJobTracker();

  const [showAddForm, setShowAddForm] = useState(false);

  function handleAddApplication(
    input: CreateJobApplicationInput,
  ): void {
    addApplication(input);
    setShowAddForm(false);
  }

  function handleDelete(applicationId: string): void {
    const confirmed = window.confirm(
      "Delete this job application?",
    );

    if (!confirmed) {
      return;
    }

    deleteApplication(applicationId);
  }

  function handleClearAll(): void {
    const confirmed = window.confirm(
      "Delete every job application? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    clearAllApplications();
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-400">
            Loading job applications...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Panthrex Applications
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Job Tracker
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage applications, interviews, offers and
              follow-ups from one workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {stats.total > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Clear all
              </button>
            ) : null}

            <button
              type="button"
              onClick={() =>
                setShowAddForm((currentValue) => !currentValue)
              }
              className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {showAddForm ? "Close form" : "Add application"}
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          </article>

          {JOB_APPLICATION_STATUSES.map((status) => (
            <article
              key={status.value}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {status.label}
              </p>

              <p className="mt-2 text-2xl font-bold">
                {stats[status.value]}
              </p>
            </article>
          ))}
        </section>

        {showAddForm ? (
          <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Add job application
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Store the application details and track its
                progress.
              </p>
            </div>

            <JobApplicationForm
              onSubmit={handleAddApplication}
              onCancel={() => setShowAddForm(false)}
            />
          </section>
        ) : null}

        <section className="mb-6 grid gap-4 md:grid-cols-[1fr_240px]">
          <div>
            <label
              htmlFor="applicationSearch"
              className="sr-only"
            >
              Search applications
            </label>

            <input
              id="applicationSearch"
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search by company, role, recruiter or notes..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
            />
          </div>

          <div>
            <label
              htmlFor="statusFilter"
              className="sr-only"
            >
              Filter by status
            </label>

            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | JobApplicationStatus
                    | "all",
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
            >
              <option value="all">All statuses</option>

              {JOB_APPLICATION_STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const isSelected =
                  application.id === selectedApplicationId;

                return (
                  <article
                    key={application.id}
                    className={`rounded-2xl border p-5 transition ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/5"
                        : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedApplicationId(application.id)
                        }
                        className="flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-white">
                            {application.jobTitle}
                          </h2>

                          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                            {getStatusLabel(application.status)}
                          </span>

                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium capitalize text-slate-300">
                            {application.priority} priority
                          </span>
                        </div>

                        <p className="mt-2 font-medium text-slate-300">
                          {application.companyName}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span>
                            {application.location ||
                              "Location not specified"}
                          </span>

                          <span>
                            Applied:{" "}
                            {formatDate(application.appliedDate)}
                          </span>

                          {application.salary ? (
                            <span>{application.salary}</span>
                          ) : null}
                        </div>
                      </button>

                      <select
                        aria-label={`Update status for ${application.jobTitle}`}
                        value={application.status}
                        onChange={(event) =>
                          updateApplicationStatus(
                            application.id,
                            event.target
                              .value as JobApplicationStatus,
                          )
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        {JOB_APPLICATION_STATUSES.map(
                          (status) => (
                            <option
                              key={status.value}
                              value={status.value}
                            >
                              {status.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-slate-200">
                  No applications found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Add your first application or change the current
                  search filters.
                </p>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:sticky lg:top-6">
            {selectedApplication ? (
              <>
                <div className="border-b border-slate-800 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Application details
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {selectedApplication.jobTitle}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedApplication.companyName}
                  </p>
                </div>

                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="mt-1 font-medium text-slate-200">
                      {getStatusLabel(
                        selectedApplication.status,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Priority</dt>
                    <dd className="mt-1 font-medium capitalize text-slate-200">
                      {selectedApplication.priority}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Location</dt>
                    <dd className="mt-1 text-slate-200">
                      {selectedApplication.location || "Not set"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Salary</dt>
                    <dd className="mt-1 text-slate-200">
                      {selectedApplication.salary || "Not set"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">
                      Applied date
                    </dt>
                    <dd className="mt-1 text-slate-200">
                      {formatDate(
                        selectedApplication.appliedDate,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">
                      Interview date
                    </dt>
                    <dd className="mt-1 text-slate-200">
                      {formatDate(
                        selectedApplication.interviewDate,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Recruiter</dt>
                    <dd className="mt-1 text-slate-200">
                      {selectedApplication.recruiterName ||
                        "Not set"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">
                      Recruiter email
                    </dt>
                    <dd className="mt-1 break-all text-slate-200">
                      {selectedApplication.recruiterEmail ||
                        "Not set"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-slate-500">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-300">
                      {selectedApplication.notes ||
                        "No notes added."}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-3 border-t border-slate-800 pt-5">
                  {selectedApplication.jobUrl ? (
                    <a
                      href={selectedApplication.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full rounded-xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Open job listing
                    </a>
                  ) : null}

                  <Link
                    href={`/ats-score?applicationId=${selectedApplication.id}`}
                    className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Run ATS Score
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      duplicateApplication(
                        selectedApplication.id,
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
                  >
                    Duplicate application
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(selectedApplication.id)
                    }
                    className="w-full rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete application
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="font-semibold text-slate-200">
                  Select an application
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a job application to review its complete
                  details.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}