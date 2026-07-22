import type {
  ResumeEnhancementResponse,
  ResumeEnhancementSection,
  ResumeEnhancementSuggestion,
} from "./types";

const VALID_SECTIONS: ResumeEnhancementSection[] = [
  "professionalSummary",
  "workExperience",
  "projects",
  "skills",
];

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeWarnings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((warning) => normalizeString(warning))
    .filter(Boolean);
}

function normalizeSection(
  value: unknown,
): ResumeEnhancementSection | null {
  if (
    typeof value === "string" &&
    VALID_SECTIONS.includes(
      value as ResumeEnhancementSection,
    )
  ) {
    return value as ResumeEnhancementSection;
  }

  return null;
}

function createSuggestionId(
  index: number,
  suppliedId: string,
) {
  if (suppliedId) {
    return suppliedId;
  }

  return `suggestion-${Date.now()}-${index}`;
}

function normalizeSuggestion(
  value: unknown,
  index: number,
): ResumeEnhancementSuggestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const section = normalizeSection(value.section);
  const field = normalizeString(value.field);
  const originalValue = normalizeString(
    value.originalValue,
  );
  const improvedValue = normalizeString(
    value.improvedValue,
  );
  const explanation = normalizeString(
    value.explanation,
  );

  if (
    !section ||
    !field ||
    !improvedValue ||
    originalValue === improvedValue
  ) {
    return null;
  }

  const itemId = normalizeString(value.itemId);

  return {
    id: createSuggestionId(
      index,
      normalizeString(value.id),
    ),
    section,
    ...(itemId ? { itemId } : {}),
    field,
    originalValue,
    improvedValue,
    explanation:
      explanation ||
      "Improves clarity, impact, and ATS compatibility.",
    status: "pending",
  };
}

export function normalizeResumeEnhancementResponse(
  value: unknown,
): ResumeEnhancementResponse {
  if (!isRecord(value)) {
    return {
      targetRole: "",
      warnings: [
        "The AI response was not in the expected format.",
      ],
      suggestions: [],
    };
  }

  const rawSuggestions = Array.isArray(
    value.suggestions,
  )
    ? value.suggestions
    : [];

  const suggestions = rawSuggestions
    .map((suggestion, index) =>
      normalizeSuggestion(suggestion, index),
    )
    .filter(
      (
        suggestion,
      ): suggestion is ResumeEnhancementSuggestion =>
        suggestion !== null,
    );

  return {
    targetRole: normalizeString(value.targetRole),
    warnings: normalizeWarnings(value.warnings),
    suggestions,
  };
}