import type {
  ResumeKeywordMatch,
  ResumeTailorAnalysis,
  TailoredBullet,
} from "./types";

function ensureString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string",
  );
}

function normalizeKeyword(value: unknown): ResumeKeywordMatch | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  const category =
    item.category === "matched" ||
    item.category === "missing" ||
    item.category === "partial"
      ? item.category
      : "matched";

  const importance =
    item.importance === "low" ||
    item.importance === "medium" ||
    item.importance === "high"
      ? item.importance
      : "medium";

  return {
    keyword: ensureString(item.keyword),
    category,
    importance,
    explanation: ensureString(item.explanation),
  };
}

function normalizeBullet(value: unknown): TailoredBullet | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  return {
    id: ensureString(item.id),
    section:
      item.section === "projects"
        ? "projects"
        : "work-experience",
    sourceItemId: ensureString(item.sourceItemId),
    original: ensureString(item.original),
    tailored: ensureString(item.tailored),
    reason: ensureString(item.reason),
    keywordsAdded: ensureStringArray(item.keywordsAdded),
  };
}

export function normalizeResumeTailorAnalysis(
  value: unknown,
): ResumeTailorAnalysis {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const matchedKeywords = Array.isArray(data.matchedKeywords)
    ? data.matchedKeywords
        .map(normalizeKeyword)
        .filter(
          (item): item is ResumeKeywordMatch => item !== null,
        )
    : [];

  const missingKeywords = Array.isArray(data.missingKeywords)
    ? data.missingKeywords
        .map(normalizeKeyword)
        .filter(
          (item): item is ResumeKeywordMatch => item !== null,
        )
    : [];

  const partialKeywords = Array.isArray(data.partialKeywords)
    ? data.partialKeywords
        .map(normalizeKeyword)
        .filter(
          (item): item is ResumeKeywordMatch => item !== null,
        )
    : [];

  const tailoredBullets = Array.isArray(data.tailoredBullets)
    ? data.tailoredBullets
        .map(normalizeBullet)
        .filter(
          (item): item is TailoredBullet => item !== null,
        )
    : [];

  return {
    atsScore: ensureNumber(data.atsScore),
    originalScore: ensureNumber(data.originalScore),
    scoreImprovement: ensureNumber(data.scoreImprovement),

    summary: ensureString(data.summary),

    matchedKeywords,
    missingKeywords,
    partialKeywords,

    strengths: ensureStringArray(data.strengths),
    improvements: ensureStringArray(data.improvements),

    tailoredBullets,

    suggestedSkills: ensureStringArray(data.suggestedSkills),

    suggestedHeadline: ensureString(data.suggestedHeadline),

    suggestedSummary: ensureString(data.suggestedSummary),
  };
}