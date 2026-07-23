"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  CoverLetterApiResponse,
  GeneratedCoverLetter,
} from "@/lib/ai-cover-letter/types";
import type {
  AtsScoreError,
  AtsScoreResponse,
  AtsScoreResult,
} from "@/lib/ats-score/types";
import type {
  JobMatchError,
  JobMatchResponse,
  JobMatchResult,
} from "@/lib/job-matching/types";
import type {
  ResumeTailorAnalysis,
  TailorResumeResponse,
} from "@/lib/resume-tailor/types";

import type {
  ApplicationAgentInput,
  ApplicationAgentResult,
  ApplicationAgentStage,
  ApplicationAgentStep,
} from "./types";

const INITIAL_STEPS: ApplicationAgentStep[] = [
  {
    id: "job-match",
    label: "Analyse job match",
    description:
      "Compare the current resume with the vacancy requirements.",
    status: "pending",
    error: "",
  },
  {
    id: "resume-tailor",
    label: "Tailor resume",
    description:
      "Optimise the resume for the target role without inventing experience.",
    status: "pending",
    error: "",
  },
  {
    id: "ats-score",
    label: "Run ATS scan",
    description:
      "Measure the tailored resume against the vacancy.",
    status: "pending",
    error: "",
  },
  {
    id: "cover-letter",
    label: "Generate cover letter",
    description:
      "Create a targeted cover letter using the tailored resume.",
    status: "pending",
    error: "",
  },
];

function cloneSteps(): ApplicationAgentStep[] {
  return INITIAL_STEPS.map((step) => ({
    ...step,
  }));
}

function createId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `application-agent-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(
  value: unknown,
  fallback: string,
): string {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.error === "string" &&
    record.error.trim()
  ) {
    return record.error;
  }

  if (
    typeof record.details === "string" &&
    record.details.trim()
  ) {
    return record.details;
  }

  return fallback;
}

async function analyseJobMatch(
  input: ApplicationAgentInput,
): Promise<JobMatchResult> {
  const response = await fetch("/api/job-matching", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume: input.resume,
      jobDescription: input.jobDescription,
    }),
  });

  const data = (await readJson(response)) as
    | JobMatchResponse
    | JobMatchError
    | null;

  if (
    !response.ok ||
    !data ||
    !("success" in data) ||
    !data.success
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to analyse the job match.",
      ),
    );
  }

  return data.result;
}

async function tailorResume(
  input: ApplicationAgentInput,
): Promise<{
  tailoredResume: ApplicationAgentInput["resume"];
  analysis: ResumeTailorAnalysis;
}> {
  const response = await fetch("/api/resume-tailor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume: input.resume,
      targetRole: input.jobTitle,
      company: input.companyName,
      jobDescription: input.jobDescription,
    }),
  });

  const data = (await readJson(
    response,
  )) as TailorResumeResponse | null;

  if (
    !response.ok ||
    !data ||
    !data.success
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to tailor the resume.",
      ),
    );
  }

  return {
    tailoredResume: data.tailoredResume,
    analysis: data.analysis,
  };
}

async function runAtsScan(
  resume: ApplicationAgentInput["resume"],
  jobDescription: string,
): Promise<AtsScoreResult> {
  const response = await fetch("/api/ats-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume,
      jobDescription,
    }),
  });

  const data = (await readJson(response)) as
    | AtsScoreResponse
    | AtsScoreError
    | null;

  if (
    !response.ok ||
    !data ||
    !data.success
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to complete the ATS scan.",
      ),
    );
  }

  return data.result;
}

async function generateCoverLetter(
  input: ApplicationAgentInput,
  tailoredResume: ApplicationAgentInput["resume"],
): Promise<GeneratedCoverLetter> {
  const response = await fetch(
    "/api/ai-cover-letter",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: tailoredResume,
        companyName: input.companyName,
        hiringManagerName:
          input.hiringManagerName ?? "",
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        tone: "professional",
        length: "standard",
        additionalContext:
          input.additionalContext ?? "",
      }),
    },
  );

  const rawData = await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        rawData,
        "Unable to generate the cover letter.",
      ),
    );
  }

  if (!rawData || typeof rawData !== "object") {
    throw new Error(
      "The cover-letter API returned an invalid response.",
    );
  }

  const record = rawData as Record<string, unknown>;

  const payload =
    record.data &&
    typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const coverLetter =
    payload.coverLetter as
      | GeneratedCoverLetter
      | undefined;

  if (
    !coverLetter ||
    typeof coverLetter.content !== "string"
  ) {
    throw new Error(
      "The cover-letter API did not return a valid cover letter.",
    );
  }

  return (
    payload as unknown as CoverLetterApiResponse
  ).coverLetter;
}

export function useApplicationAgent() {
  const [stage, setStage] =
    useState<ApplicationAgentStage>("idle");

  const [steps, setSteps] =
    useState<ApplicationAgentStep[]>(cloneSteps);

  const [result, setResult] =
    useState<ApplicationAgentResult | null>(null);

  const [error, setError] = useState("");

  const isRunning =
    stage !== "idle" &&
    stage !== "completed" &&
    stage !== "failed";

  const updateStep = useCallback(
    (
      stepId: ApplicationAgentStep["id"],
      updates: Partial<ApplicationAgentStep>,
    ) => {
      setSteps((previous) =>
        previous.map((step) =>
          step.id === stepId
            ? {
                ...step,
                ...updates,
              }
            : step,
        ),
      );
    },
    [],
  );

  const reset = useCallback(() => {
    setStage("idle");
    setSteps(cloneSteps());
    setResult(null);
    setError("");
  }, []);

  const run = useCallback(
    async (
      input: ApplicationAgentInput,
    ): Promise<ApplicationAgentResult | null> => {
      if (isRunning) {
        return null;
      }

      const normalizedJobTitle =
        input.jobTitle.trim();

      const normalizedCompanyName =
        input.companyName.trim();

      const normalizedJobDescription =
        input.jobDescription.trim();

      if (!normalizedJobTitle) {
        setError("Enter the target job title.");
        return null;
      }

      if (!normalizedCompanyName) {
        setError("Enter the company name.");
        return null;
      }

      if (
        normalizedJobDescription.length < 50
      ) {
        setError(
          "Paste a job description containing at least 50 characters.",
        );
        return null;
      }

      const request: ApplicationAgentInput = {
        ...input,
        jobTitle: normalizedJobTitle,
        companyName: normalizedCompanyName,
        jobDescription:
          normalizedJobDescription,
      };

      setError("");
      setResult(null);
      setSteps(cloneSteps());

      try {
        setStage("analysing-match");
        updateStep("job-match", {
          status: "running",
          error: "",
        });

        const jobMatch =
          await analyseJobMatch(request);

        updateStep("job-match", {
          status: "completed",
        });

        setStage("tailoring-resume");
        updateStep("resume-tailor", {
          status: "running",
          error: "",
        });

        const tailoring =
          await tailorResume(request);

        updateStep("resume-tailor", {
          status: "completed",
        });

        setStage("scanning-ats");
        updateStep("ats-score", {
          status: "running",
          error: "",
        });

        const atsResult =
          await runAtsScan(
            tailoring.tailoredResume,
            request.jobDescription,
          );

        updateStep("ats-score", {
          status: "completed",
        });

        setStage("generating-cover-letter");
        updateStep("cover-letter", {
          status: "running",
          error: "",
        });

        const coverLetter =
          await generateCoverLetter(
            request,
            tailoring.tailoredResume,
          );

        updateStep("cover-letter", {
          status: "completed",
        });

        const now = new Date().toISOString();

        const completedResult: ApplicationAgentResult = {
          id: createId(),
          jobTitle: request.jobTitle,
          companyName: request.companyName,
          jobDescription:
            request.jobDescription,
          originalResume: request.resume,
          tailoredResume:
            tailoring.tailoredResume,
          jobMatch,
          tailorAnalysis:
            tailoring.analysis,
          atsResult,
          coverLetter,
          createdAt: now,
          updatedAt: now,
        };

        setResult(completedResult);
        setStage("completed");

        return completedResult;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "The Application Agent encountered an unexpected error.";

        setError(message);
        setStage("failed");

        setSteps((previous) =>
          previous.map((step) =>
            step.status === "running"
              ? {
                  ...step,
                  status: "failed",
                  error: message,
                }
              : step,
          ),
        );

        return null;
      }
    },
    [
      isRunning,
      updateStep,
    ],
  );

  return useMemo(
    () => ({
      stage,
      steps,
      result,
      error,
      isRunning,
      run,
      reset,
      setError,
    }),
    [
      stage,
      steps,
      result,
      error,
      isRunning,
      run,
      reset,
    ],
  );
}
