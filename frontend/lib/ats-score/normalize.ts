import type {
  AtsCategoryName,
  AtsCategoryScore,
  AtsFormattingCheck,
  AtsIssue,
  AtsIssueSeverity,
  AtsKeywordMatch,
  AtsRecommendation,
  AtsResumeStatistics,
  AtsScoreLevel,
  AtsScoreResult,
  AtsSectionCheck,
} from "@/lib/ats-score/types";

const CATEGORY_NAMES: AtsCategoryName[] = [
  "keywords",
  "skills",
  "experience",
  "education",
  "formatting",
  "contact-information",
  "section-completeness",
  "impact",
  "readability",
];

const ISSUE_SEVERITIES: AtsIssueSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

const SECTION_NAMES: AtsSectionCheck["section"][] = [
  "personal-details",
  "professional-summary",
  "work-experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

const KEYWORD_IMPORTANCE_LEVELS: AtsKeywordMatch["importance"][] =
  ["required", "preferred", "general"];

const CATEGORY_LABELS: Record<
  AtsCategoryName,
  string
> = {
  keywords: "Keyword Match",
  skills: "Skills Alignment",
  experience: "Experience Relevance",
  education: "Education",
  formatting: "ATS Formatting",
  "contact-information": "Contact Information",
  "section-completeness": "Section Completeness",
  impact: "Measurable Impact",
  readability: "Readability",
};

const SECTION_LABELS: Record<
  AtsSectionCheck["section"],
  string
> = {
  "personal-details": "Personal Details",
  "professional-summary": "Professional Summary",
  "work-experience": "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function asString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

function asBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return fallback;
}

function clampScore(value: unknown): number {
  return Math.round(
    Math.min(100, Math.max(0, asNumber(value))),
  );
}

function clampNonNegativeInteger(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.round(asNumber(value)),
  );
}

function normalizeStringArray(
  value: unknown,
  maximumItems: number,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueValues = new Set<string>();

  for (const item of value) {
    const normalizedItem = asString(item);

    if (!normalizedItem) {
      continue;
    }

    const duplicateKey =
      normalizedItem.toLowerCase();

    const existingDuplicate = Array.from(
      uniqueValues,
    ).some(
      (existingItem) =>
        existingItem.toLowerCase() === duplicateKey,
    );

    if (!existingDuplicate) {
      uniqueValues.add(normalizedItem);
    }

    if (uniqueValues.size >= maximumItems) {
      break;
    }
  }

  return Array.from(uniqueValues);
}

function normalizeScoreLevel(
  value: unknown,
  overallScore: number,
): AtsScoreLevel {
  if (
    value === "excellent" ||
    value === "good" ||
    value === "needs-improvement" ||
    value === "poor"
  ) {
    return value;
  }

  if (overallScore >= 85) {
    return "excellent";
  }

  if (overallScore >= 70) {
    return "good";
  }

  if (overallScore >= 50) {
    return "needs-improvement";
  }

  return "poor";
}

function normalizeCategoryName(
  value: unknown,
  fallback: AtsCategoryName,
): AtsCategoryName {
  return CATEGORY_NAMES.includes(
    value as AtsCategoryName,
  )
    ? (value as AtsCategoryName)
    : fallback;
}

function normalizeSeverity(
  value: unknown,
  fallback: AtsIssueSeverity = "medium",
): AtsIssueSeverity {
  return ISSUE_SEVERITIES.includes(
    value as AtsIssueSeverity,
  )
    ? (value as AtsIssueSeverity)
    : fallback;
}

function normalizeKeywordImportance(
  value: unknown,
): AtsKeywordMatch["importance"] {
  return KEYWORD_IMPORTANCE_LEVELS.includes(
    value as AtsKeywordMatch["importance"],
  )
    ? (value as AtsKeywordMatch["importance"])
    : "general";
}

function normalizeKeywordMatches(
  value: unknown,
  matched: boolean,
): AtsKeywordMatch[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const keywordMatches: AtsKeywordMatch[] = [];
  const seenKeywords = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const keyword = asString(item.keyword);

    if (!keyword) {
      continue;
    }

    const keywordKey = keyword.toLowerCase();

    if (seenKeywords.has(keywordKey)) {
      continue;
    }

    seenKeywords.add(keywordKey);

    keywordMatches.push({
      keyword,
      matched,
      importance: normalizeKeywordImportance(
        item.importance,
      ),
      occurrencesInResume:
        clampNonNegativeInteger(
          item.occurrencesInResume,
        ),
      occurrencesInJobDescription:
        clampNonNegativeInteger(
          item.occurrencesInJobDescription,
        ),
    });

    if (keywordMatches.length >= 20) {
      break;
    }
  }

  return keywordMatches;
}

function createDefaultCategoryScore(
  category: AtsCategoryName,
): AtsCategoryScore {
  return {
    category,
    label: CATEGORY_LABELS[category],
    score: 0,
    maxScore: 100,
    percentage: 0,
    summary: "No analysis was returned for this category.",
  };
}

function normalizeCategoryScores(
  value: unknown,
): AtsCategoryScore[] {
  const categoryMap = new Map<
    AtsCategoryName,
    AtsCategoryScore
  >();

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item)) {
        continue;
      }

      const category = normalizeCategoryName(
        item.category,
        "keywords",
      );

      if (categoryMap.has(category)) {
        continue;
      }

      const score = clampScore(item.score);
      const maxScore = Math.max(
        1,
        clampScore(item.maxScore) || 100,
      );

      const calculatedPercentage = Math.round(
        (score / maxScore) * 100,
      );

      categoryMap.set(category, {
        category,
        label:
          asString(item.label) ||
          CATEGORY_LABELS[category],
        score,
        maxScore,
        percentage:
          item.percentage === undefined
            ? calculatedPercentage
            : clampScore(item.percentage),
        summary:
          asString(item.summary) ||
          "No category summary was provided.",
      });
    }
  }

  return CATEGORY_NAMES.map(
    (category) =>
      categoryMap.get(category) ??
      createDefaultCategoryScore(category),
  );
}

function createDefaultSectionCheck(
  section: AtsSectionCheck["section"],
): AtsSectionCheck {
  return {
    section,
    label: SECTION_LABELS[section],
    present: false,
    complete: false,
    score: 0,
    recommendation: `Complete the ${SECTION_LABELS[
      section
    ].toLowerCase()} section.`,
  };
}

function normalizeSectionChecks(
  value: unknown,
): AtsSectionCheck[] {
  const sectionMap = new Map<
    AtsSectionCheck["section"],
    AtsSectionCheck
  >();

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item)) {
        continue;
      }

      const section = SECTION_NAMES.includes(
        item.section as AtsSectionCheck["section"],
      )
        ? (item.section as AtsSectionCheck["section"])
        : null;

      if (!section || sectionMap.has(section)) {
        continue;
      }

      sectionMap.set(section, {
        section,
        label:
          asString(item.label) ||
          SECTION_LABELS[section],
        present: asBoolean(item.present),
        complete: asBoolean(item.complete),
        score: clampScore(item.score),
        recommendation:
          asString(item.recommendation) ||
          `Review the ${SECTION_LABELS[
            section
          ].toLowerCase()} section.`,
      });
    }
  }

  return SECTION_NAMES.map(
    (section) =>
      sectionMap.get(section) ??
      createDefaultSectionCheck(section),
  );
}

function normalizeFormattingChecks(
  value: unknown,
): AtsFormattingCheck[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const checks: AtsFormattingCheck[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const generatedId = `formatting-check-${
      checks.length + 1
    }`;

    const id =
      asString(item.id) || generatedId;

    if (seenIds.has(id)) {
      continue;
    }

    seenIds.add(id);

    checks.push({
      id,
      title:
        asString(item.title) ||
        "ATS formatting check",
      passed: asBoolean(item.passed),
      description:
        asString(item.description) ||
        "No description was provided.",
      recommendation:
        asString(item.recommendation) ||
        "Review the resume formatting for ATS compatibility.",
    });

    if (checks.length >= 10) {
      break;
    }
  }

  return checks;
}

function normalizeIssues(
  value: unknown,
): AtsIssue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const issues: AtsIssue[] = [];
  const seenTitles = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const title = asString(item.title);

    if (!title) {
      continue;
    }

    const duplicateKey = title.toLowerCase();

    if (seenTitles.has(duplicateKey)) {
      continue;
    }

    seenTitles.add(duplicateKey);

    issues.push({
      id:
        asString(item.id) ||
        `issue-${issues.length + 1}`,
      title,
      description:
        asString(item.description) ||
        "No issue description was provided.",
      severity: normalizeSeverity(
        item.severity,
      ),
      category: normalizeCategoryName(
        item.category,
        "keywords",
      ),
      recommendation:
        asString(item.recommendation) ||
        "Review and improve this part of the resume.",
    });

    if (issues.length >= 10) {
      break;
    }
  }

  return issues;
}

function normalizeRecommendations(
  value: unknown,
): AtsRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const recommendations: AtsRecommendation[] =
    [];
  const seenTitles = new Set<string>();

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const title = asString(item.title);

    if (!title) {
      continue;
    }

    const duplicateKey = title.toLowerCase();

    if (seenTitles.has(duplicateKey)) {
      continue;
    }

    seenTitles.add(duplicateKey);

    recommendations.push({
      id:
        asString(item.id) ||
        `recommendation-${
          recommendations.length + 1
        }`,
      title,
      description:
        asString(item.description) ||
        "No recommendation description was provided.",
      priority: normalizeSeverity(
        item.priority,
      ),
      category: normalizeCategoryName(
        item.category,
        "keywords",
      ),
      expectedImpact:
        asString(item.expectedImpact) ||
        "May improve ATS compatibility and relevance.",
    });

    if (recommendations.length >= 10) {
      break;
    }
  }

  return recommendations;
}

function normalizeStatistics(
  value: unknown,
): AtsResumeStatistics {
  const statistics = isRecord(value)
    ? value
    : {};

  return {
    totalWords: clampNonNegativeInteger(
      statistics.totalWords,
    ),
    summaryWordCount:
      clampNonNegativeInteger(
        statistics.summaryWordCount,
      ),
    experienceEntries:
      clampNonNegativeInteger(
        statistics.experienceEntries,
      ),
    educationEntries:
      clampNonNegativeInteger(
        statistics.educationEntries,
      ),
    skillCount: clampNonNegativeInteger(
      statistics.skillCount,
    ),
    projectCount:
      clampNonNegativeInteger(
        statistics.projectCount,
      ),
    certificationCount:
      clampNonNegativeInteger(
        statistics.certificationCount,
      ),
    quantifiedBulletCount:
      clampNonNegativeInteger(
        statistics.quantifiedBulletCount,
      ),
    actionVerbCount:
      clampNonNegativeInteger(
        statistics.actionVerbCount,
      ),
  };
}

export function normalizeAtsScoreResult(
  value: unknown,
): AtsScoreResult {
  if (!isRecord(value)) {
    throw new Error(
      "The ATS analysis response was not a valid object.",
    );
  }

  const overallScore = clampScore(
    value.overallScore,
  );

  return {
    overallScore,
    scoreLevel: normalizeScoreLevel(
      value.scoreLevel,
      overallScore,
    ),

    keywordScore: clampScore(
      value.keywordScore,
    ),
    formattingScore: clampScore(
      value.formattingScore,
    ),
    completenessScore: clampScore(
      value.completenessScore,
    ),
    impactScore: clampScore(
      value.impactScore,
    ),
    readabilityScore: clampScore(
      value.readabilityScore,
    ),

    matchedKeywords: normalizeKeywordMatches(
      value.matchedKeywords,
      true,
    ),
    missingKeywords: normalizeKeywordMatches(
      value.missingKeywords,
      false,
    ),

    categoryScores: normalizeCategoryScores(
      value.categoryScores,
    ),
    sectionChecks: normalizeSectionChecks(
      value.sectionChecks,
    ),
    formattingChecks:
      normalizeFormattingChecks(
        value.formattingChecks,
      ),

    strengths: normalizeStringArray(
      value.strengths,
      8,
    ),
    issues: normalizeIssues(value.issues),
    recommendations:
      normalizeRecommendations(
        value.recommendations,
      ),

    statistics: normalizeStatistics(
      value.statistics,
    ),

    summary:
      asString(value.summary) ||
      "The ATS analysis was completed, but no summary was returned.",
  };
}