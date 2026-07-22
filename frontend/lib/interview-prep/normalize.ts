import type {
  InterviewAnswerFeedback,
  InterviewDifficulty,
  InterviewQuestion,
  InterviewQuestionType,
} from "@/lib/interview-prep/types";

const allowedDifficulties: InterviewDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const allowedQuestionTypes: InterviewQuestionType[] = [
  "behavioural",
  "technical",
  "situational",
  "role-specific",
];

export function normalizeInterviewQuestions(
  input: unknown,
  fallbackDifficulty: InterviewDifficulty,
): InterviewQuestion[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seenQuestions = new Set<string>();

  return input
    .map((item, index) =>
      normalizeInterviewQuestion(
        item,
        index,
        fallbackDifficulty,
      ),
    )
    .filter(
      (
        question,
      ): question is InterviewQuestion => {
        if (!question) {
          return false;
        }

        const normalizedText =
          question.question
            .trim()
            .toLowerCase();

        if (seenQuestions.has(normalizedText)) {
          return false;
        }

        seenQuestions.add(normalizedText);

        return true;
      },
    );
}

export function normalizeInterviewFeedback(
  input: unknown,
): InterviewAnswerFeedback {
  const record = asRecord(input);

  return {
    score: clampScore(record?.score),
    strengths: normalizeStringArray(
      record?.strengths,
    ),
    improvements: normalizeStringArray(
      record?.improvements,
    ),
    suggestedAnswer:
      normalizeString(record?.suggestedAnswer) ||
      "A stronger answer should directly address the question, include specific evidence, explain your actions, and connect the outcome to the target role.",
    summary:
      normalizeString(record?.summary) ||
      "The response was evaluated, but the AI did not return a detailed summary.",
  };
}

function normalizeInterviewQuestion(
  input: unknown,
  index: number,
  fallbackDifficulty: InterviewDifficulty,
): InterviewQuestion | null {
  const record = asRecord(input);

  if (!record) {
    return null;
  }

  const question = normalizeString(
    record.question,
  );

  if (!question) {
    return null;
  }

  return {
    id:
      normalizeString(record.id) ||
      `question-${index + 1}`,
    question,
    type: normalizeQuestionType(record.type),
    difficulty: normalizeDifficulty(
      record.difficulty,
      fallbackDifficulty,
    ),
    competency:
      normalizeString(record.competency) ||
      "General interview competency",
    guidance:
      normalizeString(record.guidance) ||
      "Provide a clear, structured answer supported by relevant evidence.",
  };
}

function normalizeQuestionType(
  value: unknown,
): InterviewQuestionType {
  const normalized = normalizeString(value)
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");

  return allowedQuestionTypes.includes(
    normalized as InterviewQuestionType,
  )
    ? (normalized as InterviewQuestionType)
    : "role-specific";
}

function normalizeDifficulty(
  value: unknown,
  fallback: InterviewDifficulty,
): InterviewDifficulty {
  const normalized = normalizeString(value)
    .toLowerCase();

  return allowedDifficulties.includes(
    normalized as InterviewDifficulty,
  )
    ? (normalized as InterviewDifficulty)
    : fallback;
}

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value
    .map((item) => normalizeString(item))
    .filter((item) => {
      if (!item) {
        return false;
      }

      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
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

function asRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}