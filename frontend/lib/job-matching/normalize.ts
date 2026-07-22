import type {
  JobMatchCategoryScore,
  JobMatchResult,
  JobMatchSkill,
  JobMatchSuggestion,
} from "@/lib/job-matching/types";

const REQUIRED_CATEGORY_NAMES = [
  "Skills",
  "Experience",
  "Education",
  "Keywords",
  "Role Alignment",
] as const;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampScore(value: unknown): number {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(numericValue)),
  );
}

function normalizeString(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => normalizeString(item))
        .filter(Boolean),
    ),
  );
}

function normalizeImportance(
  value: unknown,
): JobMatchSkill["importance"] {
  return value === "preferred"
    ? "preferred"
    : "required";
}

function normalizeSkill(
  value: unknown,
  matched: boolean,
): JobMatchSkill | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = normalizeString(value.name);

  if (!name) {
    return null;
  }

  return {
    name,
    matched,
    importance: normalizeImportance(
      value.importance,
    ),
  };
}

function normalizeSkills(
  value: unknown,
  matched: boolean,
): JobMatchSkill[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const skills = value
    .map((item) =>
      normalizeSkill(item, matched),
    )
    .filter(
      (
        skill,
      ): skill is JobMatchSkill =>
        skill !== null,
    );

  const seenSkills = new Set<string>();

  return skills.filter((skill) => {
    const key = skill.name.toLowerCase();

    if (seenSkills.has(key)) {
      return false;
    }

    seenSkills.add(key);
    return true;
  });
}

function removeOverlappingSkills(
  matchedSkills: JobMatchSkill[],
  missingSkills: JobMatchSkill[],
): {
  matchedSkills: JobMatchSkill[];
  missingSkills: JobMatchSkill[];
} {
  const matchedSkillNames = new Set(
    matchedSkills.map((skill) =>
      skill.name.toLowerCase(),
    ),
  );

  return {
    matchedSkills,
    missingSkills: missingSkills.filter(
      (skill) =>
        !matchedSkillNames.has(
          skill.name.toLowerCase(),
        ),
    ),
  };
}

function normalizePriority(
  value: unknown,
): JobMatchSuggestion["priority"] {
  if (
    value === "high" ||
    value === "medium" ||
    value === "low"
  ) {
    return value;
  }

  return "medium";
}

function normalizeSuggestion(
  value: unknown,
): JobMatchSuggestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeString(value.title);
  const description = normalizeString(
    value.description,
  );

  if (!title || !description) {
    return null;
  }

  return {
    title,
    description,
    priority: normalizePriority(
      value.priority,
    ),
  };
}

function normalizeSuggestions(
  value: unknown,
): JobMatchSuggestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeSuggestion)
    .filter(
      (
        suggestion,
      ): suggestion is JobMatchSuggestion =>
        suggestion !== null,
    );
}

function normalizeCategoryScore(
  value: unknown,
): JobMatchCategoryScore | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = normalizeString(value.name);

  if (!name) {
    return null;
  }

  return {
    name,
    score: clampScore(value.score),
  };
}

function normalizeCategoryScores(
  value: unknown,
): JobMatchCategoryScore[] {
  const sourceScores = Array.isArray(value)
    ? value
        .map(normalizeCategoryScore)
        .filter(
          (
            score,
          ): score is JobMatchCategoryScore =>
            score !== null,
        )
    : [];

  const scoresByName = new Map<
    string,
    JobMatchCategoryScore
  >();

  sourceScores.forEach((score) => {
    const key = score.name.toLowerCase();

    if (!scoresByName.has(key)) {
      scoresByName.set(key, score);
    }
  });

  REQUIRED_CATEGORY_NAMES.forEach(
    (categoryName) => {
      const key = categoryName.toLowerCase();

      if (!scoresByName.has(key)) {
        scoresByName.set(key, {
          name: categoryName,
          score: 0,
        });
      }
    },
  );

  return Array.from(scoresByName.values());
}

export function normalizeJobMatchResult(
  raw: unknown,
): JobMatchResult {
  const source = isRecord(raw) ? raw : {};

  const matchedSkills = normalizeSkills(
    source.matchedSkills,
    true,
  );

  const missingSkills = normalizeSkills(
    source.missingSkills,
    false,
  );

  const deduplicatedSkills =
    removeOverlappingSkills(
      matchedSkills,
      missingSkills,
    );

  return {
    overallScore: clampScore(
      source.overallScore,
    ),
    atsScore: clampScore(source.atsScore),
    interviewReadiness: clampScore(
      source.interviewReadiness,
    ),

    matchedSkills:
      deduplicatedSkills.matchedSkills,
    missingSkills:
      deduplicatedSkills.missingSkills,

    strengths: normalizeStringArray(
      source.strengths,
    ),
    weaknesses: normalizeStringArray(
      source.weaknesses,
    ),

    keywordSuggestions:
      normalizeStringArray(
        source.keywordSuggestions,
      ),

    resumeImprovements:
      normalizeSuggestions(
        source.resumeImprovements,
      ),

    categoryScores:
      normalizeCategoryScores(
        source.categoryScores,
      ),

    summary:
      normalizeString(source.summary) ||
      "No job match summary was generated.",
  };
}