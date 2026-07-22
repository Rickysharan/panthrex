"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CreateJobApplicationInput,
  JobApplication,
  JobApplicationStats,
  JobApplicationStatus,
  UpdateJobApplicationInput,
} from "./types";

const STORAGE_KEY = "panthrex-job-applications";

function createId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `job-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function readStoredApplications(): JobApplication[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is JobApplication =>
        Boolean(
          item &&
            typeof item === "object" &&
            "id" in item &&
            "companyName" in item &&
            "jobTitle" in item,
        ),
    );
  } catch (error) {
    console.error(
      "Failed to read job applications from local storage:",
      error,
    );

    return [];
  }
}

function saveStoredApplications(
  applications: JobApplication[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications),
    );
  } catch (error) {
    console.error(
      "Failed to save job applications to local storage:",
      error,
    );
  }
}

export function useJobTracker() {
  const [applications, setApplications] = useState<
    JobApplication[]
  >([]);

  const [selectedApplicationId, setSelectedApplicationId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    JobApplicationStatus | "all"
  >("all");

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setApplications(readStoredApplications());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    saveStoredApplications(applications);
  }, [applications, isLoaded]);

  const addApplication = useCallback(
    (
      input: CreateJobApplicationInput,
    ): JobApplication => {
      const now = new Date().toISOString();

      const application: JobApplication = {
        ...input,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      };

      setApplications((currentApplications) => [
        application,
        ...currentApplications,
      ]);

      setSelectedApplicationId(application.id);

      return application;
    },
    [],
  );

  const updateApplication = useCallback(
    (
      applicationId: string,
      updates: UpdateJobApplicationInput,
    ): void => {
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : application,
        ),
      );
    },
    [],
  );

  const updateApplicationStatus = useCallback(
    (
      applicationId: string,
      status: JobApplicationStatus,
    ): void => {
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
                updatedAt: new Date().toISOString(),
              }
            : application,
        ),
      );
    },
    [],
  );

  const deleteApplication = useCallback(
    (applicationId: string): void => {
      setApplications((currentApplications) =>
        currentApplications.filter(
          (application) =>
            application.id !== applicationId,
        ),
      );

      setSelectedApplicationId((currentSelectedId) =>
        currentSelectedId === applicationId
          ? null
          : currentSelectedId,
      );
    },
    [],
  );

  const duplicateApplication = useCallback(
    (applicationId: string): JobApplication | null => {
      const sourceApplication = applications.find(
        (application) => application.id === applicationId,
      );

      if (!sourceApplication) {
        return null;
      }

      const now = new Date().toISOString();

      const duplicatedApplication: JobApplication = {
        ...sourceApplication,
        id: createId(),
        companyName: `${sourceApplication.companyName}`,
        jobTitle: `${sourceApplication.jobTitle}`,
        status: "wishlist",
        appliedDate: "",
        interviewDate: "",
        createdAt: now,
        updatedAt: now,
      };

      setApplications((currentApplications) => [
        duplicatedApplication,
        ...currentApplications,
      ]);

      setSelectedApplicationId(
        duplicatedApplication.id,
      );

      return duplicatedApplication;
    },
    [applications],
  );

  const selectedApplication = useMemo(
    () =>
      applications.find(
        (application) =>
          application.id === selectedApplicationId,
      ) ?? null,
    [applications, selectedApplicationId],
  );

  const filteredApplications = useMemo(() => {
    const normalizedSearchQuery = searchQuery
      .trim()
      .toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      return [
        application.companyName,
        application.jobTitle,
        application.location,
        application.recruiterName,
        application.recruiterEmail,
        application.notes,
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearchQuery),
      );
    });
  }, [applications, searchQuery, statusFilter]);

  const stats = useMemo<JobApplicationStats>(() => {
    return applications.reduce<JobApplicationStats>(
      (currentStats, application) => {
        currentStats.total += 1;
        currentStats[application.status] += 1;

        return currentStats;
      },
      {
        total: 0,
        wishlist: 0,
        applied: 0,
        assessment: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
      },
    );
  }, [applications]);

  const clearAllApplications = useCallback((): void => {
    setApplications([]);
    setSelectedApplicationId(null);
  }, []);

  return {
    applications,
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
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
    duplicateApplication,
    clearAllApplications,
  };
}