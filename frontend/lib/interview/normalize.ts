import {
  InterviewAnswerEvaluation,
  InterviewGenerationResponse,
  InterviewQuestion,
} from "@/lib/interview/types";

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function normalizeInterviewQuestions(
  raw: unknown,
): InterviewGenerationResponse {
  const warnings: string[] = [];

  const source =
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as { questions?: unknown }).questions)
      ? (raw as { questions: unknown[] }).questions
      : [];

  const questions: InterviewQuestion[] = source.map((item) => {
    const question =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};

    return {
      id: uuid(),
      question: String(question.question ?? "").trim(),
      category:
        (question.category as InterviewQuestion["category"]) ?? "general",
      difficulty:
        (question.difficulty as InterviewQuestion["difficulty"]) ??
        "beginner",
      type:
        (question.type as InterviewQuestion["type"]) ??
        "short-answer",
      expectedSkills: Array.isArray(question.expectedSkills)
        ? question.expectedSkills.map(String)
        : [],
      guidance:
        typeof question.guidance === "string"
          ? question.guidance.trim()
          : undefined,
      sampleAnswer:
        typeof question.sampleAnswer === "string"
          ? question.sampleAnswer.trim()
          : undefined,
      createdAt: now(),
    };
  });

  if (questions.length === 0) {
    warnings.push("No interview questions were generated.");
  }

  return {
    success: true,
    questions,
    warnings,
  };
}

export function normalizeInterviewEvaluation(
  raw: unknown,
  questionId: string,
  answerId: string,
): InterviewAnswerEvaluation {
  const source =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  return {
    id: uuid(),
    questionId,
    answerId,

    score: Number(source.score ?? 0),

    rating:
      (source.rating as InterviewAnswerEvaluation["rating"]) ??
      "needs-improvement",

    strengths: Array.isArray(source.strengths)
      ? source.strengths.map(String)
      : [],

    weaknesses: Array.isArray(source.weaknesses)
      ? source.weaknesses.map(String)
      : [],

    improvements: Array.isArray(source.improvements)
      ? source.improvements.map(String)
      : [],

    suggestedAnswer:
      typeof source.suggestedAnswer === "string"
        ? source.suggestedAnswer
        : undefined,

    clarityScore: Number(source.clarityScore ?? 0),

    relevanceScore: Number(source.relevanceScore ?? 0),

    structureScore: Number(source.structureScore ?? 0),

    confidenceScore: Number(source.confidenceScore ?? 0),

    technicalAccuracyScore:
      source.technicalAccuracyScore !== undefined
        ? Number(source.technicalAccuracyScore)
        : undefined,

    createdAt: now(),
  };
}