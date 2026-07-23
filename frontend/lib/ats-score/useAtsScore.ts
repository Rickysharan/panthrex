"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  AtsScoreError,
  AtsScoreResponse,
  AtsScoreResult,
} from "@/lib/ats-score/types";
import type { ResumeData } from "@/lib/resume/types";

type AnalyseResumeInput = {
  resume: ResumeData;
  jobDescription: string;
};

function isAtsScoreResponse(
  value: unknown,
): value is AtsScoreResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true &&
    "result" in value &&
    typeof value.result === "object" &&
    value.result !== null
  );
}

function isAtsScoreError(
  value: unknown,
): value is AtsScoreError {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === false &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export function useAtsScore() {
  const [result, setResult] =
    useState<AtsScoreResult | null>(null);

  const [isAnalysing, setIsAnalysing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const analyseResume = useCallback(
    async (
      input: AnalyseResumeInput,
    ): Promise<AtsScoreResult | null> => {
      const jobDescription =
        input.jobDescription.trim();

      if (jobDescription.length < 50) {
        setError(
          "Enter a job description containing at least 50 characters.",
        );

        return null;
      }

      setIsAnalysing(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/ats-score",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              resume: input.resume,
              jobDescription,
            }),
          },
        );

        let responseBody: unknown;

        try {
          responseBody =
            await response.json();
        } catch {
          throw new Error(
            "The ATS service returned an invalid response.",
          );
        }

        if (
          !response.ok ||
          isAtsScoreError(responseBody)
        ) {
          const message =
            isAtsScoreError(responseBody)
              ? responseBody.error
              : "Unable to analyse the resume.";

          throw new Error(message);
        }

        if (
          !isAtsScoreResponse(responseBody)
        ) {
          throw new Error(
            "The ATS analysis response was incomplete.",
          );
        }

        setResult(responseBody.result);

        return responseBody.result;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "An unexpected error occurred.";

        setError(message);

        return null;
      } finally {
        setIsAnalysing(false);
      }
    },
    [],
  );

  const loadResult = useCallback(
    (savedResult: AtsScoreResult): void => {
      setResult(savedResult);
      setError(null);
      setIsAnalysing(false);
    },
    [],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const hasResult = result !== null;

  const criticalIssueCount = useMemo(
    () =>
      result?.issues.filter(
        (issue) =>
          issue.severity === "critical",
      ).length ?? 0,
    [result],
  );

  const highPriorityRecommendationCount =
    useMemo(
      () =>
        result?.recommendations.filter(
          (recommendation) =>
            recommendation.priority ===
              "critical" ||
            recommendation.priority ===
              "high",
        ).length ?? 0,
      [result],
    );

  const passedFormattingChecks =
    useMemo(
      () =>
        result?.formattingChecks.filter(
          (check) => check.passed,
        ).length ?? 0,
      [result],
    );

  const totalFormattingChecks =
    result?.formattingChecks.length ?? 0;

  return {
    result,
    error,
    isAnalysing,
    hasResult,
    criticalIssueCount,
    highPriorityRecommendationCount,
    passedFormattingChecks,
    totalFormattingChecks,
    analyseResume,
    loadResult,
    clearResult,
  };
}