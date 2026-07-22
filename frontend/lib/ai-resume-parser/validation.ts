import type {
  AiResumeParserRequest,
} from "@/lib/ai-resume-parser/types";

const MIN_RESUME_TEXT_LENGTH = 50;
const MAX_RESUME_TEXT_LENGTH = 40_000;

type ValidationSuccess = {
  success: true;
  data: AiResumeParserRequest;
};

type ValidationFailure = {
  success: false;
  error: string;
};

export type AiResumeParserValidationResult =
  | ValidationSuccess
  | ValidationFailure;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeResumeText(
  value: string,
): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function validateAiResumeParserRequest(
  value: unknown,
): AiResumeParserValidationResult {
  if (!isRecord(value)) {
    return {
      success: false,
      error:
        "The request body must be a valid JSON object.",
    };
  }

  if (typeof value.resumeText !== "string") {
    return {
      success: false,
      error:
        "The resumeText field must be a string.",
    };
  }

  const resumeText = normalizeResumeText(
    value.resumeText,
  );

  if (resumeText.length < MIN_RESUME_TEXT_LENGTH) {
    return {
      success: false,
      error:
        "The extracted resume text is too short to parse.",
    };
  }

  if (resumeText.length > MAX_RESUME_TEXT_LENGTH) {
    return {
      success: false,
      error:
        "The extracted resume text exceeds the supported length.",
    };
  }

  return {
    success: true,
    data: {
      resumeText,
    },
  };
}