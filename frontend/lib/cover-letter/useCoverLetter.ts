"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { defaultCoverLetterData } from "./default-data";
import type {
  CompanyDetails,
  CoverLetterContent,
  CoverLetterData,
  CoverLetterTemplate,
  GenerationOptions,
  ResumeReference,
} from "./types";

const STORAGE_KEY = "panthrex-cover-letter-draft";

const VALID_TEMPLATES: CoverLetterTemplate[] = [
  "professional",
  "modern",
  "minimal",
];

function createDefaultCoverLetterData(): CoverLetterData {
  const timestamp = new Date().toISOString();

  return {
    ...defaultCoverLetterData,
    company: {
      ...defaultCoverLetterData.company,
    },
    resume: {
      ...defaultCoverLetterData.resume,
    },
    content: {
      ...defaultCoverLetterData.content,
    },
    generation: {
      ...defaultCoverLetterData.generation,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function isCoverLetterTemplate(
  value: unknown,
): value is CoverLetterTemplate {
  return (
    typeof value === "string" &&
    VALID_TEMPLATES.includes(
      value as CoverLetterTemplate,
    )
  );
}

function isStoredCoverLetterData(
  value: unknown,
): value is Partial<CoverLetterData> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coverLetter =
    value as Partial<CoverLetterData>;

  return (
    Boolean(coverLetter.company) &&
    typeof coverLetter.company === "object" &&
    Boolean(coverLetter.resume) &&
    typeof coverLetter.resume === "object" &&
    Boolean(coverLetter.content) &&
    typeof coverLetter.content === "object" &&
    Boolean(coverLetter.generation) &&
    typeof coverLetter.generation === "object"
  );
}

function normalizeCoverLetterData(
  storedData: Partial<CoverLetterData>,
): CoverLetterData {
  const fallback = createDefaultCoverLetterData();

  return {
    ...fallback,
    ...storedData,
    template: isCoverLetterTemplate(
      storedData.template,
    )
      ? storedData.template
      : "professional",
    company: {
      ...fallback.company,
      ...storedData.company,
    },
    resume: {
      ...fallback.resume,
      ...storedData.resume,
    },
    content: {
      ...fallback.content,
      ...storedData.content,
    },
    generation: {
      ...fallback.generation,
      ...storedData.generation,
    },
    createdAt:
      typeof storedData.createdAt === "string"
        ? storedData.createdAt
        : fallback.createdAt,
    updatedAt:
      typeof storedData.updatedAt === "string"
        ? storedData.updatedAt
        : fallback.updatedAt,
  };
}

function readStoredCoverLetterData():
  | CoverLetterData
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (isStoredCoverLetterData(parsedValue)) {
      return normalizeCoverLetterData(parsedValue);
    }
  } catch (error) {
    console.error(
      "Unable to load the saved cover letter draft.",
      error,
    );
  }

  return null;
}

export function useCoverLetter() {
  const [coverLetterData, setCoverLetterData] =
    useState<CoverLetterData>(() =>
      readStoredCoverLetterData() ??
      createDefaultCoverLetterData(),
    );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [hasLoadedStorage] =
    useState(true);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      try {
        const updatedCoverLetter: CoverLetterData = {
          ...coverLetterData,
          updatedAt: new Date().toISOString(),
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedCoverLetter),
        );

        setLastSavedAt(new Date());
      } catch (error) {
        console.error(
          "Unable to save the cover letter draft.",
          error,
        );
      }
    }, 400);

    return () => {
      window.clearTimeout(saveTimer);
    };
  }, [coverLetterData, hasLoadedStorage]);

  const updateCompany = useCallback(
    (updates: Partial<CompanyDetails>) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        company: {
          ...currentData.company,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateResume = useCallback(
    (updates: Partial<ResumeReference>) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        resume: {
          ...currentData.resume,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateTemplate = useCallback(
    (template: CoverLetterTemplate) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        template,
      }));
    },
    [],
  );

  const updateContent = useCallback(
    (updates: Partial<CoverLetterContent>) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        content: {
          ...currentData.content,
          ...updates,
        },
      }));
    },
    [],
  );

  const updateGenerationOptions = useCallback(
    (updates: Partial<GenerationOptions>) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        generation: {
          ...currentData.generation,
          ...updates,
        },
      }));
    },
    [],
  );

  const replaceContent = useCallback(
    (content: CoverLetterContent) => {
      setCoverLetterData((currentData) => ({
        ...currentData,
        content: {
          ...content,
        },
      }));
    },
    [],
  );

  const resetCoverLetter = useCallback(() => {
    setCoverLetterData(
      createDefaultCoverLetterData(),
    );
    setLastSavedAt(null);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Unable to remove the saved cover letter draft.",
        error,
      );
    }
  }, []);

  return useMemo(
    () => ({
      coverLetterData,
      lastSavedAt,
      hasLoadedStorage,
      updateCompany,
      updateResume,
      updateTemplate,
      updateContent,
      updateGenerationOptions,
      replaceContent,
      resetCoverLetter,
    }),
    [
      coverLetterData,
      lastSavedAt,
      hasLoadedStorage,
      updateCompany,
      updateResume,
      updateTemplate,
      updateContent,
      updateGenerationOptions,
      replaceContent,
      resetCoverLetter,
    ],
  );
}