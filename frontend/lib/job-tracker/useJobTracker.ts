"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import type {
  CreateJobApplicationInput,
  JobApplication,
  JobApplicationStats,
  JobApplicationStatus,
  UpdateJobApplicationInput,
} from "./types";

type JobApplicationRow = {
  id: string;
  user_id: string;
  company: string;
  title: string;
  location: string | null;
  job_url: string | null;
  salary: string | null;
  description: string | null;
  status: JobApplicationStatus;
  priority: JobApplication["priority"];
  applied_date: string | null;
  interview_date: string | null;
  recruiter: string | null;
  recruiter_email: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  ats_analysis_id: string | null;
  interview_session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function mapRowToApplication(
  row: JobApplicationRow,
): JobApplication {
  return {
    id: row.id,
    companyName: row.company,
    jobTitle: row.title,
    location: row.location ?? "",
    jobUrl: row.job_url ?? "",
    salary: row.salary ?? "",
    jobDescription: row.description ?? "",
    status: row.status,
    priority: row.priority,
    appliedDate: row.applied_date ?? "",
    interviewDate: row.interview_date ?? "",
    recruiterName: row.recruiter ?? "",
    recruiterEmail: row.recruiter_email ?? "",
    resumeId: row.resume_id ?? "",
    coverLetterId: row.cover_letter_id ?? "",
    atsAnalysisId: row.ats_analysis_id ?? "",
    interviewSessionId: row.interview_session_id ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function emptyToNull(value: string | undefined): string | null {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : null;
}

function createInsertPayload(
  input: CreateJobApplicationInput,
  userId: string,
) {
  return {
    user_id: userId,
    company: input.companyName.trim(),
    title: input.jobTitle.trim(),
    location: emptyToNull(input.location),
    job_url: emptyToNull(input.jobUrl),
    salary: emptyToNull(input.salary),
    description: emptyToNull(input.jobDescription),
    status: input.status,
    priority: input.priority,
    applied_date: emptyToNull(input.appliedDate),
    interview_date: emptyToNull(input.interviewDate),
    recruiter: emptyToNull(input.recruiterName),
    recruiter_email: emptyToNull(input.recruiterEmail),
    resume_id: emptyToNull(input.resumeId),
    cover_letter_id: emptyToNull(input.coverLetterId),
    ats_analysis_id: emptyToNull(input.atsAnalysisId),
    interview_session_id: emptyToNull(
      input.interviewSessionId,
    ),
    notes: emptyToNull(input.notes),
  };
}

function createUpdatePayload(
  updates: UpdateJobApplicationInput,
): Record<string, string | null> {
  const payload: Record<string, string | null> = {};

  if (updates.companyName !== undefined) {
    payload.company = updates.companyName.trim();
  }

  if (updates.jobTitle !== undefined) {
    payload.title = updates.jobTitle.trim();
  }

  if (updates.location !== undefined) {
    payload.location = emptyToNull(updates.location);
  }

  if (updates.jobUrl !== undefined) {
    payload.job_url = emptyToNull(updates.jobUrl);
  }

  if (updates.salary !== undefined) {
    payload.salary = emptyToNull(updates.salary);
  }

  if (updates.jobDescription !== undefined) {
    payload.description = emptyToNull(
      updates.jobDescription,
    );
  }

  if (updates.status !== undefined) {
    payload.status = updates.status;
  }

  if (updates.priority !== undefined) {
    payload.priority = updates.priority;
  }

  if (updates.appliedDate !== undefined) {
    payload.applied_date = emptyToNull(
      updates.appliedDate,
    );
  }

  if (updates.interviewDate !== undefined) {
    payload.interview_date = emptyToNull(
      updates.interviewDate,
    );
  }

  if (updates.recruiterName !== undefined) {
    payload.recruiter = emptyToNull(
      updates.recruiterName,
    );
  }

  if (updates.recruiterEmail !== undefined) {
    payload.recruiter_email = emptyToNull(
      updates.recruiterEmail,
    );
  }

  if (updates.resumeId !== undefined) {
    payload.resume_id = emptyToNull(updates.resumeId);
  }

  if (updates.coverLetterId !== undefined) {
    payload.cover_letter_id = emptyToNull(
      updates.coverLetterId,
    );
  }

  if (updates.atsAnalysisId !== undefined) {
    payload.ats_analysis_id = emptyToNull(
      updates.atsAnalysisId,
    );
  }

  if (updates.interviewSessionId !== undefined) {
    payload.interview_session_id = emptyToNull(
      updates.interviewSessionId,
    );
  }

  if (updates.notes !== undefined) {
    payload.notes = emptyToNull(updates.notes);
  }

  return payload;
}

export function useJobTracker() {
  const supabase = useMemo(() => createClient(), []);

  const [applications, setApplications] = useState<
    JobApplication[]
  >([]);

  const [selectedApplicationId, setSelectedApplicationId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    JobApplicationStatus | "all"
  >("all");

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(
    async (authenticatedUserId: string) => {
      setError(null);

      const { data, error: queryError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", authenticatedUserId)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error(
          "Failed to load job applications:",
          queryError,
        );
        setError(queryError.message);
        setApplications([]);
        return;
      }

      const loadedApplications = (
        (data ?? []) as JobApplicationRow[]
      ).map(mapRowToApplication);

      setApplications(loadedApplications);

      setSelectedApplicationId((currentId) => {
        if (
          currentId &&
          loadedApplications.some(
            (application) => application.id === currentId,
          )
        ) {
          return currentId;
        }

        return loadedApplications[0]?.id ?? null;
      });
    },
    [supabase],
  );

  useEffect(() => {
    let isMounted = true;

    async function initialiseTracker() {
      setIsLoaded(false);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (authError) {
        console.error(
          "Failed to read authenticated user:",
          authError,
        );
        setError(authError.message);
        setUserId(null);
        setApplications([]);
        setIsLoaded(true);
        return;
      }

      if (!user) {
        setUserId(null);
        setApplications([]);
        setSelectedApplicationId(null);
        setIsLoaded(true);
        return;
      }

      setUserId(user.id);
      await loadApplications(user.id);

      if (isMounted) {
        setIsLoaded(true);
      }
    }

    void initialiseTracker();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticatedUserId =
        session?.user.id ?? null;

      setUserId(authenticatedUserId);
      setError(null);

      if (!authenticatedUserId) {
        setApplications([]);
        setSelectedApplicationId(null);
        setIsLoaded(true);
        return;
      }

      setIsLoaded(false);

      void loadApplications(authenticatedUserId).finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadApplications, supabase]);

  const addApplication = useCallback(
    async (
      input: CreateJobApplicationInput,
    ): Promise<JobApplication | null> => {
      if (!userId) {
        setError(
          "You must be signed in to add a job application.",
        );
        return null;
      }

      setError(null);

      const { data, error: insertError } = await supabase
        .from("job_applications")
        .insert(createInsertPayload(input, userId))
        .select("*")
        .single();

      if (insertError) {
        console.error(
          "Failed to add job application:",
          insertError,
        );
        setError(insertError.message);
        return null;
      }

      const application = mapRowToApplication(
        data as JobApplicationRow,
      );

      setApplications((currentApplications) => [
        application,
        ...currentApplications,
      ]);

      setSelectedApplicationId(application.id);

      return application;
    },
    [supabase, userId],
  );

  const updateApplication = useCallback(
    async (
      applicationId: string,
      updates: UpdateJobApplicationInput,
    ): Promise<void> => {
      const payload = createUpdatePayload(updates);

      if (Object.keys(payload).length === 0) {
        return;
      }

      setError(null);

      const { data, error: updateError } = await supabase
        .from("job_applications")
        .update(payload)
        .eq("id", applicationId)
        .select("*")
        .single();

      if (updateError) {
        console.error(
          "Failed to update job application:",
          updateError,
        );
        setError(updateError.message);
        return;
      }

      const updatedApplication = mapRowToApplication(
        data as JobApplicationRow,
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId
            ? updatedApplication
            : application,
        ),
      );
    },
    [supabase],
  );

  const updateApplicationStatus = useCallback(
    async (
      applicationId: string,
      status: JobApplicationStatus,
    ): Promise<void> => {
      await updateApplication(applicationId, { status });
    },
    [updateApplication],
  );

  const deleteApplication = useCallback(
    async (applicationId: string): Promise<void> => {
      setError(null);

      const { error: deleteError } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", applicationId);

      if (deleteError) {
        console.error(
          "Failed to delete job application:",
          deleteError,
        );
        setError(deleteError.message);
        return;
      }

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
    [supabase],
  );

  const duplicateApplication = useCallback(
    async (
      applicationId: string,
    ): Promise<JobApplication | null> => {
      const sourceApplication = applications.find(
        (application) => application.id === applicationId,
      );

      if (!sourceApplication) {
        return null;
      }

      return addApplication({
        companyName: sourceApplication.companyName,
        jobTitle: sourceApplication.jobTitle,
        location: sourceApplication.location,
        jobUrl: sourceApplication.jobUrl,
        salary: sourceApplication.salary,
        jobDescription:
          sourceApplication.jobDescription ?? "",
        status: "wishlist",
        priority: sourceApplication.priority,
        appliedDate: "",
        interviewDate: "",
        recruiterName: sourceApplication.recruiterName,
        recruiterEmail: sourceApplication.recruiterEmail,
        resumeId: sourceApplication.resumeId,
        coverLetterId: sourceApplication.coverLetterId,
        atsAnalysisId:
          sourceApplication.atsAnalysisId ?? "",
        interviewSessionId:
          sourceApplication.interviewSessionId ?? "",
        notes: sourceApplication.notes,
      });
    },
    [addApplication, applications],
  );

  const clearAllApplications = useCallback(
    async (): Promise<void> => {
      if (!userId) {
        return;
      }

      setError(null);

      const { error: deleteError } = await supabase
        .from("job_applications")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        console.error(
          "Failed to clear job applications:",
          deleteError,
        );
        setError(deleteError.message);
        return;
      }

      setApplications([]);
      setSelectedApplicationId(null);
    },
    [supabase, userId],
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

  return {
    applications,
    filteredApplications,
    selectedApplication,
    selectedApplicationId,
    searchQuery,
    statusFilter,
    stats,
    isLoaded,
    error,
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
