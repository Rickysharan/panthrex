import type {
  AiExperienceLevel,
  AiResumeSection,
  AiResumeWriterMode,
  AiResumeWriterRequest,
  AiWritingTone,
} from "@/lib/ai-resume/types";
import type { ResumeData } from "@/lib/resume/types";

const VALID_MODES: AiResumeWriterMode[] = [
  "generate",
  "improve",
  "tailor",
];

const VALID_SECTIONS: AiResumeSection[] = [
  "professional-summary",
  "work-experience",
  "project-description",
  "skills",
];

const VALID_TONES: AiWritingTone[] = [
  "professional",
  "confident",
  "concise",
  "technical",
  "leadership",
];

const VALID_EXPERIENCE_LEVELS: AiExperienceLevel[] = [
  "student",
  "entry-level",
  "mid-level",
  "senior",
  "executive",
];

const MAX_TARGET_ROLE_LENGTH = 120;
const MAX_JOB_DESCRIPTION_LENGTH = 12_000;
const MAX_EXISTING_CONTENT_LENGTH = 8_000;
const MAX_ADDITIONAL_CONTEXT_LENGTH = 4_000;

export type AiResumeWriterValidationResult =
  | {
      success: true;
      data: AiResumeWriterRequest;
    }
  | {
      success: false;
      error: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isValidEnumValue<T extends string>(
  value: unknown,
  validValues: readonly T[],
): value is T {
  return (
    typeof value === "string" &&
    validValues.includes(value as T)
  );
}

function isResumeData(value: unknown): value is ResumeData {
  if (!isRecord(value)) {
    return false;
  }

  const personalDetails = value.personalDetails;

  return (
    typeof value.title === "string" &&
    typeof value.template === "string" &&
    isRecord(personalDetails) &&
    Array.isArray(value.workExperience) &&
    Array.isArray(value.education) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.projects) &&
    Array.isArray(value.certifications)
  );
}

function validateTextLength(
  value: string,
  fieldName: string,
  maximumLength: number,
): string | null {
  if (value.length > maximumLength) {
    return `${fieldName} must not exceed ${maximumLength.toLocaleString()} characters.`;
  }

  return null;
}

export function validateAiResumeWriterRequest(
  value: unknown,
): AiResumeWriterValidationResult {
  if (!isRecord(value)) {
    return {
      success: false,
      error: "The request body must be a valid JSON object.",
    };
  }

  if (!isValidEnumValue(value.mode, VALID_MODES)) {
    return {
      success: false,
      error: "A valid AI writer mode is required.",
    };
  }

  if (!isValidEnumValue(value.section, VALID_SECTIONS)) {
    return {
      success: false,
      error: "A valid resume section is required.",
    };
  }

  if (!isValidEnumValue(value.tone, VALID_TONES)) {
    return {
      success: false,
      error: "A valid writing tone is required.",
    };
  }

  if (
    !isValidEnumValue(
      value.experienceLevel,
      VALID_EXPERIENCE_LEVELS,
    )
  ) {
    return {
      success: false,
      error: "A valid experience level is required.",
    };
  }

  if (!isString(value.targetRole)) {
    return {
      success: false,
      error: "Target role must be a string.",
    };
  }

  if (!isString(value.jobDescription)) {
    return {
      success: false,
      error: "Job description must be a string.",
    };
  }

  if (!isString(value.existingContent)) {
    return {
      success: false,
      error: "Existing content must be a string.",
    };
  }

  if (!isString(value.additionalContext)) {
    return {
      success: false,
      error: "Additional context must be a string.",
    };
  }

  if (!isResumeData(value.resumeData)) {
    return {
      success: false,
      error: "Valid resume data is required.",
    };
  }

  const targetRole = value.targetRole.trim();
  const jobDescription = value.jobDescription.trim();
  const existingContent = value.existingContent.trim();
  const additionalContext = value.additionalContext.trim();

  if (value.mode === "tailor" && !targetRole) {
    return {
      success: false,
      error: "A target role is required when tailoring content.",
    };
  }

  if (value.mode === "tailor" && !jobDescription) {
    return {
      success: false,
      error:
        "A job description is required when tailoring content.",
    };
  }

  if (value.mode === "improve" && !existingContent) {
    return {
      success: false,
      error:
        "Existing content is required when improving content.",
    };
  }

  const lengthErrors = [
    validateTextLength(
      targetRole,
      "Target role",
      MAX_TARGET_ROLE_LENGTH,
    ),
    validateTextLength(
      jobDescription,
      "Job description",
      MAX_JOB_DESCRIPTION_LENGTH,
    ),
    validateTextLength(
      existingContent,
      "Existing content",
      MAX_EXISTING_CONTENT_LENGTH,
    ),
    validateTextLength(
      additionalContext,
      "Additional context",
      MAX_ADDITIONAL_CONTEXT_LENGTH,
    ),
  ].filter((error): error is string => Boolean(error));

  if (lengthErrors.length > 0) {
    return {
      success: false,
      error: lengthErrors[0],
    };
  }

  return {
    success: true,
    data: {
      mode: value.mode,
      section: value.section,
      tone: value.tone,
      experienceLevel: value.experienceLevel,
      targetRole,
      jobDescription,
      existingContent,
      additionalContext,
      resumeData: value.resumeData,
    },
  };
}
