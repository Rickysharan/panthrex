"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_JOB_SEARCH_FILTERS,
  DEFAULT_JOB_SEARCH_PAGINATION,
  type JobSearchApiResponse,
  type JobSearchFilters,
  type JobSearchResult,
  type SavedJob,
} from "./types";

const SAVED_JOBS_STORAGE_KEY =
  "panthrex-saved-job-search-results";

function createSavedJobId(jobId: string) {
  return `${jobId}-${Date.now()}`;
}

function readSavedJobs(): SavedJob[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedJobs = window.localStorage.getItem(
      SAVED_JOBS_STORAGE_KEY,
    );

    if (!storedJobs) {
      return [];
    }

    const parsedJobs: unknown = JSON.parse(storedJobs);

    if (!Array.isArray(parsedJobs)) {
      return [];
    }

    return parsedJobs.filter(
      (item): item is SavedJob =>
        Boolean(item) &&
        typeof item === "object" &&
        "id" in item &&
        "job" in item &&
        "savedAt" in item &&
        typeof item.id === "string" &&
        typeof item.savedAt === "string",
    );
  } catch (error) {
    console.error(
      "Unable to load saved job-search results.",
      error,
    );

    return [];
  }
}

function writeSavedJobs(savedJobs: SavedJob[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      SAVED_JOBS_STORAGE_KEY,
      JSON.stringify(savedJobs),
    );
  } catch (error) {
    console.error(
      "Unable to save job-search results.",
      error,
    );
  }
}

export function useJobSearch() {
  const [jobs, setJobs] = useState<JobSearchResult[]>([]);
  const [savedJobs, setSavedJobs] =
    useState<SavedJob[]>(readSavedJobs);
  const [selectedJob, setSelectedJob] =
    useState<JobSearchResult | null>(null);
  const [filters, setFilters] =
    useState<JobSearchFilters>(
      DEFAULT_JOB_SEARCH_FILTERS,
    );
  const [pagination, setPagination] = useState(
    DEFAULT_JOB_SEARCH_PAGINATION,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [hasSearched, setHasSearched] =
    useState(false);

  const updateFilters = useCallback(
    (updates: Partial<JobSearchFilters>) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        ...updates,
      }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_JOB_SEARCH_FILTERS);
  }, []);

  const searchJobs = useCallback(
    async (
      requestedPage = 1,
      requestedFilters = filters,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/job-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filters: requestedFilters,
            page: requestedPage,
            pageSize: pagination.pageSize,
          }),
        });

        const data =
          (await response.json()) as JobSearchApiResponse;

        if (!response.ok || !data.success) {
          const message =
            data.success === false
              ? data.error
              : "Unable to search for jobs.";

          throw new Error(message);
        }

        setJobs(data.jobs);
        setPagination(data.pagination);
        setHasSearched(true);

        setSelectedJob((currentJob) => {
          if (!currentJob) {
            return data.jobs[0] ?? null;
          }

          const matchingJob = data.jobs.find(
            (job) => job.id === currentJob.id,
          );

          return matchingJob ?? data.jobs[0] ?? null;
        });
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to search for jobs.";

        setError(message);
        setJobs([]);
        setSelectedJob(null);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.pageSize],
  );

  const selectJob = useCallback(
    (job: JobSearchResult | null) => {
      setSelectedJob(job);
    },
    [],
  );

  const saveJob = useCallback(
    (job: JobSearchResult) => {
      setSavedJobs((currentSavedJobs) => {
        const alreadySaved =
          currentSavedJobs.some(
            (savedJob) =>
              savedJob.job.id === job.id,
          );

        if (alreadySaved) {
          return currentSavedJobs;
        }

        const nextSavedJobs: SavedJob[] = [
          {
            id: createSavedJobId(job.id),
            job,
            savedAt: new Date().toISOString(),
            notes: "",
          },
          ...currentSavedJobs,
        ];

        writeSavedJobs(nextSavedJobs);

        return nextSavedJobs;
      });
    },
    [],
  );

  const unsaveJob = useCallback((jobId: string) => {
    setSavedJobs((currentSavedJobs) => {
      const nextSavedJobs =
        currentSavedJobs.filter(
          (savedJob) =>
            savedJob.job.id !== jobId,
        );

      writeSavedJobs(nextSavedJobs);

      return nextSavedJobs;
    });
  }, []);

  const updateSavedJobNotes = useCallback(
    (jobId: string, notes: string) => {
      setSavedJobs((currentSavedJobs) => {
        const nextSavedJobs =
          currentSavedJobs.map((savedJob) =>
            savedJob.job.id === jobId
              ? {
                  ...savedJob,
                  notes,
                }
              : savedJob,
          );

        writeSavedJobs(nextSavedJobs);

        return nextSavedJobs;
      });
    },
    [],
  );

  const isJobSaved = useCallback(
    (jobId: string) =>
      savedJobs.some(
        (savedJob) =>
          savedJob.job.id === jobId,
      ),
    [savedJobs],
  );

  const goToNextPage = useCallback(() => {
    if (!pagination.hasNextPage || loading) {
      return;
    }

    void searchJobs(pagination.page + 1);
  }, [
    loading,
    pagination.hasNextPage,
    pagination.page,
    searchJobs,
  ]);

  const goToPreviousPage = useCallback(() => {
    if (
      !pagination.hasPreviousPage ||
      loading
    ) {
      return;
    }

    void searchJobs(pagination.page - 1);
  }, [
    loading,
    pagination.hasPreviousPage,
    pagination.page,
    searchJobs,
  ]);

  return useMemo(
    () => ({
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
      updateSavedJobNotes,
      isJobSaved,
      goToNextPage,
      goToPreviousPage,
    }),
    [
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
      updateSavedJobNotes,
      isJobSaved,
      goToNextPage,
      goToPreviousPage,
    ],
  );
}