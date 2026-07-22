import type {
  CoverLetterApiResponse,
  CoverLetterLength,
  CoverLetterTone,
  GeneratedCoverLetter,
} from "./types";

type NormalizeCoverLetterInput = {
  rawContent: unknown;
  companyName: string;
  hiringManagerName?: string;
  jobTitle: string;
  tone: CoverLetterTone;
  length: CoverLetterLength;
};

function createId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `cover-letter-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cleanContent(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/^```(?:text|markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^cover letter\s*:?\s*/i, "")
    .trim();
}

function getWarnings(
  content: string,
  companyName: string,
  jobTitle: string,
): string[] {
  const warnings: string[] = [];

  if (!content) {
    warnings.push("The AI response did not contain a cover letter.");
    return warnings;
  }

  const wordCount = content
    .split(/\s+/)
    .filter(Boolean).length;

  if (wordCount < 120) {
    warnings.push("The generated cover letter may be too short.");
  }

  if (wordCount > 700) {
    warnings.push("The generated cover letter may be too long.");
  }

  if (!content.toLowerCase().includes(companyName.toLowerCase())) {
    warnings.push(
      "The generated letter may not mention the company name.",
    );
  }

  if (!content.toLowerCase().includes(jobTitle.toLowerCase())) {
    warnings.push(
      "The generated letter may not mention the target job title.",
    );
  }

  const placeholderPattern =
    /\[(?:your|company|hiring|insert|name|address|date)[^\]]*\]/i;

  if (placeholderPattern.test(content)) {
    warnings.push(
      "The generated letter may contain unresolved placeholders.",
    );
  }

  return warnings;
}

export function normalizeCoverLetterResponse({
  rawContent,
  companyName,
  hiringManagerName,
  jobTitle,
  tone,
  length,
}: NormalizeCoverLetterInput): CoverLetterApiResponse {
  const content = cleanContent(rawContent);

  if (!content) {
    throw new Error(
      "The AI provider returned an empty cover letter.",
    );
  }

  const normalizedCompanyName = companyName.trim();
  const normalizedJobTitle = jobTitle.trim();
  const normalizedHiringManagerName =
    hiringManagerName?.trim() || "Hiring Manager";

  const coverLetter: GeneratedCoverLetter = {
    id: createId(),
    title: `${normalizedJobTitle} at ${normalizedCompanyName}`,
    companyName: normalizedCompanyName,
    hiringManagerName: normalizedHiringManagerName,
    jobTitle: normalizedJobTitle,
    content,
    tone,
    length,
    createdAt: new Date().toISOString(),
  };

  return {
    coverLetter,
    warnings: getWarnings(
      content,
      normalizedCompanyName,
      normalizedJobTitle,
    ),
  };
}