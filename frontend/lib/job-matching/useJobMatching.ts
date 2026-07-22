"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  JobMatchResult,
} from "@/lib/job-matching/types";

export type SavedJobMatch = {
  id: string;
  title: string;
  company?: string;
  jobDescription: string;
  result: JobMatchResult;
  createdAt: string;
  updatedAt: string;
};

export type SaveJobMatchInput = {
  title: string;
  company?: string;
  jobDescription: string;
  result: JobMatchResult;
};

const STORAGE_KEY = "panthrex-job-matches";

function createId(): string {
  return crypto.randomUUID();
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function isSavedJobMatch(
  value: unknown,
): value is SavedJobMatch {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const match = value as Partial<SavedJobMatch>;

  return (
    typeof match.id === "string" &&
    typeof match.title === "string" &&
    typeof match.jobDescription === "string" &&
    typeof match.createdAt === "string" &&
    typeof match.updatedAt === "string" &&
    typeof match.result === "object" &&
    match.result !== null
  );
}

function loadStoredMatches(): SavedJobMatch[] {
  try {
    const storedValue =
      localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isSavedJobMatch);
  } catch (error) {
    console.error(
      "Unable to load saved job matches:",
      error,
    );

    return [];
  }
}

export function useJobMatching() {
  const [savedMatches, setSavedMatches] =
    useState<SavedJobMatch[]>([]);

  const [selectedMatchId, setSelectedMatchId] =
    useState<string | null>(null);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    setSavedMatches(loadStoredMatches());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedMatches),
      );
    } catch (error) {
      console.error(
        "Unable to save job matches:",
        error,
      );
    }
  }, [savedMatches, isLoaded]);

  const selectedMatch = useMemo(
    () =>
      savedMatches.find(
        (match) =>
          match.id === selectedMatchId,
      ) ?? null,
    [savedMatches, selectedMatchId],
  );

  const saveMatch = useCallback(
    (
      input: SaveJobMatchInput,
    ): SavedJobMatch => {
      const timestamp = createTimestamp();

      const savedMatch: SavedJobMatch = {
        id: createId(),
        title:
          input.title.trim() ||
          "Untitled job match",
        company:
          input.company?.trim() || undefined,
        jobDescription:
          input.jobDescription.trim(),
        result: input.result,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setSavedMatches((currentMatches) => [
        savedMatch,
        ...currentMatches,
      ]);

      setSelectedMatchId(savedMatch.id);

      return savedMatch;
    },
    [],
  );

  const updateMatch = useCallback(
    (
      id: string,
      updates: Partial<
        Pick<
          SavedJobMatch,
          | "title"
          | "company"
          | "jobDescription"
          | "result"
        >
      >,
    ): void => {
      setSavedMatches((currentMatches) =>
        currentMatches.map((match) => {
          if (match.id !== id) {
            return match;
          }

          return {
            ...match,
            ...updates,
            title:
              updates.title !== undefined
                ? updates.title.trim() ||
                  "Untitled job match"
                : match.title,
            company:
              updates.company !== undefined
                ? updates.company.trim() ||
                  undefined
                : match.company,
            jobDescription:
              updates.jobDescription !==
              undefined
                ? updates.jobDescription.trim()
                : match.jobDescription,
            updatedAt: createTimestamp(),
          };
        }),
      );
    },
    [],
  );

  const deleteMatch = useCallback(
    (id: string): void => {
      setSavedMatches((currentMatches) =>
        currentMatches.filter(
          (match) => match.id !== id,
        ),
      );

      setSelectedMatchId((currentId) =>
        currentId === id ? null : currentId,
      );
    },
    [],
  );

  const duplicateMatch = useCallback(
    (id: string): SavedJobMatch | null => {
      const sourceMatch =
        savedMatches.find(
          (match) => match.id === id,
        );

      if (!sourceMatch) {
        return null;
      }

      const timestamp = createTimestamp();

      const duplicatedMatch: SavedJobMatch = {
        ...sourceMatch,
        id: createId(),
        title: `${sourceMatch.title} copy`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setSavedMatches((currentMatches) => [
        duplicatedMatch,
        ...currentMatches,
      ]);

      setSelectedMatchId(
        duplicatedMatch.id,
      );

      return duplicatedMatch;
    },
    [savedMatches],
  );

  const clearAllMatches = useCallback((): void => {
    setSavedMatches([]);
    setSelectedMatchId(null);
  }, []);

  const averageScore = useMemo(() => {
    if (savedMatches.length === 0) {
      return 0;
    }

    const totalScore = savedMatches.reduce(
      (total, match) =>
        total +
        match.result.overallScore,
      0,
    );

    return Number(
      (
        totalScore / savedMatches.length
      ).toFixed(1),
    );
  }, [savedMatches]);

  const bestMatch = useMemo(() => {
    if (savedMatches.length === 0) {
      return null;
    }

    return savedMatches.reduce(
      (best, current) =>
        current.result.overallScore >
        best.result.overallScore
          ? current
          : best,
    );
  }, [savedMatches]);

  return {
    isLoaded,
    savedMatches,
    selectedMatch,
    selectedMatchId,
    averageScore,
    bestMatch,
    setSelectedMatchId,
    saveMatch,
    updateMatch,
    deleteMatch,
    duplicateMatch,
    clearAllMatches,
  };
}