"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  clearAtsAnalyses,
  createAtsAnalysis,
  deleteAtsAnalysis,
  getAtsAnalyses,
  updateAtsAnalysis,
} from "@/lib/ats-score/history-service";
import type { AtsScoreResult } from "@/lib/ats-score/types";

const MAX_SAVED_ANALYSES = 25;

export type SavedAtsAnalysis = {
  id: string;
  title: string;
  company: string;
  jobDescription: string;
  resumeName: string;
  result: AtsScoreResult;
  createdAt: string;
  updatedAt: string;
};

type SaveAtsAnalysisInput = {
  title?: string;
  company?: string;
  jobDescription: string;
  resumeName: string;
  result: AtsScoreResult;
};

type UpdateAtsAnalysisFields = Partial<
  Pick<
    SavedAtsAnalysis,
    | "title"
    | "company"
    | "jobDescription"
    | "resumeName"
    | "result"
  >
>;

function createTemporaryId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return [
    "temporary",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}

function normalizeTitle(
  title: string | undefined,
  company: string | undefined,
): string {
  const normalizedTitle = title?.trim() ?? "";
  const normalizedCompany =
    company?.trim() ?? "";

  if (normalizedTitle) {
    return normalizedTitle;
  }

  if (normalizedCompany) {
    return `${normalizedCompany} ATS analysis`;
  }

  return "Untitled ATS analysis";
}

function normalizeResumeName(
  value: string | undefined,
): string {
  return value?.trim() || "Current resume";
}

function sortAnalyses(
  analyses: SavedAtsAnalysis[],
): SavedAtsAnalysis[] {
  return [...analyses]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, MAX_SAVED_ANALYSES);
}

export function useAtsScoreHistory() {
  const [savedAnalyses, setSavedAnalyses] =
    useState<SavedAtsAnalysis[]>([]);

  const [selectedAnalysisId, setSelectedAnalysisId] =
    useState<string | null>(null);

  const [isHydrated, setIsHydrated] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalyses(): Promise<void> {
      setIsHydrated(false);
      setError(null);

      try {
        const analyses =
          await getAtsAnalyses();

        if (cancelled) {
          return;
        }

        setSavedAnalyses(
          sortAnalyses(analyses),
        );
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load ATS analyses.";

        setError(message);
        setSavedAnalyses([]);
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void loadAnalyses();

    return () => {
      cancelled = true;
    };
  }, []);

  const replaceAnalysis = useCallback(
    (
      currentId: string,
      replacement: SavedAtsAnalysis,
    ): void => {
      setSavedAnalyses((current) =>
        sortAnalyses(
          current.map((analysis) =>
            analysis.id === currentId
              ? replacement
              : analysis,
          ),
        ),
      );

      setSelectedAnalysisId((selectedId) =>
        selectedId === currentId
          ? replacement.id
          : selectedId,
      );
    },
    [],
  );

  const removeAnalysisFromState =
    useCallback((id: string): void => {
      setSavedAnalyses((current) =>
        current.filter(
          (analysis) => analysis.id !== id,
        ),
      );

      setSelectedAnalysisId((currentId) =>
        currentId === id ? null : currentId,
      );
    }, []);

  const saveAnalysis = useCallback(
    async (
      input: SaveAtsAnalysisInput,
    ): Promise<SavedAtsAnalysis> => {
      const timestamp =
        new Date().toISOString();

      const temporaryAnalysis: SavedAtsAnalysis =
        {
          id: createTemporaryId(),
          title: normalizeTitle(
            input.title,
            input.company,
          ),
          company:
            input.company?.trim() ?? "",
          jobDescription:
            input.jobDescription.trim(),
          resumeName: normalizeResumeName(
            input.resumeName,
          ),
          result: input.result,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

      setError(null);

      setSavedAnalyses((current) =>
        sortAnalyses([
          temporaryAnalysis,
          ...current,
        ]),
      );

      setSelectedAnalysisId(
        temporaryAnalysis.id,
      );

      try {
        const createdAnalysis =
          await createAtsAnalysis({
            title: temporaryAnalysis.title,
            company:
              temporaryAnalysis.company,
            jobDescription:
              temporaryAnalysis.jobDescription,
            resumeName:
              temporaryAnalysis.resumeName,
            result: temporaryAnalysis.result,
          });

        if (isMountedRef.current) {
          replaceAnalysis(
            temporaryAnalysis.id,
            createdAnalysis,
          );
        }

        return createdAnalysis;
      } catch (caughtError: unknown) {
        if (isMountedRef.current) {
          removeAnalysisFromState(
            temporaryAnalysis.id,
          );

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to save ATS analysis.";

          setError(message);
        }

        throw caughtError;
      }
    },
    [
      removeAnalysisFromState,
      replaceAnalysis,
    ],
  );

  const updateAnalysis = useCallback(
    (
      id: string,
      updates: UpdateAtsAnalysisFields,
    ): SavedAtsAnalysis | null => {
      const existingAnalysis =
        savedAnalyses.find(
          (analysis) => analysis.id === id,
        );

      if (!existingAnalysis) {
        return null;
      }

      const updatedAnalysis: SavedAtsAnalysis =
        {
          ...existingAnalysis,
          ...updates,
          title:
            updates.title !== undefined
              ? normalizeTitle(
                  updates.title,
                  updates.company ??
                    existingAnalysis.company,
                )
              : existingAnalysis.title,
          company:
            updates.company !== undefined
              ? updates.company.trim()
              : existingAnalysis.company,
          jobDescription:
            updates.jobDescription !==
            undefined
              ? updates.jobDescription.trim()
              : existingAnalysis.jobDescription,
          resumeName:
            updates.resumeName !== undefined
              ? normalizeResumeName(
                  updates.resumeName,
                )
              : existingAnalysis.resumeName,
          updatedAt:
            new Date().toISOString(),
        };

      setError(null);

      setSavedAnalyses((current) =>
        sortAnalyses(
          current.map((analysis) =>
            analysis.id === id
              ? updatedAnalysis
              : analysis,
          ),
        ),
      );

      void updateAtsAnalysis(id, {
        title: updatedAnalysis.title,
        company:
          updatedAnalysis.company,
        jobDescription:
          updatedAnalysis.jobDescription,
        resumeName:
          updatedAnalysis.resumeName,
        result: updatedAnalysis.result,
      })
        .then((serverAnalysis) => {
          if (!isMountedRef.current) {
            return;
          }

          replaceAnalysis(
            id,
            serverAnalysis,
          );
        })
        .catch((caughtError: unknown) => {
          if (!isMountedRef.current) {
            return;
          }

          setSavedAnalyses((current) =>
            sortAnalyses(
              current.map((analysis) =>
                analysis.id === id
                  ? existingAnalysis
                  : analysis,
              ),
            ),
          );

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to update ATS analysis.";

          setError(message);
        });

      return updatedAnalysis;
    },
    [
      replaceAnalysis,
      savedAnalyses,
    ],
  );

  const deleteAnalysis = useCallback(
    (id: string): void => {
      const deletedAnalysis =
        savedAnalyses.find(
          (analysis) => analysis.id === id,
        );

      if (!deletedAnalysis) {
        return;
      }

      const deletedIndex =
        savedAnalyses.findIndex(
          (analysis) => analysis.id === id,
        );

      setError(null);
      removeAnalysisFromState(id);

      void deleteAtsAnalysis(id).catch(
        (caughtError: unknown) => {
          if (!isMountedRef.current) {
            return;
          }

          setSavedAnalyses((current) => {
            const restored = [...current];

            restored.splice(
              Math.max(0, deletedIndex),
              0,
              deletedAnalysis,
            );

            return sortAnalyses(restored);
          });

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to delete ATS analysis.";

          setError(message);
        },
      );
    },
    [
      removeAnalysisFromState,
      savedAnalyses,
    ],
  );

  const duplicateAnalysis = useCallback(
    async (
      id: string,
    ): Promise<SavedAtsAnalysis | null> => {
      const sourceAnalysis =
        savedAnalyses.find(
          (analysis) => analysis.id === id,
        );

      if (!sourceAnalysis) {
        return null;
      }

      return saveAnalysis({
        title: `${sourceAnalysis.title} copy`,
        company: sourceAnalysis.company,
        jobDescription:
          sourceAnalysis.jobDescription,
        resumeName:
          sourceAnalysis.resumeName,
        result: sourceAnalysis.result,
      });
    },
    [saveAnalysis, savedAnalyses],
  );

  const clearAllAnalyses =
    useCallback((): void => {
      const previousAnalyses =
        savedAnalyses;

      setError(null);
      setSavedAnalyses([]);
      setSelectedAnalysisId(null);

      void clearAtsAnalyses().catch(
        (caughtError: unknown) => {
          if (!isMountedRef.current) {
            return;
          }

          setSavedAnalyses(
            sortAnalyses(previousAnalyses),
          );

          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to clear ATS analyses.";

          setError(message);
        },
      );
    }, [savedAnalyses]);

  const refreshAnalyses =
    useCallback(async (): Promise<void> => {
      setIsHydrated(false);
      setError(null);

      try {
        const analyses =
          await getAtsAnalyses();

        if (!isMountedRef.current) {
          return;
        }

        setSavedAnalyses(
          sortAnalyses(analyses),
        );
      } catch (caughtError) {
        if (!isMountedRef.current) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load ATS analyses.";

        setError(message);
      } finally {
        if (isMountedRef.current) {
          setIsHydrated(true);
        }
      }
    }, []);

  const selectedAnalysis = useMemo(
    () =>
      savedAnalyses.find(
        (analysis) =>
          analysis.id === selectedAnalysisId,
      ) ?? null,
    [savedAnalyses, selectedAnalysisId],
  );

  const averageScore = useMemo(() => {
    if (savedAnalyses.length === 0) {
      return 0;
    }

    const totalScore =
      savedAnalyses.reduce(
        (sum, analysis) =>
          sum +
          analysis.result.overallScore,
        0,
      );

    return Math.round(
      totalScore / savedAnalyses.length,
    );
  }, [savedAnalyses]);

  const bestAnalysis = useMemo(() => {
    if (savedAnalyses.length === 0) {
      return null;
    }

    return savedAnalyses.reduce(
      (best, analysis) =>
        analysis.result.overallScore >
        best.result.overallScore
          ? analysis
          : best,
    );
  }, [savedAnalyses]);

  const mostRecentAnalysis =
    savedAnalyses[0] ?? null;

  return {
    savedAnalyses,
    selectedAnalysisId,
    selectedAnalysis,
    averageScore,
    bestAnalysis,
    mostRecentAnalysis,
    isHydrated,
    error,
    setSelectedAnalysisId,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
    duplicateAnalysis,
    clearAllAnalyses,
    refreshAnalyses,
  };
}