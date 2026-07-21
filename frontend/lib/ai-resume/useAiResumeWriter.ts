"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  AiResumeSuggestion,
  AiResumeWriterErrorResponse,
  AiResumeWriterRequest,
  AiResumeWriterResponse,
} from "@/lib/ai-resume/types";

type GenerateSuggestionsOptions = Omit<
  AiResumeWriterRequest,
  "resumeData"
> & {
  resumeData: AiResumeWriterRequest["resumeData"];
};

type UseAiResumeWriterResult = {
  suggestions: AiResumeSuggestion[];
  isGenerating: boolean;
  error: string | null;
  generateSuggestions: (
    request: GenerateSuggestionsOptions,
  ) => Promise<AiResumeSuggestion[]>;
  clearSuggestions: () => void;
  clearError: () => void;
};

function isAiResumeWriterResponse(
  value: unknown,
): value is AiResumeWriterResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("suggestions" in value)
  ) {
    return false;
  }

  const suggestions = (
    value as {
      suggestions?: unknown;
    }
  ).suggestions;

  return (
    Array.isArray(suggestions) &&
    suggestions.every(
      (suggestion) =>
        typeof suggestion === "object" &&
        suggestion !== null &&
        "id" in suggestion &&
        typeof suggestion.id === "string" &&
        "content" in suggestion &&
        typeof suggestion.content === "string",
    )
  );
}

function getErrorMessage(
  responseBody: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof responseBody === "object" &&
    responseBody !== null &&
    "error" in responseBody &&
    typeof responseBody.error === "string"
  ) {
    const errorResponse =
      responseBody as AiResumeWriterErrorResponse;

    if (errorResponse.details) {
      return `${errorResponse.error} ${errorResponse.details}`;
    }

    return errorResponse.error;
  }

  return fallbackMessage;
}

export function useAiResumeWriter(): UseAiResumeWriterResult {
  const [suggestions, setSuggestions] = useState<
    AiResumeSuggestion[]
  >([]);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const generateSuggestions = useCallback(
    async (
      request: GenerateSuggestionsOptions,
    ): Promise<AiResumeSuggestion[]> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/ai-resume-writer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          },
        );

        let responseBody: unknown;

        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              responseBody,
              "Unable to generate resume suggestions.",
            ),
          );
        }

        if (!isAiResumeWriterResponse(responseBody)) {
          throw new Error(
            "The AI service returned an invalid response.",
          );
        }

        setSuggestions(responseBody.suggestions);

        return responseBody.suggestions;
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "An unexpected error occurred.";

        setSuggestions([]);
        setError(message);

        return [];
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      suggestions,
      isGenerating,
      error,
      generateSuggestions,
      clearSuggestions,
      clearError,
    }),
    [
      suggestions,
      isGenerating,
      error,
      generateSuggestions,
      clearSuggestions,
      clearError,
    ],
  );
}
